/**
 * 47都道府県データ
 * pref slug = 都道府県のローマ字
 * code = JIS X 0401 コード（01〜47）
 */

export type PrefBlockName = '北海道' | '東北' | '関東' | '中部' | '近畿' | '中国' | '四国' | '九州沖縄';

export interface Prefecture {
  code: string;        // JIS X 0401: '01', '02', ... '47'
  name: string;        // 例: '東京都'
  short: string;       // 例: '東京'
  slug: string;        // 例: 'tokyo'（ローマ字、ハイフン可）
  block: PrefBlockName;
}

/**
 * 47都道府県
 */
export const PREFECTURES: Prefecture[] = [
  // 北海道
  { code: '01', name: '北海道', short: '北海道', slug: 'hokkaido', block: '北海道' },

  // 東北
  { code: '02', name: '青森県', short: '青森', slug: 'aomori', block: '東北' },
  { code: '03', name: '岩手県', short: '岩手', slug: 'iwate', block: '東北' },
  { code: '04', name: '宮城県', short: '宮城', slug: 'miyagi', block: '東北' },
  { code: '05', name: '秋田県', short: '秋田', slug: 'akita', block: '東北' },
  { code: '06', name: '山形県', short: '山形', slug: 'yamagata', block: '東北' },
  { code: '07', name: '福島県', short: '福島', slug: 'fukushima', block: '東北' },

  // 関東
  { code: '08', name: '茨城県', short: '茨城', slug: 'ibaraki', block: '関東' },
  { code: '09', name: '栃木県', short: '栃木', slug: 'tochigi', block: '関東' },
  { code: '10', name: '群馬県', short: '群馬', slug: 'gunma', block: '関東' },
  { code: '11', name: '埼玉県', short: '埼玉', slug: 'saitama', block: '関東' },
  { code: '12', name: '千葉県', short: '千葉', slug: 'chiba', block: '関東' },
  { code: '13', name: '東京都', short: '東京', slug: 'tokyo', block: '関東' },
  { code: '14', name: '神奈川県', short: '神奈川', slug: 'kanagawa', block: '関東' },

  // 中部
  { code: '15', name: '新潟県', short: '新潟', slug: 'niigata', block: '中部' },
  { code: '16', name: '富山県', short: '富山', slug: 'toyama', block: '中部' },
  { code: '17', name: '石川県', short: '石川', slug: 'ishikawa', block: '中部' },
  { code: '18', name: '福井県', short: '福井', slug: 'fukui', block: '中部' },
  { code: '19', name: '山梨県', short: '山梨', slug: 'yamanashi', block: '中部' },
  { code: '20', name: '長野県', short: '長野', slug: 'nagano', block: '中部' },
  { code: '21', name: '岐阜県', short: '岐阜', slug: 'gifu', block: '中部' },
  { code: '22', name: '静岡県', short: '静岡', slug: 'shizuoka', block: '中部' },
  { code: '23', name: '愛知県', short: '愛知', slug: 'aichi', block: '中部' },

  // 近畿
  { code: '24', name: '三重県', short: '三重', slug: 'mie', block: '近畿' },
  { code: '25', name: '滋賀県', short: '滋賀', slug: 'shiga', block: '近畿' },
  { code: '26', name: '京都府', short: '京都', slug: 'kyoto', block: '近畿' },
  { code: '27', name: '大阪府', short: '大阪', slug: 'osaka', block: '近畿' },
  { code: '28', name: '兵庫県', short: '兵庫', slug: 'hyogo', block: '近畿' },
  { code: '29', name: '奈良県', short: '奈良', slug: 'nara', block: '近畿' },
  { code: '30', name: '和歌山県', short: '和歌山', slug: 'wakayama', block: '近畿' },

  // 中国
  { code: '31', name: '鳥取県', short: '鳥取', slug: 'tottori', block: '中国' },
  { code: '32', name: '島根県', short: '島根', slug: 'shimane', block: '中国' },
  { code: '33', name: '岡山県', short: '岡山', slug: 'okayama', block: '中国' },
  { code: '34', name: '広島県', short: '広島', slug: 'hiroshima', block: '中国' },
  { code: '35', name: '山口県', short: '山口', slug: 'yamaguchi', block: '中国' },

  // 四国
  { code: '36', name: '徳島県', short: '徳島', slug: 'tokushima', block: '四国' },
  { code: '37', name: '香川県', short: '香川', slug: 'kagawa', block: '四国' },
  { code: '38', name: '愛媛県', short: '愛媛', slug: 'ehime', block: '四国' },
  { code: '39', name: '高知県', short: '高知', slug: 'kochi', block: '四国' },

  // 九州沖縄
  { code: '40', name: '福岡県', short: '福岡', slug: 'fukuoka', block: '九州沖縄' },
  { code: '41', name: '佐賀県', short: '佐賀', slug: 'saga', block: '九州沖縄' },
  { code: '42', name: '長崎県', short: '長崎', slug: 'nagasaki', block: '九州沖縄' },
  { code: '43', name: '熊本県', short: '熊本', slug: 'kumamoto', block: '九州沖縄' },
  { code: '44', name: '大分県', short: '大分', slug: 'oita', block: '九州沖縄' },
  { code: '45', name: '宮崎県', short: '宮崎', slug: 'miyazaki', block: '九州沖縄' },
  { code: '46', name: '鹿児島県', short: '鹿児島', slug: 'kagoshima', block: '九州沖縄' },
  { code: '47', name: '沖縄県', short: '沖縄', slug: 'okinawa', block: '九州沖縄' },
];

/**
 * 都道府県 slug → Prefecture マッピング
 */
const prefBySlugMap = Object.fromEntries(PREFECTURES.map((p) => [p.slug, p]));
export function getPrefBySlug(slug: string): Prefecture | null {
  return prefBySlugMap[slug] || null;
}

/**
 * 都道府県名（例: '東京都' または '東京'） → Prefecture マッピング
 */
export function getPrefByName(name: string): Prefecture | null {
  return PREFECTURES.find((p) => p.name === name || p.short === name) || null;
}

/**
 * グルメ既存地域キーと都道府県の対応
 * 既存グルメの region キーが都道府県と一致しないケースを記録
 * 例: aichi（愛知県） → 'nagoya'（名古屋地域）
 * 表に載っていても REGIONS（lib/regions.ts）に実在しない key は「まだ地域ページが無い県」。
 * リンクを張るときは必ず lib/areas/gourmet.ts の gourmetRegionKey() を通す（/region/{key} が 404 にならないように）。
 */
export const GOURMET_REGION_BY_PREF: Record<string, string> = {
  // グルメの基本16地域に対応する都道府県
  hokkaido: 'hokkaido',
  tokyo: 'tokyo',
  kanagawa: 'kanagawa',
  saitama: 'saitama',
  shizuoka: 'shizuoka',
  aichi: 'nagoya',      // ← 愛知県は名古屋地域
  kyoto: 'kyoto',
  osaka: 'osaka',
  hyogo: 'hyogo',
  nara: 'nara',
  wakayama: 'wakayama',
  shiga: 'shiga',
  hiroshima: 'hiroshima',
  kagoshima: 'kagoshima',
  fukuoka: 'fukuoka',
  gunma: 'gunma',
  // 記事由来の地域（自動生成 articleRegions.ts に対応する都道府県）
  aomori: 'aomori',
  iwate: 'iwate',
  miyagi: 'miyagi',
  akita: 'akita',
  yamagata: 'yamagata',
  fukushima: 'fukushima',
  ibaraki: 'ibaraki',
  tochigi: 'tochigi',
  chiba: 'chiba',
  niigata: 'niigata',
  toyama: 'toyama',
  ishikawa: 'ishikawa',
  fukui: 'fukui',
  yamanashi: 'yamanashi',
  nagano: 'nagano',
  gifu: 'gifu',
  mie: 'mie',
  tottori: 'tottori',
  shimane: 'shimane',
  okayama: 'okayama',
  yamaguchi: 'yamaguchi',
  tokushima: 'tokushima',
  kagawa: 'kagawa',
  ehime: 'ehime',
  kochi: 'kochi',
  saga: 'saga',
  nagasaki: 'nagasaki',
  kumamoto: 'kumamoto',
  oita: 'oita',
  miyazaki: 'miyazaki',
  okinawa: 'okinawa',
};
