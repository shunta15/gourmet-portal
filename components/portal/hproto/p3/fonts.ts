import { Shippori_Mincho, Shippori_Mincho_B1, La_Belle_Aurore } from "next/font/google";

// 総合トップの試作「p3」(写真コラージュの見本の再現)で使う書体。
//  min  = Shippori Mincho    … 見出し・本文・ナビ(明朝)
//  minb = Shippori Mincho B1 … ロゴ「マチノワ」(太い明朝)
//  hand = La Belle Aurore    … ヒーローの筆記体「Good local Good life」
export const min = Shippori_Mincho({ weight: ["400", "500", "600", "700"], variable: "--p3-min", display: "swap", preload: false });
export const minb = Shippori_Mincho_B1({ weight: ["700", "800"], variable: "--p3-minb", display: "swap", preload: false });
export const hand = La_Belle_Aurore({ weight: "400", variable: "--p3-hand", display: "swap", preload: false });
