/**
 * ボディケア案4(グリーン)用の店データの読み込み。サーバー専用(JSON を読む。クライアントから import しない)。
 * 店・写真・タグ・並びは本番の loadShops(lib/portal/colorplay/data.ts)をそのまま使い、営業時間・定休日は店のデータ(lib/places/generated/bodycare.json)から足す。
 * 文(blurb)は本番の点検(lib/portal/vert/bodyshop/model.ts の lineOk。lineOk + EXTRA)にかけ直す。新しい事実・数字は足さない。
 *
 * 使い方(サーバーの部品・ページで):
 *   import { loadGreenShops, greenFacets, pickGreenShops } from "@/lib/portal/vert/bodygreen/shops";
 *   const shops = await loadGreenShops();            // 全 111 店(都道府県順 → ID 順。写真つき・なしの並べ替えはしていない)
 *   const facets = greenFacets(shops);               // 種類・都道府県・こだわりの件数
 * クライアントの部品へは、GreenShop(types.ts)の配列を props で渡す。型は `import type { GreenShop } from "@/lib/portal/vert/bodygreen/types"`。
 */
import "server-only";
import { cache } from "react";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { getGeneratedPlaces } from "@/lib/places/newVerticals";
import { loadShops } from "@/lib/portal/colorplay/data";
import { lineOk } from "@/lib/portal/vert/bodyshop/model";
import { BODYCARE_SITE } from "@/lib/portal/vert/bodysearch/site";
import { POLE_COLORS } from "@/lib/portal/vert/korogashi/colors";
import type { GreenFacets, GreenPhoto, GreenShop } from "./types";

const PREF = new Map(PREFECTURES.map((p) => [p.slug, p]));
const KIND_INDEX = new Map(BODYCARE_SITE.kinds.map((k, i) => [k.slug, i]));

/** 種類の色(最初のページ「転がし」と同じ 6 色の並び) */
export const kindColor = (slug: string): string => POLE_COLORS[Math.max(0, KIND_INDEX.get(slug) ?? 0)] ?? POLE_COLORS[0];
/** 色の上に白い字を置くか(index 2 の藍鼠より濃い色) */
export const kindIsDark = (slug: string): boolean => (KIND_INDEX.get(slug) ?? 0) >= 2;

const clip = (t: string, n: number) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);

export const loadGreenShops = cache(async (): Promise<GreenShop[]> => {
  const [shops, places] = await Promise.all([loadShops(BODYCARE_SITE), getGeneratedPlaces("bodycare")]);
  const byId = new Map(places.map((p) => [p.id, p]));
  return shops.map((s): GreenShop => {
    const p = byId.get(s.id);
    const lines = p?.hours ? p.hours.split(" / ").map((x) => x.trim()).filter(Boolean) : [];
    const pref = PREF.get(s.pref);
    const photo: GreenPhoto | null = s.main ? { src: s.main.src, alt: s.main.alt, w: s.main.w ?? 1200, h: s.main.h ?? 800 } : null;
    return {
      id: s.id,
      name: s.name,
      kind: s.kind,
      kindName: s.kindName,
      kindColor: kindColor(s.kind),
      kindDark: kindIsDark(s.kind),
      pref: s.pref,
      prefName: s.prefName,
      prefShort: pref?.short ?? s.prefName,
      city: s.city,
      area: `${s.prefName}${s.city ? ` ${s.city}` : ""}`,
      address: s.address,
      photo,
      tags: s.tags,
      hours: lines[0] ?? "",
      hoursMore: lines.length > 1,
      holidays: p?.holidays ?? "",
      blurb: s.blurb && lineOk(s.blurb) ? clip(s.blurb, 80) : "",
    };
  });
});

/** 種類・都道府県・こだわりの件数。0 件の物は入れない */
export function greenFacets(shops: GreenShop[]): GreenFacets {
  const kindCount = new Map<string, number>();
  const prefCount = new Map<string, number>();
  const tagCount = new Map<string, number>();
  for (const s of shops) {
    kindCount.set(s.kind, (kindCount.get(s.kind) ?? 0) + 1);
    prefCount.set(s.pref, (prefCount.get(s.pref) ?? 0) + 1);
    for (const t of s.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  }
  return {
    total: shops.length,
    kinds: BODYCARE_SITE.kinds
      .filter((k) => kindCount.has(k.slug))
      .map((k) => ({ slug: k.slug, name: k.name, count: kindCount.get(k.slug) ?? 0, color: kindColor(k.slug) })),
    prefs: [...prefCount.entries()]
      .map(([slug, count]) => ({ slug, name: PREF.get(slug)?.name ?? slug, short: PREF.get(slug)?.short ?? slug, count }))
      .sort((a, b) => b.count - a.count || (PREF.get(a.slug)?.code ?? "").localeCompare(PREF.get(b.slug)?.code ?? "")),
    tags: [...tagCount.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ja")),
  };
}

/** 指定の ID の店を、その順で取り出す(無い ID は飛ばす) */
export function pickGreenShops(shops: GreenShop[], ids: string[]): GreenShop[] {
  const m = new Map(shops.map((s) => [s.id, s]));
  return ids.map((id) => m.get(id)).filter((s): s is GreenShop => !!s);
}
