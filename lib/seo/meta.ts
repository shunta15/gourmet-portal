/**
 * SEO メタデータ生成
 */

import type { Metadata } from 'next';
import { robotsFor } from './gate';
import { ogImage } from './og';

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
 * - openGraph（画像は lib/seo/og.ts の共有画像）・twitter
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
      // 総合サイトの共有画像（app/og/**）。ルートの app/opengraph-image.tsx（グルメ用）には頼らない
      images: [ogImage(path, title)],
    },
    // twitter を指定しないと、ルートレイアウトの「全国飲食店ポータル」の文言と 180px のアイコンが引き継がれてしまう
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage(path, title).url],
    },
    robots: robotsFor(count),
  };
}
