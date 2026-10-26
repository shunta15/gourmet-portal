#!/usr/bin/env node
/**
 * automation/v2/port-unlisted.mjs — gp-k-auto2(feat/auto-article-v2)で新しく「成功」になったトリニティの店を、限定公開で main 側(この作業場所)に足す
 *
 * 使い方(この作業場所 = feat/trinity-unlisted を元にしたブランチで実行):
 *   node automation/v2/port-unlisted.mjs [<gp-k-auto2 のコミット。省略は HEAD>] [--src <gp-k-auto2 の場所>] [--keys tri-life-93,...] [--skip tri-...] [--dry] [--no-commit]
 *
 * 動き:
 *   1. <コミット>の automation/v2/out/write-*.json で status が「成功」の店のうち、まだ main 側に無い店(map.json / pilot.json / lib/unlisted.ts に無い)だけを対象にする
 *   2. 対象の店の材料だけを、そのコミットから写す(nav-4items など、ほかの変更は一切写さない)
 *      グルメ   : stores500/gbp・stores500/ids.json と map.json の該当行・lib/teleapo-features.ts の記事・photoMeta の該当行・public/restaurants/teleapo-<記事ID>/
 *      グルメ以外: vertical-stores の gbp・category-overrides・articles・photos・features・ids.json の該当行・pilot.json・public/_portal/vshops/<キー>/
 *   3. lib/unlisted.ts と lib/portal/noren/onePageUnlisted.ts に ID を足し、生成データ(build-stores / build-places / build-features)を作り直す
 *   4. 機械で確かめる: 既存の店・記事が変わっていない・足した ID がシート用の ID と一致・変えたファイルが想定の範囲だけ・tsc が通る
 *   5. 足した店の一覧を JSON で出す(automation/v2/out/ported/port-<日時>-<コミット>.json)。コミットまでする(push・本番デプロイはしない)
 * 途中で失敗したら、作業を git stash に退避して元の状態に戻す(消さない)。
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TRIN = path.resolve(HERE, "../..");
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n) => {
  const i = argv.indexOf(n);
  return i >= 0 ? argv[i + 1] : null;
};
const positional = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && ["--src", "--keys", "--skip"].includes(argv[i - 1])));
const SRC = opt("--src") || "/Users/shunta/claude/gp-k-auto2";
const DRY = flag("--dry");
const NO_COMMIT = flag("--no-commit");
const KEYS = opt("--keys")?.split(",").filter(Boolean) ?? null;
const SKIP = new Set(opt("--skip")?.split(",").filter(Boolean) ?? []);
const SITE = "https://machinowa.tokyo";

const NFC = (s) => String(s).normalize("NFC");
const abs = (...p) => path.join(TRIN, ...p);
const log = (...a) => console.error(...a);
const fail = (m) => {
  throw new Error(m);
};

const gitSrc = (args, opts = {}) => execFileSync("git", ["-C", SRC, ...args], { maxBuffer: 1 << 30, ...opts });
const gitHere = (args, opts = {}) => execFileSync("git", ["-C", TRIN, ...args], { maxBuffer: 1 << 30, ...opts });
let COMMIT = "";
const showSrc = (p) => gitSrc(["show", `${COMMIT}:${p}`]);
const showSrcText = (p) => showSrc(p).toString("utf8");
const readJsonSrc = (p) => JSON.parse(showSrcText(p));
const readJson = (p) => JSON.parse(readFileSync(abs(p), "utf8"));
const writeJson = (p, v) => writeFileSync(abs(p), JSON.stringify(v, null, 2) + "\n");
/** コミット内のディレクトリの名前一覧(日本語名もそのまま) */
const lsSrc = (dir) => {
  const out = gitSrc(["-c", "core.quotepath=false", "ls-tree", "--name-only", "-z", COMMIT, dir.endsWith("/") ? dir : dir + "/"]).toString("utf8");
  return out.split("\0").filter(Boolean).map((p) => p.slice(dir.length + (dir.endsWith("/") ? 0 : 1)));
};
/** コミット内のパス(ファイルまたはフォルダ)を、この作業場所へ丸ごと写す(git archive | tar) */
function copyTreeFromSrc(relPath) {
  const tar = gitSrc(["archive", COMMIT, "--", relPath]);
  const r = spawnSync("tar", ["-x", "-C", TRIN], { input: tar });
  if (r.status !== 0) fail(`写せない: ${relPath} ${r.stderr}`);
}

// ------------------------------------------------------------ 準備
function resolveCommit() {
  const c = positional[0] || "HEAD";
  COMMIT = gitSrc(["rev-parse", "--verify", `${c}^{commit}`]).toString().trim();
}

/** automation/v2/out/write-*.json から、店のキーごとの結果(成功が優先。同じ成功なら後のファイル) */
function loadResults() {
  const names = lsSrc("automation/v2/out").filter((n) => /^write-.*\.json$/.test(n)).sort();
  const byKey = new Map();
  for (const n of names) {
    const j = readJsonSrc(`automation/v2/out/${n}`);
    const arr = Array.isArray(j.results) ? j.results : Object.values(j.results || {});
    for (const x of arr) {
      const prev = byKey.get(x.key);
      if (!prev || x.status === "成功" || prev.status !== "成功") byKey.set(x.key, x);
    }
  }
  return byKey;
}

const readUnlistedConst = (text, name) => {
  const m = new RegExp(`export const ${name}[^=\\n]*= ([\\s\\S]*?);\\n`).exec(text);
  if (!m) fail(`lib/unlisted.ts に ${name} が無い`);
  return JSON.parse(m[1]);
};
function patchUnlistedConst(text, name, fn, pretty) {
  const re = new RegExp(`(export const ${name}[^=\\n]*= )([\\s\\S]*?)(;\\n)`);
  const m = re.exec(text);
  if (!m) fail(`lib/unlisted.ts に ${name} が無い`);
  const nv = fn(JSON.parse(m[2]));
  return text.replace(re, (_a, a, _b, c) => a + JSON.stringify(nv, null, pretty ? 2 : 0) + c);
}
const numOf = (s) => parseInt(String(s).replace(/\D/g, ""), 10) || 0;

// ------------------------------------------------------------ 本体
function pickTargets(results) {
  const unl = readFileSync(abs("lib/unlisted.ts"), "utf8");
  const unlStores = new Set(readUnlistedConst(unl, "UNLISTED_STORE_IDS"));
  const unlFeatures = new Set(readUnlistedConst(unl, "UNLISTED_FEATURE_IDS").map(NFC));
  const unlPlaces = new Set(Object.values(readUnlistedConst(unl, "UNLISTED_PLACE_IDS")).flat());
  const mapIds = new Set(readJson("automation/stores500/map.json").map((m) => NFC(m.articleId)));
  const pilot = new Set(readJson("automation/vertical-stores/pilot.json"));
  const targets = [];
  const skipped = [];
  for (const x of results.values()) {
    if (x.status !== "成功") continue;
    if (KEYS && !KEYS.includes(x.key)) continue;
    if (SKIP.has(x.key)) {
      skipped.push({ key: x.key, reason: "--skip" });
      continue;
    }
    const gourmet = x.vertical === "グルメ";
    const already = gourmet
      ? mapIds.has(NFC(x.articleId)) || unlFeatures.has(NFC(x.articleId)) || (x.storeId && unlStores.has(x.storeId))
      : pilot.has(x.key) || (x.placeId && unlPlaces.has(x.placeId));
    if (already) continue;
    if (gourmet) {
      if (!x.articleId || !x.urls?.article) fail(`${x.key}: 結果に articleId / urls が無い`);
    } else if (!x.placeId || !x.urls?.shop) fail(`${x.key}: 結果に placeId / urls が無い`);
    targets.push(x);
  }
  return { targets, skipped };
}

/** teleapo-features.ts から、記事 ID の記事ブロック(`  "<id>": {` 〜 `  },`)を取り出す */
function extractArticleBlock(srcText, id) {
  const lines = srcText.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = /^  "((?:[^"\\]|\\.)*)": \{$/.exec(lines[i]);
    if (!m || NFC(JSON.parse(`"${m[1]}"`)) !== NFC(id)) continue;
    let j = i + 1;
    while (j < lines.length && lines[j] !== "  },") j++;
    if (j >= lines.length) fail(`記事ブロックの終わりが見つからない: ${id}`);
    return lines.slice(i, j + 1).join("\n") + "\n";
  }
  return null;
}

const ARTICLE_STORES_RANGE = (t) => {
  const s = t.indexOf("= [", t.indexOf("export const ARTICLE_STORES")) + 2;
  const e = t.indexOf("\n];", s) + 2;
  return { s, e };
};

function portGourmet(list, ctx) {
  if (!list.length) return;
  const srcFeat = showSrcText("lib/teleapo-features.ts");
  const srcMap = readJsonSrc("automation/stores500/map.json");
  const srcIds = readJsonSrc("automation/stores500/ids.json");
  const srcPhotoMeta = showSrcText("lib/portal/photoFeature/photoMeta.generated.ts").split("\n");
  const srcOnePage = showSrcText("lib/portal/noren/onePage.ts").split("\n");
  const gbpNames = new Map(lsSrc("automation/stores500/gbp").map((n) => [NFC(n), n]));
  const photoDirs = new Map(lsSrc("public/restaurants").map((n) => [NFC(n), n]));

  const map = readJson("automation/stores500/map.json");
  const ids = readJson("automation/stores500/ids.json");
  let feat = readFileSync(abs("lib/teleapo-features.ts"), "utf8");
  const metaPath = "lib/portal/photoFeature/photoMeta.generated.ts";
  const metaLines = readFileSync(abs(metaPath), "utf8").split("\n");
  const first = metaLines.findIndex((l) => /^  "/.test(l));
  let last = first;
  while (/^  "/.test(metaLines[last + 1])) last++;
  const entries = metaLines.slice(first, last + 1);
  const have = new Set(entries.map((l) => /^  ("(?:[^"\\]|\\.)*")/.exec(l)[1]));
  const onePageRows = [];

  for (const x of list) {
    const id = NFC(x.articleId);
    // 材料
    const gbp = gbpNames.get(`${id}.json`);
    const photo = photoDirs.get(`teleapo-${id}`);
    if (!gbp) fail(`${x.key}: gbp/${id}.json が ${COMMIT.slice(0, 8)} に無い`);
    copyTreeFromSrc(`automation/stores500/gbp/${gbp}`);
    if (photo) copyTreeFromSrc(`public/restaurants/${photo}`);
    // map.json の行
    const mrow = srcMap.find((m) => NFC(m.articleId) === id);
    if (!mrow) fail(`${x.key}: map.json に記事 ${id} の行が無い`);
    map.push(mrow);
    // ids.json の行(シート用の店 ID と一致していること)
    const k = Object.keys(srcIds).find((kk) => NFC(kk) === id);
    if (x.storeId) {
      if (!k || srcIds[k] !== x.storeId) fail(`${x.key}: ids.json の店 ID(${k ? srcIds[k] : "なし"})が結果の ${x.storeId} と合わない`);
      if (Object.values(ids).includes(x.storeId)) fail(`${x.key}: 店 ID ${x.storeId} は既に使われている`);
      ids[k] = x.storeId;
    }
    // 記事
    const block = extractArticleBlock(srcFeat, id);
    if (!block) fail(`${x.key}: lib/teleapo-features.ts に記事 ${id} が無い`);
    const end = feat.lastIndexOf("\n};");
    if (end < 0 || feat.slice(end).trim() !== "};") fail("lib/teleapo-features.ts の末尾が想定の形(};)でない");
    if (extractArticleBlock(feat, id)) fail(`${x.key}: 記事 ${id} は既に lib/teleapo-features.ts にある`);
    feat = feat.slice(0, end + 1) + block + feat.slice(end + 1);
    // 写真の情報
    const pre = `/restaurants/teleapo-${id}/`;
    for (const l of srcPhotoMeta) {
      const m = /^  ("(?:[^"\\]|\\.)*"):/.exec(l);
      if (m && NFC(JSON.parse(m[1])).startsWith(pre) && !have.has(m[1])) {
        entries.push(l);
        have.add(m[1]);
      }
    }
    // 1 ページ化の行
    for (const l of srcOnePage) {
      const m = /^  ("(?:[^"\\]|\\.)*"): "r(\d+)",/.exec(l);
      if (m && NFC(JSON.parse(m[1])) === id && (!x.storeId || `r${m[2]}` === x.storeId)) onePageRows.push(l);
    }
    ctx.gourmet.push(x);
  }
  writeFileSync(abs("lib/teleapo-features.ts"), feat);
  writeJson("automation/stores500/map.json", map);
  const sorted = Object.fromEntries(Object.entries(ids).sort((a, b) => parseInt(a[1].slice(1), 10) - parseInt(b[1].slice(1), 10)));
  writeJson("automation/stores500/ids.json", sorted);
  entries.sort((a, b) => {
    const ka = JSON.parse(/^  ("(?:[^"\\]|\\.)*")/.exec(a)[1]);
    const kb = JSON.parse(/^  ("(?:[^"\\]|\\.)*")/.exec(b)[1]);
    return ka < kb ? -1 : 1;
  });
  writeFileSync(abs(metaPath), [...metaLines.slice(0, first), ...entries, ...metaLines.slice(last + 1)].join("\n"));
  if (onePageRows.length) {
    const p = abs("lib/portal/noren/onePageUnlisted.ts");
    const t = readFileSync(p, "utf8");
    const s = t.indexOf("export const ONE_PAGE_UNLISTED_SHOP_OF_FEATURE");
    const e = t.indexOf("\n};", s);
    if (s < 0 || e < 0) fail("onePageUnlisted.ts の表が見つからない");
    writeFileSync(p, t.slice(0, e) + "\n" + onePageRows.join("\n") + t.slice(e));
  }
}

function portVertical(list, ctx) {
  if (!list.length) return;
  const srcIds = readJsonSrc("automation/vertical-stores/ids.json");
  const ids = readJson("automation/vertical-stores/ids.json");
  const pilot = readJson("automation/vertical-stores/pilot.json");
  const dirs = ["gbp", "category-overrides", "articles", "photos", "features"];
  const listing = Object.fromEntries(dirs.map((d) => [d, new Set(lsSrc(`automation/vertical-stores/${d}`))]));
  for (const x of list) {
    const key = x.key;
    const vEn = /^\/(\w+)\/shop\//.exec(x.urls.shop)?.[1];
    if (!vEn) fail(`${key}: urls.shop から業種を読めない`);
    for (const d of dirs) {
      const f = `${key}.json`;
      if (listing[d].has(f)) copyTreeFromSrc(`automation/vertical-stores/${d}/${f}`);
      else if (d !== "features") fail(`${key}: ${d}/${f} が ${COMMIT.slice(0, 8)} に無い`);
    }
    const vshops = lsSrc("public/_portal/vshops");
    if (vshops.includes(key)) copyTreeFromSrc(`public/_portal/vshops/${key}`);
    else log(`  注意: ${key}: public/_portal/vshops/${key}/ が無い(写真なしの店)`);
    // ids.json(cid → 店 ID)
    const gbp = readJson(`automation/vertical-stores/gbp/${key}.json`);
    const cid = /[?&]cid=(\d+)/.exec(gbp.place?.gbpUrl || "")?.[1];
    if (!cid) fail(`${key}: gbp の gbpUrl に cid が無い`);
    if (srcIds[vEn]?.[cid] !== x.placeId) fail(`${key}: ids.json の店 ID(${srcIds[vEn]?.[cid] ?? "なし"})が結果の ${x.placeId} と合わない`);
    if (ids[vEn]?.[cid] && ids[vEn][cid] !== x.placeId) fail(`${key}: この作業場所の ids.json では別の ID(${ids[vEn][cid]})`);
    if (Object.values(ids[vEn] || {}).includes(x.placeId) && ids[vEn][cid] !== x.placeId) fail(`${key}: 店 ID ${x.placeId} は既に別の店で使われている`);
    (ids[vEn] ||= {})[cid] = x.placeId;
    if (!pilot.includes(key)) pilot.push(key);
    ctx.vertical.push({ ...x, vEn });
  }
  writeJson("automation/vertical-stores/ids.json", ids);
  writeFileSync(abs("automation/vertical-stores/pilot.json"), JSON.stringify(pilot) + "\n");
}

function updateUnlisted(ctx) {
  const p = abs("lib/unlisted.ts");
  let t = readFileSync(p, "utf8");
  const gStores = ctx.gourmet.map((x) => x.storeId).filter(Boolean);
  const gFeats = ctx.gourmet.map((x) => NFC(x.articleId));
  t = patchUnlistedConst(t, "UNLISTED_STORE_IDS", (a) => [...new Set([...a, ...gStores])].sort((x, y) => numOf(x) - numOf(y)), false);
  t = patchUnlistedConst(t, "UNLISTED_FEATURE_IDS", (a) => [...new Set([...a, ...gFeats])], false);
  t = patchUnlistedConst(
    t,
    "UNLISTED_PLACE_IDS",
    (o) => {
      for (const x of ctx.vertical) o[x.vEn] = [...new Set([...(o[x.vEn] || []), x.placeId])].sort((a, b) => numOf(a) - numOf(b));
      return o;
    },
    true,
  );
  t = patchUnlistedConst(
    t,
    "UNLISTED_PLACE_FEATURE_IDS",
    (o) => {
      for (const x of ctx.vertical) {
        const fp = abs(`automation/vertical-stores/features/${x.key}.json`);
        if (!existsSync(fp)) continue;
        const f = JSON.parse(readFileSync(fp, "utf8"));
        o[f.vertical || x.vEn] = [...new Set([...(o[f.vertical || x.vEn] || []), NFC(f.article.id)])];
      }
      return o;
    },
    true,
  );
  writeFileSync(p, t);
}

function run(cmd, args, what) {
  const r = spawnSync(cmd, args, { cwd: TRIN, encoding: "utf8", maxBuffer: 1 << 28 });
  if (r.status !== 0) fail(`${what} が失敗(exit ${r.status}): ${(r.stderr || r.stdout || "").slice(-600)}`);
  return r.stdout;
}

function rebuild(ctx) {
  if (ctx.gourmet.length) {
    run("node", ["automation/stores500/build-stores.mjs"], "build-stores.mjs");
    // main 側で既にずれている行(手で直した店)は、コミット済みの内容のまま保つ。既存の店は全部コミット済みの内容に戻す
    const baseT = gitHere(["show", "HEAD:lib/articleStores.ts"]).toString();
    const b = ARTICLE_STORES_RANGE(baseT);
    const base = JSON.parse(baseT.slice(b.s, b.e));
    const curT = readFileSync(abs("lib/articleStores.ts"), "utf8");
    const c = ARTICLE_STORES_RANGE(curT);
    const cur = JSON.parse(curT.slice(c.s, c.e));
    const bm = new Map(base.map((x) => [x.id, x]));
    writeFileSync(abs("lib/articleStores.ts"), curT.slice(0, c.s) + JSON.stringify(cur.map((x) => bm.get(x.id) ?? x), null, 2) + curT.slice(c.e));
  }
  if (ctx.vertical.length) {
    run("node", ["automation/vertical-stores/build-places.mjs", "--listed"], "build-places.mjs");
    run("node", ["automation/vertical-stores/build-features.mjs"], "build-features.mjs");
  }
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function verify(ctx) {
  const problems = [];
  // グルメ: 既存の店は不変・足した店は結果の店 ID と一致
  if (ctx.gourmet.length) {
    const baseT = gitHere(["show", "HEAD:lib/articleStores.ts"]).toString();
    const b = ARTICLE_STORES_RANGE(baseT);
    const base = JSON.parse(baseT.slice(b.s, b.e));
    const curT = readFileSync(abs("lib/articleStores.ts"), "utf8");
    const c = ARTICLE_STORES_RANGE(curT);
    const cur = JSON.parse(curT.slice(c.s, c.e));
    const cm = new Map(cur.map((x) => [x.id, x]));
    const changed = base.filter((x) => !cm.has(x.id) || !same(x, cm.get(x.id))).map((x) => x.id);
    if (changed.length) problems.push(`既存の店が変わった/消えた: ${changed.slice(0, 8).join(",")}`);
    const bm = new Set(base.map((x) => x.id));
    const added = cur.filter((x) => !bm.has(x.id)).map((x) => x.id).sort();
    const want = ctx.gourmet.map((x) => x.storeId).filter(Boolean).sort();
    if (!same(added, want)) problems.push(`足した店 ID が結果と違う: 実際=${added.join(",")} 期待=${want.join(",")}`);
  }
  // グルメ以外
  for (const v of [...new Set(ctx.vertical.map((x) => x.vEn))]) {
    const f = `lib/places/generated/${v}.json`;
    const base = JSON.parse(gitHere(["show", `HEAD:${f}`]).toString()).places;
    const cur = JSON.parse(readFileSync(abs(f), "utf8")).places;
    const cm = new Map(cur.map((p) => [p.id, p]));
    const changed = base.filter((p) => !cm.has(p.id) || !same(p, cm.get(p.id))).map((p) => p.id);
    if (changed.length) problems.push(`${v}: 既存の店が変わった/消えた: ${changed.slice(0, 8).join(",")}`);
    const bm = new Set(base.map((p) => p.id));
    const added = cur.filter((p) => !bm.has(p.id)).map((p) => p.id).sort();
    const want = ctx.vertical.filter((x) => x.vEn === v).map((x) => x.placeId).sort();
    if (!same(added, want)) problems.push(`${v}: 足した店 ID が結果と違う: 実際=${added.join(",")} 期待=${want.join(",")}(除外された店は automation/vertical-stores/unmapped.json を見る)`);
    const ff = `lib/places/generated/features-${v}.json`;
    if (existsSync(abs(ff))) {
      const fb = JSON.parse(gitHere(["show", `HEAD:${ff}`]).toString()).features;
      const fc = JSON.parse(readFileSync(abs(ff), "utf8")).features;
      const fcm = new Map(fc.map((x) => [x.id, x]));
      const fchanged = fb.filter((x) => !fcm.has(x.id) || !same(x, fcm.get(x.id))).map((x) => x.id);
      if (fchanged.length) problems.push(`${v}: 既存の特集が変わった/消えた: ${fchanged.slice(0, 5).join(",")}`);
    }
  }
  // 行を削った(置き換えた)ファイルが無いか: 追加だけのはずのファイル
  const numstat = gitHere(["diff", "--numstat", "HEAD"]).toString().split("\n").filter(Boolean);
  const addOnly = ["lib/teleapo-features.ts", "lib/geo.ts", "lib/portal/photoFeature/photoMeta.generated.ts", "automation/stores500/map.json"];
  for (const l of numstat) {
    const [a, d, f] = l.split("\t");
    if (addOnly.includes(f) && d !== "0") problems.push(`${f}: 削除 ${d} 行(追加だけのはず)`);
    if (/^lib\/places\/generated\//.test(f) && d !== "0") problems.push(`${f}: 削除 ${d} 行(追加だけのはず)`);
    void a;
  }
  // 変えたファイルが想定の範囲だけか(nav-4items など、ほかの変更が混ざっていない)
  const status = gitHere(["-c", "core.quotepath=false", "status", "--porcelain", "-uall"]).toString().split("\n").filter(Boolean);
  const allowed = [
    /^automation\/stores500\/(ids|map|excluded|tag-evidence|warnings|region-mismatch)\.json$/,
    /^automation\/stores500\/gbp\/[^/]+\.json$/,
    /^automation\/vertical-stores\/(ids|pilot|unmapped)\.json$/,
    /^automation\/vertical-stores\/(gbp|category-overrides|articles|photos|features)\/tri-[a-z]+-\d+\.json$/,
    /^lib\/(teleapo-features|articleStores|articleRegions|geo|unlisted)\.ts$/,
    /^lib\/places\/generated\/[a-z-]+\.json$/,
    /^lib\/portal\/photoFeature\/photoMeta\.generated\.ts$/,
    /^lib\/portal\/noren\/onePageUnlisted\.ts$/,
    /^public\/restaurants\/teleapo-[^/]+\/[^/]+$/,
    /^public\/_portal\/vshops\/tri-[a-z]+-\d+\/[^/]+$/,
    /^automation\/v2\/out\/ported\/[^/]+\.json$/,
  ];
  for (const s of status) {
    const f = s.slice(3).replace(/^"|"$/g, "");
    if (!allowed.some((re) => re.test(f))) problems.push(`想定外のファイルが変わった: ${s}`);
    // 写真は新しい店のものだけ(既存の写真フォルダを書き換えない)
    if (/^ ?M|^MM/.test(s) && /^public\//.test(f)) problems.push(`既存の写真が変わった: ${f}`);
  }
  return problems;
}

function main() {
  resolveCommit();
  log(`元: ${SRC} @ ${COMMIT.slice(0, 8)}`);
  if (!DRY && gitHere(["status", "--porcelain"]).toString().trim()) fail("この作業場所に未コミットの変更がある。コミットか退避してから実行する");
  const results = loadResults();
  const { targets, skipped } = pickTargets(results);
  const failedLeft = [...results.values()].filter((x) => x.status !== "成功").length;
  log(`結果 ${results.size} 件(うち成功 ${[...results.values()].filter((x) => x.status === "成功").length}・失敗 ${failedLeft})。まだ無い成功の店: ${targets.length} 件`);
  if (!targets.length) {
    console.log(JSON.stringify({ commit: COMMIT, added: [], skipped, note: "足すものが無い" }, null, 2));
    return;
  }
  for (const x of targets) log(`  ${x.vertical} 行${x.row} ${x.name} (${x.key})`);
  if (DRY) {
    console.log(JSON.stringify({ commit: COMMIT, dryRun: true, targets: targets.map((x) => ({ row: x.row, name: x.name, key: x.key, vertical: x.vertical })), skipped }, null, 2));
    return;
  }
  const ctx = { gourmet: [], vertical: [] };
  try {
    portGourmet(targets.filter((x) => x.vertical === "グルメ"), ctx);
    portVertical(targets.filter((x) => x.vertical !== "グルメ"), ctx);
    updateUnlisted(ctx);
    rebuild(ctx);
    const problems = verify(ctx);
    if (problems.length) fail("確認で問題:\n  - " + problems.join("\n  - "));
    log("tsc --noEmit ...");
    const t = spawnSync("npx", ["tsc", "--noEmit", "-p", "."], { cwd: TRIN, encoding: "utf8", maxBuffer: 1 << 28 });
    if (t.status !== 0) fail("tsc が失敗:\n" + (t.stdout || t.stderr).slice(0, 1500));

    // 一覧
    const added = targets.map((x) => {
      const gourmet = x.vertical === "グルメ";
      const shop = x.urls.shop ? SITE + x.urls.shop : null;
      const article = x.urls.article ? SITE + x.urls.article : null;
      return {
        row: x.row,
        name: x.name,
        key: x.key,
        vertical: x.vertical,
        id: gourmet ? x.storeId : x.placeId,
        articleId: gourmet ? NFC(x.articleId) : (x.urls.article ? x.placeId : null),
        shopUrl: shop,
        articleUrl: article,
        // シートの「トリニティ記事台帳」に書く URL(これまでと同じ規則: 記事のページがあれば記事、無ければ店のページ。グルメは /feature/<記事ID>)
        sheetUrl: gourmet ? `${SITE}/feature/${NFC(x.articleId)}` : article || shop,
      };
    });
    const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
    mkdirSync(abs("automation/v2/out/ported"), { recursive: true });
    const outRel = `automation/v2/out/ported/port-${stamp}-${COMMIT.slice(0, 7)}.json`;
    writeJson(outRel, { commit: COMMIT, source: SRC, count: added.length, added, skipped });
    if (!NO_COMMIT) {
      gitHere(["add", "-A"]);
      const msg = `feat(unlisted): トリニティアポ ${added.length} 店を限定公開で追加(${COMMIT.slice(0, 7)} から・行 ${added.map((a) => a.row).join(",")})\n\nautomation/v2/port-unlisted.mjs で取り込み。URL を知っていれば開ける・一覧/検索/地図/sitemap/関連には出さない・noindex。\n\nCo-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`;
      gitHere(["commit", "-q", "-m", msg]);
      log(`コミット: ${gitHere(["rev-parse", "--short", "HEAD"]).toString().trim()}`);
    }
    log(`一覧 JSON: ${abs(outRel)}`);
    console.log(JSON.stringify({ commit: COMMIT, jsonPath: abs(outRel), count: added.length, added, skipped }, null, 2));
  } catch (e) {
    log("失敗: " + e.message);
    try {
      gitHere(["add", "-A"]);
      gitHere(["stash", "push", "-q", "-m", `port-unlisted failed ${COMMIT.slice(0, 7)}`]);
      log("作業を git stash に退避して、元の状態に戻した(git stash list で確認できる)");
    } catch (e2) {
      log("退避にも失敗: " + e2.message);
    }
    process.exit(1);
  }
}

main();
