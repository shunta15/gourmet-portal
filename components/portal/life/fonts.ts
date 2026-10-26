import { Noto_Serif_JP, Shippori_Mincho_B1, Cormorant_Garamond } from "next/font/google";

// くらし(マチノワライフ。2026-10-26 の見本)の書体。変数は LifeFrame の .lf-root に付く。
//  sm = Shippori Mincho B1(ロゴ・見出し)/ ns = Noto Serif JP(本文の明朝)/ en = Cormorant Garamond(英字のラベル)
export const sm = Shippori_Mincho_B1({ weight: ["500", "700", "800"], variable: "--lf-sm", display: "swap", preload: false });
export const ns = Noto_Serif_JP({ weight: ["400", "500", "600", "700"], variable: "--lf-ns", display: "swap", preload: false });
export const en = Cormorant_Garamond({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--lf-en", display: "swap", preload: false });
