import { Suspense } from "react";
import FeatureSearchClient from "@/components/FeatureSearchClient";
import { FEATURES } from "@/lib/data";
import { getFeatureRegions } from "@/lib/featureRegions";

export const metadata = {
  title: "特集を探す — マチノワ",
  description:
    "編集部の特集記事を、地域・テーマ・キーワードで探す。東京・神奈川などの地域別、デートや朝活などの気分別で絞り込めます。",
  robots: { index: false, follow: true },
  alternates: { canonical: "/feature/search" },
};

export default function FeatureSearchPage() {
  // Precompute featureRegions map
  const featureRegions: Record<string, string[]> = {};
  FEATURES.forEach((f) => {
    featureRegions[f.id] = getFeatureRegions(f.id);
  });

  return (
    <Suspense fallback={null}>
      <FeatureSearchClient features={FEATURES} featureRegions={featureRegions} />
    </Suspense>
  );
}
