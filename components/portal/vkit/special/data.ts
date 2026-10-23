import "server-only";
import sportsJson from "@/lib/specials/sports.json";
import lifeJson from "@/lib/specials/life.json";
import { loadShops, type LiveShop } from "../common/live";
import type { VkConfig, VkKey } from "../config";

/**
 * 特集のページ(/sports/special・/life/special とその記事)の記事データ(サーバー専用)。
 * 元はオーナー承認済みの特集記事 3 本ずつ(lib/specials/{業種}.json)。書き換えず、ここでは形をそろえて読むだけ。
 * 店(storeIds)は、その業種の掲載中の店(getPlaces)から探す。載っていない店 ID(非表示・保留の店)は出さない(リンクを作らない)。
 */

export type SpecialSection = { heading: string; text: string; storeIds: string[] };
export type Special = { slug: string; title: string; lead: string; date: string; sections: SpecialSection[]; closing: string };

const RAW: Partial<Record<VkKey, unknown>> = { sports: sportsJson, life: lifeJson };

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

function normalize(raw: unknown): Special[] {
  const items = (raw as { items?: unknown[] } | undefined)?.items;
  if (!Array.isArray(items)) return [];
  const out: Special[] = [];
  for (const it of items as Array<Record<string, unknown>>) {
    const slug = str(it.slug);
    const title = str(it.title);
    if (!slug || !title) continue;
    const sections = (Array.isArray(it.sections) ? (it.sections as Array<Record<string, unknown>>) : [])
      .map((s) => ({
        heading: str(s.heading),
        text: str(s.text),
        storeIds: Array.isArray(s.storeIds) ? (s.storeIds as unknown[]).filter((x): x is string => typeof x === "string") : [],
      }))
      .filter((s) => s.heading && s.text);
    out.push({ slug, title, lead: str(it.lead), date: str(it.date), sections, closing: str(it.closing) });
  }
  return out;
}

/** その業種の特集(記事の並びは JSON のまま)。特集が無い業種(アクティビティ・A 組は別の作り)は空 */
export function loadSpecials(cfg: Pick<VkConfig, "key">): Special[] {
  return normalize(RAW[cfg.key]);
}

export function specialBySlug(cfg: Pick<VkConfig, "key">, slug: string): Special | null {
  return loadSpecials(cfg).find((s) => s.slug === slug) ?? null;
}

/** 特集に出てくる店(storeIds の初出の順。掲載中の店だけ) */
export async function specialShops(cfg: VkConfig, s: Special): Promise<LiveShop[]> {
  const all = new Map((await loadShops(cfg)).map((x) => [x.id, x]));
  const seen = new Set<string>();
  const out: LiveShop[] = [];
  for (const sec of s.sections)
    for (const id of sec.storeIds) {
      const shop = all.get(id);
      if (shop && !seen.has(id)) {
        seen.add(id);
        out.push(shop);
      }
    }
  return out;
}

/** 見出しに入れる短い業種名(「スポーツ・フィットネス」→「スポーツ」、「くらし・ライフスタイル」→「くらし」) */
export function shortName(cfg: Pick<VkConfig, "name">): string {
  return cfg.name.split("・")[0];
}

/** 一覧の見出しの下の説明文 */
export function specialIndexLead(cfg: Pick<VkConfig, "name">): string {
  return `${shortName(cfg)}の店を選ぶときに読める記事です。マチノワに載っている店を例に、種類のちがいや見るところ、行ける曜日と時間をまとめています。`;
}

/** 記事の説明文(meta description 用)。導入の文を 110 字ほどまでで切る */
export function clipLead(t: string, max = 110): string {
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const i = cut.lastIndexOf("。");
  return i > 30 ? cut.slice(0, i + 1) : `${cut}…`;
}
