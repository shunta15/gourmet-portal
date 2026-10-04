#!/usr/bin/env node
/**
 * 「公開スイッチ OFF のビルドが main と1バイトも変わらない」ことの検査。
 *
 * 前提: 同じ条件（環境変数なし）で、このブランチと origin/main を別ディレクトリ（git worktree）でビルド済み。
 *   git worktree add --detach ../gp-main-cmp origin/main && cp -cR node_modules ../gp-main-cmp/ && cp .env.local ../gp-main-cmp/
 *   （どちらも `npm run build`。PORTAL_LAUNCHED と VERCEL_ENV は未設定で）
 *
 * 使い方
 *   1) ビルド出力（.next/server/app）の比較
 *        node proto-portal/compare-off.mjs static --main ../gp-main-cmp [--portal .]
 *      - main にある全ての .html について、次を比べる（差があれば違反）
 *          title / meta（robots・canonical・og・twitter・description を含む）/ canonical / JSON-LD（パースして比較）/
 *          head のその他のタグ / stylesheet の中身（ファイルの内容のハッシュ）/ <script> を除いた body /
 *          .meta の status と headers
 *      - main の .body（robots.txt・sitemap.xml・アイコン・共有画像など）は全てバイト一致
 *      - このブランチにだけある .html は、全て 404（総合サイトのルート。.meta の status が 404）であること
 *      - このブランチにだけある .body は、全て 404（総合サイトの sitemap・search-index.json など）であること
 *      - 参考: <script src> の JS（gzip 後）の合計の差。--max-js-delta（既定 2048 バイト）を超えたら違反
 *
 *   2) 起動中のサーバーの応答の比較（動的なページ・404 の中身・ステータス）
 *        main を起動して:    node proto-portal/compare-off.mjs snapshot --base http://localhost:3242 --out main.json
 *        このブランチを起動して: node proto-portal/compare-off.mjs live --base http://localhost:3242 --against main.json
 *      - 同じ URL の一覧を取り、ステータス・title・meta・canonical・JSON-LD・script を除いた body を比べる。
 *      - 総合サイトの URL（/gourmet・/beauty・/map・/videos・/find・/og・/search-index.json・各 sitemap ほか）は
 *        main では 404。OFF のこのブランチも 404 で、404 ページの中身も同じであること。
 *      - 一覧は PATHS（このファイルの下）。足したいときはここに足す。
 *
 * 違反があれば終了コード 1。
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";

const argv = process.argv.slice(2);
const mode = argv[0];
const arg = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 ? argv[i + 1] : d;
};
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

// ───────────── 正規化 ─────────────
const sha = (b) => crypto.createHash("sha1").update(b).digest("hex").slice(0, 12);
const STATIC_RE = /\/_next\/static\/[^"'\s)<>]+/g;
const hashFree = (s) => s.replace(STATIC_RE, "/_next/static/*");

/** HTML を、比べる単位に分ける。script は丸ごと除く（JSON-LD は別にパースして取る） */
export function normalize(html) {
  const lds = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      lds.push(JSON.stringify(JSON.parse(m[1])));
    } catch {
      lds.push(`UNPARSABLE:${m[1].slice(0, 80)}`);
    }
  }
  const noScript = html.replace(/<script\b[\s\S]*?<\/script>/g, "");
  const headM = noScript.match(/<head>([\s\S]*?)<\/head>/);
  const head = headM ? headM[1] : "";
  const body = headM ? noScript.slice(noScript.indexOf("</head>") + 7) : noScript;
  const title = (head.match(/<title>([\s\S]*?)<\/title>/) || [])[1] ?? null;
  const metas = [...head.matchAll(/<meta\b[^>]*>/g)].map((m) => m[0]);
  const canonical = (head.match(/<link rel="canonical"[^>]*>/) || [])[0] ?? null;
  const robots = metas.find((m) => /name="robots"/.test(m)) ?? null;
  const cssHrefs = [...head.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="(\/_next\/static\/[^"]+\.css)"[^>]*>/g)].map((m) => m[1]);
  const scriptSrcs = [...html.matchAll(/<script\b[^>]*\ssrc="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]);
  const preloadJs = [...html.matchAll(/<link\b[^>]*rel="preload"[^>]*as="script"[^>]*href="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]);
  // head のその他: title・meta・canonical・stylesheet 以外
  const headRest = head
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<meta\b[^>]*>/g, "")
    .replace(/<link rel="canonical"[^>]*>/, "")
    .replace(/<link\b[^>]*rel="stylesheet"[^>]*href="\/_next\/static\/[^"]+\.css"[^>]*>/g, "");
  // head の要素は並び順だけがビルドのたびに入れ替わることがある（DB を読むページで、metadata と layout の head の順序が
  // 非決定的。main 同士を2回ビルドしても出る）。中身の比較は並び順を無視して行い、順序だけの差は別に数える。
  const tags = (x) => [...hashFree(x).matchAll(/<[^>]+>/g)].map((m) => m[0]);
  const restTags = tags(headRest);
  const metaTags = metas.map(hashFree);
  return {
    title,
    metas: [...metaTags].sort(),
    metasOrdered: metaTags,
    canonical,
    robots,
    lds,
    cssHrefs,
    scriptSrcs: [...new Set([...scriptSrcs, ...preloadJs])],
    headRest: [...restTags].sort().join(""),
    headRestOrdered: restTags.join(""),
    body: hashFree(body),
  };
}

/** head の並び順だけが違うものの印（diffNorm が立てる。違反には数えない） */
let orderOnly = false;

/** 2つの正規化結果の差を文で返す（CSS・JS は呼び出し側で別扱い） */
function diffNorm(a, b) {
  const out = [];
  orderOnly = false;
  if (a.title !== b.title) out.push(`title: ${JSON.stringify(a.title)} ≠ ${JSON.stringify(b.title)}`);
  if (a.canonical !== b.canonical) out.push(`canonical: ${a.canonical} ≠ ${b.canonical}`);
  if (a.robots !== b.robots) out.push(`robots: ${a.robots} ≠ ${b.robots}`);
  if (JSON.stringify(a.metas) !== JSON.stringify(b.metas)) {
    const sa = new Set(a.metas), sb = new Set(b.metas);
    const only = (x, y) => [...x].filter((v) => !y.has(v)).slice(0, 3);
    out.push(`meta: main だけ ${JSON.stringify(only(sa, sb))} / ブランチだけ ${JSON.stringify(only(sb, sa))}`);
  }
  if (JSON.stringify(a.lds) !== JSON.stringify(b.lds)) out.push(`JSON-LD: ${a.lds.length}件 ≠ ${b.lds.length}件 または中身が違う`);
  if (a.headRest !== b.headRest) out.push(`head のその他のタグ: 長さ ${a.headRest.length} ≠ ${b.headRest.length}`);
  if (!out.length && a.headRestOrdered + a.metasOrdered.join("") !== b.headRestOrdered + b.metasOrdered.join("")) orderOnly = true;
  if (a.body !== b.body) {
    let i = 0;
    while (i < a.body.length && a.body[i] === b.body[i]) i++;
    out.push(`body: 長さ ${a.body.length} ≠ ${b.body.length}（最初の差 @${i}: main「${a.body.slice(i, i + 50)}」/ ブランチ「${b.body.slice(i, i + 50)}」）`);
  }
  return out;
}

// ───────────── static ─────────────
function walk(root) {
  const out = [];
  const rec = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) rec(p);
      else out.push(path.relative(root, p));
    }
  };
  rec(root);
  return out;
}

function readMeta(root, rel) {
  const p = path.join(root, rel.replace(/\.(html|body)$/, "") + ".meta");
  // route handler は foo.body に対して foo.meta
  const p2 = path.join(root, rel.replace(/\.body$/, "") + ".meta");
  for (const q of [p, p2]) if (fs.existsSync(q)) return JSON.parse(fs.readFileSync(q, "utf8"));
  return null;
}

function cssContentHash(buildRoot, href) {
  const f = path.join(buildRoot, ".next", href.replace(/^\/_next\//, ""));
  return fs.existsSync(f) ? sha(fs.readFileSync(f)) : `MISSING:${href}`;
}
const jsGzipCache = new Map();
function jsBytes(buildRoot, srcs) {
  let total = 0;
  for (const s of srcs) {
    const f = path.join(buildRoot, ".next", s.replace(/^\/_next\//, ""));
    const key = f;
    if (!jsGzipCache.has(key)) jsGzipCache.set(key, fs.existsSync(f) ? zlib.gzipSync(fs.readFileSync(f)).length : 0);
    total += jsGzipCache.get(key);
  }
  return total;
}

function runStatic() {
  const mainRoot = path.resolve(arg("main", ""));
  const portalRoot = path.resolve(arg("portal", REPO));
  const maxJs = Number(arg("max-js-delta", "2048"));
  const M = path.join(mainRoot, ".next/server/app");
  const P = path.join(portalRoot, ".next/server/app");
  if (!arg("main") || !fs.existsSync(M) || !fs.existsSync(P)) {
    console.error(`.next/server/app が無い: main=${M} portal=${P}`);
    process.exit(2);
  }
  const mFiles = new Set(walk(M));
  const pFiles = new Set(walk(P));
  const bad = [];

  // ── html ──
  const mHtml = [...mFiles].filter((f) => f.endsWith(".html")).sort();
  const pHtml = new Set([...pFiles].filter((f) => f.endsWith(".html")));
  let same = 0;
  const jsRows = [];
  const orderOnlyPages = [];
  const tailwindScanPages = [];
  for (const f of mHtml) {
    if (!pHtml.has(f)) {
      bad.push(`ブランチに無い: ${f}`);
      continue;
    }
    const a = normalize(fs.readFileSync(path.join(M, f), "utf8"));
    const b = normalize(fs.readFileSync(path.join(P, f), "utf8"));
    const d = diffNorm(a, b);
    if (orderOnly) orderOnlyPages.push(f);
    // stylesheet は中身（内容ハッシュ）で比べる（チャンク名はビルドごとに変わりうる）
    const ca = a.cssHrefs.map((h) => cssContentHash(mainRoot, h)).sort().join(",");
    const cb = b.cssHrefs.map((h) => cssContentHash(portalRoot, h)).sort().join(",");
    if (ca !== cb) {
      // /admin・/owner だけは例外: Tailwind はリポジトリの全ソースを走査してユーティリティを作るので、新しいファイルに
      // 「ring」「static」などの語があるだけで、これらの管理画面の CSS に数百バイトのユーティリティ（.ring .static .resize）が増える。
      // 公開ページ（グルメ）の CSS はグローバル CSS のままで影響しない。
      if (/^(admin\/|owner\.html$)/.test(f)) tailwindScanPages.push(f);
      else d.push(`stylesheet の中身が違う（main ${a.cssHrefs.length}本 / ブランチ ${b.cssHrefs.length}本）`);
    }
    // .meta（status・headers）
    const ma = readMeta(M, f), mb = readMeta(P, f);
    if (JSON.stringify([ma?.status, ma?.headers]) !== JSON.stringify([mb?.status, mb?.headers])) d.push(`.meta の status/headers が違う`);
    jsRows.push({ f, a: jsBytes(mainRoot, a.scriptSrcs), b: jsBytes(portalRoot, b.scriptSrcs) });
    if (d.length) bad.push(`${f}\n    - ${d.join("\n    - ")}`);
    else same++;
  }

  // ── このブランチにだけある html は 404 ──
  const extraHtml = [...pHtml].filter((f) => !mFiles.has(f)).sort();
  for (const f of extraHtml) {
    const m = readMeta(P, f);
    if (m?.status !== 404) bad.push(`ブランチにだけある ${f} が 404 ではない（status ${m?.status}）`);
  }

  // ── .body（route handler・ファイル出力）──
  const mBody = [...mFiles].filter((f) => f.endsWith(".body")).sort();
  let sameBody = 0;
  for (const f of mBody) {
    if (!pFiles.has(f)) {
      bad.push(`ブランチに無い: ${f}`);
      continue;
    }
    const a = fs.readFileSync(path.join(M, f)), b = fs.readFileSync(path.join(P, f));
    const ma = readMeta(M, f), mb = readMeta(P, f);
    if (!a.equals(b)) bad.push(`${f} がバイト一致しない（main ${a.length}B / ブランチ ${b.length}B）`);
    else if (JSON.stringify(ma?.headers) !== JSON.stringify(mb?.headers) || ma?.status !== mb?.status) bad.push(`${f} の .meta が違う`);
    else sameBody++;
  }
  const extraBody = [...pFiles].filter((f) => f.endsWith(".body") && !mFiles.has(f)).sort();
  for (const f of extraBody) {
    const m = readMeta(P, f);
    if (m?.status !== 404) bad.push(`ブランチにだけある ${f} が 404 ではない（status ${m?.status}）`);
  }

  // ── JS ──
  const sample = jsRows.filter((r) => r.a > 0);
  const totA = sample.reduce((s, r) => s + r.a, 0), totB = sample.reduce((s, r) => s + r.b, 0);
  const worst = [...sample].sort((x, y) => y.b - y.a - (x.b - x.a))[0];
  const withDelta = sample.filter((r) => r.b !== r.a);
  console.log(`html（main）: ${mHtml.length} ページ → 差 0 のページ ${same} / 差ありのページ ${mHtml.length - same}`);
  console.log(`  （stylesheet だけ違う管理画面 ${tailwindScanPages.length} ページ: Tailwind の全ソース走査による数百バイトの増加。違反に数えない）`);
  console.log(`  （うち head の並び順だけが違うページ ${orderOnlyPages.length} 件は違反に数えない。main 同士の再ビルドでも同じ揺れが出る）`);
  console.log(`.body（main）: ${mBody.length} 件 → バイト一致 ${sameBody}`);
  console.log(`ブランチにだけある html: ${extraHtml.length} 件（全て 404 であること）: ${extraHtml.join(", ")}`);
  console.log(`ブランチにだけある .body: ${extraBody.length} 件（全て 404 であること）`);
  console.log(
    `JS（<script src> の gzip 合計）: ページあたりの差 最大 ${worst ? worst.b - worst.a : 0}B（${worst?.f}） / 差があるページ ${withDelta.length}/${sample.length}` +
      ` / 全ページ平均 main ${Math.round(totA / (sample.length || 1))}B → ブランチ ${Math.round(totB / (sample.length || 1))}B`,
  );
  if (worst && worst.b - worst.a > maxJs) bad.push(`JS の差が大きい: ${worst.f} で +${worst.b - worst.a}B（上限 ${maxJs}B）`);
  console.log(`\nPROBLEMS ${bad.length}`);
  for (const b of bad.slice(0, 40)) console.log(" - " + b);
  if (bad.length > 40) console.log(` … ほか ${bad.length - 40} 件`);
  process.exit(bad.length ? 1 : 0);
}

// ───────────── snapshot / live ─────────────
/** 取る URL の一覧。グルメの既存ページ（静的・動的）と、OFF では 404 になるはずの総合サイトの URL */
const GOURMET = [
  "/",
  "/about",
  "/contact",
  "/feature",
  "/region",
  "/region/tokyo",
  "/region/osaka",
  "/scene",
  "/scene/date",
  "/search",
  "/search?q=寿司",
  "/editorial/guidelines",
  "/restaurant/r01",
  "/restaurant/r21",
  "/restaurant/r23",
  "/restaurant/r204",
  "/restaurant/r299",
  "/restaurant/nosuch",
  "/feature/region/tokyo",
  "/region/osaka/大阪市北区",
  "/robots.txt",
  "/sitemap.xml",
  "/nazatu",
  "/videos/nazatu/1-1_thumb.jpg", // public/ のグルメの既存ファイル（/videos の 404 の書き換えに巻き込まれない）
  "/opengraph-image",
  "/icon",
  "/apple-icon",
  "/zzz-nosuch-page",
];
const PORTAL_404 = [
  "/gourmet",
  "/proto-sns", // 行動ボタンの見比べ（試作・非公開）
  "/beauty",
  "/beauty/hair",
  "/beauty/hair/tokyo",
  "/beauty/area/tokyo",
  "/beauty/scene/late-night",
  "/beauty/shop/abc",
  "/beauty/nosuch",
  "/bodycare",
  "/pet",
  "/leisure",
  "/stay",
  "/stay/hotel/okinawa",
  "/area/tokyo",
  "/area/nosuch",
  "/station",
  "/station/kyoto",
  "/station/kyoto/祇園四条",
  "/station/nosuch/駅",
  "/map",
  "/map?pref=kyoto",
  "/videos",
  "/videos/sv-nazatu-1",
  "/find",
  "/find?q=三宮",
  "/photos",
  "/photos?genre=ramen&pref=kyoto",
  "/photos/sitemap.xml",
  "/search-index.json",
  "/_portal/home-046f05f2-480.webp", // 事前生成した写真（public/_portal。OFF では 404）
  "/og/home",
  "/og/v/beauty",
  "/og/area/tokyo",
  "/og/station/kyoto/祇園四条",
  "/beauty/sitemap.xml",
  "/bodycare/sitemap.xml",
  "/pet/sitemap.xml",
  "/leisure/sitemap.xml",
  "/stay/sitemap.xml",
  "/station/sitemap.xml",
  "/videos/sitemap.xml",
];
const PATHS = [...GOURMET, ...PORTAL_404];

async function fetchOne(base, p) {
  const r = await fetch(base + encodeURI(p).replace(/%25/g, "%25"), { redirect: "manual" });
  const ct = r.headers.get("content-type") || "";
  const buf = Buffer.from(await r.arrayBuffer());
  const rec = { path: p, status: r.status, ct: ct.split(";")[0], location: r.headers.get("location") || null };
  if (/html/.test(ct)) rec.norm = normalize(buf.toString("utf8"));
  else rec.sha = sha(buf);
  return rec;
}

async function runSnapshot() {
  const base = arg("base", "http://localhost:3242");
  const out = arg("out", "off-snapshot.json");
  const recs = [];
  for (const p of PATHS) recs.push(await fetchOne(base, p));
  fs.writeFileSync(out, JSON.stringify(recs));
  console.log(`${recs.length} 件を ${out} に保存（${recs.filter((r) => r.status === 404).length} 件が 404）`);
}

async function runLive() {
  const base = arg("base", "http://localhost:3242");
  const snap = JSON.parse(fs.readFileSync(arg("against"), "utf8"));
  const bad = [];
  let same = 0;
  let n404 = 0;
  for (const a of snap) {
    const b = await fetchOne(base, a.path);
    const d = [];
    if (a.status !== b.status) d.push(`status ${a.status} ≠ ${b.status}`);
    if (a.ct !== b.ct) d.push(`content-type ${a.ct} ≠ ${b.ct}`);
    if (a.location !== b.location) d.push(`location ${a.location} ≠ ${b.location}`);
    if (a.norm && b.norm) {
      const na = a.norm, nb = b.norm;
      d.push(...diffNorm(na, nb));
    } else if (a.sha !== b.sha) d.push(`本文のハッシュが違う`);
    if (PORTAL_404.includes(a.path) && b.status !== 404) d.push(`OFF なのに 404 ではない（${b.status}）`);
    if (b.status === 404) n404++;
    if (d.length) bad.push(`${a.path}\n    - ${d.join("\n    - ")}`);
    else same++;
  }
  console.log(`URL ${snap.length} 件: 一致 ${same} / 差あり ${snap.length - same}（うち ${n404} 件が 404）`);
  console.log(`PROBLEMS ${bad.length}`);
  for (const b of bad.slice(0, 12)) console.log(" - " + (b.length > 700 ? b.slice(0, 700) + " …" : b));
  if (bad.length > 12) console.log(` … ほか ${bad.length - 12} 件`);
  process.exit(bad.length ? 1 : 0);
}

if (mode === "static") runStatic();
else if (mode === "snapshot") await runSnapshot();
else if (mode === "live") await runLive();
else {
  console.error("使い方: compare-off.mjs static --main DIR | snapshot --base URL --out FILE | live --base URL --against FILE");
  process.exit(2);
}
