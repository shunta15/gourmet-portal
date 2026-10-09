/**
 * 新業種（ビューティー・ボディケア）の実在の店の特集記事。lib/places/generated/features-{beauty,bodycare}.json を読む。
 * JSON は automation/vertical-stores/build-features.mjs の自動生成（手で編集しない）。
 * 確認用の facts・notes は JSON に入っていない。
 * サーバー専用（動的 import で読む）。クライアント部品から import しない。
 */
import type { FeatureArticle } from '@/lib/regions';
import type { GeneratedVertical } from './newVerticals';

/** 特集の写真 1 枚の寸法と説明（<img> の width / height / alt に使う） */
export interface FeaturePhoto {
  w?: number;
  h?: number;
  alt: string;
}

export interface PlaceFeature {
  /** URL に使う ID（= article.id。店舗名。日本語のまま） */
  id: string;
  /** 材料のキー（beauty-98 など） */
  key: string;
  vertical: GeneratedVertical;
  storeName: string;
  /** その店の店ページの ID（ids.json の ID。店ページがあるときだけ） */
  placeId?: string;
  article: FeatureArticle;
  /** ページの説明文 */
  summary: string;
  tags: string[];
  /** 情報の出どころ（公式サイト・Google マップ） */
  sources: Array<{ label: string; url: string }>;
  /** 確認日（YYYY-MM-DD） */
  checkedAt?: string;
  /** 写真の公開パス → 寸法・説明 */
  photos: Record<string, FeaturePhoto>;
}

export async function getGeneratedFeatures(vertical: GeneratedVertical): Promise<PlaceFeature[]> {
  const mod = vertical === 'beauty' ? await import('./generated/features-beauty.json') : await import('./generated/features-bodycare.json');
  return (mod.default as unknown as { features: PlaceFeature[] }).features;
}

/** URL の ID（日本語。パーセントエンコードのままでも可）から特集を探す */
export async function findFeature(vertical: GeneratedVertical, id: string): Promise<PlaceFeature | undefined> {
  return (await getGeneratedFeatures(vertical)).find((f) => f.id === id);
}

/** その店（店 ID）の特集。無ければ undefined */
export async function findFeatureForPlace(vertical: GeneratedVertical, placeId: string): Promise<PlaceFeature | undefined> {
  return (await getGeneratedFeatures(vertical)).find((f) => f.placeId === placeId);
}

/** 特集ページの URL（日本語のまま。<Link href> には encodeURI を通す） */
export function featurePath(vertical: GeneratedVertical, id: string): string {
  return `/${vertical}/feature/${id}`;
}
