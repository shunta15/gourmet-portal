/**
 * Place（施設）の型定義
 * 業種共通フィールド + 業種ごとの attributes
 */

import type { VerticalKey } from '@/lib/verticals/types';

/**
 * Place の共通フィールド
 */
export interface PlaceBase {
  id: string;
  vertical: VerticalKey;
  category: string;          // category slug
  name: string;
  nameKana?: string;
  pref: string;              // prefecture slug
  city?: string;             // city slug（作成予定）
  cityName?: string;         // 市区町村名（漢字）
  address: string;
  lat?: number;
  lng?: number;
  station?: string;
  hours?: string;
  holidays?: string;
  phone?: string;
  url?: string;
  image?: string;            // 代表画像
  images: string[];          // 画像一覧
  tags: string[];            // シーンタグ
  priceRange?: string;       // 価格帯（例: '¥¥', '¥¥¥'）
  intro?: string;            // 店舗紹介文
  updatedAt?: string;        // ISO 8601
}

/**
 * Beauty（ビューティー）の attributes
 */
export interface BeautyAttributes {
  menus?: Array<{ name: string; price?: string }>;
  seats?: number;
  staffCount?: number;
  reservation?: string;
  payment?: string;
}

/**
 * Bodycare（ボディケア）の attributes
 */
export interface BodycareAttributes {
  menus?: Array<{ name: string; minutes?: number; price?: string }>;
  reservation?: string;
  walkIn?: boolean;
  insurance?: string;        // 「社保対応」など、表記として保存
}

/**
 * Pet（ペット）の attributes
 */
export interface PetAttributes {
  animals?: string[];        // 対応動物（例: ['犬', '猫']）
  services?: string[];       // サービス内容
  sizeLimit?: string;        // サイズ制限
  pickup?: boolean;          // 送迎の有無
}

/**
 * Leisure（おでかけ）の attributes
 */
export interface LeisureAttributes {
  fee?: string;              // 入場料（例: '¥1,000', '無料'）
  duration?: string;         // 所要時間（例: '2〜3時間'）
  ageTarget?: string;        // 対象年齢
  indoor?: string;           // '屋内', '屋外', '両方'
  parking?: boolean;
}

/**
 * Stay（ステイ）の attributes
 */
export interface StayAttributes {
  roomTypes?: string[];      // 客室タイプ（例: ['シングル', 'ツイン', '和室']）
  checkIn?: string;          // チェックイン時刻
  checkOut?: string;         // チェックアウト時刻
  onsen?: boolean;           // 温泉の有無
  petsAllowed?: boolean;
  priceFrom?: string;        // 最低料金（例: '¥8,000〜'）
}

/**
 * Gourmet（グルメ）の attributes
 * 既存の Restaurant の構造に依存
 */
export interface GourmetAttributes {
  cuisine?: string;
  cuisine_group?: string;
  budget?: string;
  seats?: string;
  reservation_url?: string;
}

/**
 * Place のバリアント型
 */
export type Place = PlaceBase &
  (
    | { vertical: 'beauty'; attributes?: BeautyAttributes }
    | { vertical: 'bodycare'; attributes?: BodycareAttributes }
    | { vertical: 'pet'; attributes?: PetAttributes }
    | { vertical: 'leisure'; attributes?: LeisureAttributes }
    | { vertical: 'stay'; attributes?: StayAttributes }
    | { vertical: 'gourmet'; attributes?: GourmetAttributes }
  );
