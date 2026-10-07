/**
 * 「にぎわいの輪」の色ちがい（見比べ用）。色の値は components/portal/hubs/nigiwai/themes.css にだけ書く（ここには名前だけ）。
 * shu が、いまの朱（`/proto-hub/nigiwai`）。ほかは `/proto-hub/nigiwai/<名前>`。
 *   一番めの 7 つ（shu〜kinari）は「地の色を替えた」色ちがい。
 *   二番めの 5 つ（urushi〜akagane）は、地・文字・差し色・写真の縁・線・押す所・影までを 1 つの世界として組んだ配色。
 * 色見本（最初の画面の下端）に並ぶのは、世界のある 5 つだけ。7 つは URL では開けるまま残す。
 */
export const THEMES = [
  { key: "shu", label: "朱（いまの色）" },
  { key: "midori", label: "深い緑" },
  { key: "kon", label: "紺" },
  { key: "sumi", label: "墨" },
  { key: "terra", label: "テラコッタ" },
  { key: "karashi", label: "からし" },
  { key: "kinari", label: "生成り" },
  { key: "urushi", label: "漆黒と金" },
  { key: "bordeaux", label: "ボルドーとシャンパン金" },
  { key: "shinchu", label: "深緑と真鍮" },
  { key: "sometsuke", label: "白磁と藍" },
  { key: "akagane", label: "濃紺と銅" },
] as const;

export type ThemeKey = (typeof THEMES)[number]["key"];

export const THEME_KEYS: ThemeKey[] = THEMES.map((t) => t.key);

/** 色見本に並べる世界のある 5 つ */
export const SWATCH_KEYS: ThemeKey[] = ["urushi", "bordeaux", "shinchu", "sometsuke", "akagane"];

export const isThemeKey = (s: string): s is ThemeKey => (THEME_KEYS as string[]).includes(s);

export const themeLabel = (k: ThemeKey) => THEMES.find((t) => t.key === k)?.label ?? k;

/**
 * 採用された 2 色（総合トップ）。名前なしのルート `/proto-hub/nigiwai` は、開くたびにこの 2 色のどちらかを半々で出す
 * （components/portal/hubs/nigiwai/RandomTheme.tsx と NigiwaiPage の抽選スクリプト）。スクリプトなしのときは先頭の sometsuke。
 */
export const RANDOM_KEYS = ["sometsuke", "akagane"] as const satisfies readonly ThemeKey[];

/** 色の URL。名前なしのルートは抽選なので、朱（いままでの色）も `/proto-hub/nigiwai/shu` で開く */
export const themePath = (k: ThemeKey) => `/proto-hub/nigiwai/${k}`;
