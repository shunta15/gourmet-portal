import Link from "next/link";
import Footer from "@/components/Footer";
import { FEATURES, REGIONS, type RegionKey } from "@/lib/data";
import { getFeatureCountsByRegion, getFeaturesByRegion } from "@/lib/featureRegions";

export const metadata = {
  title: "特集記事 — 地域・テーマから探す | マチノワ",
  description:
    "編集部が週替わりでお届けする特集記事。地域・テーマ・利用シーンから絞り込んで読めます。",
  alternates: { canonical: "/feature" },
};

// よく出てくる tag を「テーマ」として束ねる（カテゴリ統合）
const THEME_GROUPS: { label: string; labelEn: string; tags: string[] }[] = [
  { label: "デート", labelEn: "DATE", tags: ["デート"] },
  { label: "観光・街歩き", labelEn: "SIGHTSEEING", tags: ["観光", "街歩き", "散歩", "散歩・自然", "観光・博物館"] },
  { label: "雨の日", labelEn: "RAINY DAY", tags: ["雨の日"] },
  { label: "夜景・夜遊び", labelEn: "NIGHT", tags: ["夜景"] },
  { label: "カフェ・朝活", labelEn: "CAFE / MORNING", tags: ["カフェ", "カフェ・朝活"] },
  { label: "家族・子連れ", labelEn: "FAMILY", tags: ["家族", "ファミリー"] },
  { label: "ショッピング", labelEn: "SHOPPING", tags: ["ショッピング"] },
  { label: "アート", labelEn: "ART", tags: ["アート"] },
  { label: "グルメ", labelEn: "GOURMET", tags: ["グルメ"] },
  { label: "時間つぶし", labelEn: "KILL TIME", tags: ["時間つぶし"] },
];

function countByTheme(group: { tags: string[] }): number {
  const set = new Set(group.tags);
  return FEATURES.filter((f) => set.has(f.tag)).length;
}

function filterByTheme(themeLabel: string): typeof FEATURES {
  const g = THEME_GROUPS.find((x) => x.label === themeLabel);
  if (!g) return [];
  const set = new Set(g.tags);
  return FEATURES.filter((f) => set.has(f.tag));
}

export default async function FeatureIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; theme?: string; all?: string }>;
}) {
  const params = await searchParams;
  const region = params.region as RegionKey | undefined;
  const theme = params.theme;
  const showAll = params.all === "1";

  const counts = getFeatureCountsByRegion();
  const availableRegions = (Object.keys(REGIONS) as RegionKey[]).filter((k) => counts[k] > 0);

  // フィルタが選ばれているか判定
  let filtered: typeof FEATURES | null = null;
  let activeLabel = "";
  if (region && availableRegions.includes(region)) {
    filtered = getFeaturesByRegion(region);
    activeLabel = `地域: ${REGIONS[region].name}`;
  } else if (theme) {
    filtered = filterByTheme(theme);
    activeLabel = `テーマ: ${theme}`;
  } else if (showAll) {
    filtered = FEATURES;
    activeLabel = "全件";
  }

  // ───────── フィルタ未選択時: カテゴリ ランディング ─────────
  if (!filtered) {
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
                <span>特集記事</span>
              </div>
              <h1 style={{ marginTop: 24 }}>
                絞り込んで、<em>読む。</em>
              </h1>
              <p
                style={{
                  marginTop: 24,
                  maxWidth: 640,
                  font: "400 14px/1.9 var(--body)",
                  opacity: 0.85,
                }}
              >
                編集部が週替わりでお届けする特集。地域・テーマから読みたい一本を選んでください。
              </p>
            </div>
          </div>
        </section>

        {/* 地域から探す */}
        <section style={{ padding: "80px 40px 0", maxWidth: 1400, margin: "0 auto" }}>
          <h2 style={{ font: "500 28px/1.3 var(--serif)", marginBottom: 8 }}>
            地域から探す。
          </h2>
          <p style={{ font: "400 14px/1.8 var(--body)", color: "var(--ink-soft)", marginBottom: 32 }}>
            16 地域のミニポータルから特集を絞り込み。
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {availableRegions.map((k) => (
              <Link
                key={k}
                href={`/feature?region=${k}`}
                data-cursor="READ"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "24px 22px",
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  textDecoration: "none",
                  color: "var(--ink)",
                }}
                className="feature-tile"
              >
                <div style={{ font: "500 10px/1 var(--mono)", letterSpacing: ".3em", color: "var(--accent)" }}>
                  {REGIONS[k].nameEn.toUpperCase()}
                </div>
                <div style={{ font: "500 22px/1.3 var(--serif)" }}>{REGIONS[k].name}</div>
                <div style={{ font: "400 12px/1.6 var(--body)", color: "var(--ink-soft)" }}>
                  {counts[k]} 記事
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* テーマから探す */}
        <section style={{ padding: "80px 40px 0", maxWidth: 1400, margin: "0 auto" }}>
          <h2 style={{ font: "500 28px/1.3 var(--serif)", marginBottom: 8 }}>
            テーマ・シーンから探す。
          </h2>
          <p style={{ font: "400 14px/1.8 var(--body)", color: "var(--ink-soft)", marginBottom: 32 }}>
            気分・利用シーンから読みたい特集を選ぶ。
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {THEME_GROUPS.filter((g) => countByTheme(g) > 0).map((g) => (
              <Link
                key={g.label}
                href={`/feature?theme=${encodeURIComponent(g.label)}`}
                data-cursor="READ"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "24px 22px",
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  textDecoration: "none",
                  color: "var(--ink)",
                }}
                className="feature-tile"
              >
                <div style={{ font: "500 10px/1 var(--mono)", letterSpacing: ".3em", color: "var(--accent)" }}>
                  {g.labelEn}
                </div>
                <div style={{ font: "500 22px/1.3 var(--serif)" }}>{g.label}</div>
                <div style={{ font: "400 12px/1.6 var(--body)", color: "var(--ink-soft)" }}>
                  {countByTheme(g)} 記事
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 全件・検索フォールバック */}
        <section
          style={{
            padding: "60px 40px 80px",
            maxWidth: 1400,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div style={{ display: "inline-flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <Link
              href="/feature/search"
              data-cursor="SEARCH"
              style={{
                padding: "14px 28px",
                background: "var(--ink)",
                color: "#fff",
                font: "500 13px/1 var(--body)",
                letterSpacing: ".1em",
                textDecoration: "none",
              }}
            >
              キーワードで探す →
            </Link>
            <Link
              href="/feature?all=1"
              style={{
                padding: "14px 28px",
                color: "var(--ink-soft)",
                font: "400 13px/1 var(--body)",
                textDecoration: "underline",
                textUnderlineOffset: 4,
              }}
            >
              全件を一覧で見る（{FEATURES.length}件）
            </Link>
          </div>
        </section>

        <Footer />
      </>
    );
  }

  // ───────── フィルタ選択済み: 該当記事のみ表示 ─────────
  return (
    <>
      <section className="feat-hero" style={{ minHeight: 360 }}>
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
              <span>{activeLabel}</span>
            </div>
            <h1 style={{ marginTop: 24, fontSize: "clamp(40px,5vw,72px)" }}>
              特集記事 <em>{filtered.length}</em> 件
            </h1>
            <p style={{ marginTop: 16, font: "400 13px/1.8 var(--body)", opacity: 0.85 }}>
              <Link
                href="/feature"
                style={{ color: "#fff", textDecoration: "underline", textUnderlineOffset: 4 }}
              >
                ← フィルタを変える
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="features" style={{ paddingTop: 60, paddingBottom: 80 }}>
        {filtered.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              padding: 80,
              font: "400 14px var(--body)",
              color: "var(--ink-soft)",
            }}
          >
            該当する記事がありません。
            <Link href="/feature" style={{ color: "var(--accent)", marginLeft: 8 }}>
              他のフィルタを選ぶ →
            </Link>
          </p>
        ) : (
          <div className="features-carousel" style={{ flexWrap: "wrap" }}>
            {filtered.map((f) => (
              <Link
                key={f.id}
                href={`/feature/${f.id}`}
                className="feature-card"
                data-cursor="READ"
                style={{ flex: "0 0 min(420px, 90vw)" }}
              >
                <div className="img" style={{ backgroundImage: `url(${f.image})` }} />
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
        )}
      </section>

      <Footer />
    </>
  );
}
