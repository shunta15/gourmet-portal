/**
 * maps.ts
 *
 * 「Google マップで開く」リンクのURLを一元的に組み立てる。
 *
 * 【重要】source.url が Google マップの実URLの場合は必ずそれを使う。
 * 店舗名＋住所の検索クエリは同名店で別店舗に飛ぶ事故が起きるため、
 * 店舗を一意に指すURLが手元にあるならそちらが絶対的に正しい。
 * （マチノワ運用ルール「Maps URL が絶対正解」に準拠）
 */
import type { Restaurant } from "./data";

/** Google マップの店舗ページを一意に指すURLかどうか */
export function isGoogleMapsUrl(url: string | undefined): boolean {
  if (!url) return false;
  return (
    /^https?:\/\/maps\.app\.goo\.gl\//.test(url) ||
    /^https?:\/\/goo\.gl\/maps\//.test(url) ||
    /^https?:\/\/(www\.)?maps\.google\.[a-z.]+\//.test(url) ||
    /^https?:\/\/(www\.)?google\.[a-z.]+\/maps/.test(url) ||
    /^https?:\/\/share\.google\//.test(url)
  );
}

/** 店舗名＋住所（なければエリア）で Google マップを検索するURL */
export function mapsSearchUrl(name: string, addressOrArea: string): string {
  const q = [name, addressOrArea].filter(Boolean).join(" ").trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** 店舗データから Google マップのURLを決める（実URL優先・なければ検索） */
export function mapsUrlForRestaurant(r: Restaurant): string {
  if (isGoogleMapsUrl(r.source?.url)) return r.source!.url;
  return mapsSearchUrl(r.name, r.address || r.area);
}

/**
 * 特集記事の店舗ブロックから Google マップのURLを決める。
 * 記事データは住所を specs（住所 / 所在地）に持つため、そこから拾う。
 */
export function mapsUrlForRankItem(item: {
  name: string;
  area: string;
  specs?: { k: string; v: string }[];
}): string {
  const addr = item.specs?.find((s) => s.k === "住所" || s.k === "所在地")?.v;
  return mapsSearchUrl(item.name, addr || item.area);
}
