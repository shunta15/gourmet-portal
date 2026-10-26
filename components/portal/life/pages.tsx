import "server-only";
import { notFound } from "next/navigation";
import JsonLd from "@/components/portal/JsonLd";
import { lifeCfg } from "@/components/portal/vkit/configs";
import { clipLead } from "@/components/portal/vkit/special/data";
import { loadShopDetail } from "@/components/portal/vkit/shop/data";
import { loadShops as loadLiveShops, sortShops } from "@/components/portal/vkit/common/live";
import { assertPortalLive } from "@/lib/portal/launch";
import { article as articleLd, breadcrumb, localBusiness } from "@/lib/seo/jsonld";
import { ogImage } from "@/lib/seo/og";
import { SITE_URL, absUrl } from "@/lib/seo/util";
import { safeDecode } from "@/lib/stations/query";
import { VERTICALS } from "@/lib/verticals";
import LifeFrame from "./LifeFrame";
import Top from "./top/Top";
import Search from "./top/Search";
import ShopPage from "./inner/shop/ShopPage";
import ShopListPage, { SHOP_LIST_PAGE_SIZE } from "./inner/list/ShopListPage";
import StoryPage from "./inner/story/StoryPage";
import LifeNotFound from "./inner/NotFound";
import SpecialPage from "./inner/special/SpecialPage";
import { loadSpecialView } from "./inner/special/data";
import { loadShopView } from "./inner/shop/data";
import { loadArticleStory, loadSpecialStory } from "./inner/story/data";
import { SEARCH_PAGE_SIZE, filterShops, loadShops, parseArgs } from "./data";
import { LFL } from "./links";

/**
 * 本番の /life 以下のページ(最初・探す・店舗紹介の一覧・店・特集の一覧・特集の記事・店の特集記事・404)を、2026-10-26 の見本 4 枚のデザイン(components/portal/life/)で描く入口(サーバー)。
 * metadata・robots・canonical・generateStaticParams・構造化データの作りは、これまでのページ(vkit)と同じものを app/life/ の page.tsx と、ここで使う
 * (描く部品だけがこのデザインに替わった)。外枠は LifeFrame(公開スイッチ OFF のあいだは 404)。
 */

const b = VERTICALS.life;
type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** 最初のページ(/life) */
export async function LifeTopPage() {
  return (
    <LifeFrame>
      <Top shops={await loadShops()} />
    </LifeFrame>
  );
}

/** 探すページ(/life/search) */
export async function LifeSearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  assertPortalLive();
  const sp = await searchParams;
  const all = await loadShops();
  const args = parseArgs(sp, all);
  const hit = filterShops(all, args);
  const pages = Math.max(1, Math.ceil(hit.length / SEARCH_PAGE_SIZE));
  const cur = Math.min(args.page, pages);
  const shown = hit.slice((cur - 1) * SEARCH_PAGE_SIZE, cur * SEARCH_PAGE_SIZE);
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: b.name, url: absUrl(b.path) },
    { name: `${lifeCfg.noun}を探す`, url: absUrl(LFL.search) },
  ]);
  return (
    <LifeFrame>
      <JsonLd data={ld} />
      <Search shops={shown} total={hit.length} all={all} args={{ ...args, page: cur }} pages={pages} />
    </LifeFrame>
  );
}

/** 店舗紹介の一覧(/life/shop) */
export async function LifeShopListPage({ searchParams }: { searchParams: Promise<SP> }) {
  assertPortalLive();
  const sp = await searchParams;
  const sorted = sortShops(await loadLiveShops(lifeCfg), "area");
  const pages = Math.max(1, Math.ceil(sorted.length / SHOP_LIST_PAGE_SIZE));
  const cur = Math.min(Math.max(parseInt(one(sp.page)) || 1, 1), pages);
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: b.name, url: absUrl(b.path) },
    { name: "店舗紹介", url: absUrl(LFL.shops) },
  ]);
  return (
    <LifeFrame>
      <JsonLd data={ld} />
      <ShopListPage shops={sorted.slice((cur - 1) * SHOP_LIST_PAGE_SIZE, cur * SHOP_LIST_PAGE_SIZE)} total={sorted.length} page={cur} pages={pages} />
    </LifeFrame>
  );
}

/** 店(/life/shop/{id}) */
export async function LifeShopPage({ id: rawId }: { id: string }) {
  const id = safeDecode(rawId);
  const d = await loadShopDetail(lifeCfg, id);
  if (!d) notFound();
  const v = await loadShopView(id);
  const s = d.shop;
  const ph = s.photo?.src;
  const ld: Record<string, unknown> = {
    ...localBusiness(d.place, d.schemaType),
    ...(s.article?.headline ? { description: s.article.headline } : {}),
    // 画像は絶対URL(自サイトの画像は日本語を percent-encode する)
    ...(ph ? { image: ph.startsWith("/") ? absUrl(encodeURI(ph)) : ph } : {}),
  };
  if (!ld.url) ld.url = `${SITE_URL}${d.path}`;
  const crumbLd = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: b.name, url: absUrl(b.path) },
    ...(s.prefName ? [{ name: s.prefName, url: absUrl(LFL.searchWith({ pref: s.pref })) }] : []),
    { name: s.name, url: absUrl(d.path) },
  ]);
  return (
    <LifeFrame>
      <JsonLd data={ld} />
      <JsonLd data={crumbLd} />
      <ShopPage v={v} />
    </LifeFrame>
  );
}

/** 特集の一覧(/life/special)。見本「特集」の部品そのもの(inner/special/) */
export async function LifeSpecialIndexPage() {
  assertPortalLive();
  return (
    <LifeFrame>
      <JsonLd
        data={breadcrumb([
          { name: "マチノワ", url: absUrl("/") },
          { name: b.name, url: absUrl(b.path) },
          { name: "特集", url: absUrl(LFL.special) },
        ])}
      />
      <SpecialPage v={await loadSpecialView()} />
    </LifeFrame>
  );
}

/** 特集の記事(/life/special/{slug}) */
export async function LifeSpecialArticlePage({ slug: rawSlug }: { slug: string }) {
  assertPortalLive();
  const slug = safeDecode(rawSlug);
  const v = await loadSpecialStory(slug);
  if (!v) notFound();
  return (
    <LifeFrame>
      <JsonLd
        data={breadcrumb([
          { name: "マチノワ", url: absUrl("/") },
          { name: b.name, url: absUrl(b.path) },
          { name: "特集", url: absUrl(LFL.special) },
          { name: v.title, url: absUrl(v.path) },
        ])}
      />
      <JsonLd
        data={articleLd({
          headline: v.title,
          description: clipLead(v.lead) || v.title,
          image: absUrl(ogImage(v.path, v.title).url),
          url: absUrl(v.path),
          datePublished: v.dateIso || undefined,
        })}
      />
      <StoryPage v={v} />
    </LifeFrame>
  );
}

/** 店の特集記事(/life/article/{店 ID}) */
export async function LifeArticlePage({ id: rawId }: { id: string }) {
  assertPortalLive();
  const id = safeDecode(rawId);
  const v = await loadArticleStory(id);
  if (!v) notFound();
  const url = absUrl(v.path);
  const image = v.hero ? absUrl(encodeURI(v.hero.src)) : undefined;
  return (
    <LifeFrame>
      <JsonLd
        data={{
          ...articleLd({ headline: v.title, description: v.lead.slice(0, 110), image: image ?? "", url, datePublished: v.dateIso || undefined }),
          ...(image ? {} : { image: undefined }),
          publisher: { "@type": "Organization", name: "マチノワ", url: "https://machinowa.tokyo" },
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
        }}
      />
      <JsonLd
        data={breadcrumb([
          { name: "マチノワ", url: absUrl("/") },
          { name: b.name, url: absUrl(b.path) },
          { name: "店舗紹介", url: absUrl(LFL.shops) },
          { name: v.crumbs[2].label, url },
        ])}
      />
      <StoryPage v={v} />
    </LifeFrame>
  );
}

/** 404 */
export function LifeNotFoundPage() {
  return (
    <LifeFrame>
      <LifeNotFound />
    </LifeFrame>
  );
}
