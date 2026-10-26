import "server-only";
import { REGIONS, SHORT_VIDEOS, regionNameOf, toCardItem, type Restaurant, type ShortVideo } from "@/lib/regions";
import { getRestaurantsByRegion } from "@/lib/db/restaurants";
import { getTownOfRestaurant } from "@/lib/db/towns";
import { GEO } from "@/lib/geo";
import { ARTICLE_STORE_FEATURE_IDS } from "@/lib/articleStores";
import { mapsUrlForRestaurant } from "@/lib/maps";
import { restaurantSocialLinks } from "@/lib/portal/shopSocial";
import { shareTarget } from "@/lib/portal/share";
import { buildActionModel, type ActionModel } from "@/lib/portal/shopActions";
import type { NorenLinks } from "@/lib/portal/noren/nav";
import { stripTabelogScoreList } from "@/lib/portal/noren/tabelogScore";
import { NOREN_STRIP_OTHER_RATINGS } from "@/lib/portal/noren/release";

/**
 * 写真が主役の特集記事の終わりに出す「店舗情報」のうち、店ページ（components/portal/pages/gourmet-noren-shop.tsx）と同じ取り方で出す部分。
 * 店ページと同じデータ・同じ関数（buildActionModel・mapsUrlForRestaurant・restaurantSocialLinks・getTownOfRestaurant・getRestaurantsByRegion・GEO・SHORT_VIDEOS）・同じ条件で作る。
 * 点数・星・口コミ件数（Google の評価を含む）は、ここでは取らない（記事には出さない）。
 * サーバー専用（店のデータを読む）。クライアントの部品へは、ここで作った小さな値だけを props で渡す。
 */
export type PfShopMore = { id: string; href: string; name: string; area: string; cuisine: string; image: string };
export type PfShopInfo = {
  id: string;
  name: string;
  /** 計測（shop_tap）に送る「タップしたページ」= この記事のパス */
  page: string;
  /** 行動ボタンの一覧（店ページの ShopActionsNoren が描くものと同じ） */
  model: ActionModel;
  shareUrl: string;
  shareText: string;
  address: string;
  nearest: string;
  mapsUrl: string;
  /** 座標（店ページの GEO と同じ。無ければ null = 地図は出さない） */
  geo: { lat: number; lng: number } | null;
  /** その店のショート動画（SHORT_VIDEOS にあるときだけ） */
  video: ShortVideo | null;
  regionName: string;
  /** 店ページの本文にある「営業時間や価格は変わることがあるため、…ご確認ください」の 1 文（店ページと同じ本文から、そのままの文を取る。無ければ空）。基本情報の下に添える */
  note: string;
  /** 店のタグ（店ページと同じ r.tags。検索 /search?tag=<タグ> へのリンクで出す）。無ければ空 */
  tags: string[];
  /** 同じ地域の他の店（店ページと同じ選び方・同じ本数: 同じ地域の店のうち、この店を除いた先頭 4 軒） */
  more: PfShopMore[];
};

/** 店ページの本文（点数に触れた文を除いたもの）から、営業時間・価格の確認をうながす 1 文を、そのままの文で取る */
function noteOf(r: Restaurant): string {
  const body = NOREN_STRIP_OTHER_RATINGS ? stripTabelogScoreList(r.body ?? []) : r.body ?? [];
  return body.join("").match(/営業時間や価格は変わることがあるため[^。]*。/)?.[0] ?? "";
}

export async function getShopInfo(r: Restaurant, links: NorenLinks, page: string): Promise<PfShopInfo> {
  const region = REGIONS[r.region];
  const geo = GEO[r.id] ?? null;
  const featureId = r.featureId ?? ARTICLE_STORE_FEATURE_IDS[r.id];
  const regionRestaurants = await getRestaurantsByRegion(r.region);
  const more = regionRestaurants.filter((x) => x.id !== r.id).slice(0, 4).map(toCardItem);
  const town = await getTownOfRestaurant(r, regionRestaurants);
  const mapsUrl = mapsUrlForRestaurant(r);
  const model = buildActionModel({
    name: r.name,
    phone: r.phone,
    reservationUrl: r.reservationUrl,
    address: r.address,
    area: r.area,
    mapsUrl,
    geo: geo ? { lat: geo.lat, lng: geo.lng } : null,
    social: restaurantSocialLinks(r),
    hasRating: !!r.rating,
    source: r.source ?? null,
    featureId,
    // 地域・街へのリンクは、/region/… ではなく「さがす」（/search?region=<キー>・&town=<街>）を指す（2026-10-12 オーナー決定: 地域・街・利用シーンのページは /search へ統合）
    town: town ? { name: town.town, href: `/search?region=${encodeURIComponent(r.region)}&town=${encodeURIComponent(town.town)}`, count: town.count } : null,
    region: { name: regionNameOf(r.region), href: `/search?region=${encodeURIComponent(r.region)}` },
  });
  // 「この店の特集記事を読む」は、いま読んでいるこの記事への行き先なので、ここでは出さない（そのほかの出し分けは店ページと同じ）
  model.secondary = model.secondary.filter((s) => s.id !== "feature");
  return {
    id: r.id,
    name: r.name,
    page,
    model,
    shareUrl: shareTarget(`/restaurant/${r.id}`),
    shareText: `${r.name}｜マチノワ`,
    address: r.address ?? "",
    nearest: r.nearest ?? "",
    mapsUrl,
    geo: geo ? { lat: geo.lat, lng: geo.lng } : null,
    video: SHORT_VIDEOS.find((v) => v.restaurantId === r.id) ?? null,
    regionName: regionNameOf(r.region),
    note: noteOf(r),
    tags: r.tags ? [...r.tags] : [],
    more: more.map((x) => ({ id: x.id, href: `${links.shopBase}/${x.id}`, name: x.name, area: x.area, cuisine: x.cuisine, image: x.image })),
  };
}
