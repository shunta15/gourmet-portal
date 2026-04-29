export type Stat = { n: string; l: string };

export type RegionKey = "tokyo" | "yokohama" | "osaka";

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
      // 東京の路地夜景
      "https://images.unsplash.com/photo-1573455494060-c5595004fb6c?w=1600&q=85",
      // 新宿の赤提灯と歩行者
      "https://images.unsplash.com/photo-1596713109885-c94bdfd7f19d?w=1600&q=85",
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
      // 横浜の夜景（Akinori UEMURA, Yokohama）
      "https://images.unsplash.com/photo-1541850126775-f2839ffe3970?w=1600&q=85",
      // 横浜・コスモワールド観覧車
      "https://images.unsplash.com/photo-1753596119761-d3ff23ef19f2?w=1600&q=85",
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
    image: "/restaurants/yakitori-shimaya-hero.webp",
    heroImages: [
      "/restaurants/yakitori-shimaya-hero.webp",
      "/restaurants/yakitori-shimaya-table.jpg",
      "/restaurants/yakitori-shimaya-2.jpg",
      "/restaurants/yakitori-shimaya-3.jpg",
    ],
    gallery: [
      "/restaurants/yakitori-shimaya-hero.webp",
      "/restaurants/yakitori-shimaya-table.jpg",
      "/restaurants/yakitori-shimaya-skewer-wasabi.jpg",
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
    tags: ["焼鳥", "個室", "テラス席", "ペット可", "デート", "接待"],
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
    image: "/restaurants/kitsune-storefront-night.jpg",
    heroImages: [
      "/restaurants/kitsune-storefront-night.jpg",
      "/restaurants/kitsune-alley.webp",
      "/restaurants/kitsune-counter.jpg",
      "/restaurants/kitsune-glasses.jpg",
    ],
    gallery: [
      "/restaurants/kitsune-storefront-night.jpg",
      "/restaurants/kitsune-alley.webp",
      "/restaurants/kitsune-entrance.webp",
      "/restaurants/kitsune-sign.jpg",
      "/restaurants/kitsune-counter.jpg",
      "/restaurants/kitsune-glasses.jpg",
      "/restaurants/kitsune-tatami.jpg",
      "/restaurants/kitsune-owners.jpg",
      "/restaurants/kitsune-chef.jpg",
      "/restaurants/kitsune-antipasto.jpg",
      "/restaurants/kitsune-antipasto-2.jpg",
      "/restaurants/kitsune-mushroom.jpg",
    ],
    desc: "白楽駅から徒歩4分、六角橋商店街「ふれあい通り」の中央に佇む、姉妹で営むワイン食堂。前身「葡萄とキツネ」を引き継ぎ2024年1月開業。旬を活かした料理と、ライトから重厚まで揃うワイン、クラフトビールの品揃えに、街の常連や近隣のプロ料理人まで通う一軒。",
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
    tags: ["イタリアン", "ワイン食堂", "クラフトビール", "個室", "一人飲み", "女子会", "デート"],
    highlights: [
      "2024年1月オープン、白楽の新しいワイン食堂",
      "国産牛の温製カルパッチョなど、皿ごとに丁寧な仕事",
      "ワイン以外（ハイボール・日本酒）の品揃えも豊富",
    ],
    body: [
      "東急東横線・白楽駅。改札を抜けてすぐ、レトロなアーケードが続く六角橋商店街「ふれあい通り」。昭和の面影を残す路地の中央付近、白を基調にしたあたたかな店内が現れる。あちらこちらに散りばめられたキツネのモチーフが、店主姉妹の人柄を物語る、ここが「キツネノアトチ」だ。",
      "店を切り盛りするのは、姉のミクさんと妹のレンさん。前身は同じ場所で営まれていた「葡萄とキツネ」。新潟へ旅立つことになった先代が、二人の腕を見込んで託した店を、2024年1月、姉妹は新しい屋号で受け継いだ。料理は姉ミクさん、接客とスイーツは妹レンさん。「人間関係を大切に」というふたりの姿勢は、皿の隅にも、注がれる一杯にも滲む。",
      "看板に「お任せ前菜盛り合わせ」あり。「あれもこれも食べて欲しいから、気がつくとたくさん盛っちゃう」とミクさん。国産牛の温製カルパッチョや季節野菜の一皿は、酒の肴としても料理単品としても成立する完成度。季節ごとに更新されるスペシャルメニューでは、旬の食材を「最高においしいかたちで」表現する仕事ぶりだ。",
      "ワインは、ライトから重厚まで幅広く。初心者でも玄人でも、その日の気分や料理に合うものを姉妹が一緒に選んでくれる。ビールも見逃せない――レンさんが注ぐ一杯は、同じ銘柄でも別物の表情を見せる。山梨「うちゅうブルーイング」のDDH IPAなど、商店街では随一のクラフトビール品揃えも自慢。",
      "金曜は人気ベーカリー panopiedra のパンが入荷、土曜はランチ営業、日曜にはカレー屋が間貸し――商店街の中継地点のように、一週間がリズムを持って動く。1人飲み、女子会、デート、近隣のプロ料理人の打ち上げまで客層は柔らかく多様。「イタリアみたいに、お通しとワイン1、2杯でも気軽に立ち寄って欲しい」――そう語るオーナーの想いそのままの、街の食堂である。",
    ],
  },
  {
    id: "r03",
    name: "鶏居酒屋pao福",
    cuisine: "鶏居酒屋",
    area: "天神橋筋六丁目",
    region: "osaka",
    shape: "wide",
    image: "/restaurants/paofuku-interior-wide.jpg",
    heroImages: [
      "/restaurants/paofuku-interior-wide.jpg",
      "/restaurants/paofuku-storefront.jpg",
      "/restaurants/paofuku-spread.jpg",
      "/restaurants/paofuku-chicken-nanban.jpg",
    ],
    gallery: [
      "/restaurants/paofuku-interior-wide.jpg",
      "/restaurants/paofuku-storefront.jpg",
      "/restaurants/paofuku-private-room.jpg",
      "/restaurants/paofuku-private-room-2.jpg",
      "/restaurants/paofuku-spread.jpg",
      "/restaurants/paofuku-chicken-nanban.jpg",
      "/restaurants/paofuku-chicken-nanban-2.jpg",
      "/restaurants/paofuku-tori-sashi.jpg",
      "/restaurants/paofuku-tsukune.jpg",
      "/restaurants/paofuku-yakitori.jpg",
      "/restaurants/paofuku-chicken-salad.jpg",
      "/restaurants/paofuku-liver-sashi.jpg",
      "/restaurants/paofuku-bottles.jpg",
      "/restaurants/paofuku-highball.jpg",
    ],
    desc: "天神橋筋六丁目駅から徒歩6分、本庄東の住宅街に佇む鶏料理専門の居酒屋。京赤地鶏を使った鶏刺し・つくね・看板のチキン南蛮フライまで、鶏一筋のメニューが揃う。50席・最大50名貸切可、個室2室を備え、一人飲みから宴会まで応える一軒。",
    address: "大阪府大阪市北区本庄東2-11-10",
    hours: "月-日・祝・祝前 17:00 - 23:00（料理L.O. 22:00 / ドリンクL.O. 22:30）",
    closed: "不定休",
    seats: "50席 / 個室2室（24名・8名）/ 貸切24-50名対応",
    nearest: "大阪メトロ堺筋線・谷町線・阪急千里線 天神橋筋六丁目駅 11番出口 徒歩6分",
    reservationUrl: "https://www.hotpepper.jp/strJ003474513/",
    source: { label: "公式サイト", url: "https://paofuku.com/" },
    tags: ["鶏料理", "居酒屋", "京赤地鶏", "個室", "貸切可", "一人飲み", "宴会"],
    body: [
      "大阪メトロ堺筋線・谷町線・阪急千里線が交差する天神橋筋六丁目。にぎやかな商店街を抜け、本庄東の住宅街へ歩いていくと、木目の格子と「pao福」の看板を掲げた一軒に行き着く。鶏料理一筋の居酒屋「鶏居酒屋pao福」だ。",
      "扱うのは京赤地鶏。国産地鶏の中でも肉質と旨味で知られるブランド鶏を、刺し・焼き・揚げの三本柱で味わわせる。看板は「チキン南蛮フライ」。サクッとした衣にたっぷりのタルタルが乗る一皿は、人気No.1の理由を口に運んだ瞬間に納得させる。鶏刺し四種盛り、肝刺し、自家製つくね三種、よだれ鶏 ――― どれをとっても鶏の輪郭がくっきりと出る。",
      "店内は黄色い壁と黒いカーテンが効いた、明るく開けた空間。50席の中に個室が二部屋（最大24名・8名）あり、グループ利用にも対応する。一人で来てもカウンターでサクッと、宴会なら個室でじっくり、貸切なら最大50名まで――シーンを選ばない懐の深さが魅力だ。",
      "ドリンクは生ビール、ハイボール（黄色い壁を背にしたサーバーが目を引く）、焼酎、日本酒、リキュール各種と、鶏料理に合わせやすいラインナップ。平均予算は通常3,500円、宴会コースで4,500円。住宅街の隠れ家ながら、地元客から会社帰りのグループまで連夜にぎわう、天六で押さえておきたい鶏の一軒だ。",
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
