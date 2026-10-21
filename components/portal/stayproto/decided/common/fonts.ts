import { Noto_Sans_JP, Shippori_Mincho, Cormorant_Garamond, Jost } from "next/font/google";

// ステイ決定案の書体(見本 4 枚から読み取った 4 つ)。変数は layout / StayRoot の .sy-root に付く。
//  jp  = Noto Sans JP        … 本文・ナビ・ラベル(ゴシック)
//  min = Shippori Mincho     … 大見出し・カードの見出し・リード文(明朝)
//  en  = Cormorant Garamond  … 「01」「02」の大きな斜体の数字・HOTEL / RYOKAN などの小さな英字(セリフ体。斜体あり)
//  lab = Jost                … THE STAY EDITION / SPECIAL FEATURE / MACHINOWA STAY などの字間の広い英字(サンセリフ)
// CSS では var(--sy-ff-jp) / var(--sy-ff-min) / var(--sy-ff-en) / var(--sy-ff-lab)(フォールバック込みのかたまり)、
// または base.css の .sy-jp / .sy-min / .sy-en / .sy-lab を使う。
export const jp = Noto_Sans_JP({ weight: ["400", "500", "700"], variable: "--sy-jp", display: "swap", preload: false });
export const min = Shippori_Mincho({ weight: ["400", "500", "600", "700"], variable: "--sy-min", display: "swap", preload: false });
export const en = Cormorant_Garamond({ weight: ["300", "400", "500", "600"], style: ["normal", "italic"], subsets: ["latin"], variable: "--sy-en", display: "swap", preload: false });
export const lab = Jost({ weight: ["300", "400", "500"], subsets: ["latin"], variable: "--sy-lab", display: "swap", preload: false });
