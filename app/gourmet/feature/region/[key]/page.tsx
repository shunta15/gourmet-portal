import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { REGIONS, type RegionKey } from "@/lib/data";
import { getFeaturesByRegion, getFeatureCountsByRegion } from "@/lib/featureRegions";
import { CardGrid, ListHero, TOP_CRUMB } from "@/components/portal/noren/FeatureList";
import { toCardItem } from "@/lib/portal/noren/featureList";
import { isUsableFeatureImage } from "@/lib/portal/noren/usableImage";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";
import { NOREN_FEATURE_INDEX_REWRITE } from "@/lib/portal/noren/rewrites";

// 地域別の特集記事（/feature/region/<key>）の暖簾版の実体（内部のパス）。公開スイッチ ON のとき、/feature/region/<key> が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical・og:url は /feature/region/<key> のまま）。枠は app/gourmet/layout.tsx。
// 中身・metadata は今の app/feature/region/[key]/page.tsx と同じ。OFF のあいだ・NOREN_FEATURE_INDEX_REWRITE=false のあいだは 404。
const KEYS = Object.keys(REGIONS) as RegionKey[];

export const revalidate = 3600; // 1 hour

export const generateStaticParams = liveStaticParams(() => {
  if (!NOREN_FEATURE_INDEX_REWRITE) return [];
  // 記事が1本もない地域はビルドしない
  const counts = getFeatureCountsByRegion();
  return KEYS.filter((k) => counts[k] > 0).map((key) => ({ key }));
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  assertPortalLive();
  if (!NOREN_FEATURE_INDEX_REWRITE) notFound();
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

export default async function Page({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  assertPortalLive();
  if (!NOREN_FEATURE_INDEX_REWRITE) notFound();
  const { key } = await params;
  if (!KEYS.includes(key as RegionKey)) notFound();
  const region = REGIONS[key as RegionKey];
  const features = getFeaturesByRegion(key as RegionKey);
  if (features.length === 0) notFound();
  const items = features.map(toCardItem);
  // 見出しの背景の写真: 今のページと同じ地域の写真（heroImages[0]）。使えない写真（仮の画像・表示禁止）のときは敷かない
  const photo = isUsableFeatureImage(region.heroImages[0]) ? region.heroImages[0] : undefined;
  const others = KEYS.filter((k) => k !== key && getFeaturesByRegion(k).length > 0);

  return (
    <>
      <ListHero
        crumbs={[TOP_CRUMB, { label: "特集", href: "/feature" }, { label: region.name }]}
        eyebrow={`${region.nameEn.toUpperCase()} FEATURES`}
        cloth={region.name}
        photo={photo}
        compact
      >
        <h1 id="vI-h1" className="vI-h1">
          {region.name}の<em>特集記事</em>。
        </h1>
        <p className="vI-lead">
          {region.subtitle}
          <br />
          編集部が選んだ {region.name} の街・食・カルチャー特集 {features.length} 本。
        </p>
        <p>
          <Link href="/feature" className="vI-back" data-cursor="BACK">← 特集記事 一覧へ戻る</Link>
        </p>
      </ListHero>

      <section className="vI-list" aria-label={`${region.name}の特集記事`}>
        <div className="vI-list-in">
          <CardGrid items={items} label={`${region.name}の特集記事`} />
          <nav className="vI-others" aria-label="他の地域">
            <span>他の地域:</span>
            {others.map((k) => (
              <Link key={k} href={`/feature/region/${k}`} className="vI-chip" data-cursor="READ">
                {REGIONS[k].name}
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </>
  );
}
