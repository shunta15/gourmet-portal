import { M_PLUS_Rounded_1c, Zen_Kurenaido, Noto_Sans_JP, Jost } from "next/font/google";

// A組(青と黄の切手・チケット風)の書体 4 つ。変数は layout の .apa-root に付く。
//  maru = M PLUS Rounded 1c … 見出し・札(丸ゴシック。見本の太い丸ゴシックに近い)
//  jp   = Noto Sans JP    … 本文・ナビ(ゴシック)
//  hand = Zen Kurenaido   … 写真の上の手書き・「はじめての体験が、…」(手書き)
//  lab  = Jost            … MACHINOWA ACTIVITY などの字間の広い英字
export const maru = M_PLUS_Rounded_1c({ weight: ["400", "500", "700", "800", "900"], variable: "--apa-maru", display: "swap", preload: false });
export const jp = Noto_Sans_JP({ weight: ["400", "500", "700"], variable: "--apa-jp", display: "swap", preload: false });
export const hand = Zen_Kurenaido({ weight: "400", variable: "--apa-hand", display: "swap", preload: false });
export const lab = Jost({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--apa-lab", display: "swap", preload: false });
