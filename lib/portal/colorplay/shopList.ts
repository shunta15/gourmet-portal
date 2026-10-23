/**
 * 店舗紹介の一覧(/{v}/shop)の URL と引数。掲載中の全店を並べる(絞り込みは付けない)。
 * 店が多いので、探す(/{v}/search)と同じ作法で「もっと見る」(URL の引数 n)で続きを出す。JS が無くてもリンクで続きが開く。
 */
import { PAGE_MAX, PAGE_SIZE } from "./search";
import type { CpSite } from "./site";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** 店舗紹介の一覧の URL(n は 1 ページぶん=PAGE_SIZE を超えるときだけ付ける) */
export function shopListHref(site: CpSite, n?: number): string {
  return `${site.base}/shop${n && n > PAGE_SIZE ? `?n=${n}` : ""}`;
}

/** URL の引数 n → 正しい件数(知らない値は 1 ページぶん) */
export function parseShopListN(sp: SP): number {
  return Math.min(Math.max(parseInt(one(sp.n)) || PAGE_SIZE, PAGE_SIZE), PAGE_MAX);
}
