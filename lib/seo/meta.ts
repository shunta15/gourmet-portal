/**
 * SEO メタデータ生成
 */

import type { Metadata } from 'next';
import { robotsFor } from './gate';

export interface MetadataParams {
  vertical: string;
  title: string;
  description: string;
  path: string;
  count?: number;
}

/**
 * Next.js Metadata を生成
 * - title, description
 * - canonical（末尾スラッシュなし）
 * - openGraph
 * - robots（件数に基づいて index/noindex）
 */
export function buildMetadata(params: MetadataParams): Metadata {
  const { vertical, title, description, path, count = 0 } = params;

  // canonical URL（末尾スラッシュなし）
  const canonicalUrl = `https://machinowa.tokyo${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'マチノワ',
      locale: 'ja_JP',
    },
    robots: robotsFor(count),
  };
}
