/**
 * スポーツの、これまでの種類・県×種類・エリア・利用シーンのページ(/sports/{種類}・/sports/{種類}/{県}・/sports/area/{県}・/sports/scene/{slug})から、
 * 探す(/sports/search)の絞り込みへの恒久の転送(308)。ステイ・ペット・ボディケアと同じやり方(2026-10-23 オーナー決定: 業種のページは 4 種類。スポーツは 2026-10-27「探すで行こうでOK」)。作りは components/portal/vert/legacyToSearch.ts。
 * 探すの URL の引数は kind(種類)・pref(県)。利用シーン(初心者歓迎・体験あり ほか)は探すの絞り込みに同じ物が無いので、探す(引数なし)へ(知らないシーンは 404)。
 */
import { legacyToSearch, searchFormSitemap } from "@/components/portal/vert/legacyToSearch";
import { VERTICALS } from "@/lib/verticals";
import { SPL } from "./links";

const target = {
  href: (f: { kind?: string; pref?: string }) => SPL.searchWith({ kind: f.kind, pref: f.pref }),
  async scene(slug: string) {
    return VERTICALS.sports.scenes.some((s) => s.slug === slug) ? SPL.search : null;
  },
};

export const sportsLegacy = legacyToSearch("sports", target);
export const sportsSitemap = (base: Parameters<typeof searchFormSitemap>[1]) => searchFormSitemap("sports", base, target.href);
