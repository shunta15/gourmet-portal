export type Stat = { n: string; l: string };

export type RegionKey = "tokyo" | "yokohama";

export type Region = {
  name: string;
  nameEn: string;
  tagline: string;
  subtitle: string;
  intro: string;
  heroImages: string[];
  stats: Stat[];
};

export type Feature = {
  id: string;
  no: string;
  tag: string;
  kicker: string;
  title: string;
  sub: string;
  image: string;
};

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  area: string;
  region: RegionKey;
  rating?: string;
  shape: "wide" | "tall" | "square";
  image: string;
  gallery: string[];
  desc: string;
  address: string;
  hours: string;
  closed: string;
  seats: string;
  budget?: string;
  nearest: string;
  reservationUrl?: string;
  source?: { label: string; url: string };
};

export type Neighborhood = {
  no: string;
  name: string;
  alt: string;
  desc: string;
  count: string;
  image: string;
  region: RegionKey;
};

export type RankItem = {
  rank: string;
  rankNum: number;
  name: string;
  cuisine: string;
  area: string;
  desc: string;
  images: string[];
  specs: { k: string; v: string }[];
};

export type FeatureArticle = {
  id: string;
  no: string;
  kicker: string;
  title: string;
  titleHTML: string;
  subtitle: string;
  lede: string;
  date: string;
  reading: string;
  author: string;
  heroImage: string;
  ranking: RankItem[];
  sideArticles: { t: string; h: string; img: string }[];
  quote: string;
  quoteCite: string;
  closing: string;
};

export type ShortVideo = {
  id: string;
  restaurantId: string;
  thumbnail: string;
  title: string;
  cuisineEmoji: string;
  cuisineLabel: string;
  duration: string;
  likes: string;
  comments: string;
  saves: string;
};

export const NATIONAL = {
  brand: "マチノワ",
  brandEn: "MACHINOWA",
  brandSub: "街の輪",
  tagline: ["街の“いいお店”、", "ぜんぶここに。"],
  subtitle:
    "全国の飲食店を、エリア・業種・特集で巡れる食のポータル。食べたい気分から、お店が見つかります。",
  heroImages: [
    "https://images.unsplash.com/photo-1554797589-7241bb691973?w=1600&q=80",
    "https://images.unsplash.com/photo-1752135534175-44aa59a1bb50?w=1600&q=80",
    "https://images.unsplash.com/photo-1528164344705-47542687000d?w=1600&q=80",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=80",
  ],
};

export const REGIONS: Record<RegionKey, Region> = {
  tokyo: {
    name: "東京",
    nameEn: "Tokyo",
    tagline: "都会の路地裏、暖簾の先",
    subtitle: "都心から下町まで ――― 街の数だけ、味がある。",
    intro:
      "ビジネス街の裏路地、住宅地の角、駅から少し歩いた所。東京の名店は、地図に載らない場所にもひっそりと灯っている。",
    heroImages: [
      "https://images.unsplash.com/photo-1554797589-7241bb691973?w=1600&q=80",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=80",
    ],
    stats: [],
  },
  yokohama: {
    name: "横浜",
    nameEn: "Yokohama",
    tagline: "港の街、商店街の灯り",
    subtitle: "六角橋、白楽、関内 ――― 港町の懐かしさと、新しさ。",
    intro:
      "東京の喧騒から少し離れた、港町のリズム。商店街の昭和の風情と、若い店主の新しい料理が同居する街。",
    heroImages: [
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1600&q=80",
    ],
    stats: [],
  },
};

const RES_GALLERY_FALLBACK = [
  "https://images.unsplash.com/photo-1532634726-8b9fb99825af?w=1200&q=80",
  "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=1200&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80",
];

export const RESTAURANTS: Restaurant[] = [
  {
    id: "r01",
    name: "やきとり嶋家",
    cuisine: "焼鳥",
    area: "南麻布",
    region: "tokyo",
    shape: "wide",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "白金高輪駅から徒歩5分、南麻布の路地に佇む焼鳥店。オリジナル熊野地鶏を熟成専用冷蔵庫で寝かせた一串が看板。半個室・テラス席を備え、ペット同伴可の貴重な一軒。",
    address: "東京都港区南麻布2-7-25 ストーク麻布1F",
    hours: "火-土 16:30 - 23:00（L.O. 22:00） / 日月 16:30 - 22:00（L.O. 21:00）",
    closed: "不定休",
    seats: "カウンター・テーブル / 2階貸切可・テラス席有",
    nearest: "東京メトロ南北線・都営三田線 白金高輪駅 徒歩5分",
    reservationUrl: "https://www.tablecheck.com/ja/shimaya315/reserve/landing",
    source: { label: "公式サイト", url: "http://www.shimaya315.com/" },
  },
  {
    id: "r02",
    name: "キツネノアトチ",
    cuisine: "イタリアン / ワイン食堂",
    area: "六角橋",
    region: "yokohama",
    shape: "tall",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "白楽駅から徒歩4分、六角橋商店街「ふれあい通り」の昭和な路地に2024年オープン。オーナー・ミクさんによる丁寧な一皿と、料理に合わせて選ばれたワイン・ハイボール・日本酒が揃うワイン食堂。一人飲みから個室利用まで対応。",
    address: "神奈川県横浜市神奈川区六角橋1-10-11",
    hours: "月火木金 17:00 - 翌0:00 / 土日 12:00 - 翌0:00（料理L.O. 22:30 / ドリンクL.O. 23:00）",
    closed: "水曜（不定休あり）",
    seats: "20席 / 個室有",
    nearest: "東急東横線 白楽駅 徒歩4分",
    reservationUrl: "https://www.hotpepper.jp/strJ003715487/yoyaku/",
    source: {
      label: "ホットペッパーグルメ",
      url: "https://www.hotpepper.jp/strJ003715487/",
    },
  },
];

export const NEIGHBORHOODS: Neighborhood[] = [];

export const FEATURES: Feature[] = [];

export const FEATURE_ARTICLES: Record<string, FeatureArticle> = {};

export const SHORT_VIDEOS: ShortVideo[] = [];

/* ===================================================== */
/* Computed stats (derived from real data)              */
/* ===================================================== */

function avg(nums: number[]): string {
  const valid = nums.filter((n) => !Number.isNaN(n));
  if (valid.length === 0) return "—";
  const m = valid.reduce((a, b) => a + b, 0) / valid.length;
  return m.toFixed(1);
}

export function getNationalStats(): Stat[] {
  const ratings = RESTAURANTS.map((r) =>
    r.rating ? parseFloat(r.rating) : NaN
  );
  const prefectures = new Set(Object.keys(REGIONS));
  return [
    { n: String(RESTAURANTS.length), l: "掲載店舗" },
    { n: String(prefectures.size), l: "対応地域" },
    { n: String(FEATURES.length), l: "特集記事" },
    { n: avg(ratings), l: "平均評価" },
  ];
}

export function getRegionStats(key: RegionKey): Stat[] {
  const local = RESTAURANTS.filter((r) => r.region === key);
  const ratings = local.map((r) => (r.rating ? parseFloat(r.rating) : NaN));
  const areas = new Set(local.map((r) => r.area));
  return [
    { n: String(local.length), l: "登録店舗" },
    { n: String(areas.size), l: "エリア" },
    { n: String(FEATURES.length), l: "特集記事" },
    { n: avg(ratings), l: "平均評価" },
  ];
}
