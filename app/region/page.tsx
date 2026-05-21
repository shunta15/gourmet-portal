import Link from "next/link";
import Footer from "@/components/Footer";
import { REGIONS, RESTAURANTS, type RegionKey } from "@/lib/data";

export const metadata = {
  title: "地域から探す | マチノワ",
  description: "東京・大阪・京都・福岡など、16 地域のミニポータルから探す日本の名店ガイド。",
  alternates: { canonical: "/region" },
};

export default function RegionIndex() {
  const keys = Object.keys(REGIONS) as RegionKey[];
  const counts: Record<string, number> = {};
  for (const r of RESTAURANTS) counts[r.region] = (counts[r.region] || 0) + 1;

  return (
    <>
      <section className="feat-hero" style={{ minHeight: 360 }}>
        <div
          className="img"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1800&q=80)",
          }}
        />
        <div className="feat-hero-inner" style={{ justifyContent: "center" }}>
          <div>
            <div className="kicker">
              <span className="b"></span>
              <span>地域から探す</span>
            </div>
            <h1 style={{ marginTop: 24 }}>
              街ごとの、<em>味。</em>
            </h1>
            <p style={{ marginTop: 20, maxWidth: 640, font: "400 14px/1.9 var(--body)", opacity: 0.85 }}>
              16 地域それぞれのミニポータル。気になる街から、編集部が選んだ一軒を辿ってください。
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 40px", maxWidth: 1400, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {keys.map((k) => {
            const r = REGIONS[k];
            return (
              <Link
                key={k}
                href={`/region/${k}`}
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
                  {r.nameEn.toUpperCase()}
                </div>
                <div style={{ font: "500 22px/1.3 var(--serif)" }}>{r.name}</div>
                <div style={{ font: "400 12px/1.6 var(--body)", color: "var(--ink-soft)" }}>
                  {counts[k] ?? 0} 軒掲載
                </div>
                <div style={{ font: "400 12px/1.7 var(--body)", color: "var(--ink-soft)", marginTop: 6 }}>
                  {r.tagline}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <Footer />
    </>
  );
}
