/**
 * automation/v2/lib/photos.mjs — 写真の候補を集めて整える
 *
 * 候補 = Google マップの写真(ログインなしで見える分)+ 公式サイトの写真。
 * ここでは「使えるか」は機械で見られる所だけ(読めない・小さすぎる・同じ絵)を落とす。
 * 地図・ロゴだけ・人の顔が大きい・別の店・AI の絵 などの判断は、書き手(claude)が実際に画像を見て決める(prompt.mjs)。
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fetchBytes } from "./http.mjs";
import { hiRes } from "./maps.mjs";
import { sleep } from "./util.mjs";

const popcnt4 = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
export async function dHash(buf) {
  const raw = await sharp(buf, { failOn: "none" }).rotate().greyscale().resize(17, 16, { fit: "fill" }).raw().toBuffer();
  let bits = "";
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) bits += raw[y * 17 + x] > raw[y * 17 + x + 1] ? "1" : "0";
  let hex = "";
  for (let i = 0; i < 256; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  return hex;
}
export function hashDistance(a, b) {
  if (a.length !== b.length) return 256;
  let d = 0;
  for (let i = 0; i < a.length; i++) d += popcnt4[parseInt(a[i], 16) ^ parseInt(b[i], 16)];
  return d;
}
/** 同じ絵とみなす指紋の差(256 bit 中)。lib/portal/photoFeature/collect.ts の SAME_PHOTO_BITS(24)と同じ */
export const SAME_BITS = 24;

const MIN_SHORT_SIDE = { maps: 300, official: 400 };
const MIN_WIDTH = { maps: 400, official: 600 };
const MIN_BYTES = { maps: 8_000, official: 25_000 };
const MAX_SITE_TRIES = 18;
const MAX_TOTAL = 40;

/**
 * 写真を取って整える。dir の下に full/(掲載用 最大 1280px・JPEG)と cand/(書き手が見る用 640px)を作る。
 * 返り値: { items: [{id, source, pageUrl, srcUrl, width, height, bytes, hash, full, cand}], rejects: [{srcUrl, source, reason}] }
 */
export async function collectPhotos({ dir, mapsUrls, siteImages, log = () => {} }) {
  mkdirSync(path.join(dir, "full"), { recursive: true });
  mkdirSync(path.join(dir, "cand"), { recursive: true });
  const items = [];
  const rejects = [];
  const jobs = [
    ...mapsUrls.map((u, i) => ({ id: `g${String(i + 1).padStart(2, "0")}`, source: "maps", srcUrl: hiRes(u), pageUrl: null })),
    ...siteImages.slice(0, MAX_SITE_TRIES).map((im, i) => ({ id: `s${String(i + 1).padStart(2, "0")}`, source: "official", srcUrl: im.url, pageUrl: im.pageUrl })),
  ];
  for (const job of jobs) {
    if (items.length >= MAX_TOTAL) break;
    const r = await fetchBytes(job.srcUrl, job.pageUrl ? { referer: job.pageUrl } : {});
    if (!r.ok) {
      rejects.push({ srcUrl: job.srcUrl, source: job.source, reason: `取れなかった(${r.reason})` });
      continue;
    }
    if (r.buf.length < MIN_BYTES[job.source]) {
      rejects.push({ srcUrl: job.srcUrl, source: job.source, reason: `小さすぎる(${r.buf.length}B)` });
      continue;
    }
    let meta;
    try {
      meta = await sharp(r.buf, { failOn: "none" }).rotate().metadata();
    } catch {
      rejects.push({ srcUrl: job.srcUrl, source: job.source, reason: "画像として読めない" });
      continue;
    }
    // rotate() 後の寸法(EXIF の向きを直したもの)
    const swap = (meta.orientation ?? 1) >= 5;
    const width = swap ? meta.height : meta.width;
    const height = swap ? meta.width : meta.height;
    if (!width || !height || Math.min(width, height) < MIN_SHORT_SIDE[job.source] || width < MIN_WIDTH[job.source]) {
      rejects.push({ srcUrl: job.srcUrl, source: job.source, reason: `寸法が足りない(${width}x${height})` });
      continue;
    }
    const hash = await dHash(r.buf);
    const dup = items.find((x) => hashDistance(x.hash, hash) <= SAME_BITS);
    if (dup) {
      rejects.push({ srcUrl: job.srcUrl, source: job.source, reason: `${dup.id} と同じ絵` });
      continue;
    }
    const pipe = () => sharp(r.buf, { failOn: "none" }).rotate();
    const full = await pipe().resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    const cand = await pipe().resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 70 }).toBuffer();
    const fm = await sharp(full).metadata();
    writeFileSync(path.join(dir, "full", `${job.id}.jpg`), full);
    writeFileSync(path.join(dir, "cand", `${job.id}.jpg`), cand);
    items.push({
      id: job.id,
      source: job.source,
      pageUrl: job.pageUrl,
      srcUrl: job.srcUrl,
      width: fm.width,
      height: fm.height,
      bytes: full.length,
      hash,
      full: `full/${job.id}.jpg`,
      cand: `cand/${job.id}.jpg`,
    });
    log(`  写真 ${job.id} ${job.source} ${fm.width}x${fm.height} ${Math.round(full.length / 1024)}KB`);
    await sleep(job.source === "official" ? 400 : 250);
  }
  return { items, rejects };
}
