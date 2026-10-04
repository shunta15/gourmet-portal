/**
 * 総合サイトの構造化データ（JSON-LD）の検査。
 *
 *   npm run build の後に:   node proto-portal/check-jsonld.mjs [--base http://localhost:3242]
 *
 * - ビルド出力（.next/server/app の総合サイトのページの HTML）の <script type="application/ld+json"> を全部パースする。
 *   対象: / ・ /area/** ・ /station/** ・ /videos/** ・ /map ・ /find ・ 新業種（/beauty /bodycare /pet /leisure /stay）の配下。
 *   グルメの既存ページ（/restaurant・/feature・/region など）は対象外。
 *   公開スイッチ ON のビルドを検査する（OFF のビルドの `/` はグルメのトップで、総合サイトの検査の対象外）。
 * - 動的なページ（/map・/videos・/find など。ビルドに HTML が無い）は、--base（起動中のサーバー）があるときだけそこから取って検査する。
 * - 型ごとの必須プロパティ:
 *     BreadcrumbList : itemListElement[] の position（1 から連番）・name・item（絶対URL）
 *     ItemList       : itemListElement[] の position と url または item（絶対URL）
 *     Organization / WebSite : name と url（絶対URL）
 *     VideoObject    : name・description・thumbnailUrl（絶対URL）・uploadDate（ISO 8601）
 *     LocalBusiness 系（HairSalon・Hotel・Museum など）: name と address
 *     Article        : headline と author.name
 * - ページ単位の検査: 総合トップ以外は BreadcrumbList が1つあり、最後の項目の URL が canonical と一致する。
 * 違反があれば終了コード 1。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const APP = path.join(ROOT, ".next/server/app");
const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "");
const SITE = "https://machinowa.tokyo";

const PORTAL_FIRST = new Set(["area", "station", "videos", "map", "beauty", "bodycare", "pet", "leisure", "stay"]);
const LOCAL_BUSINESS = new Set([
  "LocalBusiness", "Restaurant", "HairSalon", "NailSalon", "BeautySalon", "DaySpa", "HealthAndBeautyBusiness",
  "VeterinaryCare", "PetStore", "Museum", "AmusementPark", "Park", "TouristAttraction", "Hotel", "Hostel",
  "Campground", "LodgingBusiness",
]);
const KNOWN = new Set(["BreadcrumbList", "ItemList", "Organization", "WebSite", "VideoObject", "Article", ...LOCAL_BUSINESS]);

const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const isAbsUrl = (v) => {
  if (!isStr(v)) return false;
  try {
    const u = new URL(v);
    return (u.protocol === "https:" || u.protocol === "http:") && !/^(localhost|127\.)/.test(u.hostname);
  } catch {
    return false;
  }
};
const isIsoDate = (v) => isStr(v) && /^\d{4}-\d{2}-\d{2}([T ][\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/.test(v) && !Number.isNaN(Date.parse(v));
const urlOf = (v) => (isStr(v) ? v : v && typeof v === "object" ? v.url ?? v["@id"] : undefined);

/** 1つの JSON-LD ノードを検査して、違反の文言を返す */
function checkNode(node, where) {
  const errs = [];
  const types = [].concat(node["@type"] ?? []);
  if (types.length === 0) return [`${where}: @type が無い`];
  if (!isStr(node["@context"]) && !node.__nested) errs.push(`${where}: @context が無い`);
  for (const t of types) {
    if (!KNOWN.has(t)) {
      errs.push(`${where}: 想定外の @type ${t}`);
      continue;
    }
    if (t === "BreadcrumbList") {
      const list = node.itemListElement;
      if (!Array.isArray(list) || list.length === 0) errs.push(`${where}: BreadcrumbList の itemListElement が空`);
      else
        list.forEach((it, i) => {
          if (it["@type"] !== "ListItem") errs.push(`${where}: Breadcrumb[${i}] の @type が ListItem でない`);
          if (it.position !== i + 1) errs.push(`${where}: Breadcrumb[${i}] の position が ${it.position}（${i + 1} であるべき）`);
          if (!isStr(it.name)) errs.push(`${where}: Breadcrumb[${i}] の name が無い`);
          if (!isAbsUrl(urlOf(it.item))) errs.push(`${where}: Breadcrumb[${i}] の item が絶対URLでない（${JSON.stringify(it.item)}）`);
        });
    } else if (t === "ItemList") {
      const list = node.itemListElement;
      if (!Array.isArray(list) || list.length === 0) errs.push(`${where}: ItemList の itemListElement が空`);
      else
        list.forEach((it, i) => {
          if (!Number.isInteger(it.position)) errs.push(`${where}: ItemList[${i}] の position が整数でない`);
          else if (it.position !== i + 1) errs.push(`${where}: ItemList[${i}] の position が ${it.position}（${i + 1} であるべき）`);
          const u = it.url ?? urlOf(it.item);
          if (!isAbsUrl(u)) errs.push(`${where}: ItemList[${i}] の url / item が絶対URLでない（${JSON.stringify(u)}）`);
        });
    } else if (t === "Organization" || t === "WebSite") {
      if (!isStr(node.name)) errs.push(`${where}: ${t} の name が無い`);
      if (!isAbsUrl(node.url)) errs.push(`${where}: ${t} の url が絶対URLでない`);
    } else if (t === "VideoObject") {
      if (!isStr(node.name)) errs.push(`${where}: VideoObject の name が無い`);
      if (!isStr(node.description)) errs.push(`${where}: VideoObject の description が無い`);
      const th = [].concat(node.thumbnailUrl ?? []);
      if (th.length === 0 || !th.every(isAbsUrl)) errs.push(`${where}: VideoObject の thumbnailUrl が無い／絶対URLでない`);
      if (!isIsoDate(node.uploadDate)) errs.push(`${where}: VideoObject の uploadDate が ISO 8601 でない（${node.uploadDate}）`);
      if (!isAbsUrl(node.embedUrl) && !isAbsUrl(node.contentUrl)) errs.push(`${where}: VideoObject に embedUrl / contentUrl が無い`);
    } else if (LOCAL_BUSINESS.has(t)) {
      if (!isStr(node.name)) errs.push(`${where}: ${t} の name が無い`);
      const a = node.address;
      if (!(isStr(a) || (a && typeof a === "object" && (isStr(a.streetAddress) || isStr(a.addressLocality) || isStr(a.addressRegion))))) {
        errs.push(`${where}: ${t} の address が無い`);
      }
    } else if (t === "Article") {
      if (!isStr(node.headline)) errs.push(`${where}: Article の headline が無い`);
      if (!isStr(node.author?.name)) errs.push(`${where}: Article の author.name が無い`);
    }
  }
  return errs;
}

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name.startsWith("[") || e.name.startsWith("_")) continue;
      yield* walk(p);
    } else if (e.name.endsWith(".html")) yield p;
  }
}

/** HTML ファイルのパス → URL パス */
function urlPathOf(file) {
  let rel = path.relative(APP, file).replace(/\.html$/, "");
  if (rel === "index") return "/";
  return "/" + rel.split(path.sep).join("/");
}

const pages = [];
if (!fs.existsSync(APP)) {
  console.error("ビルド出力（.next/server/app）が無い。先に npm run build を実行してください。");
  process.exit(2);
}
/** その HTML の .meta の status が 200（または .meta が無い）か。next start で 404 を踏むと 404 の HTML がキャッシュされるので除く用 */
function is200(f) {
  try {
    const meta = JSON.parse(fs.readFileSync(f.replace(/\.html$/, ".meta"), "utf8"));
    return !(meta.status && meta.status !== 200);
  } catch {
    return true;
  }
}
// 公開スイッチ ON のとき、総合トップの実体は /portal-home（`/` は next.config.ts の rewrites で来る）。
// そのとき index.html はグルメのトップ（`/` として出ない）なので検査しない。OFF のときは portal-home.html が 404 なので index.html がグルメのトップ。
const portalHomeFile = path.join(APP, "portal-home.html");
const portalLive = fs.existsSync(portalHomeFile) && is200(portalHomeFile);
for (const f of walk(APP)) {
  let u = urlPathOf(f);
  if (u === "/portal-home") u = "/";
  else if (u === "/" && portalLive) continue;
  const first = u.split("/")[1];
  if (u !== "/" && !PORTAL_FIRST.has(first)) continue;
  // next start で 404 を踏むと .next に 404 の HTML がキャッシュされる。ビルドの成果物ではないので除く（.meta の status が 200 でないもの）
  try {
    const meta = JSON.parse(fs.readFileSync(f.replace(/\.html$/, ".meta"), "utf8"));
    if (meta.status && meta.status !== 200) continue;
  } catch {
    /* .meta が無ければそのまま検査する */
  }
  pages.push({ url: u, html: fs.readFileSync(f, "utf8"), from: "build" });
}
const builtSet = new Set(pages.map((p) => p.url));
const dynamicSkipped = [];
for (const u of ["/map", "/map?pref=kyoto", "/videos", "/videos?v=gourmet", "/find", "/find?q=三宮", "/find?q=京都"]) {
  if (builtSet.has(u.split("?")[0])) continue;
  if (!BASE) {
    dynamicSkipped.push(u);
    continue;
  }
  const r = await fetch(BASE + encodeURI(u));
  if (r.status === 200) pages.push({ url: u, html: await r.text(), from: "server" });
  else dynamicSkipped.push(`${u}（${r.status}）`);
}

const counts = {};
const violations = [];
let blocks = 0;
for (const pg of pages) {
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  const nodes = [];
  for (const m of pg.html.matchAll(re)) {
    blocks++;
    let json;
    try {
      json = JSON.parse(m[1]);
    } catch (e) {
      violations.push(`${pg.url}: JSON としてパースできない（${e.message}）`);
      continue;
    }
    for (const n of [].concat(json["@graph"] ?? json)) nodes.push(n);
  }
  for (const n of nodes) {
    for (const t of [].concat(n["@type"] ?? ["(なし)"])) counts[t] = (counts[t] ?? 0) + 1;
    for (const e of checkNode(n, pg.url)) violations.push(e);
  }
  // ページ単位
  const isHome = pg.url === "/";
  const bcs = nodes.filter((n) => [].concat(n["@type"]).includes("BreadcrumbList"));
  if (!isHome && bcs.length !== 1) violations.push(`${pg.url}: BreadcrumbList が ${bcs.length} 個（1 個であるべき）`);
  const canon = (pg.html.match(/<link rel="canonical" href="([^"]*)"/) ?? [])[1];
  if (bcs[0] && canon) {
    const last = bcs[0].itemListElement?.at(-1);
    const dec = (s) => {
      try {
        return decodeURI(String(s));
      } catch {
        return String(s);
      }
    };
    if (last && dec(urlOf(last.item)) !== dec(canon)) violations.push(`${pg.url}: パンくずの最後の URL（${urlOf(last.item)}）が canonical（${canon}）と違う`);
  }
  if (!isHome && !canon) violations.push(`${pg.url}: canonical が無い`);
  for (const t of ["Organization", "WebSite"]) {
    const n = nodes.filter((x) => [].concat(x["@type"]).includes(t)).length;
    if (n !== 1) violations.push(`${pg.url}: ${t} が ${n} 個（1 個であるべき）`);
  }
}

console.log(`検査したページ: ${pages.length}（ビルド出力 ${pages.filter((p) => p.from === "build").length}・サーバー ${pages.filter((p) => p.from === "server").length}）`);
if (dynamicSkipped.length) console.log(`検査できなかった動的ページ（--base 未指定または非200）: ${dynamicSkipped.join(", ")}`);
console.log(`JSON-LD ブロック: ${blocks}`);
console.log(`型ごとの数: ${Object.entries(counts).sort().map(([k, v]) => `${k}=${v}`).join("  ")}`);
console.log(`違反: ${violations.length}`);
for (const v of violations.slice(0, 40)) console.log("  " + v);
if (violations.length > 40) console.log(`  …ほか ${violations.length - 40} 件`);
process.exit(violations.length ? 1 : 0);
