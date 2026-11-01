/** 本文・日付・項目名の整形(純関数。サーバー・クライアントのどちらからも import してよい)。 */

/**
 * 本文を段落に分ける。lib/portal/photoFeature/build.ts の paragraphs と同じ挙動(コピー。字は変えない):
 * データに入っている「\n」という 2 文字と実際の改行の両方を段落の切れ目とし、文(。！？の後ろ)をまとめて 1 段落 約 target 字にする。
 * 最後の段落が 28 字未満なら前にくっつける。
 */
export function paragraphs(text: string, target = 110): string[] {
  const out: string[] = [];
  for (const block of (text ?? "").split(/(?:\\n|\n)+/)) {
    const t = block.trim();
    if (!t) continue;
    const sents = t.split(/(?<=[。！？])(?![」』）])/).filter((s) => s.trim());
    let cur = "";
    for (const s of sents) {
      if (cur && cur.length >= target) {
        out.push(cur);
        cur = "";
      } else if (cur && cur.length + s.length > target * 1.6) {
        out.push(cur);
        cur = "";
      }
      cur += s;
    }
    if (cur) out.push(cur);
  }
  if (out.length > 1 && out[out.length - 1].length < 28) {
    const last = out.pop()!;
    out[out.length - 1] += last;
  }
  return out;
}

/** 本文の先頭の n 文(。！？で区切る。切れ目の「\n」「改行」は文の切れ目として読み、返す文字列には入れない)。n 文に満たなければ全部 */
export function firstSentences(text: string, n: number): string {
  const sents: string[] = [];
  for (const block of (text ?? "").split(/(?:\\n|\n)+/)) {
    const t = block.trim();
    if (!t) continue;
    for (const s of t.split(/(?<=[。！？])(?![」』）])/)) if (s.trim()) sents.push(s.trim());
    if (sents.length >= n) break;
  }
  return sents.slice(0, n).join("");
}

/** 値段の項目名か(予算・料金・価格・¥・￥・円 を含む)。specs の行を出すとき、金額の行を除くのに使う */
export function isPriceSpec(k: string): boolean {
  return /予算|料金|価格|[¥￥円]/.test(k ?? "");
}

/** 日付を YYYY.MM.DD にする(ISO 日時・YYYY-MM-DD・YYYY/MM/DD・YYYY.M.D を受ける)。読めなければ元の文字列を返す */
export function fmtDate(isoOrYmd: string): string {
  const m = /^\s*(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(isoOrYmd ?? "");
  if (!m) return (isoOrYmd ?? "").trim();
  return `${m[1]}.${m[2].padStart(2, "0")}.${m[3].padStart(2, "0")}`;
}
