import { Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from "next/font/google";

/**
 * 転がしの書体。紙の帯の字は canvas に描くので、使う字だけがブラウザに読み込まれる(unicode-range)。
 * 見出し・帯: Shippori Mincho B1(サイト全体の明朝と同じ家族)。案内・小さな字: Zen Kaku Gothic New。
 */
export const kzMincho = Shippori_Mincho_B1({ subsets: ["latin"], display: "swap", preload: false, weight: ["500", "800"], variable: "--kz-f-min" });
export const kzGothic = Zen_Kaku_Gothic_New({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "500", "700"], variable: "--kz-f-sans" });
export const KZ_FONT_CLASSES = `${kzMincho.variable} ${kzGothic.variable}`;
