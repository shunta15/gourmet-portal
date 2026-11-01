import { Shippori_Mincho, Zen_Kaku_Gothic_New, Mrs_Saint_Delafield } from "next/font/google";

// グルメ試作「暖簾 2」(/proto-gourmet/n)で使う書体。3 ファミリーだけ(過去に Google Fonts の取得でビルドが落ちたため、増やさない)。
//  mincho = Shippori Mincho      … 見出し・ロゴ・ナビ(明朝)               → var(--gn-mincho)
//  gothic = Zen Kaku Gothic New  … 本文・小さい注記・ボタン(ゴシック)      → var(--gn-gothic)
//  script = Mrs Saint Delafield  … 手書き筆記体の英字(Noren Gallery / Find your area / Good food Good time) → var(--gn-script)
export const mincho = Shippori_Mincho({ weight: ["400", "500", "600", "700"], variable: "--gn-mincho", display: "swap", preload: false });
export const gothic = Zen_Kaku_Gothic_New({ weight: ["400", "500", "700"], variable: "--gn-gothic", display: "swap", preload: false });
export const script = Mrs_Saint_Delafield({ weight: "400", variable: "--gn-script", display: "swap", preload: false });
