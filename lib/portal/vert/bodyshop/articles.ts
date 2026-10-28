/**
 * ボディケアの「店の特集記事」の一覧(サーバー専用)。【2026-10-26 試作】
 * 記事のページ(/bodycare/article/<店の ID>)がある店(bsHasArticle)だけを、店 ID の順に並べる。文は loadBsShop(店のデータの紹介記事・特集記事)の点検済みの文だけ。
 * 特集ページ(/bodycare/special)の「店の特集記事」・記事のページの「あわせて読む」が使う。限定公開の店(lib/unlisted.ts)は getGeneratedPlaces が外すので一覧には出ない。
 */
import "server-only";
import { cache } from "react";
import { getGeneratedPlaces } from "@/lib/places/newVerticals";
import { bsHasArticle, loadBsShop, type BsPhoto, type BsShop } from "./model";

export type BsArticleItem = {
  id: string;
  name: string;
  kindSlug: string;
  kindName: string;
  color: string;
  prefName: string;
  area: string;
  /** 記事の題(特集記事は特集の題。紹介記事は店の 1 行の説明。無ければ「店名の紹介記事」) */
  title: string;
  /** 導入の最初の 1 文(80 字まで) */
  lede: string;
  photo: BsPhoto | null;
  featured: boolean;
};

const firstSentence = (t: string | undefined, max: number): string => {
  const x = (t ?? "").match(/[^。]+。?/)?.[0] ?? "";
  return x.length > max ? `${x.slice(0, max - 1)}…` : x;
};

export const articleTitleOf = (s: BsShop): string => (s.hasStory ? s.panels[0]?.heading : "") || s.headline || `${s.name}の紹介記事`;

export function toArticleItem(s: BsShop): BsArticleItem {
  const intro = s.panels[0];
  return {
    id: s.id,
    name: s.name,
    kindSlug: s.kindSlug,
    kindName: s.kindName,
    color: s.color,
    prefName: s.prefName,
    area: `${s.prefName}${s.city ? ` ${s.city}` : ""}`,
    title: articleTitleOf(s),
    lede: firstSentence(intro?.open[0], 80),
    photo: s.photos[0] ?? null,
    featured: s.hasStory,
  };
}

export const loadBsArticleItems = cache(async (): Promise<BsArticleItem[]> => {
  const places = await getGeneratedPlaces("bodycare");
  const out: BsArticleItem[] = [];
  for (const p of places) {
    const s = await loadBsShop(p.id);
    if (s && bsHasArticle(s)) out.push(toArticleItem(s));
  }
  // 特集記事を先に、あとは店 ID の順
  return out.sort((a, b) => Number(b.featured) - Number(a.featured) || a.id.localeCompare(b.id));
});
