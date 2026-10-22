import { Noto_Sans_JP, Shippori_Mincho, Cormorant_Garamond, Jost } from "next/font/google";

// 書体 4 つ(ステイの決定デザインと同じ。新業種の共通部品 vkit で使う)。変数は VkRoot の .vk-root に付く。
//  jp  = Noto Sans JP        … 本文・ナビ・ラベル(ゴシック)
//  min = Shippori Mincho     … 大見出し・カードの見出し・リード文(明朝)
//  en  = Cormorant Garamond  … 「01」「02」の大きな斜体の数字・GYM・FITNESS などの小さな英字(セリフ体。斜体あり)
//  lab = Jost                … THE ACTIVITY EDITION / SPECIAL FEATURE / MACHINOWA ACTIVITY などの字間の広い英字(サンセリフ)
// CSS では var(--vk-ff-jp) / var(--vk-ff-min) / var(--vk-ff-en) / var(--vk-ff-lab)(フォールバック込みのかたまり)、
// または base.css の .vk-jp / .vk-min / .vk-en / .vk-lab を使う。
export const jp = Noto_Sans_JP({ weight: ["400", "500", "700"], variable: "--vk-jp", display: "swap", preload: false });
export const min = Shippori_Mincho({ weight: ["400", "500", "600", "700"], variable: "--vk-min", display: "swap", preload: false });
export const en = Cormorant_Garamond({ weight: ["300", "400", "500", "600"], style: ["normal", "italic"], subsets: ["latin"], variable: "--vk-en", display: "swap", preload: false });
export const lab = Jost({ weight: ["300", "400", "500"], subsets: ["latin"], variable: "--vk-lab", display: "swap", preload: false });
