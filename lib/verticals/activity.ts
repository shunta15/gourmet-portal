/**
 * 体験・アクティビティ業種の設定（旧「おでかけ」(leisure)を置き換え。2026-10-22 オーナー決定）
 *   海・川の外遊び（ダイビング・SUP・ラフティング・釣り）、山・空（パラグライダー・森のアスレチック・バギー）、
 *   ものづくり体験（陶芸・染め物・レジン・レザー）、観光施設（庭園・ギャラリー）。
 *   神社・寺はおでかけではなく「くらし」へ（オーナー決定 2026-10-22）。
 */

import type { Vertical } from './types';

export const activity: Vertical = {
  key: 'activity',
  path: '/activity',
  name: '体験・アクティビティ',
  brand: 'マチノワアクティビティ',
  accent: {
    color: '#3E9BDC',     // スカイブルー(旧おでかけの色を引き継ぐ)
    lightColor: '#E5F1F9', // スカイブルー淡色
  },
  // 種類は 4 つ。掲載の見込みが 43 店ほどなので、細かく分けると 1 つの種類が薄くなる。「その他」は作らない
  categories: [
    { slug: 'sea-river', name: '海・川', schemaType: 'SportsActivityLocation' },          // ダイビング・SUP・ラフティング・釣りなど
    { slug: 'mountain-sky', name: '山・空', schemaType: 'SportsActivityLocation' },       // パラグライダー・森のアスレチック・バギーなど
    { slug: 'craft', name: 'ものづくり体験', schemaType: 'LocalBusiness' },                // 陶芸・染め物・レジン・レザーなど
    { slug: 'sightseeing', name: '観光・見学', schemaType: 'TouristAttraction' },         // 庭園・ギャラリーなど
  ],
  // 場面は、公式サイトで確かめられる事実で決める(料金・「無料」は載せない決まり)
  scenes: [
    { slug: 'with-children', name: '子連れ', matchTags: ['子連れ'] },
    { slug: 'beginner', name: '初心者歓迎', matchTags: ['初心者歓迎'] },
    { slug: 'hands-free', name: '手ぶらでOK', matchTags: ['手ぶらでOK'] },
    { slug: 'rainy-day', name: '雨の日', matchTags: ['雨の日'] },
    { slug: 'parking', name: '駐車場あり', matchTags: ['駐車場あり'] },
  ],
  attributes: [
    { key: 'duration', label: '所要時間' },
    { key: 'ageTarget', label: '対象年齢' },
    { key: 'indoor', label: '屋内・屋外' },
    { key: 'parking', label: '駐車場' },
    // 入場料(fee)は載せない(料金・金額は出さない決まり。2026-10-22)
  ],
  titleTemplates: {
    // 「〇選」「{count}選」は使わない(ペットと同じ。件数を題名に入れない)。{name} は「体験・アクティビティ」
    top: '{name}をエリア・種類から探す｜マチノワ{brand}',
    area: '{area}の{category}一覧｜マチノワ{brand}',
    scene: '「{scene}」で探す{name}｜マチノワ{brand}',
  },
  copyRules: [
    {
      forbidden: ['最高', '絶品', '必ず', 'No.1（根拠なし）', '絶景', '安全を保証'],
      description: '根拠なき最上級表現・安全の断言は禁止',
    },
  ],
};
