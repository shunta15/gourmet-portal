import { Zen_Maru_Gothic, M_PLUS_Rounded_1c, Yusei_Magic, Zen_Kurenaido, Dancing_Script, Hachi_Maru_Pop } from "next/font/google";

export const maru = Zen_Maru_Gothic({ weight: ["400", "500", "700", "900"], subsets: ["latin"], display: "swap", variable: "--hm-maru" });
export const mplus = M_PLUS_Rounded_1c({ weight: ["400", "500", "700", "800"], subsets: ["latin"], display: "swap", variable: "--hm-mplus" });
export const yusei = Yusei_Magic({ weight: "400", subsets: ["latin"], display: "swap", variable: "--hm-yusei" });
export const kure = Zen_Kurenaido({ weight: "400", subsets: ["latin"], display: "swap", variable: "--hm-kure" });
export const script = Dancing_Script({ weight: ["500", "700"], subsets: ["latin"], display: "swap", variable: "--hm-script" });
export const pop = Hachi_Maru_Pop({ weight: "400", subsets: ["latin"], display: "swap", variable: "--hm-pop" });
