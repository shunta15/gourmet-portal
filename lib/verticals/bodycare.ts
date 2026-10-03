/**
 * ボディケア業種の設定（整体・整骨院・鍼灸・マッサージ・リラクゼーション・ストレッチ）
 */

import type { Vertical } from './types';

export const bodycare: Vertical = {
  key: 'bodycare',
  path: '/bodycare',
  name: 'ボディケア',
  brand: 'マチノワボディケア',
  accent: {
    color: '#7FA896',     // セージグリーン
    lightColor: '#E8F0ED', // セージグリーン淡色
  },
  categories: [
    { slug: 'seitai', name: '整体', schemaType: 'HealthAndBeautyBusiness' },
    { slug: 'sekkotsu', name: '整骨院・接骨院', schemaType: 'HealthAndBeautyBusiness' },
    { slug: 'shinkyu', name: '鍼灸院', schemaType: 'HealthAndBeautyBusiness' },
    { slug: 'massage', name: 'マッサージ', schemaType: 'HealthAndBeautyBusiness' },
    { slug: 'relaxation', name: 'リラクゼーション', schemaType: 'HealthAndBeautyBusiness' },
    { slug: 'stretch', name: 'ストレッチ', schemaType: 'HealthAndBeautyBusiness' },
  ],
  scenes: [
    { slug: 'late-night', name: '夜遅くまで', matchTags: ['夜遅くまで営業'] },
    { slug: 'weekend-open', name: '土日営業', matchTags: ['土日営業'] },
    { slug: 'walkin-ok', name: '予約なしOK', matchTags: ['予約なし可', 'walk-in'] },
    { slug: 'female-staff', name: '女性スタッフ在籍', matchTags: ['女性スタッフ'] },
    { slug: 'near-station', name: '駅近', matchTags: ['駅近'] },
  ],
  attributes: [
    { key: 'menus', label: 'メニュー' },
    { key: 'reservation', label: '予約' },
    { key: 'walkIn', label: '予約なし可' },
    { key: 'insurance', label: '保険取扱' },
  ],
  titleTemplates: {
    top: '{name}の店をエリア・種類から探す｜マチノワ{brand}',
    area: '{area}の{category}{count}選｜マチノワ{brand}',
  },
  copyRules: [
    {
      forbidden: ['治療', '治す', '改善を保証', '医学的根拠', '医療行為'],
      description: '医療行為と誤認させる表現は禁止（柔道整復師法・あはき法）',
    },
    {
      forbidden: ['最高', '絶品', '必ず', 'No.1（根拠なし）'],
      description: '根拠なき最上級表現は禁止',
    },
  ],
};
