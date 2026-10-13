// "bodyshop-design" は next.config.ts の別名(turbopack.resolveAlias / webpack alias)で、BODYCARE_SHOP_DESIGN で選んだ 1 案の部品(ShopA / ShopB / ShopC / ShopNone)に向く。
declare module "bodyshop-design" {
  import type { ReactElement } from "react";
  import type { BsShop } from "@/lib/portal/vert/bodyshop/model";
  const ShopDesign: (props: { shop: BsShop; v: number }) => ReactElement | null;
  export default ShopDesign;
}
