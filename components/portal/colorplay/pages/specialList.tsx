/**
 * 特集の一覧(/{v}/special)。メニューの「特集」の行き先。利用シーン・業種の特集記事(lib/specials/{v}.json の 3 本)だけを並べる。店 1 軒の記事は並べない。
 * 作りは COLOR PLAY の一覧(pages/search.tsx・店舗紹介の一覧)と同じ: 青い見出しの帯 → 特集の札(SpecialCards.tsx。札ぜんたいが特集のページへのリンク)。
 * robots: 掲載 3 件以上で index(店のページと同じ gate)。
 */
import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/portal/JsonLd";
import Header from "../Header";
import Footer from "../Footer";
import { SpecialCard } from "../SpecialCards";
import { loadShops } from "@/lib/portal/colorplay/data";
import { loadSpecials, specialListHref } from "@/lib/portal/colorplay/specials";
import type { CpSite } from "@/lib/portal/colorplay/site";
import { getVertical } from "@/lib/verticals";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";

export function cpSpecialListPage(site: CpSite) {
  async function generateMetadata(): Promise<Metadata> {
    const v = getVertical(site.key);
    const list = loadSpecials(site);
    return buildMetadata({
      vertical: site.key,
      title: `特集｜${v.brand}`,
      description: `${v.name}の特集記事の一覧です。${list.map((s) => s.title).join("、")}。`,
      path: specialListHref(site),
      count: (await loadShops(site)).length,
    });
  }

  async function Page() {
    const v = getVertical(site.key);
    const list = loadSpecials(site);
    const ld = breadcrumb([
      { name: "マチノワ", url: absUrl("/") },
      { name: v.name, url: absUrl(v.path) },
      { name: "特集", url: absUrl(specialListHref(site)) },
    ]);
    return (
      <>
        <JsonLd data={ld} />
        <Header base={site.base} logoA={site.logoA} logoB={site.logoB} />
        <main id="cp-main" tabIndex={-1}>
          <section className="cp-sband" data-sp="o">
            <div className="cp-wrap cp-sband-in">
              <div className="cp-sband-t">
                <h1 className="cp-h1s"><span className="cp-line" style={{ ["--l" as string]: 0 }}>特集</span></h1>
                <p className="cp-sband-sub cp-line" style={{ ["--l" as string]: 1 }}>{v.name}の{site.noun}を探すときの見かたを、記事にまとめました。</p>
              </div>
              <div className="cp-sband-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/_portal/bproto/colorplay/ref-search.jpg" alt="" width={316} height={352} fetchPriority="high" />
              </div>
              <p className="cp-script cp-sband-sc" aria-hidden="true">{site.scriptAbout.split("\n").map((l, i) => (<span key={i}>{i > 0 && <br />}{l.trim()}</span>))}</p>
            </div>
          </section>

          <div className="cp-wrap cp-search">
            <h2 className="cp-sr">特集の一覧</h2>
            <p className="cp-count">特集 <b>{list.length}</b> 本</p>
            <div className="art-list">
              {list.map((s, i) => (<SpecialCard key={s.slug} site={site} sp={s} i={i} no={i + 1} />))}
              {list.length === 0 && <p className="cp-empty">表示できる特集はまだありません。</p>}
            </div>
            <p className="cp-more cp-more-pair">
              <Link href={`${site.base}/shop`}>店舗紹介を見る</Link>
              <Link href={`${site.base}/search`}>お店を探す</Link>
            </p>
          </div>
        </main>
        <Footer site={site} />
      </>
    );
  }

  return { generateMetadata, Page };
}
