/**
 * ビューティー業種の設定
 */

import type { Vertical } from './types';

export const beauty: Vertical = {
  key: 'beauty',
  path: '/beauty',
  name: 'ビューティー',
  brand: 'マチノワビューティー',
  accent: {
    color: '#E8547D',     // ローズ
    lightColor: '#F9D9E6', // ローズ淡色
  },
  categories: [
    { slug: 'hair', name: '美容室・ヘアサロン', schemaType: 'HairSalon' },
    { slug: 'nail', name: 'ネイル', schemaType: 'NailSalon' },
    { slug: 'eyelash', name: 'まつげ・眉', schemaType: 'BeautySalon' },
    { slug: 'esthetic', name: 'エステ', schemaType: 'BeautySalon' },
    { slug: 'hair-removal', name: '脱毛', schemaType: 'BeautySalon' },
    { slug: 'headspa', name: 'ヘッドスパ', schemaType: 'DaySpa' },
  ],
  scenes: [
    { slug: 'same-day-booking', name: '当日予約', matchTags: ['当日予約可'] },
    { slug: 'late-night', name: '夜遅くまで', matchTags: ['夜遅くまで営業'] },
    { slug: 'private-room', name: '個室あり', matchTags: ['個室あり'] },
    { slug: 'mens-welcome', name: 'メンズ歓迎', matchTags: ['メンズ向け', 'メンズ歓迎'] },
    { slug: 'with-children', name: '子連れ可', matchTags: ['子連れ可'] },
    { slug: 'near-station', name: '駅近', matchTags: ['駅近'] },
  ],
  attributes: [
    { key: 'menus', label: 'メニュー' },
    { key: 'seats', label: 'シート数' },
    { key: 'staffCount', label: 'スタッフ数' },
    { key: 'reservation', label: '予約' },
    { key: 'payment', label: 'お支払い' },
  ],
  titleTemplates: {
    top: '{name}の店をエリア・種類から探す｜マチノワ{brand}',
    area: '{area}の{category}{count}選｜マチノワ{brand}',
  },
  copyRules: [
    {
      forbidden: ['治る', '若返る', '改善される', '効果', '医療', '医学的', '科学的根拠'],
      description: '医療行為と誤認させる効果効能表現は禁止（薬機法）',
    },
    {
      forbidden: ['最高', '絶品', '必ず', 'No.1（根拠なし）'],
      description: '根拠なき最上級表現は禁止',
    },
  ],
};
