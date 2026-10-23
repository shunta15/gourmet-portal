import { cpShopListPage } from "@/components/portal/colorplay/pages/shopList";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { assertPortalLive } from "@/lib/portal/launch";

// 店舗紹介の一覧(/beauty/shop)。メニューの「店舗紹介」の行き先。掲載中の全店の札。状態は URL の引数(n)だけ。
const cp = cpShopListPage(BEAUTY_SITE);

export async function generateMetadata(props: Parameters<typeof cp.generateMetadata>[0]) {
  assertPortalLive();
  return cp.generateMetadata(props);
}

export default async function Page(props: Parameters<typeof cp.Page>[0]) {
  assertPortalLive();
  return cp.Page(props);
}
