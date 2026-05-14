import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { REGIONS, type RegionKey } from "@/lib/data";
import {
  getFeaturesByRegion,
  getFeatureCountsByRegion,
} from "@/lib/featureRegions";

const KEYS = Object.keys(REGIONS) as RegionKey[];

export function generateStaticParams() {
  // 記事が1本もない地域はビルドしない
  const counts = getFeatureCountsByRegion();
  return KEYS.filter((k) => counts[k] > 0).map((key) => ({ key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const r = REGIONS[key as RegionKey];
  if (!r) return { title: "地域が見つかりません — マチノワ" };
  const count = getFeaturesByRegion(key as RegionKey).length;
  return {
    title: `${r.name}の特集記事 ${count}本 — マチノワ`,
    description: `${r.name}（${r.nameEn}）の街・食・カルチャーを巡る特集記事を集めました。${r.tagline}。`,
    alternates: {
      canonical: `/feature/region/${key}`,
    },
    openGraph: {
      title: `${r.name}の特集記事 — マチノワ`,
      description: r.subtitle,
      url: `https://machinowa.tokyo/feature/region/${key}`,
      images: [r.heroImages[0]],
      type: "website",
      locale: "ja_JP",
    },
  };
}

export default async function FeatureRegionHub({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  if (!KEYS.includes(key as RegionKey)) notFound();
  const region = REGIONS[key as RegionKey];
  const features = getFeaturesByRegion(key as RegionKey);
  if (features.length === 0) notFound();

  return (
    <>
      <section className="feat-hero" style={{ minHeight: 420 }}>
        <div
          className="img"
          style={{
            backgroundImage: `url(${region.heroImages[0]})`,
          }}
        />
        <div className="feat-hero-inner" style={{ justifyContent: "center" }}>
          <div>
            <div className="kicker">
              <span className="b"></span>
              <span>{region.nameEn} FEATURES</span>
            </div>
            <h1 style={{ marginTop: 24 }}>
              {region.name}の<em>特集記事</em>。
            </h1>
            <p
              style={{
                marginTop: 24,
                maxWidth: 640,
                font: "400 14px/1.9 var(--body)",
                opacity: 0.85,
              }}
            >
              {region.subtitle}
              <br />
              編集部が選んだ {region.name} の街・食・カルチャー特集 {features.length} 本。
            </p>
          </div>
        </div>
      </section>

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 24px 0",
          font: "400 13px/1.6 var(--body)",
          opacity: 0.7,
        }}
      >
        <Link href="/feature" style={{ color: "inherit", textDecoration: "underline" }}>
          ← 特集記事 一覧へ戻る
        </Link>
      </div>

      <section className="features" style={{ paddingTop: 40 }}>
        <div className="features-carousel" style={{ flexWrap: "wrap" }}>
          {features.map((f) => (
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

      <div
        style={{
          maxWidth: 1200,
          margin: "60px auto 0",
          padding: "0 24px 80px",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          font: "400 13px/1.6 var(--body)",
        }}
      >
        <span style={{ opacity: 0.6 }}>他の地域:</span>
        {KEYS.filter(
          (k) => k !== key && getFeaturesByRegion(k).length > 0
        ).map((k) => (
          <Link
            key={k}
            href={`/feature/region/${k}`}
            style={{
              padding: "6px 12px",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 999,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {REGIONS[k].name}
          </Link>
        ))}
      </div>

      <Footer />
    </>
  );
}
