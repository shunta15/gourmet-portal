/**
 * automation/v2/lib/integrate-gourmet.mjs — グルメの店を、今のデータの作り方に入れる
 *
 *  1. 写真        public/restaurants/teleapo-<記事ID>/hero.jpg・point1〜5.jpg(使う写真だけ。足りない枠は空)
 *  2. 記事        lib/teleapo-features.ts の末尾に 1 件(型は既存の記事と同じ)
 *  3. 店のデータ  automation/stores500/map.json・gbp/<記事ID>.json を足して build-stores.mjs を実行(店 ID は ids.json の続きから自動採番)
 *  4. 写真の情報  lib/portal/photoFeature/photoMeta.generated.ts に、新しい写真の行(幅・高さ・指紋)を足す(生成表への追記だけ)
 *  5. 1 ページ化  店ページを検索に出す条件(lib/restaurantIndexable.ts と同じ: 実写・住所・営業時間)を満たす店だけ、
 *                lib/portal/noren/onePage.ts の ONE_PAGE_SHOP_OF_FEATURE の表に 1 行足す(今の 133 本と同じ扱い。表示のコードは触らない)
 * 失敗したら、触ったファイルを元に戻して例外を投げる(途中の状態を残さない)。
 * 既存の店のデータが 1 件でも変わったら(生成器のずれ)、元に戻して止まる。ただし main の時点で既にずれている行(baseline)は、元の文のまま保つ。
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { dHash } from "./photos.mjs";
import { REPO, abs, nfc, today } from "./util.mjs";

const OUTPUTS = [
  "lib/teleapo-features.ts",
  "lib/articleStores.ts",
  "lib/articleRegions.ts",
  "lib/geo.ts",
  "automation/stores500/ids.json",
  "automation/stores500/excluded.json",
  "automation/stores500/tag-evidence.json",
  "automation/stores500/warnings.json",
  "automation/stores500/region-mismatch.json",
  "automation/stores500/map.json",
  "lib/portal/photoFeature/photoMeta.generated.ts",
  "lib/portal/noren/onePage.ts",
];

const snapshot = () => new Map(OUTPUTS.map((f) => [f, existsSync(abs(f)) ? readFileSync(abs(f), "utf8") : null]));
const restore = (snap) => {
  for (const [f, body] of snap) if (body !== null) writeFileSync(abs(f), body);
};
const importFresh = (rel) => import(pathToFileURL(abs(rel)).href + `?t=${Date.now()}${Math.random()}`);

function runBuildStores() {
  const r = spawnSync("node", ["automation/stores500/build-stores.mjs"], { cwd: REPO, encoding: "utf8", timeout: 300_000 });
  if (r.status !== 0) throw new Error(`build-stores.mjs が失敗(exit ${r.status}): ${(r.stderr || "").slice(-300)}`);
}

/**
 * main の時点で、生成器の出力と、コミット済みの lib/articleStores.ts が食い違う行(手で直した行など)を調べる。
 * 返り値: [{ generated, committed }]。行数が変わる食い違いは扱えないので null(そのときは新しい店の追加を止める)。
 */
export function baselineFixups() {
  const snap = snapshot();
  try {
    runBuildStores();
    const gen = readFileSync(abs("lib/articleStores.ts"), "utf8").split("\n");
    const old = snap.get("lib/articleStores.ts").split("\n");
    if (gen.length !== old.length) return null;
    const out = [];
    for (let i = 0; i < gen.length; i++) if (gen[i] !== old[i]) out.push({ generated: gen[i], committed: old[i] });
    return out;
  } finally {
    restore(snap);
  }
}

/** TS の記事 1 件(既存の記事と同じ書き方。id は引用符なしの形 — 機械の検査・照合がこの形を読む) */
function articleTs(a) {
  const q = JSON.stringify;
  const ind = (n) => "  ".repeat(n);
  const specs = (arr) =>
    arr.length
      ? `[\n${arr.map((s) => `${ind(5)}{ k: ${q(s.k)}, v: ${q(s.v)} },`).join("\n")}\n${ind(4)}]`
      : "[]";
  const rank = a.ranking
    .map(
      (r) => `${ind(3)}{
${ind(4)}rank: ${q(r.rank)},
${ind(4)}rankNum: ${r.rankNum},
${ind(4)}name: ${q(r.name)},
${ind(4)}cuisine: ${q(r.cuisine)},
${ind(4)}area: ${q(r.area)},
${ind(4)}purpose: ${q(r.purpose)},
${ind(4)}desc: ${q(r.desc)},
${ind(4)}images: ${q(r.images)},
${ind(4)}specs: ${specs(r.specs)},
${ind(3)}},`,
    )
    .join("\n");
  return `  ${q(a.id)}: {
    id: ${q(a.id)},
    no: "",
    articleType: "guide" as const,
    kicker: ${q(a.kicker)},
    title: ${q(a.title)},
    titleHTML: ${q(a.titleHTML)},
    subtitle: ${q(a.subtitle)},
    lede: ${q(a.lede)},
    date: ${q(a.date)},
    reading: "",
    author: "マチノワ編集部",
    heroImage: ${q(a.heroImage)},
    ogImage: ${q(a.ogImage)},
    ranking: [
${rank}
    ],
    sideArticles: [],
    quote: ${q(a.quote)},
    quoteCite: "マチノワ編集部",
    closing: ${q(a.closing)},
  },
`;
}

const PURPOSE = [
  "店の核となる料理・商品・技術について書く",
  "他店との違い・通う理由を書く",
  "素材・メニュー・ドリンクなど具体的な魅力を書く",
  "店内空間・誰と行きやすいかを書く",
  "アクセス・使い方を書く",
];

export async function integrateGourmet({ store, result, manifest, work, verified, baseline, log = () => {} }) {
  const id = store.articleId;
  const info = store.info;
  const a = result.article;
  const byId = new Map(manifest.map((m) => [m.id, m]));
  const usedOk = (pid) => pid && (result.photos || []).some((p) => p.id === pid && p.use) && byId.has(pid);
  const dirWeb = `/restaurants/teleapo-${id}`;
  const dirFs = abs("public/restaurants", `teleapo-${id}`);
  const snap = snapshot();
  const copied = [];
  try {
    if (existsSync(dirFs)) throw new Error(`写真のフォルダが既にある: ${dirFs}`);

    // ---- 1. 写真
    const plan = result.photoPlan || {};
    const heroId = usedOk(plan.hero) ? plan.hero : null;
    const pointIds = a.ranking.map((_, i) => (usedOk((plan.points || [])[i]) ? plan.points[i] : null));
    const place = (pid, name) => {
      mkdirSync(dirFs, { recursive: true });
      copyFileSync(path.join(work, byId.get(pid).full), path.join(dirFs, name));
      copied.push({ file: name, from: pid });
      return `${dirWeb}/${name}`;
    };
    const heroPath = heroId ? place(heroId, "hero.jpg") : "";
    const rankPaths = pointIds.map((pid, i) => (pid ? place(pid, `point${i + 1}.jpg`) : null));
    const emptyFrames = (heroId ? 0 : 1) + rankPaths.filter((x) => !x).length;

    // ---- 2. 記事
    const article = {
      id,
      kicker: a.kicker,
      title: a.title,
      titleHTML: a.titleHTML,
      subtitle: a.subtitle,
      lede: a.lede,
      date: today(),
      heroImage: heroPath,
      ogImage: heroPath,
      ranking: a.ranking.map((r, i) => ({
        rank: `POINT ${String(i + 1).padStart(2, "0")}`,
        rankNum: i + 1,
        name: r.name,
        cuisine: r.cuisine,
        area: r.area,
        purpose: PURPOSE[i] || PURPOSE[PURPOSE.length - 1],
        desc: r.desc,
        images: rankPaths[i] ? [rankPaths[i]] : [],
        specs: (r.specs || []).filter((s) => s?.k && s?.v),
      })),
      quote: a.quote,
      closing: a.closing,
    };
    const featSrc = readFileSync(abs("lib/teleapo-features.ts"), "utf8");
    const ids = new Set([...featSrc.matchAll(/^\s*id:\s*"([^"]+)"\s*,/gm)].map((m) => nfc(m[1])));
    if (ids.has(nfc(id))) throw new Error(`記事ID「${id}」が lib/teleapo-features.ts に既にある`);
    const end = featSrc.lastIndexOf("\n};");
    if (end < 0 || featSrc.slice(end).trim() !== "};") throw new Error("lib/teleapo-features.ts の末尾が想定の形(};)でない");
    writeFileSync(abs("lib/teleapo-features.ts"), featSrc.slice(0, end + 1) + articleTs(article) + featSrc.slice(end + 1));

    // ---- 3. 店のデータ
    const mapPath = abs("automation/stores500/map.json");
    const map = JSON.parse(readFileSync(mapPath, "utf8"));
    if (map.some((m) => nfc(m.articleId) === nfc(id))) throw new Error(`map.json に記事ID「${id}」が既にある`);
    map.push({ articleId: id, sheetName: nfc(store.name), mapsUrl: `https://maps.google.com/?cid=${store.cid}` });
    writeFileSync(mapPath, JSON.stringify(map, null, 2) + "\n");
    const gbpFile = abs("automation/stores500/gbp", `${id}.json`);
    if (existsSync(gbpFile)) throw new Error(`gbp/${id}.json が既にある`);
    writeFileSync(gbpFile, JSON.stringify({ ...info, priceRange: null }, null, 2) + "\n");
    copied.push({ file: `gbp/${id}.json` });

    const storesBefore = (await importFresh("lib/articleStores.ts")).ARTICLE_STORES;
    runBuildStores();
    // main の時点で既にずれている行は、元の文のまま保つ
    if (baseline?.length) {
      let t = readFileSync(abs("lib/articleStores.ts"), "utf8");
      for (const f of baseline) t = t.split(f.generated).join(f.committed);
      writeFileSync(abs("lib/articleStores.ts"), t);
    }
    const mod = await importFresh("lib/articleStores.ts");
    const storesAfter = mod.ARTICLE_STORES;
    const before = new Map(storesBefore.map((s) => [s.id, JSON.stringify(s)]));
    const drift = [];
    for (const s of storesAfter) if (before.has(s.id) && before.get(s.id) !== JSON.stringify(s)) drift.push(s.id);
    for (const bid of before.keys()) if (!storesAfter.some((s) => s.id === bid)) drift.push(`${bid}(消えた)`);
    if (drift.length) throw new Error(`既存の店 ${drift.length} 件のデータが変わった(生成器のずれ): ${drift.slice(0, 6).join(", ")}`);
    const added = storesAfter.filter((s) => !before.has(s.id));
    const idsJson = JSON.parse(readFileSync(abs("automation/stores500/ids.json"), "utf8"));
    const storeId = idsJson[id] ?? null;
    const excluded = JSON.parse(readFileSync(abs("automation/stores500/excluded.json"), "utf8")).find((e) => nfc(e.articleId) === nfc(id));
    const newStore = added.find((s) => s.id === storeId) ?? null;

    // ---- 4. 写真の情報(生成表への追記)
    if (copied.some((c) => c.from)) {
      const rows = [];
      for (const c of copied.filter((x) => x.from)) {
        const f = path.join(dirFs, c.file);
        const buf = readFileSync(f);
        const m = await sharp(buf, { failOn: "none" }).metadata();
        rows.push([`${dirWeb}/${c.file}`, m.width, m.height, await dHash(buf)]);
      }
      const p = abs("lib/portal/photoFeature/photoMeta.generated.ts");
      const lines = readFileSync(p, "utf8").split("\n");
      const first = lines.findIndex((l) => /^  "/.test(l));
      let last = first;
      while (last + 1 < lines.length && /^  "/.test(lines[last + 1])) last++;
      const entries = lines.slice(first, last + 1);
      const have = new Set(entries.map((l) => /^  ("(?:[^"\\]|\\.)*")/.exec(l)[1]));
      for (const [k, w, h, hx] of rows) if (!have.has(JSON.stringify(k))) entries.push(`  ${JSON.stringify(k)}: [${w}, ${h}, "${hx}"],`);
      entries.sort((x, y) => {
        const kx = JSON.parse(/^  ("(?:[^"\\]|\\.)*")/.exec(x)[1]);
        const ky = JSON.parse(/^  ("(?:[^"\\]|\\.)*")/.exec(y)[1]);
        return kx < ky ? -1 : 1;
      });
      writeFileSync(p, [...lines.slice(0, first), ...entries, ...lines.slice(last + 1)].join("\n"));
    }

    // ---- 5. 1 ページ化の表
    let onePage = "対象外(店のデータが出なかった)";
    if (newStore) {
      const unknown = (v) => !v || !String(v).trim() || /^[—-]/.test(String(v).trim());
      const gate = !!newStore.image && !String(newStore.image).includes("/restaurants/_placeholder/") && !unknown(newStore.address) && !unknown(newStore.hours);
      if (gate) {
        const p = abs("lib/portal/noren/onePage.ts");
        const src = readFileSync(p, "utf8");
        const tStart = src.indexOf("export const ONE_PAGE_SHOP_OF_FEATURE");
        const tEnd = src.indexOf("\n};", tStart);
        const table = src.slice(tStart, tEnd);
        const lastRow = [...table.matchAll(/^  "[^"\n]+": "r\d+",.*$/gm)].pop();
        if (!lastRow) throw new Error("onePage.ts の表の最後の行を見つけられない");
        const at = tStart + lastRow.index + lastRow[0].length;
        const already = /自動作成\(automation\/v2\/write\.mjs\)/.test(table);
        const header = already ? "" : `\n  // ── ${today()} に記事の自動作成(automation/v2/write.mjs)で足した本。店ページを検索に出す条件(実写の写真・住所・営業時間)を満たす店だけ ──`;
        const row = `\n  ${JSON.stringify(id)}: ${JSON.stringify(storeId)}, // ${newStore.name}`;
        writeFileSync(p, src.slice(0, at) + header + row + src.slice(at));
        onePage = "表に追加(/feature/<記事ID> は /restaurant/<店ID> へ転送)";
      } else onePage = "表に入れない(検索に出す条件 実写・住所・営業時間 のどれかが無い。記事は /feature/<記事ID> のまま)";
    }

    return {
      articleId: id,
      storeId,
      storeBuilt: !!newStore,
      storeExcludedReason: !newStore ? (excluded?.reason ?? "店データに出なかった(automation/stores500/warnings.json を見る)") : null,
      photosPlaced: copied.filter((c) => c.from).length,
      emptyFrames,
      onePage,
      urls: { article: `/feature/${id}`, shop: storeId ? `/restaurant/${storeId}` : null },
    };
  } catch (e) {
    restore(snap);
    rmSync(dirFs, { recursive: true, force: true });
    rmSync(abs("automation/stores500/gbp", `${id}.json`), { force: true });
    throw e;
  }
}
