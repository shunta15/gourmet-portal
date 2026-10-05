/**
 * 「こだわり条件で絞る」の条件の定義（クライアントでも使える軽い定数と純関数だけ。店データは持たない）。
 * 仕様: proto-portal/FILTERS-BRIEF.md。判定そのものは lib/portal/facetRow.ts、サーバーでの組み立ては lib/portal/facets.ts。
 *
 * URL: `?budget=3000&f=late,walk5`（予算は帯の上限 1000 / 3000 / 5000 / 10000 / 10001、f は条件の ID をカンマ区切り）。
 */
import type { ReactNode } from "react";
import type { SearchItem } from "@/lib/regions";
import type { Week } from "./openNow";

/** 判定がビットで配られる条件（この並びが、店ごとの判定ビットの位置） */
export const BOOL_FACETS = ["lunch", "late", "morning", "sunday", "walk5", "reserve", "seats20", "seats50", "private", "parking", "takeout", "terrace", "counter", "smokefree", "kids"] as const;
export type BoolFacetId = (typeof BOOL_FACETS)[number];
/** 「いま営業中」は現在時刻で決まるので、ビットではなくクライアントで判定する（既存の getOpenStatus） */
export type FacetId = BoolFacetId | "open";
export type FacetGroupId = "hours" | "access" | "seats" | "feature";

export interface FacetDef {
  id: FacetId;
  group: FacetGroupId;
  /** ボタンの文字 */
  label: string;
  /** 結果の店に添える札の文字（設備・特徴は必ず「〜の記載あり」） */
  badge: string;
}

export const FACET_GROUPS: { id: FacetGroupId; title: string; note?: string }[] = [
  { id: "hours", title: "営業時間", note: "店の案内にある営業時間・定休日による" },
  { id: "access", title: "駅・予約" },
  { id: "seats", title: "席数" },
  { id: "feature", title: "設備・特徴", note: "店のタグ・紹介文に記載がある店" },
];

export const FACET_DEFS: FacetDef[] = [
  { id: "lunch", group: "hours", label: "昼に開いている", badge: "昼に開いている" },
  { id: "late", group: "hours", label: "深夜まで", badge: "深夜まで" },
  { id: "morning", group: "hours", label: "朝から", badge: "朝から" },
  { id: "sunday", group: "hours", label: "日曜に開いている", badge: "日曜に開いている" },
  { id: "open", group: "hours", label: "いま営業中", badge: "いま営業中" },
  { id: "walk5", group: "access", label: "駅から徒歩5分以内", badge: "駅から徒歩5分以内" },
  { id: "reserve", group: "access", label: "予約ページのリンクあり", badge: "予約ページのリンクあり" },
  { id: "seats20", group: "seats", label: "20席以上", badge: "20席以上" },
  { id: "seats50", group: "seats", label: "50席以上", badge: "50席以上" },
  { id: "private", group: "feature", label: "個室", badge: "個室の記載あり" },
  { id: "parking", group: "feature", label: "駐車場", badge: "駐車場の記載あり" },
  { id: "takeout", group: "feature", label: "テイクアウト", badge: "テイクアウトの記載あり" },
  { id: "terrace", group: "feature", label: "テラス席", badge: "テラスの記載あり" },
  { id: "counter", group: "feature", label: "カウンター席", badge: "カウンターの記載あり" },
  { id: "smokefree", group: "feature", label: "禁煙", badge: "禁煙の記載あり" },
  { id: "kids", group: "feature", label: "子連れ・家族連れ", badge: "子連れ・家族連れの記載あり" },
];

export const FACET_BY_ID: Record<string, FacetDef> = Object.fromEntries(FACET_DEFS.map((d) => [d.id, d]));

/** 予算の帯。value は URL の ?budget= と同じ（帯の上限。最後だけ 10001） */
export const BUDGET_BANDS: { value: number; label: string }[] = [
  { value: 1000, label: "〜1,000円" },
  { value: 3000, label: "1,001〜3,000円" },
  { value: 5000, label: "3,001〜5,000円" },
  { value: 10000, label: "5,001〜10,000円" },
  { value: 10001, label: "10,001円〜" },
];

/** サーバーがクライアントへ渡す表（店データ全体ではなく、店ID＋判定の小さな表） */
export interface FacetPayload {
  /** 店ID → [予算の帯（0〜4。不明は -1）, 判定ビット（BOOL_FACETS の並びの位置。1=はい）]。判定が何も無い店は含まない */
  rows: Record<string, [number, number]>;
  /** 営業予定の表（「いま営業中」の判定用。lib/portal/openNow の packWeeks と同じ形） */
  weeks: { table: (Week | null)[]; index: Record<string, number> };
  /** 画面に出す条件（基準を満たしたもの。順序は FACET_DEFS） */
  shown: FacetId[];
  /** 画面に出す予算の帯（BUDGET_BANDS の位置） */
  shownBands: number[];
}

export interface FacetSelection {
  /** 選んだ予算の帯（BUDGET_BANDS の位置）。選んでいなければ null */
  band: number | null;
  /** 選んだ条件（FACET_DEFS の順） */
  ids: FacetId[];
}

/** URL の ?budget= と ?f= を読む。出していない条件・知らない値は無視する */
export function parseSelection(budget: string | null | undefined, f: string | null | undefined, payload: Pick<FacetPayload, "shown" | "shownBands">): FacetSelection {
  const bi = BUDGET_BANDS.findIndex((b) => String(b.value) === (budget ?? ""));
  const band = bi >= 0 && payload.shownBands.includes(bi) ? bi : null;
  const want = new Set((f ?? "").split(",").map((s) => s.trim()).filter(Boolean));
  const ids = FACET_DEFS.map((d) => d.id).filter((id) => want.has(id) && payload.shown.includes(id));
  return { band, ids };
}

/** 選択を URL の値にする（空なら null） */
export function selectionParams(sel: FacetSelection): { budget: string | null; f: string | null } {
  return {
    budget: sel.band === null ? null : String(BUDGET_BANDS[sel.band].value),
    f: sel.ids.length === 0 ? null : sel.ids.join(","),
  };
}

/** 店の判定ビットを読む（rows に無い店は、すべて不明） */
export function rowOf(payload: Pick<FacetPayload, "rows">, id: string): [number, number] {
  return payload.rows[id] ?? [-1, 0];
}

export function hasBit(mask: number, id: BoolFacetId): boolean {
  return ((mask >> BOOL_FACETS.indexOf(id)) & 1) === 1;
}

/** SearchClient が画面を組み立てるときに、SearchFacets（lazy）が差し込むもの（型だけ。SearchClient から静的に import してよい） */
export interface FacetExt {
  /** 条件のパネル（検索フォームの下） */
  panel: ReactNode;
  /** 結果の上の注意書き（条件を1つでも選んだときだけ） */
  notice: ReactNode;
  /** 件数の行に足す、選んだ条件の一覧 */
  summary: ReactNode;
  /** 条件を1つでも選んでいるか */
  active: boolean;
  /** 結果の1店（当てはまった条件の札つき。星・点数は出さない） */
  renderCard: (r: SearchItem) => ReactNode;
}
