export type Stat = { n: string; l: string };

export type RegionKey =
  | "shitamachi"
  | "kyoto"
  | "osaka"
  | "hakata"
  | "sapporo";

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
  rating: string;
  shape: "wide" | "tall" | "square";
  image: string;
  gallery: string[];
  desc: string;
  address: string;
  hours: string;
  closed: string;
  seats: string;
  budget: string;
  nearest: string;
  reservationUrl: string;
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

export const NATIONAL = {
  brand: "マチノワ",
  brandEn: "MACHINOWA",
  brandSub: "街の輪",
  tagline: ["街の“いいお店”、", "ぜんぶここに。"],
  subtitle:
    "全国47都道府県の飲食店を、エリア・業種・特集で巡れる食のポータル。食べたい気分から、お店が見つかります。",
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
    intro:
      "観光名所の裏路地、生活と風情が同居する街。江戸の記憶を残す老舗から、若い職人が継ぐ町屋まで。下町の夜は、深い。",
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
    intro:
      "京の食は、季節と一体で動く。先斗町の灯、祇園の格、西陣の静謐。ひとつの街に、無数の宴がある。",
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
    intro:
      "ミナミの食は、にぎやかで、まっすぐだ。串カツの油、お好み焼きの湯気、ホルモンの煙。声が大きいぶん、味も濃い。",
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
    intro:
      "博多の夜は、屋台と煙、白濁したスープの湯気で出来ている。締めの一杯まで、街がやさしく続いていく。",
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
    intro:
      "雪が深いほど、炎が近い。海と土の幸を、一年で最も短い夜長に味わう街。",
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

const RES_GALLERY_FALLBACK = [
  "https://images.unsplash.com/photo-1532634726-8b9fb99825af?w=1200&q=80",
  "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=1200&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80",
];

export const RESTAURANTS: Restaurant[] = [
  // === 東京・下町 ===
  {
    id: "r01",
    name: "炭火焼 蔵之介",
    cuisine: "焼肉",
    area: "浅草",
    region: "shitamachi",
    rating: "4.9",
    shape: "wide",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1558030006-450675393462?w=1600&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80",
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=1200&q=80",
    ],
    desc: "築六十年の蔵を改装した店内。備長炭の遠赤外線で、シャトーブリアンが宝石のように光る。",
    address: "東京都台東区浅草3-12-5",
    hours: "17:00 - 24:00",
    closed: "月曜",
    seats: "28席 / 個室有",
    budget: "¥12,000 - ¥18,000",
    nearest: "浅草駅 徒歩6分",
    reservationUrl: "https://example.com/reservation/r01",
  },
  {
    id: "r02",
    name: "割烹 ひさご",
    cuisine: "割烹",
    area: "根津",
    region: "shitamachi",
    rating: "4.8",
    shape: "tall",
    image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "古民家の格子戸を抜けると、八席のカウンター。季節を一皿ずつ、丁寧に。",
    address: "東京都文京区根津2-19-3",
    hours: "18:00 - 22:30",
    closed: "日曜・月曜",
    seats: "8席 / カウンターのみ",
    budget: "¥18,000 - ¥25,000",
    nearest: "根津駅 徒歩4分",
    reservationUrl: "https://example.com/reservation/r02",
  },
  {
    id: "r03",
    name: "鮨 七五三",
    cuisine: "鮨",
    area: "人形町",
    region: "shitamachi",
    rating: "4.9",
    shape: "tall",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "甘酒横丁の外れ。江戸前の正統を、若い大将が静かに継ぐ。",
    address: "東京都中央区日本橋人形町2-7-10",
    hours: "12:00 - 14:00 / 18:00 - 22:00",
    closed: "水曜",
    seats: "10席",
    budget: "¥20,000 - ¥30,000",
    nearest: "人形町駅 徒歩2分",
    reservationUrl: "https://example.com/reservation/r03",
  },
  {
    id: "r04",
    name: "酒場 三日月",
    cuisine: "居酒屋",
    area: "月島",
    region: "shitamachi",
    rating: "4.7",
    shape: "square",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "倉庫街のネオンがまぶしい。日本酒は常時40種、肴は黒板のおまかせで。",
    address: "東京都中央区月島1-9-2",
    hours: "17:00 - 24:00",
    closed: "水曜",
    seats: "32席",
    budget: "¥4,500 - ¥7,000",
    nearest: "月島駅 徒歩3分",
    reservationUrl: "https://example.com/reservation/r04",
  },
  {
    id: "r05",
    name: "蕎麦 松風",
    cuisine: "蕎麦",
    area: "谷中",
    region: "shitamachi",
    rating: "4.8",
    shape: "tall",
    image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "毎朝石臼で挽く十割蕎麦。猫がいる路地の、静かな一軒。",
    address: "東京都台東区谷中3-13-6",
    hours: "11:30 - 15:00 / 17:30 - 20:30",
    closed: "火曜",
    seats: "16席",
    budget: "¥2,500 - ¥4,500",
    nearest: "千駄木駅 徒歩5分",
    reservationUrl: "https://example.com/reservation/r05",
  },
  {
    id: "r06",
    name: "炉端 まき",
    cuisine: "炉端",
    area: "浅草橋",
    region: "shitamachi",
    rating: "4.7",
    shape: "square",
    image: "https://images.unsplash.com/photo-1598515213692-d2f562ebbbfe?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "大将の前に、炉と魚と串。声が飛ぶ、湯気が立つ、それだけの店。",
    address: "東京都台東区浅草橋2-1-1",
    hours: "18:00 - 23:30",
    closed: "日曜",
    seats: "18席",
    budget: "¥5,000 - ¥7,500",
    nearest: "浅草橋駅 徒歩4分",
    reservationUrl: "https://example.com/reservation/r06",
  },
  {
    id: "r07",
    name: "天ぷら 梅乃",
    cuisine: "天婦羅",
    area: "日本橋",
    region: "shitamachi",
    rating: "4.8",
    shape: "wide",
    image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=1200&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "胡麻油の香りが立つ江戸前天ぷら。塩はつまむ、衣は薄く。",
    address: "東京都中央区日本橋室町1-12-2",
    hours: "12:00 - 14:00 / 17:30 - 21:30",
    closed: "日曜",
    seats: "14席",
    budget: "¥9,000 - ¥15,000",
    nearest: "三越前駅 徒歩2分",
    reservationUrl: "https://example.com/reservation/r07",
  },
  {
    id: "r08",
    name: "もつ焼 ぼんた",
    cuisine: "もつ焼",
    area: "立石",
    region: "shitamachi",
    rating: "4.9",
    shape: "tall",
    image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "せんべろの聖地。大ジョッキとシロで、千円札がまだ残る。",
    address: "東京都葛飾区立石1-18-7",
    hours: "15:00 - 22:30",
    closed: "火曜",
    seats: "立呑み 14席",
    budget: "¥1,500 - ¥3,000",
    nearest: "京成立石駅 徒歩2分",
    reservationUrl: "https://example.com/reservation/r08",
  },

  // === 京都 ===
  {
    id: "r09",
    name: "京懐石 翠月",
    cuisine: "懐石",
    area: "祇園",
    region: "kyoto",
    rating: "4.9",
    shape: "wide",
    image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=1200&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "町家の奥座敷で、十二の皿。季節は静かに、しかし、確かに。",
    address: "京都府京都市東山区祇園町南側570-120",
    hours: "18:00 - 22:00",
    closed: "水曜",
    seats: "10席 / 個室有",
    budget: "¥25,000 - ¥40,000",
    nearest: "祇園四条駅 徒歩5分",
    reservationUrl: "https://example.com/reservation/r09",
  },
  {
    id: "r10",
    name: "鴨川 はな",
    cuisine: "おばんざい",
    area: "先斗町",
    region: "kyoto",
    rating: "4.7",
    shape: "tall",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "鴨川の夜風が抜ける窓辺で、京の家庭料理を一献。",
    address: "京都府京都市中京区先斗町通蛸薬師下る",
    hours: "17:30 - 23:00",
    closed: "月曜",
    seats: "20席",
    budget: "¥4,500 - ¥7,000",
    nearest: "三条駅 徒歩4分",
    reservationUrl: "https://example.com/reservation/r10",
  },
  {
    id: "r11",
    name: "祇園 八重桜",
    cuisine: "割烹",
    area: "祇園",
    region: "kyoto",
    rating: "4.8",
    shape: "square",
    image: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "格子戸の奥、八席のカウンター。仕入れの魚を、その日決める潔さ。",
    address: "京都府京都市東山区祇園町北側324",
    hours: "18:00 - 22:30",
    closed: "日曜",
    seats: "8席",
    budget: "¥18,000 - ¥25,000",
    nearest: "祇園四条駅 徒歩6分",
    reservationUrl: "https://example.com/reservation/r11",
  },
  {
    id: "r12",
    name: "西陣 一献",
    cuisine: "日本酒",
    area: "西陣",
    region: "kyoto",
    rating: "4.7",
    shape: "tall",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "京の地酒40種を、鯖寿司と漬物で。静かに飲める、織元の街の一軒。",
    address: "京都府京都市上京区今出川通堀川東入",
    hours: "17:00 - 23:00",
    closed: "火曜",
    seats: "12席",
    budget: "¥3,500 - ¥6,000",
    nearest: "今出川駅 徒歩8分",
    reservationUrl: "https://example.com/reservation/r12",
  },
  {
    id: "r13",
    name: "祇園 串ぐら",
    cuisine: "串揚げ",
    area: "祇園",
    region: "kyoto",
    rating: "4.7",
    shape: "square",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "京野菜と魚介を、米油で。コースは二十本、季節で組み替わる。",
    address: "京都府京都市東山区祇園町南側",
    hours: "18:00 - 22:00",
    closed: "木曜",
    seats: "12席",
    budget: "¥8,000 - ¥12,000",
    nearest: "祇園四条駅 徒歩7分",
    reservationUrl: "https://example.com/reservation/r13",
  },

  // === 大阪・ミナミ ===
  {
    id: "r14",
    name: "串カツ 道頓",
    cuisine: "串カツ",
    area: "道頓堀",
    region: "osaka",
    rating: "4.6",
    shape: "wide",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "二度漬け禁止、おかわり自由。常連の声が肴になる、路地の名店。",
    address: "大阪府大阪市中央区道頓堀1-7-25",
    hours: "11:30 - 23:30",
    closed: "無休",
    seats: "26席",
    budget: "¥2,000 - ¥3,500",
    nearest: "なんば駅 徒歩4分",
    reservationUrl: "https://example.com/reservation/r14",
  },
  {
    id: "r15",
    name: "鉄板 みなみ",
    cuisine: "鉄板焼",
    area: "難波",
    region: "osaka",
    rating: "4.8",
    shape: "tall",
    image: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "目の前で焼かれる神戸牛のサーロイン。シェフの所作も、肴のうち。",
    address: "大阪府大阪市中央区難波千日前",
    hours: "17:30 - 23:00",
    closed: "水曜",
    seats: "10席 / カウンター",
    budget: "¥15,000 - ¥22,000",
    nearest: "なんば駅 徒歩3分",
    reservationUrl: "https://example.com/reservation/r15",
  },
  {
    id: "r16",
    name: "ホルモン 梅田",
    cuisine: "もつ焼",
    area: "梅田",
    region: "osaka",
    rating: "4.7",
    shape: "square",
    image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "ガード下、煙でかすむ夜空。新鮮なホルモンを、塩で。",
    address: "大阪府大阪市北区梅田3-2-2",
    hours: "16:00 - 24:00",
    closed: "日曜",
    seats: "立呑み 16席",
    budget: "¥2,500 - ¥4,500",
    nearest: "大阪駅 徒歩6分",
    reservationUrl: "https://example.com/reservation/r16",
  },
  {
    id: "r17",
    name: "お好み 法善",
    cuisine: "お好み焼",
    area: "難波",
    region: "osaka",
    rating: "4.7",
    shape: "tall",
    image: "https://images.unsplash.com/photo-1535924206242-349b8be23e80?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "法善寺横丁の名残、四十年続く女将の手さばき。",
    address: "大阪府大阪市中央区難波1-2-13",
    hours: "11:30 - 22:00",
    closed: "火曜",
    seats: "20席",
    budget: "¥1,800 - ¥3,200",
    nearest: "なんば駅 徒歩5分",
    reservationUrl: "https://example.com/reservation/r17",
  },
  {
    id: "r18",
    name: "ねぎ焼 はな",
    cuisine: "ねぎ焼",
    area: "新世界",
    region: "osaka",
    rating: "4.6",
    shape: "square",
    image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "刻みネギたっぷり、すじこんが甘い。レモンを絞れば、夏の味。",
    address: "大阪府大阪市浪速区恵美須東",
    hours: "11:00 - 21:30",
    closed: "木曜",
    seats: "18席",
    budget: "¥1,500 - ¥2,800",
    nearest: "新今宮駅 徒歩4分",
    reservationUrl: "https://example.com/reservation/r18",
  },
  {
    id: "r19",
    name: "炉端 大阪",
    cuisine: "炉端",
    area: "心斎橋",
    region: "osaka",
    rating: "4.7",
    shape: "wide",
    image: "https://images.unsplash.com/photo-1598515213692-d2f562ebbbfe?w=1200&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "明石の鯛、淡路の玉ねぎ、土佐の鰹。瀬戸内と四国の幸を、炉に。",
    address: "大阪府大阪市中央区心斎橋筋1-4-22",
    hours: "17:30 - 23:30",
    closed: "月曜",
    seats: "24席",
    budget: "¥6,000 - ¥9,000",
    nearest: "心斎橋駅 徒歩3分",
    reservationUrl: "https://example.com/reservation/r19",
  },

  // === 福岡・博多 ===
  {
    id: "r20",
    name: "もつ鍋 龍",
    cuisine: "もつ鍋",
    area: "中洲",
    region: "hakata",
    rating: "4.8",
    shape: "wide",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "醤油・味噌・水炊きの三種。締めはちゃんぽん麺で、博多の夜を閉じる。",
    address: "福岡県福岡市博多区中洲3-7-24",
    hours: "17:30 - 24:00",
    closed: "無休",
    seats: "40席 / 個室有",
    budget: "¥4,500 - ¥7,500",
    nearest: "中洲川端駅 徒歩3分",
    reservationUrl: "https://example.com/reservation/r20",
  },
  {
    id: "r21",
    name: "屋台 中洲",
    cuisine: "屋台",
    area: "中洲",
    region: "hakata",
    rating: "4.6",
    shape: "tall",
    image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "夜風と提灯、那珂川の水音。豚骨と餃子で、博多の夜が始まる。",
    address: "福岡県福岡市博多区中洲4 川岸",
    hours: "19:00 - 翌3:00",
    closed: "日曜・雨天",
    seats: "立呑み 8席",
    budget: "¥1,500 - ¥2,800",
    nearest: "中洲川端駅 徒歩5分",
    reservationUrl: "https://example.com/reservation/r21",
  },
  {
    id: "r22",
    name: "水炊き 玄海",
    cuisine: "水炊き",
    area: "天神",
    region: "hakata",
    rating: "4.8",
    shape: "square",
    image: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "博多三大料理の一角。骨ごと炊いた白濁スープに、地鶏を浸す。",
    address: "福岡県福岡市中央区天神3-3-13",
    hours: "17:00 - 23:00",
    closed: "水曜",
    seats: "30席",
    budget: "¥6,000 - ¥9,000",
    nearest: "天神駅 徒歩4分",
    reservationUrl: "https://example.com/reservation/r22",
  },
  {
    id: "r23",
    name: "焼鳥 天神",
    cuisine: "焼鳥",
    area: "天神",
    region: "hakata",
    rating: "4.7",
    shape: "tall",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "九州の地鶏を、塩・タレ・梅で。締めの鶏茶漬けが評判。",
    address: "福岡県福岡市中央区天神2-7-9",
    hours: "17:30 - 23:30",
    closed: "日曜",
    seats: "18席",
    budget: "¥3,500 - ¥6,000",
    nearest: "天神駅 徒歩3分",
    reservationUrl: "https://example.com/reservation/r23",
  },
  {
    id: "r24",
    name: "鯖 長浜",
    cuisine: "海鮮",
    area: "長浜",
    region: "hakata",
    rating: "4.7",
    shape: "wide",
    image: "https://images.unsplash.com/photo-1572715376701-98568319fd0b?w=1200&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "玄界灘の鯖を生で。締めの胡麻鯖丼まで、海の街の正解。",
    address: "福岡県福岡市中央区長浜2-1-15",
    hours: "11:30 - 14:00 / 17:30 - 22:30",
    closed: "月曜",
    seats: "22席",
    budget: "¥3,800 - ¥6,500",
    nearest: "赤坂駅 徒歩6分",
    reservationUrl: "https://example.com/reservation/r24",
  },

  // === 北海道・札幌 ===
  {
    id: "r25",
    name: "海鮮 二条",
    cuisine: "海鮮",
    area: "二条市場",
    region: "sapporo",
    rating: "4.8",
    shape: "wide",
    image: "https://images.unsplash.com/photo-1591189824344-09baca0a9bf2?w=1200&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "市場の上の食堂。雲丹、いくら、毛蟹。朝の海を、丼に乗せる。",
    address: "北海道札幌市中央区南三条東1-7",
    hours: "07:00 - 14:00",
    closed: "水曜",
    seats: "22席",
    budget: "¥2,500 - ¥5,000",
    nearest: "バスセンター前駅 徒歩6分",
    reservationUrl: "https://example.com/reservation/r25",
  },
  {
    id: "r26",
    name: "ジンギスカン 月寒",
    cuisine: "ジンギスカン",
    area: "月寒",
    region: "sapporo",
    rating: "4.7",
    shape: "tall",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "鉄兜が煙る、雪国の宴。生ラムを、もやしと玉ねぎでくるんで。",
    address: "北海道札幌市豊平区月寒中央通7",
    hours: "17:00 - 23:00",
    closed: "火曜",
    seats: "32席",
    budget: "¥3,500 - ¥5,500",
    nearest: "月寒中央駅 徒歩2分",
    reservationUrl: "https://example.com/reservation/r26",
  },
  {
    id: "r27",
    name: "ラーメン 雪見",
    cuisine: "拉麺",
    area: "すすきの",
    region: "sapporo",
    rating: "4.6",
    shape: "square",
    image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "夜の締め、味噌一杯。雪が積もる窓を眺めながら、湯気をすする。",
    address: "北海道札幌市中央区南五条西4",
    hours: "11:00 - 翌2:00",
    closed: "無休",
    seats: "14席",
    budget: "¥900 - ¥1,800",
    nearest: "すすきの駅 徒歩2分",
    reservationUrl: "https://example.com/reservation/r27",
  },
  {
    id: "r28",
    name: "炭焼 すすきの",
    cuisine: "炉端",
    area: "すすきの",
    region: "sapporo",
    rating: "4.8",
    shape: "wide",
    image: "https://images.unsplash.com/photo-1597149961419-ea01eb1db6ad?w=1200&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "羅臼の昆布、知床の鮭、十勝のチーズ。北の食材だけで組む炉端。",
    address: "北海道札幌市中央区南四条西3",
    hours: "17:30 - 24:00",
    closed: "日曜",
    seats: "26席",
    budget: "¥5,500 - ¥8,500",
    nearest: "すすきの駅 徒歩3分",
    reservationUrl: "https://example.com/reservation/r28",
  },
  {
    id: "r29",
    name: "寿司 余市",
    cuisine: "鮨",
    area: "円山",
    region: "sapporo",
    rating: "4.9",
    shape: "tall",
    image: "https://images.unsplash.com/photo-1615485290398-f825f5a69b7d?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "余市・小樽から直送。北海の青魚を、シャリで受ける十二貫。",
    address: "北海道札幌市中央区南一条西23",
    hours: "18:00 - 22:30",
    closed: "月曜",
    seats: "8席",
    budget: "¥18,000 - ¥25,000",
    nearest: "円山公園駅 徒歩4分",
    reservationUrl: "https://example.com/reservation/r29",
  },
  {
    id: "r30",
    name: "味噌煮込み 雪原",
    cuisine: "居酒屋",
    area: "大通",
    region: "sapporo",
    rating: "4.6",
    shape: "square",
    image: "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=1000&q=80",
    gallery: RES_GALLERY_FALLBACK,
    desc: "野菜たっぷりの味噌煮込みと、地酒。雪深い夜の、一人飲みに。",
    address: "北海道札幌市中央区大通西4",
    hours: "17:00 - 23:30",
    closed: "水曜",
    seats: "16席",
    budget: "¥3,200 - ¥5,000",
    nearest: "大通駅 徒歩3分",
    reservationUrl: "https://example.com/reservation/r30",
  },
];

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

export const SHORT_VIDEOS: ShortVideo[] = [
  {
    id: "v01",
    restaurantId: "r01",
    thumbnail:
      "https://images.unsplash.com/photo-1558030006-450675393462?w=720&q=80",
    title: "備長炭で焼く、シャトーブリアン。",
    cuisineEmoji: "🔥",
    cuisineLabel: "焼肉",
    duration: "0:32",
    likes: "8.2K",
    comments: "412",
    saves: "1.1K",
  },
  {
    id: "v02",
    restaurantId: "r03",
    thumbnail:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=720&q=80",
    title: "江戸前、十二貫の旅。",
    cuisineEmoji: "🍣",
    cuisineLabel: "鮨",
    duration: "0:48",
    likes: "12.5K",
    comments: "893",
    saves: "2.4K",
  },
  {
    id: "v03",
    restaurantId: "r20",
    thumbnail:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=720&q=80",
    title: "もつ鍋、白濁の湯気。",
    cuisineEmoji: "🍲",
    cuisineLabel: "もつ鍋",
    duration: "0:28",
    likes: "6.8K",
    comments: "320",
    saves: "890",
  },
  {
    id: "v04",
    restaurantId: "r25",
    thumbnail:
      "https://images.unsplash.com/photo-1591189824344-09baca0a9bf2?w=720&q=80",
    title: "二条市場、朝の海鮮丼。",
    cuisineEmoji: "🦀",
    cuisineLabel: "海鮮",
    duration: "0:36",
    likes: "9.4K",
    comments: "517",
    saves: "1.6K",
  },
  {
    id: "v05",
    restaurantId: "r14",
    thumbnail:
      "https://images.unsplash.com/photo-1535924206242-349b8be23e80?w=720&q=80",
    title: "二度漬け禁止。串カツ十本勝負。",
    cuisineEmoji: "🥢",
    cuisineLabel: "串カツ",
    duration: "0:42",
    likes: "11.3K",
    comments: "672",
    saves: "1.9K",
  },
  {
    id: "v06",
    restaurantId: "r09",
    thumbnail:
      "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=720&q=80",
    title: "京懐石、十二の皿。",
    cuisineEmoji: "🍵",
    cuisineLabel: "懐石",
    duration: "0:55",
    likes: "14.7K",
    comments: "1.2K",
    saves: "3.2K",
  },
  {
    id: "v07",
    restaurantId: "r26",
    thumbnail:
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=720&q=80",
    title: "雪夜、ジンギスカン。",
    cuisineEmoji: "🐑",
    cuisineLabel: "ジンギスカン",
    duration: "0:31",
    likes: "5.6K",
    comments: "284",
    saves: "740",
  },
  {
    id: "v08",
    restaurantId: "r21",
    thumbnail:
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=720&q=80",
    title: "屋台、那珂川の夜風。",
    cuisineEmoji: "🏮",
    cuisineLabel: "屋台",
    duration: "0:40",
    likes: "7.9K",
    comments: "395",
    saves: "1.0K",
  },
];

export const NEIGHBORHOODS: Neighborhood[] = [
  { no: "01", name: "浅草", alt: "Asakusa", desc: "雷門の先、仲見世の奥。観光地の顔をしながら、夜は別の街になる。", count: "52 店舗", image: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80", region: "shitamachi" },
  { no: "02", name: "谷根千", alt: "Yanaka", desc: "谷中、根津、千駄木。猫と夕焼け段々と、小さな名店。", count: "38 店舗", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80", region: "shitamachi" },
  { no: "03", name: "月島", alt: "Tsukishima", desc: "もんじゃの街、その裏路地に。倉庫街のネオンが美しい。", count: "41 店舗", image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&q=80", region: "shitamachi" },
  { no: "04", name: "人形町", alt: "Ningyocho", desc: "江戸の芝居町。老舗と気鋭が並ぶ、銀座より濃い夜。", count: "34 店舗", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80", region: "shitamachi" },
  { no: "05", name: "立石", alt: "Tateishi", desc: "せんべろの聖地。もつ焼の煙で空が霞む。", count: "29 店舗", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80", region: "shitamachi" },
  { no: "06", name: "神楽坂", alt: "Kagurazaka", desc: "石畳と黒塀。花街の記憶を、今も料理で継ぐ。", count: "45 店舗", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80", region: "shitamachi" },
];

/* ===================================================== */
/* FEATURE ARTICLES                                      */
/* ===================================================== */

export const FEATURES: Feature[] = [
  {
    id: "f01",
    no: "01",
    tag: "旅特集",
    kicker: "旅特集 / 2026 春",
    title: "旅の夜は、ここの焼肉へ",
    sub: "浅草から月島まで。出張者も観光客も唸る、下町の炎を巡る五軒。",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1400&q=80",
  },
  {
    id: "f02",
    no: "02",
    tag: "ランキング",
    kicker: "厳選 五選",
    title: "下町焼肉、五選",
    sub: "ミシュラン常連から町場の名店まで。下町の焼肉、間違いない五軒。",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1400&q=80",
  },
  {
    id: "f03",
    no: "03",
    tag: "季節特集",
    kicker: "季節特集",
    title: "春の和食、桜のように",
    sub: "根津の割烹、谷中の蕎麦、千住の鮨。季節を一皿に収める名匠たち。",
    image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=1400&q=80",
  },
  {
    id: "f04",
    no: "04",
    tag: "裏路地",
    kicker: "隠れ家",
    title: "路地の奥、暖簾の先",
    sub: "看板もなく、案内もなく。それでも人が絶えない、隠れ家八軒。",
    image: "https://images.unsplash.com/photo-1576867757603-05b134ebc379?w=1400&q=80",
  },
  {
    id: "f05",
    no: "05",
    tag: "ナイトガイド",
    kicker: "深夜ガイド",
    title: "二軒目、三軒目、四軒目",
    sub: "深夜0時からが本番。下町の夜を朝まで味わう、編集部の動線。",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1400&q=80",
  },
];

const SIDE_DEFAULT = [
  { t: "PAIRING", h: "焼肉に合わせる、下町の日本酒五本", img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80" },
  { t: "HOTEL", h: "焼肉後、五分で帰れる下町ホテル", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80" },
  { t: "WALK", h: "食後散歩、隅田川ナイトコース", img: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600&q=80" },
  { t: "SWEETS", h: "〆の甘味、下町和菓子七選", img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80" },
  { t: "MORNING", h: "翌朝、二日酔いに効く朝粥", img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80" },
];

export const FEATURE_ARTICLES: Record<string, FeatureArticle> = {
  f01: {
    id: "f01",
    no: "特集 / 01",
    kicker: "旅 × 下町グルメ ― 完全版",
    title: "旅行の夜は、ここの焼肉へ。",
    titleHTML:
      "<span class=\"line\" style=\"display:block;overflow:hidden\"><span style=\"display:inline-block\">旅の夜は、</span></span><span class=\"line\" style=\"display:block;overflow:hidden\"><span style=\"display:inline-block\">ここの<em>焼肉</em>へ。</span></span>",
    subtitle: "下町焼肉・五選",
    lede:
      "東京に着いて、チェックインを済ませたら、すぐに向かいたい炎がある。 出張帰りの疲れも、観光後の高揚も、一皿で熾火にしてくれる。 下町の焼肉、五選。",
    date: "2026.04.20",
    reading: "12 MIN",
    author: "編集部 ― 下町班",
    heroImage: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1800&q=80",
    ranking: [
      {
        rank: "01",
        rankNum: 1,
        name: "炭火焼 蔵之介",
        cuisine: "備長炭",
        area: "浅草 ― 国際通り路地",
        desc: "築六十年の蔵を改装した店内。備長炭の遠赤外線で、シャトーブリアンが宝石のように光る。旅の一日目、最初の一皿はここと決めている。",
        images: [
          "https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=80",
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
          "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80",
        ],
        specs: [
          { k: "営業", v: "17:00 ~ 24:00" },
          { k: "定休", v: "月曜" },
          { k: "席数", v: "28席 / 個室有" },
          { k: "最寄", v: "浅草駅 徒歩6分" },
        ],
      },
      {
        rank: "02",
        rankNum: 2,
        name: "焼肉 五線",
        cuisine: "熟成",
        area: "月島 ― 倉庫街",
        desc: "倉庫をそのまま使った、無骨な空間。42日熟成の和牛を、塩と胡椒だけで。余計な演出を削ぎ落とした、職人の炎。",
        images: [
          "https://images.unsplash.com/photo-1597149961419-ea01eb1db6ad?w=1200&q=80",
          "https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=800&q=80",
          "https://images.unsplash.com/photo-1532634726-8b9fb99825af?w=800&q=80",
        ],
        specs: [
          { k: "営業", v: "18:00 ~ 23:00" },
          { k: "定休", v: "日・月曜" },
          { k: "席数", v: "18席" },
          { k: "最寄", v: "月島駅 徒歩4分" },
        ],
      },
      {
        rank: "03",
        rankNum: 3,
        name: "ホルモン 新次郎",
        cuisine: "もつ焼",
        area: "立石 ― 仲見世",
        desc: "せんべろ最終地点。生ビール大と特上ミノで、千五百円。観光ガイドには絶対に載らない、旅人のための場所。",
        images: [
          "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=1200&q=80",
          "https://images.unsplash.com/photo-1598515213692-d2f562ebbbfe?w=800&q=80",
          "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
        ],
        specs: [
          { k: "営業", v: "15:00 ~ 22:30" },
          { k: "定休", v: "火曜" },
          { k: "席数", v: "立ち呑み 14席" },
          { k: "最寄", v: "京成立石駅 徒歩2分" },
        ],
      },
      {
        rank: "04",
        rankNum: 4,
        name: "炭火焼肉 燈火",
        cuisine: "モダン",
        area: "人形町 ― 甘酒横丁",
        desc: "老舗の町屋を若い職人が受け継いだ、静謐な店。シャリアピン風のロースと、自家製キムチ。旅二日目の夜に、じっくり。",
        images: [
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80",
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
          "https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=800&q=80",
        ],
        specs: [
          { k: "営業", v: "17:30 ~ 23:00" },
          { k: "定休", v: "水曜" },
          { k: "席数", v: "22席 / カウンター有" },
          { k: "最寄", v: "人形町駅 徒歩3分" },
        ],
      },
      {
        rank: "05",
        rankNum: 5,
        name: "焼肉 黎明",
        cuisine: "朝焼",
        area: "築地 ― 場外",
        desc: "朝6時から焼ける、世界唯一の朝焼肉。市場仕入れの極上ハラミを、夜明けと共に。帰りの新幹線前、最後の下町。",
        images: [
          "https://images.unsplash.com/photo-1591189824344-09baca0a9bf2?w=1200&q=80",
          "https://images.unsplash.com/photo-1572715376701-98568319fd0b?w=800&q=80",
          "https://images.unsplash.com/photo-1615485290398-f825f5a69b7d?w=800&q=80",
        ],
        specs: [
          { k: "営業", v: "06:00 ~ 14:00" },
          { k: "定休", v: "日曜" },
          { k: "席数", v: "12席" },
          { k: "最寄", v: "築地駅 徒歩5分" },
        ],
      },
    ],
    sideArticles: SIDE_DEFAULT,
    quote:
      "焼肉は、土地の記憶である。蔵之介の炭火は、浅草がまだ浅草であった頃の匂いを、今も立ち上らせる。",
    quoteCite: "― 編集長 / 下町班",
    closing:
      "旅の夜、何を食べたかは、その旅そのものになる。焼肉は、特に。煙と炎、仲間の声、ビールの泡 ―― すべてがひとつの記憶に焼きつく。五軒のどれかが、あなたの次の旅の記憶になれば、これ以上の幸せはない。",
  },
  f02: {
    id: "f02",
    no: "特集 / 02",
    kicker: "下町焼肉、ベストファイブ",
    title: "下町焼肉、五選。",
    titleHTML:
      "<span class=\"line\" style=\"display:block;overflow:hidden\"><span style=\"display:inline-block\">下町<em>焼肉</em>、</span></span><span class=\"line\" style=\"display:block;overflow:hidden\"><span style=\"display:inline-block\">五選。</span></span>",
    subtitle: "下町焼肉・五選",
    lede:
      "ミシュラン常連から町場の名店まで、下町に潜む焼肉店をひたすら歩いた。価格帯も雰囲気もばらばら、しかし、どれも \"間違いない\"。",
    date: "2026.04.13",
    reading: "10 MIN",
    author: "編集部 ― 焼肉班",
    heroImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1800&q=80",
    ranking: [
      {
        rank: "01",
        rankNum: 1,
        name: "焼肉 五線",
        cuisine: "熟成",
        area: "月島",
        desc: "42日熟成の赤身を、塩で。倉庫街の無骨な空間が、肉の輪郭を引き立てる。",
        images: [
          "https://images.unsplash.com/photo-1597149961419-ea01eb1db6ad?w=1200&q=80",
          "https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=800&q=80",
          "https://images.unsplash.com/photo-1532634726-8b9fb99825af?w=800&q=80",
        ],
        specs: [
          { k: "席数", v: "18席" },
          { k: "最寄", v: "月島駅 徒歩4分" },
          { k: "予約", v: "必須" },
        ],
      },
      {
        rank: "02",
        rankNum: 2,
        name: "炭火焼 蔵之介",
        cuisine: "備長炭",
        area: "浅草",
        desc: "蔵を改装した店内に、備長炭の赤い熾火。シャトーブリアンが宝石のように光る。",
        images: [
          "https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=80",
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
          "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80",
        ],
        specs: [
          { k: "席数", v: "28席" },
          { k: "最寄", v: "浅草駅 徒歩6分" },
          { k: "予約", v: "推奨" },
        ],
      },
      {
        rank: "03",
        rankNum: 3,
        name: "炭火焼肉 燈火",
        cuisine: "モダン",
        area: "人形町",
        desc: "町屋を継いだ若い職人。シャリアピン風のロースと、自家製キムチが評判。",
        images: [
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80",
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
          "https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=800&q=80",
        ],
        specs: [
          { k: "席数", v: "22席" },
          { k: "最寄", v: "人形町駅 徒歩3分" },
          { k: "予約", v: "推奨" },
        ],
      },
    ],
    sideArticles: SIDE_DEFAULT,
    quote:
      "焼肉の良し悪しは、店主の手のひらに表れる。タンを返す指先で、その店の二十年が見える。",
    quoteCite: "― 編集部 / 焼肉班",
    closing:
      "三軒だけ挙げたが、実は全五軒、近日に通しで紹介する予定だ。煙の上がる夜が、今夜もどこかで始まっている。",
  },
  f03: {
    id: "f03",
    no: "特集 / 03",
    kicker: "春・季節を一皿に",
    title: "春の和食、桜のように。",
    titleHTML:
      "<span class=\"line\" style=\"display:block;overflow:hidden\"><span style=\"display:inline-block\">春の<em>和食</em>、</span></span><span class=\"line\" style=\"display:block;overflow:hidden\"><span style=\"display:inline-block\">桜のように。</span></span>",
    subtitle: "季節 / 春",
    lede:
      "桜の前線が日本列島を北上する四週間、和食の名匠たちは皿の上で春を再現する。割烹、蕎麦、鮨 ――― 三つの様式で、季節を読み解く。",
    date: "2026.03.30",
    reading: "9 MIN",
    author: "編集部 ― 季節班",
    heroImage: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=1800&q=80",
    ranking: [
      {
        rank: "01",
        rankNum: 1,
        name: "割烹 ひさご",
        cuisine: "割烹",
        area: "根津",
        desc: "桜鯛と若竹の椀。季節は、皿の中で短く、強く咲く。",
        images: [
          "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=1200&q=80",
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
          "https://images.unsplash.com/photo-1532634726-8b9fb99825af?w=800&q=80",
        ],
        specs: [
          { k: "席数", v: "8席" },
          { k: "最寄", v: "根津駅 徒歩4分" },
          { k: "予約", v: "必須" },
        ],
      },
      {
        rank: "02",
        rankNum: 2,
        name: "蕎麦 松風",
        cuisine: "蕎麦",
        area: "谷中",
        desc: "新蕎麦と桜海老のかき揚げ。粉の香りに、海の春が重なる。",
        images: [
          "https://images.unsplash.com/photo-1555126634-323283e090fa?w=1200&q=80",
          "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80",
          "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=800&q=80",
        ],
        specs: [
          { k: "席数", v: "16席" },
          { k: "最寄", v: "千駄木駅 徒歩5分" },
          { k: "予約", v: "不要" },
        ],
      },
      {
        rank: "03",
        rankNum: 3,
        name: "鮨 七五三",
        cuisine: "鮨",
        area: "人形町",
        desc: "白魚、桜鱒、平貝。江戸前の春を、十二貫で旅する。",
        images: [
          "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80",
          "https://images.unsplash.com/photo-1615485290398-f825f5a69b7d?w=800&q=80",
          "https://images.unsplash.com/photo-1572715376701-98568319fd0b?w=800&q=80",
        ],
        specs: [
          { k: "席数", v: "10席" },
          { k: "最寄", v: "人形町駅 徒歩2分" },
          { k: "予約", v: "必須" },
        ],
      },
    ],
    sideArticles: SIDE_DEFAULT,
    quote:
      "和食は、季節と一体である。桜が散る速度で、皿の上の春も終わる。",
    quoteCite: "― 編集部 / 季節班",
    closing:
      "夏が来る前に、もう一度、春の皿を。短い季節は、二度行ってちょうどいい。",
  },
  f04: {
    id: "f04",
    no: "特集 / 04",
    kicker: "看板のない名店たち",
    title: "路地の奥、暖簾の先。",
    titleHTML:
      "<span class=\"line\" style=\"display:block;overflow:hidden\"><span style=\"display:inline-block\">路地の奥、</span></span><span class=\"line\" style=\"display:block;overflow:hidden\"><span style=\"display:inline-block\"><em>暖簾</em>の先。</span></span>",
    subtitle: "隠れ家",
    lede:
      "看板がない、案内がない、それでも人が絶えない。下町、京、博多 ――― 路地の奥にだけ咲く、八軒の名店を歩いた。",
    date: "2026.03.16",
    reading: "8 MIN",
    author: "編集部 ― 路地班",
    heroImage: "https://images.unsplash.com/photo-1576867757603-05b134ebc379?w=1800&q=80",
    ranking: [
      {
        rank: "01",
        rankNum: 1,
        name: "酒場 三日月",
        cuisine: "居酒屋",
        area: "月島",
        desc: "倉庫街の路地、看板は提灯ひとつ。日本酒40種、肴は黒板任せ。",
        images: [
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80",
          "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=800&q=80",
          "https://images.unsplash.com/photo-1532634726-8b9fb99825af?w=800&q=80",
        ],
        specs: [
          { k: "席数", v: "32席" },
          { k: "最寄", v: "月島駅 徒歩3分" },
          { k: "予約", v: "推奨" },
        ],
      },
      {
        rank: "02",
        rankNum: 2,
        name: "西陣 一献",
        cuisine: "日本酒",
        area: "京都・西陣",
        desc: "織元の街、暖簾だけが目印。京の地酒40種を、鯖寿司と漬物で。",
        images: [
          "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&q=80",
          "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80",
          "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
        ],
        specs: [
          { k: "席数", v: "12席" },
          { k: "最寄", v: "今出川駅 徒歩8分" },
          { k: "予約", v: "推奨" },
        ],
      },
      {
        rank: "03",
        rankNum: 3,
        name: "屋台 中洲",
        cuisine: "屋台",
        area: "博多・中洲",
        desc: "那珂川沿い、提灯の下。豚骨と餃子で、博多の夜が始まる。",
        images: [
          "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1200&q=80",
          "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
          "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800&q=80",
        ],
        specs: [
          { k: "席数", v: "立呑み 8席" },
          { k: "最寄", v: "中洲川端駅 徒歩5分" },
          { k: "予約", v: "不可" },
        ],
      },
    ],
    sideArticles: SIDE_DEFAULT,
    quote:
      "良い店は、案内されない。見つかる、ではなく、見つけにゆくのが、路地の作法だ。",
    quoteCite: "― 編集部 / 路地班",
    closing:
      "看板を持たない店は、街の余白に佇む。地図に載らない味こそ、旅人の収穫だ。",
  },
  f05: {
    id: "f05",
    no: "特集 / 05",
    kicker: "深夜0時からの動線",
    title: "二軒目、三軒目、四軒目。",
    titleHTML:
      "<span class=\"line\" style=\"display:block;overflow:hidden\"><span style=\"display:inline-block\">二軒目、三軒目、</span></span><span class=\"line\" style=\"display:block;overflow:hidden\"><span style=\"display:inline-block\"><em>四軒目</em>。</span></span>",
    subtitle: "深夜の動線",
    lede:
      "下町の夜は、長い。一軒目で終わるのは、もったいない。深夜0時から朝6時まで、編集部が実際に歩いた動線を、そのまま記録した。",
    date: "2026.02.27",
    reading: "11 MIN",
    author: "編集部 ― 夜班",
    heroImage: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1800&q=80",
    ranking: [
      {
        rank: "01",
        rankNum: 1,
        name: "もつ焼 ぼんた",
        cuisine: "もつ焼",
        area: "立石 ― 一軒目",
        desc: "立呑み14席、二十一時には満員。だから、二十二時に入る。",
        images: [
          "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=1200&q=80",
          "https://images.unsplash.com/photo-1598515213692-d2f562ebbbfe?w=800&q=80",
          "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
        ],
        specs: [
          { k: "時刻", v: "21:30 入店" },
          { k: "滞在", v: "60分" },
          { k: "次", v: "京成押上線で月島へ" },
        ],
      },
      {
        rank: "02",
        rankNum: 2,
        name: "酒場 三日月",
        cuisine: "居酒屋",
        area: "月島 ― 二軒目",
        desc: "黒板の本日のおすすめと、冷酒。腰を落ち着けて、深夜の本番。",
        images: [
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80",
          "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=800&q=80",
          "https://images.unsplash.com/photo-1532634726-8b9fb99825af?w=800&q=80",
        ],
        specs: [
          { k: "時刻", v: "23:00 入店" },
          { k: "滞在", v: "90分" },
          { k: "次", v: "タクシーで築地" },
        ],
      },
      {
        rank: "03",
        rankNum: 3,
        name: "焼肉 黎明",
        cuisine: "朝焼",
        area: "築地 ― 三軒目",
        desc: "朝6時開店、市場仕入れの極上ハラミ。夜明けと共に、最後の一皿。",
        images: [
          "https://images.unsplash.com/photo-1591189824344-09baca0a9bf2?w=1200&q=80",
          "https://images.unsplash.com/photo-1572715376701-98568319fd0b?w=800&q=80",
          "https://images.unsplash.com/photo-1615485290398-f825f5a69b7d?w=800&q=80",
        ],
        specs: [
          { k: "時刻", v: "06:00 入店" },
          { k: "滞在", v: "45分" },
          { k: "次", v: "始発で帰る" },
        ],
      },
    ],
    sideArticles: SIDE_DEFAULT,
    quote:
      "夜は線で考える。点ではなく、線で繋ぐと、街が変わって見える。",
    quoteCite: "― 編集部 / 夜班",
    closing:
      "翌朝の二日酔いは、それも記憶のうち。次の旅で、もう一度この線を辿ってみてほしい。",
  },
};

/* ===================================================== */
/* Computed stats (derived from real data)              */
/* ===================================================== */

function avg(nums: number[]): string {
  if (nums.length === 0) return "0.0";
  const m = nums.reduce((a, b) => a + b, 0) / nums.length;
  return m.toFixed(1);
}

export function getNationalStats(): Stat[] {
  const ratings = RESTAURANTS.map((r) => parseFloat(r.rating));
  const prefectures = new Set(Object.keys(REGIONS));
  return [
    { n: String(RESTAURANTS.length), l: "掲載店舗" },
    { n: String(prefectures.size), l: "都道府県" },
    { n: String(FEATURES.length), l: "特集記事" },
    { n: avg(ratings), l: "平均評価" },
  ];
}

export function getRegionStats(key: RegionKey): Stat[] {
  const local = RESTAURANTS.filter((r) => r.region === key);
  const ratings = local.map((r) => parseFloat(r.rating));
  const areas = new Set(local.map((r) => r.area));
  return [
    { n: String(local.length), l: "登録店舗" },
    { n: String(areas.size), l: "エリア" },
    { n: String(FEATURES.length), l: "特集記事" },
    { n: avg(ratings), l: "平均評価" },
  ];
}
