#!/usr/bin/env node
/**
 * TikTok 動画の取り込み。
 *   node automation/videos/ingest.mjs            … dry-run（何を書くかを表示するだけ。何も書かない）
 *   node automation/videos/ingest.mjs --apply    … lib/videos/tiktok.json とサムネイルを書く
 *   node automation/videos/ingest.mjs --fixture  … 見本の oEmbed 応答（automation/videos/fixtures/）で動作確認。ネットに出ない。--apply は付けられない
 *
 * 入力は automation/videos/input.csv（列: url, storeId, memo）。使い方は README.md。
 * 外部ライブラリは使わない（Node 18+ の fetch だけ）。
 *
 * 取るもの（TikTok の oEmbed。無料・キー不要）:
 *   title（キャプション）・author_name・thumbnail_url・thumbnail_width/height
 * 作るもの:
 *   - 動画 ID は URL から。短縮 URL（vm.tiktok.com 等）はリダイレクトを追って正規 URL にする
 *   - uploadDate は動画 ID の上位32ビット（ID >> 32 が Unix 秒）から算出。2016〜現在の範囲外なら入れない
 *   - サムネイルは TikTok 側で期限切れになるので public/videos/thumbs/{tiktokId}.jpg に保存
 * 止まる条件: storeId が店データに無い／URL が TikTok でない（取り込み前に全行を検査して止まる。終了コード 2）
 * 取り込み済みの動画 ID はスキップ。
 *
 * ネットに出ている他人の動画を勝手に取り込まないこと。入れるのは自分たちが投稿した動画の URL だけ。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");

// ───────────────────────── 引数 ─────────────────────────
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n) => {
  const i = argv.indexOf(n);
  return i >= 0 ? argv[i + 1] : undefined;
};
if (flag("--help") || flag("-h")) {
  console.log(
    [
      "使い方: node automation/videos/ingest.mjs [--apply] [--fixture]",
      "  （なし）   dry-run。何を書くかを表示するだけ",
      "  --apply    lib/videos/tiktok.json とサムネイルを書く",
      "  --fixture  見本の oEmbed 応答で動作確認（ネットに出ない。--apply と一緒には使えない）",
      "  --input <csv>  入力 CSV（既定: automation/videos/input.csv。--fixture のときは fixtures/input.csv）",
      "テスト用: --data <json>  --thumbs-dir <dir>  --oembed-base <url>",
    ].join("\n"),
  );
  process.exit(0);
}
const APPLY = flag("--apply");
const FIXTURE = flag("--fixture");
if (APPLY && FIXTURE) {
  console.error("エラー: --fixture では --apply できません（見本のデータをサイトに入れないため）。");
  process.exit(2);
}
const INPUT = path.resolve(opt("--input") ?? (FIXTURE ? path.join(HERE, "fixtures/input.csv") : path.join(HERE, "input.csv")));
const DATA = path.resolve(opt("--data") ?? path.join(ROOT, "lib/videos/tiktok.json"));
const THUMBS = path.resolve(opt("--thumbs-dir") ?? path.join(ROOT, "public/videos/thumbs"));
const OEMBED_BASE = opt("--oembed-base") ?? "https://www.tiktok.com/oembed";
const FIXTURES = path.join(HERE, "fixtures");

// ───────────────────────── 小さな部品 ─────────────────────────
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** CSV（ダブルクォート・改行入りの欄・BOM・CRLF に対応）→ 行の配列 */
function parseCsv(text) {
  const t = text.replace(/^﻿/, "");
  const rows = [];
  let row = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          cell += '"';
          i++;
        } else q = false;
      } else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
    } else cell += c;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/** 店データ（コード側）にある店 ID。r01 形式。lib/data.ts・teleapo-restaurants.ts・articleStores.ts と storeStations.json */
function loadKnownStoreIds() {
  const ids = new Set();
  for (const f of ["lib/data.ts", "lib/teleapo-restaurants.ts", "lib/articleStores.ts"]) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    for (const m of fs.readFileSync(p, "utf8").matchAll(/(?:^|[\s{,])"?id"?\s*:\s*"(r\d+)"/gm)) ids.add(m[1]);
  }
  const ss = path.join(ROOT, "lib/stations/storeStations.json");
  if (fs.existsSync(ss)) for (const k of Object.keys(JSON.parse(fs.readFileSync(ss, "utf8")))) ids.add(k);
  return ids;
}

const isTikTokHost = (h) => h === "tiktok.com" || h.endsWith(".tiktok.com");
const VIDEO_ID_RE = /\/(?:video|v)\/(\d{10,25})/;
const idFromUrl = (u) => (u.pathname.match(VIDEO_ID_RE) ?? [])[1] ?? null;
const handleFromPath = (p) => (p.match(/\/@([^/?#]+)/) ?? [])[1] ?? null;

/** 動画 ID の上位32ビット（ID >> 32）= Unix 秒。2016 〜 現在の範囲外なら null */
function uploadDateFromId(id) {
  const ts = Number(BigInt(id) >> 32n);
  const min = Date.UTC(2016, 0, 1) / 1000;
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(ts) || ts < min || ts > now) return { date: null, why: `IDの時刻 ${new Date(ts * 1000).toISOString().slice(0, 10)} が 2016〜現在の範囲外` };
  return { date: new Date(ts * 1000).toISOString().replace(/\.\d{3}Z$/, "Z"), why: null };
}

/** 短縮 URL のリダイレクトを追って、動画 ID を含む URL にする（最大6回）。fixture では fixtures/redirects.json を引く */
async function resolveUrl(raw) {
  let u = new URL(raw);
  if (idFromUrl(u)) return u;
  if (FIXTURE) {
    const map = JSON.parse(fs.readFileSync(path.join(FIXTURES, "redirects.json"), "utf8"));
    const to = map[u.href];
    if (!to) throw new Error("短縮URLの見本が fixtures/redirects.json にありません");
    return new URL(to);
  }
  for (let hop = 0; hop < 6; hop++) {
    const res = await fetch(u, { redirect: "manual", headers: { "user-agent": UA }, signal: AbortSignal.timeout(15000) });
    const loc = res.headers.get("location");
    if (!(res.status >= 300 && res.status < 400 && loc)) break;
    u = new URL(loc, u);
    if (!isTikTokHost(u.hostname)) throw new Error(`リダイレクト先が TikTok ではありません: ${u.hostname}`);
    if (idFromUrl(u)) return u;
  }
  throw new Error("動画IDを含むURLまでたどれませんでした（非公開・削除済み、またはURLが違うかもしれません）");
}

/** oEmbed の応答を取る。fixture では fixtures/oembed/{id}.json */
async function fetchOembed(canonical, id) {
  if (FIXTURE) {
    const f = path.join(FIXTURES, "oembed", `${id}.json`);
    if (!fs.existsSync(f)) throw new Error(`oEmbed の見本がありません: fixtures/oembed/${id}.json`);
    return JSON.parse(fs.readFileSync(f, "utf8"));
  }
  const res = await fetch(`${OEMBED_BASE}?url=${encodeURIComponent(canonical)}`, {
    headers: { "user-agent": UA, accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`oEmbed が ${res.status} を返しました（非公開・削除済み、またはURLが違うかもしれません）`);
  return res.json();
}

/** サムネイルを取る。content-type から拡張子を決める（TikTok は jpeg が普通） */
async function fetchThumb(url) {
  const res = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`サムネイルが ${res.status} を返しました`);
  const ct = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!ct.startsWith("image/")) throw new Error(`サムネイルが画像ではありません（${ct || "content-type なし"}）`);
  const ext = ct.includes("webp") ? "webp" : ct.includes("png") ? "png" : "jpg";
  return { buf: Buffer.from(await res.arrayBuffer()), ext };
}

// ───────────────────────── 入力の読み込みと検査 ─────────────────────────
if (!fs.existsSync(INPUT)) {
  console.error(`エラー: 入力ファイルがありません: ${INPUT}`);
  process.exit(2);
}
const table = parseCsv(fs.readFileSync(INPUT, "utf8")).filter((r) => r.some((c) => c.trim() !== "") && !r[0].trim().startsWith("#"));
const header = (table.shift() ?? []).map((h) => h.trim().toLowerCase());
const col = (n) => header.indexOf(n.toLowerCase());
if (col("url") < 0 || col("storeid") < 0) {
  console.error("エラー: 1行目に url, storeId, memo の列名が必要です。");
  process.exit(2);
}
const rows = table.map((r, i) => ({
  n: i + 1,
  url: (r[col("url")] ?? "").trim(),
  storeIds: (r[col("storeid")] ?? "").split(/[|;\s]+/).map((s) => s.trim()).filter(Boolean),
  memo: col("memo") >= 0 ? (r[col("memo")] ?? "").trim() : "",
}));

console.log(`モード: ${FIXTURE ? "fixture（見本の応答・ネットに出ない）" : APPLY ? "--apply（書き込む）" : "dry-run（何も書かない）"}`);
console.log(`入力  : ${path.relative(ROOT, INPUT)}（${rows.length}行）`);
if (rows.length === 0) {
  console.log("取り込む行がありません。input.csv に url,storeId,memo を足してください。");
  process.exit(0);
}

const known = loadKnownStoreIds();
const errors = [];
for (const r of rows) {
  try {
    const u = new URL(r.url);
    if (!isTikTokHost(u.hostname)) errors.push(`${r.n}行目: TikTok のURLではありません: ${r.url}`);
  } catch {
    errors.push(`${r.n}行目: URLとして読めません: ${r.url || "(空)"}`);
  }
  if (r.storeIds.length === 0) errors.push(`${r.n}行目: storeId が空です`);
  for (const s of r.storeIds) if (!known.has(s)) errors.push(`${r.n}行目: storeId「${s}」が店データにありません`);
}
if (errors.length) {
  console.error(`\n入力にエラーがあります。何も取り込まずに止めます（${errors.length}件）:`);
  for (const e of errors) console.error("  ✗ " + e);
  process.exit(2);
}
console.log(`店ID  : ${known.size}店の ID と照合して、すべて存在を確認しました`);

// ───────────────────────── 取り込み ─────────────────────────
const existing = fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA, "utf8")) : [];
const have = new Set(existing.map((v) => v.tiktokId));
/** 取り込み予定（サムネイルURLのある動画だけ） */
const jobs = [];
let skipped = 0;
let failed = 0;

console.log("");
for (const r of rows) {
  const tag = `[${r.n}]`;
  try {
    const resolved = await resolveUrl(r.url);
    const id = idFromUrl(resolved);
    if (have.has(id)) {
      skipped++;
      console.log(`${tag} スキップ（取り込み済み・または同じ入力内で重複）  ID ${id}`);
      continue;
    }
    const oe = await fetchOembed(`https://www.tiktok.com/@${handleFromPath(resolved.pathname) ?? "_"}/video/${id}`, id);
    const handle = handleFromPath(new URL(oe.author_url ?? "https://www.tiktok.com/").pathname) ?? handleFromPath(resolved.pathname);
    if (!handle || handle === "_") throw new Error("投稿者のIDが取れず、正規URLを作れませんでした");
    if (!oe.thumbnail_url) throw new Error("oEmbed にサムネイルURLがありません");
    const tiktokUrl = `https://www.tiktok.com/@${handle}/video/${id}`;
    const caption = String(oe.title ?? "").replace(/\s+/g, " ").trim();
    const author = String(oe.author_name ?? "").trim();
    const { date, why } = uploadDateFromId(id);
    const vertical = oe.thumbnail_width && oe.thumbnail_height ? Number(oe.thumbnail_height) >= Number(oe.thumbnail_width) : true;
    const rec = {
      id: `tt-${id}`,
      source: "tiktok",
      tiktokId: id,
      tiktokUrl,
      thumbnail: `/videos/thumbs/${id}.jpg`,
      title: caption || (author ? `${author}の動画` : "TikTok動画"),
      storeIds: r.storeIds,
      vertical,
      ...(author ? { author } : {}),
      ...(date ? { uploadDate: date } : {}),
    };
    have.add(id);
    jobs.push({ rec, thumbUrl: oe.thumbnail_url });
    console.log(`${tag} 取り込み${APPLY ? "" : "予定"}  ${tiktokUrl}`);
    console.log(`      店         : ${r.storeIds.join(", ")}${r.memo ? `   （メモ: ${r.memo}）` : ""}`);
    console.log(`      タイトル   : ${rec.title}`);
    console.log(`      投稿者     : ${author || "(なし)"}   縦型: ${vertical ? "はい" : "いいえ"}`);
    console.log(`      uploadDate : ${date ?? `なし（${why}）`}`);
    console.log(`      サムネイル : ${rec.thumbnail}  ← ${oe.thumbnail_url}`);
  } catch (e) {
    failed++;
    console.error(`${tag} ✗ 失敗  ${r.url}\n      ${e.message}`);
  }
  if (!FIXTURE) await sleep(300);
}

let imported = 0;
if (APPLY && jobs.length > 0) {
  fs.mkdirSync(THUMBS, { recursive: true });
  const written = [];
  for (const { rec, thumbUrl } of jobs) {
    try {
      const { buf, ext } = await fetchThumb(thumbUrl);
      const file = path.join(THUMBS, `${rec.tiktokId}.${ext}`);
      fs.writeFileSync(file, buf);
      rec.thumbnail = `/videos/thumbs/${rec.tiktokId}.${ext}`;
      written.push(rec);
      console.log(`サムネイル保存: ${path.relative(ROOT, file)}（${buf.length}バイト）`);
    } catch (e) {
      failed++;
      console.error(`✗ サムネイル失敗 ID ${rec.tiktokId}: ${e.message}（この動画は取り込みません）`);
    }
  }
  if (written.length > 0) {
    fs.writeFileSync(DATA, JSON.stringify([...existing, ...written], null, 2) + "\n");
    console.log(`\n書き込み: ${path.relative(ROOT, DATA)}（${existing.length}本 → ${existing.length + written.length}本）`);
  }
  imported = written.length;
}

console.log(
  `\n結果: 取り込み${APPLY ? "" : "予定"} ${APPLY ? imported : jobs.length}本 / スキップ ${skipped}本 / 失敗 ${failed}本` +
    (APPLY ? "" : "\n（何も書いていません。反映するには --apply を付けて実行します）"),
);
process.exit(failed > 0 ? 1 : 0);
