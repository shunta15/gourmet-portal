import Link from "next/link";
import Footer from "@/components/Footer";
import { FEATURES } from "@/lib/data";

export const metadata = {
  title: "特集記事 一覧 — マチノワ",
  description:
    "編集部が週替わりでお届けする特集記事。旅・季節・隠れ家・深夜ガイドまで。",
};

export default function FeatureIndexPage() {
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
