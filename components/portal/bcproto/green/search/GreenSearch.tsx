import ShopCard from "../common/ShopCard";
import { greenFacets, loadGreenShops } from "@/lib/portal/vert/bodygreen/shops";
import { countGreen, filterGreenShops, parseGreenFilters } from "@/lib/portal/vert/bodygreen/filter";

/**
 * 【W0 の仮のページ。W2(探す)が、見本 mock-search の再現(search/page.tsx・Filters.tsx を本番のデータで)に置き換える】
 * app/bodycare/(cp)/search/page.tsx が BODYCARE_DESIGN === "green" のときに sp(URL の引数)を渡して出す。
 * 構造化データ(BreadcrumbList)・metadata は page.tsx が出す(ここでは出さない)。
 */
export default async function GreenSearch({ sp }: { sp: Record<string, string | string[] | undefined> }) {
  const shops = await loadGreenShops();
  const facets = greenFacets(shops);
  const f = parseGreenFilters(sp, facets);
  const list = filterGreenShops(shops, f);
  const shown = list.slice(0, f.n);
  return (
    <div data-gr-page="search" style={{ maxWidth: 1180, margin: "0 auto", padding: "calc(var(--gr-hh) + 28px) 16px 24px" }}>
      <h1 style={{ fontFamily: "var(--gr-ff-min)", fontSize: 28, margin: "0 0 8px" }}>店をさがす(仮のページ)</h1>
      <p>
        検索結果 {list.length} 件(絞り込み: {JSON.stringify({ kind: f.kind, pref: f.pref, tag: f.tag, q: f.q })} / 種類・県・こだわりだけの件数 {countGreen(shops, f)})
      </p>
      <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16, margin: "24px 0" }}>
        {shown.map((s, i) => (
          <li key={s.id}>
            <ShopCard shop={s} eager={i < 3} />
          </li>
        ))}
      </ul>
    </div>
  );
}
