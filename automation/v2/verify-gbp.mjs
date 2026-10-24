#!/usr/bin/env node
/**
 * verify-gbp.mjs  —  記事の自動作成(新) 第1段: 候補の店が Google マップに実在し「同じ店」かを確かめる
 *
 * 守ること(vertical-stores/resolve.mjs・scripts/fetch-gbp-details.mjs の作法を引き継ぐ):
 *   - 有料API・APIキーは使わない。Playwright でマップの画面を読むだけ。シート・Supabase には書かない
 *   - 1件ずつ順番に。店と店の間は 6〜10 秒、同じ店の中の検索と検索の間は 2〜3.5 秒あける
 *   - CAPTCHA / 確認ページ / consent / アクセス制限が出たら、その店を「止められた」で保存して全体を止める(回避しない)
 *   - Google の検索ページはブラウザで開かない(CAPTCHA になるため)。短縮URLは HTTP の転送だけ辿る
 *   - 読まない・保存しない: 星の評価、口コミ件数、口コミ文、価格帯、写真
 *   - 店名の部分一致だけで同じ店と決めない。別々の手がかり2つ以上(店名+電話、店名+住所の番地)が合ったときだけ「確認済み」
 *
 * 判定(verdict):
 *   確認済み / 要確認 / 見つからない / 閉業・移転   (一時的な失敗は「エラー」: 次の実行で自動的にやり直す)
 *
 * 使い方:
 *   node automation/v2/verify-gbp.mjs                       → トリニティアポの全候補
 *   node automation/v2/verify-gbp.mjs --tab トリニティアポ --limit 5
 *   node automation/v2/verify-gbp.mjs --rows 3,17,83        → 指定行だけ
 *   node automation/v2/verify-gbp.mjs --include-registered --tab Linkateアポ --limit 2   (動作確認用: 台帳にある店も対象)
 *   --force  保存済みの店も取り直す  /  --date YYYY-MM-DD  出力ファイルの日付(続きから回すとき)
 * 出力: automation/v2/out/verify-<日付>.json  (1件ごとに保存。途中で止まっても済んだ所は残る)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { OUT_DIR, readSheets, buildCandidates, today } from "./intake.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../..");
const { compareAddr, normAddr, nameRelation } = await import(pathToFileURL(path.join(REPO, "automation/vertical-stores/resolve.mjs")).href);
const { chromium } = await import(pathToFileURL(path.join(REPO, "node_modules/playwright/index.mjs")).href);

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const ROW_DEADLINE_MS = 150_000;
const MAX_LIST_CANDIDATES = 3;
const PREF_RE = /(北海道|青森県|岩手県|宮城県|秋田県|山形県|福島県|茨城県|栃木県|群馬県|埼玉県|千葉県|東京都|神奈川県|新潟県|富山県|石川県|福井県|山梨県|長野県|岐阜県|静岡県|愛知県|三重県|滋賀県|京都府|大阪府|兵庫県|奈良県|和歌山県|鳥取県|島根県|岡山県|広島県|山口県|徳島県|香川県|愛媛県|高知県|福岡県|佐賀県|長崎県|熊本県|大分県|宮崎県|鹿児島県|沖縄県)/;

class BlockedError extends Error {}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (a, b) => a + Math.random() * (b - a);

// ------------------------------------------------------------------ 電話・URL
/** 数字だけにする。+81 は先頭 0 に直す */
export function phoneDigits(s) {
  let d = String(s ?? "").normalize("NFKC").replace(/[^\d+]/g, "");
  if (d.startsWith("+81")) d = "0" + d.slice(3);
  return d.replace(/\D/g, "") || null;
}

function cidFromUrl(url) {
  const m = String(url).match(/!1s0x[0-9a-f]+:0x([0-9a-f]+)/i);
  if (m) {
    try {
      return BigInt("0x" + m[1]).toString();
    } catch {}
  }
  const c = String(url).match(/[?&]cid=(\d+)/);
  return c ? c[1] : null;
}

/** 短縮URLなどを HTTP の転送だけで辿る(ブラウザでは開かない)。最後に着いたURLを返す */
async function followRedirects(u) {
  let cur = u;
  for (let i = 0; i < 6; i++) {
    let res;
    try {
      res = await fetch(cur, { headers: { "User-Agent": "Mozilla/5.0 machinowa/1.0" }, redirect: "manual", signal: AbortSignal.timeout(15_000) });
    } catch (e) {
      return { url: cur, error: String(e.message || e).slice(0, 100) };
    }
    const loc = res.headers.get("location");
    if (!loc) break;
    const next = new URL(loc, cur);
    if (/\/sorry\//.test(next.pathname) || next.hostname.startsWith("consent.")) throw new BlockedError(`転送先が確認ページ: ${next.href.slice(0, 100)}`);
    cur = next.href;
    if (/google\.[a-z.]+\/(search|maps)/.test(cur) || /maps\.google\./.test(cur)) break;
  }
  return { url: cur };
}

function classifyUrl(u) {
  u = String(u ?? "").trim();
  if (!u) return "empty";
  if (!/^https?:\/\//i.test(u)) return "garbage";
  if (/^https?:\/\/share\.google\//.test(u)) return "share";
  if (/maps\.app\.goo\.gl/.test(u)) return "maps.app";
  if (/^https?:\/\/(x\.gd|bit\.ly|t\.co|goo\.gl|tinyurl\.com|is\.gd|lin\.ee|ow\.ly)\//i.test(u)) return "short";
  if (/google\.[a-z.]+\/maps\/place/.test(u)) return "place";
  if (/(google\.[a-z.]+\/maps\?|maps\.google\.[a-z.]+\/)/.test(u) && /cid=\d+/.test(u)) return "cid";
  if (/google\.[a-z.]+\/search/.test(u)) return "search";
  return "official";
}

function parseSearchUrl(u) {
  try {
    const x = new URL(u);
    return { q: x.searchParams.get("q"), kgmid: x.searchParams.get("kgmid") };
  } catch {
    return { q: null, kgmid: null };
  }
}

// ------------------------------------------------------------------ マップ画面の読み取り(resolve.mjs / fetch-gbp-details.mjs の作法)
async function assertNotBlocked(page) {
  const u = page.url();
  if (/\/sorry\//.test(u) || /consent\.google/.test(u) || /accounts\.google\.com/.test(u))
    throw new BlockedError(`Google が確認/同意ページを返した: ${u.slice(0, 100)}`);
  const head = await page.evaluate(() => (document.body?.innerText || "").slice(0, 800)).catch(() => "");
  if (/ロボットではありません|unusual traffic|異常なトラフィック|I'm not a robot|アクセスが制限/i.test(head))
    throw new BlockedError(`アクセス制限/ロボット確認の表示: ${head.replace(/\s+/g, " ").slice(0, 80)}`);
  if (await page.locator('iframe[src*="recaptcha"]').count().catch(() => 0)) throw new BlockedError("reCAPTCHA の表示");
}

async function waitForPlacePanel(page) {
  try {
    await page.waitForURL(/\/maps\/place\//, { timeout: 25_000 });
  } catch {}
  await assertNotBlocked(page);
  try {
    await page.waitForSelector("h1", { timeout: 12_000 });
    await page.waitForSelector('button[data-item-id="address"], button[data-item-id^="phone"], tr', { timeout: 8_000 });
  } catch {}
  await page.waitForTimeout(1500);
}

// 恒久的な閉業・移転の表示だけ。「閉店間際」(まもなく閉店時刻)は営業中の表示なので含めない。臨時休業・一時休業は別扱い(要確認の注記)
const CLOSED_RE = /^(完全に|恒久的に)?閉業|^恒久的に閉鎖|^移転|^閉店$/;
const TEMP_CLOSED_RE = /^臨時休業|^一時休業/;
const clean = (x) => (x == null ? x : x.replace(/[​-‏‪-‮﻿]/g, "").trim());

/** 店のパネルから、店名・住所・電話・公式サイト・カテゴリ・閉業表示だけを読む(星・口コミ・価格・写真は読まない) */
async function readPlace(page) {
  const raw = await page.evaluate(() => {
    const txt = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
    const out = {};
    out.name = [...document.querySelectorAll("h1")].map(txt).filter(Boolean)[0] || null;
    out.address = document.querySelector('button[data-item-id="address"]')?.getAttribute("aria-label") || null;
    const phoneBtn = document.querySelector('button[data-item-id^="phone"]');
    out.phoneLabel = phoneBtn?.getAttribute("aria-label") || null;
    out.phoneId = phoneBtn?.getAttribute("data-item-id") || null;
    out.website = document.querySelector('a[data-item-id="authority"]')?.getAttribute("href") || null;
    const cat = document.querySelector("button.DkEaL") || document.querySelector('button[jsaction*="category"]');
    out.category = cat ? txt(cat) : null;
    const sig = [];
    const main = document.querySelector('[role="main"]') || document.body;
    for (const e of main.querySelectorAll("span, div")) {
      if (e.children.length > 0) continue;
      const t = txt(e);
      if (t.length > 20) continue;
      if (/^(完全に|恒久的に)?(閉業|閉店|閉鎖)|^臨時休業|^一時休業|^営業終了|^移転/.test(t)) sig.push(t);
    }
    out.status = [...new Set(sig)];
    return out;
  });
  let phone = null;
  if (raw.phoneLabel) phone = clean(raw.phoneLabel).replace(/^電話番号:\s*/, "").trim() || null;
  if (!phone && raw.phoneId) {
    const m = raw.phoneId.match(/tel:(\d+)/);
    if (m) phone = m[1];
  }
  const url = page.url();
  return {
    name: clean(raw.name),
    address: raw.address ? clean(raw.address).replace(/^住所:\s*/, "").replace(/^〒\s*\d{3}-?\d{4}\s*/, "").trim() || null : null,
    phone,
    phoneDigits: phoneDigits(phone),
    website: raw.website || null,
    category: clean(raw.category),
    statusSignals: raw.status,
    closedSignal: raw.status.some((s) => CLOSED_RE.test(s)),
    tempClosedSignal: raw.status.some((s) => TEMP_CLOSED_RE.test(s)),
    url,
    cid: cidFromUrl(url),
  };
}

/** マップ検索を開き、{kind:'place'} か {kind:'list', hrefs:[…]} か {kind:'none'} を返す */
async function mapsSearch(page, query) {
  await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=ja`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  const end = Date.now() + 18_000;
  let stable = 0;
  while (Date.now() < end) {
    await assertNotBlocked(page);
    if (/\/maps\/place\//.test(page.url())) {
      await waitForPlacePanel(page);
      return { kind: "place" };
    }
    const n = await page.locator('a[href*="/maps/place/"]').count();
    if (n > 0) {
      if (++stable >= 3) break;
    } else {
      stable = 0;
      const none = await page.evaluate(() => /見つかりませんでした|一致する検索結果がありません/.test(document.body.innerText)).catch(() => false);
      if (none) return { kind: "none" };
    }
    await page.waitForTimeout(500);
  }
  if (/\/maps\/place\//.test(page.url())) {
    await waitForPlacePanel(page);
    return { kind: "place" };
  }
  const items = await page.$$eval('a[href*="/maps/place/"]', (as) => as.map((a) => a.href));
  const seen = new Set();
  const hrefs = [];
  for (const h of items) {
    const key = h.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    hrefs.push(h);
  }
  return hrefs.length ? { kind: "list", hrefs } : { kind: "none" };
}

// ------------------------------------------------------------------ 同じ店かの判定
/** 店名の比べ方。resolve.mjs の nameRelation に加えて、& と「アンド」「and」の書き分けだけをならして比べる */
function relName(a, b) {
  const rank = { exact: 2, contains: 1, different: 0 };
  let best = "different";
  for (const rep of [null, "アンド", "and"]) {
    const f = (x) => (rep ? String(x).normalize("NFKC").replace(/&/g, rep) : x);
    const g = (x) => String(x).normalize("NFKC").replace(/アンド|\band\b/gi, rep === null ? "$&" : rep);
    const r = nameRelation(f(g(a)), f(g(b)));
    if (rank[r] > rank[best]) best = r;
  }
  return best;
}

/**
 * 手がかり: 電話(桁だけ比べて完全一致) / 店名(記号・括弧・かな差をならして一致 or 一方が他方を含む3文字以上) / 住所の番地(シートの住所 or 検索URLに入っていた住所)
 * 確認済み = 店名が合う かつ (電話が合う または 住所の番地が合う)
 */
function judge(store, place, hintAddr) {
  const sp = phoneDigits(store.phone);
  const phoneMatch = sp && place.phoneDigits ? sp === place.phoneDigits : null;
  const nameRel = store.nameIsPhone ? "n/a" : place.name ? relName(store.name, place.name) : "different";
  const addrSrc = store.address || hintAddr || null;
  const addr = addrSrc && place.address ? compareAddr(addrSrc, place.address) : null;
  const addrOk = addr ? addr.level === "exact" || addr.level === "near" : null;
  const nameOk = nameRel === "exact" || nameRel === "contains";
  const confirmed = nameOk && (phoneMatch === true || addrOk === true);
  const rank = confirmed ? 3 : phoneMatch === true ? 2 : nameOk ? 1 : 0;
  return { phoneMatch, nameRel, addrLevel: addr?.level ?? null, addrDetail: addr?.detail ?? null, addrSource: store.address ? "シート" : hintAddr ? "検索URL" : null, confirmed, rank };
}

const brief = (p, j) => ({
  name: p.name,
  address: p.address,
  phone: p.phone,
  cid: p.cid,
  url: p.url.replace(/\?.*$/, ""),
  phoneMatch: j.phoneMatch,
  nameRelation: j.nameRel,
  addressLevel: j.addrLevel,
});

async function verifyOne(ctx, store) {
  const rec = {
    tab: store.tab,
    row: store.row,
    name: store.name,
    vertical: store.vertical,
    industryRaw: store.industryRaw,
    sheetPhone: store.phone,
    sheetUrl: store.url || null,
    urlKind: classifyUrl(store.url),
    route: null,
    queries: [],
    candidates: [],
    verdict: null,
    cid: null,
    mapName: null,
    mapAddress: null,
    mapPhone: null,
    website: null,
    category: null,
    mapUrl: null,
    signals: null,
    reason: null,
    fetchedAt: null,
  };
  const page = await ctx.newPage();
  let best = null; // {place, j}
  const consider = (place, j) => {
    rec.candidates.push(brief(place, j));
    if (!best || j.rank > best.j.rank) best = { place, j };
  };
  let hintAddr = null;
  let hintWebsite = null;

  try {
    let kind = rec.urlKind;
    let url = store.url;
    let hintQ = null;

    // 短縮URL・share は HTTP の転送だけ辿って種類を決め直す
    if (kind === "short" || kind === "share") {
      const f = await followRedirects(url);
      rec.followedUrl = f.url;
      if (f.error) rec.followError = f.error;
      const k2 = classifyUrl(f.url);
      if (k2 === "search") {
        const s = parseSearchUrl(f.url);
        hintQ = s.q;
        rec.kgmidHint = s.kgmid;
        kind = "search";
      } else if (k2 === "cid" || k2 === "place" || k2 === "maps.app") {
        kind = k2;
        url = f.url;
      } else {
        kind = "unresolved";
        if (k2 === "official") hintWebsite = f.url;
      }
    } else if (kind === "search") {
      const s = parseSearchUrl(url);
      hintQ = s.q;
      rec.kgmidHint = s.kgmid;
    } else if (kind === "official") {
      hintWebsite = url;
    }
    if (hintQ) {
      const q = hintQ.normalize("NFKC");
      const pm = q.match(PREF_RE);
      if (pm && !/^[\d\-\s]+$/.test(q)) hintAddr = q.slice(q.indexOf(pm[1])).trim();
    }

    // 1) マップのURLがあるならそれを開く(シートの人が選んだ店)
    if (kind === "cid" || kind === "place" || kind === "maps.app") {
      rec.route = "シートのマップURL";
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await waitForPlacePanel(page);
      await assertNotBlocked(page);
      if (/\/maps\/place\//.test(page.url())) {
        let place = await readPlace(page);
        if (!place.name && place.cid) {
          // 衛星表示などで店の画面が読めなかった。cid の正規URLで開き直す
          await sleep(jitter(2000, 3500));
          await page.goto(`https://maps.google.com/?cid=${place.cid}&hl=ja`, { waitUntil: "domcontentloaded", timeout: 30_000 });
          await waitForPlacePanel(page);
          place = await readPlace(page);
          rec.reopenedByCid = true;
        }
        consider(place, judge(store, place, hintAddr));
      } else {
        rec.reason = `リンク先が店の画面にならなかった: ${page.url().slice(0, 100)}`;
      }
    }

    // 2) 電話番号・店名でマップ検索(URL が無い/検索URL/短縮URL/マップURLが使えなかった場合)
    if (!best) {
      rec.route = rec.route ? `${rec.route}→電話・店名で検索` : "電話・店名で検索";
      const queries = [];
      if (store.phone) queries.push(store.phone);
      const hq = hintQ ? hintQ.normalize("NFKC").trim() : null;
      if (hq && phoneDigits(hq) !== phoneDigits(store.phone) && !/^[\d\-\s]+$/.test(hq)) queries.push(hq);
      if (!store.nameIsPhone) {
        const nm = store.name.replace(/\s+/g, " ");
        if (!queries.includes(nm)) queries.push(nm);
      }
      outer: for (const [qi, q] of queries.entries()) {
        if (qi > 0) await sleep(jitter(2000, 3500));
        rec.queries.push(q);
        const res = await mapsSearch(page, q);
        if (res.kind === "none") continue;
        const targets = res.kind === "place" ? [null] : res.hrefs.slice(0, MAX_LIST_CANDIDATES);
        for (const [hi, href] of targets.entries()) {
          if (href) {
            if (hi > 0) await sleep(jitter(1500, 2500));
            await page.goto(href, { waitUntil: "domcontentloaded", timeout: 30_000 });
            await waitForPlacePanel(page);
          }
          if (!/\/maps\/place\//.test(page.url())) continue;
          const place = await readPlace(page);
          const j = judge(store, place, hintAddr);
          consider(place, j);
          if (j.confirmed) break outer;
        }
      }
    }

    // 判定
    if (!best) {
      rec.verdict = "見つからない";
      rec.reason ||= "マップ検索で候補が出なかった/店の画面に到達できなかった";
    } else {
      const { place: p, j } = best;
      rec.cid = p.cid;
      rec.mapName = p.name;
      rec.mapAddress = p.address;
      rec.mapPhone = p.phone;
      rec.website = p.website;
      rec.category = p.category;
      rec.mapUrl = p.cid ? `https://maps.google.com/?cid=${p.cid}` : p.url.replace(/\?.*$/, "");
      rec.signals = { phoneMatch: j.phoneMatch, nameRelation: j.nameRel, addressLevel: j.addrLevel, addressDetail: j.addrDetail, addressSource: j.addrSource };
      if (hintWebsite && p.website) {
        try {
          const a = new URL(hintWebsite).hostname.replace(/^www\./, "");
          const b = new URL(p.website).hostname.replace(/^www\./, "");
          rec.signals.websiteMatch = a === b;
        } catch {}
      }
      const sig = [];
      if (j.phoneMatch === true) sig.push("電話が一致");
      else if (j.phoneMatch === false) sig.push(`電話がちがう(シート ${store.phone} / マップ ${p.phone})`);
      else sig.push(p.phone ? "シートに電話なし" : "マップに電話の表示なし");
      sig.push(`店名: ${j.nameRel}(シート「${store.name}」/ マップ「${p.name ?? "読めず"}」)`);
      if (j.addrLevel) sig.push(`住所(${j.addrSource}): ${j.addrLevel}${j.addrDetail ? `・${j.addrDetail}` : ""}`);

      rec.statusSignals = p.statusSignals;
      const strongSame = j.confirmed || j.phoneMatch === true || j.nameRel === "exact";
      if (p.closedSignal && strongSame) {
        rec.verdict = "閉業・移転";
        rec.reason = `画面に「${p.statusSignals.join(" / ")}」の表示。${sig.join("／")}`;
      } else if (j.confirmed && p.tempClosedSignal) {
        rec.verdict = "要確認";
        rec.reason = `同じ店と確認できたが、画面に「${p.statusSignals.join(" / ")}」の表示(臨時休業・一時休業)。再開しているか確認。${sig.join("／")}`;
      } else if (j.confirmed) {
        rec.verdict = "確認済み";
        rec.reason = sig.join("／");
      } else if (store.nameIsPhone) {
        rec.verdict = "要確認";
        rec.reason = `シートの店名が電話番号(${store.name})。電話で出たマップの店は「${p.name}」(電話${j.phoneMatch === true ? "一致" : "不一致/不明"})。店名をオーナーに確認`;
      } else {
        rec.verdict = "要確認";
        const strip = (x) => String(x ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
        const [sa, sb] = [strip(store.name), strip(p.name)];
        const shortContain = sa && sb && (sa.includes(sb) || sb.includes(sa));
        const both = j.phoneMatch === true && (j.addrLevel === "exact" || j.addrLevel === "near");
        const why =
          j.phoneMatch === true
            ? `電話は一致したが店名が合わない(${both ? "電話・住所とも一致なので店名の書き分けの可能性が高い" : shortContain ? "一方の店名が他方を含む短い名前" : "改称・屋号ちがいの可能性"})`
            : j.rank === 1
              ? "店名は似ているが電話・住所で裏が取れない"
              : "店名・電話とも合う店が見つからず、最も近い候補を記録";
        rec.reason = `${why}。${sig.join("／")}`;
      }
      if (p.tempClosedSignal && !/臨時休業|一時休業/.test(rec.reason)) rec.reason += `／画面に「${p.statusSignals.join(" / ")}」の表示(臨時休業・一時休業。再開しているか確認)`;
    }
  } catch (e) {
    if (e instanceof BlockedError) {
      rec.verdict = "止められた";
      rec.reason = e.message;
      rec.blocked = true;
    } else {
      rec.verdict = "エラー";
      rec.reason = String(e.message || e).slice(0, 300);
    }
  } finally {
    await page.close().catch(() => {});
  }
  rec.fetchedAt = new Date().toISOString();
  return rec;
}

// ------------------------------------------------------------------ CLI
function parseArgs(argv) {
  const a = { tab: "トリニティアポ", rows: null, limit: null, force: false, date: today(), includeRegistered: false };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--tab") a.tab = argv[++i];
    else if (t === "--rows") a.rows = new Set(argv[++i].split(",").map((x) => Number(x.trim())));
    else if (t === "--limit") a.limit = Number(argv[++i]);
    else if (t === "--force") a.force = true;
    else if (t === "--date") a.date = argv[++i];
    else if (t === "--include-registered") a.includeRegistered = true;
  }
  return a;
}

const keyOf = (s) => `${s.tab}:${s.row}`;
const RETRY = new Set(["エラー"]);

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const raw = await readSheets();
  const { candidates } = buildCandidates(raw, { includeRegistered: args.includeRegistered });
  let tasks = candidates.filter((c) => c.tab === args.tab && (!args.rows || args.rows.has(c.row)));

  mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, `verify-${args.date}${args.includeRegistered ? "-test" : ""}.json`);
  const store = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { meta: { date: args.date, startedAt: new Date().toISOString() }, results: {} };
  const save = () => {
    store.meta.updatedAt = new Date().toISOString();
    writeFileSync(file + ".tmp", JSON.stringify(store, null, 2) + "\n");
    renameSync(file + ".tmp", file);
  };

  const todo = (list) =>
    list.filter((s) => {
      if (args.force) return true;
      const old = store.results[keyOf(s)];
      if (!old || old.name !== s.name) return true; // 行ズレで店名が変わっていたらやり直す
      return RETRY.has(old.verdict);
    });
  tasks = todo(tasks);
  if (args.limit != null) tasks = tasks.slice(0, args.limit);
  console.error(`対象 ${args.tab}: ${tasks.length} 件 → ${file}`);
  if (!tasks.length) return;

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ userAgent: UA, locale: "ja-JP", viewport: { width: 1280, height: 900 } });
  {
    const w = await ctx.newPage(); // ウォームアップ(最初の1件が半端な表示になるのを防ぐ)
    try {
      await w.goto("https://www.google.com/maps?hl=ja", { waitUntil: "domcontentloaded", timeout: 30_000 });
      await w.waitForTimeout(2500);
    } catch {}
    await w.close().catch(() => {});
  }

  let stoppedBy = null;
  const run = async (list, label) => {
    for (const [i, s] of list.entries()) {
      if (stoppedBy) return;
      if (i > 0) await sleep(jitter(6000, 10000));
      const t0 = Date.now();
      let timer;
      const rec = await Promise.race([
        verifyOne(ctx, s),
        new Promise((res) => {
          timer = setTimeout(
            () => res({ tab: s.tab, row: s.row, name: s.name, vertical: s.vertical, industryRaw: s.industryRaw, verdict: "エラー", reason: `${ROW_DEADLINE_MS / 1000}秒で打ち切り`, fetchedAt: new Date().toISOString() }),
            ROW_DEADLINE_MS,
          );
        }),
      ]);
      clearTimeout(timer);
      rec.seconds = Math.round((Date.now() - t0) / 100) / 10;
      store.results[keyOf(s)] = rec;
      save();
      console.error(`${label}[${i + 1}/${list.length}] ${s.tab}:${s.row} ${rec.urlKind || ""} → ${rec.verdict} (${rec.seconds}s) ${s.name} ⇒ ${rec.mapName || ""}`);
      if (rec.blocked) {
        stoppedBy = rec.reason;
        store.meta.stoppedBy = `${s.tab}:${s.row} ${s.name} — ${rec.reason}`;
        save();
        console.error(`確認ページ/アクセス制限を検出したため全体を停止する(回避しない): ${rec.reason}`);
        return;
      }
    }
  };
  try {
    await run(tasks, "");
    // 一時的な「エラー」は最後に1回だけやり直す
    if (!stoppedBy) {
      const again = tasks.filter((s) => store.results[keyOf(s)]?.verdict === "エラー");
      if (again.length) {
        console.error(`エラーの ${again.length} 件をやり直す`);
        await sleep(jitter(6000, 10000));
        await run(again, "再");
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }
  const by = {};
  for (const s of candidates.filter((c) => c.tab === args.tab)) {
    const r = store.results[keyOf(s)];
    const v = r ? r.verdict : "未実行";
    by[v] = (by[v] || 0) + 1;
  }
  console.log(JSON.stringify({ file, byVerdict: by, stoppedBy }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(`[fatal] ${e.message}`);
    process.exit(1);
  });
}
