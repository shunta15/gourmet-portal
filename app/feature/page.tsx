import Footer from "@/components/Footer";
import FeatureListClient from "@/components/FeatureListClient";
import { FEATURES, REGIONS, type RegionKey } from "@/lib/data";
import {
  getFeatureRegions,
  getFeatureCountsByRegion,
} from "@/lib/featureRegions";

export const metadata = {
  title: "特集記事 一覧 — マチノワ",
  description:
    "編集部が週替わりでお届けする特集記事。旅・季節・隠れ家・深夜ガイドまで。地域とキーワードで絞り込めます。",
  alternates: { canonical: "/feature" },
};

export default function FeatureIndexPage() {
  const regionMap: Record<string, RegionKey[]> = Object.fromEntries(
    FEATURES.map((f) => [f.id, getFeatureRegions(f.id)])
  );
  const counts = getFeatureCountsByRegion();
  const availableRegions = (Object.keys(REGIONS) as RegionKey[]).filter(
    (k) => counts[k] > 0
  );

  return (
    <>
      <section className="feat-hero" style={{ minHeight: 480 }}>
        <div
          className="img"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1800&q=80)",
          }}
        />
        <div className="feat-hero-inner" style={{ justifyContent: "center" }}>
          <div>
            <div className="kicker">
              <span className="b"></span>
              <span>特集記事 一覧</span>
            </div>
            <h1 style={{ marginTop: 24 }}>
              編集部の、<em>読みもの</em>。
            </h1>
            <p
              style={{
                marginTop: 24,
                maxWidth: 640,
                font: "400 14px/1.9 var(--body)",
                opacity: 0.85,
              }}
            >
              旅、季節、隠れ家、深夜の動線。週替わりで、街の食卓を巡ります。
              地域・キーワードでも絞り込めます。
            </p>
          </div>
        </div>
      </section>

      <div style={{ height: 40 }} />

      <FeatureListClient
        features={FEATURES}
        regionMap={regionMap}
        availableRegions={availableRegions}
      />

      <Footer />
    </>
  );
}
