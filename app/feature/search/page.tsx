import { Suspense } from "react";
import FeatureSearchClient from "@/components/FeatureSearchClient";

export const metadata = {
  title: "特集を探す — マチノワ",
  description:
    "編集部の特集記事を、地域・テーマ・キーワードで探す。東京・神奈川などの地域別、デートや朝活などの気分別で絞り込めます。",
  robots: { index: false, follow: true },
};

export default function FeatureSearchPage() {
  return (
    <Suspense fallback={null}>
      <FeatureSearchClient />
    </Suspense>
  );
}
