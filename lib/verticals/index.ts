/**
 * 業種（Vertical）の統合管理
 */

import type { VerticalKey, Vertical, Category } from './types';
import { gourmet } from './gourmet';
import { beauty } from './beauty';
import { bodycare } from './bodycare';
import { pet } from './pet';
import { leisure } from './leisure';
import { stay } from './stay';

/**
 * 全業種（表示順：gourmet, beauty, bodycare, pet, leisure, stay）
 */
export const VERTICALS: Record<VerticalKey, Vertical> = {
  gourmet,
  beauty,
  bodycare,
  pet,
  leisure,
  stay,
};

/**
 * グルメ以外の新業種キー
 */
export const NEW_VERTICAL_KEYS: VerticalKey[] = ['beauty', 'bodycare', 'pet', 'leisure', 'stay'];

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
