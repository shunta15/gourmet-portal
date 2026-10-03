/**
 * 総合トップ（/）用のデータ。サーバー専用（lib/data を読むのでクライアントから import しない）。
 * 数字・店名・写真はすべて実データから作る。
 */
import { FEATURES, FEATURE_ARTICLES } from '@/lib/data';
import { sized } from '@/lib/imageUrl';
import { isBlockedImage } from '@/lib/imageBlocklist';
import { getPlaces } from '@/lib/places';
import { getAllFeatureArticleIdsWithUpdatedAt, isFeatureIndexable } from '@/lib/db/features';
import type { Place } from '@/lib/places/types';
import { PREFECTURES, type PrefBlockName } from '@/lib/areas/prefectures';
import { gourmetRegionKey } from '@/lib/areas/gourmet';
import homePhotos from './homePhotos.json';

export interface PrefItem {
  slug: string;
  short: string;
  name: string;
  block: PrefBlockName;
  /** グルメの掲載店数（0 なら掲載なし） */
  count: number;
  /** 飛び先。グルメ掲載がある県は既存の /region/{key}、それ以外は業種横断の街 /area/{pref} */
  href: string;
  hasGourmet: boolean;
}

export interface GourmetPhoto {
  src: string;
  /** 幅違いの WebP（事前生成。automation/portal/build-images.mjs）。無いときは元画像をそのまま出す */
  srcSet?: string;
  width?: number;
  height?: number;
  name: string;
  area: string;
  id: string;
}

/** 事前生成した WebP（lib/portal/homePhotos.json の variants。キーは public からのパス） */
const PHOTO_VARIANTS = homePhotos.variants as Record<string, { width: number; height: number; items: { w: number; h: number; src: string }[] }>;

export interface LatestFeature {
  id: string;
  title: string;
  tag: string;
  kicker: string;
  image: string;
  date: string;
}

export interface PortalHomeData {
  gourmetTotal: number;
  gourmetPrefCount: number;
  featureTotal: number;
  prefs: PrefItem[];
  photos: GourmetPhoto[];
  features: LatestFeature[];
}

/** 食べログ系の画像・検閲済み画像・プレースホルダは使わない */
export function isUsableImage(src: string | undefined | null): src is string {
  if (!src) return false;
  const s = src.toLowerCase();
  if (s.includes('tabelog') || s.includes('k-img.com') || s.includes('tblg')) return false;
  if (s.includes('_placeholder')) return false;
  if (isBlockedImage(src)) return false;
  return true;
}


/**
 * 自サイトに置いてある店の写真（/restaurants/...）だけ。
 * 実行時に fs でファイルを調べると、Vercel の関数に public/ 全体（約800MB）が同梱されて
 * 250MB 上限を超えるため使わない。重い PNG は避ける（優先候補は目視で軽いものを指定済み）。
 */
function localPhotoOk(src: string): boolean {
  return src.startsWith('/restaurants/') && !/\.png$/i.test(src);
}

/**
 * 写真が料理や店内でよく伝わる店の優先候補（画像パスで指定）。
 * 該当の画像が無くなっていれば、自動で次の候補（地域が重ならない店）に落ちる。
 */
const PREFERRED_PHOTO_IMAGES: string[] = homePhotos.preferred;

function pickPhotos(places: Place[], n: number): GourmetPhoto[] {
  const usable = places.filter((p) => isUsableImage(p.image) && localPhotoOk(p.image!));
  const byImage = new Map(usable.map((p) => [p.image!, p]));
  const picked: Place[] = [];
  const usedRegions = new Set<string>();
  for (const img of PREFERRED_PHOTO_IMAGES) {
    const p = byImage.get(img);
    if (p && picked.length < n) {
      picked.push(p);
      usedRegions.add(p.pref);
    }
  }
  // 地域が重ならないように、店の多い地域から1店ずつ
  const regionCount = new Map<string, number>();
  for (const p of usable) regionCount.set(p.pref, (regionCount.get(p.pref) ?? 0) + 1);
  const regionsByCount = [...regionCount.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  for (const region of regionsByCount) {
    if (picked.length >= n) break;
    if (usedRegions.has(region)) continue;
    const p = usable.find((x) => x.pref === region);
    if (p) {
      picked.push(p);
      usedRegions.add(region);
    }
  }
  return picked.map((p) => {
    const v = PHOTO_VARIANTS[p.image!];
    const base = { id: p.id, name: p.name, area: p.cityName || '' };
    if (!v || v.items.length === 0) return { ...base, src: sized(p.image!, 960) };
    return {
      ...base,
      src: v.items[v.items.length - 1].src,
      srcSet: v.items.map((i) => `${i.src} ${i.w}w`).join(', '),
      width: v.width,
      height: v.height,
    };
  });
}

function latestFeatures(n: number): LatestFeature[] {
  const sorted = FEATURES.filter((f) => isUsableImage(f.image))
    .map((f) => ({ f, date: FEATURE_ARTICLES[f.id]?.date ?? '' }))
    .sort((a, b) => b.date.localeCompare(a.date));
  // 同じ日付・同じタグが並ばないよう、タグの違う新しい順から選ぶ。足りなければ新しい順で埋める。
  const picked: typeof sorted = [];
  const tags = new Set<string>();
  const images = new Set<string>();
  for (const x of sorted) {
    if (picked.length >= n) break;
    if (tags.has(x.f.tag) || images.has(x.f.image)) continue; // 同じ写真が並ばないようにする
    tags.add(x.f.tag);
    images.add(x.f.image);
    picked.push(x);
  }
  for (const x of sorted) {
    if (picked.length >= n) break;
    if (!picked.includes(x) && !images.has(x.f.image)) {
      images.add(x.f.image);
      picked.push(x);
    }
  }
  return picked.map(({ f, date }) => ({
    id: f.id,
    title: f.title,
    tag: f.tag,
    kicker: f.kicker,
    image: sized(f.image, 720),
    date,
  }));
}

export async function getPortalHomeData(): Promise<PortalHomeData> {
  const places = await getPlaces('gourmet');

  // Place.pref はグルメの region キー（愛知＝nagoya など）。都道府県 → region キーの対応表で引き直す。
  const byRegion = new Map<string, number>();
  for (const p of places) byRegion.set(p.pref, (byRegion.get(p.pref) ?? 0) + 1);

  const prefs: PrefItem[] = PREFECTURES.map((p) => {
    const key = gourmetRegionKey(p.slug);
    const count = key ? byRegion.get(key) ?? 0 : 0;
    const hasGourmet = !!key && count > 0;
    return {
      slug: p.slug,
      short: p.short,
      name: p.name,
      block: p.block,
      count: hasGourmet ? count : 0,
      href: hasGourmet ? `/region/${key}` : `/area/${p.slug}`,
      hasGourmet,
    };
  });

  return {
    gourmetTotal: places.length,
    gourmetPrefCount: prefs.filter((p) => p.hasGourmet).length,
    // 公開中（index 対象）の特集記事数。/sitemap.xml と同じ基準
    featureTotal: (await getAllFeatureArticleIdsWithUpdatedAt()).filter((f) => isFeatureIndexable(f.id)).length,
    prefs,
    photos: pickPhotos(places, 3),
    features: latestFeatures(4),
  };
}
