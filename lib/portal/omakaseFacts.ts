/**
 * おまかせ提案の結果の札に添える「事実の行」（予算の帯・設備や特徴の記載）。純関数（サーバー・クライアントのどちらからも使える。データは読まない）。
 * 作り方は /search の店の札（components/portal/SearchFacets.tsx の tagsOf）と同じ: 画面に出している条件（shown・shownBands）だけ、
 * 予算の帯 → 当てはまる店が少ない条件の順（同数なら BOOL_FACETS の並び）。設備・特徴の札は「〜の記載あり」（FACET_DEFS の badge）。
 * ここでは「選んでいる条件」は無い（答えた条件は呼び出し側が先頭に足す）。
 */
import { BOOL_FACETS, BUDGET_BANDS, FACET_BY_ID, hasBit, type BoolFacetId } from "./facetDefs";
import type { OmakaseData } from "./omakaseDefs";

export type FactTag = { label: string; on: boolean };

export function makeFactsOf(data: Pick<OmakaseData, "facts" | "shownBands">): (id: string) => FactTag[] {
  const facts = data.facts;
  if (!facts) return () => [];
  const boolShown = facts.shown.filter((f): f is BoolFacetId => (BOOL_FACETS as readonly string[]).includes(f));
  const rarity: Record<string, number> = {};
  for (const f of boolShown) rarity[f] = 0;
  for (const r of Object.values(facts.rows)) for (const f of boolShown) if (hasBit(r[1], f)) rarity[f] += 1;
  return (id) => {
    const r = facts.rows[id];
    if (!r) return [];
    const out: FactTag[] = [];
    if (r[0] >= 0 && data.shownBands.includes(r[0])) out.push({ label: `予算 ${BUDGET_BANDS[r[0]].label}`, on: false });
    const rest = boolShown.filter((f) => hasBit(r[1], f)).sort((a, b) => rarity[a] - rarity[b] || BOOL_FACETS.indexOf(a) - BOOL_FACETS.indexOf(b));
    for (const f of rest) out.push({ label: FACET_BY_ID[f].badge, on: false });
    return out;
  };
}
