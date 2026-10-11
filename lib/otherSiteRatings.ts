/**
 * 店の文章・特集記事の文章から、ほかのサイト・サービス（食べログ・Google・Retty・ホットペッパー・ぐるなび・一休・
 * トリップアドバイザー・Yahoo! など）の「点数・星・評価の高さ・口コミやレビューの件数」に触れている文／句だけを取り除く。
 *
 * 発注者の指示（2026-10-11）: 「他サイトの評価を文章に入れるのやめて」。
 *  - 店の評価は、店ページ基本情報の「Google の評価 {値}（N件）」の行（出典つきの項目）だけにする。文章には入れない。
 *  - データ（lib/data.ts の元の値・DB）は書き換えない。データを読む層（lib/db/restaurants.ts の finish・lib/db/features.ts の
 *    getFeatureArticleById の最後）で通すので、DB の行から来た文章にもコード側の文章（DB に行が無いときのフォールバック）にも、
 *    店・記事を読むすべてのページに効く。暖簾の表示の直前でも通すが、二重に通っても結果は変わらない（取った後の文には、もう取る物が無い）。
 *    ※ lib/data.ts の RESTAURANTS・FEATURE_ARTICLES を直接読むページ（lib/townFeatures.ts・lib/featureRegions.ts など）は、
 *      id・タイトル・写真・地域の照合にしか使っていない（文章を画面に出していない）ので、書き出しそのものは変えていない。
 *
 * 取り除くのは、次の形の文／句だけ。
 *  - 点数: 「食べログ3.50」「評価3.58」「評価は3.36」「口コミ平均は3.66」「3.06点」「5点満点中4.0」「Googleマップの評価は4.0」
 *  - 星: 「★4.2」「星4つ」（評価の話のときだけ。ミシュランの星は賞なので残す）
 *  - 口コミ・レビューの件数: 「口コミ191件」「76件のレビュー」「220件超の口コミ」「（191件）」
 *  - ほかのサイトの評価の高さ: 「食べログでも高評価のレビューが集まっている」「一休.com 掲載のコースが高評価を受ける」「食べログの評価を獲得」
 * 取らない物（そのまま残す）:
 *  - 賞・選出（食べログ百名店・ミシュランの星・ビブグルマン・受賞）。出典の注記（「(食べログ掲載情報)」）。予約先としての店名。
 *  - 「地元で評価が高い」「口コミで広がる」のような、サイト名も点数も件数も無い普通の言い回し。
 *
 * 文の残りに別の事実があるときは、その句（読点「、」で区切った 1 かたまり）だけを取り、残りは残す。
 * 文全体が評価の話なら文を丸ごと取る。句を取ると文が切れる／意味が通らなくなる文は、OVERRIDES に完全一致で個別に指定する。
 *
 * このファイルは import を持たない型だけの依存（./regions の型）で、fs・process は使わない（ページ・クライアントから import してよい）。
 */
import type { FeatureArticle, RankItem, Restaurant } from "./regions";

/* ------------------------------------------------------------------ */
/* 判定                                                                */
/* ------------------------------------------------------------------ */

/** ほかのサイト・サービスの名前（食べログ以外） */
const OTHER_SITES = "Google|グーグル|Retty|ホットペッパー|ぐるなび|一休\\.com|一休ドットコム|トリップアドバイザー|TripAdvisor|Yahoo!?|ヤフー|Tabelog";
const SITES = `食べログ|${OTHER_SITES}`;

/** 食べログ + 近いところに小数の点数（3.50・4.2） */
const TABELOG_SCORE = /食べログ[^。、（）()]{0,14}?\d[.．]\d{1,2}/;
/** 食べログ以外のサイト + （マップの・口コミの・評価の）+ 小数の点数 */
const OTHER_SITE_SCORE = new RegExp(
  `(?:${OTHER_SITES})(?:マップ|地図)?(?:の)?(?:口コミ|評価|レビュー|スコア|点数|評点|星)?(?:は|が|で|も|の)?\\s*[（(]?\\d[.．]\\d`,
  "i",
);
/** 評価の語 + 小数の点数（評価3.58・評価は3.36・口コミ平均は3.66・評価は5点満点中4.0）／ 3.06点 ／ 5点満点 */
const WORD_SCORE =
  /(?:評価|評点|点数|スコア|口コミ平均|レビュー平均|平均評価|総合評価)(?:は|が|も|で|を|の)?[^。、（）()]{0,6}?\d[.．]\d{1,2}|\d[.．]\d{1,2}\s*点(?!台)|[5５]点満点/;
/** 口コミ・レビュー・評価の件数（口コミ191件・レビューは62件・220件超の口コミ・76件のレビュー） */
const COUNT =
  /(?:口コミ|クチコミ|レビュー|評価|投稿)(?:は|が|を|の数は|数は)?[^。、（）()]{0,4}?\d[\d,]*\s*件|\d[\d,]*\s*件(?:超|以上|近く|ほど|余り)?(?:の)?(?:口コミ|クチコミ|レビュー|評価)/;
/** ★ ／ 星4つ ／ 4つ星（評価の話か、サイト名があるときだけ数える。「星の駅」「ミシュラン一つ星」は対象外） */
const STAR_MARK = /[★☆⭐]/;
const STAR_WORD = /星\s?[1-5１-５](?:つ|個|\.\d)?|星[一二三四五]つ|[1-5１-５](?:つ|個)星/;
const RATING_CONTEXT = new RegExp(`評価|口コミ|クチコミ|レビュー|${SITES}`, "i");
/** ほかのサイトの評価の高さ（サイト名と同じ句に「高評価」「評価を獲得」など）／ 高評価のレビュー・口コミ */
const HIGH = new RegExp(
  `(?:${SITES})[^。、]{0,20}?(?:高評価|評価が高|高い評価|高く評価|評価を(?:獲得|得|受け)|評価(?:も|は)?(?:高|良好|上昇)|好評)|(?:高評価|好評価)の?(?:レビュー|口コミ|クチコミ)|(?:レビュー|口コミ|クチコミ)[^。、]{0,8}?(?:高評価|評価が高)`,
  "i",
);
/** 賞・選出（残す）。点数でなく語だけの判定（HIGH・星）には、この語があれば当てない */
const AWARD = /百名店|ミシュラン|ビブグルマン|Bib|アワード|Award|受賞|選出|選ばれ/i;

/** 句（読点で区切った 1 かたまり）が、ほかのサイトの点数・星・評価の高さ・件数の話か */
function isRatingClause(c: string): boolean {
  if (TABELOG_SCORE.test(c) || OTHER_SITE_SCORE.test(c) || WORD_SCORE.test(c) || COUNT.test(c)) return true;
  if (AWARD.test(c)) return false;
  if (STAR_MARK.test(c)) return true;
  if (STAR_WORD.test(c) && RATING_CONTEXT.test(c)) return true;
  return HIGH.test(c);
}

/* ------------------------------------------------------------------ */
/* 個別の指定                                                          */
/* ------------------------------------------------------------------ */

/**
 * 個別の指定（文の完全一致 → 置き換え。"" は丸ごと取る）。
 * 句を取るだけだと文が切れる／残りが主語を失う／意味が通らなくなる文だけを入れる。
 */
const OVERRIDES: Record<string, string> = {
  // r07 本文: 後ろの句が「この数字」と点数を指すので、句だけ取ると意味が通らない。文を丸ごと取る
  "食べログ評価3.66と、開店2年でこの数字に到達するのは中華料理店として明確に支持されている証だ。": "",
  // r62 説明: 1 句の文だが、「48席の個室」は点数でない別の事実なので残す
  "食べログ評価3.58で48席の個室も揃える。": "48席の個室も揃える。",
  // r61 本文: 後ろの句が述語なので、句を取ると「…一軒で。」と切れる
  "テレビ番組「相席食堂」での紹介をきっかけに知名度が上がった一軒で、食べログ評価は3.57と福島エリアの中華として高い支持を得ている。":
    "テレビ番組「相席食堂」での紹介をきっかけに知名度が上がった一軒だ。",
  // r64 本文: 前の句が「…構えながら、」だけ残って切れる
  "住宅地の一角に構えながら、食べログ評価3.44・口コミ220件超という数字が示す実力を持つ中華料理店だ。":
    "住宅地の一角に構える中華料理店だ。",
  // 「食べログ」と書かずに点数だけ出している文（Google の評価の隣に出どころの分からない別の点数を残さない）
  "評価3.58は口コミ191件の積み上げた信頼の数字だ。": "", // r62 本文: 文全体が点数の話
  "九条という下町感のある立地で、炭火焼き鳥を提供する一軒として評価3.53と高い支持を集める。": "九条という下町感のある立地で、炭火焼き鳥を提供する一軒だ。", // r63 本文
  "九条駅から徒歩2分、炭火焼き鳥の評価3.53の人気店": "九条駅から徒歩2分、炭火焼き鳥の人気店", // r63 見どころ
  "評価3.44・220件超の口コミを誇り、26席でランチからディナーまで安定した人気を持つ。": "26席でランチからディナーまで安定した人気を持つ。", // r64 説明
  "評価は3.36と高く、92件超の口コミが積み上がる。": "", // r93 本文: 文全体が点数の話
  // 特集「ごはん処 湊茶屋」の導入: 後ろの句「62件のレビューを集めている」が主語を失う
  "食べログの評価は開業から3ヶ月で3.06点、62件のレビューを集めている。": "",
  // 2026-10-11 追加（広げた分）
  // r37 本文: 前の句だけでは「…立ち寄りたい一軒として。」と切れる。残る事実（三国でラーメンを探すなら立ち寄りたい一軒）で言い切る
  "三国エリアでラーメンを探すなら立ち寄りたい一軒として、食べログでも継続的に高評価のレビューが集まっている。": "三国エリアでラーメンを探すなら立ち寄りたい一軒だ。",
  // r209 本文: 前の句だけでは「…中華料理の一軒で。」と切れる
  "京野菜と旬の食材を活かした本格中華料理の一軒で、一休.com掲載のコースがコストパフォーマンスで高評価を受ける。": "京野菜と旬の食材を活かした本格中華料理の一軒だ。",
  // 特集「ごはん処 湊茶屋」の引用文: 句を取ると「2025年6月の開業から、メニューの美味しさだけでなく…」と意味が通らない。文ごと取る
  "2025年6月の開業から、わずか3ヶ月で食べログの評価を獲得したのは、メニューの美味しさだけでなく、その空間と立地が『ここにしかない時間』を約束しているからなのだろう。": "",
};

/** 何か取る物があるか（無ければ何もせずそのまま返す。速さのための前判定。偽陽性は問題なし：後ろで文ごとに確かめる） */
const QUICK = /食べログ|Google|グーグル|Retty|ホットペッパー|ぐるなび|一休|トリップアドバイザー|TripAdvisor|Yahoo|ヤフー|Tabelog|評価|評点|点数|スコア|口コミ|クチコミ|レビュー|[★☆⭐]|星|\d点|点満点/i;

function needsFix(t: string): boolean {
  return QUICK.test(t); // QUICK を通った物は文ごとに確かめる（結果が同じなら元の文字列をそのまま返す）
}

/** 句を取ったあとの残りが、文として切れているか（接続の語尾で終わる・件数で始まる） */
function looksBroken(rest: string): boolean {
  return /(?:て|で|が|し|ながら|ので|けれど|けど|と)$/.test(rest) || /^\d+件/.test(rest);
}

function fixSentence(s: string): string {
  if (Object.prototype.hasOwnProperty.call(OVERRIDES, s)) return OVERRIDES[s];
  const end = s.endsWith("。") ? "。" : "";
  const body = end ? s.slice(0, -1) : s;
  const clauses = body.split("、");
  if (!clauses.some(isRatingClause)) return s;
  if (clauses.length < 2) return ""; // 1 句だけの文は、丸ごと評価の話
  const kept = clauses.filter((c) => !isRatingClause(c));
  if (kept.length === 0) return "";
  const rest = kept.join("、");
  if (looksBroken(rest)) return ""; // 句を取ると文が切れるときは、切れた文を出さずに丸ごと取る
  return rest + end;
}

/* ------------------------------------------------------------------ */
/* 文章                                                                */
/* ------------------------------------------------------------------ */

/** 1 つの文章（段落・導入・説明）から、ほかのサイトの点数・星・評価の高さ・件数に触れている文／句を取り除く。何も無ければそのまま返す */
export function stripOtherSiteRating(text: string): string;
export function stripOtherSiteRating(text: string | undefined): string | undefined;
export function stripOtherSiteRating(text: string | undefined): string | undefined {
  if (!text || typeof text !== "string" || !needsFix(text)) return text;
  const sentences = text.match(/[^。]*。|[^。]+$/g) ?? [text];
  const fixed = sentences.map(fixSentence);
  return fixed.every((f, i) => f === sentences[i]) ? text : fixed.join("");
}

/** 文章の並び（本文の段落・見どころ）に通す。丸ごと取れて空になった項目は並びから外す。何も変わらなければ同じ配列を返す */
export function stripOtherSiteRatingList(items: string[]): string[];
export function stripOtherSiteRatingList(items: string[] | undefined): string[] | undefined;
export function stripOtherSiteRatingList(items: string[] | undefined): string[] | undefined {
  if (!items) return items;
  let changed = false;
  const next: string[] = [];
  for (const t of items) {
    const f = typeof t === "string" ? stripOtherSiteRating(t) : t;
    if (f !== t) changed = true;
    if (typeof f === "string" && f.trim() === "" && f !== t) continue; // 丸ごと取れて空になった項目は外す
    next.push(f);
  }
  return changed ? next : items;
}

/* ------------------------------------------------------------------ */
/* データ（店・特集記事）                                              */
/* ------------------------------------------------------------------ */

/** 店の文章の項目（型の desc・body・highlights。URL・住所・営業時間などの事実の項目は触らない） */
export function cleanRestaurantText<T extends Restaurant>(r: T): T {
  const desc = stripOtherSiteRating(r.desc);
  const body = stripOtherSiteRatingList(r.body);
  const highlights = stripOtherSiteRatingList(r.highlights);
  if (desc === r.desc && body === r.body && highlights === r.highlights) return r;
  return { ...r, desc, body, highlights };
}

/** 項目の「口コミ平均 3.66」のような、評価の数字を載せる表の行か（見出しが評価の語で、値が点数・件数の形） */
const RATING_KEY = /口コミ|クチコミ|レビュー|評価|評点|点数|スコア|星/;
const RATING_VALUE = /\d[.．]\d|\d[\d,]*\s*件|[★☆⭐]/;

function cleanSpecs(specs: RankItem["specs"]): RankItem["specs"] {
  if (!Array.isArray(specs)) return specs;
  let changed = false;
  const next: RankItem["specs"] = [];
  for (const sp of specs) {
    if (!sp || typeof sp.v !== "string") { next.push(sp); continue; }
    if (RATING_KEY.test(sp.k ?? "") && RATING_VALUE.test(sp.v)) { changed = true; continue; }
    const v = stripOtherSiteRating(sp.v);
    if (v === sp.v) { next.push(sp); continue; }
    changed = true;
    if (v.trim() !== "") next.push({ ...sp, v });
  }
  return changed ? next : specs;
}

function cleanRankItem(it: RankItem): RankItem {
  const desc = stripOtherSiteRating(it.desc);
  const heading = stripOtherSiteRating(it.heading);
  const purpose = stripOtherSiteRating(it.purpose);
  const time = stripOtherSiteRating(it.time);
  const transit = stripOtherSiteRating(it.transit);
  const specs = cleanSpecs(it.specs);
  if (desc === it.desc && heading === it.heading && purpose === it.purpose && time === it.time && transit === it.transit && specs === it.specs) return it;
  return { ...it, desc, heading, purpose, time, transit, specs };
}

/** 特集記事の文章の項目（subtitle・lede・quote・closing・各項目の desc・heading・purpose・time・transit・specs の値） */
export function cleanArticleText<T extends FeatureArticle>(a: T): T {
  const subtitle = stripOtherSiteRating(a.subtitle);
  const lede = stripOtherSiteRating(a.lede);
  const quote = stripOtherSiteRating(a.quote);
  const closing = stripOtherSiteRating(a.closing);
  let ranking = a.ranking;
  if (Array.isArray(a.ranking)) {
    const mapped = a.ranking.map(cleanRankItem);
    if (mapped.some((m, i) => m !== a.ranking[i])) ranking = mapped;
  }
  if (subtitle === a.subtitle && lede === a.lede && quote === a.quote && closing === a.closing && ranking === a.ranking) return a;
  return { ...a, subtitle, lede, quote, closing, ranking };
}
