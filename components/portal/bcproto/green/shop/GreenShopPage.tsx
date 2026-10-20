import type { BsShop } from "@/lib/portal/vert/bodyshop/model";
import { loadGreenShops, pickGreenShops } from "@/lib/portal/vert/bodygreen/shops";
import ShopPage from "./ShopPage";

/**
 * 案4(グリーン)の店のページ(/bodycare/shop/<id>)。components/portal/vert/bodyshop/shopPage.tsx が BODYCARE_DESIGN === "green" のとき、
 * loadBsShop(id) の結果をそのまま渡して出す。構造化データ(LocalBusiness)・metadata は shopPage.tsx が出す(ここでは出さない)。
 * こだわり(tags)・種類の色・同じ県/同じ種類の店のカードは、loadGreenShops()(全 111 店。React の cache 付き)から引く。
 */
export default async function GreenShopPage({ shop }: { shop: BsShop }) {
  const all = await loadGreenShops();
  const gs = all.find((s) => s.id === shop.id);
  const sameArea = pickGreenShops(all, shop.sameArea.map((m) => m.id));
  const sameKind = pickGreenShops(all, shop.sameKind.map((m) => m.id));
  return <ShopPage shop={shop} gs={gs} sameArea={sameArea} sameKind={sameKind} />;
}
