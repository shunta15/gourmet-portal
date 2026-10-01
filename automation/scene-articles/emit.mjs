#!/usr/bin/env node
/**
 * emit.mjs
 *
 * ライターが書いた利用シーン特集（automation/scene-articles/out/<記事ID>.json。形式は SCHEMA.md）を読み、
 * 各項目の店ID から 店名・画像・住所・最寄り駅・営業時間・予算 を店データ（lib/data.ts）から埋めて、
 * lib/sceneFeatures.ts（SCENE_FEATURES / SCENE_FEATURE_ARTICLES / SCENE_FEATURE_META）を JSON.stringify で生成する。
 * lib/data.ts は lib/sceneFeatures.ts を FEATURES / FEATURE_ARTICLES / FEATURE_INDEXABLE_IDS に合流済み。
 *
 * 検査（1件でも違反があれば何も書き出さず、違反を一覧表示して終了コード1）
 *   - 形式・必須キー・記事IDの文字（URL に使える字）・IDの重複（out/ 内・既存の特集記事との衝突）
 *   - scene が lib/scenes.ts にある・area（"<region>" か "<region>/<街>"）が実在する
 *   - 項目数 3〜7（画像のない店を外したあとも 3 以上）
 *   - storeId が実在し、その店がこの シーン×地域 の該当店（candidates と同じ判定・4店以上の組み合わせ）に含まれる
 *   - factsUsed が各項目に1つ以上あり、すべて店データに実在する値（"<field>: <値>" 形式）
 *   - 本文に禁止語が無い（machinowa-article-spec.md §14・脱テンプレ規約・「最高」「絶品」「必ず」「屈指」「随一」「有数」「最も」など、
 *     来店体験の創作・口コミ/評価への言及）
 * 警告（書き出しは止めない）: 「人気」「おすすめ」、文量の目安外、tag-only の店、タイトルに地域名/シーン名が無い 等
 *
 * 画像: 店の実写（プレースホルダでない・ファイルが実在）が無い店は、その店を記事から外す（警告に出す）。
 *
 * 使い方
 *   node automation/scene-articles/emit.mjs            検査して lib/sceneFeatures.ts を生成
 *   node automation/scene-articles/emit.mjs --check    検査だけ（書き出さない）
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadData, loadLib, ROOT } from "../lib/load-data.mjs";
import { isRealImage, known, matchesScene } from "./common.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(HERE, "out");
const TARGET = path.join(ROOT, "lib/sceneFeatures.ts");
const CHECK_ONLY = process.argv.includes("--check");

const MIN_STORES = 4; // build-candidates.mjs と同じ（該当店が4店以上の組み合わせだけが候補）
const MIN_ITEMS = 3;
const MAX_ITEMS = 7;

const { RESTAURANTS, FEATURE_ARTICLES } = await loadData();
const { SCENES } = await loadLib("scenes");
const { REGIONS } = await loadLib("regions");
const T = await loadLib("towns");
const { SCENE_FEATURE_ARTICLES: previouslyEmitted } = await loadLib("sceneFeatures");
const tagEvidence = JSON.parse(readFileSync(path.join(ROOT, "automation/stores500/tag-evidence.json"), "utf8"));

const storeById = new Map(RESTAURANTS.map((r) => [r.id, r]));
const sceneBySlug = new Map(SCENES.map((s) => [s.slug, s]));
const sceneIndex = new Map(SCENES.map((s, i) => [s.slug, i]));

const SCENE_EN = {
  date: "DATE",
  business: "BUSINESS DINING",
  solo: "SOLO DRINKING",
  group: "BANQUET",
  "girls-night": "GIRLS NIGHT",
  "private-room": "PRIVATE ROOM",
  "pet-friendly": "PET FRIENDLY",
  lunch: "LUNCH",
  "late-night": "LATE NIGHT",
  sake: "SAKE & SHOCHU",
  bread: "BAKERY",
  "soba-udon": "SOBA & UDON",
};

// ---------------------------------------------------------------- 禁止語

/** 即エラー（agent-teams/decisions/machinowa-article-spec.md §14 + automation/check-banned.mjs + ユーザー指定） */
const BANNED = [
  { re: /最高|絶品|必ず|屈指|随一|有数|最も/, why: "誇張・最上級（最高/絶品/必ず/屈指/随一/有数/最も）" },
  { re: /日本一|世界一|日本初|世界初|最大級|唯一無二|必食|悶絶|至高|究極/, why: "誇張・最上級表現" },
  { re: /絶対|No\.?\s?1|ナンバーワン|ナンバー1/i, why: "根拠のない断定（絶対/No.1）" },
  { re: /素朴|派手さはない|奇をてらった|観光客向けの派手/, why: "否定起点の褒め" },
  { re: /らしい/, why: "推測の語尾（〜らしい）" },
  { re: /呼び込み|客引き/, why: "客引き追従" },
  { re: /★|☆|評価\s*[0-9０-９]|[0-9０-９]\s*点満点|Google\s*評価/i, why: "星・評価値" },
  { re: /口コミ|クチコミ|レビュー|評判|評価/, why: "口コミ・評価への言及（星評価・口コミ転載は禁止）" },
  { re: /（\s*[0-9]{4}\s*年(現在|時点)\s*）|\(\s*[0-9]{4}\s*年(現在|時点)\s*\)/, why: "年号付き料金表記" },
  { re: /うんこビル|東京一凶/, why: "俗称・スラング" },
  { re: /編集部が考える|初めてなら、まずは|初訪問なら、まずは|5つのポイントに分けて|起点になってくれる一軒|理由になる一軒/, why: "脱テンプレ規約の禁止フレーズ" },
  {
    re: /実際に(訪|行|食|伺|足を運|飲|試)|食べてみ|飲んでみ|行ってみ|訪れてみ|伺った|伺いました|いただきました|いただいた|取材/,
    why: "来店体験・取材の創作（実際に訪れた前提の記述）",
  },
];
const WARN = [
  { re: /人気(店|の|な)/, why: "「人気」— 根拠が本文にあるか" },
  { re: /おすすめ|オススメ/, why: "「おすすめ」— 根拠が本文にあるか" },
];

// ---------------------------------------------------------------- ユーティリティ

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const norm = (s) => String(s ?? "").replace(/\s+/g, "").replace(/[–—－―〜~]/g, "-");
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const jstDate = (d) => new Date(d.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);

const ID_RE = /^[A-Za-z0-9\-ぁ-んァ-ヶ一-龠ー々]+$/; // machinowa-article-spec.md §17: 英数・ひらがな・カタカナ・漢字・-
const FACT_FIELDS = ["seats", "hours", "budget", "nearest", "closed", "address", "cuisine", "tag", "evidence"];

function factOk(store, line) {
  const m = String(line).match(/^([a-z]+):\s*(.+)$/s);
  if (!m || !FACT_FIELDS.includes(m[1])) return `形式が "<field>: <値>" でない（field は ${FACT_FIELDS.join("/")}）: ${line}`;
  const [, field, valueRaw] = m;
  const value = norm(valueRaw);
  if (!value) return `値が空: ${line}`;
  if (field === "tag") return (store.tags || []).includes(valueRaw.trim()) ? null : `店の tags に無い: ${line}`;
  if (field === "evidence") {
    const ev = (tagEvidence[store.id]?.tags || []).map((t) => norm(t.evidence));
    return ev.some((e) => e.includes(value)) ? null : `tag-evidence.json に無い: ${line}`;
  }
  const have = known(store[field]);
  return have && norm(have).includes(value) ? null : `店データ(${field})に無い値: ${line}`;
}

function articleArea(area) {
  const [region, ...rest] = String(area).split("/");
  return { region, town: rest.length ? rest.join("/") : null };
}

// ---------------------------------------------------------------- 読み込み

if (!existsSync(OUT_DIR)) {
  console.error(`out/ が無い: ${OUT_DIR}`);
  process.exit(1);
}
const files = readdirSync(OUT_DIR).filter((f) => f.endsWith(".json")).sort();
const errors = []; // {file, msg}
const warns = [];
const err = (file, msg) => errors.push({ file, msg });
const warn = (file, msg) => warns.push({ file, msg });

const ids = new Map();
const articles = [];

for (const file of files) {
  const full = path.join(OUT_DIR, file);
  let a;
  try {
    a = JSON.parse(readFileSync(full, "utf8"));
  } catch (e) {
    err(file, `JSON として読めない: ${e.message}`);
    continue;
  }
  const before = errors.length;

  // --- 形式
  for (const k of ["id", "scene", "area", "title", "subtitle", "lede", "closing"]) if (!isStr(a[k])) err(file, `必須の文字列が無い: ${k}`);
  if (!Array.isArray(a.items)) err(file, "items が配列でない");
  if (!Array.isArray(a.tags) || a.tags.some((t) => !isStr(t))) err(file, "tags が文字列の配列でない");
  if (errors.length > before) continue;

  if (!ID_RE.test(a.id)) err(file, `id に使えない文字がある（英数・ひらがな・カタカナ・漢字・- のみ）: ${a.id}`);
  if (file !== `${a.id}.json`) err(file, `ファイル名と id が違う: ${a.id}`);
  if (ids.has(a.id)) err(file, `id が重複: ${a.id}（${ids.get(a.id)}）`);
  ids.set(a.id, file);
  if (FEATURE_ARTICLES[a.id] && !previouslyEmitted[a.id]) err(file, `既存の特集記事と id が衝突: ${a.id}`);

  // --- シーン・地域
  const scene = sceneBySlug.get(a.scene);
  if (!scene) {
    err(file, `scene が lib/scenes.ts に無い: ${a.scene}（${[...sceneBySlug.keys()].join(" / ")}）`);
    continue;
  }
  const { region, town } = articleArea(a.area);
  if (!REGIONS[region]) {
    err(file, `area の地域キーが無い: ${a.area}`);
    continue;
  }
  const inArea = (r) => r.region === region && (!town || T.parseTown(r.address, r.region)?.town === town);
  const areaStores = RESTAURANTS.filter((r) => inArea(r) && matchesScene(r, scene));
  if (town && areaStores.length === 0 && !RESTAURANTS.some(inArea)) err(file, `area の街に店が無い: ${a.area}`);
  if (areaStores.length < MIN_STORES)
    err(file, `この シーン×地域 は該当店が ${areaStores.length} 店（${MIN_STORES} 店以上の組み合わせだけが候補。build-candidates.mjs で確認）`);
  const areaLabel = town ?? REGIONS[region].name;

  // --- 項目
  const n = a.items.length;
  if (n < MIN_ITEMS || n > MAX_ITEMS) err(file, `項目数が ${n}（${MIN_ITEMS}〜${MAX_ITEMS}）`);
  const seen = new Set();
  const kept = [];
  const dropped = [];
  a.items.forEach((it, i) => {
    const w = `items[${i}]`;
    if (!it || typeof it !== "object") return err(file, `${w} がオブジェクトでない`);
    if (!isStr(it.storeId) || !isStr(it.heading) || !isStr(it.body)) return err(file, `${w}: storeId / heading / body の文字列が必要`);
    if (!Array.isArray(it.factsUsed) || it.factsUsed.length === 0 || it.factsUsed.some((f) => !isStr(f)))
      return err(file, `${w}(${it.storeId}): factsUsed（使った事実。"<field>: <値>"）が1つ以上必要`);
    const store = storeById.get(it.storeId);
    if (!store) return err(file, `${w}: storeId が実在しない: ${it.storeId}`);
    if (seen.has(it.storeId)) return err(file, `${w}: storeId が重複: ${it.storeId}`);
    seen.add(it.storeId);
    if (!areaStores.some((r) => r.id === it.storeId))
      return err(file, `${w}: ${it.storeId}（${store.name}）はこの シーン×地域（${a.scene} × ${a.area}）の該当店に含まれない`);
    for (const f of it.factsUsed) {
      const e = factOk(store, f);
      if (e) err(file, `${w}(${it.storeId}) factsUsed: ${e}`);
    }
    // シーンのタグに事実の裏づけがあるか（無ければ警告。tag-only の店はタグの根拠を本文で示せない）
    const ev = tagEvidence[store.id]?.tags?.some((t) => scene.matchTags.includes(t.tag));
    const tagFact = it.factsUsed.some((f) => /^(evidence|hours|seats|cuisine):/.test(f));
    if (!ev && !tagFact) warn(file, `${w}(${it.storeId} ${store.name}): シーン適性の根拠となる事実（evidence/hours/seats/cuisine）を factsUsed に挙げていない（tag-only の店か）`);
    if (!isRealImage(store.image)) {
      dropped.push({ i, store });
      return;
    }
    kept.push({ it, store });
  });

  for (const d of dropped) warn(file, `items[${d.i}](${d.store.id} ${d.store.name}): 実写画像が無いので記事から外した`);
  if (errors.length === before && kept.length < MIN_ITEMS) {
    err(file, `実写画像のある店が ${kept.length} 店しか残らない（${MIN_ITEMS} 店以上必要。外した店: ${dropped.map((d) => d.store.id).join(",")}）`);
  }
  // 本文の検査は、項目にエラーがあっても最後まで走らせて違反を一度に出す
  const texts = [
    ["title", a.title],
    ["subtitle", a.subtitle],
    ["lede", a.lede],
    ["closing", a.closing],
    ...a.items.flatMap((it, i) => [
      [`items[${i}].heading`, isStr(it?.heading) ? it.heading : ""],
      [`items[${i}].body`, isStr(it?.body) ? it.body : ""],
    ]),
  ];
  for (const d of dropped) {
    const nm = d.store.name;
    for (const [where, v] of texts) if (nm.length >= 3 && v.includes(nm)) err(file, `${where}: 記事から外した店「${nm}」の名前が残っている`);
  }

  // --- 禁止語・警告
  for (const [where, v] of texts) {
    const all = (re) => [...new Set([...v.matchAll(new RegExp(re.source, re.flags.replace("g", "") + "g"))].map((m) => m[0]))];
    for (const b of BANNED) {
      const hits = all(b.re);
      if (hits.length) err(file, `${where}: ${b.why} → ${hits.map((h) => `「${h}」`).join("")}`);
    }
    for (const b of WARN) {
      const hits = all(b.re);
      if (hits.length) warn(file, `${where}: ${b.why} → ${hits.map((h) => `「${h}」`).join("")}`);
    }
  }
  if (!a.title.includes(areaLabel) && !a.title.includes(REGIONS[region].name)) warn(file, `タイトルに地域名（${areaLabel}）が無い`);
  if (!a.title.includes(scene.name) && !scene.keywords.some((k) => a.title.includes(k))) warn(file, `タイトルにシーン名（${scene.name}）が無い`);
  const range = (where, v, lo, hi) => {
    if (v.length < lo || v.length > hi) warn(file, `${where} 文量 ${v.length}字（目安 ${lo}〜${hi}）`);
  };
  range("lede", a.lede, 150, 500);
  range("closing", a.closing, 150, 600);
  a.items.forEach((it, i) => isStr(it?.body) && range(`items[${i}].body`, it.body, 120, 600));

  if (errors.length === before) articles.push({ file, a, scene, region, town, areaLabel, kept });
}

// 同じ シーン×地域 の記事が複数ないか
{
  const bySA = new Map();
  for (const x of articles) {
    const k = `${x.a.scene}|${x.a.area}`;
    if (bySA.has(k)) err(x.file, `同じ シーン×地域 の記事が複数: ${bySA.get(k)} と ${x.file}`);
    bySA.set(k, x.file);
  }
}

// ---------------------------------------------------------------- 結果の表示（違反があれば止める）

if (warns.length) {
  console.log(`警告 ${warns.length}件`);
  for (const w of warns) console.log(`  warn  ${w.file}: ${w.msg}`);
}
if (errors.length) {
  console.error(`\n違反 ${errors.length}件。lib/sceneFeatures.ts は書き出していません。`);
  for (const e of errors) console.error(`  NG  ${e.file}: ${e.msg}`);
  process.exit(1);
}
if (articles.length === 0 && files.length === 0) console.log("out/ に記事 JSON が無いので、空の lib/sceneFeatures.ts を書き出します。");

// ---------------------------------------------------------------- 生成

articles.sort(
  (x, y) =>
    sceneIndex.get(x.a.scene) - sceneIndex.get(y.a.scene) || x.a.area.localeCompare(y.a.area) || x.a.id.localeCompare(y.a.id),
);

const features = [];
const articleMap = {};
const metaMap = {};

articles.forEach((x, idx) => {
  const { a, scene, region, town, areaLabel, kept, file } = x;
  const no = `SC-${String(idx + 1).padStart(2, "0")}`;

  const ranking = kept.map(({ it, store }, i) => {
    const imgs = [store.image, ...(store.heroImages || []), ...(store.gallery || [])]
      .filter((u, j, arr) => arr.indexOf(u) === j && isRealImage(u))
      .slice(0, 3);
    const specs = [
      ["住所", known(store.address)],
      ["最寄り駅", known(store.nearest)],
      ["営業時間", known(store.hours)],
      ["予算", known(store.budget)],
    ]
      .filter(([, v]) => v)
      .map(([k, v]) => ({ k, v }));
    const storeTown = T.parseTown(store.address, store.region)?.town;
    return {
      rank: `STORE ${String(i + 1).padStart(2, "0")}`,
      rankNum: i + 1,
      name: store.name,
      cuisine: store.cuisine || "",
      area: storeTown || store.area || "",
      heading: it.heading,
      desc: it.body,
      images: imgs,
      specs,
      href: `/restaurant/${store.id}`,
    };
  });

  const heroImage = ranking[0].images[0];
  const chars = [a.lede, a.closing, ...kept.map(({ it }) => it.body)].join("").length;
  const date = jstDate(statSync(path.join(OUT_DIR, file)).mtime);
  const sceneHub = { t: `${scene.name}の店を探す`, h: `/scene/${scene.slug}`, img: heroImage };
  const areaHub = {
    t: `${areaLabel}の店を探す`,
    h: town ? T.townHref(region, town) : `/region/${region}`,
    img: heroImage,
  };
  const related = articles
    .filter((y) => y.a.id !== a.id && (y.a.area === a.area || y.a.scene === a.scene))
    .slice(0, 2)
    .map((y) => ({
      t: y.a.title,
      h: `/feature/${encodeURIComponent(y.a.id)}`,
      img: y.kept[0].store.image,
    }));

  features.push({
    id: a.id,
    no,
    tag: scene.name,
    kicker: `${(REGIONS[region].nameEn || region).toUpperCase()} · ${SCENE_EN[scene.slug] || scene.slug.toUpperCase()}`,
    title: a.title,
    sub: a.subtitle,
    image: heroImage,
  });
  articleMap[a.id] = {
    id: a.id,
    no,
    articleType: "ranking",
    kicker: features[features.length - 1].kicker,
    title: a.title,
    titleHTML: escapeHtml(a.title),
    subtitle: a.subtitle,
    lede: a.lede,
    date,
    reading: `約${Math.max(1, Math.round(chars / 500))}分`,
    author: "マチノワ編集部",
    heroImage,
    ogImage: heroImage,
    ranking,
    sideArticles: [...related, sceneHub, areaHub],
    quote: "",
    quoteCite: "マチノワ編集部",
    closing: a.closing,
  };
  metaMap[a.id] = {
    scene: scene.slug,
    area: a.area,
    areaLabel,
    storeIds: kept.map(({ store }) => store.id),
    tags: a.tags,
  };
});

const out = `// 自動生成: node automation/scene-articles/emit.mjs（手で編集しない。再実行で上書きされる）
// 材料: automation/scene-articles/out/<記事ID>.json（ライターが書く）＋ lib/data.ts の店データ
// 利用シーン別の特集記事。lib/data.ts の FEATURES / FEATURE_ARTICLES / FEATURE_INDEXABLE_IDS に合流する。
import type { Feature, FeatureArticle } from "./regions";

/** 記事ごとの付帯情報: どのシーン（lib/scenes.ts の slug）×どの地域/街の記事か、載せた店 */
export type SceneFeatureMeta = {
  scene: string;
  /** "<region>"（地域）または "<region>/<街>"（街）。lib/townIntros.ts の鍵と同じ形 */
  area: string;
  areaLabel: string;
  storeIds: string[];
  tags?: string[];
};

export const SCENE_FEATURES: Feature[] = ${JSON.stringify(features, null, 2)};

export const SCENE_FEATURE_ARTICLES: Record<string, FeatureArticle> = ${JSON.stringify(articleMap, null, 2)};

export const SCENE_FEATURE_META: Record<string, SceneFeatureMeta> = ${JSON.stringify(metaMap, null, 2)};
`;

if (CHECK_ONLY) {
  console.log(`検査OK: ${articles.length}本（--check なので書き出していません）`);
} else {
  writeFileSync(TARGET, out);
  console.log(`書き出し: ${path.relative(ROOT, TARGET)}（${articles.length}本）`);
  for (const x of articles) console.log(`  ${x.a.id}  ${x.scene.name} × ${x.areaLabel}  ${x.kept.length}店`);
}
