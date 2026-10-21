/**
 * 業種（Vertical）の統合管理
 */

import type { VerticalKey, Vertical, Category } from './types';
import { gourmet } from './gourmet';
import { beauty } from './beauty';
import { bodycare } from './bodycare';
import { pet } from './pet';
import { stay } from './stay';
import { activity } from './activity';
import { sports } from './sports';
import { life } from './life';

/**
 * 全業種（8 業種。表示順：gourmet, beauty, bodycare, pet, stay, activity, sports, life。2026-10-22 オーナーの言い方の順）
 */
export const VERTICALS: Record<VerticalKey, Vertical> = {
  gourmet,
  beauty,
  bodycare,
  pet,
  stay,
  activity,
  sports,
  life,
};

/**
 * 業種の表示順（ヘッダー・フッター・総合トップ・「ほかの業種」など、業種を並べる所はこの 1 つを使う）
 */
export const VERTICAL_ORDER: VerticalKey[] = ['gourmet', 'beauty', 'bodycare', 'pet', 'stay', 'activity', 'sports', 'life'];

/**
 * グルメ以外の新業種キー
 */
export const NEW_VERTICAL_KEYS: VerticalKey[] = ['beauty', 'bodycare', 'pet', 'stay', 'activity', 'sports', 'life'];

/**
 * 予約語（URL slug として使用不可）
 */
export const RESERVED_SLUGS = new Set([
  'area',
  'shop',
  'feature',
  'scene',
  'search',
  'sitemap',
]);

/**
 * 業種の取得
 */
export function getVertical(key: VerticalKey): Vertical {
  return VERTICALS[key];
}

/**
 * カテゴリの取得
 */
export function getCategory(vertical: Vertical, slug: string): Category | null {
  const category = vertical.categories.find((c) => c.slug === slug);
  return category || null;
}

export type { VerticalKey, Vertical, Category, Scene, Attribute, CopyRule } from './types';
