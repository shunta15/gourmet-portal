/**
 * Place（施設）の型定義
 * 業種共通フィールド + 業種ごとの attributes
 */

import type { VerticalKey } from '@/lib/verticals/types';

/**
 * 店の紹介記事（新業種の実在の店。automation/vertical-stores の build-places.mjs が記事の JSON から作る）。
 * 確認用の facts・quote・notes は持たない（画面に出さない）。
 */
export interface PlaceArticle {
  /** 1 行の説明（事実だけ） */
  headline: string;
  /** 導入 */
  lede: string;
  sections: Array<{ heading: string; body: string }>;
  /** メニュー（公式サイトの表記のまま。あるものだけ） */
  menus?: Array<{ name: string; price?: string; minutes?: number }>;
  /** 情報の出どころ（公式サイト・Google マップなど） */
  sources: Array<{ label: string; url: string }>;
  /** 確認日（YYYY-MM-DD） */
  checkedAt?: string;
}

/**
 * 店の写真 1 枚（新業種の実在の店。build-places.mjs が automation/vertical-stores/photos/<キー>.json から作る）。
 * path は public/ 以下のサイト内パス。取得元の URL（imageUrl・pageUrl）はデータに入れない。
 */
export interface PlacePhoto {
  path: string;
  /** 写っているもの（alt に使う。「店名 — 写っているもの」） */
  what?: string;
  width?: number;
  height?: number;
}

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
  /** 予約ページの URL */
  reservationUrl?: string;
  /** 地図のリンク（Google マップの実URLが分かる店だけ。無ければ店名＋住所の検索リンクを使う） */
  mapUrl?: string;
  /** 店の公式アカウント・公式サイト（任意。値がある店だけボタンが出る。値は推測で作らない） */
  instagram?: string;
  tiktok?: string;
  x?: string;
  facebook?: string;
  /** LINE 公式アカウントの URL */
  line?: string;
  website?: string;
  image?: string;            // 代表画像
  images: string[];          // 画像一覧
  /** 写真の説明と寸法（images と同じ並び。新業種の店で写真があるときだけ） */
  photos?: PlacePhoto[];
  tags: string[];            // シーンタグ
  priceRange?: string;       // 価格帯（例: '¥¥', '¥¥¥'）
  intro?: string;            // 店舗紹介文
  /** 紹介記事（新業種の実在の店。無い店は基本情報だけのページになる） */
  article?: PlaceArticle;
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
