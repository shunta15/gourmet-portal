import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/data";
import { getFeatureRegions } from "@/lib/featureRegions";
import FeatureSearch, { type SearchFeature } from "@/components/portal/noren/FeatureSearch";
import { ListHero, TOP_CRUMB } from "@/components/portal/noren/FeatureList";
import { toCardItem } from "@/lib/portal/noren/featureList";
import { assertPortalLive } from "@/lib/portal/launch";
import { NOREN_FEATURE_INDEX_REWRITE } from "@/lib/portal/noren/rewrites";

// 特集を探す（/feature/search）の暖簾版の実体（内部のパス）。公開スイッチ ON のとき、/feature/search が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical は /feature/search のまま）。枠は app/gourmet/layout.tsx。metadata・検索の引数・結果は、今の app/feature/search/page.tsx・components/FeatureSearchClient.tsx と同じ。
// OFF のあいだ・NOREN_FEATURE_INDEX_REWRITE=false のあいだは 404。
export const metadata: Metadata = {
  title: "特集を探す — マチノワ",
  description:
    "編集部の特集記事を、地域・テーマ・キーワードで探す。東京・神奈川などの地域別、デートや朝活などの気分別で絞り込めます。",
  robots: { index: false, follow: true },
  alternates: { canonical: "/feature/search" },
};

export default function Page() {
  assertPortalLive();
  if (!NOREN_FEATURE_INDEX_REWRITE) notFound();
  // 必要な項目だけに絞って渡す（写真は暖簾の特集ページと同じ判定を通したもの）
  const features: SearchFeature[] = FEATURES.map((f) => ({ ...toCardItem(f), regions: getFeatureRegions(f.id) }));
  return (
    <>
      <ListHero crumbs={[TOP_CRUMB, { label: "特集", href: "/feature" }, { label: "特集を探す" }]} eyebrow="特集を探す" cloth="特集を探す" compact>
        <h1 id="vI-h1" className="vI-h1 is-s">
          読みたい特集を、<em>見つける。</em>
        </h1>
      </ListHero>
      <Suspense fallback={null}>
        <FeatureSearch features={features} />
      </Suspense>
    </>
  );
}
