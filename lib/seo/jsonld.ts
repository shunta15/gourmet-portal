/**
 * JSON-LD（構造化データ）生成
 */

import type { Place } from '@/lib/places/types';
import type { VerticalKey, Vertical } from '@/lib/verticals/types';

/**
 * Organization スキーマ
 */
export function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'マチノワ',
    url: 'https://machinowa.tokyo',
    logo: 'https://machinowa.tokyo/logo.png',
  };
}

/**
 * Website スキーマ（SearchAction付き）。総合サイトの検索は /find?q=（グルメの既存 /search は別）
 */
export function website() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://machinowa.tokyo',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://machinowa.tokyo/find?q={search_term_string}',
      },
    },
  };
}

/**
 * BreadcrumbList スキーマ
 * @param items Array of { name, url }
 */
export function breadcrumb(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * ItemList スキーマ（一覧ページ）
 */
export function itemList(places: Place[], vertical: Vertical) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: vertical.name,
    description: `${vertical.name}の施設一覧`,
    itemListElement: places.map((place, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: place.name,
      url: `https://machinowa.tokyo${vertical.path}/shop/${place.id}`,
      image: place.image,
    })),
  };
}

/**
 * LocalBusiness スキーマ（施設詳細）
 * schema.org の型は category.schemaType から決定
 */
export function localBusiness(place: Place, schemaType: string) {
  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': schemaType || 'LocalBusiness',
    name: place.name,
    url: place.url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: place.address,
    },
  };

  if (place.phone) {
    data.telephone = place.phone;
  }
  if (place.hours) {
    data.openingHoursSpecification = {
      '@type': 'OpeningHoursSpecification',
      description: place.hours,
    };
  }
  if (place.image) {
    data.image = place.image;
  }

  return data;
}

/**
 * Article スキーマ（特集記事など）
 */
export function article(params: {
  headline: string;
  description: string;
  image: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}) {
  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.headline,
    description: params.description,
    image: params.image,
    url: params.url,
    author: {
      '@type': 'Organization',
      name: 'マチノワ編集部',
    },
  };

  if (params.datePublished) {
    data.datePublished = params.datePublished;
  }
  if (params.dateModified) {
    data.dateModified = params.dateModified;
  }

  return data;
}
