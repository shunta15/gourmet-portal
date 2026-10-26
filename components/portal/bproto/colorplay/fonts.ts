import { Allura, Oswald, Outfit, Zen_Kaku_Gothic_New } from "next/font/google";

export const jp = Zen_Kaku_Gothic_New({ weight: ["500", "700", "900"], variable: "--cp-jp", display: "swap", preload: false });
export const cond = Oswald({ subsets: ["latin"], weight: ["600", "700"], variable: "--cp-cond", display: "swap" });
export const script = Allura({ subsets: ["latin"], weight: "400", variable: "--cp-script", display: "swap" });
export const latin = Outfit({ subsets: ["latin"], weight: "variable", variable: "--cp-latin", display: "swap" });
