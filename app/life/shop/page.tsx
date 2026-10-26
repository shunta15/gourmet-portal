import { vkShopListPage } from "@/components/portal/vkit/shoplist/ShopListPage";
import { lifeCfg } from "@/components/portal/vkit/configs";
import { LifeShopListPage } from "@/components/portal/life/pages";
import { assertPortalLive } from "@/lib/portal/launch";

// 店舗紹介の一覧(/life/shop)。メニューの「店舗紹介」の行き先。見出し「店舗紹介」と件数(掲載している全店の実数)・全店の札(2026-10-26 の見本の部品。components/portal/life/inner/list/)。札を押すと、その店の店舗紹介ページ /life/shop/{id}。
// title は「店舗紹介 | マチノワライフ」、canonical は自分自身。robots は他の新業種ページと同じ gate(業種の掲載が 3 件未満なら noindex)。2 ページ目以降は noindex。metadata は vkit の店舗紹介の一覧(vkShopListPage)と同じ。
const live = vkShopListPage(lifeCfg);

export async function generateMetadata(props: Parameters<typeof live.generateMetadata>[0]) {
  assertPortalLive();
  return live.generateMetadata(props);
}

export default async function Page(props: Parameters<typeof live.Page>[0]) {
  return <LifeShopListPage searchParams={props.searchParams} />;
}
