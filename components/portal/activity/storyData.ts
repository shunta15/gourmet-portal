import "server-only";
import type { ArticleView } from "@/components/portal/vkit/article/articleData";
import { aLinks, searchUrl } from "./links";
import { toCard, type AShop } from "./data";
import { SEASON_CHAR, dotDate, type EdGuide, type EdMag, type EdSection, type EdSeason } from "./editorial";
import type { StoryData, StorySec } from "./Story";

const IMG = "/_portal/activity/";

/**
 * 記事の題を「、」の所で 2 行に分ける(真ん中に近い「、」。「、」が無い・短い題は 1 行のまま)。
 * 幅が足りずに折り返すときに、「…決まりご/と」のように言葉の途中で切れて 1 字だけ残るのを避ける。
 */
function titleLines(t: string, maxPerLine = 14): string[] {
  const s = t.trim();
  if (s.length <= maxPerLine) return [s];
  const mid = s.length / 2;
  let best = -1;
  for (let i = 1; i < s.length; i++) if (s[i - 1] === "、" && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return best > 0 ? [s.slice(0, best), s.slice(best)] : [s];
}

/** 文を 2 つの段落に(長い導入を 1 つの塊にしない。「。」で切って、前半・後半に) */
function paragraphs(text: string, max = 2): string[] {
  const sents = text.split(/(?<=。)/).map((x) => x.trim()).filter(Boolean);
  if (sents.length <= 2 || max <= 1) return sents.length ? [sents.join("")] : [];
  const cut = Math.ceil(sents.length / 2);
  return [sents.slice(0, cut).join(""), sents.slice(cut).join("")];
}

/** 店の記事(/activity/article/{店 ID})。店の特集記事がある店はその本文、無い店は紹介記事(Place.article)から(vkit の loadArticle の結果をそのまま使う) */
export function storyOfShop(v: ArticleView, shop: AShop, all: AShop[]): StoryData {
  const feat = shop.feat;
  const isFeature = !!v.feature;
  const title = isFeature && feat?.title.length ? feat.title : v.h1;
  const secs: StorySec[] = v.sections.map((s) => ({
    no: s.no,
    id: s.id,
    heading: s.heading.join(""),
    paras: s.paras,
    photo: s.photo ? { src: s.photo.src, alt: s.photo.alt } : null,
    extra: s.extra?.map((p) => ({ src: p.src, alt: p.alt })),
    specs: s.specs,
  }));
  const official = shop.officialUrl;
  const more = v.related
    .map((r) => all.find((x) => x.id === r.id))
    .filter((x): x is AShop => !!x)
    .map(toCard);
  return {
    crumb: [{ label: shop.kindName, href: searchUrl({ kind: [shop.kind] }) }, { label: shop.name, href: aLinks.shop(shop.id) }, { label: isFeature ? "特集記事" : "紹介記事" }],
    tag: isFeature ? "特集記事" : "紹介記事",
    tagEn: isFeature ? "FEATURE ARTICLE" : "ARTICLE",
    title,
    sub: isFeature ? feat?.sub : v.sub,
    lead: paragraphs(v.lede),
    date: isFeature && feat?.date ? dotDate(feat.date) : v.checkedAt ? `確認 ${dotDate(v.checkedAt)}` : undefined,
    photo: v.hero ? { src: v.hero.src, alt: v.hero.alt } : (shop.photoList[0] ? { src: shop.photoList[0].src, alt: shop.photoList[0].alt } : null),
    hand: shop.heroText,
    secs,
    facts: v.info,
    factsTitle: "基本情報",
    more: more.length ? { heading: "あわせて読みたい", en: "MORE ARTICLES", cards: more, hrefOf: aLinks.story } : undefined,
    // 出どころの名前に「その他」(公式サイトのページ名)があれば「ほか」に(「その他」の語は使わない決まり)
    sources: v.sources.map((x) => ({ ...x, label: x.label.replace(/その他/g, "ほか") })),
    checkedAt: v.checkedAt,
    actions: [
      ...(official ? [{ label: "公式サイトで確認する", href: official, external: true }] : []),
      { label: "店のページを見る", href: aLinks.shop(shop.id), ghost: !!official },
    ],
    banner: { v: "shop", href: official ?? aLinks.shop(shop.id), external: !!official },
  };
}

function secsOf(list: EdSection[], shops: AShop[], idPrefix = "s"): StorySec[] {
  // 店の札は、その記事の中で最初に出てくる節にだけ付ける(同じ店の札が節ごとに繰り返し並ばないように)
  const shown = new Set<string>();
  return list.map((s, i) => ({
    no: String(i + 1).padStart(2, "0"),
    id: `${idPrefix}${i + 1}`,
    heading: s.heading,
    paras: [s.text],
    cards: s.storeIds
      .filter((id) => !shown.has(id))
      .map((id) => {
        shown.add(id);
        return shops.find((x) => x.id === id);
      })
      .filter((x): x is AShop => !!x)
      .map(toCard),
  }));
}

/** 季節の特集(/activity/article/season/{spring|summer|autumn|winter}) */
export function storyOfSeason(s: EdSeason, shops: AShop[]): StoryData {
  return {
    crumb: [{ label: "特集", href: aLinks.article }, { label: s.title }],
    tag: `${SEASON_CHAR[s.id]}の特集`,
    tagEn: "SEASONAL SPECIAL",
    title: titleLines(s.title),
    lead: s.lead ? [s.lead] : [],
    date: s.date ? dotDate(s.date) : undefined,
    photo: { src: s.imageFile, alt: "" },
    secs: secsOf(s.sections, shops),
    actions: [{ label: "体験を探す", href: aLinks.search }],
    banner: { v: "article", href: aLinks.article },
  };
}

/** 読みもの(/activity/article/magazine/{id}) */
export function storyOfMag(m: EdMag, shops: AShop[]): StoryData {
  return {
    crumb: [{ label: "マガジン", href: aLinks.magazine }, { label: m.title }],
    tag: m.tag || "読みもの",
    tagEn: "MAGAZINE",
    title: titleLines(m.title),
    lead: m.lead ? [m.lead] : [],
    date: m.date ? dotDate(m.date) : undefined,
    photo: { src: m.imageFile, alt: "" },
    secs: secsOf(m.sections, shops),
    actions: [{ label: "体験を探す", href: aLinks.search }],
    banner: { v: "article", href: aLinks.article },
  };
}

/** はじめての方へのガイド(/activity/article/guide)。質問ごとに節(#q1〜)。店ごとのメモは、その店の事実の文 */
export function storyOfGuide(g: EdGuide, shops: AShop[]): StoryData {
  return {
    crumb: [{ label: "特集", href: aLinks.article }, { label: g.title }],
    tag: "はじめての方へ",
    tagEn: "BEGINNER'S GUIDE",
    title: titleLines(g.title),
    lead: g.lead ? [g.lead] : [],
    photo: { src: g.imageFile, alt: "" },
    toc: { id: "faq", heading: "よくある質問", en: "QUESTIONS", items: g.items.map((it, i) => ({ label: it.q, href: `#q${i + 1}` })) },
    secs: g.items.map((it, i) => ({
      no: String(i + 1).padStart(2, "0"),
      id: `q${i + 1}`,
      heading: it.q,
      paras: [it.a],
      notes: it.storeNotes
        .map((n) => ({ shop: shops.find((x) => x.id === n.storeId), text: n.text }))
        .filter((n): n is { shop: AShop; text: string } => !!n.shop)
        .map((n) => ({ name: n.shop.name, href: aLinks.shop(n.shop.id), text: `:${n.text}` })),
    })),
    actions: [{ label: "体験を探す", href: aLinks.search }],
    banner: { v: "article", href: aLinks.article },
  };
}
