/**
 * 「にぎわいの輪」の色ちがい（見比べ用）。色の値は components/portal/hubs/nigiwai/themes.css にだけ書く（ここには名前だけ）。
 * 1 つめの shu が、いまの朱（`/proto-hub/nigiwai`）。ほかは `/proto-hub/nigiwai/<名前>`。
 */
export const THEMES = [
  { key: "shu", label: "朱（いまの色）" },
  { key: "midori", label: "深い緑" },
  { key: "kon", label: "紺" },
  { key: "sumi", label: "墨" },
  { key: "terra", label: "テラコッタ" },
  { key: "karashi", label: "からし" },
  { key: "kinari", label: "生成り" },
] as const;

export type ThemeKey = (typeof THEMES)[number]["key"];

export const THEME_KEYS: ThemeKey[] = THEMES.map((t) => t.key);

export const isThemeKey = (s: string): s is ThemeKey => (THEME_KEYS as string[]).includes(s);

export const themeLabel = (k: ThemeKey) => THEMES.find((t) => t.key === k)?.label ?? k;

/** 色の URL。朱は、いまのまま `/proto-hub/nigiwai` */
export const themePath = (k: ThemeKey) => (k === "shu" ? "/proto-hub/nigiwai" : `/proto-hub/nigiwai/${k}`);
