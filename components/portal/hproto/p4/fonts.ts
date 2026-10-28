import { Shippori_Mincho, Shippori_Mincho_B1, Yomogi, Dancing_Script } from "next/font/google";

// 総合トップの試作「見本4(丸い切り抜き)」で使う書体。
//  min  = Shippori Mincho    … 見出し・本文・ナビ(明朝)
//  minb = Shippori Mincho B1 … ロゴ「マチノワ」
//  yomo = Yomogi             … ヒーローの手書き風の大見出し・丸い札
//  scr  = Dancing Script     … 筆記体の英字(Special Contents / Connect the Town)
export const min = Shippori_Mincho({ weight: ["400", "500", "600", "700"], variable: "--p4-min", display: "swap", preload: false });
export const minb = Shippori_Mincho_B1({ weight: ["700", "800"], variable: "--p4-minb", display: "swap", preload: false });
export const yomo = Yomogi({ weight: "400", variable: "--p4-yomo", display: "swap", preload: false });
export const scr = Dancing_Script({ weight: ["500"], variable: "--p4-scr", display: "swap", preload: false });
