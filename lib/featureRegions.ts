/**
 * 特集記事の地域推定モジュール
 *
 * 各 FeatureArticle のタイトル・kicker・lede・ranking[].area から
 * 地域キーワードを照合してスコアリングし、主たる region を決定する。
 *
 * - 強キーワード（weight 3）: 一意性が高いランドマーク/地名
 * - 中キーワード（weight 2）: 区名・町名
 * - 弱キーワード（weight 1）: 駅名・通り名・あいまいな共通語
 *
 * 自動推定で意図と異なる場合は MANUAL_OVERRIDES に書く。
 */
import {
  FEATURES,
  FEATURE_ARTICLES,
  REGIONS,
  type Feature,
  type FeatureArticle,
  type RegionKey,
} from "./data";

type Weighted = { kw: string; w: number };

/**
 * 16地域それぞれのキーワード辞書。
 * 重複しがちな地名（元町・北区・京橋など）は同義語の組合せで
 * 文脈判定できるよう、強キーワードを各地域に最低1つは設けている。
 */
const REGION_KEYWORDS: Record<RegionKey, Weighted[]> = {
  tokyo: [
    { kw: "東京", w: 2 },
    { kw: "都心", w: 1 },
    { kw: "23区", w: 2 },
    // 主要繁華街・観光地（強）
    { kw: "新宿", w: 3 },
    { kw: "渋谷", w: 3 },
    { kw: "池袋", w: 3 },
    { kw: "六本木", w: 3 },
    { kw: "麻布", w: 3 },
    { kw: "麻布台", w: 3 },
    { kw: "赤坂", w: 3 },
    { kw: "虎ノ門", w: 3 },
    { kw: "銀座", w: 3 },
    { kw: "丸の内", w: 3 },
    { kw: "有楽町", w: 3 },
    { kw: "日比谷", w: 3 },
    { kw: "日本橋", w: 3 },
    { kw: "兜町", w: 3 },
    { kw: "茅場町", w: 3 },
    { kw: "秋葉原", w: 3 },
    { kw: "御茶ノ水", w: 3 },
    { kw: "神田", w: 3 },
    { kw: "神保町", w: 3 },
    { kw: "上野", w: 3 },
    { kw: "浅草", w: 3 },
    { kw: "両国", w: 3 },
    { kw: "錦糸町", w: 3 },
    { kw: "押上", w: 3 },
    { kw: "スカイツリー", w: 3 },
    { kw: "東京タワー", w: 3 },
    { kw: "向島", w: 3 },
    { kw: "亀戸", w: 3 },
    { kw: "門前仲町", w: 3 },
    { kw: "豊洲", w: 3 },
    { kw: "築地", w: 3 },
    { kw: "月島", w: 3 },
    { kw: "晴海", w: 3 },
    { kw: "勝どき", w: 3 },
    { kw: "お台場", w: 3 },
    { kw: "有明", w: 3 },
    { kw: "青海", w: 3 },
    { kw: "品川", w: 3 },
    { kw: "田町", w: 3 },
    { kw: "三田", w: 2 },
    { kw: "高輪", w: 3 },
    { kw: "白金", w: 3 },
    { kw: "目黒", w: 3 },
    { kw: "中目黒", w: 3 },
    { kw: "恵比寿", w: 3 },
    { kw: "代官山", w: 3 },
    { kw: "広尾", w: 3 },
    { kw: "原宿", w: 3 },
    { kw: "竹下通り", w: 3 },
    { kw: "表参道", w: 3 },
    { kw: "青山", w: 3 },
    { kw: "千駄ヶ谷", w: 3 },
    { kw: "代々木", w: 3 },
    { kw: "明治神宮", w: 3 },
    { kw: "自由が丘", w: 3 },
    { kw: "二子玉川", w: 3 },
    { kw: "三軒茶屋", w: 3 },
    { kw: "下北沢", w: 3 },
    { kw: "経堂", w: 3 },
    { kw: "成城", w: 3 },
    { kw: "祖師ヶ谷大蔵", w: 3 },
    { kw: "吉祥寺", w: 3 },
    { kw: "井の頭", w: 3 },
    { kw: "三鷹", w: 3 },
    { kw: "西荻窪", w: 3 },
    { kw: "荻窪", w: 3 },
    { kw: "阿佐ヶ谷", w: 3 },
    { kw: "高円寺", w: 3 },
    { kw: "中野", w: 3 },
    { kw: "立川", w: 3 },
    { kw: "国立", w: 3 },
    { kw: "国分寺", w: 3 },
    { kw: "八王子", w: 3 },
    { kw: "高尾", w: 3 },
    { kw: "町田", w: 3 },
    { kw: "府中", w: 3 },
    { kw: "調布", w: 3 },
    { kw: "武蔵境", w: 3 },
    { kw: "武蔵野", w: 2 },
    { kw: "神楽坂", w: 3 },
    { kw: "飯田橋", w: 3 },
    { kw: "市ヶ谷", w: 3 },
    { kw: "四ツ谷", w: 3 },
    { kw: "谷中", w: 3 },
    { kw: "根津", w: 3 },
    { kw: "千駄木", w: 3 },
    { kw: "巣鴨", w: 3 },
    { kw: "駒込", w: 3 },
    { kw: "日暮里", w: 3 },
    { kw: "西日暮里", w: 3 },
    { kw: "王子", w: 3 },
    { kw: "赤羽", w: 3 },
    { kw: "葛西", w: 3 },
    { kw: "葛飾", w: 3 },
    { kw: "新小岩", w: 3 },
    { kw: "亀有", w: 3 },
    { kw: "綾瀬", w: 3 },
    { kw: "北千住", w: 3 },
    { kw: "南千住", w: 3 },
  ],
  osaka: [
    { kw: "大阪", w: 3 },
    { kw: "梅田", w: 3 },
    { kw: "難波", w: 3 },
    { kw: "なんば", w: 3 },
    { kw: "心斎橋", w: 3 },
    { kw: "天王寺", w: 3 },
    { kw: "阿倍野", w: 3 },
    { kw: "ミナミ", w: 3 },
    { kw: "キタ", w: 2 },
    { kw: "新世界", w: 3 },
    { kw: "通天閣", w: 3 },
    { kw: "道頓堀", w: 3 },
    { kw: "天満", w: 3 },
    { kw: "天満橋", w: 3 },
    { kw: "天六", w: 3 },
    { kw: "北浜", w: 3 },
    { kw: "中之島", w: 3 },
    { kw: "京橋", w: 2 },
    { kw: "福島", w: 2 },
    { kw: "玉造", w: 3 },
    { kw: "弁天町", w: 3 },
    { kw: "天下茶屋", w: 3 },
    { kw: "江坂", w: 3 },
    { kw: "堺市", w: 3 },
    { kw: "高槻", w: 3 },
    { kw: "豊中", w: 3 },
    { kw: "吹田", w: 3 },
    { kw: "東大阪", w: 3 },
    { kw: "枚方", w: 3 },
  ],
  nagoya: [
    { kw: "名古屋", w: 3 },
    { kw: "栄", w: 2 },
    { kw: "伏見", w: 2 },
    { kw: "金山", w: 3 },
    { kw: "大須", w: 3 },
    { kw: "今池", w: 3 },
    { kw: "星ヶ丘", w: 3 },
    { kw: "八事", w: 3 },
    { kw: "藤が丘", w: 3 },
    { kw: "千種", w: 3 },
    { kw: "熱田", w: 3 },
    { kw: "中川区", w: 3 },
    { kw: "中区", w: 1 },
    { kw: "中村区", w: 3 },
    { kw: "瑞穂区", w: 3 },
    { kw: "天白区", w: 3 },
    { kw: "守山区", w: 3 },
    { kw: "緑区", w: 1 },
    { kw: "西区", w: 1 },
  ],
  fukuoka: [
    { kw: "福岡", w: 3 },
    { kw: "博多", w: 3 },
    { kw: "中洲", w: 3 },
    { kw: "長浜", w: 2 },
    { kw: "天神", w: 3 },
    { kw: "大名", w: 3 },
    { kw: "今泉", w: 3 },
    { kw: "西新", w: 3 },
    { kw: "姪浜", w: 3 },
    { kw: "警固", w: 3 },
    { kw: "平尾", w: 3 },
    { kw: "薬院", w: 3 },
  ],
  shizuoka: [
    { kw: "静岡", w: 3 },
    { kw: "熱海", w: 3 },
    { kw: "伊豆", w: 3 },
    { kw: "伊東", w: 3 },
    { kw: "三島", w: 3 },
    { kw: "沼津", w: 3 },
    { kw: "富士市", w: 3 },
    { kw: "富士宮", w: 3 },
    { kw: "掛川", w: 3 },
    { kw: "浜松", w: 3 },
    { kw: "磐田", w: 3 },
    { kw: "島田", w: 3 },
    { kw: "焼津", w: 3 },
    { kw: "藤枝", w: 3 },
    { kw: "御殿場", w: 3 },
  ],
  kanagawa: [
    { kw: "神奈川", w: 3 },
    { kw: "横浜", w: 3 },
    { kw: "みなとみらい", w: 3 },
    { kw: "関内", w: 3 },
    { kw: "桜木町", w: 3 },
    { kw: "野毛", w: 3 },
    { kw: "伊勢佐木", w: 3 },
    { kw: "馬車道", w: 3 },
    { kw: "日本大通り", w: 3 },
    { kw: "石川町", w: 3 },
    { kw: "山下公園", w: 3 },
    { kw: "山手", w: 3 },
    { kw: "中華街", w: 3 },
    { kw: "鎌倉", w: 3 },
    { kw: "北鎌倉", w: 3 },
    { kw: "江の島", w: 3 },
    { kw: "江ノ島", w: 3 },
    { kw: "片瀬", w: 3 },
    { kw: "由比ガ浜", w: 3 },
    { kw: "由比ヶ浜", w: 3 },
    { kw: "腰越", w: 3 },
    { kw: "長谷", w: 2 },
    { kw: "極楽寺", w: 3 },
    { kw: "稲村ヶ崎", w: 3 },
    { kw: "稲村ガ崎", w: 3 },
    { kw: "七里ヶ浜", w: 3 },
    { kw: "茅ヶ崎", w: 3 },
    { kw: "辻堂", w: 3 },
    { kw: "平塚", w: 3 },
    { kw: "藤沢", w: 3 },
    { kw: "湘南", w: 3 },
    { kw: "小田原", w: 3 },
    { kw: "箱根", w: 3 },
    { kw: "強羅", w: 3 },
    { kw: "早雲山", w: 3 },
    { kw: "大涌谷", w: 3 },
    { kw: "仙石原", w: 3 },
    { kw: "元箱根", w: 3 },
    { kw: "芦ノ湖", w: 3 },
    { kw: "川崎", w: 3 },
    { kw: "武蔵小杉", w: 3 },
    { kw: "海老名", w: 3 },
    { kw: "相模原", w: 3 },
    { kw: "厚木", w: 3 },
    { kw: "秦野", w: 3 },
    { kw: "三浦", w: 3 },
    { kw: "逗子", w: 3 },
    { kw: "葉山", w: 3 },
  ],
  saitama: [
    { kw: "埼玉", w: 3 },
    { kw: "さいたま", w: 3 },
    { kw: "大宮", w: 3 },
    { kw: "浦和", w: 3 },
    { kw: "川越", w: 3 },
    { kw: "所沢", w: 3 },
    { kw: "熊谷", w: 3 },
    { kw: "春日部", w: 3 },
    { kw: "越谷", w: 3 },
    { kw: "草加", w: 3 },
    { kw: "朝霞", w: 3 },
    { kw: "和光", w: 3 },
    { kw: "狭山", w: 3 },
    { kw: "入間", w: 3 },
    { kw: "飯能", w: 3 },
    { kw: "秩父", w: 3 },
  ],
  kyoto: [
    { kw: "京都", w: 3 },
    { kw: "祇園", w: 3 },
    { kw: "嵐山", w: 3 },
    { kw: "河原町", w: 3 },
    { kw: "烏丸", w: 3 },
    { kw: "四条", w: 3 },
    { kw: "三条", w: 2 },
    { kw: "出町柳", w: 3 },
    { kw: "北山", w: 3 },
    { kw: "宇治", w: 3 },
  ],
  nara: [
    { kw: "奈良", w: 3 },
    { kw: "橿原", w: 3 },
    { kw: "天理", w: 3 },
    { kw: "桜井", w: 3 },
    { kw: "生駒", w: 3 },
    { kw: "大和郡山", w: 3 },
    { kw: "吉野", w: 3 },
  ],
  hyogo: [
    { kw: "兵庫", w: 3 },
    { kw: "神戸", w: 3 },
    { kw: "三宮", w: 3 },
    { kw: "北野", w: 3 },
    { kw: "明石", w: 3 },
    { kw: "姫路", w: 3 },
    { kw: "西宮", w: 3 },
    { kw: "芦屋", w: 3 },
    { kw: "宝塚", w: 3 },
    { kw: "淡路", w: 3 },
    { kw: "六甲", w: 3 },
  ],
  hiroshima: [
    { kw: "広島", w: 3 },
    { kw: "呉", w: 3 },
    { kw: "福山", w: 3 },
    { kw: "尾道", w: 3 },
    { kw: "三原", w: 3 },
    { kw: "廿日市", w: 3 },
    { kw: "宮島", w: 3 },
    { kw: "厳島", w: 3 },
  ],
  gunma: [
    { kw: "群馬", w: 3 },
    { kw: "前橋", w: 3 },
    { kw: "高崎", w: 3 },
    { kw: "伊勢崎", w: 3 },
    { kw: "桐生", w: 3 },
    { kw: "館林", w: 3 },
    { kw: "草津温泉", w: 3 },
    { kw: "伊香保", w: 3 },
  ],
  shiga: [
    { kw: "滋賀", w: 3 },
    { kw: "大津", w: 3 },
    { kw: "彦根", w: 3 },
    { kw: "近江八幡", w: 3 },
    { kw: "琵琶湖", w: 3 },
  ],
  kagoshima: [
    { kw: "鹿児島", w: 3 },
    { kw: "鹿屋", w: 3 },
    { kw: "姶良", w: 3 },
    { kw: "霧島", w: 3 },
    { kw: "桜島", w: 3 },
    { kw: "指宿", w: 3 },
  ],
  wakayama: [
    { kw: "和歌山", w: 3 },
    { kw: "海南", w: 3 },
    { kw: "橋本", w: 3 },
    { kw: "田辺", w: 3 },
    { kw: "新宮", w: 3 },
    { kw: "白浜", w: 3 },
    { kw: "熊野", w: 3 },
  ],
  hokkaido: [
    { kw: "北海道", w: 3 },
    { kw: "札幌", w: 3 },
    { kw: "函館", w: 3 },
    { kw: "小樽", w: 3 },
    { kw: "旭川", w: 3 },
    { kw: "帯広", w: 3 },
    { kw: "釧路", w: 3 },
    { kw: "網走", w: 3 },
    { kw: "稚内", w: 3 },
  ],
};

/**
 * 自動推定が困難な記事の手動上書き。
 * 必要に応じて追加していく。
 */
const MANUAL_OVERRIDES: Record<string, RegionKey | RegionKey[]> = {
  // 例: "feature-multi-area-foo": ["tokyo", "kanagawa"],
};

/**
 * 記事1本のテキストを連結して返す。
 */
function articleText(a: FeatureArticle): string {
  const parts: string[] = [
    a.title,
    a.titleHTML,
    a.kicker,
    a.subtitle,
    a.lede,
    a.closing,
    a.quote,
  ];
  for (const r of a.ranking) {
    parts.push(r.name, r.area, r.desc);
    for (const sp of r.specs) parts.push(sp.v);
  }
  return parts.filter(Boolean).join(" ");
}

/**
 * 記事のテキストに対する各 region のスコア。
 * 同一キーワードの複数ヒットも積算する。
 */
function scoreRegions(text: string): Record<RegionKey, number> {
  const score = Object.fromEntries(
    (Object.keys(REGIONS) as RegionKey[]).map((k) => [k, 0])
  ) as Record<RegionKey, number>;

  for (const region of Object.keys(REGION_KEYWORDS) as RegionKey[]) {
    for (const { kw, w } of REGION_KEYWORDS[region]) {
      let from = 0;
      while (true) {
        const idx = text.indexOf(kw, from);
        if (idx === -1) break;
        score[region] += w;
        from = idx + kw.length;
      }
    }
  }
  return score;
}

/**
 * スコアから region を確定する。
 * - 0 件 → 空配列
 * - 最高スコアの region が 2 位の 1.5 倍以上 → 単独
 * - そうでない → 上位2つを返す
 */
function pickRegions(score: Record<RegionKey, number>): RegionKey[] {
  const entries = (Object.entries(score) as [RegionKey, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return [];
  const [, top] = entries[0];
  const second = entries[1]?.[1] ?? 0;
  if (top >= second * 1.5 || second === 0) {
    return [entries[0][0]];
  }
  return [entries[0][0], entries[1][0]];
}

const _cache = new Map<string, RegionKey[]>();

/**
 * 記事IDに紐づく region を返す。
 * 手動上書き優先 → 自動推定の順。
 */
export function getFeatureRegions(id: string): RegionKey[] {
  if (_cache.has(id)) return _cache.get(id)!;
  const override = MANUAL_OVERRIDES[id];
  if (override) {
    const arr = Array.isArray(override) ? override : [override];
    _cache.set(id, arr);
    return arr;
  }
  const article = FEATURE_ARTICLES[id];
  if (!article) {
    _cache.set(id, []);
    return [];
  }
  const score = scoreRegions(articleText(article));
  const result = pickRegions(score);
  _cache.set(id, result);
  return result;
}

/**
 * 指定 region に属する indexable な特集記事を返す。
 */
export function getFeaturesByRegion(region: RegionKey): Feature[] {
  return FEATURES.filter((f) => getFeatureRegions(f.id).includes(region));
}

/**
 * region キーごとの indexable 記事件数。
 */
export function getFeatureCountsByRegion(): Record<RegionKey, number> {
  const counts = Object.fromEntries(
    (Object.keys(REGIONS) as RegionKey[]).map((k) => [k, 0])
  ) as Record<RegionKey, number>;
  for (const f of FEATURES) {
    for (const r of getFeatureRegions(f.id)) counts[r] += 1;
  }
  return counts;
}
