/**
 * 店の文章・特集記事の文章から、食べログの点数・件数に触れている部分だけを取り除く（表示の直前に通す）。
 * データ（lib/data.ts・DB）は書き換えない。DB から読んだ文章にもコード側の文章にも効く。
 *
 * 発注者の指示（2026-10-11）: 店ページの評価は Google にする。食べログの点数は画面に出さない。
 *  - 取り除くのは「食べログ」＋ 点数（3.50・4.2 のような小数）に触れている文または句だけ。
 *  - 文の残りに別の事実があるときは、その句（読点「、」で区切った 1 かたまり）だけを取り、残りの文は残す。
 *  - 文全体が点数の話なら、その文を丸ごと取る。
 *  - 点数を伴わない「食べログ」の言及（百名店・予約・掲載情報など）はそのまま。
 *  - 機械的に句を取ると文が切れてしまう文は、OVERRIDES で個別に指定する（完全一致の置き換え表）。
 */

/** 「食べログ」のあとに、近いところで小数の点数（3.50・4.2）が出る */
const SCORE = /食べログ[^。、（）()]{0,14}?\d\.\d{1,2}/;

/**
 * 個別の指定（文の完全一致 → 置き換え。"" は丸ごと取る）。
 * 句を取るだけだと文が切れる／残りが主語を失う文だけを入れる。
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
  // 特集「ごはん処 湊茶屋」の導入: 後ろの句「62件のレビューを集めている」が主語を失う
  "食べログの評価は開業から3ヶ月で3.06点、62件のレビューを集めている。": "",
};

/** 句を取ったあとの残りが、文として切れているか（接続の語尾で終わる・件数で始まる） */
function looksBroken(rest: string): boolean {
  return /(?:て|で|が|し|ながら|ので|けれど|けど|と)$/.test(rest) || /^\d+件/.test(rest);
}

function fixSentence(s: string): string {
  if (!SCORE.test(s)) return s;
  if (Object.prototype.hasOwnProperty.call(OVERRIDES, s)) return OVERRIDES[s];
  const end = s.endsWith("。") ? "。" : "";
  const body = end ? s.slice(0, -1) : s;
  const clauses = body.split("、");
  if (clauses.length < 2) return ""; // 1 句だけの文は、丸ごと点数の話
  const kept = clauses.filter((c) => !SCORE.test(c));
  if (kept.length === 0) return "";
  const rest = kept.join("、");
  if (looksBroken(rest)) return ""; // 句を取ると文が切れるときは、切れた文を出さずに丸ごと取る
  return rest + end;
}

/** 1 つの文章（段落・導入・説明）から、食べログの点数に触れている文／句を取り除く。何も無ければそのまま返す */
export function stripTabelogScore(text: string): string;
export function stripTabelogScore(text: string | undefined): string | undefined;
export function stripTabelogScore(text: string | undefined): string | undefined {
  if (!text || !text.includes("食べログ") || !SCORE.test(text)) return text;
  const sentences = text.match(/[^。]*。|[^。]+$/g) ?? [text];
  return sentences.map(fixSentence).join("");
}

/** 文章の並び（本文の段落・見どころ）に通す。丸ごと取れて空になった項目は並びから外す */
export function stripTabelogScoreList(items: string[]): string[];
export function stripTabelogScoreList(items: string[] | undefined): string[] | undefined;
export function stripTabelogScoreList(items: string[] | undefined): string[] | undefined {
  if (!items) return items;
  if (!items.some((t) => typeof t === "string" && t.includes("食べログ") && SCORE.test(t))) return items;
  return items.map((t) => stripTabelogScore(t)).filter((t) => t.trim() !== "");
}
