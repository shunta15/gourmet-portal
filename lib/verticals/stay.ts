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
    { slug: 'pension', name: '民宿・ペンション・ゲストハウス', schemaType: 'LodgingBusiness' },
    { slug: 'glamping', name: 'グランピング・キャンプ', schemaType: 'Campground' },
    { slug: 'rental', name: '一棟貸し・貸別荘', schemaType: 'LodgingBusiness' },
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
    // 料金目安(priceFrom)は載せない(料金・金額は出さない決まり。2026-10-22)
  ],
  titleTemplates: {
    // 「ステイの店」ではなく「宿」と呼ぶ(決定デザインの言い方。2026-10-22)
    top: '宿をエリア・種類から探す｜マチノワ{brand}',
    // 「〇選」「{count}選」は使わない(ペットと同じ。件数を題名に入れない)。{category} は、エリアのページでは「ステイ」・種類のページでは種類名(ホテル・旅館 など)
    area: '{area}の{category}一覧｜マチノワ{brand}',
    // 利用シーン(温泉・ペット同伴・一人旅・記念日・素泊まり)のページの題名(「〇選」なし)。{scene} はシーン名
    scene: '「{scene}」で探す宿｜マチノワ{brand}',
  },
  copyRules: [
    {
      forbidden: ['最高', '絶品', '必ず', 'No.1（根拠なし）'],
      description: '根拠なき最上級表現は禁止',
    },
  ],
};
