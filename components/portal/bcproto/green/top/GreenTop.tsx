import Link from "next/link";
import ShopCard from "../common/ShopCard";
import { SEARCH_HREF, searchHref } from "../common/site";
import { greenFacets, loadGreenShops, pickGreenShops } from "@/lib/portal/vert/bodygreen/shops";

/**
 * 【W0 の仮のページ。W1(最初のページ)が、見本 mock-top の再現(TopPage.tsx を本番のデータで)に置き換える】
 * app/bodycare/(top)/page.tsx が BODYCARE_DESIGN === "green" のときに出す。データの渡し方・ShopCard の使い方の見本を兼ねる。
 * 節の飛び先: ヘッダー・フッターが /bodycare#gr-kind・#gr-area・#gr-tag に飛ぶので、W1 は該当の節に id を付けること。
 */
export default async function GreenTop() {
  const shops = await loadGreenShops();
  const facets = greenFacets(shops);
  // 写真つき 3 店 + 写真なし 1 店(bo0013)で、ShopCard の 2 つの見え方を確かめる
  const picks = pickGreenShops(shops, ["bo0030", "bo0003", "bo0044", "bo0013"]);
  return (
    <div data-gr-page="top" style={{ maxWidth: 1180, margin: "0 auto", padding: "calc(var(--gr-hh) + 28px) 16px 24px" }}>
      <h1 style={{ fontFamily: "var(--gr-ff-min)", fontSize: 30, margin: "0 0 12px" }}>ボディケアの店を探す(仮のページ)</h1>
      <p>掲載 {facets.total} 件・{facets.prefs.length} 都道府県。</p>
      <p id="gr-kind">
        種類:
        {facets.kinds.map((k) => (
          <Link key={k.slug} href={searchHref({ kind: k.slug })} style={{ marginLeft: 12 }}>
            {k.name}({k.count})
          </Link>
        ))}
      </p>
      <p id="gr-area">
        都道府県:
        {facets.prefs.slice(0, 5).map((p) => (
          <Link key={p.slug} href={searchHref({ pref: p.slug })} style={{ marginLeft: 12 }}>
            {p.short}({p.count})
          </Link>
        ))}
      </p>
      <p id="gr-tag">
        こだわり:
        {facets.tags.map((t) => (
          <Link key={t.name} href={searchHref({ tag: t.name })} style={{ marginLeft: 12 }}>
            {t.name}({t.count})
          </Link>
        ))}
      </p>
      <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16, margin: "24px 0" }}>
        {picks.map((s, i) => (
          <li key={s.id}>
            <ShopCard shop={s} eager={i === 0} />
          </li>
        ))}
      </ul>
      <p>
        <Link href={SEARCH_HREF}>すべての店を見る</Link>
      </p>
    </div>
  );
}
