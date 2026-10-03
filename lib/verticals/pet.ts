/**
 * ペット業種の設定
 */

import type { Vertical } from './types';

export const pet: Vertical = {
  key: 'pet',
  path: '/pet',
  name: 'ペット',
  brand: 'マチノワペット',
  accent: {
    color: '#E5A447',     // アンバー
    lightColor: '#F7EDD9', // アンバー淡色
  },
  categories: [
    { slug: 'trimming', name: 'トリミング', schemaType: 'LocalBusiness' },
    { slug: 'pet-hotel', name: 'ペットホテル', schemaType: 'LocalBusiness' },
    { slug: 'vet', name: '動物病院', schemaType: 'VeterinaryCare' },
    { slug: 'dog-cafe', name: 'ドッグカフェ', schemaType: 'LocalBusiness' },
    { slug: 'dog-run', name: 'ドッグラン', schemaType: 'LocalBusiness' },
    { slug: 'pet-shop', name: 'ペットショップ', schemaType: 'PetStore' },
  ],
  scenes: [
    { slug: 'large-dog-ok', name: '大型犬OK', matchTags: ['大型犬対応'] },
    { slug: 'cat-ok', name: '猫OK', matchTags: ['猫対応'] },
    { slug: 'pickup-delivery', name: '送迎あり', matchTags: ['送迎あり'] },
    { slug: 'night-care', name: '夜間対応', matchTags: ['夜間対応'] },
  ],
  attributes: [
    { key: 'animals', label: '対応動物' },
    { key: 'services', label: 'サービス' },
    { key: 'sizeLimit', label: 'サイズ制限' },
    { key: 'pickup', label: '送迎' },
  ],
  titleTemplates: {
    top: '{name}の店をエリア・種類から探す｜マチノワ{brand}',
    area: '{area}の{category}{count}選｜マチノワ{brand}',
  },
  copyRules: [
    {
      category: 'vet',
      forbidden: ['治療成績', '比較優良', '絶対安全', '必ず治る', '医学的根拠なし'],
      description: '動物病院の医療広告における過度な効果表現は禁止（獣医療広告ガイドライン）',
    },
    {
      forbidden: ['最高', '絶品', '必ず', 'No.1（根拠なし）'],
      description: '根拠なき最上級表現は禁止',
    },
  ],
};
