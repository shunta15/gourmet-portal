import PetFrame from "@/components/portal/petproto/decided/common/PetFrame";
import PetShopList, { petShopListMetadata } from "@/components/portal/petproto/decided/shoplist/PetShopList";
import { assertPortalLive } from "@/lib/portal/launch";

// ペットの店舗紹介の一覧(メニューの「店舗紹介」の行き先)。/pet/shop — 見出し「店舗紹介」と件数、掲載中の全店の札。札は各店の店舗紹介ページ /pet/shop/{id} へ。外枠は PetFrame。
// robots は他の新業種ページと同じ gate(掲載が 3 件未満なら noindex。buildMetadata の count)。canonical は自分自身。

export async function generateMetadata() {
  assertPortalLive();
  return petShopListMetadata();
}

export default function Page() {
  return (
    <PetFrame>
      <PetShopList />
    </PetFrame>
  );
}
