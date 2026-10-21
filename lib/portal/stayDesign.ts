/**
 * ステイのデザインの切り替え(1 か所)。
 *
 *   "decided" … オーナー決定のデザイン(見本 4 枚。components/portal/stayproto/decided/)を実在の宿・記事で出す
 *   "legacy"  … これまでのページ(VerticalHub・共通の店ページ)
 *
 * 値を替えたら再デプロイが要る(ビルド時に読む)。ペットの lib/portal/petDesign.ts と同じ作り。
 */
export type StayDesign = "decided" | "legacy";

export const STAY_DESIGN: StayDesign = "decided";

export function isStayDecided(): boolean {
  return STAY_DESIGN === "decided";
}
