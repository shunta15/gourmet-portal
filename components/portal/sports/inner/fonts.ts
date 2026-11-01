import { Noto_Sans_JP, Noto_Serif_JP, Cormorant_Garamond, Cinzel, Barlow } from "next/font/google";

// スポーツ(見本2: 店舗紹介・特集・記事)の書体。変数は InnerFrame の .s2b-root に付く。
//  jp = Noto Sans JP(特集のゴシック)/ sf = Noto Serif JP(店ページの明朝・見出し)/ en = Cormorant Garamond(斜体の数字・英字ラベル)
export const jp = Noto_Sans_JP({ weight: ["400", "500", "700"], variable: "--s2b-jp", display: "swap", preload: false });
export const sf = Noto_Serif_JP({ weight: ["400", "500", "600"], variable: "--s2b-sf", display: "swap", preload: false });
export const en = Cormorant_Garamond({ weight: ["300", "400", "500", "600"], style: ["normal", "italic"], subsets: ["latin"], variable: "--s2b-en", display: "swap", preload: false });
// ヘッダーのロゴ(SVG の文字)用: cz = Cinzel(店舗紹介ロゴの小さな英字)/ bl = Barlow(特集ロゴの太い英字)
export const cz = Cinzel({ weight: "400", subsets: ["latin"], variable: "--s2b-cz", display: "swap", preload: false });
export const bl = Barlow({ weight: "700", subsets: ["latin"], variable: "--s2b-bl", display: "swap", preload: false });
