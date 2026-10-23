/**
 * ステイの、これまでの種類・県×種類・エリア・利用シーンのページ(/stay/{種類}・/stay/{種類}/{県}・/stay/area/{県}・/stay/scene/{slug})から、
 * 探す(/stay/search)の絞り込みへの恒久の転送(308)。ボディケアと同じやり方(2026-10-23 オーナー決定: 業種のページは 4 種類)。作りは components/portal/vert/legacyToSearch.ts。
 * 探すの URL の引数は kind(宿の種類)・pref(県)・scene(こだわり条件 = 温泉・ペット同伴・一人旅・記念日・素泊まり。lib/verticals/stay.ts の scenes のスラッグそのまま)。
 */
import { legacyToSearch, searchFormSitemap } from "@/components/portal/vert/legacyToSearch";
import { VERTICALS } from "@/lib/verticals";
import { loadStayShops, scenesWithShops } from "./common/live";
import { searchHref } from "./search/data";

const target = {
  href: (f: { kind?: string; pref?: string }) => searchHref({ kinds: f.kind ? [f.kind] : [], pref: f.pref }),
  async scene(slug: string) {
    if (!VERTICALS.stay.scenes.some((s) => s.slug === slug)) return null;
    const has = scenesWithShops(await loadStayShops()).some((s) => s.slug === slug);
    return searchHref(has ? { scenes: [slug] } : {});
  },
};

export const stayLegacy = legacyToSearch("stay", target);
export const staySitemap = (base: Parameters<typeof searchFormSitemap>[1]) => searchFormSitemap("stay", base, target.href);
