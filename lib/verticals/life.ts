/**
 * くらし・ライフスタイル業種の設定（2026-10-22 オーナー決定）
 *   見出し「くらし・ライフスタイル」・呼び名「マチノワライフ」。習い事（塾・英会話・音楽・パソコン・ほかの教室）・神社・寺・
 *   服・雑貨・工芸・写真館・車・修理・クリーニング・買取・花屋・農園・占い など。
 *   神社・寺はおでかけではなくくらしに入れる（オーナー決定 2026-10-22「神社とかくらしだろ」）。習い事という業種は作らず、ここにまとめる。
 */

import type { Vertical } from './types';

export const life: Vertical = {
  key: 'life',
  path: '/life',
  name: 'くらし・ライフスタイル',
  brand: 'マチノワライフ',
  accent: {
    color: '#7FA82F',     // ライムグリーン(ボディケアの緑・ステイの黄と色相をずらす)
    lightColor: '#EFF4E0', // ライム淡色
  },
  // category は 7 つ(元データのまま)。画面の絞り込みは、これを 4 つの組(出かける・習う・買う・借りる・任せる)にまとめる → lib/verticals/lifeKinds.ts。「その他」は作らない
  categories: [
    { slug: 'lesson', name: '習い事・教室', schemaType: 'EducationalOrganization' },     // 塾・英会話・音楽・パソコン・ほかの教室
    { slug: 'shrine-temple', name: '神社・寺', schemaType: 'PlaceOfWorship' },
    { slug: 'fashion-craft', name: 'ファッション・雑貨・工芸', schemaType: 'Store' },       // 服・雑貨・ジュエリー・工芸品の店
    { slug: 'photo-marriage', name: '写真館', schemaType: 'LocalBusiness' },
    { slug: 'car-repair', name: '車・修理・クリーニング・買取', schemaType: 'LocalBusiness' }, // 車・自転車・修理・クリーニング・買取
    { slug: 'flower-farm', name: '花屋・農園', schemaType: 'Store' },
    { slug: 'fortune', name: '占い', schemaType: 'LocalBusiness' },
  ],
  // 場面は、公式サイトで確かめられる事実で決める(料金・「無料」は載せない決まり)
  scenes: [
    { slug: 'trial', name: '体験あり', matchTags: ['体験あり'] },
    { slug: 'kids', name: '子ども向け', matchTags: ['子ども向け'] },
    { slug: 'near-station', name: '駅近', matchTags: ['駅近'] },
    { slug: 'parking', name: '駐車場あり', matchTags: ['駐車場あり'] },
    { slug: 'by-appointment', name: '予約制', matchTags: ['予約制'] },
  ],
  attributes: [
    { key: 'services', label: 'サービス' },
    { key: 'reservation', label: '予約' },
    { key: 'hours', label: '営業時間' },
    { key: 'parking', label: '駐車場' },
  ],
  titleTemplates: {
    // 「〇選」「{count}選」は使わない(ペットと同じ。件数を題名に入れない)。{name} は「くらし・ライフスタイル」
    top: '{name}をエリア・種類から探す｜マチノワ{brand}',
    area: '{area}の{category}一覧｜マチノワ{brand}',
    scene: '「{scene}」で探す{name}｜マチノワ{brand}',
  },
  copyRules: [
    {
      category: 'fortune',
      forbidden: ['当たる', '必ず当たる', '運気が上がる', '願いが叶う', '開運を保証'],
      description: '占いの的中・開運を断言する表現は禁止',
    },
    {
      forbidden: ['最高', '絶品', '必ず', 'No.1（根拠なし）'],
      description: '根拠なき最上級表現は禁止',
    },
  ],
};
