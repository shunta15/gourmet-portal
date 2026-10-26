import "server-only";
import { loadShops, type LiveShop, type LivePhoto } from "@/components/portal/vkit/common/live";
import { loadSpecials, specialBySlug, type Special } from "@/components/portal/vkit/special/data";
import { loadArticle, type ArticleView } from "@/components/portal/vkit/article/articleData";
import { lifeCfg } from "@/components/portal/vkit/configs";
import { LFL } from "../../links";
import { shopHours } from "../shop/data";

/**
 * 特集の記事(/life/special/{slug})と店の特集記事(/life/article/{店 ID})を、見本2の部品で描くための形(サーバー専用)。
 * 文は lib/specials/life.json と、店の紹介記事・特集(vkit/article/articleData.ts の loadArticle。1 文ずつ点検済み)のまま。足さない・言い換えない。
 * 写真は、記事に出てくる実在の店の写真だけ。
 */

export type StoryPhoto = { src: string; w: number; h: number; alt: string };
export type StoryStore = { id: string; name: string; href: string };
export type StorySection = {
  label: string;
  heading: string;
  paras: string[];
  photo?: StoryPhoto | null;
  /** 事実の表(店の特集の「ポイント」にあるもの) */
  specs?: Array<{ k: string; v: string }>;
  /** 本文の下に並べる小さな写真 */
  extra?: StoryPhoto[];
  /** この節に出てくる店(特集の記事。その記事で初めて出てくる節にだけ) */
  stores?: StoryStore[];
};
export type StoryCard = { href: string; title: string; tag: string; photo: StoryPhoto | null };
export type StoryView = {
  /** 左上の英字(SPECIAL / STORE FEATURE) */
  kicker: string;
  title: string;
  lead: string;
  date: string;
  /** 構造化データ用の日付(YYYY-MM-DD。無ければ空) */
  dateIso: string;
  crumbs: Array<{ label: string; href?: string }>;
  /** ヘッダーのメニューで下線をつける項目 */
  nav: "special" | "shops";
  hero: StoryPhoto | null;
  sections: StorySection[];
  closing: string;
  /** 店の特集記事: 施設の情報(所在地・カテゴリ・営業時間・公式サイト) */
  info: { area: string; kind: string; hours: string[]; official: string | null; shopHref: string; shopName: string } | null;
  /** 特集の記事: この記事に出てくる店 */
  stores: Array<{ id: string; name: string; href: string; kind: string; area: string; photo: StoryPhoto | null }>;
  related: StoryCard[];
  relatedHead: { en: string; ja: string; all: { label: string; href: string } };
  sources: Array<{ label: string; url: string }>;
  checkedAt?: string;
  /** 構造化データ・metadata 用 */
  path: string;
};

const ph = (p: LivePhoto | null | undefined): StoryPhoto | null => (p ? { src: p.src, w: p.w, h: p.h, alt: p.alt } : null);

/** 特集の記事ごとの写真 = その記事に出てくる写真のある店。ほかの記事の札で使っていない店を先に選ぶ(記事ごとに同じ写真にならないように) */
function cardPhotos(list: Special[], shops: Map<string, LiveShop>): Array<LiveShop | null> {
  const used = new Set<string>();
  return list.map((s) => {
    const cand: LiveShop[] = [];
    for (const sec of s.sections)
      for (const id of sec.storeIds) {
        const x = shops.get(id);
        if (x?.photo && !cand.includes(x)) cand.push(x);
      }
    const pick = cand.find((x) => !used.has(x.id)) ?? cand[0] ?? null;
    if (pick) used.add(pick.id);
    return pick;
  });
}

const dot = (iso: string) => iso.replace(/-/g, ".");

export async function loadSpecialStory(slug: string): Promise<StoryView | null> {
  const s = specialBySlug(lifeCfg, slug);
  if (!s) return null;
  const list = loadSpecials(lifeCfg);
  const shops = new Map((await loadShops(lifeCfg)).map((x) => [x.id, x]));
  const photos = cardPhotos(list, shops);
  const mine = photos[list.findIndex((x) => x.slug === s.slug)];
  // 店(初出の順)
  const seen = new Set<string>();
  const stores: LiveShop[] = [];
  for (const sec of s.sections)
    for (const id of sec.storeIds) {
      const x = shops.get(id);
      if (x && !seen.has(id)) {
        seen.add(id);
        stores.push(x);
      }
    }
  // 店の札は、その記事の中で最初に出てくる節にだけ付ける(同じ店が節ごとに繰り返し並ばないように)
  const shown = new Set<string>();
  const sections: StorySection[] = s.sections.map((sec, i) => {
    const fresh = sec.storeIds.filter((id) => shops.has(id) && !shown.has(id));
    fresh.forEach((id) => shown.add(id));
    return {
      label: `POINT ${String(i + 1).padStart(2, "0")}`,
      heading: sec.heading,
      paras: [sec.text],
      stores: fresh.map((id) => ({ id, name: shops.get(id)!.name, href: LFL.shop(id) })),
    };
  });
  const others = list.map((o, i) => ({ s: o, photo: photos[i] })).filter((o) => o.s.slug !== s.slug).slice(0, 3);
  return {
    kicker: "特集",
    title: s.title,
    lead: s.lead,
    date: s.date ? dot(s.date) : "",
    dateIso: s.date,
    crumbs: [{ label: "トップ", href: LFL.top }, { label: "特集", href: LFL.special }, { label: s.title }],
    nav: "special",
    hero: ph(mine?.photo ?? stores.find((x) => x.photo)?.photo),
    sections,
    closing: s.closing,
    info: null,
    stores: stores.map((x) => ({ id: x.id, name: x.name, href: LFL.shop(x.id), kind: x.kindName, area: x.area, photo: ph(x.photo) })),
    related: others.map((o) => ({ href: LFL.specialArticle(o.s.slug), title: o.s.title, tag: "特集", photo: ph(o.photo?.photo) })),
    relatedHead: { en: "RELATED ARTICLES", ja: "ほかの特集", all: { label: "VIEW ALL", href: LFL.special } },
    // 出どころ = 記事に出てくる店の公式サイト
    sources: stores.filter((x) => x.officialUrl).map((x) => ({ label: `${x.name} 公式サイト`, url: x.officialUrl! })),
    path: LFL.specialArticle(s.slug),
  };
}

export async function loadArticleStory(id: string): Promise<StoryView | null> {
  const v: ArticleView | null = await loadArticle(lifeCfg, id);
  if (!v) return null;
  const sh = v.shop;
  const title = v.feature?.title ?? (sh.area ? `${sh.area}の${v.nameMain}` : v.nameMain);
  return {
    kicker: "店の特集記事",
    title,
    lead: v.lede || v.blurb || v.headline,
    date: v.feature?.date ? dot(v.feature.date) : "",
    dateIso: v.feature?.date ?? "",
    crumbs: [{ label: "トップ", href: LFL.top }, { label: "店舗紹介", href: LFL.shops }, { label: sh.name, href: LFL.shop(sh.id) }, { label: "特集記事" }],
    nav: "shops",
    hero: ph(v.hero),
    sections: v.sections.map((s) => ({
      label: `POINT ${s.no}`,
      heading: s.heading.join(""),
      paras: s.paras,
      photo: ph(s.photo),
      specs: s.specs,
      extra: s.extra?.map((e) => ph(e)!).filter(Boolean),
    })),
    closing: "",
    info: { area: sh.area, kind: sh.kindName, hours: shopHours(sh.id, sh.hours), official: sh.officialUrl, shopHref: LFL.shop(sh.id), shopName: sh.name },
    stores: [],
    related: v.related.map((r) => ({ href: LFL.article(r.id), title: r.title, tag: "店の特集", photo: ph(r.photo) })),
    relatedHead: { en: "RELATED ARTICLES", ja: "あわせて読む", all: { label: "VIEW ALL", href: LFL.shops } },
    sources: v.sources,
    checkedAt: v.checkedAt,
    path: LFL.article(sh.id),
  };
}

