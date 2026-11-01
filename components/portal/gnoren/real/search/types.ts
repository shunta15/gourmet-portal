/**
 * さがす(real/search)の型。軽い型だけ(サーバー・クライアントのどちらからも import してよい)。
 * 札は real/common/types の GnShopCard に、絞り込みに要る項目を足したもの:
 *  - img: 店の最初の写真の元の URL(クライアントが lib/imageUrl の sized / sizedSrcSet で 640 幅にする)
 *  - kw: 言葉での絞り込み用の文(業種・町名・住所・紹介文。今の /search と同じ範囲)
 *  - allTags: 店の全タグ(?tag= の完全一致・言葉の絞り込み用。札に出すのは tags の 2 つだけ)
 *  - lg: 古い細かい業種の名前(lib/cuisineGroups.ts)に当たるもの = legacyLabels の番号(古い URL ?cuisine=居酒屋 などを受けるため)
 */
import type { GnShopCard } from "@/components/portal/gnoren/real/common/types";

export type SearchShop = GnShopCard & { kw: string; allTags: string[]; lg?: number[] };

export type CuisineFacet = { key: string; label: string; count: number };
export type AreaFacet = { key: string; name: string; count: number; img?: string };
export type SceneFacet = { slug: string; name: string; count: number; img?: string };
export type RegionLabel = { key: string; name: string; count: number };
export type MapPin = { key: string; name: string; count: number; lat: number; lng: number };

export type SearchData = {
  shops: SearchShop[];
  total: number;
  /** 掲載店のある地域の数 */
  regionCount: number;
  cuisines: CuisineFacet[];
  areas: AreaFacet[];
  scenes: SceneFacet[];
  /** 全シーンの名前(slug → 名前。?scene= の表示用) */
  sceneNames: Record<string, string>;
  /** 全地域(ほかの地域の select 用) */
  regions: RegionLabel[];
  /** 古い細かい業種の名前(shops[].lg の番号の表) */
  legacyLabels: string[];
  mapPins: MapPin[];
};
