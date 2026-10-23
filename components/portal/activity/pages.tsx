import "server-only";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/portal/JsonLd";
import { activityCfg } from "@/components/portal/vkit/configs";
import { loadShopDetail } from "@/components/portal/vkit/shop/data";
import { loadArticle } from "@/components/portal/vkit/article/articleData";
import { assertPortalLive } from "@/lib/portal/launch";
import { countPlaces } from "@/lib/places";
import { buildMetadata } from "@/lib/seo/meta";
import { article as articleLd, breadcrumb, localBusiness } from "@/lib/seo/jsonld";
import { SITE_URL, absUrl } from "@/lib/seo/util";
import { safeDecode } from "@/lib/stations/query";
import { VERTICALS } from "@/lib/verticals";
import ActivityFrame from "./Frame";
import Top from "./Top";
import Search from "./Search";
import Article from "./Article";
import Shop from "./Shop";
import Story from "./Story";
import type { SearchInit } from "./SearchBody";
import { loadAData } from "./data";
import { SEASON_CHAR, loadEditorial, loadVideos } from "./editorial";
import { KINDS, REGION_GROUPS, SCENES, parseYmd, regionKeyOf } from "./filters";
import { aLinks, searchUrl } from "./links";
import { storyOfGuide, storyOfMag, storyOfSeason, storyOfShop } from "./storyData";

/**
 * 本番の 5 つのページ(最初・探す・店・特集・記事)を、アクティビティのデザイン(components/portal/activity/)で描く入口(サーバー)。
 * metadata・robots・canonical・generateStaticParams・構造化データの作りは、これまでのページ(vkit)と同じものを app/activity/ の page.tsx と、ここで使う
 * (描く部品だけがこのデザインに替わった)。外枠は ActivityFrame(公開スイッチ OFF のあいだは 404)。
 */

const b = VERTICALS.activity;

async function loadAll() {
  const a = await loadAData();
  const ids = a.shops.map((s) => s.id);
  const [editorial, videos] = await Promise.all([loadEditorial(ids), loadVideos(ids)]);
  return { ...a, editorial, videos };
}

/** 最初のページ(/activity) */
export async function ActivityTopPage() {
  const { shops, videos } = await loadAll();
  return (
    <ActivityFrame>
      <Top shops={shops} videos={videos} />
    </ActivityFrame>
  );
}

// ------------------------------------------------------------------ 探す
type SP = Record<string, string | string[] | undefined>;
const many = (v: string | string[] | undefined): string[] => (Array.isArray(v) ? v : v ? [v] : []).flatMap((x) => x.split(",")).map((x) => x.trim()).filter(Boolean);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** URL の引数 → 絞り込みの最初の状態(データにある値だけ。links.ts の SearchArgs と同じ名前) */
export function searchInit(sp: SP, prefs: string[]): SearchInit {
  const kindOk = new Set<string>(KINDS.map((k) => k.slug));
  const scenes = many(sp.scene)
    .map((slug) => SCENES.find((s) => s.slug === slug)?.name)
    .filter((n): n is NonNullable<typeof n> => !!n);
  const areas = [...new Set(many(sp.region).map((r) => regionKeyOf(r)).filter((k) => !!k && REGION_GROUPS.some((g) => g.key === k)))] as string[];
  const when = one(sp.when);
  const date = parseYmd(one(sp.date)) ? one(sp.date) : "";
  return {
    kinds: [...new Set(many(sp.kind).filter((k) => kindOk.has(k)))],
    styles: [...new Set(scenes)],
    areas,
    prefs: [...new Set(many(sp.pref).filter((p) => prefs.includes(p)))],
    q: one(sp.q).replace(/\s+/g, " ").trim().slice(0, 40),
    when: when === "weekend" || when === "nextweekend" ? when : "",
    date: when ? "" : date,
    fav: one(sp.fav) === "1",
  };
}

export async function ActivitySearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  assertPortalLive();
  const sp = await searchParams;
  const { shops } = await loadAData();
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: b.name, url: absUrl(b.path) },
    { name: `${activityCfg.noun}を探す`, url: absUrl(aLinks.search) },
  ]);
  return (
    <ActivityFrame>
      <JsonLd data={ld} />
      <Search shops={shops} init={searchInit(sp, shops.map((s) => s.pref))} />
    </ActivityFrame>
  );
}

// ------------------------------------------------------------------ 特集(記事の一覧のページ)
export async function ActivityArticleListPage() {
  assertPortalLive();
  const { shops, editorial } = await loadAll();
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: b.name, url: absUrl(b.path) },
    { name: `${activityCfg.noun}の記事`, url: absUrl(aLinks.article) },
  ]);
  return (
    <ActivityFrame>
      <JsonLd data={ld} />
      <Article shops={shops} editorial={editorial} />
    </ActivityFrame>
  );
}

// ------------------------------------------------------------------ 店
export async function ActivityShopPage({ id }: { id: string }) {
  const d = await loadShopDetail(activityCfg, id);
  if (!d) notFound();
  const { shops } = await loadAData();
  const shop = shops.find((s) => s.id === d.shop.id);
  if (!shop) notFound();
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
    ...(s.prefName ? [{ name: s.prefName, url: absUrl(searchUrl({ pref: s.pref })) }] : []),
    { name: s.name, url: absUrl(d.path) },
  ]);
  return (
    <ActivityFrame>
      <JsonLd data={ld} />
      <JsonLd data={crumbLd} />
      <Shop shop={shop} others={shops.filter((x) => x.id !== shop.id)} />
    </ActivityFrame>
  );
}

// ------------------------------------------------------------------ 店ごとの特集記事(/activity/article/{店 ID})
export async function ActivityStoryPage({ id: rawId }: { id: string }) {
  assertPortalLive();
  const id = safeDecode(rawId);
  const v = await loadArticle(activityCfg, id);
  if (!v) notFound();
  const { shops } = await loadAData();
  const shop = shops.find((s) => s.id === v.shop.id);
  if (!shop) notFound();
  const url = absUrl(`${b.path}/article/${encodeURIComponent(v.shop.id)}`);
  const image = v.hero ? absUrl(encodeURI(v.hero.src)) : undefined;
  return (
    <ActivityFrame>
      {v.feature ? (
        <JsonLd
          data={{
            ...articleLd({ headline: v.feature.title, description: v.feature.summary || v.headline, image: image ?? "", url, datePublished: v.feature.date }),
            ...(image ? {} : { image: undefined }),
            publisher: { "@type": "Organization", name: "マチノワ", url: "https://machinowa.tokyo" },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
          }}
        />
      ) : null}
      <JsonLd
        data={breadcrumb([
          { name: "マチノワ", url: absUrl("/") },
          { name: b.name, url: absUrl(b.path) },
          { name: "記事", url: absUrl(aLinks.article) },
          { name: v.shop.name, url },
        ])}
      />
      <Story d={storyOfShop(v, shop, shops)} />
    </ActivityFrame>
  );
}

// ------------------------------------------------------------------ 季節・読みもの・はじめての方へ(/activity/article/{season|magazine}/{id}・/activity/article/guide)
type EdKind = "season" | "magazine" | "guide";

function edPath(kind: EdKind, id?: string): string {
  return kind === "guide" ? aLinks.guide : kind === "season" ? aLinks.season(id ?? "") : aLinks.mag(id ?? "");
}

/** 読みもの系の記事の URL の一覧(サイトマップ・事前生成に使う) */
export async function editorialPaths(): Promise<Array<{ kind: EdKind; id: string; path: string }>> {
  const { editorial } = await loadAll();
  return [
    ...editorial.seasons.map((s) => ({ kind: "season" as const, id: s.id, path: aLinks.season(s.id) })),
    ...editorial.magazine.map((m) => ({ kind: "magazine" as const, id: m.id, path: aLinks.mag(m.id) })),
    ...(editorial.guide ? [{ kind: "guide" as const, id: "guide", path: aLinks.guide }] : []),
  ];
}

export async function activityEditorialMetadata(kind: EdKind, rawId?: string): Promise<Metadata> {
  assertPortalLive();
  const id = rawId ? safeDecode(rawId) : "";
  const { editorial } = await loadAll();
  const count = await countPlaces("activity");
  let title = "";
  let description = "";
  let image: string | undefined;
  if (kind === "season") {
    const s = editorial.seasons.find((x) => x.id === id);
    if (!s) return { robots: { index: false, follow: false } };
    title = `${s.title}｜${b.brand}`;
    description = s.lead || `${SEASON_CHAR[s.id]}の特集。実在のスポットの情報をまとめています。`;
    image = `/_portal/activity/${s.imageFile}`;
  } else if (kind === "magazine") {
    const m = editorial.magazine.find((x) => x.id === id);
    if (!m) return { robots: { index: false, follow: false } };
    title = `${m.title}｜${b.brand}`;
    description = m.lead || `${m.tag}。実在のスポットの情報をまとめています。`;
    image = `/_portal/activity/${m.imageFile}`;
  } else {
    if (!editorial.guide) return { robots: { index: false, follow: false } };
    title = `${editorial.guide.title}｜${b.brand}`;
    description = editorial.guide.lead || "はじめて体験に参加する人向けの、服装・持ち物・申し込み・安全のガイドです。";
    image = "/_portal/activity/ar-guide.webp";
  }
  return buildMetadata({
    vertical: "activity",
    title,
    description,
    path: edPath(kind, id),
    count,
    ...(image ? { image: { url: absUrl(encodeURI(image)), alt: title } } : {}),
  });
}

export async function ActivityEditorialPage({ kind, id: rawId }: { kind: EdKind; id?: string }) {
  assertPortalLive();
  const id = rawId ? safeDecode(rawId) : "";
  const { editorial, shops } = await loadAll();
  let story;
  let ld: Record<string, unknown> | null = null;
  const url = absUrl(edPath(kind, id));
  if (kind === "season") {
    const s = editorial.seasons.find((x) => x.id === id);
    if (!s) notFound();
    story = storyOfSeason(s, shops);
    ld = { ...articleLd({ headline: s.title, description: s.lead, image: absUrl(encodeURI(`/_portal/activity/${s.imageFile}`)), url, datePublished: s.date || undefined }), mainEntityOfPage: { "@type": "WebPage", "@id": url } };
  } else if (kind === "magazine") {
    const m = editorial.magazine.find((x) => x.id === id);
    if (!m) notFound();
    story = storyOfMag(m, shops);
    ld = { ...articleLd({ headline: m.title, description: m.lead, image: absUrl(encodeURI(`/_portal/activity/${m.imageFile}`)), url, datePublished: m.date || undefined }), mainEntityOfPage: { "@type": "WebPage", "@id": url } };
  } else {
    if (!editorial.guide) notFound();
    story = storyOfGuide(editorial.guide, shops);
  }
  return (
    <ActivityFrame>
      {ld ? <JsonLd data={{ ...ld, publisher: { "@type": "Organization", name: "マチノワ", url: "https://machinowa.tokyo" } }} /> : null}
      <JsonLd
        data={breadcrumb([
          { name: "マチノワ", url: absUrl("/") },
          { name: b.name, url: absUrl(b.path) },
          { name: "記事", url: absUrl(aLinks.article) },
          { name: story.title.join(""), url },
        ])}
      />
      <Story d={story} />
    </ActivityFrame>
  );
}
