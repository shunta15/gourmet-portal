/**
 * 「こだわり条件で絞る」の判定の表をサーバーで作る（公開スイッチ ON の /search だけが呼ぶ。サーバー専用）。
 * クライアントへは、店ID＋判定結果の小さな表（FacetPayload）だけを渡す。店データ全体は二重に渡さない。
 *
 * どの条件を画面に出すかは、仕様（proto-portal/FILTERS-BRIEF.md）の基準をここで毎回確かめて決める。
 *  - 予算・営業時間帯・駅徒歩・予約・席数: 判定できた店が 100 店以上、かつ「はい」が 10 店以上。
 *  - 設備・特徴: 「記載あり」が 10 店以上、かつ、無作為 30 件を元の文と見比べて誤り 0 件（検査済みの条件だけ VERIFIED_FEATURES に入れる）。
 *  数え直しと検査用の表は proto-portal/count-facets.mjs。結果は proto-portal/FILTERS-COVERAGE.md。
 */
import "server-only";
import type { Restaurant } from "@/lib/regions";
import storeStationsJson from "@/lib/stations/storeStations.json";
import { BOOL_FACETS, FACET_DEFS, type BoolFacetId, type FacetId, type FacetPayload } from "./facetDefs";
import { facetRowOf, type FacetRow, type StatedStations } from "./facetRow";
import { FEATURE_KEYS, type FeatureKey } from "./facetParse";
import { packWeeks } from "./openNow";

const STORE_STATIONS = storeStationsJson as unknown as Record<string, StatedStations>;

/** 判定できた店の最低数（予算・営業時間帯・駅徒歩・予約・席数） */
export const MIN_JUDGED = 100;
/** 「はい」の最低数（全条件。設備・特徴は「記載あり」の数） */
export const MIN_YES = 10;

/**
 * 無作為 30 件の検査（誤り 0 件）を通した設備・特徴。ここに無いものは、記載ありが何店あっても画面に出さない。
 * 検査の記録は proto-portal/FILTERS-COVERAGE.md。拾い方（lib/portal/facetParse.ts の RULES・NEG・HEDGE）を変えたら、検査をやり直してから足す。
 */
export const VERIFIED_FEATURES: readonly FeatureKey[] = ["private", "parking", "takeout", "terrace", "counter", "smokefree", "kids"];

type Tri = boolean | null;

function boolOf(row: FacetRow, id: BoolFacetId): Tri {
  switch (id) {
    case "lunch":
    case "late":
    case "morning":
    case "sunday":
    case "walk5":
    case "seats20":
    case "seats50":
      return row[id];
    case "reserve":
      return row.reserve;
    default:
      return row.has.includes(id as FeatureKey) ? true : null; // 設備・特徴は「記載あり」か不明（「いいえ」は作らない）
  }
}

export function buildFacetPayload(restaurants: Restaurant[]): FacetPayload {
  const rows = restaurants.map((r) => ({ id: r.id, row: facetRowOf(r, STORE_STATIONS[r.id]) }));

  // 条件ごとに、判定できた店とはいの数を数えて、出す条件を決める
  const shownBool = new Set<FacetId>();
  for (const id of BOOL_FACETS) {
    let judged = 0;
    let yes = 0;
    for (const { row } of rows) {
      const v = boolOf(row, id);
      if (v !== null) judged++;
      if (v === true) yes++;
    }
    const isFeature = (FEATURE_KEYS as readonly string[]).includes(id);
    const pass = isFeature ? (VERIFIED_FEATURES as readonly string[]).includes(id) && yes >= MIN_YES : judged >= MIN_JUDGED && yes >= MIN_YES;
    if (pass) shownBool.add(id);
  }

  // 予算: 判定できた店が 100 店以上。帯は、はいが 10 店以上のものだけ
  const bandCount = [0, 0, 0, 0, 0];
  let budgetJudged = 0;
  for (const { row } of rows) {
    if (row.budget !== null) {
      budgetJudged++;
      bandCount[row.budget]++;
    }
  }
  const shownBands = budgetJudged >= MIN_JUDGED ? bandCount.map((n, i) => (n >= MIN_YES ? i : -1)).filter((i) => i >= 0) : [];

  const payloadRows: Record<string, [number, number]> = {};
  for (const { id, row } of rows) {
    let mask = 0;
    BOOL_FACETS.forEach((f, i) => {
      if (boolOf(row, f) === true) mask |= 1 << i;
    });
    const band = row.budget === null || !shownBands.includes(row.budget) ? -1 : row.budget;
    if (band >= 0 || mask !== 0) payloadRows[id] = [band, mask];
  }

  // 「いま営業中」の判定に使う営業予定（読み取れた店だけ）
  const packed = packWeeks(restaurants.map((r) => ({ id: r.id, hours: r.hours, closed: r.closed })));
  const index: Record<string, number> = {};
  for (const [id, i] of Object.entries(packed.index)) if (packed.table[i] !== null) index[id] = i;

  const shown = FACET_DEFS.map((d) => d.id).filter((id) => id === "open" || shownBool.has(id));
  return { rows: payloadRows, weeks: { table: packed.table, index }, shown, shownBands };
}
