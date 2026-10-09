import { Cormorant_Garamond, Yuji_Boku } from "next/font/google";

/** 暖簾の一文字・大きな漢字に使う筆文字系（暖簾の試作だけで使う追加書体） */
export const brush = Yuji_Boku({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--vN-brush",
});

/** 欧文の見出し・数字用（Cormorant）。ルートの変数 --f-latin として暖簾の枠に載せる */
export const latin = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--f-latin",
  display: "swap",
});
