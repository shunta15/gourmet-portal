/**
 * 店ページの「使える写真が 1 枚も無い店」に、集めた写真を当てはめる（サーバー専用）。
 *
 * 写真は Google マップのその店の写真（public/restaurants/fs/…）。店ページ用に集めたもの（automation/shop-photos/<店ID>.json）を優先し、
 * 無ければ、その店の特集用に集めたもの（automation/feature-spot-photos/）を流用する。検査してまとめたものが
 * lib/shopPhotos.generated.json（`node automation/shop-photos/build.mjs` で作る。手で編集しない）。
 *   { "<店ID>": ["/restaurants/fs/…/h1.jpg", …] }   先頭が一番上に出る写真
 *
 * 当てはめる所は lib/db/restaurants.ts の店を返す関数すべて（sanitizeRestaurant のあと）。
 *   - 暖簾の店ページ（lib/portal/noren/shop.ts の heroImagesOf と同じ数え方）で使える写真が 0 枚の店だけ、heroImages と image に入れる。
 *     使える写真がある店は変えない。gallery は触らない（ページは heroImages と gallery を別々の区画に出すため、同じ写真が 2 度出ないように）。
 *   - 「使える」は暖簾の特集ページ・店ページと同じ式（lib/portal/noren/usableImage.ts）。
 *
 * まとめたファイルは静的に import する（サーバーの束に必ず入る）。中身が `{}` でも、形が想定と違っても、何も当てない。
 * このモジュールを読むのは lib/db/restaurants.ts だけ（サーバー専用）。server-only なのでクライアントの束に入ればビルドが失敗する。
 */
import "server-only";
import type { Restaurant } from "@/lib/regions";
import { heroImagesOf } from "@/lib/portal/noren/shop";
import { isUsableFeatureImage } from "@/lib/portal/noren/usableImage";
import generated from "./shopPhotos.generated.json";

/** 店 ID → 写真の公開パス（先頭が一番上） */
export type ShopPhotos = Record<string, string[]>;

/** 読んだ中身を整える。連想配列でなければ {}（何も当てない）。公開パス（/ で始まる文字列）の配列だけ残す */
export function normalizeShopPhotos(raw: unknown): ShopPhotos {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: ShopPhotos = {};
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(v)) continue;
    const list = v.filter((p): p is string => typeof p === "string" && p.startsWith("/"));
    if (list.length) out[id] = list;
  }
  return out;
}

const photosOfFile: ShopPhotos = normalizeShopPhotos(generated);

/** lib/shopPhotos.generated.json の中身（`{}` なら何も当たらない） */
export function getShopPhotos(): ShopPhotos {
  return photosOfFile;
}

/** 暖簾の店ページで一番上に出せる写真が 1 枚でもあるか（heroImagesOf の数え方）。sanitizeRestaurant を通した店で数える */
export function hasUsableShopPhoto(r: Pick<Restaurant, "image" | "heroImages" | "gallery">): boolean {
  return heroImagesOf(r).some(isUsableFeatureImage);
}

/**
 * 店に写真を当てはめて返す（元の店は変えない。当てはめるものが無ければ同じオブジェクトをそのまま返す）。
 * photos を渡さなければ lib/shopPhotos.generated.json（getShopPhotos）を使う。
 */
export function applyShopPhotos<R extends Pick<Restaurant, "id" | "image" | "heroImages" | "gallery">>(r: R, photos: ShopPhotos = getShopPhotos()): R {
  if (!r || !Object.prototype.hasOwnProperty.call(photos, r.id)) return r;
  const list = photos[r.id];
  if (!Array.isArray(list) || list.length === 0) return r;
  if (hasUsableShopPhoto(r)) return r;
  return { ...r, heroImages: list, image: list[0] };
}
