/**
 * 「にぎわいの輪」の配色（総合トップ）。採用された 2 色だけ。色の値は components/portal/hubs/nigiwai/themes.css にだけ書く（ここには名前だけ）。
 *   sometsuke（白磁と藍）: 白い器・割烹。明るい高級感。
 *   akagane（濃紺と銅）: 夜の街・バー。
 * 総合トップ `/` と `/proto-hub/nigiwai` は、開くたびにこの 2 色のどちらかを半々で出す（RANDOM_KEYS）。
 * 色を固定して見るルート（プレビュー・ローカル専用）は `/proto-hub/nigiwai/<名前>`。
 */
export const THEMES = [
  { key: "sometsuke", label: "白磁と藍" },
  { key: "akagane", label: "濃紺と銅" },
] as const;

export type ThemeKey = (typeof THEMES)[number]["key"];

export const THEME_KEYS: ThemeKey[] = THEMES.map((t) => t.key);

export const isThemeKey = (s: string): s is ThemeKey => (THEME_KEYS as string[]).includes(s);

export const themeLabel = (k: ThemeKey) => THEMES.find((t) => t.key === k)?.label ?? k;

/**
 * 抽選の対象（総合トップ）。半々で選ぶ（components/portal/hubs/nigiwai/RandomTheme.tsx と NigiwaiPage の抽選スクリプト）。
 * スクリプトなしのときは先頭の sometsuke。
 */
export const RANDOM_KEYS = ["sometsuke", "akagane"] as const satisfies readonly ThemeKey[];
