/**
 * くらしの、これまでの種類・県×種類・エリア・利用シーンのページ(/life/{種類}・/life/{種類}/{県}・/life/area/{県}・/life/scene/{slug})から、
 * 探す(/life/search)の絞り込みへの恒久の転送(308)。ステイ・ペット・ボディケアと同じやり方(2026-10-23 オーナー決定: 業種のページは 4 種類。くらしは 2026-10-27「探すで行こうでOK」)。作りは components/portal/vert/legacyToSearch.ts。
 * 探すの URL の引数は kind(種類)・pref(県)。利用シーン(体験あり・子ども向け ほか)は探すの絞り込みに同じ物が無いので、探す(引数なし)へ(知らないシーンは 404)。
 */
import { legacyToSearch, searchFormSitemap } from "@/components/portal/vert/legacyToSearch";
import { VERTICALS } from "@/lib/verticals";
import { LFL } from "./links";

const target = {
  href: (f: { kind?: string; pref?: string }) => LFL.searchWith({ kind: f.kind, pref: f.pref }),
  async scene(slug: string) {
    return VERTICALS.life.scenes.some((s) => s.slug === slug) ? LFL.search : null;
  },
};

export const lifeLegacy = legacyToSearch("life", target);
export const lifeSitemap = (base: Parameters<typeof searchFormSitemap>[1]) => searchFormSitemap("life", base, target.href);
