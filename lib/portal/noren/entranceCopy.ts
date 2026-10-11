/**
 * 入口（/gourmet）の最初の画面の言葉。見出し（縦書きの 2 行）とリード（見出しの横の 1 行）を、ここ 1 か所にまとめている。
 * 本物の暖簾（components/portal/noren-real/NorenHeroReal.tsx）と旧暖簾（components/portal/noren/NorenHero.tsx）の両方がここを見る（aria-label も）。
 * 言葉を替えるときは、この 2 つの定数だけを直す。見出しは 2 行（右の列 → 左の列の順に読む縦書き）。2 行目の字は、1 行目の字数の続きの番号で順に出る。
 */
export const ENTRANCE_H1_LINES = ["暖簾を、", "くぐる。"] as const;
/** 見出しの読み上げ・aria-label 用（2 行をつないだもの） */
export const ENTRANCE_H1 = ENTRANCE_H1_LINES.join("");
/** リード（見出しの横の 1 行。スマホ幅では、丈の案 half の裾の下にも出る） */
export const ENTRANCE_LEAD = "一日の終わりに寄る店を、駅と街から。";

/**
 * 見出し・リードの候補（見本で見比べる用）。URL の ?copy=1〜5 で切り替える。既定（指定なし・本番）は上の ENTRANCE_H1_LINES・ENTRANCE_LEAD。
 * ?copy= が効くのは、本番（VERCEL_ENV が production）以外だけ（?sp= と同じ。サーバーで判定して allowCopyUrl として渡す。app/gourmet/page.tsx）。
 * 採用が決まったら、上の 2 つの定数を直して、この候補は消してよい。
 */
export type EntranceCopy = { lines: readonly [string, string]; lead: string };

export const ENTRANCE_COPY_DEFAULT: EntranceCopy = { lines: ENTRANCE_H1_LINES, lead: ENTRANCE_LEAD };

export const ENTRANCE_COPY_CANDIDATES: Record<"1" | "2" | "3" | "4" | "5", EntranceCopy> = {
  "1": { lines: ["街と店、", "店と人。"], lead: "つながる輪を、一軒の店から。" },
  "2": { lines: ["店と、", "出会う。"], lead: "街と店、店と人。つながる輪を、マチノワから。" },
  "3": { lines: ["街で、", "食べる。"], lead: "一軒の店との出会いが、街の輪になる。" },
  "4": { lines: ["一軒から、", "輪が広がる。"], lead: "街と店、店と人をつなぐ、マチノワのグルメ。" },
  "5": { lines: ["店と人を、", "つなぐ。"], lead: "今夜の一軒を、街と駅からさがせます。" },
};

/** ?copy= の文字列を候補に直す。合わなければ null */
export function parseEntranceCopy(q: string | null | undefined): EntranceCopy | null {
  return q === "1" || q === "2" || q === "3" || q === "4" || q === "5" ? ENTRANCE_COPY_CANDIDATES[q] : null;
}
