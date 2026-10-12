/**
 * 店の紹介文を画面に出す前の「文」の点検(純関数)。データそのものは変えない。
 * 次のいずれかを含む「文」は、画面に出さない(店は残す):
 *   - 効き目・症状の改善を思わせる語
 *   - 料金(円・¥・税込)
 *   - 星・順位・口コミ・「おすすめ」「人気」「厳選」「名店」・「営業中」
 * strict(ボディケア)は、効き目を思わせる語の範囲を広げる。
 */
const COMMON = /改善|小顔|若返|美肌|ビフォー|アフター|効果|痩|やせ|治る|人気|おすすめ|オススメ|厳選|名店|口コミ|ランキング|営業中|[★☆]/;
const STRICT = /治療|治す|治し|治[っり]|痛み|症状|ほぐ|整う|整え|効く|効き|緩和|軽減|解消|回復|予防|評価|矯正|リフレッシュ|疲れ|コリ|こり|むくみ|血行/;
const PRICE = /[0-9０-９][0-9０-９,，.]*\s*円|[¥￥]|税込|税抜/;

const sentences = (t: string): string[] => t.match(/[^。]+。?/g) ?? [];

export function lineOk(t: string, strict: boolean): boolean {
  return !COMMON.test(t) && !PRICE.test(t) && !(strict && STRICT.test(t));
}

/** 1 段落ぶん(改行を含まない)から、点検に通らない文を落とす */
function cleanOne(t: string, strict: boolean): string {
  return sentences(t).filter((x) => lineOk(x, strict)).join("").trim();
}

/** 本文(改行で段落に分かれる)→ 点検に通った段落の並び */
export function cleanParagraphs(body: string | undefined, strict: boolean): string[] {
  return (body ?? "").split(/\n+/).map((x) => cleanOne(x.trim(), strict)).filter(Boolean);
}

/** 紹介文の最初の 1 文(点検に通ったもの。長ければ 80 字で切る) */
export function firstSentence(body: string | undefined, strict: boolean, max = 80): string {
  const t = sentences((body ?? "").replace(/\n+/g, "")).find((x) => lineOk(x, strict)) ?? "";
  return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

/** 1 行の説明(headline)。点検に通らなければ空 */
export function cleanLine(t: string | undefined, strict: boolean): string {
  const x = (t ?? "").trim();
  return x && lineOk(x, strict) ? x : "";
}
