/**
 * 業種（Vertical）の型定義。
 * gourmet(グルメ) + 新業種(beauty, bodycare, pet, leisure, stay)
 */

export type VerticalKey = 'gourmet' | 'beauty' | 'bodycare' | 'pet' | 'leisure' | 'stay';

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
    area: string;      // "{area}の{category}{count}選｜マチノワ{brand}"
  };
  copyRules: CopyRule[];
  legalNote?: string;
}
