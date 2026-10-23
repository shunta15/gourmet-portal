/**
 * COLOR PLAY(本番のビューティー)の「特集」(/{v}/special と /{v}/special/{slug})のデータ。
 * 中身は、オーナー承認済みの特集記事(利用シーン・業種の記事 3 本。lib/specials/{v}.json)。店 1 軒の記事ではない(店 1 軒の記事は /{v}/article/{店 ID})。
 * 記事の storeIds の店は、店舗紹介のページ(/{v}/shop/{id})へのリンクにする。店の名前・種類・所在地は店のデータ(loadShops)から引く(ID の完全一致。中間一致はしない)。
 */
import beautySpecials from "@/lib/specials/beauty.json";
import { loadShops } from "./data";
import type { CpSite } from "./site";
import type { CpShop } from "./types";

export type CpSpecialSection = { heading: string; text: string; storeIds: string[] };
export type CpSpecial = { slug: string; title: string; lead: string; date: string; sections: CpSpecialSection[]; closing: string };

const DATA: Record<string, CpSpecial[]> = {
  beauty: (beautySpecials as unknown as { items: CpSpecial[] }).items,
};

/** 特集の一覧(JSON の並びのまま) */
export const loadSpecials = (site: CpSite): CpSpecial[] => DATA[site.key] ?? [];

export const findSpecial = (site: CpSite, slug: string): CpSpecial | undefined => loadSpecials(site).find((s) => s.slug === slug);

export const specialListHref = (site: CpSite) => `${site.base}/special`;
export const specialHref = (site: CpSite, slug: string) => `${site.base}/special/${encodeURIComponent(slug)}`;

/** 記事に出てくる店(storeIds の全部)を ID から引く。店のデータに無い ID は入れない */
export async function specialShops(site: CpSite, sp: CpSpecial): Promise<Map<string, CpShop>> {
  const shops = await loadShops(site);
  const byId = new Map(shops.map((s) => [s.id, s]));
  const out = new Map<string, CpShop>();
  for (const sec of sp.sections) for (const id of sec.storeIds) {
    const s = byId.get(id);
    if (s) out.set(id, s);
  }
  return out;
}

/**
 * 1 つの長い文章を、読みやすい段落に分ける(文の区切り「。」で。かっこ「」『』()（）の中の「。」では切らない)。文は 1 字も変えない。
 * 目安の長さ(target)に届いたら次の段落にする。最後が短すぎるときは前の段落に付ける。
 */
export function paragraphs(text: string, target = 110): string[] {
  const sents: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of text) {
    cur += ch;
    if ("「『（(".includes(ch)) depth++;
    else if ("」』）)".includes(ch)) depth = Math.max(0, depth - 1);
    else if (ch === "。" && depth === 0) {
      sents.push(cur);
      cur = "";
    }
  }
  if (cur) sents.push(cur);
  const out: string[] = [];
  let acc = "";
  for (const s of sents) {
    acc += s;
    if (acc.length >= target) {
      out.push(acc);
      acc = "";
    }
  }
  if (acc) {
    if (out.length > 0 && acc.length < 40) out[out.length - 1] += acc;
    else out.push(acc);
  }
  return out;
}

/** 2026-10-24 → 2026年10月24日 */
export const jaDate = (d: string) => d.replace(/^(\d{4})-(\d{2})-(\d{2})$/, (_m, y, mo, da) => `${y}年${Number(mo)}月${Number(da)}日`);

