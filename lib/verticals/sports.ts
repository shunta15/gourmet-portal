/**
 * スポーツ・フィットネス業種の設定（2026-10-22 オーナー決定）
 *   見出し「スポーツ・フィットネス」・呼び名「マチノワスポーツ」。ジムをスポーツと呼ぶ違和感を見出しで解消し、種類は「ジム・フィットネス」を先頭にする。
 *   ジム・フィットネス（クライミングジム含む）・ヨガ・ピラティス・格闘技・武道・ダンス・ゴルフ・スポーツ施設（フットサル・乗馬など）・スポーツ用品の店。
 */

import type { Vertical } from './types';

export const sports: Vertical = {
  key: 'sports',
  path: '/sports',
  name: 'スポーツ・フィットネス',
  brand: 'マチノワスポーツ',
  accent: {
    color: '#17A398',     // ティール(ほかの業種と色相が重ならない)
    lightColor: '#E2F3F1', // ティール淡色
  },
  // 種類は 6 つ(「ジム・フィットネス」が先頭)。施設(フットサル・乗馬など)は店が少ないので用品の店と 1 つにする。「その他」は作らない
  categories: [
    { slug: 'gym', name: 'ジム・フィットネス', schemaType: 'ExerciseGym' },               // パーソナルジム・クライミングジムを含む
    { slug: 'yoga-pilates', name: 'ヨガ・ピラティス', schemaType: 'SportsActivityLocation' },
    { slug: 'martial-arts', name: '格闘技・武道', schemaType: 'SportsActivityLocation' },
    { slug: 'dance', name: 'ダンス', schemaType: 'SportsActivityLocation' },
    { slug: 'golf', name: 'ゴルフ', schemaType: 'SportsActivityLocation' },
    { slug: 'facility-goods', name: 'スポーツ施設・用品', schemaType: 'SportsActivityLocation' }, // フットサル・乗馬などの施設とスポーツ用品の店
  ],
  // 場面は、公式サイトで確かめられる事実で決める(料金・「無料」は載せない決まり)
  scenes: [
    { slug: 'beginner', name: '初心者歓迎', matchTags: ['初心者歓迎'] },
    { slug: 'trial', name: '体験あり', matchTags: ['体験あり'] },
    { slug: 'open-24h', name: '24時間営業', matchTags: ['24時間営業'] },
    { slug: 'women-only', name: '女性専用', matchTags: ['女性専用'] },
    { slug: 'kids', name: '子ども向け', matchTags: ['子ども向け'] },
  ],
  attributes: [
    { key: 'programs', label: 'プログラム' },
    { key: 'trial', label: '体験' },
    { key: 'hours', label: '営業時間' },
    { key: 'parking', label: '駐車場' },
  ],
  titleTemplates: {
    // 「〇選」「{count}選」は使わない(ペットと同じ。件数を題名に入れない)。{name} は「スポーツ・フィットネス」
    top: '{name}をエリア・種類から探す｜マチノワ{brand}',
    area: '{area}の{category}一覧｜マチノワ{brand}',
    scene: '「{scene}」で探す{name}｜マチノワ{brand}',
  },
  copyRules: [
    {
      forbidden: ['痩せる', '必ず痩せ', '効果を保証', '短期間で', '最高', '絶品', '必ず', 'No.1（根拠なし）'],
      description: '運動の効果・体型の変化をうたう表現と、根拠なき最上級表現は禁止',
    },
  ],
};
