/**
 * 候補リスト（/list）が店 1 軒ごとに取る JSON の型。型だけ（サーバーの import を持たない）ので、クライアントの部品から import してよい。
 * 作るのは lib/portal/listData.ts（サーバー専用）。
 */
import type { Week } from "./openNow";
import type { VerticalKey } from "@/lib/verticals/types";

export interface ListShop {
  id: string;
  name: string;
  /** 業態・種類の表示名（無ければ空） */
  category: string;
  /** 県＋街（lib/portal/searchIndex.ts の店の副題と同じ作り方。無ければ空） */
  area: string;
  /** 店ページのパス（/restaurant/r33 など） */
  href: string;
  vertical: VerticalKey;
  /** 業種の色・淡い色・飾り文字（写真が無い店のカードに使う） */
  color: string;
  light: string;
  glyph: string;
  /** 使える写真があるときだけ */
  photo?: { src: string; srcSet?: string; width?: number; height?: number };
  /** 営業予定。営業時間・定休日が読み取れない店は null（営業中の表示は出さない） */
  week: Week | null;
}
