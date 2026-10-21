#!/usr/bin/env node
/**
 * pet-free-images.mjs — Wikimedia Commons からフリー素材を探し、目で確かめ、枠に合わせて切り抜く道具。
 * ペット試作(public/_portal/petproto/decided/)の「店舗以外の画像」を、許諾の明確な写真に差し替えるために使う。
 *
 * 許諾: 使ってよいのは CC0 / パブリックドメイン(PD-*) / CC BY(1.0〜4.0) だけ(tier "free")。
 *       CC BY-SA(1.0〜4.0)は、それ以外で見つからない枠に限って可(tier "by-sa"。get で --credit を付けるときは --note に理由が必須)。
 *       NC・ND・GFDL のみ・Fair use・許諾不明は不可(tier "no"。search には出ない。get は止まる)。
 *       許諾は imageinfo の extmetadata(License / LicenseShortName / LicenseUrl / Artist / Credit)で機械的に判定する。
 *
 * サブコマンド:
 *   search "<英語の検索語>" [--limit 15] [--minw 1200] [--orient landscape|portrait|any] [--offset 0] [--no-sa] [--out <json>]
 *       Commons の検索(generator=search, namespace 6, filetype:bitmap)→ imageinfo で許諾・寸法・mime を確かめ、
 *       基準を満たすものだけを JSON 配列で標準出力に出す(--out を付けると同じものをファイルにも書く)。
 *       mime は image/jpeg・image/png・image/webp だけ(SVG・GIF・TIFF は除く)。tier "free" を先に並べる。
 *   sheet <候補JSON> --out <jpg> [--cols 4]
 *       候補の thumb640 を並べ、番号・寸法・許諾を書き込んだ一覧画像を作る(候補を目で見るため)。
 *   get "File:…" --out <出力.webp> --w <W> --h <H> [--focus <cx>,<cy>] [--credit <credits.json> --page <page> --slot <slot> --note "<文>"]
 *       原寸(幅 2000px 超なら 2000px のサムネイル。切り抜きが足りないときはもっと大きく)を取り、
 *       W:H の比で焦点(0〜1、既定 0.5,0.5)を中心に切り抜き、W×H の webp(品質 82)で保存する。
 *       元の画素が出力より小さければエラーで止まる(引き伸ばし禁止)。
 *       --credit を付けると出典の記録を配列に追記する(同じ page+slot は上書き)。
 *       [--slots <slots.json> --key <page/slot>] を付けると、枠の一覧から --out/--w/--h/--page/--slot を埋める(--out は上書き可)。
 *
 * 例:
 *   node scripts/pet-free-images.mjs search "shiba inu running grass" --limit 15 --minw 1200 --orient landscape --out /tmp/x.json
 *   node scripts/pet-free-images.mjs sheet /tmp/x.json --out /tmp/x.jpg
 *   node scripts/pet-free-images.mjs get "File:Shiba inu running.jpg" --out public/_portal/petproto/decided/top/cat-3.webp --w 405 --h 291 --focus 0.5,0.55 \
 *        --credit public/_portal/petproto/decided/credits.json --page top --slot cat-3 --note "芝生を走る柴犬"
 *
 * Commons API の呼び出し(画像の取得も含む)は 300ms 以上あける。429/503 は待って再試行。UA は scripts/resolve-commons-images.mjs と同じ。
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const require = createRequire(import.meta.url);
const sharp = require(path.join(ROOT, "node_modules/sharp"));

const API = "https://commons.wikimedia.org/w/api.php";
const UA = "MachinowaBot/1.0 (https://machinowa.tokyo; editorial use, Wikimedia Commons images)";
const GAP_MS = 300;
const MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const WEBP_QUALITY = 82;
const THUMB_BIG = 2000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ───── 引数 ─────
function parseArgs(argv) {
  const pos = [];
  const opt = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) opt[k] = true;
      else {
        opt[k] = next;
        i++;
      }
    } else pos.push(a);
  }
  return { pos, opt };
}

function die(msg, code = 1) {
  process.stderr.write(`✗ ${msg}\n`);
  process.exit(code);
}

// ───── HTTP(間隔 300ms・429/503 再試行・UA 固定) ─────
let lastCall = 0;
async function throttle() {
  const wait = lastCall + GAP_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
}

async function request(url, init = {}) {
  let lastErr = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    await throttle();
    let res;
    try {
      res = await fetch(url, { ...init, headers: { "User-Agent": UA, ...(init.headers || {}) } });
    } catch (e) {
      lastErr = e;
      await sleep(1000 * (attempt + 1));
      continue;
    }
    if (res.status === 429 || res.status === 503) {
      const ra = Number(res.headers.get("retry-after"));
      await sleep(ra > 0 && ra < 120 ? ra * 1000 : 2000 * (attempt + 1));
      continue;
    }
    return res;
  }
  throw new Error(`取得に失敗(再試行の上限): ${url}${lastErr ? ` (${lastErr.message})` : ""}`);
}

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  const res = await request(url);
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`);
  const j = await res.json();
  if (j.error) throw new Error(`API error ${j.error.code}: ${j.error.info}`);
  return j;
}

async function download(url) {
  const res = await request(url);
  if (!res.ok) throw new Error(`画像の取得 ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

// ───── 文字 ─────
function stripHtml(s) {
  return String(s || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function escXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ───── 許諾の判定(extmetadata を機械的に読む。推測しない) ─────
const VER = "(1\\.0|2\\.0|2\\.1|2\\.5|3\\.0|4\\.0)";
function classifyLicense(ext = {}) {
  const v = (k) => (ext[k] && ext[k].value != null ? String(ext[k].value).trim() : "");
  const lic = v("License").toLowerCase(); // 例 cc-by-sa-4.0 / cc0 / pd / cc-by-2.0
  const short = v("LicenseShortName"); // 例 CC BY-SA 4.0 / CC0 / Public domain
  const s = short.toLowerCase();
  const url = v("LicenseUrl");
  const no = (why) => ({ tier: "no", license: short || lic || "(許諾不明)", licenseUrl: url, why });

  if (!lic && !short) return no("許諾の記載なし");
  if (/(^|[-\s])(nc|nd)([-\s]|$)/.test(lic) || /\b(nc|nd)\b/.test(s) || /non-?commercial|no ?derivative/i.test(short)) return no("NC/ND");
  if (/fair use|fair-use/i.test(short) || /fair/.test(lic)) return no("Fair use");

  if (lic === "cc0" || /^cc0\b/.test(s) || /creative commons zero/i.test(short)) {
    return { tier: "free", license: short || "CC0 1.0", licenseUrl: url || "https://creativecommons.org/publicdomain/zero/1.0/" };
  }
  if (/^pd(\b|-|$)/.test(lic) || /^public domain/i.test(short) || /^pd(\b|-)/i.test(short) || /^no restrictions/i.test(short)) {
    return { tier: "free", license: short || "Public domain", licenseUrl: url };
  }
  let m = new RegExp(`^cc-by-${VER}(-[a-z]{2,3}(-[a-z]{2,3})?)?$`).exec(lic);
  if (m) return { tier: "free", license: short || `CC BY ${m[1]}`, licenseUrl: url || `https://creativecommons.org/licenses/by/${m[1]}/` };
  m = new RegExp(`^cc-by-sa-${VER}(-[a-z]{2,3}(-[a-z]{2,3})?)?$`).exec(lic);
  if (m) return { tier: "by-sa", license: short || `CC BY-SA ${m[1]}`, licenseUrl: url || `https://creativecommons.org/licenses/by-sa/${m[1]}/` };
  // License が無く LicenseShortName だけのとき
  m = new RegExp(`^cc by ${VER}`).exec(s);
  if (m && !/sa/.test(s)) return { tier: "free", license: short, licenseUrl: url || `https://creativecommons.org/licenses/by/${m[1]}/` };
  m = new RegExp(`^cc by-sa ${VER}`).exec(s);
  if (m) return { tier: "by-sa", license: short, licenseUrl: url || `https://creativecommons.org/licenses/by-sa/${m[1]}/` };
  return no(`対象外の許諾(${short || lic})`);
}

// API が付ける ?utm_source=… を落とす(記録を素の URL にする)
const cleanUrl = (u) => String(u || "").replace(/\?utm_[^#]*$/, "");

function describe(page) {
  const ii = page.imageinfo && page.imageinfo[0];
  if (!ii) return null;
  const ext = ii.extmetadata || {};
  const lic = classifyLicense(ext);
  return {
    title: page.title,
    pageUrl: cleanUrl(ii.descriptionurl) || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
    width: ii.width,
    height: ii.height,
    mime: ii.mime,
    tier: lic.tier,
    license: lic.license,
    licenseUrl: lic.licenseUrl || "",
    licenseWhy: lic.why,
    artist: stripHtml(ext.Artist && ext.Artist.value),
    credit: stripHtml(ext.Credit && ext.Credit.value),
    thumb640: cleanUrl(ii.thumburl),
    original: cleanUrl(ii.url),
  };
}

// ───── search ─────
async function cmdSearch(pos, opt) {
  const q = pos[0];
  if (!q) die('search "<英語の検索語>" が要る');
  const limit = Math.max(1, Number(opt.limit || 15));
  const minw = Math.max(0, Number(opt.minw || 1200));
  const orient = String(opt.orient || "any");
  const offset = Math.max(0, Number(opt.offset || 0));
  if (!["landscape", "portrait", "any"].includes(orient)) die("--orient は landscape|portrait|any");
  const gsrlimit = Math.min(50, Math.max(limit * 3, 20));

  const j = await api({
    action: "query",
    generator: "search",
    gsrsearch: `${q} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: String(gsrlimit),
    gsroffset: String(offset),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata|mime",
    iiurlwidth: "640",
    iiextmetadatafilter: "License|LicenseShortName|LicenseUrl|Artist|Credit|UsageTerms",
  });
  const pages = (j.query && j.query.pages) || [];
  pages.sort((a, b) => (a.index || 0) - (b.index || 0));
  const stat = { hits: pages.length, mime: 0, size: 0, orient: 0, license: 0, sa: 0, ok: 0 };
  const out = [];
  for (const p of pages) {
    const d = describe(p);
    if (!d) continue;
    if (!MIMES.has(d.mime)) {
      stat.mime++;
      continue;
    }
    if (!(d.width >= minw)) {
      stat.size++;
      continue;
    }
    if (orient === "landscape" && !(d.width > d.height * 1.1)) {
      stat.orient++;
      continue;
    }
    if (orient === "portrait" && !(d.height > d.width * 1.1)) {
      stat.orient++;
      continue;
    }
    if (d.tier === "no") {
      stat.license++;
      continue;
    }
    if (d.tier === "by-sa") {
      stat.sa++;
      if (opt["no-sa"]) continue;
    }
    delete d.licenseWhy;
    out.push(d);
  }
  out.sort((a, b) => (a.tier === b.tier ? 0 : a.tier === "free" ? -1 : 1));
  const result = out.slice(0, limit);
  stat.ok = result.length;
  process.stderr.write(`検索 "${q}" (offset ${offset}): API ${stat.hits} 件 → mime外 ${stat.mime} / 小さい(<${minw}) ${stat.size} / 向き ${stat.orient} / 許諾不可 ${stat.license} 件を除外 → ${out.length} 件(うち BY-SA ${stat.sa})。出力 ${result.length} 件(free ${result.filter((x) => x.tier === "free").length} / by-sa ${result.filter((x) => x.tier === "by-sa").length})\n`);
  const text = JSON.stringify(result, null, 2);
  if (opt.out) {
    fs.mkdirSync(path.dirname(path.resolve(opt.out)), { recursive: true });
    fs.writeFileSync(opt.out, text + "\n");
    process.stderr.write(`書き出し: ${opt.out}\n`);
  }
  process.stdout.write(text + "\n");
}

// ───── sheet ─────
async function cmdSheet(pos, opt) {
  const src = pos[0];
  if (!src) die("sheet <候補JSON> --out <jpg> が要る");
  if (!opt.out) die("--out <jpg> が要る");
  const items = JSON.parse(fs.readFileSync(src, "utf8"));
  if (!Array.isArray(items) || !items.length) die("候補が空");
  const cols = Math.max(1, Number(opt.cols || 4));
  const CW = 420, CH = 300, LH = 64, PAD = 8;
  const cellW = CW + PAD * 2, cellH = CH + LH + PAD * 2;
  const rows = Math.ceil(items.length / cols);
  const W = cellW * cols, H = cellH * rows;
  const comps = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const x0 = (i % cols) * cellW + PAD, y0 = Math.floor(i / cols) * cellH + PAD;
    let thumb = null;
    try {
      const buf = await download(it.thumb640 || it.original);
      thumb = await sharp(buf).rotate().resize(CW, CH, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer({ resolveWithObject: true });
    } catch (e) {
      process.stderr.write(`  #${i} サムネイル取得失敗: ${e.message}\n`);
    }
    if (thumb) {
      comps.push({ input: thumb.data, left: x0 + Math.floor((CW - thumb.info.width) / 2), top: y0 + Math.floor((CH - thumb.info.height) / 2) });
    }
    const bg = it.tier === "free" ? "#dff3e3" : it.tier === "by-sa" ? "#fde8c3" : "#f3d4d4";
    const l1 = `#${i}  ${it.width}×${it.height}  ${it.license}${it.tier === "by-sa" ? "  [BY-SA: 他に無いときだけ]" : ""}`;
    const t = String(it.title || "").replace(/^File:/, "");
    const l2 = t.length > 52 ? t.slice(0, 51) + "…" : t;
    const l3 = (it.artist || "").length > 52 ? it.artist.slice(0, 51) + "…" : it.artist || "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${LH}">
      <rect width="${CW}" height="${LH}" fill="${bg}"/>
      <text x="6" y="17" font-family="Helvetica, Arial, 'Hiragino Sans', sans-serif" font-size="14" font-weight="bold" fill="#222">${escXml(l1)}</text>
      <text x="6" y="36" font-family="Helvetica, Arial, 'Hiragino Sans', sans-serif" font-size="12" fill="#333">${escXml(l2)}</text>
      <text x="6" y="54" font-family="Helvetica, Arial, 'Hiragino Sans', sans-serif" font-size="11" fill="#555">${escXml(l3)}</text>
    </svg>`;
    comps.push({ input: Buffer.from(svg), left: x0, top: y0 + CH });
    process.stderr.write(`  #${i} ${it.width}×${it.height} ${it.license} ${t}\n`);
  }
  fs.mkdirSync(path.dirname(path.resolve(opt.out)), { recursive: true });
  await sharp({ create: { width: W, height: H, channels: 3, background: "#ffffff" } })
    .composite(comps)
    .jpeg({ quality: 86 })
    .toFile(opt.out);
  process.stderr.write(`一覧画像: ${opt.out} (${W}×${H}, ${items.length} 件, ${cols} 列)\n`);
  process.stdout.write(JSON.stringify({ out: opt.out, count: items.length, width: W, height: H }) + "\n");
}

// ───── get ─────
function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

async function cmdGet(pos, opt) {
  let title = pos[0];
  if (!title) die('get "File:…" が要る');
  if (!/^file:/i.test(title)) title = `File:${title}`;
  title = title.replace(/_/g, " ");

  // --slots/--key で枠の一覧から埋める
  let page = opt.page, slot = opt.slot;
  if (opt.slots) {
    if (!opt.key) die("--slots には --key <page/slot> が要る");
    const slots = JSON.parse(fs.readFileSync(opt.slots, "utf8"));
    const s = (Array.isArray(slots) ? slots : slots.slots || []).find((x) => x.key === opt.key);
    if (!s) die(`--key ${opt.key} が ${opt.slots} に無い`);
    opt.w = opt.w || s.outW;
    opt.h = opt.h || s.outH;
    opt.out = opt.out || s.file;
    page = page || s.page;
    slot = slot || opt.key.split("/").slice(1).join("/");
  }
  const W = Math.round(Number(opt.w)), H = Math.round(Number(opt.h));
  if (!(W > 0 && H > 0)) die("--w と --h(正の整数)が要る");
  if (!opt.out) die("--out <出力.webp> が要る");
  const [fx0, fy0] = String(opt.focus || "0.5,0.5").split(",").map(Number);
  const fx = clamp(Number.isFinite(fx0) ? fx0 : 0.5, 0, 1), fy = clamp(Number.isFinite(fy0) ? fy0 : 0.5, 0, 1);
  if (opt.credit && (!page || !slot)) die("--credit には --page と --slot が要る(または --slots/--key)");

  // 1) imageinfo(許諾・寸法・mime)
  const j = await api({ action: "query", titles: title, prop: "imageinfo", iiprop: "url|size|mime|extmetadata", iiextmetadatafilter: "License|LicenseShortName|LicenseUrl|Artist|Credit|UsageTerms" });
  const p = j.query && j.query.pages && j.query.pages[0];
  if (!p || p.missing) die(`Commons に無い: ${title}`);
  const d = describe(p);
  if (!d) die(`imageinfo が無い: ${title}`);
  if (!MIMES.has(d.mime)) die(`mime が対象外(${d.mime}): ${title}`);
  if (d.tier === "no") die(`許諾が不可(${d.license}${d.licenseWhy ? ` / ${d.licenseWhy}` : ""}): ${title}`);
  if (d.tier === "by-sa" && opt.credit && !(typeof opt.note === "string" && opt.note.trim())) die(`CC BY-SA は、それ以外で見つからない枠に限って可。--note に理由を書く: ${title}`);

  // 2) 切り抜きの割合(元の寸法で)。引き伸ばしは不可
  const r = W / H;
  const srcW = d.width, srcH = d.height;
  const cropW0 = Math.min(srcW, srcH * r), cropH0 = cropW0 / r;
  if (cropW0 < W || cropH0 < H) die(`元が小さい(引き伸ばし禁止): 元 ${srcW}×${srcH} から ${W}×${H}(比 ${r.toFixed(3)})は切り抜けない(切り抜き可能 ${Math.floor(cropW0)}×${Math.floor(cropH0)}): ${title}`);
  const fracW = cropW0 / srcW;
  const need = Math.ceil(W / fracW) + 2; // 切り抜き後に W 以上残るために要る元の幅

  // 3) 取得する大きさ(2000px 超なら 2000px のサムネイル。足りなければもっと大きく)
  let url = d.original, fetchedW = srcW;
  if (srcW > THUMB_BIG) {
    fetchedW = Math.min(srcW, Math.max(THUMB_BIG, need));
    if (fetchedW < srcW) {
      const j2 = await api({ action: "query", titles: title, prop: "imageinfo", iiprop: "url", iiurlwidth: String(fetchedW) });
      const ii2 = j2.query && j2.query.pages && j2.query.pages[0] && j2.query.pages[0].imageinfo && j2.query.pages[0].imageinfo[0];
      if (!ii2 || !ii2.thumburl) die(`サムネイル URL が取れない: ${title}`);
      url = cleanUrl(ii2.thumburl);
      fetchedW = ii2.thumbwidth || fetchedW;
    } else url = d.original;
  }
  process.stderr.write(`取得: ${url} (元 ${srcW}×${srcH} / 頼んだ幅 ${fetchedW})\n`);
  const raw = await download(url);
  const buf = await sharp(raw, { limitInputPixels: false }).rotate().toBuffer();
  const meta = await sharp(buf).metadata();
  const aw = meta.width, ah = meta.height;
  fetchedW = aw; // Commons は頼んだ幅と違う既定の幅(例 3840px)を返すことがあるので、実際の幅を記録する
  process.stderr.write(`取得した画像: ${aw}×${ah}\n`);

  // 4) 切り抜き(焦点を中心に。はみ出すときはずらす)
  let cw = Math.floor(Math.min(aw, ah * r));
  let ch = Math.floor(cw / r);
  if (ch > ah) {
    ch = ah;
    cw = Math.floor(ch * r);
  }
  if (cw < W || ch < H) die(`取得した画像が小さい(引き伸ばし禁止): ${aw}×${ah} → 切り抜き ${cw}×${ch} < ${W}×${H}: ${title}`);
  const left = clamp(Math.round(fx * aw - cw / 2), 0, aw - cw);
  const top = clamp(Math.round(fy * ah - ch / 2), 0, ah - ch);
  fs.mkdirSync(path.dirname(path.resolve(opt.out)), { recursive: true });
  await sharp(buf).extract({ left, top, width: cw, height: ch }).resize(W, H, { fit: "fill" }).webp({ quality: WEBP_QUALITY }).toFile(opt.out);
  const outMeta = await sharp(opt.out).metadata();

  // 5) 出典の記録
  const record = {
    page: page || "",
    file: path.resolve(opt.out),
    slot: slot || "",
    commonsTitle: d.title,
    pageUrl: d.pageUrl,
    author: d.artist,
    license: d.license,
    licenseUrl: d.licenseUrl,
    originalUrl: d.original,
    srcW,
    srcH,
    outW: outMeta.width,
    outH: outMeta.height,
    note: typeof opt.note === "string" ? opt.note : "",
    crop: { fetchedW, left, top, width: cw, height: ch, focus: [fx, fy] },
    tier: d.tier,
    credit: d.credit,
  };
  if (opt.credit) {
    let arr = [];
    if (fs.existsSync(opt.credit)) {
      try {
        arr = JSON.parse(fs.readFileSync(opt.credit, "utf8"));
      } catch {
        die(`${opt.credit} が JSON として読めない`);
      }
      if (!Array.isArray(arr)) die(`${opt.credit} は配列であるべき`);
    }
    arr = arr.filter((x) => !(x.page === record.page && x.slot === record.slot));
    arr.push(record);
    arr.sort((a, b) => (a.page + "/" + a.slot).localeCompare(b.page + "/" + b.slot));
    fs.mkdirSync(path.dirname(path.resolve(opt.credit)), { recursive: true });
    fs.writeFileSync(opt.credit, JSON.stringify(arr, null, 2) + "\n");
    process.stderr.write(`出典を記録: ${opt.credit} (${record.page}/${record.slot})\n`);
  }
  process.stderr.write(`✓ ${opt.out} ${outMeta.width}×${outMeta.height} webp q${WEBP_QUALITY} ← ${d.title} [${d.license}${d.tier === "by-sa" ? " / BY-SA" : ""}] by ${d.artist || "(作者不明)"}\n`);
  process.stdout.write(JSON.stringify(record, null, 2) + "\n");
}

// ───── main ─────
const { pos, opt } = parseArgs(process.argv.slice(2));
const cmd = pos.shift();
try {
  if (cmd === "search") await cmdSearch(pos, opt);
  else if (cmd === "sheet") await cmdSheet(pos, opt);
  else if (cmd === "get") await cmdGet(pos, opt);
  else {
    process.stderr.write("使い方: pet-free-images.mjs search|sheet|get … (先頭のコメントを参照)\n");
    process.exit(2);
  }
} catch (e) {
  die(e && e.stack ? e.stack : String(e));
}
