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
  body?: string[];
  highlights?: string[];
  tags?: string[];
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
  videoUrl?: string;
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
    name: "やきとり嶋家 南麻布",
    cuisine: "焼鳥",
    area: "南麻布",
    region: "tokyo",
    shape: "wide",
    image: "/restaurants/yakitori-shimaya-hero.webp",
    gallery: [
      "/restaurants/yakitori-shimaya-hero.webp",
      "/restaurants/yakitori-shimaya-table.jpg",
      "/restaurants/yakitori-shimaya-skewers.jpg",
      "/restaurants/yakitori-shimaya-2.jpg",
      "/restaurants/yakitori-shimaya-3.jpg",
      "/restaurants/yakitori-shimaya-4.jpg",
      "/restaurants/yakitori-shimaya-food.jpg",
    ],
    desc: "白金高輪駅から徒歩5分、南麻布の路地に佇む焼鳥店。オリジナル熊野地鶏を熟成専用冷蔵庫で寝かせた一串が看板。半個室・テラス席を備え、ペット同伴可の貴重な一軒。",
    address: "東京都港区南麻布2-7-25 ストーク麻布1F",
    hours: "火-土 16:30 - 23:00（L.O. 22:00） / 日月 16:30 - 22:00（L.O. 21:00）",
    closed: "不定休",
    seats: "カウンター・テーブル / 2階貸切可・テラス席有",
    nearest: "東京メトロ南北線・都営三田線 白金高輪駅 徒歩5分",
    reservationUrl: "https://www.tablecheck.com/ja/shimaya315/reserve/landing",
    source: { label: "公式サイト", url: "http://www.shimaya315.com/" },
    tags: ["焼鳥", "熊野地鶏", "個室", "テラス席", "ペット可", "デート", "接待"],
    highlights: [
      "オリジナル熊野地鶏 × 熟成鶏",
      "半個室・テラス席・ペット同伴可",
      "2階フロア貸切可（最大規模応相談）",
    ],
    body: [
      "白金高輪駅から、麻布十番方面へ向かう坂道。喧噪から一本入った南麻布の路地に、暖簾を出す一軒がある。「やきとり嶋家」。看板の控えめさに反して、扉を開ければ、香ばしい煙が時間を一段ゆっくりにする。",
      "看板はあくまで一串。オリジナルの「熊野地鶏」を、自家製の熟成鶏専用冷蔵庫で寝かせ、旨味を引き出してから備長炭の上へ。鶏本来の弾力に、熟成によるコクと甘みが重なる、嶋家の真骨頂が一串に詰まっている。",
      "席種は、職人の所作を間近で見られるカウンターから、グループで囲めるテーブル、そして特別感のある半個室まで。テラス席はペット同伴も可で、犬連れで気軽に立ち寄れる焼鳥店は港区でも貴重だ。2階はワンフロア貸切が可能で、会食や接待にも幅広く応える。",
      "焼鳥店としての矜持と、現代的な使い勝手の良さ。その両方を一軒の中に成立させているのが、嶋家の在り方である。",
    ],
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
    tags: ["イタリアン", "ワイン食堂", "個室", "一人飲み", "デート", "禁煙"],
    highlights: [
      "2024年1月オープン、白楽の新しいワイン食堂",
      "国産牛の温製カルパッチョなど、皿ごとに丁寧な仕事",
      "ワイン以外（ハイボール・日本酒）の品揃えも豊富",
    ],
    body: [
      "東急東横線・白楽駅の改札を抜け、商店街「ふれあい通り」を歩いていくと、屋根のついた裏路地が現れる。昭和の高架下のような薄明かり。その路地の中に、看板を控えめに掲げた一軒が「キツネノアトチ」だ。2024年1月、横浜の街にひっそりと加わったワイン食堂である。",
      "店主はミクさん。皿の上には、国産牛の温製カルパッチョ、季節野菜のひと工夫、自家製の前菜。一皿一皿に、確かな仕込みの跡が残る。派手さで魅せる店ではなく、ひと口ごとに「ふふふ」と頬がゆるむ、そういう料理を出す店だ。",
      "「ワイン食堂」の看板を掲げてはいるが、品揃えはワインに留まらない。料理に合わせて選ばれたハイボール、ホットラム、季節の日本酒まで網羅。ボトル一本に縛られず、一杯ずつ違う表情を楽しめる。",
      "20席、個室あり、全席禁煙、Wi-Fi完備。一人で静かに飲むも良し、仲間と個室を取って語らうも良し。商店街の路地裏という立地が、店の懐の深さをそのまま映している。",
    ],
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
