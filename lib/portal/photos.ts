/**
 * 総合ページの店写真（駅の店カード・新業種の店ページ）の <img> の属性。サーバー専用の使い方を想定（JSON が大きいのでクライアントに import しない）。
 *
 * 自サイトの店写真（/restaurants/...）は automation/portal/build-images.mjs が幅 480 / 960 の WebP を public/_portal/ に事前生成し、
 * 対応表 lib/portal/shopPhotos.json に書く。ここでは対応表を引いて srcSet を作る。
 * 対応表に無い写真（外部URL・生成後に増えた写真・データベース側で差し替わった写真）は、これまでどおり元の画像をそのまま出す。
 * 使ってよい写真かどうか（食べログ系・検閲済み・プレースホルダ）は photoRules.ts の1か所。
 * 実行時に fs で調べない（Vercel の関数に public/ 全体が同梱されるため）。
 */
import { sized } from '@/lib/imageUrl';
import shopPhotos from './shopPhotos.json';
import { isUsableImage } from './photoRules';

type Variant = { width: number; height: number; items: { w: number; h: number; src: string; bytes?: number }[] };
const VARIANTS = shopPhotos.variants as Record<string, Variant>;

export interface PhotoAttrs {
  src: string;
  /** 幅違いの WebP があるときだけ */
  srcSet?: string;
  width?: number;
  height?: number;
  /** 事前生成の WebP か（false なら元画像をそのまま出している） */
  optimized: boolean;
}

/** 店写真の <img> の属性。使えない写真（食べログ系など）は null */
export function shopPhoto(image: string | undefined | null): PhotoAttrs | null {
  if (!isUsableImage(image)) return null;
  const v = VARIANTS[image];
  if (!v || v.items.length === 0) return { src: sized(image, 480), optimized: false };
  const first = v.items[0];
  return {
    src: first.src,
    srcSet: v.items.map((i) => `${i.src} ${i.w}w`).join(', '),
    width: first.w,
    height: first.h,
    optimized: true,
  };
}

/** 事前生成した WebP の数（検査・報告用） */
export function shopPhotoCount(): number {
  return Object.keys(VARIANTS).length;
}
