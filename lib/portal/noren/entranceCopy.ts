/**
 * 入口（/gourmet）の最初の画面の言葉。見出し（縦書きの 1〜3 行）とリード（見出しの横の 1 行）を、ここ 1 か所にまとめている。
 * 本物の暖簾（components/portal/noren-real/NorenHeroReal.tsx）と旧暖簾（components/portal/noren/NorenHero.tsx）の両方がここを見る（aria-label も）。
 * 言葉を替えるときは、この 2 つの定数だけを直す。見出しは右の列 → 左の列の順に読む縦書き。2 行目以降の字は、前の行までの字数の続きの番号で順に出る。
 * 2026-10-11 オーナー決定: 「グルメから広がる街との輪」（句読点なし）。字数が多いので 3 行（「グルメから」「広がる」「街との輪」）。
 */
export const ENTRANCE_H1_LINES: readonly string[] = ["グルメから", "広がる", "街との輪"];
/** 見出しの読み上げ・aria-label 用（行をつないだもの） */
export const ENTRANCE_H1 = ENTRANCE_H1_LINES.join("");
/** リード（見出しの横の 1 行。スマホ幅では、丈の案 half の裾の下にも出る） */
export const ENTRANCE_LEAD = "一日の終わりに寄る店を、駅と街から。";

/**
 * 見出しの見比べ用の候補。URL の ?copy=0・?copy=2 で切り替える。既定（指定なし・本番）は上の ENTRANCE_H1_LINES・ENTRANCE_LEAD。
 * ?copy= が効くのは、本番（VERCEL_ENV が production）以外だけ（?sp= と同じ。サーバーで判定して allowCopyUrl として渡す。app/gourmet/page.tsx）。
 * h1Size は、この案のときだけ見出しの字の大きさを替える CSS の値（1 行が長い案が、画面からはみ出さないように行の字数に合わせて小さくする）。
 */
export type EntranceCopy = { lines: readonly string[]; lead: string; h1Size?: string };

export const ENTRANCE_COPY_DEFAULT: EntranceCopy = { lines: ENTRANCE_H1_LINES, lead: ENTRANCE_LEAD };

export const ENTRANCE_COPY_CANDIDATES: Record<"0" | "2", EntranceCopy> = {
  // 以前の文言（比較用）
  "0": { lines: ["暖簾を、", "くぐる。"], lead: ENTRANCE_LEAD },
  // 同じ文言を 2 行で。1 行目が 8 字で長いので、字を小さくして収める
  "2": { lines: ["グルメから広がる", "街との輪"], lead: ENTRANCE_LEAD, h1Size: "clamp(30px,7.4vh,78px)" },
};

/** ?copy= の文字列を候補に直す。合わなければ null */
export function parseEntranceCopy(q: string | null | undefined): EntranceCopy | null {
  return q === "0" || q === "2" ? ENTRANCE_COPY_CANDIDATES[q] : null;
}

/** 行ごとの、前の行までの字数の合計（字が順に現れる番号の始まり） */
export function lineBases(lines: readonly string[]): number[] {
  let n = 0;
  return lines.map((l) => {
    const b = n;
    n += Array.from(l).length;
    return b;
  });
}
