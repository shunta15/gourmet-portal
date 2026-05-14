import Link from "next/link";
import Footer from "@/components/Footer";
import { FEATURES, REGIONS, type RegionKey } from "@/lib/data";
import {
  getFeatureCountsByRegion,
} from "@/lib/featureRegions";

export const metadata = {
  title: "特集記事 一覧 — マチノワ",
  description:
    "編集部が週替わりでお届けする特集記事。旅・季節・隠れ家・深夜ガイドまで。地域・テーマ・キーワードで検索できます。",
  alternates: { canonical: "/feature" },
};

export default function FeatureIndexPage() {
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
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Link
                href="/feature/search"
                data-cursor="SEARCH"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 28px",
                  background: "#fff",
                  color: "var(--ink)",
                  font: "500 13px/1 var(--body)",
                  letterSpacing: ".1em",
                  textDecoration: "none",
                  border: "1px solid #fff",
                }}
              >
                <span>特集を探す</span>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4 10h12M12 6l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </Link>
              {availableRegions.map((k) => (
                <Link
                  key={k}
                  href={`/feature/region/${k}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "14px 22px",
                    color: "#fff",
                    font: "500 12px/1 var(--body)",
                    letterSpacing: ".08em",
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.4)",
                  }}
                >
                  {REGIONS[k].name}（{counts[k]}）
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="features" style={{ paddingTop: 80 }}>
        <div className="features-carousel" style={{ flexWrap: "wrap" }}>
          {FEATURES.map((f) => (
            <Link
              key={f.id}
              href={`/feature/${f.id}`}
              className="feature-card"
              data-cursor="READ"
              style={{ flex: "0 0 min(420px, 90vw)" }}
            >
              <div
                className="img"
                style={{ backgroundImage: `url(${f.image})` }}
              />
              <div className="big-no">{f.no}</div>
              <div className="meta">
                <span className="tag">{f.tag}</span>
                <span>{f.kicker}</span>
              </div>
              <div className="body">
                <div className="kicker">特集 / {f.no}</div>
                <h3>{f.title}</h3>
                <p>{f.sub}</p>
                <span className="read">記事を読む →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
