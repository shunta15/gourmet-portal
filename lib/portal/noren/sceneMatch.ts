/**
 * 店が利用シーンに入るかの判定（軽い純関数。サーバー・クライアントのどちらからも使える。fs・process.cwd() を使わない）。
 * シーンのページ（app/gourmet/scene/[slug]/page.tsx）・検索の ?scene=（components/portal/noren/NorenSearch.tsx）・入口・地域のページの札の件数が、すべてこの 1 つの関数を使う
 * （今までのシーンのページと同じ定義: シーンの matchTags のどれかが、店のタグ（tags）に完全に一致して含まれる。新しい分類は作らない。店名の一致は使わない）。
 */
export function shopInScene(matchTags: readonly string[], shopTags: readonly string[] | undefined): boolean {
  const tags = shopTags ?? [];
  return matchTags.some((t) => tags.includes(t));
}
