/**
 * ステイ業種の設定
 */

import type { Vertical } from './types';

export const stay: Vertical = {
  key: 'stay',
  path: '/stay',
  name: 'ステイ',
  brand: 'マチノワステイ',
  accent: {
    color: '#6366A8',     // インディゴ
    lightColor: '#E8E9F5', // インディゴ淡色
  },
  categories: [
    { slug: 'hotel', name: 'ホテル', schemaType: 'Hotel' },
    { slug: 'ryokan', name: '旅館', schemaType: 'LodgingBusiness' },
    { slug: 'pension', name: '民宿・ペンション', schemaType: 'LodgingBusiness' },
    { slug: 'glamping', name: 'グランピング・キャンプ', schemaType: 'Campground' },
    { slug: 'guesthouse', name: 'ゲストハウス', schemaType: 'Hostel' },
  ],
  scenes: [
    { slug: 'onsen', name: '温泉', matchTags: ['温泉'] },
    { slug: 'pets-allowed', name: 'ペット同伴', matchTags: ['ペット同伴'] },
    { slug: 'solo-trip', name: '一人旅', matchTags: ['一人旅'] },
    { slug: 'anniversary', name: '記念日', matchTags: ['記念日'] },
    { slug: 'no-meals', name: '素泊まり', matchTags: ['素泊まり'] },
  ],
  attributes: [
    { key: 'roomTypes', label: '客室タイプ' },
    { key: 'checkIn', label: 'チェックイン' },
    { key: 'checkOut', label: 'チェックアウト' },
    { key: 'onsen', label: '温泉・浴場' },
    { key: 'petsAllowed', label: 'ペット同伴' },
    { key: 'priceFrom', label: '料金目安' },
  ],
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
