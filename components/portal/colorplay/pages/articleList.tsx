/**
 * 特集記事の一覧(/{v}/article)。COLOR PLAY のさがす(pages/search.tsx)と同じ部品の作り: 青い見出しの帯 → 種類の札 → 記事の札の一覧。
 * 中身は実在のサロンの特集記事・紹介記事(lib/portal/colorplay/articles.ts)。札は種類の色面で、札ぜんたいが記事のページ /{v}/article/{店 ID} へのリンク。
 * 絞り込みは種類だけ(URL の引数 kind・n。JS が無くてもリンクで絞れる)。記事が 0 本でも壊れない(種類の札・一覧は出るものだけ)。
 * robots: 引数なしの一覧は件数 3 以上で index。種類・「もっと見る」の付いた URL は noindex(正本は引数なしの一覧)。
 */
import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/portal/JsonLd";
import Header from "../Header";
import Footer from "../Footer";
import { ArticleCard } from "../ArticleCards";
import { KIND_ICON } from "@/components/portal/bproto/colorplay/Icons";
import { PAGE_SIZE } from "@/lib/portal/colorplay/search";
import { articleListHref, loadArticleItems, parseArticleFilters } from "@/lib/portal/colorplay/articles";
import type { CpSite } from "@/lib/portal/colorplay/site";
import { getVertical } from "@/lib/verticals";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";

type SP = Record<string, string | string[] | undefined>;

export function cpArticleListPage(site: CpSite) {
  async function setup(sp: SP) {
    const items = await loadArticleItems(site);
    const kinds = site.kinds.filter((k) => items.some((a) => a.shop.kind === k.slug));
    const f = parseArticleFilters(sp, new Set(kinds.map((k) => k.slug)));
    const list = f.kind ? items.filter((a) => a.shop.kind === f.kind) : items;
    return { items, kinds, f, list };
  }

  async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
    const { items, kinds, f, list } = await setup(await searchParams);
    const v = getVertical(site.key);
    const kindName = kinds.find((k) => k.slug === f.kind)?.name;
    const plain = !f.kind && f.n === PAGE_SIZE;
    return buildMetadata({
      vertical: site.key,
      title: kindName ? `${kindName}の特集記事｜${v.name}｜${v.brand}` : `${v.name}の特集記事｜${v.brand}`,
      description: `${v.name}の実在のサロンを、一軒ずつ紹介する記事の一覧です。メニューや設備、行き方など、お店の情報をまとめています。${list.length > 0 ? `掲載${list.length}本。` : ""}`,
      // 引数つきの URL の正本は、引数なしの一覧
      path: articleListHref(site),
      // 引数なしの一覧だけ index(記事が 3 本以上のとき)。それ以外は noindex(件数 0 を渡す)
      count: plain ? items.length : 0,
    });
  }

  async function Page({ searchParams }: { searchParams: Promise<SP> }) {
    const { items, kinds, f, list } = await setup(await searchParams);
    const v = getVertical(site.key);
    const shown = list.slice(0, f.n);
    const kindName = kinds.find((k) => k.slug === f.kind)?.name ?? "";
    const sig = `${f.kind}`;
    const ld = breadcrumb([
      { name: "マチノワ", url: absUrl("/") },
      { name: v.name, url: absUrl(v.path) },
      { name: "特集記事", url: absUrl(articleListHref(site)) },
    ]);
    return (
      <>
        <JsonLd data={ld} />
        <Header base={site.base} logoA={site.logoA} logoB={site.logoB} />
        <main id="cp-main" tabIndex={-1}>
          <section className="cp-sband" data-sp="o">
            <div className="cp-wrap cp-sband-in">
              <div className="cp-sband-t">
                <h1 className="cp-h1s"><span className="cp-line" style={{ ["--l" as string]: 0 }}>特集記事</span></h1>
                <p className="cp-sband-sub cp-line" style={{ ["--l" as string]: 1 }}>実在の{site.noun}を、一軒ずつ紹介します。</p>
              </div>
              <div className="cp-sband-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/_portal/bproto/colorplay/ref-search.jpg" alt="" width={316} height={352} fetchPriority="high" />
              </div>
              <p className="cp-script cp-sband-sc" aria-hidden="true">{site.scriptAbout.split("\n").map((l, i) => (<span key={i}>{i > 0 && <br />}{l.trim()}</span>))}</p>
            </div>
          </section>

          <div className="cp-wrap cp-search">
            {kinds.length > 0 && (
              <nav className="cp-kinds" aria-label="種類">
                <Link href={articleListHref(site)} className={`cp-kind ${f.kind === "" ? "is-on" : ""}`} aria-current={f.kind === "" ? "true" : undefined}>
                  <KIND_ICON.all size={36} /><span>すべて</span><small>{items.length}</small>
                </Link>
                {kinds.map((k) => {
                  const Ic = KIND_ICON[k.slug] ?? KIND_ICON.all;
                  return (
                    <Link key={k.slug} href={articleListHref(site, { kind: k.slug })} className={`cp-kind ${f.kind === k.slug ? "is-on" : ""}`} aria-current={f.kind === k.slug ? "true" : undefined}>
                      <Ic size={36} /><span>{k.name}</span><small>{items.filter((a) => a.shop.kind === k.slug).length}</small>
                    </Link>
                  );
                })}
              </nav>
            )}

            {kindName ? <h2 className="cp-scope">{kindName}</h2> : <h2 className="cp-sr">記事の一覧</h2>}
            <p className="cp-count" aria-live="polite">記事 <b>{list.length}</b> 本{list.length > shown.length && <span>({shown.length} 本を表示)</span>}</p>

            <div key={sig} className="art-list">
              {shown.map((a, i) => (<ArticleCard key={a.id} site={site} a={a} i={i % 6} />))}
              {shown.length === 0 && <p className="cp-empty">表示できる記事はまだありません。</p>}
            </div>
            {list.length > shown.length && (
              <p className="cp-more"><Link href={articleListHref(site, { kind: f.kind, n: f.n + PAGE_SIZE })} scroll={false}>もっと見る({shown.length} / {list.length})</Link></p>
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
