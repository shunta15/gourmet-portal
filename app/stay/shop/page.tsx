import StayFrame from "@/components/portal/stayproto/decided/common/StayFrame";
import { StayShopList, stayShopListMetadata } from "@/components/portal/stayproto/decided/shoplist/StayShopList";
import { assertPortalLive } from "@/lib/portal/launch";

// ステイの店舗紹介の一覧(メニューの「店舗紹介」の行き先)。/stay/shop — 見出し「店舗紹介」と件数、掲載中の全宿の札。札は各宿の店舗紹介ページ /stay/shop/{id} へ。外枠は StayFrame。
// robots は他の新業種ページと同じ gate(掲載が 3 件未満なら noindex。buildMetadata の count)。canonical は自分自身。
export const revalidate = 3600;

export async function generateMetadata() {
  assertPortalLive();
  return stayShopListMetadata();
}

export default async function Page() {
  assertPortalLive();
  return (
    <StayFrame>
      <StayShopList />
    </StayFrame>
  );
}
