/**
 * スポーツのサイトマップの付け替え。共通のサイトマップ(components/portal/pages/sitemap.ts)が出す旧ページ(種類・県×種類・エリア・利用シーン)の URL を外し、探す(/sports/search)の絞り込み URL(種類・県)に替える。
 * 旧ページ自体は 2026-10-27 に消した(転送も置かない。旧 URL は スポーツの枠の 404)。作りは components/portal/vert/legacyToSearch.ts。探すの URL の引数は kind(種類)・pref(県)。
 */
import { searchFormSitemap } from "@/components/portal/vert/legacyToSearch";
import { SPL } from "./links";

const href = (f: { kind?: string; pref?: string }) => SPL.searchWith({ kind: f.kind, pref: f.pref });

export const sportsSitemap = (base: Parameters<typeof searchFormSitemap>[1]) => searchFormSitemap("sports", base, href);
