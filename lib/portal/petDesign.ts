/**
 * ペットのデザインの切り替え(1 か所)。
 *
 *   "decided" … オーナー決定のデザイン(見本 4 枚。components/portal/petproto/decided/)を実在の店・記事で出す
 *   "legacy"  … これまでのページ(VerticalHub・共通の店ページ)
 *
 * 値を替えたら再デプロイが要る(ビルド時に読む)。
 */
export type PetDesign = "decided" | "legacy";

export const PET_DESIGN: PetDesign = "decided";

export function isPetDecided(): boolean {
  return PET_DESIGN === "decided";
}
