/**
 * スポーツのサイトマップの付け替え(旧ページ→探すの絞り込み URL)。
 * 旧い種類・県×種類・エリア・利用シーンのページ(728 本の一部)は 2026-10-27 に消した。それらの URL から探す(/sports/search)の絞り込みへの恒久の転送(308)は、
 * next.config.ts の redirects(lib/portal/legacyVertRedirects.ts)に移した。ここには、サイトマップから旧 URL を外して転送先の探す URL に替える部分だけが残る(作りは components/portal/vert/legacyToSearch.ts)。
 * 探すの URL の引数は kind(種類)・pref(県)。
 */
import { searchFormSitemap } from "@/components/portal/vert/legacyToSearch";
import { SPL } from "./links";

const href = (f: { kind?: string; pref?: string }) => SPL.searchWith({ kind: f.kind, pref: f.pref });

export const sportsSitemap = (base: Parameters<typeof searchFormSitemap>[1]) => searchFormSitemap("sports", base, href);
