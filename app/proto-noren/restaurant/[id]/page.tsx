import Link from "next/link";
import { notFound } from "next/navigation";
import "../../shop.css";
import LeafletMap from "@/components/LeafletMap";
import ShopHero from "@/components/portal/noren/ShopHero";
import ShopActionsNoren from "@/components/portal/noren/ShopActionsNoren";
import ShopGallery from "@/components/portal/noren/ShopGallery";
import ShopVideo from "@/components/portal/noren/ShopVideo";
import ShopBar from "@/components/portal/noren/ShopBar";
import SaveSeal from "@/components/portal/noren/SaveSeal";
import KanjiCut from "@/components/portal/noren/KanjiCut";
import { REGIONS, SHORT_VIDEOS, toCardItem } from "@/lib/regions";
import { getRestaurantById, getRestaurantsByRegion } from "@/lib/db/restaurants";
import { getTownOfRestaurant } from "@/lib/db/towns";
import { GEO } from "@/lib/geo";
import { ARTICLE_STORE_FEATURE_IDS } from "@/lib/articleStores";
import { mapsUrlForRestaurant } from "@/lib/maps";
import { sized } from "@/lib/imageUrl";
import { isBlockedImage } from "@/lib/imageBlocklist";
import { restaurantSocialLinks } from "@/lib/portal/shopSocial";
import { shareTarget } from "@/lib/portal/share";
import { buildActionModel } from "@/lib/portal/shopActions";
import { restaurantTitle } from "@/lib/seoText";
import { heroImagesOf, isUnusableImage, kanjiFor, nameLayout, stationName } from "@/lib/portal/noren/shop";
import { NOREN_TOP, noFeature, noRestaurant } from "@/lib/portal/noren/nav";
import { featuresOfShop } from "@/lib/portal/noren/shopFeatures";

// 暖簾の見本（店舗紹介ページ）。今の /restaurant/[id] と同じデータ・同じ取り方で、同じ中身を出す。プレビュー・ローカル専用（門は app/proto-noren/layout.tsx）。
export const dynamic = "force-dynamic";

const NUM = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
const usable = (u: string) => !isUnusableImage(u) && !isBlockedImage(u);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await getRestaurantById(id);
  if (!r) return { title: "店舗が見つかりません — マチノワ" };
  return { title: restaurantTitle(r), robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await getRestaurantById(id);
  if (!r) notFound();
  const region = REGIONS[r.region];
  const geo = GEO[r.id] ?? null;

  // 今の店ページと同じ取り方
  const featureId = r.featureId ?? ARTICLE_STORE_FEATURE_IDS[r.id];
  const regionRestaurants = await getRestaurantsByRegion(r.region);
  const related = regionRestaurants.filter((x) => x.id !== r.id).slice(0, 4).map(toCardItem);
  const town = await getTownOfRestaurant(r, regionRestaurants);
  const social = restaurantSocialLinks(r);
  const mapsUrl = mapsUrlForRestaurant(r);
  const video = SHORT_VIDEOS.find((v) => v.restaurantId === r.id) ?? null;
  const features = await featuresOfShop(r.id, featureId);

  // 行動ボタンの一覧（今の ShopActions と同じ関数）。特集記事への行き先だけ、見本の特集ページに向ける
  const model = buildActionModel({
    name: r.name,
    phone: r.phone,
    reservationUrl: r.reservationUrl,
    address: r.address,
    area: r.area,
    mapsUrl,
    geo: geo ? { lat: geo.lat, lng: geo.lng } : null,
    social,
    hasRating: !!r.rating,
    source: r.source ?? null,
    featureId,
    town: town ? { name: town.town, href: town.href, count: town.count } : null,
    region: { name: region.name, href: `/region/${r.region}` },
  });
  model.secondary = model.secondary.map((s) => (s.id === "feature" && featureId ? { ...s, href: noFeature(featureId) } : s));
  const barItems = model.primary.filter((p) => p.id === "reserve" || p.id === "phone" || p.id === "gmap").slice(0, 3);
  if (barItems.length === 0) {
    const m = model.primary.find((p) => p.id === "map");
    if (m) barItems.push(m);
  }

  // 写真
  const heroList = heroImagesOf(r).filter((u) => !isBlockedImage(u));
  const gallery = Array.from(new Set((r.gallery ?? []).filter(usable)));
  const all = Array.from(new Set([...heroList, ...gallery]));
  const heroImgs = heroList.slice(0, 8).map((src, i) => ({ src: sized(src, 1800), alt: `${r.name} 店舗写真 ${i + 1}` }));
  // 漢字の切り抜きに使う写真の候補（ファーストビューの 1 枚目は避ける）。明るく色のあるものをクライアントで選ぶ
  const cutCands = (all.length > 1 ? all.slice(1, 8) : all).map((u) => ({ thumb: sized(u, 240), full: sized(u, 900) }));
  const sidePhoto = all[2] ?? all[1] ?? all[0] ?? "";
  const kanji = kanjiFor(r.cuisine, r.name);
  const station = stationName(r.nearest);

  let n = 0;
  const no = () => NUM[n++] ?? "";

  return (
    <>
      <ShopHero
        name={r.name}
        layout={nameLayout(r.name)}
        images={heroImgs}
        eyebrow={[r.cuisine, station || r.area].filter(Boolean)}
        crumbs={[
          { label: "トップ", href: NOREN_TOP },
          { label: region?.name || r.region, href: `/region/${r.region}` },
          { label: r.name },
        ]}
      />

      {/* 紹介 */}
      <section className={`vS-intro${cutCands.length > 0 ? "" : " no-kj"}`} aria-label="紹介">
        {cutCands.length > 0 && <KanjiCut kanji={kanji} cands={cutCands} />}
        <div className="vS-intro-b vN-rv" style={{ ["--d" as string]: 1 }}>
          {r.desc && <p className="vS-lede">{r.desc}</p>}
          {r.tags && r.tags.length > 0 && (
            <ul className="vS-tags" aria-label="タグ">
              {r.tags.map((t) => (
                <li key={t}>
                  <Link href={`/search?tag=${encodeURIComponent(t)}`} data-cursor="TAG">
                    #{t}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <SaveSeal id={r.id} name={r.name} page={noRestaurant(r.id)} />
        </div>
      </section>

      {/* 本文 */}
      {r.body && r.body.length > 0 && (
        <section className="vS-body vN-paper" aria-labelledby="vS-h-body">
          <div className={`vS-body-in${sidePhoto ? "" : " no-ph"}`}>
            {sidePhoto && (
              <div className="vS-body-ph vN-rv">
                <figure>
                  <i className="vS-pin" aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sized(sidePhoto, 900)} alt={`${r.name} 店舗写真`} loading="lazy" decoding="async" />
                </figure>
              </div>
            )}
            <div className="vS-body-tx vN-rv" style={{ ["--d" as string]: 1 }}>
              {r.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="vS-body-h vN-rv">
              <span className="vS-no" aria-hidden="true"><i>{no()}</i></span>
              <h2 id="vS-h-body" className="vN-tate">
                この店、<em>こういう店。</em>
              </h2>
            </div>
          </div>
        </section>
      )}

      {/* 基本情報・行動ボタン */}
      <section className="vS-info" id="info" aria-labelledby="vS-h-info">
        <div className="vS-info-in">
          <div className="vN-rv">
            <div className="vS-sechead">
              <span className="vS-no" aria-hidden="true"><i>{no()}</i></span>
              <h2 id="vS-h-info" className="vS-h2">
                店舗、<em>詳細。</em>
              </h2>
            </div>
            <dl className="vS-spec">
              {r.hours && (
                <div>
                  <dt>営業時間</dt>
                  <dd>{r.hours}</dd>
                </div>
              )}
              {r.closed && (
                <div>
                  <dt>定休日</dt>
                  <dd>{r.closed}</dd>
                </div>
              )}
              {r.seats && (
                <div>
                  <dt>席数</dt>
                  <dd>{r.seats}</dd>
                </div>
              )}
              {r.budget && (
                <div>
                  <dt>予算</dt>
                  <dd>{r.budget}</dd>
                </div>
              )}
              {r.googleRating && (
                <div>
                  <dt>Google評価</dt>
                  <dd>
                    {r.googleRating}
                    {r.googleReviewCount ? <small>（{r.googleReviewCount.toLocaleString()}件）</small> : null}
                  </dd>
                </div>
              )}
              {r.rating && (
                <div>
                  <dt>評価</dt>
                  <dd>
                    {r.rating}
                    {r.source && (
                      <a className="src" href={r.source.url} target="_blank" rel="noopener noreferrer">
                        （{r.source.label}）
                      </a>
                    )}
                  </dd>
                </div>
              )}
              {r.nearest && (
                <div>
                  <dt>アクセス</dt>
                  <dd>{r.nearest}</dd>
                </div>
              )}
              {r.address && (
                <div>
                  <dt>住所</dt>
                  <dd>{r.address}</dd>
                </div>
              )}
              {r.phone && (
                <div>
                  <dt>電話</dt>
                  <dd>
                    <a className="tel" href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} data-cursor="CALL">
                      {r.phone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <div className="vN-rv" style={{ ["--d" as string]: 1 }}>
            <ShopActionsNoren
              model={model}
              storeId={r.id}
              page={noRestaurant(r.id)}
              shareUrl={shareTarget(`/restaurant/${r.id}`)}
              shareText={`${r.name}｜マチノワ`}
            />
          </div>
        </div>
      </section>

      {/* 地図 */}
      {geo && (
        <section className="vS-map vN-paper" id="map" aria-labelledby="vS-h-map">
          <div className="vS-map-in">
            <div className="vS-map-tx vN-rv">
              <div className="vS-sechead" style={{ marginBottom: 0 }}>
                <span className="vS-no" aria-hidden="true"><i>{no()}</i></span>
                <h2 id="vS-h-map" className="vS-h2">
                  場所と、<em>アクセス。</em>
                </h2>
              </div>
              <dl>
                <div>
                  <dt>住所</dt>
                  <dd>{r.address}</dd>
                </div>
                <div>
                  <dt>アクセス</dt>
                  <dd>{r.nearest}</dd>
                </div>
              </dl>
              {r.address && (
                <a className="vS-btn-ink" href={mapsUrl} target="_blank" rel="noopener noreferrer" data-cursor="MAP">
                  Google マップで開く ↗
                </a>
              )}
            </div>
            <div className="vS-map-fr vN-rv" style={{ ["--d" as string]: 1 }}>
              <LeafletMap points={[{ id: r.id, name: r.name, lat: geo.lat, lng: geo.lng, sub: r.address }]} height={400} />
            </div>
          </div>
        </section>
      )}

      {/* 写真 */}
      {gallery.length > 0 && (
        <section className="vS-gal" aria-labelledby="vS-h-gal">
          <div className="vS-gal-in">
            <div className="vS-sechead vN-rv">
              <span className="vS-no" aria-hidden="true"><i>{no()}</i></span>
              <h2 id="vS-h-gal" className="vS-h2">
                空間と、<em>料理。</em>
              </h2>
            </div>
            <ShopGallery images={gallery} name={r.name} />
          </div>
        </section>
      )}

      {/* ショート動画 */}
      <section className="vS-vid" aria-labelledby="vS-h-vid">
        <div className="vS-vid-in">
          <div className="vS-sechead vN-rv">
            <span className="vS-no" aria-hidden="true"><i>{no()}</i></span>
            <h2 id="vS-h-vid" className="vS-h2">
              ショート、<em>動画。</em>
            </h2>
          </div>
          <div className="vN-rv" style={{ ["--d" as string]: 1 }}>
            <ShopVideo video={video} />
          </div>
        </div>
      </section>

      {/* 関連記事 */}
      {features.length > 0 && (
        <section className="vS-rel" aria-labelledby="vS-h-rel">
          <div className="vS-rel-in">
            <div className="vS-sechead vN-rv">
              <span className="vS-no" aria-hidden="true"><i>{no()}</i></span>
              <h2 id="vS-h-rel" className="vS-h2">関連記事</h2>
            </div>
            <ul className="vS-rel-l">
              {features.map((f, i) => (
                <li key={f.id} className="vN-rv" style={{ ["--d" as string]: i }}>
                  <Link href={noFeature(f.id)} className="vS-rc" data-cursor="READ">
                    <span className="vS-rc-im">
                      {f.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sized(f.image, 640)} alt="" loading="lazy" decoding="async" />
                      )}
                    </span>
                    <span className="vS-rc-tx">
                      <b>{f.title}</b>
                      {f.sub && <small>{f.sub}</small>}
                      <span>{f.paired ? "この店の特集記事を読む →" : "記事を読む →"}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 同じ地域の他の店 */}
      {related.length > 0 && (
        <section className="vS-more" aria-labelledby="vS-h-more">
          <div className="vS-more-in">
            <div className="vS-sechead vN-rv">
              <span className="vS-no" aria-hidden="true"><i>{no()}</i></span>
              <h2 id="vS-h-more" className="vS-h2">
                {region.name}の、<em>他の名店。</em>
              </h2>
            </div>
            <ul className="vS-more-l">
              {related.map((x, i) => (
                <li key={x.id} className="vN-rv" style={{ ["--d" as string]: i }}>
                  <Link href={noRestaurant(x.id)} className="vS-mc" data-cursor="VIEW">
                    <span className="vS-mc-im">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sized(x.image, 640)} alt="" loading="lazy" decoding="async" />
                      <span className="vS-mc-nm">{x.name}</span>
                    </span>
                    <span className="vS-mc-ms">
                      <span>
                        #{x.id.replace(/^r/, "").padStart(2, "0")} · {x.area}
                      </span>
                      <em>{x.cuisine}</em>
                      {(x.googleRating || x.rating) && <em>評価 {x.googleRating ?? x.rating}</em>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ShopBar items={barItems} storeId={r.id} page={noRestaurant(r.id)} />
    </>
  );
}
