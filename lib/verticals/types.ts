/**
 * 業種（Vertical）の型定義。
 * gourmet(グルメ) + 新業種(beauty, bodycare, pet, stay, activity, sports, life)
 * 8 業種(2026-10-22 オーナー決定)。旧 leisure(おでかけ)は activity(体験・アクティビティ)に置き換えた。
 */

export type VerticalKey = 'gourmet' | 'beauty' | 'bodycare' | 'pet' | 'stay' | 'activity' | 'sports' | 'life';

export type CategorySlug = string;

export interface Category {
  slug: CategorySlug;
  name: string;
  schemaType: string;
}

export interface Scene {
  slug: string;
  name: string;
  matchTags: string[];
}

export interface Attribute {
  key: string;
  label: string;
}

export interface CopyRule {
  category?: string;
  forbidden: string[];
  description: string;
}

export interface Vertical {
  key: VerticalKey;
  path: string;
  name: string;
  brand: string;
  accent: {
    color: string;     // CSS #hex
    lightColor: string; // 淡色版 #hex
  };
  categories: Category[];
  scenes: Scene[];
  attributes: Attribute[];
  titleTemplates: {
    top: string;       // "{name}の店をエリア・種類から探す｜マチノワ{brand}"
    area: string;      // "{area}の{category}一覧｜マチノワ{brand}"。古い業種は "{area}の{category}{count}選｜…"(ペット・ステイ・体験・スポーツ・くらしは「〇選」を使わない)
    /** 利用シーンのページの題名("「{scene}」で探す{name}の店｜マチノワ{brand}")。無い業種は components/portal/pages/scene.tsx の既定(件数つき) */
    scene?: string;
  };
  copyRules: CopyRule[];
  legalNote?: string;
}
