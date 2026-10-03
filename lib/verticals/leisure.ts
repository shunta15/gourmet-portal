/**
 * おでかけ（レジャー）業種の設定
 */

import type { Vertical } from './types';

export const leisure: Vertical = {
  key: 'leisure',
  path: '/leisure',
  name: 'おでかけ',
  brand: 'マチノワおでかけ',
  accent: {
    color: '#3E9BDC',     // スカイブルー
    lightColor: '#E5F1F9', // スカイブルー淡色
  },
  categories: [
    { slug: 'sightseeing', name: '観光スポット', schemaType: 'TouristAttraction' },
    { slug: 'experience', name: '体験・アクティビティ', schemaType: 'TouristAttraction' },
    { slug: 'onsen', name: '日帰り温泉・スパ', schemaType: 'TouristAttraction' },
    { slug: 'park', name: 'テーマパーク・公園', schemaType: 'AmusementPark' },
    { slug: 'outdoor', name: 'アウトドア', schemaType: 'TouristAttraction' },
    { slug: 'museum', name: '美術館・博物館', schemaType: 'Museum' },
  ],
  scenes: [
    { slug: 'rainy-day', name: '雨の日', matchTags: ['雨の日'], },
    { slug: 'with-children', name: '子連れ', matchTags: ['子連れ'] },
    { slug: 'date', name: 'デート', matchTags: ['デート'] },
    { slug: 'free', name: '無料', matchTags: ['無料'] },
    { slug: 'parking', name: '駐車場あり', matchTags: ['駐車場あり'] },
  ],
  attributes: [
    { key: 'fee', label: '入場料' },
    { key: 'duration', label: '所要時間' },
    { key: 'ageTarget', label: '対象年齢' },
    { key: 'indoor', label: '屋内・屋外' },
    { key: 'parking', label: '駐車場' },
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
