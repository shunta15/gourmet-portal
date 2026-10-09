/**
 * Place（施設）の統合管理
 */

import type { VerticalKey } from '@/lib/verticals/types';
import type { Place } from './types';
import { getGourmetPlaces } from './gourmet';
import { getGeneratedPlaces } from './newVerticals';

/**
 * 業種別に Place データを取得
 * データ投入：gourmet（DB）・beauty / bodycare（lib/places/generated/*.json。自動生成）
 * pet / leisure / stay は外枠の段階では空配列
 */
export async function getPlaces(
  vertical: VerticalKey,
  filters?: { pref?: string; category?: string }
): Promise<Place[]> {
  let places: Place[] = [];

  switch (vertical) {
    case 'gourmet':
      places = await getGourmetPlaces();
      break;
    case 'beauty':
    case 'bodycare':
      places = await getGeneratedPlaces(vertical);
      break;
    case 'pet':
    case 'leisure':
    case 'stay':
      // 外枠の段階ではデータなし
      places = [];
      break;
    default:
      const _exhaustive: never = vertical;
      return _exhaustive;
  }

  // フィルタを適用
  if (!filters || Object.keys(filters).length === 0) {
    return places;
  }

  return places.filter((p) => {
    if (filters.pref && p.pref !== filters.pref) {
      return false;
    }
    if (filters.category && p.category !== filters.category) {
      return false;
    }
    return true;
  });
}

/**
 * 業種別に Place の件数をカウント
 * 条件フィルタ（都道府県、カテゴリ）をサポート
 */
export async function countPlaces(
  vertical: VerticalKey,
  filters?: { pref?: string; category?: string }
): Promise<number> {
  const places = await getPlaces(vertical);

  if (!filters || Object.keys(filters).length === 0) {
    return places.length;
  }

  return places.filter((p) => {
    if (filters.pref && p.pref !== filters.pref) {
      return false;
    }
    if (filters.category && p.category !== filters.category) {
      return false;
    }
    return true;
  }).length;
}

export type { Place } from './types';
