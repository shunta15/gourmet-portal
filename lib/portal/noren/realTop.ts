/**
 * グルメのトップ /gourmet の最初の画面（暖簾）を、リアル版にするスイッチ。軽いファイル（サーバー専用の import は足さない）。
 *
 * - NOREN_REAL_TOP が true: /gourmet の最初の画面が、リアル版の暖簾（WebGL の布・赤提灯。components/portal/noren-real/）になる。
 *   最初の画面より下（章・のぼり・特集・掲載方針・フッター）と、メタ情報（title・description・canonical）は変わらない。
 * - NOREN_REAL_TOP が false: 今までどおり、本番の暖簾（components/portal/noren/NorenHero.tsx）。出力は変わらない。
 * - 切り替え方: 下の値を書き替えて、再デプロイする（環境変数ではなく、コードの値。公開スイッチ PORTAL_LAUNCHED とは別）。
 * - 元に戻し方: false にして再デプロイする。
 * - なお、/gourmet が見えるのは公開スイッチ（PORTAL_LAUNCHED）が ON のときだけ（lib/portal/launch.ts）。OFF のあいだは 404 のまま。
 * - 見本 /proto-noren/real は、このスイッチと関係なく、いつでもリアル版（URL の ?dye= で色を替えられ、色の操作盤が出る）。
 *   本番では URL の ?dye= ?wrinkle= は効かず、色は NOREN_REAL_DYE に固定される。
 * - 店ページ・特集記事の布・提灯は、このスイッチでは変わらない（墨茶のまま）。揃えるスイッチは下の NOREN_REAL_INNER。
 */
export type NorenRealDye = "ai" | "kon" | "sumi" | "kakishibu" | "enji";

/** true で /gourmet の最初の画面がリアル版になる（公開するときはここを true にして再デプロイ） */
export const NOREN_REAL_TOP = false;

/** 本番で使う布の色: ai（藍）・kon（濃紺）・sumi（墨）・kakishibu（柿渋）・enji（臙脂） */
export const NOREN_REAL_DYE: NorenRealDye = "ai";

/**
 * 店ページ・特集記事・特集のトップの、布と提灯をリアル版にするスイッチ（入口 NOREN_REAL_TOP とは別。色は上の NOREN_REAL_DYE）。
 * - true: 店ページの屋号の暖簾（ShopHero）・特集記事の巻頭の暖簾（FeatureHero）の布が、入口と同じ見た目・同じ色になる。
 *   店ページ・特集記事の提灯は WebGL の赤提灯になる。CSS で描いた布（特集のカード・目次の札・フッターの暖簾など）の色も選んだ色に揃う。
 *   動き・大きさ・字の割り方・タイミングは変わらない（変わるのは見た目だけ）。
 * - false: 今までどおり（本番の暖簾。出力は変わらない）。元に戻すときは false にして再デプロイ。
 * - 実装: components/portal/noren-real/（clothInner.ts・lanternInner.ts・dye.css）。本番の暖簾の部品（cloth.ts・Lantern.tsx）は書き換えていない。
 */
export const NOREN_REAL_INNER = false;

/**
 * 布・竿・奥の写真の明るさの段階（1〜5）。見本 /proto-noren/real で段階を見比べて決める（URL の ?bright=1〜5。時刻は ?t=12:30 / ?t=21:30）。
 * - 1 は今までと同じ（倍率 1.0。見た目は 1 画素も変わらない）。大きいほど明るい。
 * - 本番では URL で変えられない。ここの値で固定（決まったら書き替えて再デプロイ）。
 * - 効く所: 入口の布・竿・奥の写真（clothReal.ts / real.css）、店ページ・特集記事の WebGL の布・竿（clothInner.ts）。染め抜きの字は 1.1 倍まで。
 *   夜（灯りが強い時刻）は元から明るいので、上げ幅は約 1/3（シェーダーの中で自動で抑える）。
 */
export type NorenRealBright = 1 | 2 | 3 | 4 | 5;
export const NOREN_REAL_BRIGHT: NorenRealBright = 5;

/** 段階 → 倍率（昼の灯りが弱い時刻での倍率。夜は 1 に寄せて掛かる） */
export const BRIGHT_MUL: Record<NorenRealBright, number> = { 1: 1.0, 2: 1.4, 3: 1.9, 4: 2.5, 5: 3.2 };

/** 見本の操作盤から明るさを切り替える口。window に CustomEvent(BRIGHT_EVENT, { detail: 1〜5 }) を送ると、読み込み直しなしで替わる */
export const BRIGHT_EVENT = "noren-real:bright";

/** ?bright= の文字列を段階に直す。合わなければ null */
export function parseBright(q: string | null | undefined): NorenRealBright | null {
  const n = Number(q);
  return n === 1 || n === 2 || n === 3 || n === 4 || n === 5 ? n : null;
}

/** 写真（CSS）に掛ける倍率。布のシェーダーと同じ式で、夜（lamp が大きい）ほど上げ幅を 1/3 に抑える */
export function effBright(mul: number, lamp: number): number {
  const t = Math.min(1, Math.max(0, (lamp - 0.18) / (1 - 0.18)));
  const k = t * t * (3 - 2 * t);
  return mul + (1 + (mul - 1) * 0.35 - mul) * k;
}

/**
 * 暖簾のページの地（背景）の色。sumi（墨・今のまま）・aizumi（藍墨）・kogecha（焦茶）・tetsukon（鉄紺）・haizumi（灰墨）。
 * - sumi 以外にすると、NorenFrame が枠（.vN）に data-ground を付け、components/portal/noren-real/ground.css が --sumi・--sumi-2・--sumi-3・--sumi-4・--sumi-rgb を上書きする。
 *   sumi のときは何も付けない＝出力は今までと同じ。本番はこの値だけを使う（URL では変えられない）。
 * - 見本 /proto-noren/real では、操作盤の「地の色」（URL の ?ground=）で切り替えて見比べる。
 */
export type NorenRealGround = "sumi" | "aizumi" | "kogecha" | "tetsukon" | "haizumi";
export const NOREN_REAL_GROUND: NorenRealGround = "sumi";

export const GROUND_LIST: { key: NorenRealGround; label: string; swatch: string }[] = [
  { key: "sumi", label: "墨", swatch: "#0f0c0a" },
  { key: "aizumi", label: "藍墨", swatch: "#0b1018" },
  { key: "kogecha", label: "焦茶", swatch: "#20160f" },
  { key: "tetsukon", label: "鉄紺", swatch: "#14203a" },
  { key: "haizumi", label: "灰墨", swatch: "#26221f" },
];

/** ?ground= の文字列を地の色に直す。合わなければ null */
export function parseGround(q: string | null | undefined): NorenRealGround | null {
  return GROUND_LIST.find((g) => g.key === q)?.key ?? null;
}

/** 紙の節の色（見本の操作盤の「紙の色」。?paper=）。kinari（生成り・今のまま）・shirocha（白茶）・haijiro（灰白） */
export type NorenRealPaper = "kinari" | "shirocha" | "haijiro";
export const PAPER_LIST: { key: NorenRealPaper; label: string; swatch: string }[] = [
  { key: "kinari", label: "生成り", swatch: "#efe6d6" },
  { key: "shirocha", label: "白茶", swatch: "#e8dcc4" },
  { key: "haijiro", label: "灰白", swatch: "#e3e1db" },
];
export function parsePaper(q: string | null | undefined): NorenRealPaper | null {
  return PAPER_LIST.find((g) => g.key === q)?.key ?? null;
}
