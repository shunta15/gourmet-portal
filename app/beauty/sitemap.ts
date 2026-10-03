/**
 * ビューティーのサイトマップ
 * /beauty/sitemap.xml
 * 外枠の段階では index 対象のページがないため空
 */

import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // 外枠の段階では index 対象（3件以上）のデータがないため、サイトマップは空
  return [];
}
