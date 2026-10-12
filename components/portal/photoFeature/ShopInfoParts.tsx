import Link from "next/link";
import LeafletMap from "@/components/LeafletMap";
import ShopActionsNoren from "@/components/portal/noren/ShopActionsNoren";
import ShopMapLink from "@/components/portal/noren/ShopMapLink";
import ShopVideo from "@/components/portal/noren/ShopVideo";
import SaveSeal from "@/components/portal/noren/SaveSeal";
import { sized } from "@/lib/imageUrl";
import type { PfShopInfo } from "@/lib/portal/photoFeature/shopInfo";

/**
 * 写真が主役の特集記事の終わりの「店舗情報」（店ページと同じデータ・同じ部品）の続き。基本情報の表は PhotoFeaturePage にある。
 * 店ページ（components/portal/pages/gourmet-noren-shop.tsx）が出している「行動ボタン」「地図」「ショート動画」「同じ地域の他の店」「関連記事」を、
 * 特集記事の世界（和紙の面・暗い面・縦書き・筆の線）の見た目で出す。点数・星・口コミ件数（Google の評価を含む）は出さない。
 * サーバーコンポーネント。クライアントの部品（ShopActionsNoren・ShopMapLink・ShopVideo・SaveSeal・LeafletMap）へは、小さな値だけを props で渡す。
 */

/** 基本情報の下: タグ・行動ボタン（予約・電話・地図・SNS・共有）・候補に入れる */
export function ShopActions({ info }: { info: PfShopInfo }) {
  return (
    <div className="pf-sa">
      {info.tags.length > 0 && (
        <ul className="pf-tags" aria-label="タグ">
          {info.tags.map((t) => (
            <li key={t}>
              <Link href={`/search?tag=${encodeURIComponent(t)}`}>#{t}</Link>
            </li>
          ))}
        </ul>
      )}
      <ShopActionsNoren model={info.model} storeId={info.id} page={info.page} shareUrl={info.shareUrl} shareText={info.shareText} />
      <div className="pf-save">
        <SaveSeal id={info.id} name={info.name} page={info.page} />
      </div>
    </div>
  );
}

/** 地図（座標がある店だけ。店ページと同じ地図・同じ「Google マップで開く」） */
export function ShopMap({ info }: { info: PfShopInfo }) {
  if (!info.geo) return null;
  return (
    <section className="pf-map" id="map" aria-labelledby="pf-map-h">
      <div className="pf-map__tx pf-rv">
        <h2 id="pf-map-h" className="pf-sec__t">地図</h2>
        <dl className="pf-map__dl">
          {info.address && (
            <div>
              <dt>住所</dt>
              <dd>{info.address}</dd>
            </div>
          )}
          {info.nearest && (
            <div>
              <dt>アクセス</dt>
              <dd>{info.nearest}</dd>
            </div>
          )}
        </dl>
        {info.address && <ShopMapLink href={info.mapsUrl} storeId={info.id} page={info.page} />}
      </div>
      <div className="pf-map__fr pf-rv">
        <LeafletMap points={[{ id: info.id, name: info.name, lat: info.geo.lat, lng: info.geo.lng, sub: info.address }]} height={400} />
      </div>
    </section>
  );
}

/** ショート動画（その店の動画があるときだけ） */
export function ShopVideoBlock({ info }: { info: PfShopInfo }) {
  if (!info.video) return null;
  return (
    <section className="pf-vid" aria-labelledby="pf-vid-h">
      <div className="pf-vid__tx pf-rv">
        <h2 id="pf-vid-h" className="pf-sec__t">ショート動画</h2>
      </div>
      <div className="pf-vid__b pf-rv">
        <ShopVideo video={info.video} />
      </div>
    </section>
  );
}

/** 同じ地域の他の店（店ページと同じ選び方・同じ本数。暗い面に、写真のカード） */
export function ShopMore({ info }: { info: PfShopInfo }) {
  if (info.more.length === 0) return null;
  return (
    <section className="pf-night" aria-labelledby="pf-more-h">
      <div className="pf-night__in pf-rv">
        <h2 id="pf-more-h" className="pf-night__t">{info.regionName}の他の店</h2>
        <ul className="pf-mc-l">
          {info.more.map((x) => (
            <li key={x.id}>
              <Link href={x.href} className="pf-mc">
                <span className="pf-mc__ph" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="pf-mc__img" src={sized(x.image, 640)} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="pf-mc__b">
                  <b>{x.name}</b>
                  <small>{[x.area, x.cuisine].filter(Boolean).join("　")}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** 関連記事（この店が出てくるほかの記事。店ページと同じ選び方） */
export type PfShopFeature = { id: string; href: string; title: string; sub: string; image: string };
export function ShopFeatures({ items }: { items: PfShopFeature[] }) {
  if (items.length === 0) return null;
  return (
    <section className="pf-rel pf-rel--shop" aria-labelledby="pf-sf-h">
      <div className="pf-rel__in pf-rv">
        <h2 id="pf-sf-h" className="pf-rel__t">関連記事</h2>
        <ul className="pf-rel__ul">
          {items.map((f) => (
            <li key={f.id}>
              <Link href={f.href} className="pf-rel__a">
                <span className="pf-rel__ph" aria-hidden="true">
                  {f.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="pf-rel__img" src={sized(f.image, 640)} alt="" loading="lazy" decoding="async" />
                  )}
                </span>
                <span className="pf-rel__b">
                  <b>{f.title}</b>
                  {f.sub && <small>{f.sub}</small>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
