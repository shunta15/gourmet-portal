// Light types and constants for client components
// Extracted from lib/data.ts to reduce bundle size

export type Stat = { n: string; l: string };

export type RegionKey =
  | "tokyo"
  | "osaka"
  | "nagoya"
  | "fukuoka"
  | "shizuoka"
  | "kanagawa"
  | "saitama"
  | "kyoto"
  | "nara"
  | "hyogo"
  | "hiroshima"
  | "gunma"
  | "shiga"
  | "kagoshima"
  | "wakayama"
  | "hokkaido";

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
  heroImages?: string[];
  gallery: string[];
  desc: string;
  address: string;
  hours: string;
  closed: string;
  seats: string;
  budget?: string;
  nearest: string;
  reservationUrl?: string;
  phone?: string;
  instagram?: string;
  source?: { label: string; url: string };
  body?: string[];
  highlights?: string[];
  tags?: string[];
  googleRating?: number;
  googleReviewCount?: number;
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
  href?: string;
  time?: string;
  purpose?: string;
  transit?: string;
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
  // OGP/Twitter Card 用の上書き画像。指定がなければ heroImage を使用。
  // 例: hero がプレースホルダのドラフトでも、SNS シェア時には別の画像を見せたい場合に。
  ogImage?: string;
  ranking: RankItem[];
  sideArticles: { t: string; h: string; img: string }[];
  quote: string;
  quoteCite: string;
  closing: string;
  articleType?: "ranking" | "course" | "guide";
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
  url?: string;
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
      // 東京の路地夜景
      "https://images.unsplash.com/photo-1573455494060-c5595004fb6c?w=1600&q=85",
      // 新宿の赤提灯と歩行者
      "https://images.unsplash.com/photo-1596713109885-c94bdfd7f19d?w=1600&q=85",
    ],
    stats: [],
  },
  osaka: {
    name: "大阪",
    nameEn: "Osaka",
    tagline: "食い倒れ、夜更かし",
    subtitle: "天六、福島、ミナミ、キタ ――― 笑って、食べて、また明日。",
    intro:
      "通りごとに表情を変える街。京阪神の食材が日常的に集まり、隠れ家から路面店まで、夜の選択肢が尽きない。",
    heroImages: [
      // 道頓堀川と街並み（Laura Barry, Dotonbori Osaka）
      "https://images.unsplash.com/photo-1734427842844-29f08e51763a?w=1600&q=85",
      // 通天閣・新世界の看板（Kiko K, Dotonbori Osaka）
      "https://images.unsplash.com/photo-1713925104998-efe9fefec0bf?w=1600&q=85",
    ],
    stats: [],
  },
  nagoya: {
    name: "名古屋",
    nameEn: "Nagoya",
    tagline: "中京の夜、味噌の匂い",
    subtitle: "栄、伏見、金山、南区 ――― 名古屋メシと、町場のイタリアン。",
    intro:
      "味噌煮込みやひつまぶしだけの街じゃない。商店街の角に灯る町場のイタリアン、住宅地に佇む居酒屋。中京エリアの夜は、想像より懐が広い。",
    heroImages: [
      // 名古屋駅前夜景
      "https://images.unsplash.com/photo-1627045529601-087483c43dde?w=1600&q=85",
      // 名古屋テレビ塔と栄の夜
      "https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?w=1600&q=85",
    ],
    stats: [],
  },
  fukuoka: {
    name: "福岡",
    nameEn: "Fukuoka",
    tagline: "屋台の灯、博多の夜",
    subtitle: "中洲、博多、長浜 ――― 一杯の屋台から、一夜の路地まで。",
    intro:
      "ラーメンや焼き鳥、もつ鍋だけが福岡じゃない。長浜の鮮魚、博多の駅前、中洲の路地裏 ――― 夜の選択肢が尽きない街。",
    heroImages: [
      // 日本の街角・もんじゃ店構え
      "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1600&q=85",
      // 路地裏の赤提灯
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=85",
    ],
    stats: [],
  },
  shizuoka: {
    name: "静岡",
    nameEn: "Shizuoka",
    tagline: "海と山、温泉と。",
    subtitle: "伊豆、熱海、富士山麓 ――― 風土に寄り添う一軒が、点在する。",
    intro:
      "海と山と温泉と、自然が日常の隣にある県。観光地の裏路地で、地元客と旅人が同じカウンターに並ぶ ――― 風通しのいい空気が、静岡の食の根。",
    heroImages: [
      // 富士山と桜
      "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1600&q=85",
      // 桜のクローズアップ
      "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1600&q=85",
    ],
    stats: [],
  },
  kanagawa: {
    name: "神奈川",
    nameEn: "Kanagawa",
    tagline: "港の灯り、湖畔の珈琲",
    subtitle: "港町、相模原、湘南、川崎 ――― 海沿いから丘の上の一軒まで。",
    intro:
      "商店街の昭和の風情が残る港町、湖と丘が近い相模原、海沿いの街。神奈川には、都市と自然が同居する場所ごとに、時間の使い方まで変えてくれる一軒が点在する。",
    heroImages: [
      // 横浜の夜景（Akinori UEMURA, Yokohama）
      "https://images.unsplash.com/photo-1541850126775-f2839ffe3970?w=1600&q=85",
      // 箱根芦ノ湖の鳥居
      "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1600&q=85",
    ],
    stats: [],
  },
  saitama: {
    name: "埼玉",
    nameEn: "Saitama",
    tagline: "県都の駅前、宿場の路地",
    subtitle: "大宮、浦和、川越 ――― 通勤圏の日常使いから、宿場町の風情まで。",
    intro:
      "東京のすぐ北。県都・大宮の駅前から浦和の文教エリア、蔵づくりの川越まで ――― 都心通勤圏の日常使いに応える一軒と、地元の歴史を継ぐ一軒が点在する。",
    heroImages: [
      "https://images.unsplash.com/photo-1554797589-7241bb691973?w=1600&q=85",
      "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1600&q=85",
    ],
    stats: [],
  },
  kyoto: {
    name: "京都",
    nameEn: "Kyoto",
    tagline: "千年の都の食文化",
    subtitle: "河原町、西院、桂、山科 ――― 路地裏の名店が今も息づく古都の食卓。",
    intro:
      "千年の都・京都。繁華街の河原町から西院、桂、山科まで ――― 地元に愛される居酒屋、バル、イタリアン、炭火焼きが路地裏に息づく。観光地だけではない、京都人の食の日常がここにある。",
    heroImages: [
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1600&q=85",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=85",
    ],
    stats: [],
  },
  nara: {
    name: "奈良",
    nameEn: "Nara",
    tagline: "古都の路地と川沿いのひとやすみ",
    subtitle: "近鉄奈良駅から少し歩けば、川沿いの静かな一軒が待っている。",
    intro:
      "世界遺産の古都・奈良。近鉄奈良駅から徒歩圏に広がる佐保川沿いや路地裏には、観光の喧騒とは一線を画すカフェや食事処が点在する。",
    heroImages: [
      "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1600&q=85",
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=85",
    ],
    stats: [],
  },
  hyogo: {
    name: "神戸・兵庫",
    nameEn: "Hyogo",
    tagline: "港町の食、山手の一軒",
    subtitle: "三宮、元町、垂水、長田 ――― 異国情緒と地元の温もりが交差する。",
    intro:
      "海と山に挟まれた港町・神戸。異人館が並ぶ山手から漁港に近い長田まで、ベトナム料理、日本料理、イタリアン、食堂が軒を連ねる。神戸ならではの食の多様性が、街歩きを楽しくする。",
    heroImages: [
      "https://images.unsplash.com/photo-1557409518-691ebcd96038?w=1600&q=85",
      "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1600&q=85",
    ],
    stats: [],
  },
  hiroshima: {
    name: "広島",
    nameEn: "Hiroshima",
    tagline: "牡蠣と尾道、夜の流川",
    subtitle: "中区、南区、安佐南区 ――― 深夜ラーメンから炭火焼鳥まで。",
    intro:
      "広島市内の流川・薬研堀の夜の賑わい、宇品・南区の住宅地に佇む鶏白湯の一杯、安佐南区の炭焼き鳥。尾道系ラーメンや牡蠣だけではない、広島の食の厚みがここにある。",
    heroImages: [
      "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=1600&q=85",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=85",
    ],
    stats: [],
  },
  gunma: {
    name: "群馬",
    nameEn: "Gunma",
    tagline: "温泉と山里、渋川の食",
    subtitle: "渋川・前橋・高崎 ――― 草津温泉の麓から関越沿いの街まで。",
    intro:
      "四方を山に囲まれた群馬県。温泉地として名高い草津・伊香保の麓から、渋川・高崎・前橋の市街地まで ――― 地元の人たちが通い続ける、肩の力が抜けた一軒が点在する。",
    heroImages: [
      "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1600&q=85",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=85",
    ],
    stats: [],
  },
  shiga: {
    name: "滋賀",
    nameEn: "Shiga",
    tagline: "琵琶湖のほとり、近江の食",
    subtitle: "日野・草津・彦根 ――― 日本最大の湖が育む穏やかな里の味。",
    intro:
      "琵琶湖を中心に広がる近江の国・滋賀県。山と水に恵まれた里山には、旬の食材を活かした素朴でまっすぐな一軒が点在する。温泉地・信楽・日野の歴史ある街並みを訪ねながら、湖国の食文化に触れてほしい。",
    heroImages: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=85",
    ],
    stats: [],
  },
  kagoshima: {
    name: "鹿児島",
    nameEn: "Kagoshima",
    tagline: "薩摩の食と焼酎文化",
    subtitle: "薩摩・さつま町・鹿児島市 ――― 桜島を望む南九州の食どころ。",
    intro:
      "南九州の雄・鹿児島県。薩摩芋、黒豚、地鶏、そして日本屈指の焼酎文化。山あいの集落から鹿児島市街まで、大地の恵みを豪快に楽しめる食の聖地が点在する。",
    heroImages: [
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1600&q=85",
      "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1600&q=85",
    ],
    stats: [],
  },
  wakayama: {
    name: "和歌山",
    nameEn: "Wakayama",
    tagline: "熊野の自然と紀州の食",
    subtitle: "那智勝浦・熊野 ――― 世界遺産の森が守る海の幸と山の恵み。",
    intro:
      "南紀・熊野古道が走る和歌山県。太平洋に面した豊かな漁場から水揚げされる海の幸と、紀州みかん・梅など山の恵みが織りなす食文化が息づく。自然と歴史が共存するこの地で、素材の力が光る料理に出会える。",
    heroImages: [
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1600&q=85",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=85",
    ],
    stats: [],
  },
  hokkaido: {
    name: "北海道",
    nameEn: "Hokkaido",
    tagline: "大地の恵みと食の王国",
    subtitle: "札幌・当別 ――― 広大な大地が育む、日本最大の食の宝庫。",
    intro:
      "日本最大の島・北海道。広大な農地、冷涼な漁場、豊かな酪農文化が生み出す食材の豊かさは国内随一。札幌を中心に独自のラーメン・海鮮・スープカレー文化が根付き、個性あふれる名店が点在する。",
    heroImages: [
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=1600&q=85",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=85",
    ],
    stats: [],
  },
};


export const NEIGHBORHOODS: Neighborhood[] = [];

export const SHORT_VIDEOS: ShortVideo[] = [
  {
    id: "sv-nazatu-1",
    restaurantId: "",
    url: "/nazatu",
    thumbnail: "/videos/nazatu/1-1_thumb.jpg",
    title: "ナーザトゥ #1",
    cuisineEmoji: "",
    cuisineLabel: "エスニック",
    duration: "0:30",
    likes: "-",
    comments: "-",
    saves: "-",
    videoUrl: "/videos/nazatu/1-1.mp4",
  },
  {
    id: "sv-nazatu-2",
    restaurantId: "",
    url: "/nazatu",
    thumbnail: "/videos/nazatu/1-2_thumb.jpg",
    title: "ナーザトゥ #2",
    cuisineEmoji: "",
    cuisineLabel: "エスニック",
    duration: "0:30",
    likes: "-",
    comments: "-",
    saves: "-",
    videoUrl: "/videos/nazatu/1-2.mp4",
  },
  {
    id: "sv-nazatu-3",
    restaurantId: "",
    url: "/nazatu",
    thumbnail: "/videos/nazatu/3-2_thumb.jpg",
    title: "ナーザトゥ #3",
    cuisineEmoji: "",
    cuisineLabel: "エスニック",
    duration: "0:30",
    likes: "-",
    comments: "-",
    saves: "-",
    videoUrl: "/videos/nazatu/3-2.mp4",
  },
  {
    id: "sv-nazatu-review",
    restaurantId: "",
    url: "/nazatu",
    thumbnail: "/videos/nazatu/review_thumb.jpg",
    title: "さーらー感想",
    cuisineEmoji: "",
    cuisineLabel: "エスニック",
    duration: "0:30",
    likes: "-",
    comments: "-",
    saves: "-",
    videoUrl: "/videos/nazatu/review.mp4",
  },
  {
    id: "sv-nazatu-photo",
    restaurantId: "",
    url: "/nazatu",
    thumbnail: "/videos/nazatu/photo_thumb.jpg",
    title: "写真を撮る",
    cuisineEmoji: "",
    cuisineLabel: "エスニック",
    duration: "0:30",
    likes: "-",
    comments: "-",
    saves: "-",
    videoUrl: "/videos/nazatu/photo.mp4",
  },
];

// ============================================
// Lean prop types for client components
// ============================================

// RestaurantCardItem: minimal fields for RestaurantCard, used by grids/lists
export type RestaurantCardItem = Pick<
  Restaurant,
  "id" | "name" | "cuisine" | "area" | "region" | "shape" | "image" | "googleRating" | "rating"
>;

// SearchItem: fields needed for search filtering + card display
export type SearchItem = Pick<
  Restaurant,
  "id" | "name" | "cuisine" | "area" | "region" | "address" | "desc" | "tags" | "shape" | "image" | "googleRating" | "rating"
>;

// Helpers to convert full Restaurant to lean types
export function toCardItem(r: Restaurant): RestaurantCardItem {
  return {
    id: r.id,
    name: r.name,
    cuisine: r.cuisine,
    area: r.area,
    region: r.region,
    shape: r.shape,
    image: r.image,
    googleRating: r.googleRating,
    rating: r.rating,
  };
}

export function toSearchItem(r: Restaurant): SearchItem {
  return {
    id: r.id,
    name: r.name,
    cuisine: r.cuisine,
    area: r.area,
    region: r.region,
    address: r.address,
    desc: r.desc,
    tags: r.tags,
    shape: r.shape,
    image: r.image,
    googleRating: r.googleRating,
    rating: r.rating,
  };
}
