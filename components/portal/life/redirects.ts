/**
 * くらしのサイトマップの付け替え。共通のサイトマップ(components/portal/pages/sitemap.ts)が出す旧ページ(種類・県×種類・エリア・利用シーン)の URL を外し、探す(/life/search)の絞り込み URL(種類・県)に替える。
 * 旧ページ自体は 2026-10-27 に消した(転送も置かない。旧 URL は くらしの枠の 404)。作りは components/portal/vert/legacyToSearch.ts。探すの URL の引数は kind(種類の組。lib/verticals/lifeKinds.ts の 4 つ)・pref(県)。
 */
import { searchFormSitemap } from "@/components/portal/vert/legacyToSearch";
import { LIFE_KIND_GROUPS } from "@/lib/verticals/lifeKinds";
import { LFL } from "./links";

const href = (f: { kind?: string; pref?: string }) => LFL.searchWith({ kind: f.kind, pref: f.pref });

export const lifeSitemap = (base: Parameters<typeof searchFormSitemap>[1]) => searchFormSitemap("life", base, href, LIFE_KIND_GROUPS);
