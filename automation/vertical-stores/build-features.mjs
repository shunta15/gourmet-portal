#!/usr/bin/env node
/**
 * build-features.mjs  —  vertical-stores（ビューティー・ボディケア）の特集記事
 *
 * features/<キー>.json（実在の店の特集記事。形は FEATURE.md の「出力」）から、サイトが読む特集のデータ
 * lib/places/generated/features-{beauty,bodycare}.json を作る。型は lib/places/features.ts の PlaceFeature。
 * 出力は自動生成。手で編集しない（直すなら features/<キー>.json かこのスクリプトを直して作り直す）。
 *
 * サイトのデータに入れないもの: facts（事実の一覧）・notes・images の元 URL／載っていたページ（どれも確認用）。
 * 入れるもの: article（グルメの特集記事と同じ型 FeatureArticle）・summary・tags・sources・確認日・店 ID・業種・
 *             写真の寸法と説明（<img> の width/height/alt に使う）。
 *
 * 店 ID（placeId）: gbp/<キー>.json の Google マップの cid を ids.json（build-places.mjs の台帳）で引く。
 *                   台帳に無ければ付けない（その店の店ページがまだ無い。特集ページは単独で出る）。
 *                   → 先に build-places.mjs を回して ID を払い出してから、このスクリプトを回す（順序が逆だと placeId が付かない）。
 *                   ページ側は、placeId の店が lib/places/generated/{beauty,bodycare}.json に実在するときだけ相互リンクを出す。
 *
 * 載せない記事（理由つきで標準出力に出す）: 必須の項目が無い・id が URL に使えない・id の重複・
 *                   hero の写真のファイルが public/ に無い。5 つのポイントの写真が無ければ、その写真だけ外す。
 * 注意だけ出す: 禁止の語・字数 3000 未満・facts 40 個未満・charCount とのずれ。
 *
 * 使い方:
 *   node automation/vertical-stores/build-features.mjs          # features/*.json から作る
 *   node automation/vertical-stores/build-features.mjs --dry    # 書き込まず、結果の要約だけ
 *   --features <dir> --out <dir> --ids <file> --public <dir>    # 場所の差し替え（試験用）
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../..");

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] ? path.resolve(argv[i + 1]) : d;
};
const DRY = flag("dry");
const FEATURES_DIR = opt("features", path.join(HERE, "features"));
const OUT_DIR = opt("out", path.join(REPO, "lib/places/generated"));
const IDS_FILE = opt("ids", path.join(HERE, "ids.json"));
const PUBLIC_DIR = opt("public", path.join(REPO, "public"));
const GBP_DIR = path.join(HERE, "gbp");

const VERTICALS = ["beauty", "bodycare"];
const messages = [];
const note = (key, msg) => messages.push(`${key}: ${msg}`);

// 効き目・医療・誇張・評判の語（FEATURE.md の上書きルール 3・4）。見つけたら注意を出す（載せるかは人が決める）
const FORBIDDEN = [
  "治る", "治す", "治療", "改善", "効果", "効能", "効く", "若返る", "痩せる", "医療", "医学的", "根本",
  "最高", "絶対", "絶品", "必ず", "No.1", "日本一", "おすすめ", "人気", "話題", "評判",
  "口コミ", "お客様の声", "ビフォーアフター",
];

const readJson = (f) => JSON.parse(readFileSync(f, "utf8"));
const natural = (a, b) => a.localeCompare(b, "en", { numeric: true });
const str = (x) => (typeof x === "string" ? x.trim() : "");
const isHttp = (u) => {
  try {
    const p = new URL(u);
    return p.protocol === "http:" || p.protocol === "https:";
  } catch {
    return false;
  }
};

// ------------------------------------------------------------------ 写真の寸法（<img> の width / height 用）
/** JPEG・PNG・WebP のヘッダから { w, h } を読む。読めなければ null */
function imageSize(file) {
  const b = readFileSync(file);
  if (b.length > 24 && b[0] === 0x89 && b.toString("ascii", 1, 4) === "PNG") {
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  }
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) {
        i++;
        continue;
      }
      const m = b[i + 1];
      if (m === 0xff) {
        i++;
        continue;
      }
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
    return null;
  }
  if (b.length > 30 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const t = b.toString("ascii", 12, 16);
    if (t === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (t === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (t === "VP8L") {
      const v = b.readUInt32LE(21);
      return { w: (v & 0x3fff) + 1, h: ((v >> 14) & 0x3fff) + 1 };
    }
  }
  return null;
}

/** "/_portal/…" の公開パス → public/ の中のファイル。パスの外へ出るもの・存在しないものは null */
function publicFile(webPath) {
  if (!webPath.startsWith("/") || webPath.includes("..")) return null;
  const f = path.join(PUBLIC_DIR, webPath);
  return existsSync(f) ? f : null;
}

// ------------------------------------------------------------------ 店 ID
const ledger = existsSync(IDS_FILE) ? readJson(IDS_FILE) : {};
function placeIdOf(vertical, key) {
  const f = path.join(GBP_DIR, `${key}.json`);
  if (!existsSync(f)) return undefined;
  const d = readJson(f);
  if (d.verdict !== "一致" || !d.place) return undefined;
  const cid = /[?&]cid=(\d+)/.exec(d.place.gbpUrl || "")?.[1];
  return cid ? ledger[vertical]?.[cid] : undefined;
}

// ------------------------------------------------------------------ 1 記事
const charsOf = (a) => [a.lede, ...a.ranking.map((r) => r.desc), a.quote, a.closing].join("").replace(/\s/g, "").length;

/** タイトルの HTML は <em>・<br> だけを許す（それ以外のタグ・< > が残るなら null） */
function safeTitleHTML(html) {
  const s = str(html);
  const rest = s.replace(/<\/?em>/g, "").replace(/<br\s*\/?>/g, "");
  return /[<>]/.test(rest) ? null : s;
}

function buildFeature(key, d) {
  const vertical = str(d.vertical) || key.replace(/-\d+$/, "");
  if (!VERTICALS.includes(vertical) || !new RegExp(`^${vertical}-\\d+$`).test(key)) {
    note(key, "載せません: key / vertical が beauty-<行> / bodycare-<行> の形ではない");
    return null;
  }
  const a = d.article;
  if (!a || typeof a !== "object") {
    note(key, "載せません: article が無い");
    return null;
  }
  const id = str(a.id);
  if (!id || /[\/?#%\\\s]/.test(id)) {
    note(key, `載せません: article.id が URL に使えない（${JSON.stringify(a.id)}）`);
    return null;
  }
  for (const f of ["title", "subtitle", "lede", "heroImage", "quote", "closing"]) {
    if (!str(a[f])) {
      note(key, `載せません: article.${f} が無い`);
      return null;
    }
  }
  const titleHTML = safeTitleHTML(a.titleHTML) ?? null;
  if (!titleHTML) {
    note(key, "載せません: article.titleHTML に <em>・<br> 以外のタグがある、または空");
    return null;
  }
  if (!Array.isArray(a.ranking) || a.ranking.length === 0) {
    note(key, "載せません: article.ranking（5 つのポイント）が無い");
    return null;
  }

  const photos = {};
  const addPhoto = (webPath, alt) => {
    const f = publicFile(webPath);
    if (!f) return false;
    const size = imageSize(f);
    photos[webPath] = { ...(size ?? {}), alt };
    if (!size) note(key, `写真の寸法を読めません（${webPath}）。width / height なしで出します`);
    return true;
  };
  const whatOf = (p) => str((Array.isArray(d.images) ? d.images : []).find((i) => i?.path === p)?.what);

  if (!addPhoto(a.heroImage, `${str(d.storeName)}の${whatOf(a.heroImage) || "写真"}`)) {
    note(key, `載せません: hero の写真が public/ に無い（${a.heroImage}）`);
    return null;
  }

  const ranking = a.ranking.map((r, i) => {
    const imgs = [];
    for (const p of Array.isArray(r.images) ? r.images : []) {
      if (addPhoto(p, `${str(d.storeName)}の${whatOf(p) || "写真"}`)) imgs.push(p);
      else note(key, `POINT ${i + 1} の写真が public/ に無いので外しました（${p}）`);
    }
    const specs = (Array.isArray(r.specs) ? r.specs : [])
      .map((s) => ({ k: str(s?.k), v: str(s?.v) }))
      .filter((s) => s.k && s.v);
    const item = {
      rank: str(r.rank),
      rankNum: Number.isFinite(r.rankNum) ? r.rankNum : i + 1,
      name: str(r.name),
      cuisine: str(r.cuisine),
      area: str(r.area),
      desc: str(r.desc),
      images: imgs,
      specs,
      ...(str(r.purpose) ? { purpose: str(r.purpose) } : {}),
    };
    return item;
  });
  const bad = ranking.findIndex((r) => !r.rank || !r.name || !r.desc);
  if (bad >= 0) {
    note(key, `載せません: POINT ${bad + 1} に rank / name / desc のどれかが無い`);
    return null;
  }

  const article = {
    id,
    no: str(a.no),
    articleType: "guide",
    kicker: str(a.kicker),
    title: str(a.title),
    titleHTML,
    subtitle: str(a.subtitle),
    lede: str(a.lede),
    date: str(a.date),
    reading: str(a.reading),
    author: str(a.author) || "マチノワ編集部",
    heroImage: a.heroImage,
    ogImage: str(a.ogImage) || a.heroImage,
    ranking,
    sideArticles: [],
    quote: str(a.quote),
    quoteCite: str(a.quoteCite) || "マチノワ編集部",
    closing: str(a.closing),
  };

  // ---- 注意だけ出す
  const text = [article.title, article.subtitle, article.lede, str(d.summary), ...ranking.flatMap((r) => [r.name, r.cuisine, r.desc, ...r.specs.flatMap((s) => [s.k, s.v])]), article.quote, article.closing].join("\n");
  for (const w of FORBIDDEN) if (text.includes(w)) note(key, `注意: 禁止の語「${w}」が含まれています（確認してください）`);
  const chars = charsOf(article);
  if (chars < 3000) note(key, `注意: 本文が ${chars} 字（3000 字未満）`);
  if (Number.isFinite(d.charCount) && Math.abs(d.charCount - chars) > 5) note(key, `注意: charCount ${d.charCount} と実測 ${chars} がずれています`);
  const facts = Array.isArray(d.facts) ? d.facts : [];
  if (facts.length < 40) note(key, `注意: facts が ${facts.length} 個（40 個未満）`);
  const badFacts = facts.filter((f) => !str(f?.claim) || !isHttp(str(f?.source)) || !str(f?.quote) || !/^\d{4}-\d{2}-\d{2}$/.test(str(f?.checkedAt)));
  if (badFacts.length > 0) note(key, `注意: facts のうち ${badFacts.length} 個に claim / source / quote / checkedAt の欠けがあります`);
  if (!str(d.summary)) note(key, "注意: summary が無いので、ページの説明文には導入文を使います");

  const sources = [];
  for (const s of Array.isArray(d.sources) ? d.sources : []) {
    const url = str(s?.url);
    const label = str(s?.label);
    if (!label || !isHttp(url)) {
      note(key, `注意: sources に使えない項目があります: ${JSON.stringify(s)}`);
      continue;
    }
    sources.push({ label, url });
  }
  if (sources.length === 0) note(key, "注意: sources がありません。情報の出どころを出せません");
  const dates = facts.map((f) => str(f?.checkedAt)).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)).sort();
  const checkedAt = dates[0]; // 一番古い確認日（記事全体がそろって確認できていた日。build-places.mjs と同じ）
  if (!checkedAt) note(key, "注意: 確認日（facts の checkedAt）がありません");

  const placeId = placeIdOf(vertical, key);
  if (!placeId) note(key, "店 ID なし（gbp が「一致」でない、または ids.json に無い）。特集ページ単独で出します");

  return {
    id,
    key,
    vertical,
    storeName: str(d.storeName),
    ...(placeId ? { placeId } : {}),
    article,
    summary: str(d.summary) || article.lede,
    tags: (Array.isArray(d.tags) ? d.tags : []).map(str).filter(Boolean),
    sources,
    ...(checkedAt ? { checkedAt } : {}),
    photos,
  };
}

// ------------------------------------------------------------------ 本体
const out = { beauty: [], bodycare: [] };
const files = existsSync(FEATURES_DIR) ? readdirSync(FEATURES_DIR).filter((f) => f.endsWith(".json")).sort(natural) : [];
const seen = new Map();
for (const f of files) {
  const key = f.replace(/\.json$/, "");
  let d;
  try {
    d = readJson(path.join(FEATURES_DIR, f));
  } catch (e) {
    note(key, `載せません: JSON を読めない（${e.message}）`);
    continue;
  }
  if (str(d.key) && str(d.key) !== key) {
    note(key, `載せません: ファイル名と key（${d.key}）が違う`);
    continue;
  }
  const feat = buildFeature(key, d);
  if (!feat) continue;
  const dup = seen.get(`${feat.vertical}/${feat.id}`);
  if (dup) {
    note(key, `載せません: article.id「${feat.id}」が ${dup} と重複`);
    continue;
  }
  seen.set(`${feat.vertical}/${feat.id}`, key);
  out[feat.vertical].push(feat);
}
for (const v of VERTICALS) out[v].sort((a, b) => natural(a.key, b.key));

const NOTE =
  "自動生成（automation/vertical-stores/build-features.mjs）。手で編集しない。直すときは features/<キー>.json か build-features.mjs を直して作り直す。facts・notes は入れていない（確認用）。";
if (!DRY) {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const v of VERTICALS) {
    writeFileSync(path.join(OUT_DIR, `features-${v}.json`), JSON.stringify({ _note: NOTE, features: out[v] }, null, 2) + "\n");
  }
}

console.log(`${DRY ? "[dry] " : ""}features/*.json=${files.length}  beauty=${out.beauty.length}  bodycare=${out.bodycare.length}`);
for (const v of VERTICALS) for (const f of out[v]) console.log(`  ${f.key}  ${f.id}  placeId=${f.placeId ?? "-"}  POINT=${f.article.ranking.length}  写真=${Object.keys(f.photos).length}`);
for (const m of messages) console.log(`  ${m}`);
