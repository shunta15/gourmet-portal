import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { REGIONS, type RegionKey } from "@/lib/regions";
import { getRestaurantsByRegion } from "@/lib/db/restaurants";
import { getFeaturesByRegion } from "@/lib/featureRegions";
import { getRegionStats } from "@/lib/data";
import { GEO } from "@/lib/geo";
import { getTownsByRegion } from "@/lib/db/towns";
import { isSceneFeatureId, sceneFeaturesForRegion } from "@/lib/sceneFeatureLinks";
import { generateMetadata as legacyGenerateMetadata } from "@/app/region/[key]/page";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";
import { NOREN_REGION_REWRITE } from "@/lib/portal/noren/rewrites";
import { AreaHero, AreaTile, MapFrame, SecHead, ShopGrid } from "@/components/portal/noren/AreaParts";
import { CardGrid, TOP_CRUMB } from "@/components/portal/noren/FeatureList";
import { toCardItem as toFeatureCard } from "@/lib/portal/noren/featureList";
import { type FeatureCardItem } from "@/lib/portal/noren/featureCard";
import { regionShopCounts } from "@/lib/portal/noren/areaData";
import { REGION_PICKS, photoFor } from "@/lib/portal/noren/picks";
import { isUsableFeatureImage } from "@/lib/portal/noren/usableImage";
import { flagSize, toAreaShop } from "@/lib/portal/noren/area";

// エリアごと（/region/<key>）の暖簾版の実体（内部のパス）。公開スイッチ ON のとき、/region/<key> が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical・og:url は /region/<key> のまま。この内部のパス /gourmet/region/<key> は外に出さない）。枠は app/gourmet/layout.tsx。
// 中身・データの取り方・metadata（noindex の条件を含む）は、今の app/region/[key]/page.tsx と同じ関数を使う。
// 公開スイッチ OFF のあいだは 404。NOREN_REGION_REWRITE=false のあいだも 404。
const KEYS = Object.keys(REGIONS) as RegionKey[];

export const revalidate = 60;
export const dynamicParams = true;

export const generateStaticParams = liveStaticParams(() => (NOREN_REGION_REWRITE ? KEYS.map((key) => ({ key })) : []));

export async function generateMetadata(props: { params: Promise<{ key: string }> }): Promise<Metadata> {
  assertPortalLive();
  if (!NOREN_REGION_REWRITE) notFound();
  return legacyGenerateMetadata(props);
}

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  assertPortalLive();
  if (!NOREN_REGION_REWRITE) notFound();
  const { key } = await params;
  if (!KEYS.includes(key as RegionKey)) notFound();
  const rk = key as RegionKey;
  const r = REGIONS[rk];

  // 今のページと同じ取り方
  const restaurants = await getRestaurantsByRegion(rk);
  // シーン特集は専用の枠に出すので、汎用の特集枠からは外す
  const features = getFeaturesByRegion(rk).filter((f) => !isSceneFeatureId(f.id));
  const towns = await getTownsByRegion(rk);
  const sceneFeatures = sceneFeaturesForRegion(key);
  const stats = getRegionStats(rk);
  const mapPoints = restaurants
    .filter((x) => GEO[x.id])
    .map((x) => {
      const geo = GEO[x.id];
      const cuisine = x.cuisine.split(" / ").pop() || x.cuisine;
      return { id: x.id, name: x.name, lat: geo.lat, lng: geo.lng, href: `/restaurant/${x.id}`, sub: `${cuisine} · ${x.area}` };
    });

  const shops = restaurants.map(toAreaShop);
  const n = restaurants.length;

  // 見出しの背景の写真（今のページと同じ地域の写真 heroImages[0]。使えない写真のときは敷かない）
  const photo = isUsableFeatureImage(r.heroImages[0]) ? r.heroImages[0] : undefined;

  // のぼり: トップの「街から」と同じ。写真は、その地域に選んである実在の店の写真（無ければ布だけ）。幅と長さは軒数の平方根に比例
  const counts = regionShopCounts();
  const max = Math.max(n, ...Object.values(counts));
  const t = Math.sqrt(Math.min(1, n / Math.max(1, max)));
  const pick = REGION_PICKS[key];
  const pickShop = pick ? restaurants.find((x) => x.id === pick[0]) : undefined;
  const pickImg = pickShop ? photoFor(pickShop, pick[1]) : null;
  const flag = {
    name: r.name,
    count: n,
    ...flagSize(r.name, t),
    img: pickImg && isUsableFeatureImage(pickImg) ? pickImg : undefined,
  };

  const sceneItems: FeatureCardItem[] = sceneFeatures.map((f) => ({
    id: f.id,
    no: "",
    tag: f.sceneName,
    kicker: f.kicker,
    title: f.title,
    sub: "",
    img: isUsableFeatureImage(f.image) ? f.image : "",
  }));
  const featureItems = features.slice(0, 4).map(toFeatureCard);
  const featureTotal = getFeaturesByRegion(rk).length;
  const others = KEYS.filter((k) => k !== rk);

  return (
    <>
      <AreaHero
        crumbs={[TOP_CRUMB, { label: "エリア", href: "/region" }, { label: r.name }]}
        eyebrow="地域別ポータル"
        eyebrowEn={r.nameEn}
        photo={photo}
        flag={flag}
      >
        <h1 id="vI-h1" className="vI-h1">
          {r.name}の<em>街と店。</em>
        </h1>
        <p className="vR-tagline">{r.tagline}</p>
        <p className="vI-lead">{r.intro}</p>
        <dl className="vR-facts">
          <div>
            <dt>店舗数</dt>
            <dd>
              {n}
              <small>軒</small>
            </dd>
          </div>
          <div>
            <dt>エリア</dt>
            <dd>{stats[1].n}</dd>
          </div>
        </dl>
      </AreaHero>

      {/* 店 */}
      <section className="vR-sec vR-sec--sumi" aria-labelledby="vR-h-shops">
        <div className="vI-sec-in">
          <SecHead
            id="vR-h-shops"
            title={<>{r.name}の、</>}
            em="店。"
            sub={r.subtitle}
            aside={
              <span className="vR-count">
                {n}
                <small>軒</small>
              </span>
            }
          />
          <ShopGrid items={shops} label={`${r.name}の店`} />
        </div>
      </section>

      {/* 街 */}
      {towns.length > 0 && (
        <section className="vI-paper vN-paper" aria-labelledby="vR-h-towns">
          <div className="vI-sec-in">
            <SecHead id="vR-h-towns" title="街から、" em="探す。" sub={`店のある${towns.length}の街を、店数の多い順に並べました。`} />
            <ul className="vI-tags vN-rv" aria-label="街">
              {towns.map((tw) => (
                <li key={tw.town}>
                  <Link href={tw.href} className="vI-hash" data-cursor="ENTER">
                    {tw.town}
                    <span className="c">{tw.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* シーン */}
      {sceneItems.length > 0 && (
        <section className="vR-sec vR-sec--sumi2" aria-labelledby="vR-h-scene">
          <div className="vI-sec-in">
            <SecHead id="vR-h-scene" title="シーンで、" em="選ぶ。" sub={`${r.name}の店を、利用シーン別にまとめた特集です。`} />
            <CardGrid items={sceneItems} label={`${r.name}のシーン特集`} />
          </div>
        </section>
      )}

      {/* 地図 */}
      {mapPoints.length > 0 && (
        <section className="vI-paper vN-paper" aria-labelledby="vR-h-map">
          <div className="vI-sec-in">
            <SecHead id="vR-h-map" title="地図で、" em="見つける。" sub={`${mapPoints.length}軒をピンで表示`} />
            <MapFrame points={mapPoints} />
          </div>
        </section>
      )}

      {/* 特集記事 */}
      {featureItems.length > 0 && (
        <section className="vR-sec vR-sec--sumi" aria-labelledby="vR-h-feature">
          <div className="vI-sec-in">
            <SecHead
              id="vR-h-feature"
              title="読みもの、"
              em="編集部から。"
              sub="同じ地域の特集記事です。"
              aside={
                featureTotal > 0 ? (
                  <Link href={`/feature/region/${key}`} className="vR-more" data-cursor="READ">
                    {r.name}の特集をすべて見る →
                  </Link>
                ) : undefined
              }
            />
            <CardGrid items={featureItems} label={`${r.name}の特集記事`} />
          </div>
        </section>
      )}

      {/* 他の地域 */}
      <section className="vI-paper vN-paper" aria-labelledby="vR-h-others">
        <div className="vI-sec-in">
          <SecHead id="vR-h-others" title="他の地域を、" em="歩く。" sub={`全${KEYS.length}地域から選べます。`} aside={<Link href="/region" className="vI-sh-link" data-cursor="READ">エリア一覧へ →</Link>} />
          <div className="vI-tiles vN-rv">
            {others.map((k) => (
              <AreaTile key={k} href={`/region/${k}`} en={REGIONS[k].nameEn} name={REGIONS[k].name} count={counts[k] ?? 0} tagline={REGIONS[k].tagline} tone="paper" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
