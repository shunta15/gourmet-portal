import { Noto_Sans_JP, Shippori_Mincho, Zen_Kurenaido, Noto_Serif } from "next/font/google";

// ペット決定案: 本文=Noto Sans JP / 見出し=Shippori Mincho(明朝) / 手書きの添え書き=Zen Kurenaido / 英字(Category・Feature など)=Noto Serif。
// 変数は layout の .pt-root に付く。CSS では var(--pt-jp) var(--pt-min) var(--pt-hand) var(--pt-en)、
// または base.css の .pt-jp / .pt-min / .pt-hand / .pt-en(フォールバック込みの font-family のかたまり var(--pt-ff-*))を使う。
export const jp = Noto_Sans_JP({ weight: ["400", "500", "700"], variable: "--pt-jp", display: "swap", preload: false });
export const min = Shippori_Mincho({ weight: ["400", "500", "600", "700"], variable: "--pt-min", display: "swap", preload: false });
export const hand = Zen_Kurenaido({ weight: "400", variable: "--pt-hand", display: "swap", preload: false });
export const en = Noto_Serif({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--pt-en", display: "swap", preload: false });
