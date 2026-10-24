/**
 * automation/v2/lib/site.mjs — 店の公式サイトの文字と写真の URL を読む(HTTP で取るだけ・ログイン不要・有料 API なし)
 *
 * 公式サイトとみなすのは、Google マップの website が SNS・掲載ポータルでないときだけ(build-places.mjs の分類と同じ考え方)。
 * 取るのは、トップと、同じサイトの中の最大 4 ページ(店の中身がありそうな名前のもの)。1 ページごとに 1 秒あける。
 */
import { fetchText } from "./http.mjs";
import { sleep } from "./util.mjs";

const SNS = /(^|\.)(instagram\.com|facebook\.com|fb\.me|fb\.com|twitter\.com|x\.com|tiktok\.com|line\.me|lin\.ee|threads\.net|youtube\.com|youtu\.be)$/;
const PORTAL = /(^|\.)(hotpepper\.jp|epark\.jp|minimodel\.jp|ozmall\.co\.jp|rakuten\.co\.jp|mitsuraku\.jp|karadarefre\.jp|kanzashi\.com|tabelog\.com|gnavi\.co\.jp|retty\.me|localplace\.jp|booking\.com|jalan\.net|ikyu\.com|airbnb\.|ameblo\.jp|note\.com|goo\.ne\.jp|google\.com|simdif\.com|jimdofree\.com|official\.ec)$/;

/** website が公式サイトか。公式サイトなら正規化した URL(utm_ などを外したもの)を返す。違えば null と理由 */
export function classifyOfficial(raw) {
  if (!raw) return { url: null, reason: "website なし" };
  let u;
  try {
    u = new URL(String(raw).replace(/(?:%20|\s)+https?:\/\/.*$/i, ""));
  } catch {
    return { url: null, reason: "website を URL として読めない" };
  }
  if (!/^https?:$/.test(u.protocol)) return { url: null, reason: "http(s) でない" };
  const host = u.hostname.toLowerCase();
  if (SNS.test(host)) return { url: null, reason: `SNS(${host})` };
  if (PORTAL.test(host)) return { url: null, reason: `掲載・予約ポータル等(${host})` };
  for (const k of [...u.searchParams.keys()]) if (/^utm_/i.test(k) || ["fbclid", "gclid", "igshid"].includes(k)) u.searchParams.delete(k);
  u.hash = "";
  return { url: u.toString(), reason: "公式サイト" };
}

const decodeEntities = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));

export function htmlToText(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section|\/dt|\/dd)[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t　]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

const absUrl = (href, base) => {
  try {
    return new URL(decodeEntities(href.trim()), base).toString();
  } catch {
    return null;
  }
};

/** 同じサイトの中のリンクのうち、店の中身がありそうなものを点数順に */
const PAGE_HINT =
  /menu|メニュー|room|stay|plan|course|コース|about|concept|story|shop|店|access|アクセス|info|guide|体験|experience|service|サービス|lesson|price|facility|設備|bath|food|dish|drink|cuisine|gallery|photo|company|greeting|歴史|こだわり|特徴/i;
const PAGE_SKIP = /\.(jpe?g|png|gif|webp|pdf|zip|mp4|svg|css|js)(\?|$)|#|mailto:|tel:|\/(wp-admin|wp-login|cart|login|privacy|policy|news\/\d|blog\/\d|tag|category|feed)\b/i;

function internalLinks(html, base) {
  const host = new URL(base).hostname.replace(/^www\./, "");
  const out = new Map();
  for (const m of html.matchAll(/<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const u = absUrl(m[1], base);
    if (!u || PAGE_SKIP.test(u)) continue;
    let h;
    try {
      h = new URL(u).hostname.replace(/^www\./, "");
    } catch {
      continue;
    }
    if (h !== host) continue;
    const pathOnly = u.split("#")[0];
    if (pathOnly === base || pathOnly === base.replace(/\/$/, "")) continue;
    const label = htmlToText(m[2]).slice(0, 40);
    const score = (PAGE_HINT.test(u) ? 2 : 0) + (PAGE_HINT.test(label) ? 2 : 0);
    if (!out.has(pathOnly) || out.get(pathOnly).score < score) out.set(pathOnly, { url: pathOnly, label, score });
  }
  return [...out.values()].sort((a, b) => b.score - a.score);
}

const IMG_SKIP_NAME = /logo|icon|sprite|btn|button|arrow|bnr|banner|favicon|loading|spacer|blank|qr|line_|insta|facebook|twitter|sns|badge|ico_|bg_|bg-|pattern|texture|noimage|no_image|dummy|map\b|googlemap/i;

/** ページから画像の URL を取り出す(og:image・img の src / data-src / srcset の最大・style の background-image) */
export function imageUrls(html, base) {
  const found = [];
  const add = (u, hint) => {
    const a = absUrl(u, base);
    if (!a || /^data:/.test(a)) return;
    if (!/\.(jpe?g|png|webp)(\?|$)/i.test(a) && !/\/wp-content\/uploads|\/images?\/|\/img\//i.test(a)) return;
    if (/\.(svg|gif|ico)(\?|$)/i.test(a)) return;
    if (IMG_SKIP_NAME.test(a.split("/").pop() || "")) return;
    found.push({ url: a, hint });
  };
  for (const m of html.matchAll(/<meta[^>]+(?:property|name)=["']og:image["'][^>]*content=["']([^"']+)["']/gi)) add(m[1], "og");
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']og:image["']/gi)) add(m[1], "og");
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const alt = /alt=["']([^"']*)["']/i.exec(tag)?.[1] || "";
    let best = null;
    const ss = /(?:srcset|data-srcset)=["']([^"']+)["']/i.exec(tag)?.[1];
    if (ss) {
      const parts = ss
        .split(",")
        .map((x) => x.trim().split(/\s+/))
        .map(([u, w]) => ({ u, w: parseInt(w) || 0 }))
        .sort((a, b) => b.w - a.w);
      best = parts[0]?.u;
    }
    for (const attr of ["data-src", "data-lazy-src", "data-original", "src"]) {
      const v = new RegExp(`\\b${attr}=["']([^"']+)["']`, "i").exec(tag)?.[1];
      if (v && !best) best = v;
    }
    if (best) add(best, alt);
  }
  for (const m of html.matchAll(/background(?:-image)?\s*:\s*url\(\s*["']?([^"')]+)["']?\s*\)/gi)) add(m[1], "bg");
  const seen = new Set();
  return found.filter((f) => (seen.has(f.url) ? false : (seen.add(f.url), true)));
}

/**
 * 公式サイトを読む。{ official: {url, reason}, pages: [{url, title, text, html}], images: [{url, pageUrl, hint}] }
 * 取れなかったページは notes に理由を入れる(失敗しても店の処理は続ける)。
 */
export async function readSite(website, { maxPages = 5, log = () => {} } = {}) {
  const official = classifyOfficial(website);
  const res = { official, pages: [], images: [], notes: [] };
  if (!official.url) {
    res.notes.push(`公式サイトとして使わない: ${official.reason}`);
    return res;
  }
  const queue = [official.url];
  const done = new Set();
  while (queue.length && res.pages.length < maxPages) {
    const url = queue.shift();
    if (done.has(url)) continue;
    done.add(url);
    const r = await fetchText(url);
    if (!r.ok) {
      res.notes.push(`${url}: 取れなかった(${r.reason})`);
      if (res.pages.length === 0) break;
      continue;
    }
    const finalUrl = r.finalUrl || url;
    if (res.pages.some((p) => p.url === finalUrl)) continue; // 転送で同じページに着いた
    const title = decodeEntities(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(r.body)?.[1] || "").replace(/\s+/g, " ").trim();
    res.pages.push({ url: finalUrl, title, text: htmlToText(r.body), html: r.body });
    for (const im of imageUrls(r.body, finalUrl)) res.images.push({ ...im, pageUrl: finalUrl });
    if (res.pages.length === 1) {
      for (const l of internalLinks(r.body, finalUrl).slice(0, maxPages - 1)) queue.push(l.url);
    }
    log(`公式サイト: ${finalUrl} (${res.pages.at(-1).text.length}字・画像候補 ${res.images.length})`);
    await sleep(1000);
  }
  return res;
}
