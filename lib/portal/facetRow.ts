/**
 * 店1軒ぶんの「こだわり条件」の判定（純関数。lib/portal/facets.ts とテスト・集計スクリプトの両方が使う）。
 * 仕様と判定の決まり: proto-portal/FILTERS-BRIEF.md。読み取れない条件は null（不明）。
 *
 * 外部への依存は同じ lib/portal の純関数だけ。駅データ（storeStations.json の stated）は引数で受け取る
 * （JSON の import をここに持ち込まないので、node のテストからそのまま読み込める）。
 */
import { budgetBand, featuresStated, hourFlags, seatRange, seatsAtLeast, type BudgetBand, type FeatureKey } from "./facetParse";
import { weekFromText } from "./openNow";

/** 判定に使う、店データのうちの項目 */
export interface FacetSource {
  id: string;
  budget?: string;
  seats?: string;
  hours?: string;
  closed?: string;
  reservationUrl?: string;
  nearest?: string;
  tags?: string[];
  desc?: string;
  body?: string[];
}

/** storeStations.json の1店ぶん（stated = 店自身の記載から照合できた駅） */
export interface StatedStations {
  stated?: { clusterId: string; walkMin?: number }[];
}

export interface FacetRow {
  budget: BudgetBand | null;
  lunch: boolean | null;
  late: boolean | null;
  morning: boolean | null;
  sunday: boolean | null;
  walk5: boolean | null;
  /** 予約ページのリンク（http/https）があるか。リンクの有無はデータで必ず決まるので null にならない */
  reserve: boolean;
  seats20: boolean | null;
  seats50: boolean | null;
  /** 店の文章に肯定の記載がある設備・特徴（書いていないものは入れない＝不明） */
  has: FeatureKey[];
}

/**
 * 「駅から徒歩N分」として案内文に書かれている分数の一覧。
 * 区切り（/ ／ 、 。 + ＋）ごとに、駅名（「駅」）の後ろに「徒歩N分」が続くもののうち、
 * 駅と徒歩の間に バス・車・タクシー・自転車 が無いものだけを拾う。
 * storeStations.json の walkMin は「案内文の最初の『徒歩N分』」を全部の駅に当てて保存している（lib/stations/walk.ts の注記）ので、
 * バス停・駐車場までの徒歩（「片町バス停から徒歩5分」「徒歩2分の場所に駐車場」）も入りうる。それを見分けるために使う。
 */
export function stationWalkMinutes(nearest: string | undefined | null): number[] {
  if (!nearest) return [];
  const out: number[] = [];
  for (const clause of nearest.normalize("NFKC").split(/[/、。+]/)) {
    const m = /駅([^、。]{0,15}?)徒歩\s*約?\s*(\d+)\s*分/.exec(clause);
    if (m && !/バス|車|タクシー|自転車/.test(m[1])) out.push(Number(m[2]));
  }
  return out;
}

/**
 * 駅から徒歩5分以内か。
 *  - 元は storeStations.json の stated（店自身の記載）の walkMin。記載の無い店は不明。
 *  - はい: walkMin の最小が 5 以下で、その分数が案内文の「駅から徒歩N分」に実際に書かれている。
 *  - いいえ: walkMin が 5 より大きく、案内文の「駅から徒歩N分」がどれも 5 より大きい。
 *  - それ以外（バス停・駐車場までの徒歩を拾った疑いがあるなど）は不明。
 */
export function walk5Of(nearest: string | undefined | null, st: StatedStations | undefined): boolean | null {
  const mins = (st?.stated ?? []).map((s) => s.walkMin).filter((n): n is number => typeof n === "number");
  if (mins.length === 0) return null;
  const min = Math.min(...mins);
  const written = stationWalkMinutes(nearest);
  if (min <= 5) return written.includes(min) ? true : null;
  return written.length > 0 && written.every((n) => n > 5) ? false : null;
}

/**
 * 設備・特徴を探す文章（1つずつ並べた配列）。tags・desc・body。
 * highlights（特集記事の見出し）は使わない: 店ページには出ない文なので、「記載あり」と出しても店ページで確かめられない
 * （2026-10-05 の抜き取りで、highlights だけに書かれた駐車場・テイクアウト等 20 店ほどが店ページと食い違った）。
 * body には、特集記事の見出しのうち店ページに引用されているもの（「マチノワ編集部の特集記事では、「…」などを取り上げています」）が入る。
 */
export function featureTexts(r: FacetSource): string[] {
  return [...(r.tags ?? []), r.desc ?? "", ...(r.body ?? [])];
}

export function facetRowOf(r: FacetSource, st: StatedStations | undefined): FacetRow {
  const hf = hourFlags(weekFromText(r.hours, r.closed).week);
  const seats = seatRange(r.seats);
  const texts = featureTexts(r);
  return {
    budget: budgetBand(r.budget),
    lunch: hf.lunch,
    late: hf.late,
    morning: hf.morning,
    sunday: hf.sunday,
    walk5: walk5Of(r.nearest, st),
    reserve: /^https?:\/\//i.test((r.reservationUrl ?? "").trim()),
    seats20: seatsAtLeast(seats, 20),
    seats50: seatsAtLeast(seats, 50),
    has: featuresStated(texts),
  };
}
