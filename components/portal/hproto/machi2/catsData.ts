/**
 * 総合トップの「業種」6 つの本番の中身(名前・サブ文・リンク先・業種の色)。Lower.tsx の既定の札と、Lower の `cats` で差し替える案が同じ物を読む。
 * リンク先(href)・名前・サブ文は本番のまま。変えるなら事実だけの短い言葉(「おすすめ」「人気」「No.1」「その他」は使わない)。
 *   k    … 業種の key(写真 `${IMG}/lower/cat-${k}.webp`・丸いアイコン `ic-${k}.webp`)。cat-gourmet / cat-beauty / cat-stay は AI 画像なので案では使わない
 *   col  … 業種の色(矢印の丸・案の差し色に使ってよい)
 *   px pw cx ay op … 既定の札の見本座標(1182 基準)と写真の寄せ。案では使わなくてよい
 */
export type Cat = { k: string; name: string; sub: string[]; href: string; px: number; pw: number; cx: number; col: string; ay: number; op: string };

export const CATS: Cat[] = [
  { k: "gourmet", name: "グルメ", sub: ["おいしいお店を", "見つける"], href: "/gourmet", px: 63, pw: 134, cx: 130, col: "#f27b2f", ay: 645, op: "50% 88%" },
  { k: "beauty", name: "ビューティー", sub: ["キレイを楽しむ"], href: "/beauty", px: 220, pw: 138, cx: 289, col: "#ee5d8e", ay: 639, op: "50% 24%" },
  { k: "bodycare", name: "ボディケア", sub: ["からだを整える"], href: "/bodycare", px: 384, pw: 173, cx: 473, col: "#4aa84a", ay: 639, op: "50% 22%" },
  { k: "pet", name: "ペット", sub: ["ペットと一緒に"], href: "/pet", px: 583, pw: 162, cx: 662, col: "#8b6cf0", ay: 639, op: "50% 9%" },
  { k: "leisure", name: "おでかけ", sub: ["遊ぶ・体験する"], href: "/leisure", px: 769, pw: 158, cx: 845, col: "#2f8de0", ay: 639, op: "50% 42%" },
  { k: "stay", name: "ステイ", sub: ["泊まる・くつろぐ"], href: "/stay", px: 952, pw: 162, cx: 1034, col: "#f6b620", ay: 639, op: "50% 46%" },
];

/** 見出し(案でも残す。見せ方は変えてよい) */
export const CATS_HEADING = "今日はどんな楽しみを見つける？";
