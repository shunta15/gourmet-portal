#!/usr/bin/env node
/**
 * build-stores.mjs
 *
 * 「記事（/feature/<記事ID>）はあるが店舗ページが無い店」を店舗ページ（/restaurant/<id>）にするための
 * Restaurant データを組み立てる。何度でも再実行できる（同じ入力なら同じ出力。ID は ids.json で固定）。
 *
 * 入力
 *   automation/stores500/map.json              [{articleId, sheetName, mapsUrl}]
 *   automation/stores500/gbp/<記事ID>.json     Googleマップ店舗パネルの値（fetch-gbp-details.mjs の出力）
 *                                              → 存在する店だけ出力する（取得途中でも動く）
 *   lib/teleapo-features.ts                    記事本体
 *   public/restaurants/teleapo-<記事ID>/       店の画像
 *
 * 出力
 *   lib/articleStores.ts                       ARTICLE_STORES（自動生成・手で編集しない）
 *   lib/articleRegions.ts                      既存16地域に入らない都道府県の地域定義（出力した店がある県だけ）
 *   lib/geo.ts                                 GBP の座標を src:"maps" / precision:"exact" でマージ
 *   automation/stores500/ids.json              記事ID → 店舗ID（r299〜。再実行しても不変）
 *   automation/stores500/excluded.json         出力しなかった店と理由
 *   automation/stores500/tag-evidence.json     シーンタグごとの根拠
 *   automation/stores500/warnings.json         出力はしたが人の目で見たほうがよい点
 *
 * 守ること（PLAN.md）: 推測で埋めない。無い値は「—」か省略。誇張しない。実在店・事実のみ。
 *
 * 使い方: node automation/stores500/build-stores.mjs [--dry]
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const DRY = process.argv.includes("--dry");
const abs = (...p) => path.join(ROOT, ...p);
const readJson = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);

const FIRST_ID = 299; // r299 から
const SOURCE_LABEL = "Google ビジネスプロフィール";
const UNKNOWN_CONFIRM = "—（訪問前に公式確認）";
const DAYS = ["月", "火", "水", "木", "金", "土", "日"];

// ============================================================ 読み込み

const map = readJson(abs("automation/stores500/map.json"), []);
const articles = (await import(new URL("../../lib/teleapo-features.ts", import.meta.url).href))
  .TELEAPO_FEATURE_ARTICLES;
const SCENES = (await import(new URL("../../lib/scenes.ts", import.meta.url).href)).SCENES;
const SCENE_VOCAB = new Set(SCENES.flatMap((s) => s.matchTags));

const ids = readJson(abs("automation/stores500/ids.json"), {});

// 実写かどうかの判定: プレースホルダ3枚と中身が同じ画像は実写ではない（ファイルサイズでなく md5 で比べる）
const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
const PLACEHOLDER_DIR = abs("public/restaurants/_placeholder");
const PLACEHOLDER_MD5 = new Set(
  readdirSync(PLACEHOLDER_DIR).map((f) => md5(path.join(PLACEHOLDER_DIR, f))),
);
const PH_HERO = "/restaurants/_placeholder/feature-hero.jpg";
const PH_GALLERY = [
  "/restaurants/_placeholder/feature-hero.jpg",
  "/restaurants/_placeholder/feature-point.jpg",
  "/restaurants/_placeholder/feature-og.jpg",
];

// 既存店舗（重複検査用）。data.ts / teleapo-restaurants.ts を id 単位に切って 店名・電話・Maps URL を拾う
function readExistingStores() {
  const out = [];
  for (const f of ["lib/data.ts", "lib/teleapo-restaurants.ts"]) {
    const src = readFileSync(abs(f), "utf8");
    const marks = [...src.matchAll(/^\s*id:\s*"(r\d+)"\s*,/gm)];
    marks.forEach((m, i) => {
      const chunk = src.slice(m.index, i + 1 < marks.length ? marks[i + 1].index : src.length);
      out.push({
        id: m[1],
        name: (chunk.match(/^\s*name:\s*"([^"]*)"/m) || [])[1] || "",
        phone: (chunk.match(/^\s*phone:\s*"([^"]*)"/m) || [])[1] || "",
        cid: (chunk.match(/[?&]cid=(\d+)/) || [])[1] || "",
      });
    });
  }
  return out;
}
const existing = readExistingStores();
const digits = (s) => String(s || "").replace(/\D/g, "");

// ============================================================ 都道府県・地域

const PREFS = [
  // [都道府県, 地域キー, 地域名, 英名, 既存16地域か]
  ["北海道", "hokkaido", "北海道", "Hokkaido", true],
  ["青森県", "aomori", "青森", "Aomori"],
  ["岩手県", "iwate", "岩手", "Iwate"],
  ["宮城県", "miyagi", "宮城", "Miyagi"],
  ["秋田県", "akita", "秋田", "Akita"],
  ["山形県", "yamagata", "山形", "Yamagata"],
  ["福島県", "fukushima", "福島", "Fukushima"],
  ["茨城県", "ibaraki", "茨城", "Ibaraki"],
  ["栃木県", "tochigi", "栃木", "Tochigi"],
  ["群馬県", "gunma", "群馬", "Gunma", true],
  ["埼玉県", "saitama", "埼玉", "Saitama", true],
  ["千葉県", "chiba", "千葉", "Chiba"],
  ["東京都", "tokyo", "東京", "Tokyo", true],
  ["神奈川県", "kanagawa", "神奈川", "Kanagawa", true],
  ["新潟県", "niigata", "新潟", "Niigata"],
  ["富山県", "toyama", "富山", "Toyama"],
  ["石川県", "ishikawa", "石川", "Ishikawa"],
  ["福井県", "fukui", "福井", "Fukui"],
  ["山梨県", "yamanashi", "山梨", "Yamanashi"],
  ["長野県", "nagano", "長野", "Nagano"],
  ["岐阜県", "gifu", "岐阜", "Gifu"],
  ["静岡県", "shizuoka", "静岡", "Shizuoka", true],
  ["愛知県", "nagoya", "名古屋", "Nagoya", true], // 既存の対応: 愛知県全体 → nagoya
  ["三重県", "mie", "三重", "Mie"],
  ["滋賀県", "shiga", "滋賀", "Shiga", true],
  ["京都府", "kyoto", "京都", "Kyoto", true],
  ["大阪府", "osaka", "大阪", "Osaka", true],
  ["兵庫県", "hyogo", "神戸・兵庫", "Hyogo", true],
  ["奈良県", "nara", "奈良", "Nara", true],
  ["和歌山県", "wakayama", "和歌山", "Wakayama", true],
  ["鳥取県", "tottori", "鳥取", "Tottori"],
  ["島根県", "shimane", "島根", "Shimane"],
  ["岡山県", "okayama", "岡山", "Okayama"],
  ["広島県", "hiroshima", "広島", "Hiroshima", true],
  ["山口県", "yamaguchi", "山口", "Yamaguchi"],
  ["徳島県", "tokushima", "徳島", "Tokushima"],
  ["香川県", "kagawa", "香川", "Kagawa"],
  ["愛媛県", "ehime", "愛媛", "Ehime"],
  ["高知県", "kochi", "高知", "Kochi"],
  ["福岡県", "fukuoka", "福岡", "Fukuoka", true],
  ["佐賀県", "saga", "佐賀", "Saga"],
  ["長崎県", "nagasaki", "長崎", "Nagasaki"],
  ["熊本県", "kumamoto", "熊本", "Kumamoto"],
  ["大分県", "oita", "大分", "Oita"],
  ["宮崎県", "miyazaki", "宮崎", "Miyazaki"],
  ["鹿児島県", "kagoshima", "鹿児島", "Kagoshima", true],
  ["沖縄県", "okinawa", "沖縄", "Okinawa"],
].map(([pref, key, name, nameEn, base]) => ({ pref, key, name, nameEn, base: !!base }));
const PREF_BY_NAME = new Map(PREFS.map((p) => [p.pref, p]));
const PREF_RE = /^(北海道|東京都|京都府|大阪府|.{2,3}県)/;

// 政令指定都市（市のあとに区が続く）
const DESIGNATED = new Set([
  "札幌市", "仙台市", "さいたま市", "千葉市", "横浜市", "川崎市", "相模原市", "新潟市", "静岡市", "浜松市",
  "名古屋市", "京都市", "大阪市", "堺市", "神戸市", "岡山市", "広島市", "北九州市", "福岡市", "熊本市",
]);

/** 住所 → { pref, muni, city, ward, town }。判定できなければ null */
function parseAddress(address) {
  const a = String(address || "").trim();
  const pm = a.match(PREF_RE);
  if (!pm || !PREF_BY_NAME.has(pm[1])) return null;
  const rest = a.slice(pm[1].length);
  let m;
  // 郡 + 町村: 糟屋郡志免町（先頭が「郡」の郡山市・郡上市などはここに入らない）
  if ((m = rest.match(/^([^\d郡市区町村]{1,5}郡[^\d郡市区町村]{1,5}[町村])/))) {
    return { pref: pm[1], muni: m[1], city: m[1], ward: "", town: m[1].replace(/^.*郡/, "") };
  }
  // 市（名前に 市 を含む 四日市市・野々市市・志布志市・市原市 も、最初の「市」で切らず次の「市」まで見る）
  for (const city of ["四日市市", "野々市市", "志布志市"]) {
    if (rest.startsWith(city)) return withWard(pm[1], city, rest.slice(city.length));
  }
  if ((m = rest.match(/^([^\d]{1,6}?市)/))) return withWard(pm[1], m[1], rest.slice(m[1].length));
  // 区（東京23区）・町・村
  if ((m = rest.match(/^([^\d郡市区町村]{1,6}[区町村])/))) {
    return { pref: pm[1], muni: m[1], city: m[1], ward: "", town: "" };
  }
  return null;
}
function withWard(pref, city, after) {
  let ward = "";
  if (DESIGNATED.has(city)) {
    const w = after.match(/^([^\d郡市区町村]{1,5}区)/);
    if (w) ward = w[1];
  }
  return { pref, muni: city + ward, city, ward, town: "" };
}
const coreOfMuni = (s) => String(s || "").replace(/[市区町村]$/, "");

// ============================================================ 文字列ユーティリティ

/** 照合用の正規化: NFKC・小文字・かな統一（カタカナ→ひらがな）・記号と空白を除去 */
function norm(s) {
  return String(s || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[^\p{L}\p{N}]/gu, "");
}
function longestCommonSubstring(a, b) {
  let best = 0;
  let prev = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    const cur = new Array(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        cur[j] = prev[j - 1] + 1;
        if (cur[j] > best) best = cur[j];
      }
    }
    prev = cur;
  }
  return best;
}
/** 住所の整形: 全角数字→半角、ダッシュ類→"-"、全角空白→半角空白（郵便番号は GBP 側で除去済み） */
function cleanAddress(a) {
  return String(a || "")
    .normalize("NFKC")
    .replace(/[−‐‑–—－]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}
const uniq = (arr) => [...new Set(arr.filter(Boolean))];

// ============================================================ 営業時間

const WINDOW_RE = /^(\d{1,2}):(\d{2})[–-](\d{1,2}):(\d{2})$/;
const toMin = (h, m) => parseInt(h, 10) * 60 + parseInt(m, 10);

/** "11:00–14:00, 17:00–00:00" → [{open, close(翌日にまたがれば +1440), text}] / 時間でない文字列なら null */
function parseWindows(text) {
  const parts = String(text).split(/,\s*/);
  const wins = [];
  for (const p of parts) {
    const m = p.trim().match(WINDOW_RE);
    if (!m) return null;
    const open = toMin(m[1], m[2]);
    let close = toMin(m[3], m[4]);
    if (close <= open) close += 1440; // 00:00 閉店・翌1:00 閉店など
    wins.push({ open, close, text: p.trim() });
  }
  return wins;
}

function dayLabel(days) {
  // days: 曜日インデックス（昇順）。3連続以上は「A〜B」、それ以外は個別に「・」でつなぐ
  const parts = [];
  let i = 0;
  while (i < days.length) {
    let j = i;
    while (j + 1 < days.length && days[j + 1] === days[j] + 1) j++;
    if (j - i >= 2) parts.push(`${DAYS[days[i]]}〜${DAYS[days[j]]}`);
    else for (let k = i; k <= j; k++) parts.push(DAYS[days[k]]);
    i = j + 1;
  }
  return parts.join("・");
}

/** GBP の曜日別営業時間 → { hours, closed, perDay } */
function summarizeHours(hoursObj) {
  const unknown = { hours: UNKNOWN_CONFIRM, closed: UNKNOWN_CONFIRM, perDay: null };
  if (!hoursObj || typeof hoursObj !== "object") return unknown;
  const texts = DAYS.map((d) => hoursObj[d]);
  if (texts.some((t) => typeof t !== "string" || !t.trim())) return unknown; // 1日でも欠けたら全体を採用しない
  const closedDays = [];
  const groups = new Map(); // text → [dayIndex]
  texts.forEach((t, i) => {
    if (t === "定休日") closedDays.push(i);
    else {
      if (!groups.has(t)) groups.set(t, []);
      groups.get(t).push(i);
    }
  });
  if (groups.size === 0) return unknown; // 7日とも定休日は信用しない
  const lines = [...groups.entries()]
    .sort((a, b) => a[1][0] - b[1][0])
    .map(([t, ds]) => `${ds.length === 7 ? "毎日" : dayLabel(ds)} ${t}`);
  const closed =
    closedDays.length === 0
      ? "なし（Googleマップの営業時間による）"
      : closedDays.length === 1
        ? `${DAYS[closedDays[0]]}曜日`
        : closedDays.map((d) => `${DAYS[d]}曜`).join("・");
  return { hours: lines.join(" / "), closed, perDay: texts };
}

/** 営業時間からのタグ根拠: ランチ（14:00以前の開店）/ 深夜営業（24:00以降の閉店） */
function hoursTags(perDay) {
  const out = [];
  if (!perDay) return out;
  let lunch = null;
  let late = null;
  perDay.forEach((t, i) => {
    if (t === "定休日") return;
    if (/24時間/.test(t)) {
      lunch = lunch || { day: DAYS[i], text: t };
      late = late || { day: DAYS[i], text: t };
      return;
    }
    const wins = parseWindows(t);
    if (!wins) return;
    for (const w of wins) {
      // 開店が14:00以前。ただし昼の時間帯（11:00〜）にかかる営業だけ（早朝のみ・深夜帯のみの窓は除く）
      if (!lunch && w.open <= 14 * 60 && w.close > 11 * 60) lunch = { day: DAYS[i], text: w.text };
      if (!late && w.close >= 24 * 60) late = { day: DAYS[i], text: w.text };
    }
  });
  if (lunch)
    out.push({ tag: "ランチ", rule: "hours: 開店が14:00以前（11:00以降にかかる営業）", evidence: `${lunch.day} ${lunch.text}` });
  if (late)
    out.push({ tag: "深夜営業", rule: "hours: 閉店が24:00以降", evidence: `${late.day} ${late.text}` });
  return out;
}

// ============================================================ 記事 specs

const SPEC_KEYS = {
  seats: ["席数", "総席数", "座席数", "席", "座席", "席構成", "座席構成", "席種", "席タイプ", "座席タイプ", "客席"],
  nearest: ["最寄り駅", "最寄り", "最寄駅", "アクセス"],
  budget: ["予算", "予算目安", "価格帯", "価格"],
  cuisine: ["業態", "ジャンル"],
  scene: ["用途", "利用シーン", "向くシーン", "向く使い方", "向く利用", "対応シーン", "向く場面", "向く人", "利用", "使い方", "向いている使い方"],
};

function collectSpecs(article) {
  const out = [];
  for (const r of article.ranking || []) for (const s of r.specs || []) out.push({ k: s.k, v: String(s.v || "").trim() });
  return out;
}
/** keys の優先順に最初の値を返す（無ければ null） */
function pickSpec(specs, keys, ok = () => true) {
  for (const k of keys) {
    const hit = specs.find((s) => s.k === k && s.v && ok(s.v));
    if (hit) return hit;
  }
  return null;
}
const isVague = (v) => /^(不明|未確認|要確認|—|-|来店時に確認|訪問前に確認|訪問前に.*確認)$/.test(v.trim());

// ============================================================ タグ

const NEG_SEAT = {
  個室: /(?<!半)個室[^。／/、,]{0,3}(なし|無し|ない|なく|不可|ありません|できません)/,
  貸切: /(貸切|貸し切り)[^。／/、,]{0,6}(不可|できません|なし|無し|ない|不可能)/,
  宴会: /宴会[^。／/、,]{0,4}(不可|できません|なし|無し|ない)/,
};
const startsNegative = (v) => /^(なし|無し|ない|不可|不明|未確認|要確認|—|-|ありません)/.test(v.trim());

function sceneTagsFromSpecs(specs) {
  const out = [];
  const seatVals = specs.filter((s) => SPEC_KEYS.seats.includes(s.k));
  for (const s of seatVals) {
    if (/(?<!半)個室/.test(s.v) && !NEG_SEAT.個室.test(s.v))
      out.push({ tag: "個室", rule: "席表記に「個室」", evidence: `${s.k}: ${s.v}` });
    if (/貸切|貸し切り/.test(s.v) && !NEG_SEAT.貸切.test(s.v))
      out.push({ tag: "貸切可", rule: "席表記に「貸切」", evidence: `${s.k}: ${s.v}` });
    if (/座敷|宴会/.test(s.v) && !NEG_SEAT.宴会.test(s.v))
      out.push({ tag: "宴会", rule: "席表記に「座敷」「宴会」", evidence: `${s.k}: ${s.v}` });
  }
  // 記事に専用の項目（個室 / 貸切 / 宴会）がある場合は、その値が肯定のときだけ
  for (const s of specs) {
    if (s.k === "個室" && !startsNegative(s.v) && !NEG_SEAT.個室.test(s.v) && /\d|あり|可|完全|半/.test(s.v) && !/半個室$/.test(s.v))
      out.push({ tag: "個室", rule: "記事 specs「個室」項目が肯定", evidence: `${s.k}: ${s.v}` });
    if (s.k === "貸切" && !startsNegative(s.v) && !NEG_SEAT.貸切.test(s.v))
      out.push({ tag: "貸切可", rule: "記事 specs「貸切」項目が肯定", evidence: `${s.k}: ${s.v}` });
    if (s.k === "宴会" && !startsNegative(s.v) && !NEG_SEAT.宴会.test(s.v))
      out.push({ tag: "宴会", rule: "記事 specs「宴会」項目が肯定", evidence: `${s.k}: ${s.v}` });
  }
  // 推奨シーン・用途の項目に、語彙と一致する語があれば
  const SCENE_WORDS = [
    [/デート/, "デート"],
    [/接待/, "接待"],
    [/女子会/, "女子会"],
    [/宴会|歓送迎会|忘新年会|忘年会|新年会/, "宴会"],
    [/貸切|貸し切り/, "貸切可"],
    [/個室/, "個室"],
    [/一人飲み|ひとり飲み/, "一人飲み"],
    [/ランチ/, "ランチ"],
    [/深夜/, "深夜営業"],
    [/ペット(同伴)?可/, "ペット可"],
  ];
  for (const s of specs.filter((x) => SPEC_KEYS.scene.includes(x.k))) {
    for (const [re, tag] of SCENE_WORDS) {
      const m = s.v.match(re);
      if (!m) continue;
      const after = s.v.slice(m.index + m[0].length, m.index + m[0].length + 8);
      if (/^(には|は)?(向かない|不向き|不可|NG|難しい|おすすめしない|対応していない)/.test(after)) continue;
      if (tag === "個室" && /半個室/.test(s.v) && !/(?<!半)個室/.test(s.v)) continue;
      out.push({ tag, rule: "記事 specs の推奨シーン/用途に語彙一致", evidence: `${s.k}: ${s.v}` });
    }
  }
  return out;
}

/** 業態文字列 → シーン語彙に一致するタグ（そば・うどん / パン） */
function cuisineVocabTags(cuisine) {
  const out = [];
  const add = (tag, why) => out.push({ tag, rule: "業態がシーン語彙に一致", evidence: `${cuisine}（${why}）` });
  if (/蕎麦|そば|ソバ/.test(cuisine)) add("そば", "そば");
  if (/うどん|饂飩/.test(cuisine)) add("うどん", "うどん");
  if (/パン屋|ベーカリー|ブーランジェリー|パン店|パン専門/.test(cuisine)) {
    add("パン", "パン");
    add("ベーカリー", "ベーカリー");
  }
  return out.filter((t) => SCENE_VOCAB.has(t.tag));
}

// ============================================================ 駅名

const OPERATOR_PREFIX =
  /^(JR東日本|JR西日本|JR東海|JR九州|JR北海道|JR|東京メトロ|都営地下鉄|都営|札幌市営地下鉄|地下鉄|市営地下鉄|市営|大阪メトロ|阪急|阪神|近鉄|京阪|南海|名鉄|西鉄|東急|京急|京成|小田急|西武|東武|相鉄|伊予鉄|北陸鉄道|ゆいレール|北九州モノレール|ことでん)/;
function stationOf(nearest) {
  if (!nearest) return null;
  const q = nearest.match(/「([^」]{1,10})」駅/);
  if (q) return `${q[1]}駅`;
  const m = nearest.match(/([一-龥々ァ-ヶー]{1,12}駅)/);
  if (!m) return null;
  const bare = m[1].replace(OPERATOR_PREFIX, "");
  return bare.replace(/駅$/, "").length >= 2 ? bare : m[1];
}

// ============================================================ 文章

const ANCHOR = /開業|創業|開店|オープン|営む|営業|手がけ|運営|提供する|提供して|出す|揃える|供する|改装|移転|構える|店を|開いた/;
const BAD_FOR_DESC =
  /目に留まる|まとう|まとい|ふわり|一線を画|印象|ようだ|ような|かもしれ|落ち着い|心地|ゆったり|隠れ家|名店|絶品|人気|話題|評判|こだわり|ならでは|魅力|至福|格別|極上|向く|受け止め|候補|おきたい|思い|漂う|佇ま|たたずま|ひそやか|ひっそり|静か|賑|にぎ|愛され|親しま|定番|穴場|知る人|名前が挙がる|だけが|穏やか|のどか|のんびり|素朴|温かい|温もり|ぬくもり|やさしい|優しい|美しい|豊か|活気|あふれ|溢れ|ほっと|くつろ|えんだ|懐の深/;
// 前の文を受ける言い方（直前の文なしでは意味が通らない）
const ANAPHORA = /その|この|こうした|そうした|そんな|こんな|あの|それ|ここ|そこ|こちら/;
// 店名の一部としては弱い一般語（これだけで「その店の文」とは見なさない）
const GENERIC_NAME_TOKENS = new Set(
  ["カフェ", "レストラン", "居酒屋", "食堂", "ラーメン", "イタリア", "イタリアン", "バル", "ダイニング", "cafe", "bar", "bistro", "kitchen", "coffee", "restaurant", "ビストロ", "珈琲", "喫茶", "和食", "焼肉", "寿司", "お食事処"].map(norm),
);
function nameTokens(name, articleId) {
  const full = norm(name);
  const minLen = full.length <= 3 ? 2 : 3; // 「大和」「秋桜」のような短い店名は2文字から
  const toks = String(name).split(/[\s　・&＆\-]+/).map(norm).filter((t) => t.length >= minLen && !GENERIC_NAME_TOKENS.has(t));
  if (full.length >= minLen && !GENERIC_NAME_TOKENS.has(full)) toks.push(full);
  const id = norm(articleId);
  if (id.length >= minLen && id.length <= 12) toks.push(id);
  return uniq(toks);
}

/**
 * lede から、その店を紹介している事実の文を1〜2文（120字以内）選ぶ。選べなければ null。
 *  - 店名か「◯◯年」で始まる節から後ろだけを使う（「公園の入口とは〜という立地に、」のような、前の文を受けた書き出しは落とす）
 *  - 印象・形容の語を含むものは採らない（BAD_FOR_DESC）
 *  - 「その」「この」で前の文を受けているときは、直前の文も一緒に採る（それも不可なら採らない）
 *  言い換えはしない。lede の文をそのまま（前方を切るだけ）使う。
 */
function pickDesc(lede, name, articleId) {
  const sentences = String(lede || "")
    .replace(/\s+/g, " ")
    .split(/(?<=。)/)
    .map((x) => x.trim())
    .filter(Boolean);
  const toks = nameTokens(name, articleId);
  const startsWithName = (c) => toks.some((t) => norm(c).startsWith(t));
  const YEAR_START = /^(\d{4}年|[〇一二三四五六七八九十]{4}年)/;
  const ok = (x) => x && !BAD_FOR_DESC.test(x);
  for (let i = 0; i < Math.min(sentences.length, 6); i++) {
    const clauses = sentences[i].split("、");
    let k = -1;
    for (let c = 0; c < clauses.length; c++) {
      const cl = clauses[c].replace(/^[「『（(]/, "");
      if (startsWithName(cl) || YEAR_START.test(cl)) {
        k = c;
        break;
      }
    }
    if (k < 0) continue;
    const text = clauses.slice(k).join("、");
    if (text.length < 28 || !ok(text) || /(は|が)(ある|あります)。$/.test(text)) continue; // 「〜はある。」は場所が前の文にある
    if (!(ANCHOR.test(text) || /[はがを]/.test(text))) continue;
    // その店の名前が出てくる文だけ（「2010年の創業から〜」のように主語が前の文にある文は採らない）
    if (!toks.some((t) => norm(text).includes(t))) continue;
    let run = [text];
    if (ANAPHORA.test(text)) {
      // 「その」「この」で前を受けている。直前が lede の第1文（場面設定の書き出し）のときだけ、一緒に採る
      const prev = sentences[0];
      if (i !== 1 || k !== 0 || !ok(prev) || ANAPHORA.test(prev)) continue;
      run = [prev, text];
    } else {
      const next = sentences[i + 1];
      if (ok(next) && !ANAPHORA.test(next) && ANCHOR.test(next) && text.length + next.length <= 120) run.push(next);
    }
    const out = run.join("");
    if (out.length <= 120) return out;
  }
  return null;
}

function cleanCuisine(specValue, category) {
  const fallback = category || "飲食店";
  if (!specValue) return { cuisine: fallback, from: category ? "GBPカテゴリ" : "既定" };
  const v = specValue.replace(/[（(][^）)]*[）)]/g, "").replace(/\s+/g, " ").trim();
  // 業態でなく店の説明になっているもの（長い / 姉妹店・系列・併設・運営 など）は使わない
  if (!v || v.length > 20 || /姉妹店|系列|グループ|併設|運営|の店$|地域密着/.test(v))
    return { cuisine: fallback, from: category ? "GBPカテゴリ（業態specsが店の説明/長い）" : "既定" };
  return { cuisine: v, from: "記事specs" };
}

/** 最寄り・アクセス欄から、営業時間・定休日・電話の混入部分を落とす */
function cleanNearest(v) {
  let t = String(v);
  // 先頭が住所（「静岡県三島市…1F。三島広小路駅から…」）なら、住所の文を落とす
  if (PREF_RE.test(t) && /。/.test(t)) t = t.slice(t.indexOf("。") + 1);
  return t
    .replace(/\s*[、,／/・]?\s*(営業|定休|電話|TEL|Tel)[\s\S]*$/, "")
    .replace(/[、,／/\s]+$/, "")
    .trim();
}

// ============================================================ 画像

function listImages(articleId) {
  const dir = abs("public/restaurants", `teleapo-${articleId}`);
  if (!existsSync(dir)) return { real: [], hasDir: false, hero: false };
  const files = readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort((a, b) => (/^hero\./i.test(a) ? -1 : /^hero\./i.test(b) ? 1 : a.localeCompare(b, "en")));
  const enc = (s) => s.replace(/[?#%]/g, (c) => encodeURIComponent(c));
  const real = [];
  let hero = false;
  for (const f of files) {
    if (PLACEHOLDER_MD5.has(md5(path.join(dir, f)))) continue;
    if (/^hero\./i.test(f)) hero = true;
    real.push(`/restaurants/${enc(`teleapo-${articleId}`)}/${enc(f)}`);
  }
  return { real, hasDir: true, hero };
}

// ============================================================ 1店ぶん

const STATUS_CLOSED_RE = /閉業|臨時休業|一時休業|営業終了|移転/;

function buildStore(entry, gbp, article, storeId) {
  const warnings = [];
  const specs = collectSpecs(article);
  const addr = parseAddress(gbp.address);
  const prefInfo = PREF_BY_NAME.get(addr.pref);
  const address = cleanAddress(gbp.address);
  const area = `${addr.pref}・${addr.muni}`;

  // --- 営業時間 / 定休日
  const hs = summarizeHours(gbp.hours);

  // --- 業態
  const cuisineSpec = pickSpec(specs, SPEC_KEYS.cuisine);
  const { cuisine, from: cuisineFrom } = cleanCuisine(cuisineSpec?.v, gbp.category);

  // --- 席・アクセス・予算（記事 specs にある場合だけ。無ければ「—」/ 省略）
  const seatSpec = pickSpec(specs, SPEC_KEYS.seats, (v) => !isVague(v));
  const seats = seatSpec ? seatSpec.v : UNKNOWN_CONFIRM;
  const nearSpec = pickSpec(specs, SPEC_KEYS.nearest, (v) => !isVague(v) && cleanNearest(v).length > 0);
  const nearest = nearSpec ? cleanNearest(nearSpec.v) : "—";
  const budgetSpec = pickSpec(specs, SPEC_KEYS.budget, (v) => /\d|[０-９]|[千万]円|¥|￥/.test(v) && !isVague(v));
  const budget = budgetSpec ? budgetSpec.v : undefined;

  // --- 画像
  const imgs = listImages(entry.articleId);
  const image = imgs.real[0] || PH_HERO;
  const heroImages = imgs.real.length ? imgs.real.slice(0, 5) : [PH_HERO];
  const gallery = imgs.real.length ? imgs.real.slice(0, 6) : [...PH_GALLERY];

  // --- highlights
  const highlights = (article.ranking || [])
    .map((r) => String(r.name || "").trim())
    .filter(Boolean)
    .slice(0, 5);

  // --- desc
  let desc = pickDesc(article.lede, gbp.name, entry.articleId);
  let descFrom = "lede";
  if (!desc) {
    descFrom = "fallback";
    const kind = cuisine.replace(/[（(].*$/, "");
    const nearShort = nearest !== "—" ? nearest.split(/[／/。、]/)[0].trim() : "";
    desc = `${addr.pref}${addr.muni}の${kind}。${nearShort ? `最寄りは${nearShort}。` : ""}`;
    if (desc.length > 120) desc = `${addr.pref}${addr.muni}の${kind}。`;
    warnings.push("desc は lede から事実の文を選べず、事実から作った定型文");
  }

  // --- body（記事の要約ではなく、事実から作る2段落）
  const p1 =
    `${gbp.name}は、${addr.pref}${addr.muni}にあるお店です。業態は「${cuisine}」、所在地は${address}` +
    `${nearest !== "—" ? `、最寄りは${nearest}` : ""}です。` +
    (highlights.length
      ? `マチノワ編集部の特集記事では、${highlights.slice(0, 2).map((h) => `「${h}」`).join("・")}などを取り上げています。`
      : "");
  const p2parts = [];
  if (hs.perDay) {
    const closedPlain = hs.closed.replace(/（Googleマップ.*）$/, "");
    p2parts.push(
      closedPlain === "なし"
        ? `営業時間は${hs.hours}で、定休日はありません（Googleマップの営業時間による）。`
        : `営業時間は${hs.hours}、定休日は${closedPlain}です（Googleマップの営業時間による）。`,
    );
  } else p2parts.push("営業時間と定休日は取得できていないため、訪問前に公式の情報でご確認ください。");
  if (seatSpec) p2parts.push(`席は${seats}。`);
  if (budget) p2parts.push(`予算の目安は${budget}。`);
  p2parts.push("営業時間や価格は変わることがあるため、訪問前に公式サイトやSNS、お電話でご確認ください。");
  const body = [p1, p2parts.join("")];

  // --- 電話 / Instagram
  const phone = gbp.phone ? String(gbp.phone).trim() : undefined;
  let instagram;
  if (gbp.website) {
    try {
      const u = new URL(gbp.website);
      if (/(^|\.)instagram\.com$/.test(u.hostname) && u.pathname.replace(/\/+$/, "").length > 1) {
        instagram = `https://www.instagram.com${u.pathname.replace(/\/+$/, "")}`;
      }
    } catch {
      /* URL でなければ無視 */
    }
  }

  // --- タグ
  const evidence = [];
  const station = stationOf(nearest === "—" ? "" : nearest);
  const muniTag = addr.ward || addr.town || addr.city;
  const category = gbp.category && gbp.category.length <= 14 ? gbp.category : "";
  const vocab = [...cuisineVocabTags(cuisine), ...(cuisineFrom === "記事specs" ? cuisineVocabTags(category) : [])];
  const baseTags = [cuisine.length <= 14 ? cuisine : category, category, ...vocab.map((t) => t.tag), muniTag, station];
  evidence.push(...vocab);
  const seen = new Set();
  const sceneEv = [...sceneTagsFromSpecs(specs), ...hoursTags(hs.perDay)]
    .filter((e) => SCENE_VOCAB.has(e.tag))
    .filter((e) => (seen.has(JSON.stringify(e)) ? false : seen.add(JSON.stringify(e))));
  evidence.push(...sceneEv);
  const tags = uniq([...baseTags, ...sceneEv.map((e) => e.tag)]);

  const store = {
    id: storeId,
    name: String(gbp.name).trim(),
    cuisine,
    area,
    region: prefInfo.key,
    shape: "square",
    image,
    heroImages,
    gallery,
    desc,
    address,
    hours: hs.hours,
    closed: hs.closed,
    seats,
    nearest,
    ...(budget ? { budget } : {}),
    ...(phone ? { phone } : {}),
    ...(instagram ? { instagram } : {}),
    source: { label: SOURCE_LABEL, url: gbp.gbpUrl },
    body,
    highlights,
    tags,
    featureId: entry.articleId,
  };

  const geo =
    typeof gbp.lat === "number" && typeof gbp.lng === "number" && gbp.lat >= 24 && gbp.lat <= 46 && gbp.lng >= 122 && gbp.lng <= 146
      ? { lat: Math.round(gbp.lat * 1e6) / 1e6, lng: Math.round(gbp.lng * 1e6) / 1e6, src: "maps", precision: "exact" }
      : null;
  if (!geo) warnings.push("GBP に座標が無い（地図は出ない）");
  if (!imgs.real.length) warnings.push("実写画像なし（プレースホルダ → noindex）");
  if (!hs.perDay) warnings.push("営業時間が取れていない（noindex）");
  if (cuisineFrom !== "記事specs") warnings.push(`cuisine は ${cuisineFrom}`);

  return {
    store,
    geo,
    warnings,
    evidence,
    meta: { descFrom, pref: addr.pref, muni: addr.muni, heroReal: imgs.hero },
  };
}

// ============================================================ 検査（出力しない店の判定）

function checkExcluded(entry, gbp, article) {
  if (!article) return { reason: "記事が lib/teleapo-features.ts に無い" };
  if (!gbp.name) return { reason: "GBP に店名が無い" };
  if (!gbp.address) return { reason: "GBP に住所が無い（地域を決められない）" };
  if (gbp.status && STATUS_CLOSED_RE.test(gbp.status))
    return { reason: `GBP の状態が「${gbp.status}」`, detail: gbp.address };
  const addr = parseAddress(gbp.address);
  if (!addr) return { reason: "GBP の住所から都道府県・市区町村を判定できない", detail: gbp.address };

  // 店名: GBP 名が、スプシの店名・記事ID・記事タイトルのどれかと対応するか。
  // 表記の文字種が違う（カナ ⇔ 英字）ものは機械では判定できないので、除外せず warnings に出す。
  const nName = norm(gbp.name);
  const latinRatio = (t) => (t.match(/[a-z]/g) || []).length / Math.max(1, t.length);
  const refs = [entry.sheetName, entry.articleId, article.title].map(norm).filter(Boolean);
  let compared = 0;
  let nameOk = false;
  for (const r of refs) {
    if (r.includes(nName) || nName.includes(r)) {
      nameOk = true;
      break;
    }
    if (Math.abs(latinRatio(nName) - latinRatio(r)) > 0.5) continue; // 文字種が違いすぎて比べられない
    compared++;
    if (nName.length > 2 && longestCommonSubstring(nName, r) >= Math.min(3, nName.length)) {
      nameOk = true;
      break;
    }
  }
  if (!nameOk && compared > 0)
    return {
      reason: "GBP の店名が記事・スプシの店名と対応しない（別の店の疑い）",
      detail: `GBP「${gbp.name}」/ スプシ「${entry.sheetName}」/ 記事ID「${entry.articleId}」`,
    };
  if (!nameOk) nameWarn.set(entry.articleId, `店名の表記が違う（GBP「${gbp.name}」/ スプシ「${entry.sheetName}」。カナ⇔英字で機械判定不能・場所は一致）`);

  // 場所: 記事の住所 specs の都道府県・市区町村が GBP と食い違わないか
  const specs = collectSpecs(article);
  for (const s of specs.filter((x) => ["住所", "所在地", "所在", "住所・電話", "所在地・アクセス", "所在・連絡先"].includes(x.k))) {
    const a2 = parseAddress(s.v.replace(/^〒\d{3}-?\d{4}\s*/, ""));
    if (a2 && a2.pref !== addr.pref)
      return { reason: "記事の住所と GBP の都道府県が違う", detail: `記事「${s.v}」/ GBP「${gbp.address}」` };
    if (a2 && coreOfMuni(a2.city) !== coreOfMuni(addr.city))
      return { reason: "記事の住所と GBP の市区町村が違う", detail: `記事「${s.v}」/ GBP「${gbp.address}」` };
  }
  // 場所: 記事本文に、GBP の都道府県か市区町村が1度も出てこない
  const text = [
    article.title,
    article.subtitle,
    article.kicker,
    article.lede,
    article.closing,
    ...(article.ranking || []).flatMap((r) => [r.area, r.name, r.desc, ...(r.specs || []).map((s) => s.v)]),
  ].join(" ");
  const prefShort = addr.pref === "北海道" ? "北海道" : addr.pref.replace(/[都府県]$/, "");
  const cores = uniq([coreOfMuni(addr.city), addr.ward ? coreOfMuni(addr.ward) : ""]).filter((c) => c.length >= 2);
  if (!text.includes(prefShort) && !cores.some((c) => text.includes(c)))
    return {
      reason: "記事本文に GBP の都道府県・市区町村が出てこない（別の店の疑い）",
      detail: `GBP「${gbp.address}」/ 記事「${article.title}」`,
    };
  return null;
}

// ============================================================ メイン

const nameWarn = new Map(); // 店名の表記違いで機械判定できなかった店（出力はする）
const stores = []; // 出力する店
const excluded = [];
const warnings = {};
const tagEvidence = {};
const geoAdds = {};
const seenCid = new Map();
let pending = 0;
let idsDirty = false;

const usedNums = Object.values(ids).map((v) => parseInt(String(v).slice(1), 10)).filter(Number.isFinite);
let nextNum = Math.max(FIRST_ID - 1, ...usedNums) + 1;

for (const entry of map) {
  const gbpPath = abs("automation/stores500/gbp", `${entry.articleId}.json`);
  if (!existsSync(gbpPath)) {
    pending++;
    continue;
  }
  let gbp;
  try {
    gbp = JSON.parse(readFileSync(gbpPath, "utf8"));
  } catch {
    pending++; // 書き込み途中の可能性。次回の実行で拾う
    continue;
  }
  const article = articles[entry.articleId];

  let ex = checkExcluded(entry, gbp, article);
  if (!ex) {
    // 既存店舗・他の記事との重複
    const cid = (String(gbp.gbpUrl || "").match(/[?&]cid=(\d+)/) || [])[1] || "";
    const ph = digits(gbp.phone);
    const dupExisting = existing.find(
      (e) => (cid && e.cid === cid) || (ph.length >= 9 && digits(e.phone) === ph),
    );
    if (dupExisting)
      ex = { reason: `既存の店舗ページ（${dupExisting.id} ${dupExisting.name}）と同じ店`, detail: cid ? `cid=${cid}` : gbp.phone };
    else if (cid && seenCid.has(cid))
      ex = { reason: `別の記事（${seenCid.get(cid)}）と同じ GBP の店`, detail: `cid=${cid}` };
    else if (cid) seenCid.set(cid, entry.articleId);
  }
  if (ex) {
    excluded.push({ articleId: entry.articleId, name: gbp.name || null, reason: ex.reason, ...(ex.detail ? { detail: ex.detail } : {}) });
    continue;
  }

  let storeId = ids[entry.articleId];
  if (!storeId) {
    storeId = `r${nextNum++}`;
    ids[entry.articleId] = storeId;
    idsDirty = true;
  }
  const r = buildStore(entry, gbp, article, storeId);
  stores.push(r.store);
  if (nameWarn.has(entry.articleId)) r.warnings.push(nameWarn.get(entry.articleId));
  if (r.warnings.length) warnings[storeId] = { articleId: entry.articleId, name: r.store.name, warnings: r.warnings };
  tagEvidence[storeId] = { articleId: entry.articleId, name: r.store.name, tags: r.evidence };
  if (r.geo) geoAdds[storeId] = r.geo;
}

stores.sort((a, b) => parseInt(a.id.slice(1), 10) - parseInt(b.id.slice(1), 10));

// ------------------------------------------------------------ 地域（出力した店がある県のうち、既存16地域に入らないもの）
const regionDefs = {};
for (const p of PREFS.filter((x) => !x.base)) {
  const inPref = stores.filter((s) => s.region === p.key);
  if (!inPref.length) continue;
  const cityCount = new Map();
  for (const s of inPref) {
    const city = s.area.split("・")[1];
    cityCount.set(city, (cityCount.get(city) || 0) + 1);
  }
  const cities = [...cityCount.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja")).map(([c]) => c);
  const withPhoto = inPref.find((s) => !s.image.includes("_placeholder"));
  regionDefs[p.key] = {
    name: p.name,
    nameEn: p.nameEn,
    tagline: `${p.name}の街と店`,
    subtitle: `${cities.slice(0, 3).join("・")} ――― 掲載店を街ごとに。`,
    intro: `マチノワで紹介している${p.name}の飲食店を、街ごとにまとめています。${
      cities.length === 1 ? `${cities[0]}の店を掲載しています。` : `${cities.slice(0, 5).join("・")}などの店が並びます。`
    }営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。`,
    heroImages: [
      withPhoto ? withPhoto.image : "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=85",
    ],
    stats: [],
  };
}

// ------------------------------------------------------------ 出力
const header = `// 自動生成: node automation/stores500/build-stores.mjs（手で編集しない。再実行で上書きされる）
// 材料: automation/stores500/gbp/*.json（Googleマップ店舗パネル）+ lib/teleapo-features.ts（記事）+ public/restaurants/teleapo-*/（画像）
`;

const storesTs = `${header}// 店舗ID(r299〜)は automation/stores500/ids.json で固定。記事 /feature/<featureId> と対になる。
import type { Restaurant } from "./regions";

export const ARTICLE_STORES: Restaurant[] = ${JSON.stringify(stores, null, 2)};

/** 店舗ID → 特集記事ID */
export const ARTICLE_STORE_FEATURE_IDS: Record<string, string> = ${JSON.stringify(
  Object.fromEntries(stores.map((s) => [s.id, s.featureId])),
  null,
  2,
)};

/** 特集記事ID → 店舗ID */
export const ARTICLE_STORE_ID_BY_FEATURE: Record<string, string> = ${JSON.stringify(
  Object.fromEntries(stores.map((s) => [s.featureId, s.id])),
  null,
  2,
)};
`;

const regionsTs = `${header}// 既存16地域（lib/regions.ts）に入らない都道府県の地域定義。出力した店がある県だけ。
// 地域キー = 都道府県のローマ字。画像は、その県の店の実写があればそれ、無ければ他地域と同じ汎用の街角写真。
import type { Region } from "./regions";

export const ARTICLE_REGIONS = ${JSON.stringify(regionDefs, null, 2)} satisfies Record<string, Region>;

export type ArticleRegionKey = keyof typeof ARTICLE_REGIONS;
`;

// geo.ts: 既存の内容に、今回の店だけをマージ（過去に ids.json で払い出した ID は一度消してから入れ直す）
const geoPath = abs("lib/geo.ts");
const geoSrc = readFileSync(geoPath, "utf8");
const geoHead = geoSrc.slice(0, geoSrc.indexOf("export const GEO"));
const geoBody = geoSrc.slice(geoSrc.indexOf("= ", geoSrc.indexOf("export const GEO")) + 2).trim().replace(/;$/, "");
const geoObj = JSON.parse(geoBody);
for (const id of Object.values(ids)) delete geoObj[id];
Object.assign(geoObj, geoAdds);
const geoSorted = Object.fromEntries(Object.keys(geoObj).sort().map((k) => [k, geoObj[k]]));
const geoTs = `${geoHead}export const GEO: Record<string, GeoPoint> = ${JSON.stringify(geoSorted, null, 2)};
`;

const sortObj = (o) => Object.fromEntries(Object.entries(o).sort((a, b) => parseInt(a[1].slice(1), 10) - parseInt(b[1].slice(1), 10)));

const summary = {
  mapEntries: map.length,
  gbpPending: pending,
  output: stores.length,
  excluded: excluded.length,
  newRegions: Object.fromEntries(Object.keys(regionDefs).map((k) => [k, stores.filter((s) => s.region === k).length])),
};

if (DRY) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

writeFileSync(abs("lib/articleStores.ts"), storesTs);
writeFileSync(abs("lib/articleRegions.ts"), regionsTs);
writeFileSync(geoPath, geoTs);
if (idsDirty || !existsSync(abs("automation/stores500/ids.json")))
  writeFileSync(abs("automation/stores500/ids.json"), JSON.stringify(sortObj(ids), null, 2) + "\n");
writeFileSync(abs("automation/stores500/excluded.json"), JSON.stringify(excluded, null, 2) + "\n");
writeFileSync(abs("automation/stores500/tag-evidence.json"), JSON.stringify(tagEvidence, null, 2) + "\n");
writeFileSync(abs("automation/stores500/warnings.json"), JSON.stringify(warnings, null, 2) + "\n");

console.log(JSON.stringify(summary, null, 2));
