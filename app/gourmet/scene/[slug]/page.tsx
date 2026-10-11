import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeafletMap from "@/components/LeafletMap";
import { CardGrid, ListHero, TOP_CRUMB } from "@/components/portal/noren/FeatureList";
import { SceneTile, ShopGrid } from "@/components/portal/noren/ShopCard";
import { SCENES, getSceneBySlug } from "@/lib/scenes";
import { buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { getAllRestaurants } from "@/lib/db/restaurants";
import { GEO } from "@/lib/geo";
import { sceneFeaturesForScene } from "@/lib/sceneFeatureLinks";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";
import { NOREN_SCENE_REWRITE } from "@/lib/portal/noren/rewrites";
import { cardImage } from "@/lib/portal/noren/featureList";
import { toShopCard } from "@/lib/portal/noren/sceneShop";
import { shopInScene } from "@/lib/portal/noren/sceneMatch";
import { SceneFindBand } from "@/components/portal/noren/FindBand";
import { countCuisines, countRegions } from "@/lib/portal/noren/openSearch";
import { sceneAccent, sceneCloth } from "@/lib/portal/noren/sceneText";
import type { Feature } from "@/lib/regions";

// シーンごとのページ（/scene/<slug>）の暖簾版の実体（内部のパス）。公開スイッチ ON のとき、/scene/<slug> が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical・og:url は /scene/<slug> のまま。この内部のパス /gourmet/scene/<slug> は外に出さない）。枠は app/gourmet/layout.tsx。
// 中身（シーンの文・タグで絞った店・件数・地図・シーンの特集記事・他のシーン）・title・description・構造化データは、今の app/scene/[slug]/page.tsx と同じ関数・同じデータ。
// OFF のあいだ・NOREN_SCENE_REWRITE=false のあいだは 404。
const BASE = "https://machinowa.tokyo";

export const generateStaticParams = liveStaticParams(() => (NOREN_SCENE_REWRITE ? SCENES.map((s) => ({ slug: s.slug })) : []));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  assertPortalLive();
  if (!NOREN_SCENE_REWRITE) notFound();
  const { slug } = await params;
  const s = getSceneBySlug(slug);
  if (!s) return { title: "シーンが見つかりません — マチノワ" };
  return {
    title: `${s.title} | マチノワ`,
    description: s.description,
    alternates: { canonical: `/scene/${s.slug}` },
    openGraph: {
      title: s.title,
      description: s.description,
      url: `${BASE}/scene/${s.slug}`,
      type: "website",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: s.title,
      description: s.description,
    },
    keywords: s.keywords,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  assertPortalLive();
  if (!NOREN_SCENE_REWRITE) notFound();
  const { slug } = await params;
  const s = getSceneBySlug(slug);
  if (!s) notFound();

  const restaurants = await getAllRestaurants();
  const totalCount = restaurants.length;

  // シーンのタグに当てはまる店（今のページと同じ判定）
  const matchedRestaurants = restaurants.filter((r) => shopInScene(s.matchTags, r.tags));
  const shops = matchedRestaurants.map(toShopCard);

  // 地図の点（位置のある店だけ。今のページと同じ）
  const mapPoints = matchedRestaurants
    .filter((r) => GEO[r.id])
    .map((r) => {
      const geo = GEO[r.id];
      const cuisine = r.cuisine.split(" / ").pop() || r.cuisine;
      return {
        id: r.id,
        name: r.name,
        lat: geo.lat,
        lng: geo.lng,
        href: `/restaurant/${r.id}`,
        sub: `${cuisine} · ${r.area}`,
      };
    });

  // このシーンの特集記事。写真は暖簾の特集と同じ判定（使えなければ記事の一番上の写真。それも無ければ布だけ）
  const features = sceneFeaturesForScene(s.slug).map((f) => ({
    id: f.id,
    no: "",
    tag: f.areaLabel,
    kicker: f.kicker,
    title: f.title,
    sub: "",
    img: cardImage({ id: f.id, image: f.image } as Feature),
  }));

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "トップ", url: BASE },
    { name: "さがす", url: `${BASE}/search` },
    { name: s.title, url: `${BASE}/scene/${s.slug}` },
  ]);

  const no = SCENES.findIndex((x) => x.slug === s.slug) + 1;
  const [head, accent] = sceneAccent(s.slug, s.tagline);
  const otherScenes = SCENES.filter((x) => x.slug !== s.slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <ListHero
        crumbs={[TOP_CRUMB, { label: "さがす", href: "/search" }, { label: s.name }]}
        eyebrow="シーン"
        eyebrowEn={`No.${String(no).padStart(2, "0")}`}
        cloth={sceneCloth(s.slug, s.name)}
        compact
      >
        <h1 id="vI-h1" className="vI-h1 is-s vSc-lead">
          {head}
          <em>{accent}</em>
        </h1>
        <p className="vSc-sub">{s.subtitle}</p>
        <p className="vI-lead vSc-lead">{s.intro}</p>
      </ListHero>

      {/* 絞り込みの帯: このシーンで、エリア・業種を選んで /search?scene=<slug>&… の結果へ（件数は、このシーンに当てはまる店の数） */}
      <SceneFindBand sceneSlug={s.slug} sceneName={s.name} regions={countRegions(matchedRestaurants)} cuisines={countCuisines(matchedRestaurants)} />

      {/* タグで絞った店 */}
      <section className="vI-list" aria-labelledby="vSc-h-shops">
        <div className="vI-list-in">
          <div className="vI-sh vN-rv">
            <div>
              <h2 id="vSc-h-shops" className="vF-h2d">この気分で、<em>選ぶなら。</em></h2>
            </div>
            <p className="vSc-count">
              <em>{shops.length}</em>
              <small>軒</small>/ {totalCount}
              <small>店中</small>
            </p>
          </div>

          <div className="vSc-tagbar">
            <span>絞り込みタグ</span>
            <ul>
              {s.matchTags.map((t) => (
                <li key={t}>
                  <Link href={`/search?tag=${encodeURIComponent(t)}`} className="vI-hash" data-cursor="TAG">
                    #{t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {shops.length > 0 ? (
            <ShopGrid items={shops} label={`${s.name}のタグに当てはまる店`} />
          ) : (
            <p className="vI-empty">
              このシーンのタグが付いた店は、いまのところありません。
              <a href="#vSc-h-others">他のシーンから探す →</a>
            </p>
          )}
        </div>
      </section>

      {/* 地図 */}
      {mapPoints.length > 0 && (
        <section className="vN-paper vI-paper" aria-labelledby="vSc-h-map">
          <div className="vI-sec-in">
            <div className="vI-sh vN-rv">
              <div>
                <h2 id="vSc-h-map" className="vF-h2d">地図で、<em>見つける。</em></h2>
                <p>ピンを押すと、店名と、店のページへの入口が出ます。</p>
              </div>
            </div>
            <div className="vSc-map-fr vN-rv">
              <LeafletMap points={mapPoints} height={460} />
            </div>
          </div>
        </section>
      )}

      {/* このシーンの特集記事 */}
      {features.length > 0 && (
        <section className="vI-sec vI-sec--latest" aria-labelledby="vSc-h-feat">
          <div className="vI-sec-in">
            <div className="vI-sh vN-rv">
              <div>
                <h2 id="vSc-h-feat" className="vF-h2d">{s.name}の、<em>特集記事。</em></h2>
              </div>
            </div>
            <CardGrid items={features} label={`${s.name}の特集記事`} />
          </div>
        </section>
      )}

      {/* 他のシーン */}
      <section className="vN-paper vI-paper" aria-labelledby="vSc-h-others">
        <div className="vI-sec-in">
          <div className="vI-sh vN-rv">
            <div>
              <h2 id="vSc-h-others" className="vF-h2d">他の気分で、<em>探す。</em></h2>
              <p>{otherScenes.length} の利用シーンから選べます。</p>
            </div>
            <Link href="/scene" className="vI-sh-link" data-cursor="ALL">シーンの一覧 →</Link>
          </div>
          <ul className="vSc-scn vN-rv">
            {otherScenes.map((x) => (
              <li key={x.slug}>
                <SceneTile
                  no={SCENES.findIndex((y) => y.slug === x.slug) + 1}
                  name={x.name}
                  tagline={x.tagline}
                  href={`/scene/${x.slug}`}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
