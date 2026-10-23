/**
 * 総合トップの「業種」の本番の中身(名前・サブ文・リンク先・業種の色)。Lower.tsx の札が読む。
 * 変えるなら事実だけの短い言葉(「おすすめ」「人気」「No.1」「その他」は使わない)。
 *   k    … 業種の key(写真 `${IMG}/lower/cat-${k}.webp`・丸いアイコン `ic-${k}.webp`)。cat-gourmet / cat-beauty / cat-stay は AI 画像(業種トップだけで使う)
 *   col  … 業種の色(矢印の丸)
 *   px pw cx ay op … 札の見本座標(1182 基準)と写真の寄せ
 */
export type Cat = { k: string; name: string; sub: string[]; href: string; px: number; pw: number; cx: number; col: string; ay: number; op: string; long?: boolean };

/**
 * 業種 8 つ(2026-10-22: おでかけ → アクティビティに置き換え・スポーツ・くらしを追加)。並びは lib/verticals の VERTICAL_ORDER と同じ。
 * 札の位置(1182 基準): 8 枚を等間隔に。札の幅 126(= pw 106 + 左右 10)・間 6・左端 66 から 132 ずつ(px = 左端 + 10、cx = 左端 + 63)。
 * airy.css は札を中央から 11 ずつ外へ開く(中央は (8 − 1) / 2 = 3.5 番め)。
 * long = 名前が 7 文字(アクティビティ)で、札に収めるために文字を小さくする。
 */
export const CATS: Cat[] = [
  { k: "gourmet", name: "グルメ", sub: ["おいしいお店を", "見つける"], href: "/gourmet", px: 76, pw: 106, cx: 129, col: "#f27b2f", ay: 645, op: "50% 88%" },
  { k: "beauty", name: "ビューティー", sub: ["キレイを楽しむ"], href: "/beauty", px: 208, pw: 106, cx: 261, col: "#ee5d8e", ay: 639, op: "50% 24%" },
  { k: "bodycare", name: "ボディケア", sub: ["からだを整える"], href: "/bodycare", px: 340, pw: 106, cx: 393, col: "#4aa84a", ay: 639, op: "50% 22%" },
  { k: "pet", name: "ペット", sub: ["ペットと一緒に"], href: "/pet", px: 472, pw: 106, cx: 525, col: "#8b6cf0", ay: 639, op: "50% 9%" },
  { k: "stay", name: "ステイ", sub: ["泊まる・くつろぐ"], href: "/stay", px: 604, pw: 106, cx: 657, col: "#f6b620", ay: 639, op: "50% 46%" },
  { k: "activity", name: "アクティビティ", sub: ["遊ぶ・体験する"], href: "/activity", px: 736, pw: 106, cx: 789, col: "#2f8de0", ay: 639, op: "50% 42%", long: true },
  { k: "sports", name: "スポーツ", sub: ["体を動かす"], href: "/sports", px: 868, pw: 106, cx: 921, col: "#17a398", ay: 639, op: "50% 50%" },
  { k: "life", name: "くらし", sub: ["お店・教室・神社"], href: "/life", px: 1000, pw: 106, cx: 1053, col: "#7fa82f", ay: 639, op: "50% 50%" },
];
