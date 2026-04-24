export type Stat = { n: string; l: string };

export type Region = {
  name: string;
  nameEn: string;
  tagline: string;
  subtitle: string;
  heroImages: string[];
  stats: Stat[];
};

export type RegionKey = "shitamachi" | "kyoto" | "osaka" | "hakata" | "sapporo";

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
  id: number;
  name: string;
  cuisine: string;
  area: string;
  price: string;
  rating: string;
  shape: "wide" | "tall" | "square";
  image: string;
};

export type Neighborhood = {
  no: string;
  name: string;
  alt: string;
  desc: string;
  count: string;
  image: string;
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
  no: string;
  kicker: string;
  title: string;
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
};

export const NATIONAL = {
  brand: "味処 日本",
  brandEn: "AJIDOKORO NIPPON",
  tagline: ["街の\u201cいいお店\u201d、", "ぜんぶここに。"],
  subtitle:
    "全国47都道府県、編集部が一軒ずつ足を運んで取材した飲食店だけを掲載。",
  stats: [
    { n: "1,861", l: "全国掲載店舗" },
    { n: "47", l: "都道府県" },
    { n: "352", l: "特集記事" },
    { n: "4.8", l: "平均評価" },
  ] as Stat[],
  heroImages: [
    "https://images.unsplash.com/photo-1554797589-7241bb691973?w=1600&q=80",
    "https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=1600&q=80",
    "https://images.unsplash.com/photo-1528164344705-47542687000d?w=1600&q=80",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=80",
  ],
};

export const REGIONS: Record<RegionKey, Region> = {
  shitamachi: {
    name: "東京・下町",
    nameEn: "Tokyo Shitamachi",
    tagline: "路地の奥、暖簾の先",
    subtitle: "谷根千、浅草、月島、人形町 ――― 路地裏に灯る名店たち。",
    heroImages: [
      "https://images.unsplash.com/photo-1554797589-7241bb691973?w=1600&q=80",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=80",
      "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=1600&q=80",
    ],
    stats: [
      { n: "384", l: "登録店舗" },
      { n: "12", l: "エリア" },
      { n: "96", l: "特集記事" },
      { n: "4.8", l: "平均評価" },
    ],
  },
  kyoto: {
    name: "京都",
    nameEn: "Kyoto",
    tagline: "千年の味、路地に香る",
    subtitle: "先斗町、祇園、西陣 ――― 石畳の奥に、今宵の一皿。",
    heroImages: [
      "https://images.unsplash.com/photo-1528164344705-47542687000d?w=1600&q=80",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&q=80",
      "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=1600&q=80",
    ],
    stats: [
      { n: "421", l: "登録店舗" },
      { n: "9", l: "エリア" },
      { n: "72", l: "特集記事" },
      { n: "4.9", l: "平均評価" },
    ],
  },
  osaka: {
    name: "大阪・ミナミ",
    nameEn: "Osaka Minami",
    tagline: "食い倒れ、夜通し",
    subtitle: "難波、道頓堀、新世界 ――― 笑って食べて、また明日。",
    heroImages: [
      "https://images.unsplash.com/photo-1554797589-7241bb691973?w=1600&q=80",
      "https://images.unsplash.com/photo-1535924206242-349b8be23e80?w=1600&q=80",
      "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=1600&q=80",
    ],
    stats: [
      { n: "512", l: "登録店舗" },
      { n: "8", l: "エリア" },
      { n: "88", l: "特集記事" },
      { n: "4.7", l: "平均評価" },
    ],
  },
  hakata: {
    name: "福岡・博多",
    nameEn: "Hakata",
    tagline: "屋台の湯気、夜風に乗る",
    subtitle: "中洲、天神、長浜 ――― 鐘の音響く、博多の夜。",
    heroImages: [
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1600&q=80",
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=1600&q=80",
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1600&q=80",
    ],
    stats: [
      { n: "296", l: "登録店舗" },
      { n: "6", l: "エリア" },
      { n: "54", l: "特集記事" },
      { n: "4.8", l: "平均評価" },
    ],
  },
  sapporo: {
    name: "北海道・札幌",
    nameEn: "Sapporo",
    tagline: "雪の夜に、炉端の炎",
    subtitle: "すすきの、円山 ――― 寒い夜ほど、旨くなる。",
    heroImages: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=80",
      "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=1600&q=80",
      "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=1600&q=80",
    ],
    stats: [
      { n: "248", l: "登録店舗" },
      { n: "5", l: "エリア" },
      { n: "42", l: "特集記事" },
      { n: "4.8", l: "平均評価" },
    ],
  },
};

export const FEATURES: Feature[] = [
  {
    id: "f01",
    no: "01",
    tag: "旅特集",
    kicker: "TRAVEL EDITION",
    title: "旅の夜は、ここの焼肉へ",
    sub: "浅草から月島まで。出張者も観光客も唸る、下町の炎を巡る五軒。",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1400&q=80",
  },
  {
    id: "f02",
    no: "02",
    tag: "ランキング",
    kicker: "BEST FIVE",
    title: "下町焼肉、五選",
    sub: "ミシュラン常連から町場の名店まで。編集部が選ぶ、間違いない五軒。",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1400&q=80",
  },
  {
    id: "f03",
    no: "03",
    tag: "季節特集",
    kicker: "SEASONAL",
    title: "春の和食、桜のように",
    sub: "根津の割烹、谷中の蕎麦、千住の鮨。季節を一皿に収める名匠たち。",
    image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=1400&q=80",
  },
  {
    id: "f04",
    no: "04",
    tag: "裏路地",
    kicker: "HIDDEN GEMS",
    title: "路地の奥、暖簾の先",
    sub: "看板もなく、案内もなく。それでも人が絶えない、隠れ家八軒。",
    image: "https://images.unsplash.com/photo-1576867757603-05b134ebc379?w=1400&q=80",
  },
  {
    id: "f05",
    no: "05",
    tag: "ナイトガイド",
    kicker: "AFTER HOURS",
    title: "二軒目、三軒目、四軒目",
    sub: "深夜0時からが本番。下町の夜を朝まで味わう、編集部の動線。",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1400&q=80",
  },
];

export const RESTAURANTS: Restaurant[] = [
  { id: 1, name: "炭火焼 蔵之介", cuisine: "YAKINIKU / 焼肉", area: "浅草", price: "¥¥¥¥", rating: "4.9", shape: "wide", image: "https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=80" },
  { id: 2, name: "割烹 ひさご", cuisine: "KAPPO / 割烹", area: "根津", price: "¥¥¥¥¥", rating: "4.8", shape: "tall", image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=1000&q=80" },
  { id: 3, name: "鮨 七五三", cuisine: "SUSHI / 鮨", area: "人形町", price: "¥¥¥¥¥", rating: "4.9", shape: "tall", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1000&q=80" },
  { id: 4, name: "酒場 三日月", cuisine: "IZAKAYA / 居酒屋", area: "月島", price: "¥¥", rating: "4.7", shape: "square", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&q=80" },
  { id: 5, name: "蕎麦 松風", cuisine: "SOBA / 蕎麦", area: "谷中", price: "¥¥¥", rating: "4.8", shape: "tall", image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=1000&q=80" },
  { id: 6, name: "炉端 まき", cuisine: "ROBATA / 炉端", area: "浅草橋", price: "¥¥¥", rating: "4.7", shape: "square", image: "https://images.unsplash.com/photo-1598515213692-d2f562ebbbfe?w=1000&q=80" },
  { id: 7, name: "天ぷら 梅乃", cuisine: "TEMPURA / 天婦羅", area: "日本橋", price: "¥¥¥¥", rating: "4.8", shape: "wide", image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=1200&q=80" },
  { id: 8, name: "もつ焼 ぼんた", cuisine: "MOTSU / もつ焼", area: "立石", price: "¥", rating: "4.9", shape: "tall", image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=1000&q=80" },
];

export const NEIGHBORHOODS: Neighborhood[] = [
  { no: "A", name: "浅草", alt: "Asakusa", desc: "雷門の先、仲見世の奥。観光地の顔をしながら、夜は別の街になる。", count: "52 店舗", image: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80" },
  { no: "B", name: "谷根千", alt: "Yanaka", desc: "谷中、根津、千駄木。猫と夕焼け段々と、小さな名店。", count: "38 店舗", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80" },
  { no: "C", name: "月島", alt: "Tsukishima", desc: "もんじゃの街、その裏路地に。倉庫街のネオンが美しい。", count: "41 店舗", image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&q=80" },
  { no: "D", name: "人形町", alt: "Ningyocho", desc: "江戸の芝居町。老舗と気鋭が並ぶ、銀座より濃い夜。", count: "34 店舗", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80" },
  { no: "E", name: "立石", alt: "Tateishi", desc: "せんべろの聖地。もつ焼の煙で空が霞む。", count: "29 店舗", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80" },
  { no: "F", name: "神楽坂", alt: "Kagurazaka", desc: "石畳と黒塀。花街の記憶を、今も料理で継ぐ。", count: "45 店舗", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80" },
];

export const FEATURE_ARTICLE: FeatureArticle = {
  no: "FEATURE / 01",
  kicker: "旅 × 下町グルメ ― 完全版",
  title: "旅行の夜は、ここの焼肉へ。",
  subtitle: "下町焼肉・五選",
  lede:
    "東京に着いて、チェックインを済ませたら、すぐに向かいたい炎がある。 出張帰りの疲れも、観光後の高揚も、一皿で熾火にしてくれる。 編集部が百軒を巡って選び抜いた、下町の焼肉、五選。",
  date: "2026.04.20",
  reading: "12 MIN",
  author: "編集部 ― 下町班",
  heroImage: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1800&q=80",
  ranking: [
    {
      rank: "壱",
      rankNum: 1,
      name: "炭火焼 蔵之介",
      cuisine: "YAKINIKU / 備長炭",
      area: "浅草 ― 国際通り路地",
      desc: "築六十年の蔵を改装した店内。備長炭の遠赤外線で、シャトーブリアンが宝石のように光る。旅の一日目、最初の一皿はここと決めている。",
      images: [
        "https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=80",
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
        "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80",
      ],
      specs: [
        { k: "予算", v: "¥12,000 ~ ¥18,000" },
        { k: "営業", v: "17:00 ~ 24:00 / 月休" },
        { k: "席数", v: "28席 / 個室有" },
        { k: "最寄", v: "浅草駅 徒歩6分" },
      ],
    },
    {
      rank: "弐",
      rankNum: 2,
      name: "焼肉 五線",
      cuisine: "YAKINIKU / 熟成",
      area: "月島 ― 倉庫街",
      desc: "倉庫をそのまま使った、無骨な空間。42日熟成の和牛を、塩と胡椒だけで。余計な演出を削ぎ落とした、職人の炎。",
      images: [
        "https://images.unsplash.com/photo-1597149961419-ea01eb1db6ad?w=1200&q=80",
        "https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=800&q=80",
        "https://images.unsplash.com/photo-1532634726-8b9fb99825af?w=800&q=80",
      ],
      specs: [
        { k: "予算", v: "¥9,000 ~ ¥14,000" },
        { k: "営業", v: "18:00 ~ 23:00 / 日月休" },
        { k: "席数", v: "18席" },
        { k: "最寄", v: "月島駅 徒歩4分" },
      ],
    },
    {
      rank: "参",
      rankNum: 3,
      name: "ホルモン 新次郎",
      cuisine: "HORUMON / もつ焼",
      area: "立石 ― 仲見世",
      desc: "せんべろ最終地点。生ビール大と特上ミノで、千五百円。観光ガイドには絶対に載らない、旅人のための場所。",
      images: [
        "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=1200&q=80",
        "https://images.unsplash.com/photo-1598515213692-d2f562ebbbfe?w=800&q=80",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
      ],
      specs: [
        { k: "予算", v: "¥1,500 ~ ¥3,000" },
        { k: "営業", v: "15:00 ~ 22:30 / 火休" },
        { k: "席数", v: "立ち呑み 14席" },
        { k: "最寄", v: "京成立石駅 徒歩2分" },
      ],
    },
    {
      rank: "肆",
      rankNum: 4,
      name: "炭火焼肉 燈火",
      cuisine: "YAKINIKU / モダン",
      area: "人形町 ― 甘酒横丁",
      desc: "老舗の町屋を若い職人が受け継いだ、静謐な店。シャリアピン風のロースと、自家製キムチ。旅二日目の夜に、じっくり。",
      images: [
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80",
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
        "https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=800&q=80",
      ],
      specs: [
        { k: "予算", v: "¥8,000 ~ ¥12,000" },
        { k: "営業", v: "17:30 ~ 23:00 / 水休" },
        { k: "席数", v: "22席 / カウンター有" },
        { k: "最寄", v: "人形町駅 徒歩3分" },
      ],
    },
    {
      rank: "伍",
      rankNum: 5,
      name: "焼肉 黎明",
      cuisine: "YAKINIKU / 朝焼",
      area: "築地 ― 場外",
      desc: "朝6時から焼ける、世界唯一の朝焼肉。市場仕入れの極上ハラミを、夜明けと共に。帰りの新幹線前、最後の下町。",
      images: [
        "https://images.unsplash.com/photo-1591189824344-09baca0a9bf2?w=1200&q=80",
        "https://images.unsplash.com/photo-1572715376701-98568319fd0b?w=800&q=80",
        "https://images.unsplash.com/photo-1615485290398-f825f5a69b7d?w=800&q=80",
      ],
      specs: [
        { k: "予算", v: "¥3,500 ~ ¥6,000" },
        { k: "営業", v: "06:00 ~ 14:00 / 日休" },
        { k: "席数", v: "12席" },
        { k: "最寄", v: "築地駅 徒歩5分" },
      ],
    },
  ],
  sideArticles: [
    { t: "PAIRING", h: "焼肉に合わせる、下町の日本酒五本", img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80" },
    { t: "HOTEL", h: "焼肉後、五分で帰れる下町ホテル", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80" },
    { t: "WALK", h: "食後散歩、隅田川ナイトコース", img: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600&q=80" },
    { t: "SWEETS", h: "〆の甘味、下町和菓子七選", img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80" },
    { t: "MORNING", h: "翌朝、二日酔いに効く朝粥", img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80" },
  ],
  quote:
    "焼肉は、土地の記憶である。蔵之介の炭火は、浅草がまだ浅草であった頃の匂いを、今も立ち上らせる。",
  quoteCite: "― 編集長 / 下町班",
};
