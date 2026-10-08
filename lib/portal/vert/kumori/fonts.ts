import { M_PLUS_Rounded_1c, Shippori_Mincho_B1, Zen_Kurenaido } from "next/font/google";

/** 本文・名前（読みやすい明朝） */
export const mincho = Shippori_Mincho_B1({
  weight: ["500", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--k-mincho",
});

/** 指で書いた字（丸くて太い線）。キャンバスの字の型にも使う */
export const rounded = M_PLUS_Rounded_1c({
  weight: ["800"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--k-round",
});

/** 口紅で書いた番号（クレヨンのようなかすれ手書き） */
export const kuren = Zen_Kurenaido({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--k-kuren",
});
