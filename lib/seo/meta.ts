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
  /** 共有画像（OGP）の差し替え。無ければ総合サイトの共有画像（lib/seo/og.ts）。店の写真など、サイト内のパス（/ から）か https の URL */
  image?: { url: string; width?: number; height?: number; alt: string };
}

/**
 * Next.js Metadata を生成
 * - title, description
 * - canonical（末尾スラッシュなし）
 * - openGraph（画像は lib/seo/og.ts の共有画像）・twitter
 * - robots（件数に基づいて index/noindex）
 */
export function buildMetadata(params: MetadataParams): Metadata {
  const { vertical, title, description, path, count = 0, image } = params;
  const og = image ? { url: image.url, ...(image.width && image.height ? { width: image.width, height: image.height } : {}), alt: image.alt } : ogImage(path, title);

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
      images: [og],
    },
    // twitter を指定しないと、ルートレイアウトの「全国飲食店ポータル」の文言と 180px のアイコンが引き継がれてしまう
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [og.url],
    },
    robots: robotsFor(count),
  };
}
