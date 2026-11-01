import { Shippori_Mincho, Zen_Kaku_Gothic_New, Mrs_Saint_Delafield } from "next/font/google";

// グルメ試作「暖簾 3」(/proto-gourmet/n3)で使う書体。暖簾 2 と同じ 3 ファミリーだけ(増やさない)。
// CSS 変数名は --gn3-* にして暖簾 2(--gn-*)と衝突しない。
//  mincho = Shippori Mincho      … 見出し・ロゴ・ナビ → var(--gn3-mincho)
//  gothic = Zen Kaku Gothic New  … 本文・注記・ボタン → var(--gn3-gothic)
//  script = Mrs Saint Delafield  … 手書き筆記体の英字 → var(--gn3-script)
export const mincho = Shippori_Mincho({ weight: ["400", "500", "600", "700"], variable: "--gn3-mincho", display: "swap", preload: false });
export const gothic = Zen_Kaku_Gothic_New({ weight: ["400", "500", "700"], variable: "--gn3-gothic", display: "swap", preload: false });
export const script = Mrs_Saint_Delafield({ weight: "400", variable: "--gn3-script", display: "swap", preload: false });
