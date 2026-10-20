import { Noto_Sans_JP, Shippori_Mincho, Klee_One } from "next/font/google";

// グリーン案: 本文=Noto Sans JP / 見出し=Shippori Mincho(明朝) / 手書きの添え書き=Klee One。
// 変数は layout の .gr-root に付く。CSS では var(--gr-jp) var(--gr-min) var(--gr-hand) か、base.css の
// .gr-jp / .gr-min / .gr-hand(font-family のかたまり var(--gr-ff-jp) など)を使う。
export const jp = Noto_Sans_JP({ weight: ["400", "500", "700"], variable: "--gr-jp", display: "swap", preload: false });
export const min = Shippori_Mincho({ weight: ["400", "500", "600", "700"], variable: "--gr-min", display: "swap", preload: false });
export const hand = Klee_One({ weight: ["400", "600"], variable: "--gr-hand", display: "swap", preload: false });
