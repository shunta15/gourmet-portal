import { Shippori_Mincho_B1, Yuji_Syuku, Zen_Antique } from "next/font/google";

/**
 * 暖簾の染め抜きの字に使う書体。字は布の canvas に描くので、使う字（和洋中麺肉酒茶）だけがブラウザに読み込まれる（unicode-range）。
 * 試作で 6 書体（Yuji Syuku・Yuji Mai・Shippori Mincho B1・Zen Antique・Kaisei Tokumin・Zen Old Mincho）を実際に当てて見比べ、
 * Shippori Mincho B1（800）に決めた。サイトの本文・見出しの明朝と同じ家族で、縁がにじんでも細い横画が残り、品が出る。
 * 見比べの候補として、?font=syuku（筆の細い楷書風）・?font=antique（やや丸みのある古い活字）だけ残してある。
 */
export const shippori = Shippori_Mincho_B1({ subsets: ["latin"], display: "swap", preload: false, weight: "800", variable: "--vR-f-shippori" });
export const syuku = Yuji_Syuku({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--vR-f-syuku" });
export const antique = Zen_Antique({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--vR-f-antique" });

export const FONT_CLASSES = [shippori, syuku, antique].map((f) => f.variable).join(" ");
export type FontKey = "shippori" | "syuku" | "antique";
export const FONT_KEYS: FontKey[] = ["shippori", "syuku", "antique"];
/** 既定の書体（比較して決めたもの） */
export const DEFAULT_FONT: FontKey = "shippori";
/** CSS 変数名（ルート要素の computed style から実際の font-family 名を引く） */
export const fontVar = (k: FontKey) => `--vR-f-${k}`;
