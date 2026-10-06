/**
 * 「おまかせ提案」の店の表を作る（純関数。サーバーでもテスト・集計スクリプトでも動く）。
 * 入力は、こだわり条件の表（lib/portal/facets.ts の buildFacetPayload の rows・shown・shownBands）と、店の業態・region・tags。
 * ここで新しく文字列を読むのは「業態 → 気分」（lib/portal/omakaseDefs.ts の MOODS）と「tags → 事実」だけ。
 * 設備の事実（カウンター・個室・子連れ）は、こだわり条件が画面に出している（検査を通った）ものだけ使う。
 */
import { GOURMET_REGION_BY_PREF } from "@/lib/areas/prefectures";
import { BOOL_FACETS, hasBit, type BoolFacetId } from "./facetDefs";
import { ATOM_BIT, FACT_ATOMS, PREF_INDEX, moodMaskOf, type OmakaseData, type OmakaseRow } from "./omakaseDefs";

const PREF_BY_REGION: Record<string, string> = Object.fromEntries(Object.entries(GOURMET_REGION_BY_PREF).map(([pref, region]) => [region, pref]));
/** グルメの region キー → 県 slug（lib/areas/gourmet の prefOfGourmetRegion と同じ対応。クライアントからも使えるよう、純データだけで引く） */
export function prefOfRegionKey(region: string): string | null {
  return PREF_BY_REGION[region] ?? null;
}

export interface OmakaseSource {
  id: string;
  region: string;
  cuisine: string;
  tags?: string[];
}

interface RowInput {
  /** buildFacetPayload の rows（店ID → [予算の帯, 判定ビット]） */
  facetRows: Record<string, [number, number]>;
  /** buildFacetPayload の shown（画面に出す条件） */
  shown: readonly string[];
  shownBands: readonly number[];
  /** グルメの region キー → 県 slug */
  prefOfRegion: (region: string) => string | null;
}

/** 店 1 軒ぶんの小さな表（OmakaseRow）。buildOmakaseData と、/search のおまかせ提案の条件（SearchFacets）が同じ関数を使う */
export function omakaseRowOf(r: OmakaseSource, input: RowInput): OmakaseRow {
  const { facetRows, shown, shownBands, prefOfRegion } = input;
  const prefSlug = prefOfRegion(r.region);
  const pref = prefSlug !== null && prefSlug in PREF_INDEX ? PREF_INDEX[prefSlug] : -1;
  const fr = facetRows[r.id];
  const bandRaw = fr ? fr[0] : -1;
  const mask = fr ? fr[1] : 0;
  let facts = 0;
  for (const a of FACT_ATOMS) {
    if (a.kind === "facet" && shown.includes(a.facet as string) && (BOOL_FACETS as readonly string[]).includes(a.facet as string) && hasBit(mask, a.facet as BoolFacetId)) facts |= ATOM_BIT[a.id];
  }
  const tags = new Set(r.tags ?? []);
  for (const a of FACT_ATOMS) if (a.kind === "tag" && tags.has(a.tag as string)) facts |= ATOM_BIT[a.id];
  return [r.id, pref, shownBands.includes(bandRaw) ? bandRaw : -1, moodMaskOf(r.cuisine), facts];
}

export function buildOmakaseData(input: RowInput & { restaurants: readonly OmakaseSource[] }): OmakaseData {
  return { rows: input.restaurants.map((r) => omakaseRowOf(r, input)), shownBands: [...input.shownBands] };
}
