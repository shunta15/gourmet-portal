/**
 * 新業種ページ（地域・種類・シーン）の共通ロジック。サーバー専用。
 * ここに「業種ごとの違い」は持たない。vertical を引数に取って、実データから計算するだけ。
 */
import type { Metadata } from 'next';
import { getPlaces, type Place } from '@/lib/places';
import { getVertical } from '@/lib/verticals';
import type { Scene, Vertical, VerticalKey } from '@/lib/verticals/types';

/** グルメ以外の新業種（このフォルダのページが扱う業種） */
export type PortalVertical = Exclude<VerticalKey, 'gourmet'>;

export interface PlaceFilter {
  pref?: string;
  category?: string;
  scene?: Scene;
}

/** 店を条件で絞る（メモリ上）。シーンはタグ一致（事実の根拠があるタグだけが付く前提）。 */
export function pick(places: Place[], f: PlaceFilter): Place[] {
  return places.filter((p) => {
    if (f.pref && p.pref !== f.pref) return false;
    if (f.category && p.category !== f.category) return false;
    if (f.scene && !f.scene.matchTags.some((t) => p.tags.includes(t))) return false;
    return true;
  });
}

/** 業種の全店を1回だけ読み、以降の件数計算はメモリ上で行う */
export async function loadVertical(key: PortalVertical): Promise<{ v: Vertical; all: Place[] }> {
  return { v: getVertical(key), all: await getPlaces(key) };
}

export const NOT_FOUND_TITLE = 'ページが見つかりません — マチノワ';

/** 該当なしのときの metadata（検索エンジンに載せない） */
export function notFoundMetadata(): Metadata {
  return { title: NOT_FOUND_TITLE, robots: { index: false, follow: false } };
}
