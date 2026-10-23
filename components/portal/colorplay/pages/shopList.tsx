/**
 * 店舗紹介の一覧(/{v}/shop)。メニューの「店舗紹介」の行き先。掲載中の全店の札を並べる(見出し・件数・札)。
 * 作りは COLOR PLAY のさがす(pages/search.tsx)と同じ部品: 青い見出しの帯 → 店の札の一覧(ShopCard。札ぜんたいが店のページ /{v}/shop/{id} へのリンク)。絞り込みは付けない。
 * 並びはさがすの既定(都道府県順。写真のある店が先)と同じ。続きは「もっと見る」(URL の引数 n)。
 * robots: 引数なしの一覧は掲載 3 件以上で index(lib/seo/gate.ts)。「もっと見る」の付いた URL は noindex で、canonical は引数なしの一覧。
 */
import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/portal/JsonLd";
import Header from "../Header";
import Footer from "../Footer";
import { ShopCard } from "../Cards";
import { loadShops } from "@/lib/portal/colorplay/data";
import { PAGE_SIZE, filterShops } from "@/lib/portal/colorplay/search";
import { parseShopListN, shopListHref } from "@/lib/portal/colorplay/shopList";
import type { CpSite } from "@/lib/portal/colorplay/site";
import { getVertical } from "@/lib/verticals";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";

type SP = Record<string, string | string[] | undefined>;

export function cpShopListPage(site: CpSite) {
  async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
    const n = parseShopListN(await searchParams);
    const shops = await loadShops(site);
    const v = getVertical(site.key);
    return buildMetadata({
      vertical: site.key,
      title: `店舗紹介｜${v.brand}`,
      description: `${v.name}に掲載している${site.noun}を、すべて並べた一覧です。掲載${shops.length}件。`,
      // 「もっと見る」の付いた URL の正本は、引数なしの一覧
      path: shopListHref(site),
      count: n === PAGE_SIZE ? shops.length : 0,
    });
  }

  async function Page({ searchParams }: { searchParams: Promise<SP> }) {
    const n = parseShopListN(await searchParams);
    const v = getVertical(site.key);
    const list = filterShops(await loadShops(site), { sort: "area" });
    const shown = list.slice(0, n);
    const ld = breadcrumb([
      { name: "マチノワ", url: absUrl("/") },
      { name: v.name, url: absUrl(v.path) },
      { name: "店舗紹介", url: absUrl(shopListHref(site)) },
    ]);
    return (
      <>
        <JsonLd data={ld} />
        <Header base={site.base} logoA={site.logoA} logoB={site.logoB} />
        <main id="cp-main" tabIndex={-1}>
          <section className="cp-sband" data-sp="o">
            <div className="cp-wrap cp-sband-in">
              <div className="cp-sband-t">
                <h1 className="cp-h1s"><span className="cp-line" style={{ ["--l" as string]: 0 }}>店舗紹介</span></h1>
                <p className="cp-sband-sub cp-line" style={{ ["--l" as string]: 1 }}>掲載中の{site.noun}を、すべて並べました。</p>
              </div>
              <div className="cp-sband-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/_portal/bproto/colorplay/ref-search.jpg" alt="" width={316} height={352} fetchPriority="high" />
              </div>
              <p className="cp-script cp-sband-sc" aria-hidden="true">{site.scriptShop.split("\n").map((l, i) => (<span key={i}>{i > 0 && <br />}{l.trim()}</span>))}</p>
            </div>
          </section>

          <div className="cp-wrap cp-search">
            <h2 className="cp-sr">{site.noun}の一覧</h2>
            <p className="cp-count" aria-live="polite">掲載 <b>{list.length}</b> 件{list.length > shown.length && <span>({shown.length} 件を表示)</span>}</p>

            <div className="cp-list">
              {shown.map((s, i) => (<ShopCard key={s.id} site={site} s={s} i={i % 8} />))}
              {shown.length === 0 && <p className="cp-empty">表示できる{site.noun}はまだありません。</p>}
            </div>
            {list.length > shown.length && (
              <p className="cp-more"><Link href={shopListHref(site, n + PAGE_SIZE)} scroll={false}>もっと見る({shown.length} / {list.length})</Link></p>
            )}
            <p className="cp-more"><Link href={`${site.base}/search`}>お店を探す</Link></p>
          </div>
        </main>
        <Footer site={site} />
      </>
    );
  }

  return { generateMetadata, Page };
}
