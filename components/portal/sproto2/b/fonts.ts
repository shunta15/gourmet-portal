import { Noto_Sans_JP, Noto_Serif_JP, Cormorant_Garamond } from "next/font/google";

// スポーツ試作 B 案(見本2: 店舗紹介・特集)の書体。変数は S2bFrame の .s2b-root に付く。
//  jp = Noto Sans JP(特集のゴシック)/ sf = Noto Serif JP(店ページの明朝・見出し)/ en = Cormorant Garamond(斜体の数字・英字ラベル)
export const jp = Noto_Sans_JP({ weight: ["400", "500", "700"], variable: "--s2b-jp", display: "swap", preload: false });
export const sf = Noto_Serif_JP({ weight: ["400", "500", "600"], variable: "--s2b-sf", display: "swap", preload: false });
export const en = Cormorant_Garamond({ weight: ["300", "400", "500", "600"], style: ["normal", "italic"], subsets: ["latin"], variable: "--s2b-en", display: "swap", preload: false });
