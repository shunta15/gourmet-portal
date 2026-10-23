/**
 * ペットの、これまでの種類・県×種類・エリア・利用シーンのページ(/pet/{種類}・/pet/{種類}/{県}・/pet/area/{県}・/pet/scene/{slug})から、
 * 探す(/pet/search)の絞り込みへの恒久の転送(308)。ボディケアと同じやり方(2026-10-23 オーナー決定: 業種のページは 4 種類)。作りは components/portal/vert/legacyToSearch.ts。
 * 探すの URL の引数は kind(種類)・pref(県)・tag(こだわり)。利用シーンは こだわり(店のタグ)に当たる。ペットは今、タグの入った店が無いので、利用シーンは探す(引数なし)へ。
 */
import { legacyToSearch, searchFormSitemap } from "@/components/portal/vert/legacyToSearch";
import { getVertical } from "@/lib/verticals";
import { loadPetShops, searchHref } from "./search/live/liveData";

const target = {
  href: (f: { kind?: string; pref?: string }) => searchHref({ kind: f.kind, pref: f.pref }),
  async scene(slug: string) {
    const scene = getVertical("pet").scenes.find((s) => s.slug === slug);
    if (!scene) return null;
    const shops = await loadPetShops();
    const tag = scene.matchTags.find((t) => shops.some((s) => s.tags.includes(t)));
    return searchHref(tag ? { tag } : {});
  },
};

export const petLegacy = legacyToSearch("pet", target);
export const petSitemap = (base: Parameters<typeof searchFormSitemap>[1]) => searchFormSitemap("pet", base, target.href);
