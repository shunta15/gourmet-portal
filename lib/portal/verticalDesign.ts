/**
 * 業種ごとのデザインの切り替え(1 か所)。ビューティー・ボディケアを別々に戻せる。
 *
 *   "colorplay" … 新しい「COLOR PLAY」(最初のページ → さがす → 1 店 1 ページ。components/portal/colorplay/)
 *   "legacy"    … これまでのページ(ビューティーの入口は曇り鏡・種類/エリアのページ・共通の店ページ)
 *
 * "legacy" にすると、その業種は 前のページの組み(/{v}/search は 404、/{v}/{種類}・/{v}/area/… は元のページ)に戻る。
 * 値を替えたら再デプロイが要る(ビルド時に読む)。
 */
export type CpVerticalKey = "beauty" | "bodycare";
export type VerticalDesign = "colorplay" | "legacy";

export const VERTICAL_DESIGN: Record<CpVerticalKey, VerticalDesign> = {
  beauty: "colorplay",
  bodycare: "legacy", // デザイン未定。今のまま
};

/**
 * ビューティーの最初の画面(赤い面)の動きの案。1 塗る / 2 留める / 3 流れる(components/portal/bproto/colorplay/hero/)。
 * 本番では URL の ?hero= を読まない(見本=VERCEL_ENV が production 以外のときだけ、URL で替えて見比べられる)。
 */
export const BEAUTY_HERO: 1 | 2 | 3 | 4 | 5 | 6 = 2;

export function isColorplay(key: CpVerticalKey): boolean {
  return VERTICAL_DESIGN[key] === "colorplay";
}

/** 最初の画面の案を URL から選んでよいか(本番=production 以外でだけ true) */
export function heroOverrideAllowed(): boolean {
  return process.env.VERCEL_ENV !== "production";
}
