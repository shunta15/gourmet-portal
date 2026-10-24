import { Noto_Sans_JP, Noto_Serif_JP, Montserrat, Jost } from "next/font/google";

// スポーツ試作 2-A の書体。変数は app/proto-sports/layout.tsx の .s2-root に付く。
export const jp = Noto_Sans_JP({ weight: ["300", "400", "500", "700"], variable: "--s2-jp", display: "swap", preload: false });
export const min = Noto_Serif_JP({ weight: ["400", "500"], variable: "--s2-min", display: "swap", preload: false });
export const logo = Montserrat({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--s2-logo", display: "swap", preload: false });
export const lab = Jost({ weight: ["300", "400", "500"], subsets: ["latin"], variable: "--s2-lab", display: "swap", preload: false });
