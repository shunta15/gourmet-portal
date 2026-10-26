/**
 * COLOR PLAY(本番のビューティー)の「店の特集記事・紹介記事」(/{v}/article/{id})のデータ読み込み。サーバー専用。
 * (記事の一覧ページ /{v}/article は、2026-10-24 のオーナー決定で店舗紹介の一覧 /{v}/shop へ 308 転送。一覧用の URL・絞り込みはここに無い)
 * 店の紹介文・事実は既存のデータ(lib/places の JSON)をそのまま使い、新しい事実・数字を足さない。文は店のページと同じ点検(./text.ts)に通す。
 *
 * 記事になる店 = 特集記事(features-{v}.json。店 ID が placeId と完全に一致するもの)がある店、または店の紹介記事(Place.article)で
 *   見出し・導入の点検に通り、本文(導入か節)が 1 つ以上残る店。どちらも無い店は記事なし(記事のページは 404。店のページは別に残る)。
 * 記事の URL の ID は店の ID(例 be0001)。特集の ID(AQUA-BELL など)で開いた場合は、店の ID の URL へ恒久の転送(articlePage の resolve)。
 * 同じ本文が /{v}/shop/{id} にもあるので、記事ページの canonical は店のページ(pages/article.tsx)。
 */
import { getGeneratedFeatures, type PlaceFeature } from "@/lib/places/features";
import { getGeneratedPlaces } from "@/lib/places/newVerticals";
import { isUsableImage } from "@/lib/portal/photoRules";
import { loadDetail, loadShops } from "./data";
import type { CpSite } from "./site";
import { cleanLine, cleanParagraphs, firstSentence } from "./text";
import type { CpPhoto, CpShop } from "./types";

/** 記事の一覧に出す 1 本 */
export type CpArticleItem = {
  /** 店の ID(記事の URL の ID。リンク先の店のページも同じ ID) */
  id: string;
  shop: CpShop;
  /** 特集記事(true)か、店の紹介記事(false)か */
  featured: boolean;
  title: string;
  /** 導入の最初の 1 文(点検済み。無ければ空) */
  lede: string;
  /** カードの写真(特集はヒーロー画像。無ければ null=種類の色面) */
  photo: CpPhoto | null;
};

export type CpArticleSection = {
  id?: string;
  no: string;
  heading: string;
  sub?: string;
  body: string[];
  specs: { k: string; v: string }[];
  /** この節の写真(特集のポイントに付いた写真だけ) */
  photos: CpPhoto[];
};

/** 記事のページ 1 本ぶん */
export type CpArticle = {
  item: CpArticleItem;
  /** 先頭の写真(無ければ null) */
  hero: CpPhoto | null;
  sections: CpArticleSection[];
  /** 先頭以外の店の写真(紹介記事だけ。特集記事は空) */
  gallery: CpPhoto[];
  quote: string;
  quoteCite: string;
  closing: string[];
  menus: string[];
  sources: { label: string; url: string }[];
  checkedAt?: string;
  /** メタデータの説明文 */
  description: string;
  /** ほかの記事(同じ種類・同じ県を先に) */
  more: CpArticleItem[];
};

export const articleHref = (site: CpSite, id: string) => `${site.base}/article/${encodeURIComponent(id)}`;

/** 種類を 1 つずつ順番に回して並べる(種類の中は店 ID の順)。順位に見せないための並べ方 */
function interleave(items: CpArticleItem[], kindOrder: string[]): CpArticleItem[] {
  const order = [...kindOrder, ...Array.from(new Set(items.map((i) => i.shop.kind))).filter((k) => !kindOrder.includes(k))];
  const groups = order
    .map((k) => items.filter((i) => i.shop.kind === k).sort((a, b) => a.id.localeCompare(b.id)))
    .filter((g) => g.length > 0);
  const out: CpArticleItem[] = [];
  for (let r = 0; out.length < items.length; r++) {
    let added = false;
    for (const g of groups) {
      if (r < g.length) {
        out.push(g[r]);
        added = true;
      }
    }
    if (!added) break;
  }
  return out;
}

const featPhoto = (f: PlaceFeature, src: string | undefined, fallbackAlt: string): CpPhoto | null =>
  src && isUsableImage(src) ? { src, alt: f.photos[src]?.alt ?? fallbackAlt, w: f.photos[src]?.w, h: f.photos[src]?.h } : null;

/** 文の区切り(。)で、max 字までに収める。最初の 1 文が長すぎるときは、その文を max 字で切る */
function clip(text: string, max: number): string {
  const sents = text.match(/[^。]+。?/g) ?? [];
  let out = "";
  for (const x of sents) {
    if ((out + x).length > max) break;
    out += x;
  }
  return out || (text.length > max ? text.slice(0, max - 1) + "…" : text);
}

/** 記事になる店の一覧(特集 → 紹介記事の順。それぞれ種類を順に回す) */
export async function loadArticleItems(site: CpSite): Promise<CpArticleItem[]> {
  const strict = site.strict;
  const [places, shops, feats] = await Promise.all([getGeneratedPlaces(site.key), loadShops(site), getGeneratedFeatures(site.key)]);
  const shopOf = new Map(shops.map((s) => [s.id, s]));
  const featOf = new Map(feats.filter((f) => f.placeId).map((f) => [f.placeId as string, f]));

  const featured: CpArticleItem[] = [];
  const intro: CpArticleItem[] = [];
  for (const [id, f] of featOf) {
    const shop = shopOf.get(id);
    if (!shop) continue;
    const title = cleanLine(f.article.title, strict) || `${shop.name}の特集記事`;
    featured.push({
      id,
      shop,
      featured: true,
      title,
      lede: firstSentence(f.summary || f.article.lede, strict, 90),
      photo: featPhoto(f, f.article.heroImage, `${shop.name} — 店の写真`) ?? shop.main,
    });
  }
  for (const p of places) {
    if (featOf.has(p.id) || !p.article) continue;
    const shop = shopOf.get(p.id);
    if (!shop) continue;
    const headline = cleanLine(p.article.headline, strict);
    const lede = firstSentence(p.article.lede, strict, 90);
    // 見出しも導入の 1 文も点検に通らない店は、紹介記事なしとして扱う
    if (!headline && !lede) continue;
    // 本文(導入か節)が 1 つも残らない店は記事にしない
    const hasBody = lede || p.article.sections.some((s) => cleanLine(s.heading, strict) && firstSentence(s.body, strict));
    if (!hasBody) continue;
    // 【2026-10-26 試作】店の特集記事は店のページと別ページ。記事が薄い店(見出しつきの節が点検後に 2 つ未満。特集記事のある店は対象外)は、記事のページを作らず店のページだけ
    if (p.article.sections.filter((s) => cleanLine(s.heading, strict) && cleanParagraphs(s.body, strict).length > 0).length < 2) continue;
    intro.push({ id: p.id, shop, featured: false, title: headline || `${p.name}の紹介`, lede, photo: shop.main });
  }
  const kindOrder = site.kinds.map((k) => k.slug);
  return [...interleave(featured, kindOrder), ...interleave(intro, kindOrder)];
}

/** 記事のページ 1 本ぶん。記事にならない店・店が無い ID は null */
export async function loadArticle(site: CpSite, id: string): Promise<CpArticle | null> {
  const items = await loadArticleItems(site);
  const item = items.find((i) => i.id === id);
  if (!item) return null;
  const hit = await loadDetail(site, id);
  if (!hit) return null;
  const d = hit.detail;
  const feat = (await getGeneratedFeatures(site.key)).find((f) => f.placeId === id);

  const used = new Set<string>();
  const hero = d.photos[0] ?? null;
  if (hero) used.add(hero.src);

  const sections: CpArticleSection[] = [];
  let no = 0;
  const nn = () => String(++no).padStart(2, "0");
  if (d.story && feat) {
    const st = d.story;
    if (st.lede.length > 0) sections.push({ id: "about", no: nn(), heading: st.subtitle || "紹介", body: st.lede, specs: [], photos: [] });
    for (const pt of st.points) {
      // 特集のポイントに付けた写真(店の ID と同じ特集の ranking の images。同じ写真を繰り返さない)
      const r = feat.article.ranking.find((x) => x.name === pt.name);
      const photos: CpPhoto[] = [];
      for (const src of r?.images ?? []) {
        if (used.has(src)) continue;
        const ph = featPhoto(feat, src, `${d.shop.name} — 店の写真`);
        if (ph) {
          photos.push(ph);
          used.add(src);
        }
      }
      sections.push({ no: nn(), heading: pt.name, sub: pt.purpose || undefined, body: pt.body, specs: pt.specs, photos });
    }
  } else {
    if (d.lede.length > 0) sections.push({ id: "about", no: nn(), heading: "紹介", body: d.lede, specs: [], photos: [] });
    for (const sc of d.sections) sections.push({ no: nn(), heading: sc.heading, body: sc.body, specs: [], photos: [] });
  }
  if (sections.length === 0) return null;

  // 店の写真の並び。特集記事は、特集に付いた写真(先頭・各ポイント)だけを使う(店のデータの写真と同じ場面が重なって見えないように)。紹介記事は、先頭以外の店の写真
  const gallery = d.story ? [] : d.photos.filter((x) => !used.has(x.src)).slice(0, 6);
  const sources = feat ? feat.sources : d.sources;
  const checkedAt = feat?.checkedAt ?? d.checkedAt;

  // メタデータの説明文(点検に通った文だけ)
  const lead = item.featured ? clip(cleanParagraphs(feat?.summary, site.strict).join(""), 130) : "";
  const description = lead || `${item.shop.name}(${item.shop.prefName}${item.shop.city})の紹介記事。${item.lede || item.title}`;

  const score = (x: CpArticleItem) => Number(x.shop.kind === item.shop.kind) * 2 + Number(x.shop.pref === item.shop.pref);
  const more = items
    .filter((x) => x.id !== id)
    .map((x, i) => ({ x, i }))
    .sort((a, b) => score(b.x) - score(a.x) || a.i - b.i)
    .slice(0, 4)
    .map((e) => e.x);

  return {
    item,
    hero,
    sections,
    gallery,
    quote: d.story?.quote ?? "",
    quoteCite: d.story?.quoteCite ?? "",
    closing: d.story?.closing ?? [],
    menus: d.menus.map((m) => m.name),
    sources,
    checkedAt,
    description,
    more,
  };
}
