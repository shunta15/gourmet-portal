import Link from "next/link";
import Footer from "@/components/Footer";
import { SCENES } from "@/lib/scenes";

export const metadata = {
  title: "利用シーンから探す | マチノワ",
  description: "デート・接待・一人飲み・記念日など、利用シーンから店を選ぶ。",
  alternates: { canonical: "/scene" },
};

export default function SceneIndex() {
  return (
    <>
      <section className="feat-hero" style={{ minHeight: 360 }}>
        <div
          className="img"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1800&q=80)",
          }}
        />
        <div className="feat-hero-inner" style={{ justifyContent: "center" }}>
          <div>
            <div className="kicker">
              <span className="b"></span>
              <span>利用シーンから探す</span>
            </div>
            <h1 style={{ marginTop: 24 }}>
              気分から、<em>選ぶ。</em>
            </h1>
            <p style={{ marginTop: 20, maxWidth: 640, font: "400 14px/1.9 var(--body)", opacity: 0.85 }}>
              デート・接待・一人飲み・記念日。シーンから探せる、編集部のセレクト。
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 40px", maxWidth: 1400, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {SCENES.map((s) => (
            <Link
              key={s.slug}
              href={`/scene/${s.slug}`}
              data-cursor="READ"
              className="feature-tile"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "26px 22px",
                background: "var(--paper)",
                border: "1px solid var(--line)",
                textDecoration: "none",
                color: "var(--ink)",
              }}
            >
              <div style={{ font: "500 10px/1 var(--mono)", letterSpacing: ".3em", color: "var(--accent)" }}>
                SCENE
              </div>
              <div style={{ font: "500 20px/1.3 var(--serif)" }}>{s.name}</div>
              <div style={{ font: "400 12px/1.7 var(--body)", color: "var(--ink-soft)", marginTop: 4 }}>
                {s.tagline}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
