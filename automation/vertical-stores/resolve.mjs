#!/usr/bin/env node
/**
 * resolve.mjs  —  vertical-stores（ビューティ・ボディケア・ペット・宿泊施設）
 *
 * sheet.json の各行から Google マップ上の店を特定し、ログインなしで見える公開情報だけを
 * automation/vertical-stores/gbp/<tabEn>-<row>.json に保存する。
 *
 * 守ること:
 *   - 有料API・APIキーは使わない（Playwright でマップの画面を読むだけ）
 *   - 1件ずつ順番に。店と店の間は 3〜6 秒あける
 *   - CAPTCHA / 確認ページ / consent が出たら、その行を「止められた」で保存して全体を止める（回避しない）
 *   - 読まない・保存しない: 星の評価、口コミ件数、口コミ文、価格帯の記号、写真
 *   - 店の取り違えを作らない: 店名の部分一致では決めない。住所の一致で確かめる。
 *     緯度経度は、たどり着いた店のURLに入っている値だけ（住所から作らない）
 *   - 推測で埋めない（画面に出ていない項目は null）
 *
 * 使い方:
 *   node automation/vertical-stores/resolve.mjs --tab ビューティ --rows 2-13
 *   node automation/vertical-stores/resolve.mjs --tab ボディケア --rows 2,5,8-10 --limit 5
 *   node automation/vertical-stores/resolve.mjs --list automation/vertical-stores/trial30.json
 *   --force を付けると保存済みの行も取り直す（既定: 保存済みは飛ばす。ただし「エラー」「止められた」の行はやり直す）
  --accept beauty-100,bodycare-106  発注者が確認して「同じ店」と決めた行のキー。住所が一致（exact か near）していれば、
      店名がちがっても判定を「一致」にして place を保存する（acceptedByOwnerCheck: true と、元の判定・シートの店名・マップの店名を JSON に残す）。
      住所が一致しない行・閉業の表示がある行は、この引数でも一致にしない
 *
 * 判定（verdict）:
 *   一致 / 住所は一致で店名がちがう / 住所が粗く確認不十分 / 不一致 / 見つからない / 閉業の表示あり / 止められた / エラー
 *
 * マップの読み取りロジック（waitForPanel・expandHours・曜日行の読み取り等）は
 * scripts/fetch-gbp-details.mjs（グルメ500店で使ったもの）を写して使っている。元の関数は多くが export されておらず
 * scripts/ は書き換えない方針のため、価格帯を読まない形に整えて写した。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../..");
const { chromium } = await import(pathToFileURL(path.join(REPO, "node_modules/playwright/index.mjs")).href);

const OUT_DIR = path.join(HERE, "gbp");
const TAB_EN = { ビューティ: "beauty", ボディケア: "bodycare", ペット: "pet", 宿泊施設: "lodging" };
const DAYS = ["月", "火", "水", "木", "金", "土", "日"];
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const RETRY_VERDICTS = new Set(["エラー", "止められた"]);
const ROW_DEADLINE_MS = 150_000;
const MAX_CANDIDATES = 4;
/** --accept で渡された行キー（例 "beauty-100"）。発注者が確認して同じ店と決めた行 */
const ACCEPT = new Set();
const ACCEPT_APPLIED = new Set();

class BlockedError extends Error {}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DEBUG = !!process.env.VT_DEBUG;
let T0 = Date.now();
const lap = (s) => DEBUG && console.error(`  [${((Date.now() - T0) / 1000).toFixed(1)}s] ${s}`);

// ------------------------------------------------------------------ URL の種類
export function kindOf(u) {
  u = (u || "").trim();
  if (!u) return "empty";
  if (/^https?:\/\/share\.google\//.test(u)) return "share";
  if (/maps\.app\.goo\.gl/.test(u)) return "maps.app";
  if (/google\.[a-z.]+\/maps\?cid=|maps\.google\.[a-z.]+\/\?cid=/.test(u)) return "cid";
  if (/google\.[a-z.]+\/maps\/place/.test(u)) return "place";
  if (/google\.[a-z.]+\/search/.test(u)) return "search";
  if (/hotpepper\.jp/.test(u)) return "hotpepper";
  return "official";
}

// ------------------------------------------------------------------ 住所・店名の正規化と比較
const KNUM = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 〇: 0 };
function kanjiNum(s) {
  const m = s.match(/^([一二三四五六七八九])?十([一二三四五六七八九])?$/);
  if (m) return (m[1] ? KNUM[m[1]] : 1) * 10 + (m[2] ? KNUM[m[2]] : 0);
  if (/^[一二三四五六七八九〇]+$/.test(s)) return Number([...s].map((c) => KNUM[c]).join(""));
  return null;
}

const PREFS = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];
/** 先頭が「東京都東京都」のように同じ都道府県名のくりかえしになっているシートの入力ミスだけを直す */
const PREF_DUP_RE = new RegExp(`^(${PREFS.join("|")})\\1`);
/**
 * 異体字（同じ字の書き分け）の対。左 → 右 にそろえる。住所を比べるときだけ使う。
 * よくある対に限る。似た字でも別の字（例: 川/河、和/倭 など）は入れない。
 */
const VARIANT_PAIRS = {
  曾: "曽", 髙: "高", 﨑: "崎", 嵜: "崎", 澤: "沢", 邊: "辺", 邉: "辺", 齋: "斎", 齊: "斉", 櫻: "桜", 國: "国", 條: "条",
  濱: "浜", 濵: "浜", 廣: "広", 龍: "竜", 瀧: "滝", 嶋: "島", 𠮷: "吉",
};
const VARIANT_RE = new RegExp(`[${Object.keys(VARIANT_PAIRS).join("")}]`, "gu");
const KANJI = "\\u3400-\\u9fff々〆";

/** 全角半角・空白・ハイフン類・丁目/番/号/の・漢数字・郵便番号・都道府県の重複・異体字 をならす */
export function normAddr(raw) {
  // 半角と全角の数字がすき間なく並んでいる（例「9１」）のは、区切りが抜けた書き方（9-1）として扱う。NFKC の前にやる
  let s = (raw || "").replace(/(?<=[0-9])(?=[０-９])|(?<=[０-９])(?=[0-9])/g, "-").normalize("NFKC");
  s = s.replace(/^日本[、,]?\s*/, "").replace(/^〒?\s*\d{3}-?\d{4}\s*/, "");
  s = s.replace(PREF_DUP_RE, "$1");
  // 丁目・番・号・ハイフンのまわりの空白は取る（「1丁目 855番地」→「1丁目855番地」）。数字どうしの空白は区切りとして残す（「9-24 206」の 206 は部屋番号）
  s = s.replace(/(?<=丁目|番地|番|号|-)\s+(?=\d)/g, "").replace(/(?<=\d)\s+(?=丁目|番地|番|号|-)/g, "");
  s = s.replace(/([一二三四五六七八九十〇]+)(?=丁目|番地|番|号)/g, (m, k) => {
    const n = kanjiNum(k);
    return n === null ? m : String(n);
  });
  // 数字と数字のあいだのハイフン類・「?」（データ化けで - が ? になっている行がある）・「の」
  s = s.replace(/(?<=\d)[\u2010-\u2015\u2212\u30fc\uff0d?]+(?=\d)/g, "-").replace(/(?<=\d)の(?=\d)/g, "-");
  s = s.replace(/(?<=\d)丁目(?=\d)/g, "-").replace(/(?<=\d)丁目/g, "");
  s = s.replace(/(?<=\d)番地(?=\d)/g, "-").replace(/(?<=\d)番地/g, "");
  s = s.replace(/(?<=\d)番(?=\d)/g, "-").replace(/(?<=\d)番(?!地)/g, "");
  s = s.replace(/(?<=\d)号/g, "");
  s = s.replace(/大字/g, "").replace(/[ヶヵケ]/g, "ケ").replace(/\s+/g, " ").trim();
  // 異体字: 曽/曾 髙/高 など。ヶ/ケ/が と ノ/之/の は、漢字にはさまれているときだけ同じ字にする（「市が尾」「坂ノ上」）
  s = s.replace(VARIANT_RE, (c) => VARIANT_PAIRS[c]);
  s = s.replace(new RegExp(`(?<=[${KANJI}])が(?=[${KANJI}])`, "g"), "ケ");
  s = s.replace(new RegExp(`(?<=[${KANJI}])[之の](?=[${KANJI}])`, "g"), "ノ");
  return s;
}
function addrParts(raw) {
  const s = normAddr(raw);
  const m = s.match(/^(\D*?)(\d+(?:-\d+)*)/);
  return { norm: s.replace(/ /g, ""), head: (m ? m[1] : s).replace(/ /g, ""), nums: m ? m[2].split("-").map(Number) : [] };
}

// 政令指定都市（区の名前が住所に入る市）。区の抜けを許すのはこの20市だけ
const DESIGNATED_CITIES = [
  "札幌市", "仙台市", "さいたま市", "千葉市", "横浜市", "川崎市", "相模原市", "新潟市", "静岡市", "浜松市",
  "名古屋市", "京都市", "大阪市", "堺市", "神戸市", "岡山市", "広島市", "北九州市", "福岡市", "熊本市",
];
const WARD_RE = new RegExp(`^((?:${PREFS.join("|")})?(?:${DESIGNATED_CITIES.join("|")}))[^区\\d]{1,4}区(?=.)`);
/** 政令市の head から区の名前を取り除いた形（区が入っていない head は null） */
const withoutWard = (head) => (WARD_RE.test(head) ? head.replace(WARD_RE, "$1") : null);
/** 町名の「ノ」（漢字にはさまれたもの）を取った形。「坂ノ上」と「坂上」を同じとみるため */
const dropNo = (head) => head.replace(new RegExp(`(?<=[${KANJI}])ノ(?=[${KANJI}])`, "g"), "");

/**
 * 住所の比べ方（決めた基準）:
 *   正規化(normAddr)後を「町名まで(head)」と「番地の数字列(nums)」に分け、
 *   exact  = head 完全一致 かつ nums 完全一致
 *   near   = head 完全一致 かつ nums の一方が他方の先頭一致で、短い方が2個以上（建物名・部屋番号などの末尾差）
 *            または、head が次のどちらかの許容でだけちがい、nums が完全一致（許容を使ったら exact にはせず near どまり）
 *              ・町名の「ノ」の有無（坂ノ上 / 坂上）
 *              ・政令市で、片方にだけ区の名前がある（横浜市荏田東 / 横浜市都筑区荏田東。市+町名+番地が同じで区だけ無いとき）
 *   coarse = シートの住所に番地が無い／1個（○丁目のみ）で、町名まで一致 → 確認不十分
 *   none   = それ以外（町名がちがう・番地がちがう）
 * 正規化の中でならすもの: 全角半角・ハイフン類・丁目/番/号・漢数字・「東京都東京都」の二重・異体字（曽/曾 ヶ/ケ/が ノ/之/の 髙/高 など）
 */
export function compareAddr(sheetAddr, placeAddr) {
  const a = addrParts(sheetAddr);
  const b = addrParts(placeAddr);
  const base = { sheetNorm: a.norm, placeNorm: b.norm };
  if (!b.norm) return { ...base, level: "unknown", detail: "マップ側に住所が出ていない" };
  let tolerance = null; // head が許容でだけちがうとき、その説明
  if (a.head !== b.head) {
    const sameNums = a.nums.length > 0 && a.nums.join("-") === b.nums.join("-");
    const aw = withoutWard(a.head);
    const bw = withoutWard(b.head);
    if (dropNo(a.head) === dropNo(b.head)) tolerance = "町名の「ノ」の有無だけがちがう";
    else if (sameNums && bw !== null && aw === null && bw === a.head) tolerance = "マップ側にだけ区の名前がある（政令市）";
    else if (sameNums && aw !== null && bw === null && aw === b.head) tolerance = "シート側にだけ区の名前がある（政令市）";
    if (!tolerance) {
      if (a.nums.length === 0 && a.head.length >= 5 && b.head.startsWith(a.head))
        return { ...base, level: "coarse", detail: "シートの住所に番地なし（市区町村まで一致）" };
      return { ...base, level: "none", detail: `町名までがちがう（シート:${a.head} / マップ:${b.head}）` };
    }
  }
  const r = compareNums(a, b, sheetAddr, placeAddr);
  if (tolerance) {
    const detail = `${r.detail}／${tolerance}（シート:${a.head} / マップ:${b.head}）`;
    return { ...base, level: r.level === "exact" ? "near" : r.level, detail };
  }
  return { ...base, ...r };
}
/** head が同じ（許容を含む）ときの番地の比べ方 */
function compareNums(a, b, sheetAddr, placeAddr) {
  if (a.nums.length === 0) return { level: "coarse", detail: "シートの住所に番地なし（町名まで一致）" };
  const [sh, lg] = a.nums.length <= b.nums.length ? [a.nums, b.nums] : [b.nums, a.nums];
  if (!sh.every((n, i) => n === lg[i])) return { level: "none", detail: `番地がちがう（シート:${a.nums.join("-")} / マップ:${b.nums.join("-")}）` };
  if (a.nums.length === b.nums.length) return { level: "exact", detail: "町名・番地とも一致" };
  if (sh.length >= 2) return { level: "near", detail: `番地一致（末尾の差: シート${a.nums.join("-")} / マップ${b.nums.join("-")}）` };
  // 短い側が「○○町374」のように丁目を持たない1個だけの番地なら、長い側の「374-1」は枝番・部屋番号の差とみなす
  const shorterRaw = (a.nums.length <= b.nums.length ? sheetAddr : placeAddr) || "";
  if (!/[\d一二三四五六七八九十]\s*丁目/.test(shorterRaw.normalize("NFKC")))
    return { level: "near", detail: `番地一致（丁目なしの番地に枝番の差: シート${a.nums.join("-")} / マップ${b.nums.join("-")}）` };
  return { level: "coarse", detail: `シート側が${a.nums.join("-")}までで番地まで確認できない（マップ:${b.nums.join("-")}）` };
}

const stripSym = (s) => s.replace(/[^\p{L}\p{N}]/gu, "");
const toKata = (s) => s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
function nameVariants(raw) {
  const n = toKata((raw || "").normalize("NFKC").toLowerCase());
  const noBr = n.replace(/[【\[(（《〈「『][^】\])）》〉」』]*[】\])）》〉」』]/g, "");
  return [...new Set([stripSym(n), stripSym(noBr)].filter(Boolean))];
}
/** exact = 記号・括弧書き・かな/カナ差をならして完全一致 / contains = 一方が他方を含む（3文字以上） / different */
export function nameRelation(a, b) {
  const A = nameVariants(a);
  const B = nameVariants(b);
  if (A.some((x) => B.includes(x))) return "exact";
  for (const x of A) for (const y of B) {
    const [s, l] = x.length <= y.length ? [x, y] : [y, x];
    if (s.length >= 3 && l.includes(s)) return "contains";
  }
  return "different";
}

// ------------------------------------------------------------------ マップ画面の読み取り（fetch-gbp-details.mjs から写した部品）
function coordsFromUrl(url) {
  const p = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (p) return { lat: parseFloat(p[1]), lng: parseFloat(p[2]) };
  const a = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (a) return { lat: parseFloat(a[1]), lng: parseFloat(a[2]) };
  return { lat: null, lng: null };
}
function canonicalGbpUrl(url) {
  const m = url.match(/!1s0x[0-9a-f]+:0x([0-9a-f]+)/i);
  if (m) {
    try {
      return `https://maps.google.com/?cid=${BigInt("0x" + m[1]).toString()}`;
    } catch {}
  }
  return null;
}
function normalizeHoursText(t) {
  const s = (t || "").replace(/時間変更の可能性/g, "").replace(/\s+/g, " ").trim();
  if (!s) return null;
  if (!/\d+時\d*分?/.test(s)) return s.replace(/\s/g, "");
  return s
    .replace(/(\d{1,2})時(\d{1,2})分/g, (_, h, m) => `${h.padStart(2, "0")}:${m.padStart(2, "0")}`)
    .replace(/(\d{1,2})時/g, (_, h) => `${h.padStart(2, "0")}:00`)
    .replace(/[～〜~]/g, "–")
    .replace(/\s*–\s*/g, "–");
}
function hoursFromRows(rows) {
  if (!rows.length) return null;
  if (new Set(rows.map((r) => r.day)).size < 7) return null; // 描画途中の可能性: 部分値は出さない
  const byDay = {};
  for (const r of rows) {
    if (r.day in byDay) continue;
    const parts = r.cells.map(normalizeHoursText).filter(Boolean);
    byDay[r.day] = parts.length ? parts.join(", ") : null;
  }
  const o = {};
  for (const d of DAYS) if (d in byDay) o[d] = byDay[d];
  return o;
}
const readHoursRows = (page) =>
  page.evaluate(() => {
    const txt = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
    for (const table of document.querySelectorAll("table")) {
      const rows = [];
      for (const tr of table.querySelectorAll("tr")) {
        const tds = tr.querySelectorAll("td");
        if (tds.length < 2) continue;
        const day = txt(tds[0]);
        if (!/^[月火水木金土日]曜日([(（].*[)）])?$/.test(day)) continue; // 祝日の週は「月曜日(スポーツの日（振替休日）)」のように注記が付く
        const lis = [...tds[1].querySelectorAll("li")].map(txt).filter(Boolean);
        const cell = lis.length ? lis : [tds[1].getAttribute("aria-label") || txt(tds[1])];
        rows.push({ day: day[0], cells: cell });
      }
      if (rows.length) return rows;
    }
    return [];
  });
const countDayRows = async (page) => (await readHoursRows(page)).length;
async function pollDayRows(page, ms) {
  const until = Date.now() + ms;
  let n = await countDayRows(page);
  while (n > 0 && n < 7 && Date.now() < until) {
    await page.waitForTimeout(400);
    n = await countDayRows(page);
  }
  if (n === 0) {
    await page.waitForTimeout(Math.min(1200, ms));
    n = await countDayRows(page);
  }
  return n;
}
async function expandHours(page) {
  if ((await countDayRows(page)) >= 7) return;
  for (const sel of ['button[data-item-id="oh"]', 'div[aria-expanded][jsaction*="openhours"]', 'div.OMl5r', '[aria-label*="1 週間の営業時間を表示"]']) {
    const loc = page.locator(sel).first();
    if (!(await loc.count())) continue;
    try {
      await loc.focus({ timeout: 2000 });
      await page.keyboard.press("Enter");
    } catch {}
    if ((await pollDayRows(page, 3000)) >= 7) return;
    try {
      await loc.click({ timeout: 2500 });
    } catch {
      continue;
    }
    if ((await pollDayRows(page, 3000)) >= 7) return;
  }
}

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
    await page.waitForSelector('button[data-item-id="address"], tr', { timeout: 8_000 });
  } catch {}
  await page.waitForTimeout(1500);
  await pollDayRows(page, 2500);
}

/** 店名・住所・業種の表示・URL だけを軽く読む（候補の突き合わせ用。営業時間は開かない） */
async function readLight(page) {
  const raw = await page.evaluate(() => {
    const txt = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
    const h1 = [...document.querySelectorAll("h1")].map(txt).filter(Boolean)[0] || null;
    const addrBtn = document.querySelector('button[data-item-id="address"]');
    const cat = document.querySelector("button.DkEaL") || document.querySelector('button[jsaction*="category"]');
    return { name: h1, address: addrBtn?.getAttribute("aria-label") || null, category: cat ? txt(cat) : null };
  });
  const clean = (x) => (x == null ? x : x.replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, "").trim());
  raw.name = clean(raw.name);
  raw.category = clean(raw.category);
  const address = raw.address ? clean(raw.address).replace(/^住所:\s*/, "").replace(/^〒\s*\d{3}-?\d{4}\s*/, "").trim() || null : null;
  return { name: raw.name, address, category: raw.category, url: page.url() };
}

const CLOSED_RE = /閉業|閉店|閉鎖|営業終了|移転/;
/** 到達した店のパネルから、営業時間・電話・サイト・予約リンク・閉業表示・オーナー文 などを読む（星・口コミ・価格帯・写真は読まない） */
async function readFull(page) {
  const raw = await page.evaluate(() => {
    const txt = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
    const out = {};
    const phoneBtn = document.querySelector('button[data-item-id^="phone"]');
    out.phoneLabel = phoneBtn?.getAttribute("aria-label") || null;
    out.phoneId = phoneBtn?.getAttribute("data-item-id") || null;
    out.website = document.querySelector('a[data-item-id="authority"]')?.getAttribute("href") || null;

    const main = document.querySelector('[role="main"]') || document.body;
    // 予約リンク（外部サイトへのリンクで、ラベルか文字に「予約」を含むもの）
    const reserve = [];
    for (const a of main.querySelectorAll("a[href]")) {
      const label = a.getAttribute("aria-label") || txt(a);
      if (!/予約/.test(label)) continue;
      const href = a.href || "";
      if (!/^https?:/.test(href) || /google\.[a-z.]+\/maps/.test(href)) continue;
      reserve.push({ label: label.slice(0, 40), url: href });
    }
    out.reserve = reserve;

    // 閉業・臨時休業の表示（短い葉要素だけ。口コミ本文は長いので拾わない）
    const sig = [];
    for (const e of main.querySelectorAll("span, div")) {
      if (e.children.length > 0) continue;
      const t = txt(e);
      if (t.length > 20) continue;
      if (/^(完全に|恒久的に)?(閉業|閉店|閉鎖)|^臨時休業|^一時休業|^営業終了|^移転/.test(t)) sig.push(t);
    }
    out.status = [...new Set(sig)];

    // 店の人が書いた文: 概要の「提供元: オーナー」の直後の文。実測では「お知らせ・ブログの投稿の抜粋（日付つき）」で、紹介文とは限らない。そのまま記録
    const lines = (main.innerText || "").split("\n").map((l) => l.trim());
    const i = lines.findIndex((l) => /^提供元:\s*オーナー/.test(l));
    let owner = null;
    if (i >= 0) {
      const buf = [];
      for (let j = i + 1; j < lines.length && buf.join("").length < 600; j++) {
        const l = lines[j];
        if (!l) {
          if (buf.length) break;
          continue;
        }
        if (/^(詳細|写真|クチコミ|もっと見る|情報の修正を提案|概要)$/.test(l) || /^\d+\s*(分|時間|日|週間|か月|ヶ月|年)前$/.test(l)) break;
        buf.push(l);
      }
      owner = buf.join("\n").slice(0, 600) || null;
    }
    out.ownerPost = owner;
    return out;
  });

  let hours = hoursFromRows(await readHoursRows(page));
  if (!hours) {
    await expandHours(page);
    hours = hoursFromRows(await readHoursRows(page));
  }
  let phone = null;
  if (raw.phoneLabel) phone = raw.phoneLabel.replace(/^電話番号:\s*/, "").trim() || null;
  if (!phone && raw.phoneId) {
    const m = raw.phoneId.match(/tel:(\d+)/);
    if (m) phone = m[1];
  }
  const seen = new Set();
  const reserveLinks = [];
  for (const r of raw.reserve) {
    let u = r.url;
    try {
      const x = new URL(u);
      x.searchParams.delete("rwg_token"); // 追跡用トークンは落とす
      u = x.href;
    } catch {}
    if (seen.has(u)) continue;
    seen.add(u);
    reserveLinks.push({ label: r.label, url: u });
    if (reserveLinks.length >= 3) break;
  }
  return {
    phone,
    website: raw.website || null,
    hours,
    reserveLinks,
    statusSignals: raw.status,
    closedSignal: raw.status.some((s) => CLOSED_RE.test(s)),
    ownerPost: raw.ownerPost,
  };
}

// ------------------------------------------------------------------ 特定
/** share.google など HTTP だけで辿る（検索ページはブラウザで開かない）。q と kgmid を返す */
async function followShare(u) {
  let cur = u;
  for (let i = 0; i < 6; i++) {
    const res = await fetch(cur, { headers: { "User-Agent": "Mozilla/5.0 machinowa/1.0" }, redirect: "manual" });
    const loc = res.headers.get("location");
    if (!loc) break;
    const next = new URL(loc, cur);
    if (/\/sorry\//.test(next.pathname) || next.hostname.startsWith("consent.")) throw new BlockedError(`share の転送先が確認ページ: ${next.href.slice(0, 100)}`);
    if (next.hostname.endsWith("google.com") && next.pathname === "/search")
      return { followedUrl: next.href, q: next.searchParams.get("q"), kgmid: next.searchParams.get("kgmid") };
    cur = next.href;
  }
  return { followedUrl: null, q: null, kgmid: null };
}
async function followMapsApp(u) {
  try {
    const res = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 machinowa/1.0" }, redirect: "manual" });
    return res.headers.get("location") || null;
  } catch {
    return null;
  }
}
function parseSearchUrl(u) {
  try {
    const x = new URL(u);
    return { q: x.searchParams.get("q"), kgmid: x.searchParams.get("kgmid") };
  } catch {
    return { q: null, kgmid: null };
  }
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
  const items = await page.$$eval('a[href*="/maps/place/"]', (as) => as.map((a) => ({ href: a.href, label: a.getAttribute("aria-label") || "" })));
  const seen = new Set();
  const hrefs = [];
  for (const it of items) {
    const key = it.href.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    hrefs.push(it.href);
  }
  return hrefs.length ? { kind: "list", hrefs } : { kind: "none" };
}

const includesKg = (url, kg) => !!kg && decodeURIComponent(url).includes(kg);

/**
 * 1行を処理して記録（rec）を返す。
 * 特定の方針:
 *   cid / place / maps.app … そのURLが指す店（直接）。住所を比べて判定
 *   share … HTTP転送先の検索URLの q と kgmid（店の固定ID）を取る。マップ検索結果のうち kgmid が一致する店だけを採る。
 *           見つからなければ 店名+住所 の検索に切り替え、住所が合う店だけを採る
 *   search / hotpepper / official … 店名+住所 でマップ検索。住所が合う店だけを採る（検索URLに kgmid があれば一致の印として記録）
 */
async function processRow(ctx, tab, r) {
  const rec = {
    tab,
    tabEn: TAB_EN[tab],
    row: r.row,
    sheet: { name: r.name, address: r.address, url: r.url, type: r.type, d1: r.d1, d2: r.d2 },
    urlKind: kindOf(r.url),
    route: null,
    followedUrl: null,
    kgmidHint: null,
    queries: [],
    candidates: [],
    finalUrl: null,
    verdict: null,
    verdictReason: null,
    addressCompare: null,
    nameRelation: null,
    place: null,
    landedPlace: null,
    fetchedAt: null,
    seconds: null,
  };
  T0 = Date.now();
  const page = await ctx.newPage();
  const consider = []; // 評価した候補 [{light, cmp, rel, kg}]
  let chosen = null; // {light, cmp, rel, kg, page は開いたまま}

  /** いま開いているページを候補として評価する */
  const evalCurrent = async (kgHint) => {
    lap("evalCurrent start");
    const light = await readLight(page);
    lap("readLight done");
    const cmp = compareAddr(r.address, light.address);
    const rel = light.name ? nameRelation(r.name, light.name) : "different";
    const kg = includesKg(light.url, kgHint);
    const c = { light, cmp, rel, kg };
    rec.candidates.push({
      name: light.name,
      address: light.address,
      url: light.url.replace(/\?.*$/, ""),
      addressLevel: cmp.level,
      addressDetail: cmp.detail,
      nameRelation: rel,
      kgmidMatch: kgHint ? kg : null,
    });
    consider.push(c);
    return c;
  };
  const good = (c) => c.cmp.level === "exact" || c.cmp.level === "near";

  try {
    const kind = rec.urlKind;
    if (kind === "cid" || kind === "place" || kind === "maps.app") {
      rec.route = "direct";
      if (kind === "maps.app") rec.followedUrl = await followMapsApp(r.url);
      await page.goto(r.url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await waitForPlacePanel(page);
      await assertNotBlocked(page);
      if (/\/maps\/place\//.test(page.url())) chosen = await evalCurrent(null);
      else rec.verdictReason = `リンク先が店の画面にならなかった: ${page.url().slice(0, 100)}`;
    } else {
      let kg = null;
      const queries = [];
      if (kind === "share") {
        const s = await followShare(r.url);
        rec.followedUrl = s.followedUrl;
        kg = s.kgmid;
        rec.kgmidHint = kg;
        rec.route = kg ? "kgmid→住所" : "住所";
        if (s.q && kg && !/^Eg/.test(s.q)) queries.push({ q: s.q, mode: "kgmid" });
      } else if (kind === "search") {
        const s = parseSearchUrl(r.url);
        kg = s.kgmid;
        rec.kgmidHint = kg;
        rec.route = "店名+住所";
      } else {
        rec.route = "店名+住所";
      }
      queries.push({ q: `${r.name} ${r.address.replace(/^〒?\s*\d{3}-?\d{4}\s*/, "")}`.trim(), mode: "address" });
      const pref = (normAddr(r.address).match(/^(.+?[都道府県].+?[市区町村郡])/) || [])[1];
      if (pref) queries.push({ q: `${r.name} ${pref}`, mode: "address" });
      // 店名の【　】や（　）の中が本来の店名のことがある（例: 「…Men's Salon【金活堂】」）。3回目の検索はその中身で（住所の一致は同じく確かめる）
      const inner = (r.name.match(/[【\[（(]([^】\])）)]+)[】\])）)]/) || [])[1];
      if (inner && inner.trim().length >= 2) queries.push({ q: `${inner.trim()} ${pref || ""}`.trim(), mode: "address" });

      outer: for (const [qi, qq] of queries.entries()) {
        if (qi > 0) await sleep(2000 + Math.random() * 1500);
        rec.queries.push(qq.q);
        const res = await mapsSearch(page, qq.q);
        if (res.kind === "none") continue;
        if (res.kind === "place") {
          const c = await evalCurrent(kg);
          if (qq.mode === "kgmid") {
            if (c.kg) {
              chosen = c;
              break outer;
            }
            continue; // kgmid が合わない店には採用しない
          }
          if (good(c)) {
            chosen = c;
            break outer;
          }
          continue;
        }
        // 一覧: kgmid 一致を先に、それ以外は並びの順で最大 MAX_CANDIDATES 件
        let hrefs = res.hrefs;
        if (kg) hrefs = [...hrefs.filter((h) => includesKg(h, kg)), ...hrefs.filter((h) => !includesKg(h, kg))];
        if (qq.mode === "kgmid") hrefs = hrefs.filter((h) => includesKg(h, kg));
        for (const [hi, href] of hrefs.slice(0, MAX_CANDIDATES).entries()) {
          if (hi > 0) await sleep(1500 + Math.random() * 1500);
          await page.goto(href, { waitUntil: "domcontentloaded", timeout: 30_000 });
          await waitForPlacePanel(page);
          if (!/\/maps\/place\//.test(page.url())) continue;
          const c = await evalCurrent(kg);
          if (qq.mode === "kgmid" ? c.kg : good(c)) {
            chosen = c;
            break outer;
          }
        }
      }
      // 住所が「粗い一致」の候補しか無い場合は、それを選んで「確認不十分」にする（現在のページは最後の候補なので開き直す）
      if (!chosen) {
        const coarse = consider.find((c) => c.cmp.level === "coarse");
        if (coarse) {
          await page.goto(coarse.light.url, { waitUntil: "domcontentloaded", timeout: 30_000 });
          await waitForPlacePanel(page);
          chosen = await evalCurrent(kg);
          chosen = { ...chosen, cmp: coarse.cmp, rel: coarse.rel };
        }
      }
      // kgmid で特定できたが住所が合わない店（古い住所など）は、その店を「不一致」として残す
      if (!chosen && kind === "share" && kg) {
        const byKg = consider.find((c) => c.kg);
        if (byKg) chosen = byKg;
      }
    }

    // ------------------------------------------------ 判定
    if (!chosen) {
      rec.verdict = "見つからない";
      rec.verdictReason ||= consider.length
        ? `住所が合う店が見つからなかった（候補${consider.length}件を確認: ${consider.map((c) => `${c.light.name}／${c.light.address}`).join(" | ")}）`
        : "マップ検索で候補が出なかった／店の画面に到達できなかった";
    } else {
      const { light, cmp, rel } = chosen;
      rec.finalUrl = light.url;
      rec.addressCompare = { sheet: r.address, place: light.address, sheetNorm: cmp.sheetNorm, placeNorm: cmp.placeNorm, level: cmp.level, detail: cmp.detail };
      rec.nameRelation = rel;
      lap("readFull start");
      let full = good(chosen) || cmp.level === "coarse" ? await readFull(page) : null;
      if (full && !full.hours) {
        // 営業時間が出ているはずなのに読めない（描画の取りこぼし）なら、1回だけ開き直して読み直す
        const hint = await page.evaluate(() => /曜日|営業時間|営業中|営業開始|定休日/.test(((document.querySelector('[role="main"]') || document.body).innerText || "").slice(0, 3000))).catch(() => false);
        if (hint) {
          await page.reload({ waitUntil: "domcontentloaded", timeout: 30_000 });
          await waitForPlacePanel(page);
          const again = await readFull(page);
          rec.hoursRetried = !!again.hours;
          if (again.hours) full = again;
        }
      }
      lap("readFull done");
      const { lat, lng } = coordsFromUrl(light.url);
      const summary = {
        name: light.name,
        address: light.address,
        category: light.category,
        lat,
        lng,
        gbpUrl: canonicalGbpUrl(light.url),
      };
      if (cmp.level === "exact" || cmp.level === "near") {
        if (full.closedSignal) {
          rec.verdict = "閉業の表示あり";
          rec.verdictReason = `住所は一致（${cmp.detail}）だが、画面に「${full.statusSignals.join(" / ")}」の表示`;
        } else if (rel === "different" && ACCEPT.has(`${TAB_EN[tab]}-${r.row}`)) {
          // 発注者が確認して同じ店と決めた行。住所が一致（exact/near）している場合だけここに来る
          rec.verdict = "一致";
          rec.verdictReason = `住所一致（${cmp.detail}）／店名: シート「${r.name}」とマップ「${light.name}」は書き方がちがうが、発注者が確認して同じ店と決めた行（--accept）`;
          rec.acceptedByOwnerCheck = true;
          rec.acceptedFrom = { verdict: "住所は一致で店名がちがう", sheetName: r.name, mapName: light.name };
          ACCEPT_APPLIED.add(`${TAB_EN[tab]}-${r.row}`);
        } else if (rel === "different") {
          rec.verdict = "住所は一致で店名がちがう";
          rec.verdictReason = `住所一致（${cmp.detail}）。シート「${r.name}」とマップ「${light.name}」で店名が合わない（改称・同じ建物の別店・シートの表記ゆれのいずれか未確認）`;
        } else {
          rec.verdict = "一致";
          rec.verdictReason = `住所一致（${cmp.detail}）／店名: ${rel === "exact" ? "完全一致（記号・括弧書きをならして）" : "一方が他方を含む（住所一致が決め手）"}`;
        }
      } else if (cmp.level === "coarse") {
        if (full.closedSignal) {
          rec.verdict = "閉業の表示あり";
          rec.verdictReason = `住所は粗い一致（${cmp.detail}）。画面に「${full.statusSignals.join(" / ")}」の表示`;
        } else {
          rec.verdict = "住所が粗く確認不十分";
          rec.verdictReason = `${cmp.detail}／店名: ${rel}`;
        }
      } else {
        rec.verdict = rec.route === "direct" || (rec.kgmidHint && chosen.kg) ? "不一致" : "見つからない";
        rec.verdictReason = `${cmp.detail || "住所がちがう"}（シート:${r.address} / マップ:${light.address}）／店名: シート「${r.name}」マップ「${light.name}」(${rel})`;
      }
      const ok = ["一致", "住所は一致で店名がちがう", "住所が粗く確認不十分", "閉業の表示あり"].includes(rec.verdict);
      if (ok) rec.place = { ...summary, ...full };
      else rec.landedPlace = summary;
    }
  } catch (e) {
    if (e instanceof BlockedError) {
      rec.verdict = "止められた";
      rec.verdictReason = e.message;
      rec.blocked = true;
    } else {
      rec.verdict = "エラー";
      rec.verdictReason = String(e.message || e).slice(0, 300);
    }
  } finally {
    await page.close().catch(() => {});
  }
  rec.fetchedAt = new Date().toISOString();
  return rec;
}

// ------------------------------------------------------------------ CLI
function parseRows(s) {
  const set = new Set();
  for (const part of s.split(",")) {
    const m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!m) continue;
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    for (let i = a; i <= b; i++) set.add(i);
  }
  return set;
}
function parseArgs(argv) {
  const a = { tab: null, rows: null, limit: null, list: null, force: false, accept: [] };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--tab") a.tab = argv[++i];
    else if (t === "--rows") a.rows = parseRows(argv[++i]);
    else if (t === "--limit") a.limit = Number(argv[++i]);
    else if (t === "--list") a.list = argv[++i];
    else if (t === "--force") a.force = true;
    else if (t === "--accept") {
      for (const k of (argv[++i] || "").split(",").map((x) => x.trim()).filter(Boolean)) {
        if (!/^(beauty|bodycare|pet|lodging)-\d+$/.test(k)) throw new Error(`--accept のキーが読めない: ${k}（例 beauty-100）`);
        a.accept.push(k);
      }
    }
  }
  return a;
}
const tabName = (t) => (TAB_EN[t] ? t : Object.keys(TAB_EN).find((k) => TAB_EN[k] === t) || null);

async function main() {
  const args = parseArgs(process.argv.slice(2));
  for (const k of args.accept) ACCEPT.add(k);
  const sheet = JSON.parse(readFileSync(path.join(HERE, "sheet.json"), "utf8"));
  let tasks = [];
  if (args.list) {
    const list = JSON.parse(readFileSync(path.resolve(REPO, args.list), "utf8"));
    for (const it of list) {
      const tab = tabName(it.tab);
      const r = sheet[tab]?.find((x) => x.row === it.row);
      if (r) tasks.push({ tab, r });
    }
  } else {
    const tabs = args.tab ? [tabName(args.tab)].filter(Boolean) : Object.keys(TAB_EN);
    if (args.tab && !tabs.length) throw new Error(`タブが分からない: ${args.tab}`);
    for (const tab of tabs) for (const r of sheet[tab]) if (!args.rows || args.rows.has(r.row)) tasks.push({ tab, r });
  }
  mkdirSync(OUT_DIR, { recursive: true });
  const fileOf = (tab, row) => path.join(OUT_DIR, `${TAB_EN[tab]}-${row}.json`);
  tasks = tasks.filter(({ tab, r }) => {
    if (args.force) return true;
    const f = fileOf(tab, r.row);
    if (!existsSync(f)) return true;
    try {
      return RETRY_VERDICTS.has(JSON.parse(readFileSync(f, "utf8")).verdict);
    } catch {
      return true;
    }
  });
  if (args.limit != null) tasks = tasks.slice(0, args.limit);
  console.error(`処理する行: ${tasks.length}`);
  if (!tasks.length) return;

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ userAgent: UA, locale: "ja-JP", viewport: { width: 1280, height: 900 } });
  // ウォームアップ（最初の1件が半端な表示になるのを防ぐ）
  {
    const w = await ctx.newPage();
    try {
      await w.goto("https://www.google.com/maps?hl=ja", { waitUntil: "domcontentloaded", timeout: 30_000 });
      await w.waitForTimeout(2500);
    } catch {}
    await w.close().catch(() => {});
  }

  const summary = { total: tasks.length, done: 0, byVerdict: {}, seconds: [], stoppedBy: null, acceptedApplied: [], acceptListedButNotApplied: [] };
  try {
    for (const [i, { tab, r }] of tasks.entries()) {
      if (i > 0) await sleep(3000 + Math.random() * 3000);
      const t0 = Date.now();
      let timer;
      const rec = await Promise.race([
        processRow(ctx, tab, r),
        new Promise((res) => {
          timer = setTimeout(() => res({ tab, tabEn: TAB_EN[tab], row: r.row, sheet: { name: r.name, address: r.address, url: r.url }, urlKind: kindOf(r.url), verdict: "エラー", verdictReason: `${ROW_DEADLINE_MS / 1000}秒で打ち切り`, fetchedAt: new Date().toISOString() }), ROW_DEADLINE_MS);
        }),
      ]);
      clearTimeout(timer);
      rec.seconds = Math.round((Date.now() - t0) / 100) / 10;
      const f = fileOf(tab, r.row);
      writeFileSync(f + ".tmp", JSON.stringify(rec, null, 2) + "\n");
      renameSync(f + ".tmp", f);
      summary.done++;
      summary.seconds.push(rec.seconds);
      summary.byVerdict[rec.verdict] = (summary.byVerdict[rec.verdict] || 0) + 1;
      console.error(`[${i + 1}/${tasks.length}] ${TAB_EN[tab]}-${r.row} ${rec.urlKind} → ${rec.verdict} (${rec.seconds}s) ${rec.place?.name || rec.landedPlace?.name || ""}`);
      if (rec.blocked) {
        summary.stoppedBy = rec.verdictReason;
        console.error(`確認ページ/アクセス制限を検出したため全体を停止する（回避しない）: ${rec.verdictReason}`);
        break;
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }
  summary.acceptedApplied = [...ACCEPT_APPLIED];
  summary.acceptListedButNotApplied = [...ACCEPT].filter((k) => !ACCEPT_APPLIED.has(k));
  console.log(JSON.stringify(summary, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(`[fatal] ${e.message}`);
    process.exit(1);
  });
}
