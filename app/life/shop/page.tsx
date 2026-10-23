import VkFrame from "@/components/portal/vkit/common/VkFrame";
import { vkShopListPage } from "@/components/portal/vkit/shoplist/ShopListPage";
import { lifeCfg } from "@/components/portal/vkit/configs";
import { assertPortalLive } from "@/lib/portal/launch";

// 店舗紹介の一覧(/life/shop)。メニューの「店舗紹介」の行き先。見出し「店舗紹介」と件数(掲載している全店の実数)・全店の札。札を押すと、その店の店舗紹介ページ /life/shop/{id}。
// 作りは記事の一覧と同じ部品(components/portal/vkit/shoplist/ShopListPage.tsx)。絞り込みは付けない。
// title は「店舗紹介 | マチノワライフ」、canonical は自分自身。robots は他の新業種ページと同じ gate(業種の掲載が 3 件未満なら noindex)。2 ページ目以降は noindex。
const live = vkShopListPage(lifeCfg);

export async function generateMetadata(props: Parameters<typeof live.generateMetadata>[0]) {
  assertPortalLive();
  return live.generateMetadata(props);
}

export default async function Page(props: Parameters<typeof live.Page>[0]) {
  assertPortalLive();
  return <VkFrame cfg={lifeCfg}>{await live.Page(props)}</VkFrame>;
}
