import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { REGIONS, type RegionKey } from "@/lib/regions";
import { getAllTowns, getRestaurantsByTown, getTownsByRegion } from "@/lib/db/towns";
import { GEO } from "@/lib/geo";
import { buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { isTownIndexable } from "@/lib/restaurantIndexable";
import { TOWN_INTROS } from "@/lib/townIntros";
import { decodeTownParam, parseTown, townKey } from "@/lib/towns";
import { getTownFeatureLinks } from "@/lib/townFeatures";
import { sceneFeaturesForTown } from "@/lib/sceneFeatureLinks";
import { cuisineLabel } from "@/lib/seoText";
import { generateMetadata as legacyGenerateMetadata } from "@/app/region/[key]/[town]/page";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";
import { NOREN_REGION_REWRITE } from "@/lib/portal/noren/rewrites";
import { AreaHero, MapFrame, SecHead, ShopGrid } from "@/components/portal/noren/AreaParts";
import { CardGrid, TOP_CRUMB } from "@/components/portal/noren/FeatureList";
import { type FeatureCardItem } from "@/lib/portal/noren/featureCard";
import { isUsableFeatureImage } from "@/lib/portal/noren/usableImage";
import { flagSize, toAreaShop } from "@/lib/portal/noren/area";

// 街ごと（/region/<key>/<街>）の暖簾版の実体（内部のパス）。公開スイッチ ON のとき、/region/<key>/<街> が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical・og:url は /region/<key>/<街> のまま。この内部のパス /gourmet/region/<key>/<街> は外に出さない）。枠は app/gourmet/layout.tsx。
// 中身・データの取り方・metadata（noindex の条件・パンくずの構造化データを含む）は、今の app/region/[key]/[town]/page.tsx と同じ関数を使う。
// 公開スイッチ OFF のあいだは 404。NOREN_REGION_REWRITE=false のあいだも 404。
const BASE = "https://machinowa.tokyo";

// 店の一覧は DB（Supabase）と lib/ のコード側の和集合。60 秒ごとに再生成する
export const revalidate = 60;
export const dynamicParams = true;

export const generateStaticParams = liveStaticParams(async () => {
  if (!NOREN_REGION_REWRITE) return [];
  const towns = await getAllTowns();
  return towns.map((t) => ({ key: t.region, town: t.town }));
});

type Params = Promise<{ key: string; town: string }>;

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  assertPortalLive();
  if (!NOREN_REGION_REWRITE) notFound();
  return legacyGenerateMetadata(props);
}

export default async function Page({ params }: { params: Params }) {
  assertPortalLive();
  if (!NOREN_REGION_REWRITE) notFound();
  const { key, town: rawTown } = await params;
  const town = decodeTownParam(rawTown);
  const region = REGIONS[key as RegionKey];
  if (!region) notFound();
  const restaurants = await getRestaurantsByTown(key as RegionKey, town);
  if (restaurants.length === 0) notFound();

  // 今のページと同じ取り方
  const pref = parseTown(restaurants[0].address, key)?.pref ?? region.name;
  const regionTowns = await getTownsByRegion(key as RegionKey);

  const mapPoints = restaurants
    .filter((r) => GEO[r.id])
    .map((r) => {
      const geo = GEO[r.id];
      return { id: r.id, name: r.name, lat: geo.lat, lng: geo.lng, href: `/restaurant/${r.id}`, sub: `${cuisineLabel(r.cuisine) || r.cuisine} · ${r.address}` };
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
  const intro = TOWN_INTROS[townKey(key, town)] ?? null;
  const indexable = isTownIndexable(restaurants.length); // 今のページと同じ判定（noindex は metadata 側。ここでは使わないが、同じ条件であることを残す）
  void indexable;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "トップ", url: BASE },
    { name: region.name, url: `${BASE}/region/${key}` },
    { name: town, url: `${BASE}/region/${key}/${encodeURIComponent(town)}` },
  ]);

  const count = restaurants.length;
  const lede =
    intro?.lede ||
    `マチノワに掲載している${pref}${town}の飲食店${count}店を、一覧と地図でまとめています。店名・業態・住所・営業時間は、店舗ごとのページで確認できます。`;
  const shops = restaurants.map(toAreaShop);

  // のぼり: 同じ地域の街の中での、軒数の平方根に比例（トップの「街から」ののぼりと同じ作り）。街のページには布に透ける写真は付けない（布だけ）
  const maxTown = Math.max(count, ...regionTowns.map((t) => t.count));
  const t = Math.sqrt(Math.min(1, count / Math.max(1, maxTown)));
  const flag = { name: town, count, ...flagSize(town, t) };

  const toItems = (list: { id: string; kicker: string; title: string; image: string; sceneName?: string }[]): FeatureCardItem[] =>
    list.map((f) => ({
      id: f.id,
      no: "",
      tag: f.sceneName ?? "",
      kicker: f.kicker,
      title: f.title,
      sub: "",
      img: isUsableFeatureImage(f.image) ? f.image : "",
    }));
  const sceneItems = toItems(sceneFeatures);
  const featureItems = toItems(features);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <AreaHero
        crumbs={[TOP_CRUMB, { label: "エリア", href: "/region" }, { label: region.name, href: `/region/${key}` }, { label: town }]}
        eyebrow="街ガイド"
        eyebrowEn={`${pref} / ${region.name}`}
        flag={flag}
      >
        <h1 id="vI-h1" className="vI-h1 is-s">
          {town}
        </h1>
        <dl className="vR-facts">
          <div>
            <dt>店舗数</dt>
            <dd>
              {count}
              <small>軒</small>
            </dd>
          </div>
        </dl>
        <p className="vI-lead">{lede}</p>
      </AreaHero>

      {/* 基本情報（紹介文がある街だけ） */}
      {intro && intro.facts.length > 0 && (
        <section className="vI-paper vN-paper" aria-labelledby="vR-h-facts">
          <div className="vI-sec-in">
            <SecHead id="vR-h-facts" title={`${town}の、`} em="基本情報。" />
            <dl className="vR-facts-l vN-rv">
              {intro.facts.map((f, i) => (
                <div key={i}>
                  <dt>{f.k}</dt>
                  <dd>
                    {f.v}
                    <small>出典: {f.source}</small>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* 店 */}
      <section className="vR-sec vR-sec--sumi" aria-labelledby="vR-h-shops">
        <div className="vI-sec-in">
          <SecHead
            id="vR-h-shops"
            title={`${town}の、`}
            em="店。"
            aside={
              <span className="vR-count">
                {count}
                <small>軒</small>
              </span>
            }
          />
          {cuisines.length > 0 && (
            <ul className="vR-cus" aria-label="業態の内訳">
              {cuisines.map((c) => (
                <li key={c.label}>
                  {c.label}
                  <span className="c">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
          <ShopGrid items={shops} label={`${town}の店`} />
        </div>
      </section>

      {/* 地図 */}
      {mapPoints.length > 0 && (
        <section className="vI-paper vN-paper" aria-labelledby="vR-h-map">
          <div className="vI-sec-in">
            <SecHead id="vR-h-map" title="地図で、" em="見つける。" sub={`${mapPoints.length}軒をピンで表示`} />
            <MapFrame points={mapPoints} />
          </div>
        </section>
      )}

      {/* シーン */}
      {sceneItems.length > 0 && (
        <section className="vR-sec vR-sec--sumi2" aria-labelledby="vR-h-scene">
          <div className="vI-sec-in">
            <SecHead id="vR-h-scene" title="シーンで、" em="選ぶ。" sub={`${town}の店を、利用シーン別にまとめた特集です。`} />
            <CardGrid items={sceneItems} label={`${town}のシーン特集`} />
          </div>
        </section>
      )}

      {/* 特集記事 */}
      {featureItems.length > 0 && (
        <section className="vR-sec vR-sec--sumi" aria-labelledby="vR-h-feature">
          <div className="vI-sec-in">
            <SecHead id="vR-h-feature" title="読みもの、" em="編集部から。" sub={`${town}の店が載っている特集記事です。`} />
            <CardGrid items={featureItems} label={`${town}の特集記事`} />
          </div>
        </section>
      )}

      {/* 他の街 */}
      <section className="vI-paper vN-paper" aria-labelledby="vR-h-others">
        <div className="vI-sec-in">
          <SecHead id="vR-h-others" title={`${region.name}の、`} em="他の街。" />
          {otherTowns.length > 0 && (
            <ul className="vI-tags vN-rv" aria-label="他の街">
              {otherTowns.map((tw) => (
                <li key={tw.town}>
                  <Link href={tw.href} className="vI-hash" data-cursor="ENTER">
                    {tw.town}
                    <span className="c">{tw.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="vR-foot">
            <Link href={`/region/${key}`} className="vI-btn" data-cursor="ENTER">
              {region.name}の店をすべて見る →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
