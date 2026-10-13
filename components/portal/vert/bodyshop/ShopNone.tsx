import type { BsShop } from "@/lib/portal/vert/bodyshop/model";

/**
 * 店のページの案を選ばないとき("legacy")の、何も出さない部品。next.config.ts が "bodyshop-design" の行き先を、選んだ案(ShopA / B / C)か、これにする。
 * "legacy" のときは、店のページは今までの shopPage("bodycare") を使い、ここは呼ばれない(3 案の部品がバンドルに入らないようにするための差し替え先)。
 */
export default function ShopNone(props: { shop: BsShop; v: number }) {
  void props;
  return null;
}
