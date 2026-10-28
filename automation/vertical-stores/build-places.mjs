#!/usr/bin/env node
/**
 * build-places.mjs  —  vertical-stores（ビューティー・ボディケア・ペット・ステイ・体験・アクティビティ・スポーツ・くらし）
 *
 * gbp/<タブ>-<行>.json（Google マップで特定した店。verdict が「一致」だけ）＋ articles/<キー>.json（紹介記事）から、
 * サイトが読む店データ lib/places/generated/{beauty,bodycare,pet,stay,activity,sports,life}.json を作る。型は lib/places/types.ts の Place。
 * 出力は自動生成。手で編集しない（直すなら gbp / articles / このスクリプトを直して作り直す）。
 *
 * 既定: pilot.json にあるキーの店と、特集記事（features/<キー>.json）がある店のうち、紹介記事（articles/<キー>.json）か特集記事がある店だけを出す。
 * --all : 「一致」の全店を出す（記事が無い店は基本情報だけのページになる）。
 * --listed : 既定の店（紹介文つき）に加えて、basic.json（キーの配列。紹介文なし・基本情報だけで載せる店）にある店も出す。
 *
 * どのモードでも次は適用する（引数で場所を差し替えられる）:
 *  - 写真: photos/<キー>.json（{ key, images: [ { path, imageUrl, pageUrl, what, kind, width, height } ], note }）があれば、
 *          public/ に実在する画像だけを Place の image（1 枚め）・images（全部）・photos（説明・種類・寸法）に入れる。imageUrl・pageUrl は入れない。
 *          kind（写真の種類: exterior 外観 / room 客室 / bath 風呂 / meal 料理 / common 共用 / view 周辺の景色）は書いてあれば photos[].kind に入れる。
 *          店の写真の記録が無い・空（使える画像が 0 枚）の店は、公開する特集（--features のフォルダの features/<キー>.json）の images（hero・p1・p2）を使う。
 *  - 種類の上書き: category-overrides/<キー>.json（{ key, category, evidence }）があれば、その種類を使う。
 *          その業種の種類の slug（lib/verticals/<業種>.ts）に無い値は無効（使わない）。決められない店は、今までどおり unmapped.json へ（理由に無効の旨を足す）。
 *  - 載せない店: skipped/<キー>.json の reason が「掲載を見送る」で始まる店と、exclude.json（キーの配列）にある店は、どのモードでも出さない。
 * --rows : 対象の行の範囲を絞る（例: --rows beauty:2-129,bodycare:2-133。オーナーが指定した範囲）。
 *          書き方は <beauty|bodycare|pet|stay|activity|sports|life>:<開始行>-<終了行>（1 行だけなら <業種>:<行>）。範囲の外の店は、出さない・ID も払い出さない・
 *          unmapped.json にも入れない。--rows に書いていない業種は絞らない。指定しなければ今までと同じ（全行が対象）。
 *
 * 使い方:
 *   node automation/vertical-stores/build-places.mjs            # 試作の店だけ
 *   node automation/vertical-stores/build-places.mjs --all      # 全店
 *   node automation/vertical-stores/build-places.mjs --all --rows beauty:2-129,bodycare:2-133   # 指定の行の範囲の全店
 *   node automation/vertical-stores/build-places.mjs --dry      # 書き込まず、結果の要約だけ
 *   node automation/vertical-stores/build-places.mjs --listed  # 紹介文つきの店 + basic.json の店
 *   --pilot <file> --articles <dir> --ids <file> --out <dir> --unmapped <file>  # 場所の差し替え（試験用）
 *   --photos <dir> --public <dir> --category-overrides <dir> --skipped <dir> --exclude <file> --basic <file>  # 同上（試験用）
 *
 * 店 ID: ids.json（業種ごとに Google マップの cid → 店 ID）。ビューティー be0001〜、ボディケア bo0001〜、ペット pe0001〜、ステイ st0001〜、
 *        体験・アクティビティ ac0001〜、スポーツ sp0001〜、くらし li0001〜。
 *        一度払い出した ID は変えない（追記だけ）。シートの行がずれても、同じ店（同じ cid）は同じ ID。
 * 除外: 種類を決められない店・都道府県を決められない店・cid が無い／重複の店は、理由つきで unmapped.json に書く
 *       （推測で振り分けない）。unmapped.json は既定でも「一致」の全店を点検した結果。
 *
 * ペット: 種類と店 ID は pet-resolve.json（decisions[].category と idLedger。シートの業種ラベルを軸に公式サイトで確かめた判定）から読む。
 *         シートの全行を持つ gbp/pet-*.json のうち、判定で種類が決まらない店（category が null）は unmapped.json に理由つきで書く。
 *         タグは付けない（pet.ts の場面タグに当たる事実が無いため。ALLOWED_TAGS.pet は空）。
 *
 * 体験・アクティビティ / スポーツ / くらし（2026-10-22 追加。旧おでかけ・スポーツ・くらしの 3 業種）: 種類を決める自動の規則は持たない。
 *         種類は category-overrides/<キー>.json（{ key, category, evidence }）で 1 店ずつ決める（category は lib/verticals/{activity,sports,life}.ts の種類の slug。
 *         activity: sea-river / mountain-sky / craft / sightseeing、sports: gym / yoga-pilates / martial-arts / dance / golf / facility-goods、
 *         life: lesson / shrine-temple / fashion-craft / photo-marriage / car-repair / flower-farm / fortune）。上書きが無い店は unmapped.json に理由つきで書く（推測で振り分けない）。
 *         シートのタブ（gbp の tabEn）は、体験・アクティビティだけ leisure（キー leisure-<行>。店データの業種は activity）。スポーツ・くらしは sports / life がそのまま業種。
 *         タグは lib/verticals/{activity,sports,life}.ts の場面だけ（ALLOWED_TAGS）。料金・評価・効き目の語は記事の点検で警告する（FORBIDDEN_NEW）。
 *
 * ステイ（宿）: シートのタブ「宿泊施設」の gbp は tabEn が lodging（キー lodging-<行>）。店データの業種は stay（出力は stay.json）。
 *         種類と店 ID は stay-resolve.json（decisions[].category と idLedger。シートの業種ラベルを軸に公式サイトで確かめた判定）から読む。
 *         タグは 温泉・ペット同伴・素泊まり・一人旅・記念日 だけ（lib/verticals/stay.ts の場面）。根拠の factIndex が要る。
 *         客室・サイトの種類名（記事の rooms）は attributes.roomTypes に入れる（名前だけ）。
 *         Google マップの予約リンク（reserveLinks）は広告の転送 URL で料金つきなので、宿には使わない（reservationUrl は付けない）。
 *
 * 紹介記事の placeOverride（任意）: Google マップの表示と公式サイトが食い違う店で、公式サイトの値を店データに使うときに書く（監査で確かめたものだけ）。
 *   phone        : 電話番号（Google マップの番号が公式サイトのどこにも無いとき）
 *   hoursByDay   : { 月: "09:00–12:00, 15:00–18:00", 金: "定休日", ... }（営業時間の曜日別。Google マップの hours の代わりに formatHours に渡す）
 *   hours: null  : 営業時間が決められない店は店データに営業時間を載せない（定休日も載せない。holidays を別に書けば載せる）
 *   holidays     : 定休日の文字列（"不定休"、"第1・3月曜・火曜" など。null で載せない）
 *   name         : 店名（Google マップの名前が検索語つきで長いとき、公式サイトの呼び方に直す。例: ウルベビレッジ）
 *   website      : 公式サイトの URL（Google マップの表示が開けない URL のとき、公式サイトの実在するページに直す。例: yawatano.co.jp → www.yawatano.co.jp）
 *
 * サイトのデータに入れないもの: 記事の facts / quote / notes / placeOverride（確認用）、星・口コミ・価格帯、写真の取得元 URL（imageUrl・pageUrl）、ownerPost。
 *
 * 文の書き方（オーナー指示 2026-10-24「公式ページからの引用ですみたいなのも全部やめて」）: 出どころを語る言い回しを記事の文に入れない。
 *   書かない例: 「公式サイトによると」「公式サイトには〜と書かれています」「〜と案内されています」「〜と載っています」「公式サイトの表示は」「Google マップの表示では」「〜とのこと」「引用」。
 *   事実は言い切りの文で書く（事実は足さない・変えない）。出どころは文中で語らず、sources と確認日（ページ下の「情報の出どころ」）に置く。
 *   残してよいのは、公式サイト・予約ページを「使う場所」として示す文（「予約は〜の予約ページから」）と、公式サイトへのリンクのボタン。作り直すときに ATTRIBUTION の注意が出た文は、言い切りに直す。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readJpeg } from "../feature-spot-photos/jpeg.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../..");

// ------------------------------------------------------------------ 引数
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] ? path.resolve(argv[i + 1]) : d;
};
const ALL = flag("all");
const LISTED = flag("listed");
const rawOpt = (n) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const DRY = flag("dry");
const WITH_PRICE = flag("with-price");
const GBP_DIR = path.join(HERE, "gbp");
const PILOT_FILE = opt("pilot", path.join(HERE, "pilot.json"));
const ARTICLES_DIR = opt("articles", path.join(HERE, "articles"));
// 特集記事（features/<キー>.json）がある店は、紹介記事が無くても店ページを出す（特集ページと相互リンクするため）
const FEATURES_DIR = opt("features", path.join(HERE, "features"));
const IDS_FILE = opt("ids", path.join(HERE, "ids.json"));
const OUT_DIR = opt("out", path.join(REPO, "lib/places/generated"));
const UNMAPPED_FILE = opt("unmapped", path.join(HERE, "unmapped.json"));
const PHOTOS_DIR = opt("photos", path.join(HERE, "photos"));
const PUBLIC_DIR = opt("public", path.join(REPO, "public"));
// 保留の店(lib/places/newVerticals.ts の HELD_PLACE_IDS)の写真の置き場。public/ に置くと URL を知っていれば開けてしまうため、公開まではここに置く。
// 店の写真の記録(photos/<キー>.json)の path は「/_portal/vshops/<キー>/…」のままで、ここにあれば「ある」と見なす(生成物は変わらない)。公開するときは held-photos/<キー>/ を public/_portal/vshops/ へ戻す
const HELD_PHOTOS_DIR = path.join(HERE, "held-photos");
const OVERRIDES_DIR = opt("category-overrides", path.join(HERE, "category-overrides"));
const SKIPPED_DIR = opt("skipped", path.join(HERE, "skipped"));
const EXCLUDE_FILE = opt("exclude", path.join(HERE, "exclude.json"));
const BASIC_FILE = opt("basic", path.join(HERE, "basic.json"));

const VERTICALS = {
  beauty: { prefix: "be", tab: "ビューティ" },
  bodycare: { prefix: "bo", tab: "ボディケア" },
  pet: { prefix: "pe", tab: "ペット" },
  stay: { prefix: "st", tab: "宿泊施設" },
  activity: { prefix: "ac", tab: "おでかけ" }, // 旧おでかけのタブ(gbp の tabEn は leisure)
  sports: { prefix: "sp", tab: "スポーツ" },
  life: { prefix: "li", tab: "くらし" },
};
// gbp の tabEn（シートのタブの英名）→ 店データの業種。ここに無いものは tabEn がそのまま業種
const TAB_TO_VERTICAL = { lodging: "stay", leisure: "activity" };
// 記事の自動作成(新・automation/v2/write.mjs)で作る店は、tabEn が「tri-<業種>」(キーは tri-<業種>-<トリニティアポの行>)。
// オーナーのシートの行(beauty-<行> など)とキーが重ならないようにするための接頭辞。種類は category-overrides/<キー>.json で決める
const V2_TAB = /^tri-(beauty|bodycare|pet|stay|activity|sports|life)$/;
const isV2Tab = (tabEn) => V2_TAB.test(String(tabEn));
const verticalOfTab = (tabEn) => (isV2Tab(tabEn) ? tabEn.slice(4) : (TAB_TO_VERTICAL[tabEn] ?? tabEn));
// ペットの種類と店 ID（pet-resolve.json）。無ければ空（その場合ペットは全店が unmapped になる）
const PET_RESOLVE_FILE = path.join(HERE, "pet-resolve.json");
const PET_RESOLVE = existsSync(PET_RESOLVE_FILE) ? JSON.parse(readFileSync(PET_RESOLVE_FILE, "utf8")) : { decisions: [], idLedger: {} };
const PET_DECISIONS = new Map((PET_RESOLVE.decisions || []).map((x) => [x.key, x]));
// ステイの種類と店 ID（stay-resolve.json）。無ければ空（その場合ステイは全店が unmapped になる）
const STAY_RESOLVE_FILE = path.join(HERE, "stay-resolve.json");
const STAY_RESOLVE = existsSync(STAY_RESOLVE_FILE) ? JSON.parse(readFileSync(STAY_RESOLVE_FILE, "utf8")) : { decisions: [], idLedger: {} };
const STAY_DECISIONS = new Map((STAY_RESOLVE.decisions || []).map((x) => [x.key, x]));

const warnings = [];
const warn = (key, msg) => warnings.push(`${key}: ${msg}`);

/** --rows beauty:2-129,bodycare:2-133 → { beauty: [[2,129]], bodycare: [[2,133]] }。無指定は null（絞らない）。書き方が違えば終了 */
export function parseRows(spec) {
  if (spec === undefined) return null;
  const ranges = {};
  for (const part of String(spec).split(",").map((x) => x.trim()).filter(Boolean)) {
    const m = /^(beauty|bodycare|pet|stay|activity|sports|life):(\d+)(?:-(\d+))?$/.exec(part);
    const from = m ? Number(m[2]) : NaN;
    const to = m ? Number(m[3] ?? m[2]) : NaN;
    if (!m || from < 1 || to < from) {
      console.error(`--rows の書き方が違います: 「${part}」（例: --rows beauty:2-129,bodycare:2-133,pet:2-33,stay:2-14）`);
      process.exit(1);
    }
    (ranges[m[1]] ??= []).push([from, to]);
  }
  if (Object.keys(ranges).length === 0) {
    console.error("--rows に範囲がありません（例: --rows beauty:2-129,bodycare:2-133）");
    process.exit(1);
  }
  return ranges;
}
const ROWS = parseRows(rawOpt("rows"));
/** 行の範囲に入っているか。--rows に書いていない業種は常に true */
const inRows = (vertical, row) => !ROWS || !ROWS[vertical] || ROWS[vertical].some(([a, b]) => row >= a && row <= b);

// ------------------------------------------------------------------ 都道府県（lib/areas/prefectures.ts を読んで使う）
function loadPrefectures() {
  const src = readFileSync(path.join(REPO, "lib/areas/prefectures.ts"), "utf8");
  const out = [];
  for (const m of src.matchAll(/\{\s*code:\s*'(\d+)',\s*name:\s*'([^']+)',\s*short:\s*'([^']+)',\s*slug:\s*'([^']+)'/g)) {
    out.push({ code: m[1], name: m[2], short: m[3], slug: m[4] });
  }
  if (out.length !== 47) throw new Error(`lib/areas/prefectures.ts から 47 都道府県を読めませんでした（${out.length}）`);
  return out;
}
const PREFS = loadPrefectures();

// 政令指定都市（区まで市区町村名にする）と東京 23 区
const DESIGNATED = [
  "札幌市", "仙台市", "さいたま市", "千葉市", "横浜市", "川崎市", "相模原市", "新潟市", "静岡市", "浜松市",
  "名古屋市", "京都市", "大阪市", "堺市", "神戸市", "岡山市", "広島市", "北九州市", "福岡市", "熊本市",
];
const TOKYO_WARDS = [
  "千代田区", "中央区", "港区", "新宿区", "文京区", "台東区", "墨田区", "江東区", "品川区", "目黒区", "大田区", "世田谷区",
  "渋谷区", "中野区", "杉並区", "豊島区", "北区", "荒川区", "板橋区", "練馬区", "足立区", "葛飾区", "江戸川区",
];

/** Google マップの住所の表記をそろえる（全角数字→半角、全角のハイフン類→-、空白をつめる）。語句は変えない */
export function normalizeAddress(raw) {
  return (raw || "")
    .normalize("NFKC")
    .replace(/^日本[、,]?\s*/, "")
    .replace(/[‐‑−‒–]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

const DOUBLE_SHI = new Set(["四日市", "廿日市", "野々市"]);

/** 住所から 都道府県（lib/areas の slug）と 市区町村名 を決める。決められなければ null（推測しない） */
export function areaOfAddress(address) {
  const a = normalizeAddress(address).replace(/^〒?\s*\d{3}-?\d{4}\s*/, "");
  const pref = PREFS.find((p) => a.startsWith(p.name));
  if (!pref) return null;
  const rest = a.slice(pref.name.length);
  let city = "";
  const des = DESIGNATED.find((c) => rest.startsWith(c));
  if (des) {
    const w = /^.+?区/.exec(rest.slice(des.length));
    city = des + (w ? w[0] : "");
  } else if (pref.slug === "tokyo" && TOKYO_WARDS.some((w) => rest.startsWith(w))) {
    city = TOKYO_WARDS.find((w) => rest.startsWith(w));
  } else {
    const gun = /^(.+?郡)(.+?[町村])/.exec(rest);
    const shi = /^(.+?市)/.exec(rest);
    if (gun && !(shi && shi[1].length < gun[1].length)) city = gun[2];
    // 名前が「○○市」で終わる市(四日市市・廿日市市・野々市市)だけ、2つめの「市」まで含める。「市川市市川南」のように町名が「市」で始まる所は足さない
    else if (shi) city = shi[1] + (DOUBLE_SHI.has(shi[1]) && rest[shi[1].length] === "市" ? "市" : "");
    else {
      const cho = /^(.+?[町村])/.exec(rest);
      if (cho) city = cho[1];
    }
  }
  return { pref: pref.slug, prefName: pref.name, cityName: city || undefined };
}

// ------------------------------------------------------------------ 種類（発注者が決めた基準）
const BEAUTY_SHEET = {
  美容室: "hair",
  理容室: "hair",
  エステサロン: "esthetic",
  フェイシャル: "esthetic",
  脱毛サロン: "hair-removal",
};
const BODYCARE_RULES = [
  ["seitai", ["整体"]],
  ["sekkotsu", ["整骨", "接骨"]],
  ["shinkyu", ["鍼", "灸", "はり"]],
  ["massage", ["マッサージ"]],
  ["relaxation", ["リラクゼーション"]],
  ["stretch", ["ストレッチ"]],
];

/** 種類を決める。決められなければ { reason }（理由つきで除外） */
export function categoryOf(vertical, d) {
  const placeCat = d.place?.category || "";
  // 記事の自動作成(新)の店は、種類を自動で決めない(行の番号が pet-resolve.json / stay-resolve.json の別の店と重なるため)。category-overrides/<キー>.json で決める
  if (isV2Tab(d.tabEn)) return { reason: `category-overrides/${d.tabEn}-${d.row}.json（{ key, category, evidence }）で決める` };
  if (vertical === "pet") {
    const dec = PET_DECISIONS.get(`pet-${d.row}`);
    if (!dec) return { reason: "pet-resolve.json に この行の判定が無く、種類を決められない" };
    if (!dec.category) return { reason: dec.reason || "pet-resolve.json で種類が決まっていない（category が null）" };
    return { category: dec.category };
  }
  if (vertical === "stay") {
    const dec = STAY_DECISIONS.get(`lodging-${d.row}`);
    if (!dec) return { reason: "stay-resolve.json に この行の判定が無く、種類を決められない" };
    if (!dec.category) return { reason: dec.reason || "stay-resolve.json で種類が決まっていない（category が null）" };
    return { category: dec.category };
  }
  if (vertical === "activity" || vertical === "sports" || vertical === "life") {
    // 自動の判定規則は持たない。決めるのは category-overrides/<キー>.json（呼び出し側で上書きされる）。無ければ理由つきで除外
    return { reason: `${vertical} は自動で種類を決めない。category-overrides/${vertical === "activity" ? "leisure" : vertical}-<行>.json（{ key, category, evidence }）で決める` };
  }
  if (vertical === "beauty") {
    const labels = [d.sheet?.d1, d.sheet?.d2].map((s) => (s || "").trim()).filter(Boolean);
    const found = new Set();
    for (const l of labels) {
      if (BEAUTY_SHEET[l]) found.add(BEAUTY_SHEET[l]);
      else if (l === "ネイル・マツエク") {
        if (placeCat.includes("ネイル")) found.add("nail");
        else if (/まつ|アイラッシュ|眉/.test(placeCat)) found.add("eyelash");
        else return { reason: `シートの詳細は「ネイル・マツエク」だが、Google マップの業種表示「${placeCat || "(なし)"}」に ネイル／まつ／アイラッシュ／眉 が無く、決められない` };
      }
    }
    if (found.size === 1) return { category: [...found][0] };
    if (found.size === 0) return { reason: `シートの詳細（d1=${JSON.stringify(d.sheet?.d1 || "")}, d2=${JSON.stringify(d.sheet?.d2 || "")}）が基準の語に当たらない` };
    return { reason: `シートの詳細（d1=${JSON.stringify(d.sheet?.d1 || "")}, d2=${JSON.stringify(d.sheet?.d2 || "")}）が複数の種類に当たる（${[...found].join("・")}）` };
  }
  for (const [slug, words] of BODYCARE_RULES) {
    if (words.some((w) => placeCat.includes(w))) return { category: slug };
  }
  return { reason: `Google マップの業種表示「${placeCat || "(なし)"}」が基準の語（整体／整骨・接骨／鍼・灸・はり／マッサージ／リラクゼーション／ストレッチ）に当たらない` };
}

/** その業種の種類の slug（lib/verticals/<業種>.ts の categories。schemaType を持つ { slug, name } の行） */
function loadCategorySlugs(vertical) {
  const src = readFileSync(path.join(REPO, `lib/verticals/${vertical}.ts`), "utf8");
  const out = new Set();
  for (const m of src.matchAll(/\{\s*slug:\s*'([^']+)',\s*name:\s*'[^']+',\s*schemaType:/g)) out.add(m[1]);
  if (out.size === 0) throw new Error(`lib/verticals/${vertical}.ts から種類の slug を読めませんでした`);
  return out;
}
const CATEGORY_SLUGS = {
  beauty: loadCategorySlugs("beauty"),
  pet: loadCategorySlugs("pet"),
  bodycare: loadCategorySlugs("bodycare"),
  stay: loadCategorySlugs("stay"),
  activity: loadCategorySlugs("activity"),
  sports: loadCategorySlugs("sports"),
  life: loadCategorySlugs("life"),
};

// ------------------------------------------------------------------ 営業時間
const DAYS = ["月", "火", "水", "木", "金", "土", "日"];
const TIME_RANGE = /^\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2}(?:\s*,\s*\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2})*$/;

/** 同じ時間の曜日をまとめて 月-金 09:00 - 18:00 / 土日 07:00 - 17:00 の形にする（lib/portal/openNow.ts が読める書き方） */
export function formatHours(hours, key) {
  if (!hours || typeof hours !== "object") return { hours: undefined, holidays: undefined };
  const byTime = new Map();
  const closed = [];
  for (const day of DAYS) {
    const v = hours[day];
    if (v === undefined || v === null || v === "") continue;
    if (v === "定休日") {
      closed.push(day);
      continue;
    }
    if (!TIME_RANGE.test(v)) {
      warn(key, `営業時間の書き方を読めない曜日があります（${day}: ${JSON.stringify(v)}）。この曜日は営業時間に入れません`);
      continue;
    }
    const norm = v.replace(/\s*[–-]\s*/g, " - ").replace(/\s*,\s*/g, ", ");
    if (!byTime.has(norm)) byTime.set(norm, []);
    byTime.get(norm).push(day);
  }
  const runs = (days) => {
    const idx = days.map((d) => DAYS.indexOf(d));
    const out = [];
    let i = 0;
    while (i < idx.length) {
      let j = i;
      while (j + 1 < idx.length && idx[j + 1] === idx[j] + 1) j++;
      out.push(j - i + 1 >= 3 ? `${DAYS[idx[i]]}-${DAYS[idx[j]]}` : idx.slice(i, j + 1).map((k) => DAYS[k]).join(""));
      i = j + 1;
    }
    return out.join("");
  };
  const parts = [];
  for (const [time, days] of byTime) parts.push([days[0], days.length === 7 ? `毎日 ${time}` : `${runs(days)} ${time}`]);
  parts.sort((a, b) => DAYS.indexOf(a[0]) - DAYS.indexOf(b[0]));
  const holidays = closed.length > 0 && closed.length < 7 ? closed.map((d) => `${d}曜`).join("・") : undefined;
  return { hours: parts.length > 0 ? parts.map((p) => p[1]).join(" / ") : undefined, holidays };
}

/** 閉店が 21 時以降の曜日があるか（「夜遅くまで営業」の根拠。発注者の基準） */
function hasLateClose(hours) {
  if (!hours) return false;
  return Object.values(hours).some((v) => {
    if (typeof v !== "string") return false;
    for (const m of v.matchAll(/[–-]\s*(\d{1,2}):(\d{2})/g)) {
      const h = Number(m[1]);
      if (h >= 21 || h === 0) return true; // 0:00 以降の閉店も夜遅く
    }
    return false;
  });
}

// ------------------------------------------------------------------ URL
const SNS_HOSTS = [
  ["instagram", /(^|\.)instagram\.com$/],
  ["facebook", /(^|\.)(facebook\.com|fb\.me|fb\.com)$/],
  ["x", /(^|\.)(twitter\.com|x\.com)$/],
  ["tiktok", /(^|\.)tiktok\.com$/],
  ["line", /(^|\.)(line\.me|lin\.ee)$/],
];
// 店の公式サイトではない掲載・予約ポータル（「公式サイト」のボタンにしない）
const PORTAL_HOSTS = /(^|\.)(hotpepper\.jp|epark\.jp|minimodel\.jp|ozmall\.co\.jp|rakuten\.co\.jp|mitsuraku\.jp|karadarefre\.jp|kanzashi\.com)$/;

function cleanUrl(raw) {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    for (const k of [...u.searchParams.keys()]) {
      if (/^utm_/i.test(k) || k === "fbclid" || k === "gclid") u.searchParams.delete(k);
    }
    return u;
  } catch {
    return null;
  }
}

/** place.website を 公式サイト か SNS のどれかに分ける。ポータル・読めない URL は捨てる */
function classifyWebsite(raw, key) {
  if (!raw) return {};
  raw = String(raw).replace(/(?:%20|\s)+https?:\/\/.*$/i, ""); // URL の後ろに別の URL が空白でつながっている登録（beauty-90）は、最初の URL だけ使う
  const u = cleanUrl(raw);
  if (!u) {
    warn(key, `website を URL として読めません: ${raw}`);
    return {};
  }
  const host = u.hostname.toLowerCase();
  const sns = SNS_HOSTS.find(([, re]) => re.test(host));
  const href = u.toString();
  if (sns) return { [sns[0]]: href };
  if (PORTAL_HOSTS.test(host)) {
    warn(key, `website が掲載・予約ポータル（${host}）なので「公式サイト」には使いません`);
    return {};
  }
  return { website: href };
}

// ------------------------------------------------------------------ 記事
const ALLOWED_TAGS = {
  beauty: ["当日予約可", "夜遅くまで営業", "個室あり", "メンズ歓迎", "子連れ可", "駅近"],
  bodycare: ["夜遅くまで営業", "土日営業", "予約なし可", "女性スタッフ", "駅近"],
  pet: [], // ペットはタグを付けない（場面タグに当たる事実が無い）
  stay: ["温泉", "ペット同伴", "一人旅", "記念日", "素泊まり"], // lib/verticals/stay.ts の場面。公式サイトの事実の根拠（factIndex）があるものだけ
  // 体験・スポーツ・くらしの場面(lib/verticals/{activity,sports,life}.ts の scenes[].matchTags)。公式サイトの事実の根拠（factIndex）があるものだけ
  activity: ["子連れ", "初心者歓迎", "手ぶらでOK", "雨の日", "駐車場あり"],
  sports: ["初心者歓迎", "体験あり", "24時間営業", "女性専用", "子ども向け"],
  life: ["体験あり", "子ども向け", "駅近", "駐車場あり", "予約制"],
};
// 出どころを語る言い回し（上の「文の書き方」）。見つけたら注意を出す（載せる・載せないは変えない）。「予約は公式サイトの予約ページから」のような使う場所の文も拾うので、目で見て判断する
const ATTRIBUTION = /公式サイト(?:に|は|の|では|が|による|で書)|公式ページ|Google ?マップ(?:に|は|の|では|で)|掲載ページ|によると|によれば|と案内され|と書かれ|と載って|と記載|とのこと(?:です|だ|で|。|、)|という案内|引用/;
const FORBIDDEN = [
  "治る", "治す", "治療", "改善", "効果", "若返る", "痩せる", "医療", "医学的",
  "最高", "絶品", "必ず", "No.1", "おすすめ", "人気", "話題", "評判",
];
// ペットだけの追加（料金・特典の表現。監査で外した語）
const FORBIDDEN_PET = ["無料", "無償", "割引", "特典", "プレゼント", "お得", "円", "税込", "口コミ", "★", "☆"];
// ステイだけの追加（料金・評価・癒し・絶景などの表現。ステイの決まり）
const FORBIDDEN_STAY = ["無料", "無償", "割引", "特典", "プレゼント", "お得", "円", "税込", "料金", "ベストレート", "口コミ", "評価", "★", "☆", "癒", "絶景", "贅沢", "至福", "宿泊記"];

// 体験・アクティビティ / スポーツ / くらしの追加(料金・評価・癒し・絶景・効き目などの表現。決まり 2026-10-22)
const FORBIDDEN_NEW = ["無料", "無償", "割引", "特典", "プレゼント", "お得", "円", "税込", "料金", "口コミ", "評価", "★", "☆", "癒", "絶景", "贅沢", "至福", "運気", "開運", "当たる"];

function isHttp(u) {
  try {
    const p = new URL(u);
    return p.protocol === "http:" || p.protocol === "https:";
  } catch {
    return false;
  }
}

/** 記事の JSON → サイトに載せる形（facts / quote / notes は載せない）。タグは根拠を点検する */
function buildArticle(vertical, d, article, key) {
  const str = (x) => (typeof x === "string" ? x.trim() : "");
  const headline = str(article.headline);
  const lede = str(article.lede);
  const sections = (Array.isArray(article.sections) ? article.sections : [])
    .map((s) => ({ heading: str(s?.heading), body: str(s?.body) }))
    .filter((s) => s.heading && s.body);
  if (!headline || !lede || sections.length === 0) {
    warn(key, "記事に headline / lede / sections のどれかが無いので、記事を載せません（基本情報だけ）");
    return { article: undefined, tags: [] };
  }
  const menus = (Array.isArray(article.menus) ? article.menus : [])
    .map((m) => {
      const o = { name: str(m?.name) };
      if (!o.name) return null;
      // 料金は既定では載せない(オーナー指示 2026-10-09「メニューの料金とかあんまり入れなくていい」)。載せるときは --with-price
      if (WITH_PRICE && str(m?.price)) o.price = str(m.price);
      if (Number.isFinite(m?.minutes) && m.minutes > 0) o.minutes = m.minutes;
      return o;
    })
    .filter(Boolean)
    .slice(0, 8);

  const sources = [];
  for (const s of Array.isArray(article.sources) ? article.sources : []) {
    const url = str(s?.url);
    const label = str(s?.label);
    if (!label || !isHttp(url)) {
      warn(key, `sources に使えない項目があります: ${JSON.stringify(s)}`);
      continue;
    }
    sources.push({ label, url });
  }
  if (!sources.some((s) => /(^|\.)google\.[a-z.]+\/maps|maps\.google\./.test(s.url.replace(/^https?:\/\//, "")))) {
    sources.push({ label: "Google マップ", url: d.place.gbpUrl });
  }

  const facts = Array.isArray(article.facts) ? article.facts : [];
  const dates = facts.map((f) => str(f?.checkedAt)).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)).sort();
  if (dates.length === 0) warn(key, "facts に確認日（checkedAt）がありません。確認日は出しません");
  const checkedAt = dates[0]; // 一番古い確認日（記事全体がそろって確認できていた日）

  const tags = [];
  for (const t of Array.isArray(article.tags) ? article.tags : []) {
    const tag = str(t?.tag);
    if (!ALLOWED_TAGS[vertical].includes(tag)) {
      warn(key, `タグ「${tag}」は ${vertical} で使える語ではないので外しました`);
      continue;
    }
    if (!Number.isInteger(t?.factIndex) || t.factIndex < 0 || t.factIndex >= facts.length) {
      warn(key, `タグ「${tag}」の factIndex が facts の範囲外なので外しました`);
      continue;
    }
    if (tag === "夜遅くまで営業" && !hasLateClose(d.place.hours)) {
      warn(key, "タグ「夜遅くまで営業」: Google マップの営業時間に 21 時以降の閉店が無いので外しました");
      continue;
    }
    if (!tags.includes(tag)) tags.push(tag);
  }

  const text = [headline, lede, ...sections.flatMap((s) => [s.heading, s.body]), ...menus.map((m) => m.name)].join("\n");
  for (const w of vertical === "pet" ? [...FORBIDDEN, ...FORBIDDEN_PET] : vertical === "stay" ? [...FORBIDDEN, ...FORBIDDEN_STAY] : ["activity", "sports", "life"].includes(vertical) ? [...FORBIDDEN, ...FORBIDDEN_NEW] : FORBIDDEN) if (text.includes(w)) warn(key, `記事に禁止語「${w}」が含まれています（確認してください）`);

  for (const sent of text.split(/(?<=。)|\n/)) if (ATTRIBUTION.test(sent)) warn(key, `出どころを語る言い回し（言い切りに直す）: ${sent.trim().slice(0, 50)}`);

  return {
    article: { headline, lede, sections, ...(menus.length > 0 ? { menus } : {}), sources, ...(checkedAt ? { checkedAt } : {}) },
    tags,
  };
}

// ------------------------------------------------------------------ 本体
const readJson = (f) => JSON.parse(readFileSync(f, "utf8"));
/** 写真の種類（photos/<キー>.json の images[].kind）。ページが種類で写真を振り分けるための印 */
const PHOTO_KINDS = new Set(["exterior", "room", "bath", "meal", "common", "view"]);
/**
 * 写真の記録（photos/<キー>.json または features/<キー>.json）の images → public/ に実在する画像だけの { path, what, width, height }。
 * 記録が無い・0 枚なら []。
 */
function loadImagesFrom(f, key, fillDims = false) {
  if (!existsSync(f)) return [];
  const out = [];
  const seen = new Set();
  const rec = readJson(f);
  for (const im of Array.isArray(rec.images) ? rec.images : []) {
    // 記録の path は「/_portal/vshops/…」でも「public/_portal/vshops/…」でもよい。サイト内パス（/ で始まる）にそろえる
    const rel = String(im?.path ?? "").trim().replace(/^\.?\/?public\//, "").replace(/^\/+/, "");
    if (!rel || rel.includes("..") || seen.has(rel)) continue;
    if (!existsSync(path.join(PUBLIC_DIR, rel)) && !existsSync(path.join(HELD_PHOTOS_DIR, rel.replace(/^_portal\/vshops\//, "")))) {
      warn(key, `写真 ${rel} が public/ に無いので入れない`);
      continue;
    }
    seen.add(rel);
    const dim = (x) => (Number.isFinite(x) && x > 0 ? Math.round(x) : undefined);
    const what = typeof im?.what === "string" ? im.what.trim() : "";
    let w = dim(im?.width);
    let h = dim(im?.height);
    if (fillDims && !(w && h)) {
      // 特集の写真の記録には寸法が無い。og:image:width などのため、画像ファイルの JPEG のヘッダから読む（読めなければ寸法なし）
      const d = readJpeg(readFileSync(existsSync(path.join(PUBLIC_DIR, rel)) ? path.join(PUBLIC_DIR, rel) : path.join(HELD_PHOTOS_DIR, rel.replace(/^_portal\/vshops\//, ""))));
      if (!d.error) { w = d.width; h = d.height; }
    }
    // 写真の種類（任意）。外観 exterior・客室 room・風呂 bath・料理 meal・共用 common・周辺の景色 view。これ以外の値は入れない
    const kind = typeof im?.kind === "string" && PHOTO_KINDS.has(im.kind.trim()) ? im.kind.trim() : undefined;
    out.push({ path: `/${rel}`, ...(what ? { what } : {}), ...(kind ? { kind } : {}), ...(w && h ? { width: w, height: h } : {}) });
  }
  return out;
}
/**
 * 店の写真。photos/<キー>.json の images が使える（public/ に実在する）ならそれ。
 * 店の写真の記録が無い・空の店でも、公開する特集（--features のフォルダの features/<キー>.json）があれば、
 * その特集の写真（images: hero・p1・p2）を店の写真として使う（特集の写真があるのに店ページに写真が出ない、を防ぐ）。
 */
function loadPhotos(key) {
  const own = loadImagesFrom(path.join(PHOTOS_DIR, `${key}.json`), key);
  if (own.length > 0) return own;
  return loadImagesFrom(path.join(FEATURES_DIR, `${key}.json`), key, true);
}
const natural = (a, b) => a.localeCompare(b, "en", { numeric: true });

const gbp = new Map();
const outOfRows = new Set(); // 「一致」だが --rows の範囲の外の店
for (const f of readdirSync(GBP_DIR).filter((x) => x.endsWith(".json")).sort(natural)) {
  const d = readJson(path.join(GBP_DIR, f));
  if (!VERTICALS[verticalOfTab(d.tabEn)] || d.verdict !== "一致" || !d.place) continue;
  if (!inRows(verticalOfTab(d.tabEn), Number(d.row))) {
    outOfRows.add(`${d.tabEn}-${d.row}`);
    continue;
  }
  gbp.set(`${d.tabEn}-${d.row}`, d);
}

const ledger = {
  _readme: "Google マップの店の固定番号（place.gbpUrl の cid）→ 店 ID。業種ごと。追記だけ・変更しない（一度払い出した ID は変えない）。build-places.mjs が更新する。",
  ...(existsSync(IDS_FILE) ? readJson(IDS_FILE) : {}),
};
for (const v of Object.keys(VERTICALS)) ledger[v] ??= {};
// ペットの店 ID は pet-resolve.json の idLedger（払い出し済み）を台帳に写す（台帳に既にある cid は変えない）
for (const [cid, id] of Object.entries(PET_RESOLVE.idLedger || {})) ledger.pet[cid] ??= id;
// ステイの店 ID は stay-resolve.json の idLedger（払い出し済み）を台帳に写す（台帳に既にある cid は変えない）
for (const [cid, id] of Object.entries(STAY_RESOLVE.idLedger || {})) ledger.stay[cid] ??= id;

// 載せない店: skipped/<キー>.json の reason が「掲載を見送る」で始まる店と、exclude.json にある店（どのモードでも出さない。ID も払い出さない）
const notListed = new Set(existsSync(EXCLUDE_FILE) ? readJson(EXCLUDE_FILE) : []);
if (existsSync(SKIPPED_DIR)) {
  for (const f of readdirSync(SKIPPED_DIR).filter((x) => x.endsWith(".json"))) {
    const sk = readJson(path.join(SKIPPED_DIR, f));
    if (typeof sk?.reason === "string" && sk.reason.startsWith("掲載を見送る")) notListed.add(sk.key ?? f.slice(0, -5));
  }
}
const basicKeys = new Set(LISTED && existsSync(BASIC_FILE) ? readJson(BASIC_FILE) : []);

const unmapped = [];
const keyOf = (v, cid) => `${v}:${cid}`;
const seenCid = new Map();
const resolved = new Map(); // key -> { vertical, category, area, cid }
for (const [key, d] of [...gbp].sort((a, b) => natural(a[0], b[0]))) {
  if (notListed.has(key)) continue;
  const vertical = verticalOfTab(d.tabEn);
  const item = { key, vertical, name: d.place.name, sheetName: d.sheet?.name, address: d.place.address };
  const cid = /[?&]cid=(\d+)/.exec(d.place.gbpUrl || "")?.[1];
  if (!cid) {
    unmapped.push({ ...item, reason: "place.gbpUrl に cid が無く、店 ID を払い出せない" });
    continue;
  }
  let cat = categoryOf(vertical, d);
  // 種類の上書き（category-overrides/<キー>.json）。その業種の種類の slug にある値だけ有効。無効なら使わず、決められない店は理由つきで除外
  const ovFile = path.join(OVERRIDES_DIR, `${key}.json`);
  if (existsSync(ovFile)) {
    const ov = readJson(ovFile);
    if (typeof ov?.category === "string" && CATEGORY_SLUGS[vertical].has(ov.category)) {
      cat = { category: ov.category };
    } else {
      const bad = `種類の上書き「${ov?.category}」は ${vertical} の種類の slug（${[...CATEGORY_SLUGS[vertical]].join("・")}）に無いので無効`;
      warn(key, bad + "。使いません");
      if (!cat.category) cat = { reason: `${cat.reason}（${bad}）` };
    }
  }
  if (!cat.category) {
    unmapped.push({ ...item, reason: cat.reason });
    continue;
  }
  const area = areaOfAddress(d.place.address);
  if (!area) {
    unmapped.push({ ...item, reason: "Google マップの住所から都道府県を決められない" });
    continue;
  }
  const dupOf = seenCid.get(keyOf(vertical, cid));
  if (dupOf) {
    unmapped.push({ ...item, reason: `同じ Google マップの店（cid ${cid}）が ${dupOf} にもある（重複）` });
    continue;
  }
  seenCid.set(keyOf(vertical, cid), key);
  resolved.set(key, { vertical, category: cat.category, area, cid });
}

// 出す店
let wanted;
if (ALL) {
  wanted = [...resolved.keys()];
} else {
  if (!existsSync(PILOT_FILE)) {
    console.error(`pilot.json がありません: ${PILOT_FILE}`);
    process.exit(1);
  }
  const featureKeys = existsSync(FEATURES_DIR)
    ? readdirSync(FEATURES_DIR).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5))
    : [];
  wanted = [...new Set([...readJson(PILOT_FILE), ...featureKeys, ...basicKeys])].filter((k) => {
    if (notListed.has(k)) {
      warn(k, "掲載を見送る店（skipped / exclude.json）なので出さない");
      return false;
    }
    if (!gbp.has(k)) {
      warn(k, outOfRows.has(k) ? "pilot.json にあるが、--rows の範囲の外なので出さない" : "pilot.json にあるが、gbp に「一致」の店として無い");
      return false;
    }
    if (!resolved.has(k)) {
      warn(k, "pilot.json にあるが、種類・都道府県・cid のどれかが決められず除外（unmapped.json 参照）");
      return false;
    }
    return true;
  });
}

const places = Object.fromEntries(Object.keys(VERTICALS).map((v) => [v, []]));
const issued = [];
for (const key of wanted) {
  const d = gbp.get(key);
  const r = resolved.get(key);
  const articleFile = path.join(ARTICLES_DIR, `${key}.json`);
  const hasArticle = existsSync(articleFile);
  const hasFeature = existsSync(path.join(FEATURES_DIR, `${key}.json`));
  if (!ALL && !hasArticle && !hasFeature && !basicKeys.has(key)) {
    warn(key, "記事がまだ無いので出しません（既定は紹介記事か特集記事がある店だけ。基本情報だけで載せるなら --listed と basic.json）");
    continue;
  }
  const v = VERTICALS[r.vertical];
  let id = ledger[r.vertical][r.cid];
  if (!id) {
    const n = Object.values(ledger[r.vertical]).reduce((m, x) => Math.max(m, Number(String(x).slice(v.prefix.length)) || 0), 0) + 1;
    id = `${v.prefix}${String(n).padStart(4, "0")}`;
    ledger[r.vertical][r.cid] = id;
    issued.push(`${key} -> ${id}`);
  }
  const p = d.place;
  const articleData = hasArticle ? readJson(articleFile) : null;
  // 公式サイトとの食い違いを監査で確かめた店だけ、articles/<キー>.json の placeOverride で店データの値を差し替える
  const ov = articleData?.placeOverride && typeof articleData.placeOverride === "object" ? articleData.placeOverride : {};
  const phone = ov.phone ? String(ov.phone).trim() : p.phone ? String(p.phone).trim() : "";
  const fmt = ov.hours === null ? { hours: undefined, holidays: undefined } : formatHours(ov.hoursByDay ?? p.hours, key);
  const hours = fmt.hours;
  const holidays = "holidays" in ov ? (ov.holidays ? String(ov.holidays) : undefined) : fmt.holidays;
  const web = classifyWebsite(ov.website ? String(ov.website).trim() : p.website, key);
  // ステイは Google マップの予約リンク（広告の転送 URL・料金つき）を使わない
  const reserve = r.vertical !== "stay" && Array.isArray(p.reserveLinks) ? p.reserveLinks.find((l) => l && isHttp(l.url)) : null;
  const reservationUrl = reserve ? cleanUrl(reserve.url)?.toString() : undefined;
  const built = hasArticle ? buildArticle(r.vertical, d, articleData, key) : { article: undefined, tags: [] };
  const photos = loadPhotos(key);
  // ステイ: 記事の rooms（客室・サイトの種類名）→ attributes.roomTypes（名前だけ・重複なし）
  const roomTypes = [...new Set((Array.isArray(articleData?.rooms) ? articleData.rooms : []).map((x) => (typeof x?.name === "string" ? x.name.trim() : "")).filter(Boolean))];
  const place = {
    id,
    vertical: r.vertical,
    category: r.category,
    name: (typeof ov.name === "string" && ov.name.trim() ? ov.name : String(p.name)).replace(/\s*https?:\/\/\S+/g, "").trim(), // Google の登録名に URL が混じる店（beauty-90 など）は URL だけ外す
    pref: r.area.pref,
    ...(r.area.cityName ? { cityName: r.area.cityName } : {}),
    address: normalizeAddress(p.address),
    ...(Number.isFinite(p.lat) && Number.isFinite(p.lng) ? { lat: p.lat, lng: p.lng } : {}),
    ...(hours ? { hours } : {}),
    ...(holidays ? { holidays } : {}),
    ...(phone ? { phone } : {}),
    ...(web.website ? { url: web.website, website: web.website } : {}),
    ...(web.instagram ? { instagram: web.instagram } : {}),
    ...(web.tiktok ? { tiktok: web.tiktok } : {}),
    ...(web.x ? { x: web.x } : {}),
    ...(web.facebook ? { facebook: web.facebook } : {}),
    ...(web.line ? { line: web.line } : {}),
    ...(reservationUrl ? { reservationUrl } : {}),
    mapUrl: p.gbpUrl,
    ...(photos.length > 0 ? { image: photos[0].path } : {}),
    images: photos.map((x) => x.path),
    ...(photos.length > 0 ? { photos } : {}),
    tags: built.tags,
    ...(built.article ? { article: built.article } : {}),
    ...(r.vertical === "stay" && roomTypes.length > 0 ? { attributes: { roomTypes } } : {}),
  };
  places[r.vertical].push(place);
}
for (const v of Object.keys(places)) places[v].sort((a, b) => natural(a.id, b.id));

// ------------------------------------------------------------------ 書き出し
const NOTE = "自動生成（automation/vertical-stores/build-places.mjs）。手で編集しない。直すときは gbp / articles / build-places.mjs を直して作り直す。";
if (!DRY) {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const v of Object.keys(places)) {
    writeFileSync(path.join(OUT_DIR, `${v}.json`), JSON.stringify({ _note: NOTE, places: places[v] }, null, 2) + "\n");
  }
  writeFileSync(IDS_FILE, JSON.stringify(ledger, null, 2) + "\n");
  writeFileSync(UNMAPPED_FILE, JSON.stringify({ _note: "種類・都道府県・cid を決められず除外した店（gbp の「一致」の全店を点検した結果）。推測で振り分けない。build-places.mjs が毎回作り直す。", items: unmapped }, null, 2) + "\n");
}

console.log(`${DRY ? "[dry] " : ""}mode=${ALL ? "all" : LISTED ? "listed" : "pilot"}${ROWS ? `  rows=${rawOpt("rows")}（範囲の外の「一致」の店=${outOfRows.size}）` : ""}  ${Object.keys(places).map((v) => `${v}=${places[v].length}`).join("  ")}  除外(unmapped)=${unmapped.length}  新しい ID=${issued.length}`);
for (const i of issued) console.log(`  ID 払い出し: ${i}`);
for (const u of unmapped) console.log(`  除外: ${u.key} 「${u.name}」 — ${u.reason}`);
for (const w of warnings) console.log(`  注意: ${w}`);
