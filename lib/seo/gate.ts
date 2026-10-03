/**
 * SEO ゲート：掲載件数に基づいて index/noindex を判定
 */

import type { Metadata } from 'next';

/**
 * index 対象の最小件数
 * 3件未満は noindex（薄いページ対策）
 */
export const MIN_INDEXABLE = 3;

/**
 * 件数が index 対象かどうか
 */
export function isIndexable(count: number): boolean {
  return count >= MIN_INDEXABLE;
}

/**
 * Next.js Metadata.robots に使用する値を返す
 */
export function robotsFor(count: number): Metadata['robots'] {
  if (isIndexable(count)) {
    return {
      index: true,
      follow: true,
    };
  } else {
    return {
      index: false,
      follow: true,
    };
  }
}
