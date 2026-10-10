import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import NorenSearch from "@/components/portal/noren/NorenSearch";
import { ListHero, TOP_CRUMB } from "@/components/portal/noren/FeatureList";
import { getAllRestaurants } from "@/lib/db/restaurants";
import { buildFacetPayload } from "@/lib/portal/facets";
import { assertPortalLive } from "@/lib/portal/launch";
import { NOREN_SEARCH_REWRITE } from "@/lib/portal/noren/rewrites";
import { toSearchShop } from "@/lib/portal/noren/sceneShop";

// 店をさがす（/search）の暖簾版の実体（内部のパス）。公開スイッチ ON のとき、/search が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical は /search のまま。この内部のパス /gourmet/search は外に出さない）。枠は app/gourmet/layout.tsx。
// metadata（noindex を含む）・検索の引数・絞り込み・こだわり条件は、今の app/search/page.tsx・components/SearchClient.tsx と同じ。
// OFF のあいだ・NOREN_SEARCH_REWRITE=false のあいだは 404。
export const metadata: Metadata = {
  title: "店舗を探す — マチノワ",
  description:
    "全国の飲食店を、地域・業種・キーワードで探す。編集部おすすめ店から、隠れ家まで。",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default async function Page() {
  assertPortalLive();
  if (!NOREN_SEARCH_REWRITE) notFound();
  const restaurants = await getAllRestaurants();
  // 必要な項目だけに絞って渡す（写真は暖簾の店ページと同じ判定を通したもの。評価の数字は渡さない）
  const items = restaurants.map(toSearchShop);
  // こだわり条件は公開スイッチ ON のときだけ（ここは ON のときしか開けない）
  const facets = buildFacetPayload(restaurants);
  return (
    <>
      <ListHero crumbs={[TOP_CRUMB, { label: "店をさがす" }]} eyebrow="店をさがす" eyebrowEn="Search" cloth="さがす" compact>
        <h1 id="vI-h1" className="vI-h1 is-s vSc-lead">
          食べたいお店を、<em>見つける。</em>
        </h1>
      </ListHero>
      <Suspense fallback={null}>
        <NorenSearch restaurants={items} facets={facets} />
      </Suspense>
    </>
  );
}
