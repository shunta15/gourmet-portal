/**
 * 特集を探す /feature/search の新しい見た目（サーバー）。metadata・検索の引数・結果は app/gourmet/feature/search/page.tsx のまま。
 * 枠は周りのページと同じ（PeripheryFrame）。字は今の見出し（パンくず・「特集を探す」・題）と同じ。
 */
import { Suspense } from "react";
import PeripheryFrame from "./PeripheryFrame";
import { Hero } from "./parts";
import { FeatureCrumbs, type FeatureItemP } from "./FeatureCardP";
import FeatureSearchClient from "./FeatureSearchClient";

export default function FeatureSearchView({ features, topHref }: { features: FeatureItemP[]; topHref: string }) {
  return (
    <PeripheryFrame>
      <Hero
        before={<FeatureCrumbs items={[{ label: "トップ", href: topHref }, { label: "特集", href: "/feature" }, { label: "特集を探す" }]} />}
        eyebrow="特集を探す"
        title={
          <>
            読みたい特集を、<em>見つける。</em>
          </>
        }
        compact
      />
      <Suspense fallback={null}>
        <FeatureSearchClient features={features} />
      </Suspense>
    </PeripheryFrame>
  );
}
