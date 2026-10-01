import { notFound } from "next/navigation";
import TownPage from "@/components/TownPage";
import { REGIONS, type RegionKey, toCardItem } from "@/lib/regions";
import { getAllTowns, getRestaurantsByTown, getTownsByRegion } from "@/lib/db/towns";
import { GEO } from "@/lib/geo";
import { buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { isTownIndexable } from "@/lib/restaurantIndexable";
import { TOWN_INTROS } from "@/lib/townIntros";
import { decodeTownParam, parseTown, townKey } from "@/lib/towns";
import { getTownFeatureLinks } from "@/lib/townFeatures";
import { sceneFeaturesForTown } from "@/lib/sceneFeatureLinks";
import { cuisineLabel } from "@/lib/seoText";

const BASE = "https://machinowa.tokyo";

// 店の一覧は DB（Supabase）と lib/ のコード側の和集合。60 秒ごとに再生成する
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const towns = await getAllTowns();
  return towns.map((t) => ({ key: t.region, town: t.town }));
}

type Params = Promise<{ key: string; town: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { key, town: rawTown } = await params;
  const town = decodeTownParam(rawTown);
  const region = REGIONS[key as RegionKey];
  if (!region) return { title: "街が見つかりません — マチノワ" };
  const stores = await getRestaurantsByTown(key as RegionKey, town);
  if (stores.length === 0) return { title: "街が見つかりません — マチノワ" };
  const pref = parseTown(stores[0].address, key)?.pref ?? region.name;
  const count = stores.length;
  const title = `${town}のグルメ・飲食店（掲載${count}店） — マチノワ`;
  const description = `マチノワに掲載している${pref}${town}の飲食店${count}店を、地図と一覧でまとめています。店名・業態・住所・営業時間は店舗ごとのページで確認できます。`;
  return {
    title,
    description,
    // 掲載店が少ない街は noindex（sitemap からも外す。店が増えれば自動で index に戻る）
    robots: isTownIndexable(count) ? undefined : { index: false, follow: true },
    alternates: { canonical: `/region/${key}/${town}` },
    openGraph: {
      title: `${town}のグルメ・飲食店 — マチノワ`,
      description,
      url: `${BASE}/region/${key}/${encodeURIComponent(town)}`,
      type: "website",
      locale: "ja_JP",
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { key, town: rawTown } = await params;
  const town = decodeTownParam(rawTown);
  const region = REGIONS[key as RegionKey];
  if (!region) notFound();
  const restaurants = await getRestaurantsByTown(key as RegionKey, town);
  if (restaurants.length === 0) notFound();

  const pref = parseTown(restaurants[0].address, key)?.pref ?? region.name;
  const regionTowns = await getTownsByRegion(key as RegionKey);

  const mapPoints = restaurants
    .filter((r) => GEO[r.id])
    .map((r) => {
      const geo = GEO[r.id];
      return {
        id: r.id,
        name: r.name,
        lat: geo.lat,
        lng: geo.lng,
        href: `/restaurant/${r.id}`,
        sub: `${cuisineLabel(r.cuisine) || r.cuisine} · ${r.address}`,
      };
    });

  const cuisineCount = new Map<string, number>();
  for (const r of restaurants) {
    const label = cuisineLabel(r.cuisine);
    if (label) cuisineCount.set(label, (cuisineCount.get(label) ?? 0) + 1);
  }
  const cuisines = [...cuisineCount.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ja"))
    .slice(0, 8);

  const features = getTownFeatureLinks(
    key as RegionKey,
    town,
    restaurants,
    regionTowns.map((t) => t.town),
  );
  const sceneFeatures = sceneFeaturesForTown(key, town);

  const otherTowns = regionTowns
    .filter((t) => t.town !== town)
    .slice(0, 24)
    .map((t) => ({ town: t.town, count: t.count, href: t.href }));

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "トップ", url: BASE },
    { name: region.name, url: `${BASE}/region/${key}` },
    { name: town, url: `${BASE}/region/${key}/${encodeURIComponent(town)}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <TownPage
        regionKey={key}
        regionName={region.name}
        pref={pref}
        town={town}
        restaurants={restaurants.map(toCardItem)}
        mapPoints={mapPoints}
        intro={TOWN_INTROS[townKey(key, town)] ?? null}
        cuisines={cuisines}
        features={features}
        sceneFeatures={sceneFeatures}
        otherTowns={otherTowns}
        indexable={isTownIndexable(restaurants.length)}
      />
    </>
  );
}
