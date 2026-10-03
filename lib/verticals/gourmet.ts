/**
 * グルメ業種の設定
 * 既存の業態分類（lib/cuisineGroups.ts等）をそのまま参照するため、categories は空配列。
 * scenes は既存 lib/scenes.ts のまま。
 */

import type { Vertical } from './types';

export const gourmet: Vertical = {
  key: 'gourmet',
  path: '/gourmet',
  name: 'グルメ',
  brand: 'マチノワグルメ',
  accent: {
    color: '#C84F35',     // 朱（既存色）
    lightColor: '#F0D4CC', // 朱淡色
  },
  // グルメは既存の業態分類を使う（lib/cuisineGroups.ts 等）
  categories: [],
  // scenes は既存 lib/scenes.ts で定義（ここでは空）
  scenes: [],
  // attributes は既存の Restaurant 型で定義
  attributes: [],
  titleTemplates: {
    top: '{name}の店をエリア・種類から探す｜マチノワ{brand}',
    area: '{area}の{category}{count}選｜マチノワ{brand}',
  },
  copyRules: [
    {
      forbidden: ['最高', '絶品', '必ず', 'No.1（根拠なし）'],
      description: '根拠なき最上級表現は禁止',
    },
  ],
};
