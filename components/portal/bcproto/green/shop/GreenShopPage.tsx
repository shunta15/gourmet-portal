import Link from "next/link";
import type { BsShop } from "@/lib/portal/vert/bodyshop/model";
import { SEARCH_HREF } from "../common/site";

/**
 * 【W0 の仮のページ。W3(店)が、見本 mock-shop の再現(ShopPage.tsx・ShopTabs.tsx を本番のデータで)に置き換える】
 * components/portal/vert/bodyshop/shopPage.tsx が BODYCARE_DESIGN === "green" のとき、loadBsShop(id) の結果をそのまま渡して出す。
 * 構造化データ(LocalBusiness)・metadata は shopPage.tsx が出す(ここでは出さない)。
 */
export default function GreenShopPage({ shop }: { shop: BsShop }) {
  const hero = shop.photos[0];
  return (
    <div data-gr-page="shop" style={{ maxWidth: 1000, margin: "0 auto", padding: "calc(var(--gr-hh) + 28px) 16px 24px" }}>
      <nav aria-label="パンくず" style={{ fontSize: 12, marginBottom: 12 }}>
        <Link href="/bodycare">ボディケア</Link> &gt; <Link href={`${SEARCH_HREF}?kind=${shop.kindSlug}`}>{shop.kindName}</Link> &gt; {shop.name}
      </nav>
      <h1 style={{ fontFamily: "var(--gr-ff-min)", fontSize: 28, margin: "0 0 8px" }}>{shop.name}(仮のページ)</h1>
      <p>
        {shop.prefName} {shop.city} / {shop.kindName} / 写真 {shop.photos.length} 枚 / 記事の節 {shop.panels.length}
      </p>
      {hero ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hero.src} alt={hero.alt} width={hero.w} height={hero.h} style={{ width: "100%", maxWidth: 640, height: "auto", margin: "16px 0" }} />
      ) : (
        <div style={{ background: shop.color, padding: 40, margin: "16px 0", maxWidth: 640, textAlign: "center" }}>{shop.name}(写真なし)</div>
      )}
      <dl>
        {shop.facts.map((f) => (
          <div key={f.k} style={{ display: "flex", gap: 12 }}>
            <dt style={{ minWidth: 80 }}>{f.k}</dt>
            <dd>{f.v.join(" / ")}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
