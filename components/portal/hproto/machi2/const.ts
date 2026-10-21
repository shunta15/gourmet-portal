export const BASE = "/proto-home/machi2";
export const IMG = "/_portal/hproto/machi2";
/** 試作 /proto-home/still の最初の画面の 1 枚の絵(2000×667。季節の絵と同じ寸法) */
export const STILL_SRC = `${IMG}/hero-still.webp`;
/** 総合トップの「読みもの」カードのうち、リンク先の記事の実際の写真を出す 2 枚(cards.ts の cardPhotos)。値は /feature/ の後ろの記事 ID(Lower.tsx の CARDS の href と同じ) */
export const CARD_FEATURE = { story: "花見うどん・ラーメン", family: "new-tokyo-family" } as const;
