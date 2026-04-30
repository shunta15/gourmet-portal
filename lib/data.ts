export type Stat = { n: string; l: string };

export type RegionKey =
  | "tokyo"
  | "yokohama"
  | "osaka"
  | "nagoya"
  | "fukuoka"
  | "shizuoka"
  | "kanagawa";

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
    tagline: "湖畔の珈琲、丘の上の一軒",
    subtitle: "相模原、湘南、川崎 ――― 横浜の隣で、自分の時間を取り戻せる場所。",
    intro:
      "横浜から少し足を伸ばすと、湖、丘、川。神奈川には、都市と自然が同居する場所が点在する。一杯の珈琲のために訪れる価値のある一軒が、ここに。",
    heroImages: [
      // 箱根芦ノ湖の鳥居
      "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1600&q=85",
      // 湖畔の山岳村落
      "https://images.unsplash.com/photo-1485081669829-bacb8c7bb1f3?w=1600&q=85",
    ],
    stats: [],
  },
};

const RES_GALLERY_FALLBACK = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
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
  {
    id: "r04",
    name: "お喜楽イタリア創作料理 Basta Basta",
    cuisine: "イタリアン",
    area: "南区・豊田本町",
    region: "nagoya",
    rating: "3.10",
    shape: "tall",
    image: "/restaurants/r04/r04-info-4.webp",
    heroImages: [
      "/restaurants/r04/r04-info-4.webp",
      "/restaurants/r04/r04-info-2.webp",
      "/restaurants/r04/r04-info-3.webp",
      "/restaurants/r04/r04-menu-2.webp",
    ],
    gallery: [
      "/restaurants/r04/r04-info-4.webp",
      "/restaurants/r04/r04-info-1.webp",
      "/restaurants/r04/r04-info-2.webp",
      "/restaurants/r04/r04-info-3.webp",
      "/restaurants/r04/r04-menu-2.webp",
      "/restaurants/r04/r04-menu-17.webp",
    ],
    desc: "名古屋・南区の路地、名鉄豊田本町駅から徒歩5分。お箸で食べる「お喜楽」イタリアンを掲げる町場のイタリア創作料理店。1〜30名まで対応する席設計と団体貸切で、近所の家族連れから会社の宴会まで懐の広い一軒。",
    address: "愛知県名古屋市南区明治2-15-7 第三日鶴ビル1F",
    hours:
      "月-土 17:00 - 23:00（L.O. 22:00） / 日祝 17:00 - 22:00（L.O. 21:00）",
    closed: "毎週火曜",
    seats: "カウンター・1〜2人席・3〜4人席・10人席・30人席（合計1〜30名）/ 貸切可",
    budget: "夜 ￥3,000〜￥3,999",
    nearest: "名鉄常滑線 豊田本町駅 徒歩5分",
    source: {
      label: "食べログ",
      url: "https://tabelog.com/aichi/A2301/A230112/23032208/",
    },
    tags: [
      "イタリアン",
      "パーティ",
      "宴会",
      "貸切可",
      "ファミリー",
      "駐車場あり",
    ],
    highlights: [
      "お箸で食べる「お喜楽」イタリアン。家庭の食卓の延長で楽しめる",
      "1〜30名まで対応の席設計。10人席・30人席まで揃う",
      "駐車場7台。車移動が前提の名古屋エリアでも安心",
      "日祝も22時まで営業。週末の選択肢として頼りになる",
    ],
    body: [
      "内田橋1丁目交差点近く、住宅地と商店街の境目に灯る一軒。第三日鶴ビルの1階、ガラス越しに見える店内はカウンターから30人席までフロアが広く、夜の名古屋南区で「気軽に集まれるイタリアン」を引き受け続けてきた。",
      "店名のとおり「お喜楽（おきらく）」がテーマ。フォークではなくお箸で運ぶ創作イタリアンは、地元の宴席にも、家族の食卓の延長にも馴染む。月曜から土曜は23時まで、日祝も22時まで開けており、日常使いの選択肢として頼りになる。",
      "駐車場7台、最大30名までの貸切対応、各種カード対応――名古屋の南エリアで「人数が読めない夜」「子連れの夜」「会社の打ち上げ」を一手に引き受けるための機能が、過不足なく揃っている。",
    ],
  },
  {
    id: "r05",
    name: "手羽だるま 緑橋店",
    cuisine: "居酒屋・手羽先",
    area: "城東区・緑橋",
    region: "osaka",
    rating: "3.05",
    shape: "wide",
    image: "/restaurants/r05/r05-tebasaki-platter.jpg",
    heroImages: [
      "/restaurants/r05/r05-tebasaki-platter.jpg",
      "/restaurants/r05/r05-counter.jpg",
      "/restaurants/r05/r05-tables.jpg",
      "/restaurants/r05/r05-tebasaki-fried.jpg",
    ],
    gallery: [
      "/restaurants/r05/r05-tebasaki-platter.jpg",
      "/restaurants/r05/r05-counter.jpg",
      "/restaurants/r05/r05-tables.jpg",
      "/restaurants/r05/r05-table-4seat.jpg",
      "/restaurants/r05/r05-tebasaki-fried.jpg",
      "/restaurants/r05/r05-tomato.jpg",
    ],
    desc: "大阪メトロ緑橋駅から徒歩5分、城東区中浜の住宅街に佇む手羽先の居酒屋。カウンター席は一人飲み歓迎。最大30名までの貸切対応で、平日サク飲みから週末の宴会まで幅広く受ける、城東の日常使いの一軒。",
    address: "大阪府大阪市城東区中浜2-16-13",
    hours:
      "火-金 12:00 - 14:00（料理L.O. 13:00）/ 17:00 - 23:00（料理L.O. 22:30 ドリンクL.O. 22:30）/ 土日祝 17:00 - 23:00（料理L.O. 22:30）",
    closed: "月曜",
    seats: "カウンター席中心 / 最大30名貸切可",
    budget: "夜 ￥2,000〜￥2,999",
    nearest: "大阪メトロ中央線・今里筋線 緑橋駅 6番出口 徒歩5分",
    source: {
      label: "食べログ",
      url: "https://tabelog.com/osaka/A2701/A270306/27149302/",
    },
    tags: [
      "居酒屋",
      "手羽先",
      "一人飲み",
      "宴会",
      "貸切可",
      "ファミリー",
    ],
    highlights: [
      "カウンター主体で一人飲み歓迎。ふらっと立ち寄れる距離感",
      "最大30名までの貸切対応。会社の打ち上げ・送別会にも",
      "火-金は昼営業あり（12:00-14:00）。ランチ手羽先という選択肢",
      "テイクアウト対応。仕事帰りの晩酌セットにも",
    ],
    body: [
      "大阪メトロ中央線・今里筋線が交わる緑橋。その6番出口から商店街沿いに歩いて5分、城東区中浜の細い通りに灯る。手羽先専門の居酒屋というジャンルは大阪の中心部ではなかなか見ないが、ここはその数少ない一軒だ。",
      "カウンター席は「一人飲み大歓迎」を看板に掲げる。仕事帰りに一杯、サク飲みでテイクアウト、子連れで早めの夕食――客層を絞らず、城東のあらゆる夜のリズムに合わせて開けている店。火曜から金曜は昼12時から14時まで営業し、夕方17時から夜23時まで通す。",
      "30名まで対応する貸切は、近隣の家族・職場の小さな集まりに頼られる存在。ホットペッパー・ぐるなび経由のネット予約に加え、当日の電話予約も対応。月曜定休、それ以外は休まず開ける町場の止まり木。",
    ],
  },
  {
    id: "r06",
    name: "らーめん渡邉",
    cuisine: "ラーメン",
    area: "浅草",
    region: "tokyo",
    rating: "3.28",
    shape: "square",
    image: "/restaurants/r06/r06-hero.jpg",
    heroImages: [
      "/restaurants/r06/r06-hero.jpg",
      "/restaurants/r06/r06-storefront-1.jpg",
      "/restaurants/r06/r06-interior-1.jpg",
      "/restaurants/r06/r06-ramen-black.jpg",
    ],
    gallery: [
      "/restaurants/r06/r06-hero.jpg",
      "/restaurants/r06/r06-storefront-1.jpg",
      "/restaurants/r06/r06-storefront-2.jpg",
      "/restaurants/r06/r06-interior-1.jpg",
      "/restaurants/r06/r06-interior-2.jpg",
      "/restaurants/r06/r06-ramen-black.jpg",
      "/restaurants/r06/r06-noodle.jpg",
      "/restaurants/r06/r06-rice.jpg",
      "/restaurants/r06/r06-carrot.jpg",
    ],
    desc: "浅草仲見世通りからほど近く、馬道通りを折れた裏路地に灯る一軒。中華料理で腕を磨いた店主・渡邉直通氏が2018年から続ける鶏白湯ラーメン店。乳化にこだわり、ニンニクを使わず脂を閉じ込めた一杯を、カウンター18席のみの店内で。",
    address: "東京都台東区浅草1-33-7 RAYビル浅草",
    hours:
      "11:30 - 22:00（月・金は 11:30 - 20:00）",
    closed: "火曜",
    seats: "カウンター18席のみ / 全席禁煙",
    budget: "夜 ～￥999",
    nearest: "東武・都営・東京メトロ 浅草駅 徒歩圏",
    source: {
      label: "食べログ",
      url: "https://tabelog.com/tokyo/A1311/A131102/13223931/",
    },
    tags: ["ラーメン", "鶏白湯", "一人飲み", "禁煙"],
    highlights: [
      "中華料理出身の店主による、ニンニク不使用の鶏白湯ラーメン",
      "乳化にこだわり脂を閉じ込めた、計算された一椀",
      "カウンター18席のみ・全席禁煙、一人客中心の構成",
      "浅草仲見世から徒歩圏、馬道通りの裏路地という静かな立地",
    ],
    body: [
      "浅草寺のにぎわいから一歩外れた、馬道通りの裏路地。観光客の流れから外れた静かな角に「らーめん渡邉」の暖簾が出る。2018年7月開店、店主は中華料理で腕を磨いた渡邉直通氏。看板は鶏白湯ラーメン。",
      "「ニンニクはスープの繊細な味のバランスを崩してしまうので使いたくない」――店主の言葉どおり、にんにく不使用で組み立てる一杯は、鶏白湯の乳化と脂のバランスに全精度を傾ける構造になっている。中華料理出身の出汁感覚と、現代ラーメンの設計思想が一椀の中で結合しているのが、この店が支持される理由だ。",
      "席はカウンター18席のみ、全席禁煙。月曜・金曜は20時まで、それ以外は22時まで通し営業。火曜定休。一人で立ち寄って、一杯にじっくり向き合うための店として、浅草の夜の選択肢に静かに加わっている。",
    ],
  },
  {
    id: "r07",
    name: "中国菜 たな華",
    cuisine: "中華料理・四川",
    area: "緑区・鳴海",
    region: "nagoya",
    rating: "3.66",
    shape: "tall",
    image: "/restaurants/r07/r07-dandan-1.jpg",
    heroImages: [
      "/restaurants/r07/r07-dandan-1.jpg",
      "/restaurants/r07/r07-storefront.jpg",
      "/restaurants/r07/r07-interior-tables.jpg",
      "/restaurants/r07/r07-dandan-set.jpg",
    ],
    gallery: [
      "/restaurants/r07/r07-dandan-1.jpg",
      "/restaurants/r07/r07-dandan-set.jpg",
      "/restaurants/r07/r07-dandan-soup.jpg",
      "/restaurants/r07/r07-dandan-noodle.jpg",
      "/restaurants/r07/r07-dish-jelly.jpg",
      "/restaurants/r07/r07-storefront.jpg",
      "/restaurants/r07/r07-interior-counter.jpg",
      "/restaurants/r07/r07-interior-tables.jpg",
    ],
    desc: "名古屋市緑区・鳴海駅から徒歩7分。2022年9月にオープンした手作り四川料理の店。担々麺と唐揚げを看板に、住宅街の中で待ち客が出ることもある人気店。カウンター含む18席、全席禁煙。",
    address: "愛知県名古屋市緑区鳴海町字京田166",
    hours:
      "ランチ 11:00 - 14:30（料理L.O. 14:00 / ドリンクL.O. 14:30）/ ディナー 18:00 - 21:30（料理L.O. 21:00 / ドリンクL.O. 21:30）",
    closed: "水曜",
    seats: "18席（カウンター含む）/ 全席禁煙",
    budget: "夜 ￥2,000〜￥2,999",
    nearest: "名鉄名古屋本線 鳴海駅 南口 徒歩7分",
    source: {
      label: "食べログ",
      url: "https://tabelog.com/aichi/A2301/A230112/23082468/",
    },
    tags: [
      "中華料理",
      "四川料理",
      "担々麺",
      "禁煙",
      "ランチ営業",
      "駐車場あり",
      "一人飲み",
    ],
    highlights: [
      "2022年9月オープン、四川料理を軸にした「中国菜」の店",
      "担々麺と唐揚げが看板。家庭の中華の延長で楽しめる温度感",
      "席18席（カウンター含む）・全席禁煙",
      "駐車場あり（店前 + 第二駐車場）。車移動の名古屋緑区でも安心",
    ],
    body: [
      "名鉄鳴海駅から徒歩7分。住宅街と幹線道路の境目、京田の路地に灯る一軒。「中国菜 たな華」は2022年9月にオープンしたばかりの新しい店ながら、開店から短期間で地元に根を張り、夜の時間帯には待ち客が出る日もある四川料理店だ。",
      "看板は担々麺と唐揚げ。四川料理らしい辛味と痺れを軸にしながら、家庭の中華の延長で食べられる温度感に整えられているのが「中国菜」の屋号の意味するところだろう。食べログ評価3.66と、開店2年でこの数字に到達するのは中華料理店として明確に支持されている証だ。",
      "席は18席、カウンター含む。全席禁煙。ランチは11時から14時半、ディナーは18時から21時半と、昼夜とも同じ営業時間で安定して開ける。水曜定休。駐車場は店前と第二駐車場あり、車移動が前提の名古屋緑区エリアでも安心して立ち寄れる。",
    ],
  },
  {
    id: "r08",
    name: "やまみ",
    cuisine: "和食創作居酒屋",
    area: "千種区・池下",
    region: "nagoya",
    rating: "3.60",
    shape: "tall",
    image: "/restaurants/r08/r08-hero-sushi-roll.jpg",
    heroImages: [
      "/restaurants/r08/r08-hero-sushi-roll.jpg",
      "/restaurants/r08/r08-sushi-platter.jpg",
      "/restaurants/r08/r08-donburi-bowl.jpg",
    ],
    gallery: [
      "/restaurants/r08/r08-hero-sushi-roll.jpg",
      "/restaurants/r08/r08-sushi-platter.jpg",
      "/restaurants/r08/r08-donburi-bowl.jpg",
      "/restaurants/r08/r08-gyoza.jpg",
    ],
    desc: "名古屋・千種区の池下駅から徒歩5分。チサンマンション1階に佇む和食創作の居酒屋。カウンター6席とテーブル22席で、季節の刺身・揚げ物・一品料理を、銘酒とともに気軽に味わえる。",
    address: "愛知県名古屋市千種区池下1-6-20 チサンマンション1F",
    hours:
      "月-土 17:00 - 23:00（料理L.O. 22:00 / ドリンクL.O. 22:30）",
    closed: "日曜（月曜祝日の場合 → 日曜営業・翌月曜休み）",
    seats: "28席（カウンター6席 / テーブル22席）/ 全席禁煙",
    budget: "夜 ￥6,000〜￥7,999",
    nearest: "地下鉄東山線 池下駅 徒歩5分",
    source: {
      label: "食べログ",
      url: "https://tabelog.com/aichi/A2301/A230106/23032618/",
    },
    tags: [
      "居酒屋",
      "和食",
      "創作料理",
      "銘酒",
      "禁煙",
      "一人飲み",
      "デート",
    ],
    highlights: [
      "池下駅徒歩5分、千種区の住宅街のチサンマンション1階",
      "季節の刺身・揚げ物・一品料理に、銘酒の品揃え",
      "カウンター6席＋テーブル22席、全席禁煙",
      "月曜祝日対応の振替休あり、ネット予約可",
    ],
    body: [
      "池下駅から南へ歩いて5分。落ち着いた住宅街と商業ビルが混じる一角、チサンマンションの1階に「やまみ」の暖簾が出る。看板は控えめだが、扉を開けると、6席のカウンターと22席のテーブルが整然と並ぶ和の空間が広がる。",
      "旬の魚を使った刺身、季節野菜の揚げ物、一品料理から〆のごはんものまで――和食の幅をひと通り押さえつつ、創作の手数を効かせる。銘酒の品揃えも豊富で、「気軽に」を軸に置きながら、夜の食事に必要な要素を過不足なく揃えた構成だ。",
      "月曜から土曜は17時から23時まで（料理L.O.22時、ドリンクL.O.22時30分）、日曜定休。月曜祝日の場合は日曜営業して翌月曜休み。全席禁煙、ネット予約可。池下界隈で「もう一軒」「ゆっくり一杯」のどちらにも使える、頼りになる和食の止まり木。",
    ],
  },
  {
    id: "r09",
    name: "ももやき酒場 雄火屋",
    cuisine: "居酒屋・地鶏",
    area: "博多区・美野島",
    region: "fukuoka",
    rating: "3.11",
    shape: "wide",
    image: "/restaurants/r09/r09-hero.jpg",
    heroImages: [
      "/restaurants/r09/r09-hero.jpg",
      "/restaurants/r09/r09-dish-4.jpg",
      "/restaurants/r09/r09-interior-1.jpg",
      "/restaurants/r09/r09-dish-1.jpg",
    ],
    gallery: [
      "/restaurants/r09/r09-hero.jpg",
      "/restaurants/r09/r09-dish-4.jpg",
      "/restaurants/r09/r09-dish-1.jpg",
      "/restaurants/r09/r09-dish-2.jpg",
      "/restaurants/r09/r09-interior-1.jpg",
      "/restaurants/r09/r09-interior-2.jpg",
      "/restaurants/r09/r09-interior-3.jpg",
    ],
    desc: "福岡・博多区美野島の地鶏×焼酎の酒場。看板の「ももやき」を炭火で炙る一皿と、九州の焼酎を中心に揃えたドリンクで、平日のサク飲みから金土の深夜まで開ける32席の居酒屋。",
    address: "福岡県福岡市博多区美野島3-13-2",
    hours:
      "月-木 11:30 - 13:30（L.O. 13:30）/ 17:00 - 23:00（料理L.O. 22:00 ドリンクL.O. 22:30）/ 金土 17:00 - 翌1:00（料理L.O. 0:00 ドリンクL.O. 0:30）",
    closed: "不定休",
    seats: "32席 / 個室あり / 全席禁煙",
    budget: "夜 ￥3,000〜￥3,999",
    nearest: "西鉄 高宮駅 徒歩15分",
    reservationUrl: "https://www.hotpepper.jp/strJ003737277/yoyaku/",
    source: {
      label: "ホットペッパーグルメ",
      url: "https://www.hotpepper.jp/strJ003737277/",
    },
    tags: [
      "居酒屋",
      "鶏料理",
      "地鶏",
      "焼酎",
      "個室",
      "一人飲み",
      "深夜営業",
      "禁煙",
    ],
    highlights: [
      "看板は炭火で焼き上げる地鶏の「ももやき」",
      "九州産焼酎を中心に揃えたドリンクラインナップ",
      "32席に個室あり、一人飲みから小グループ・接待まで対応",
      "金土は深夜1時まで営業、平日は昼営業もあり",
    ],
    body: [
      "高宮駅から美野島方面へ歩いて15分。住宅と商店が混じる路地に、暖簾と赤提灯を出した「雄火屋（OBIYA）」が灯る。看板は地鶏の「ももやき」。炭火の上で皮目を焼き上げる一串・一皿が、店の中心軸に据えられている。",
      "焼酎は九州産を中心に揃え、地鶏との相性で選ぶ。鶏刺し四種盛りや、皮ぱりっと焼いた鶏もも、つくね、唐揚げ・タルタルがけなど、鶏に振り切ったメニューが手の届く価格帯で並ぶ。32席の店内には個室席もあり、平日の一人飲みから週末の小グループまで、用途を選ばない。",
      "月-木は11:30から昼営業（L.O.13:30）、夜は17:00-23:00（料理L.O.22:00 ドリンクL.O.22:30）。金・土は17:00から翌1:00まで（料理L.O.0:00 ドリンクL.O.0:30）と深夜帯も対応。全席禁煙、ネット予約可、クーポンあり。博多区南東エリアで地鶏を確実に楽しみたい一軒。",
    ],
  },
  {
    id: "r10",
    name: "第三共進丸",
    cuisine: "日本料理・海鮮",
    area: "中央区・長浜",
    region: "fukuoka",
    rating: "3.40",
    shape: "square",
    image: "/restaurants/r10/r10-hero.jpg",
    heroImages: [
      "/restaurants/r10/r10-hero.jpg",
      "/restaurants/r10/r10-dish-2.jpg",
      "/restaurants/r10/r10-dish-1.jpg",
    ],
    gallery: [
      "/restaurants/r10/r10-hero.jpg",
      "/restaurants/r10/r10-dish-2.jpg",
      "/restaurants/r10/r10-dish-1.jpg",
    ],
    desc: "福岡・中央区長浜の鮮魚市場のすぐ近く、赤坂駅から歩いて立ち寄れる和食居酒屋。長浜の港町の流通を活かした寿司・刺身を、22席のカウンター・テーブル・小上がりで。",
    address: "福岡県福岡市中央区長浜2-5",
    hours: "毎日 17:00 - 23:00",
    closed: "元旦・1月2日のみ",
    seats: "22席（カウンター・テーブル・小上がり）",
    budget: "夜 ￥3,000〜￥3,999",
    nearest: "福岡市地下鉄空港線 赤坂駅 徒歩圏",
    source: {
      label: "食べログ",
      url: "https://tabelog.com/fukuoka/A4001/A400104/40015417/",
    },
    tags: ["日本料理", "海鮮", "居酒屋", "小上がり", "一人飲み"],
    highlights: [
      "福岡・長浜の鮮魚流通を背景にした寿司・海鮮",
      "カウンター・テーブル・小上がりの22席、一人〜小グループ対応",
      "毎日17:00-23:00、元旦と1月2日以外は無休",
      "赤坂駅から徒歩圏",
    ],
    body: [
      "福岡市の鮮魚市場「長浜」の名を冠した一軒。実際の店舗は中央区長浜2丁目の住宅と商業の境目にあり、赤坂駅からも徒歩でアクセスできる。看板は寿司と海鮮の盛り合わせ。長浜の流通を背景に、その日の魚を握りや刺身で出すのが基本軸だ。",
      "22席の店内はカウンター・テーブル・小上がりに分かれ、一人客から小グループまで自然に納まる。胡蝶蘭の飾られた入口横には、季節ごとに変わる仕込みの気配が見える。日本料理の所作と、居酒屋の使い勝手を一軒の中で同居させた構造だ。",
      "営業は毎日17:00から23:00、元旦・1月2日のみ休み。長浜2丁目という立地を考えれば、観光や出張で福岡を訪れた夜に「魚を食べたい」と思った時の選択肢として、安定した一軒。",
    ],
  },
  {
    id: "r12",
    name: "社交酒場イム",
    cuisine: "居酒屋・立ち飲み",
    area: "中区・栄/矢場町",
    region: "nagoya",
    rating: "3.37",
    shape: "wide",
    image: "/restaurants/r12/r12-hero.jpg",
    heroImages: [
      "/restaurants/r12/r12-hero.jpg",
      "/restaurants/r12/r12-interior-1.jpg",
      "/restaurants/r12/r12-interior-2.jpg",
      "/restaurants/r12/r12-dish-1.jpg",
    ],
    gallery: [
      "/restaurants/r12/r12-hero.jpg",
      "/restaurants/r12/r12-interior-1.jpg",
      "/restaurants/r12/r12-interior-2.jpg",
      "/restaurants/r12/r12-dish-1.jpg",
      "/restaurants/r12/r12-dish-2.jpg",
      "/restaurants/r12/r12-dish-3.jpg",
    ],
    desc: "名古屋・栄、矢場町通の路地に灯る「大人のアジト」。一階は立ち呑みのせんべろスタンド、二階はカウンター・ソファー・座敷の49席。月-日 深夜2時まで通し営業。",
    address: "愛知県名古屋市中区栄3-25-28",
    hours:
      "月-金 17:00 - 翌2:00 / 土日祝 15:00 - 翌2:00 / 祝前後日 17:00 - 翌2:00",
    closed: "不定休",
    seats: "49席（一階 立ち呑みスタンド / 二階 カウンター・ソファー・座敷）/ 個室あり",
    budget: "夜 ￥4,000〜￥4,999",
    nearest: "矢場町駅 4番出口 徒歩6分 / 栄駅 徒歩9分 / 名古屋PARCO 徒歩2分",
    reservationUrl: "https://www.hotpepper.jp/strJ003737255/yoyaku/",
    source: {
      label: "ホットペッパーグルメ",
      url: "https://www.hotpepper.jp/strJ003737255/",
    },
    tags: [
      "居酒屋",
      "立ち飲み",
      "せんべろ",
      "個室",
      "もつ鍋",
      "一人飲み",
      "深夜営業",
      "宴会",
    ],
    highlights: [
      "一階は立ち呑みのせんべろスタンド、二階は49席の本格居酒屋",
      "月-金17:00-翌2:00、土日祝15:00-翌2:00 の深夜営業",
      "矢場町・栄・名古屋PARCO徒歩圏の好立地",
      "個室・飲み放題・食べ放題、グループ宴会から一人飲みまで",
    ],
    body: [
      "矢場町駅4番出口から名古屋PARCO方面へ歩いて2-6分、栄三丁目の路地。木骨と古材を組み合わせた店構えが「社交酒場イム」だ。一階は立ち呑みスタンドで「せんべろ」（千円でべろべろ）の予約不可・ふらっと立ち寄り席。二階はカウンター・革ソファー・座敷の落ち着いた構成で、グループや個室利用にも対応する。",
      "49席の店内は、一階と二階で時間の流れが違う。一階の立ち呑みは仕事帰りの一杯にちょうどいい速度、二階はじっくり座って話せる速度。もつ鍋や名物料理に加え、飲み放題・食べ放題のコース、各種飲み比べセットも揃う。「社交」を看板に掲げるとおり、一人客もグループも、客同士が自然に交わる空気のある店。",
      "月曜から金曜は17時から翌2時まで、土日祝は15時から翌2時まで。深夜帯まで開けることで、栄エリアの「もう一軒」「終電後」の選択肢として機能する。ネット予約可、個室あり、飲み放題・食べ放題あり、喫煙可。",
    ],
  },
  {
    id: "r13",
    name: "KITEYA",
    cuisine: "洋食",
    area: "東区・徳川町",
    region: "nagoya",
    shape: "wide",
    image: "/restaurants/r13/r13-image-1.jpg",
    heroImages: [
      "/restaurants/r13/r13-image-1.jpg",
      "/restaurants/r13/r13-image-2.jpg",
      "/restaurants/r13/r13-image-3.jpg",
      "/restaurants/r13/r13-image-4.jpg",
    ],
    gallery: [
      "/restaurants/r13/r13-image-1.jpg",
      "/restaurants/r13/r13-image-2.jpg",
      "/restaurants/r13/r13-image-3.jpg",
      "/restaurants/r13/r13-image-4.jpg",
    ],
    desc: "名古屋・東区徳川町、住宅街のリビングのような落ち着いた雰囲気で、洋食の王道を出す34席の店。ランチからディナーまで、牛ヒレのカツレツやハンバーグ、紅ズワイガニのクリームコロッケが揃う。森下駅から徒歩5分。",
    address: "愛知県名古屋市東区徳川町1904 シャロームK 1F",
    hours:
      "ランチ 11:00 - 14:30（L.O. 14:00）/ ディナー 17:00 - 22:00（L.O. 21:00）※木曜はランチのみ",
    closed: "不定休",
    seats: "34席 / 全席禁煙",
    budget: "ランチ ￥1,000〜￥2,000 / ディナー ￥2,000前後",
    nearest: "名鉄瀬戸線 森下駅 徒歩5分",
    reservationUrl: "https://www.hotpepper.jp/strJ003411304/yoyaku/",
    source: {
      label: "ホットペッパーグルメ",
      url: "https://www.hotpepper.jp/strJ003411304/",
    },
    tags: [
      "洋食",
      "ハンバーグ",
      "カツレツ",
      "ランチ",
      "禁煙",
      "デート",
      "記念日",
    ],
    highlights: [
      "牛ヒレのカツレツ・ハンバーグ・紅ズワイガニのクリームコロッケなど洋食の王道",
      "34席・全席禁煙、住宅街のリビングのような落ち着いた雰囲気",
      "名鉄瀬戸線「森下」駅 徒歩5分",
      "ランチ・ディナー両方営業（木曜はランチのみ）",
    ],
    body: [
      "名鉄瀬戸線「森下」駅から東へ歩いて5分。住宅と小商いが交ざる徳川町の路地、シャロームKの一階に「KITEYA（キテヤ）」の灯が点る。看板は控えめだが、扉を開けると、家庭のリビングを少し豪華にしたような木とファブリックの空間が広がる。34席は全席禁煙、ランチもディナーも同じ温度感で過ごせる構えだ。",
      "メニューは洋食の王道。牛ヒレ肉のカツレツ、自家製ハンバーグ（ソースは複数展開）、紅ズワイガニのクリームコロッケ、牛ヒレ肉のステーキ赤ワインソース、オムライス。シティリビングの取材記事でも「ちょっと豪華なリビングのような」と紹介された通り、料理の格と日常使いの距離感を両立させている。",
      "営業はランチ11:00〜14:30（L.O.14:00）、ディナー17:00〜22:00（L.O.21:00）。木曜はランチのみ、定休は不定休。ランチ1,000〜2,000円、ディナー2,000円前後と、洋食の王道を気負わず使える価格帯。住宅街の徳川町で「今日は外食したい」と思った時の、しっかりした選択肢。",
    ],
  },
  {
    id: "r14",
    name: "焼肉ホルモン 肉ぶくろ",
    cuisine: "焼肉・ホルモン",
    area: "東淀川区・上新庄",
    region: "osaka",
    shape: "wide",
    image: "/restaurants/r14/r14-image-1.jpg",
    heroImages: [
      "/restaurants/r14/r14-image-1.jpg",
      "/restaurants/r14/r14-image-2.jpg",
      "/restaurants/r14/r14-image-3.jpg",
      "/restaurants/r14/r14-image-4.jpg",
    ],
    gallery: [
      "/restaurants/r14/r14-image-1.jpg",
      "/restaurants/r14/r14-image-2.jpg",
      "/restaurants/r14/r14-image-3.jpg",
      "/restaurants/r14/r14-image-4.jpg",
      "/restaurants/r14/r14-image-5.jpg",
      "/restaurants/r14/r14-image-6.jpg",
      "/restaurants/r14/r14-image-7.jpg",
    ],
    desc: "大阪・東淀川区豊新の住宅街、上新庄駅から徒歩7分。カウンター7席に掘りごたつ個室を備えた23席の小規模焼肉店。看板は名物「にんにく塩タン」と近江牛大トロてっちゃん。少人数〜最大23名の貸切まで対応。",
    address:
      "大阪府大阪市東淀川区豊新4-12-9 クリアコートU 1F",
    hours: "17:00 - 翌0:00（料理L.O. 23:00 / ドリンクL.O. 23:00）",
    closed: "不定休あり（要店舗確認）",
    seats:
      "23席（カウンター7席 / テーブル4名・6名席 / 掘りごたつ個室6名）/ 最大23名 貸切可",
    budget: "夜 ￥3,000〜￥3,999",
    nearest: "阪急京都線 上新庄駅 徒歩7分",
    reservationUrl: "https://www.hotpepper.jp/strJ004444109/yoyaku/",
    source: {
      label: "ホットペッパーグルメ",
      url: "https://www.hotpepper.jp/strJ004444109/",
    },
    tags: [
      "焼肉",
      "ホルモン",
      "個室",
      "掘りごたつ",
      "宴会",
      "貸切",
      "タン",
    ],
    highlights: [
      "名物「にんにく塩タン」と近江牛大トロてっちゃんが看板",
      "カウンター7席＋掘りごたつ個室を含む23席、最大23名で貸切可",
      "阪急京都線「上新庄」駅 徒歩7分",
      "コース 4,900円〜11,900円、夜の平均予算 3,000〜4,000円",
    ],
    body: [
      "阪急京都線「上新庄」駅から豊新方面へ歩いて7分。住宅街のなかに、クリアコートUの一階を構える「焼肉ホルモン 肉ぶくろ」がある。カウンター7席、テーブル4名・6名席、掘りごたつの6名個室で計23席。最大23名で貸切も組める、近所の焼肉屋として手の届く規模感だ。",
      "看板は名物「にんにく塩タン」（1,518円）と近江牛大トロてっちゃん（968円）。〆の羅臼昆布のしおラーメン（858円）まで、一品の輪郭がはっきりしている。コースは4,900円から11,900円まで段階を組んであり、「手頃に焼肉」から「特別な日」まで幅を広く取る。夜の平均予算は3,000〜4,000円。",
      "営業は17:00から翌0:00（料理L.O.23:00、ドリンクL.O.23:00）。喫煙は加熱式たばこのみ可。掘りごたつの個室があるので、上新庄エリアで「ちょっとした宴会」「家族での焼肉」「同僚と気を遣わずに」のような日常使いから、貸切での集まりまで使い分けられる。",
    ],
  },
  {
    id: "r15",
    name: "クラシック音楽喫茶・Bar あんさんぶる",
    cuisine: "クラシック音楽喫茶・Bar",
    area: "城東区・関目",
    region: "osaka",
    shape: "wide",
    image: "/restaurants/r15/r15-image-1.jpg",
    heroImages: [
      "/restaurants/r15/r15-image-1.jpg",
      "/restaurants/r15/r15-image-2.jpg",
      "/restaurants/r15/r15-image-3.jpg",
      "/restaurants/r15/r15-image-4.jpg",
    ],
    gallery: [
      "/restaurants/r15/r15-image-1.jpg",
      "/restaurants/r15/r15-image-2.jpg",
      "/restaurants/r15/r15-image-3.jpg",
      "/restaurants/r15/r15-image-4.jpg",
      "/restaurants/r15/r15-image-5.jpg",
      "/restaurants/r15/r15-image-6.jpg",
      "/restaurants/r15/r15-image-7.jpg",
      "/restaurants/r15/r15-image-8.jpg",
    ],
    desc: "大阪・城東区関目、京阪「関目」駅1番出口から徒歩30秒。クラシック音楽を聴きながら過ごせる18席の喫茶＋Bar。昼は喫茶、夜はBarの二部営業で、関目商店街の住人と音楽好きの常連が集う。",
    address: "大阪府大阪市城東区関目5-3-28",
    hours: "喫茶 11:30〜17:00（L.O. 16:30）/ Bar 19:30〜24:00（L.O. 23:30）",
    closed: "要店舗確認",
    seats: "18席（最大宴会25名）",
    budget: "要確認",
    nearest: "京阪本線 関目駅 1番出口 徒歩30秒",
    phone: "06-6930-1219",
    reservationUrl: "https://www.hotpepper.jp/strJ000857579/",
    rating: "3.07",
    source: {
      label: "ホットペッパーグルメ",
      url: "https://www.hotpepper.jp/strJ000857579/",
    },
    tags: ["カフェ", "Bar", "クラシック音楽", "レトロ喫茶", "関目", "深夜営業"],
    highlights: [
      "クラシック音楽が流れる喫茶＋Barの二部営業",
      "18席＋最大宴会25名、関目商店街の小規模空間",
      "京阪本線「関目」駅 1番出口 徒歩30秒",
      "喫茶 11:30〜17:00 / Bar 19:30〜24:00",
    ],
    body: [
      "京阪本線「関目」駅1番出口を出て北へ30秒。関目商店街の入口近くに、「クラシック音楽喫茶・Bar あんさんぶる」がある。18席の店内は、昼は喫茶、夜はBarの二部営業。レトロ喫茶の作法を残しながら、店全体にクラシック音楽が静かに流れる、関目では珍しいコンセプトの一軒だ。",
      "喫茶営業は11:30〜17:00（L.O.16:30）、Bar営業は19:30〜24:00（L.O.23:30）。最大宴会25名まで対応するので、音楽好きが集まる小規模なパーティにも使える。喫煙は店内可。",
      "関目駅至近の立地と「クラシック音楽喫茶」というユニークな業態は、地元住民・音楽愛好家・近隣勤務の常連で支えられている。日中の喫茶利用、仕事終わりのBar利用、どちらも「BGMではなく音楽を聴きにいく」感覚で過ごせる店として機能している。",
    ],
  },
  {
    id: "r16",
    name: "ほたる珈房",
    cuisine: "カフェ・自家焙煎コーヒー",
    area: "緑区・津久井湖",
    region: "kanagawa",
    shape: "tall",
    image: "/restaurants/r16/r16-01.webp",
    heroImages: [
      "/restaurants/r16/r16-01.webp",
      "/restaurants/r16/r16-02.webp",
      "/restaurants/r16/r16-05.webp",
      "/restaurants/r16/r16-08.webp",
    ],
    gallery: [
      "/restaurants/r16/r16-01.webp",
      "/restaurants/r16/r16-02.webp",
      "/restaurants/r16/r16-03.webp",
      "/restaurants/r16/r16-04.webp",
      "/restaurants/r16/r16-05.webp",
      "/restaurants/r16/r16-06.webp",
      "/restaurants/r16/r16-07.webp",
      "/restaurants/r16/r16-08.webp",
      "/restaurants/r16/r16-09.webp",
      "/restaurants/r16/r16-10.webp",
    ],
    desc: "相模原市緑区・津久井湖を望む竹林のログハウスカフェ。土日のみ営業の自家焙煎コーヒー専門店で、看板は希少な「ピーベリー」豆を6段階の焙煎度から選べるオーダーメイド焙煎。店前の大沢川では初夏にほたる観賞も。",
    address: "神奈川県相模原市緑区中野1935-1",
    hours: "9:00〜17:00（土日のみ営業）",
    closed: "平日定休（土日のみ営業）",
    seats: "要確認",
    budget: "〜￥1,000",
    nearest: "JR横浜線 橋本駅 バス利用",
    instagram: "https://www.instagram.com/hotaru_koubou/",
    source: {
      label: "Instagram",
      url: "https://www.instagram.com/hotaru_koubou/",
    },
    tags: ["カフェ", "自家焙煎", "コーヒー", "週末限定", "ログハウス", "ほたる"],
    highlights: [
      "希少な「ピーベリー」豆を6段階の焙煎度からオーダーメイド焙煎（約40分）",
      "竹林に囲まれた大沢川沿いのログハウスカフェ。土日のみ9:00〜17:00営業",
      "初夏にほたる観賞ができる大沢川沿いの立地",
      "コーヒー豆のオンライン販売も展開",
    ],
    body: [
      "JR横浜線「橋本」駅からバスで向かう津久井湖近郊、大沢川沿いの竹林に囲まれたログハウスに「ほたる珈房」がある。営業は土日のみ9:00〜17:00。日常の喧騒から離れた場所で、豆を選び、焙煎の香りを待つ時間が目的になる一軒だ。",
      "希少な「ピーベリー」豆を中心に取り扱う自家焙煎コーヒーが看板。焙煎度合いは6段階から選べるオーダーメイドスタイルで、その場で焙煎して約40分。焙煎豆のオンライン販売も展開している。フードはスノーボール（3個200円）、アイスのせ珈琲ゼリー（400円）など小さなお菓子と合わせてどうぞ。",
      "店前を流れる大沢川は、初夏（6月頃〜）にほたる観賞ができる立地として地元に知られる。夏季はほたる観賞会に合わせた夜間営業も予定。ドライブ・サイクリングのついでに立ち寄れる「週末だけのコーヒー豆屋」として、コーヒー愛好家が県内外から訪れる。",
    ],
  },
  {
    id: "r17",
    name: "白泉堂",
    cuisine: "昭和レトロ喫茶・駄菓子",
    area: "城東区・今福西",
    region: "osaka",
    shape: "wide",
    image: "/restaurants/r17/r17-01.jpg",
    heroImages: [
      "/restaurants/r17/r17-01.jpg",
      "/restaurants/r17/r17-02.jpg",
      "/restaurants/r17/r17-03.jpg",
    ],
    gallery: [
      "/restaurants/r17/r17-01.jpg",
      "/restaurants/r17/r17-02.jpg",
      "/restaurants/r17/r17-03.jpg",
    ],
    desc: "大阪・城東区今福西の昭和商店街に佇む創業約60年の老舗喫茶。店先で駄菓子といか焼きを販売しながら、奥にはサイフォンコーヒーが揺れる昭和レトロな喫茶空間が続く。神戸六甲牧場のソフトクリームも人気。",
    address: "大阪府大阪市城東区今福西1-9-27",
    hours: "9:00〜18:00",
    closed: "日曜",
    seats: "要確認",
    budget: "〜￥999",
    nearest: "Osaka Metro今里筋線 蒲生四丁目駅 徒歩圏",
    phone: "06-6931-4894",
    source: {
      label: "大阪府商店街魅力発見サイト",
      url: "https://osaka-shotengai-info.com/shop/hakusendo/",
    },
    tags: ["喫茶店", "駄菓子", "いか焼き", "昭和レトロ", "城東区", "老舗"],
    highlights: [
      "「元祖いか焼き」（200円）と創業来変わらぬ昭和レトロ喫茶",
      "創業約60年。駄菓子・いか焼き＋サイフォンコーヒーの二刀流",
      "アイス最中100円・ソフトクリーム200円、1,000円以下パフェも",
      "キャッシュレス決済（PayPay・auPay・d払い・楽天Pay）対応",
    ],
    body: [
      "Osaka Metro今里筋線「蒲生四丁目」駅から徒歩圏、今福西の昭和商店街に「白泉堂（はくせんどう）」がある。創業約60年、店先に駄菓子や「元祖いか焼き」（200円）が並ぶ二刀流の老舗だ。奥に足を踏み入れると、サイフォンコーヒーの揺れる昭和レトロな喫茶空間が待っている。",
      "看板は「元祖いか焼きの店」を名乗る創業来の味。いか焼き200円、アイス最中100円、ソフトクリーム200円と値付けも昭和のまま。神戸六甲牧場のソフトクリームや1,000円以下のパフェなど甘味系も充実する。PayPay・auPay・d払い・楽天Payと、決済だけは現代に対応済み。",
      "営業は9:00〜18:00、定休日は日曜。地元住民が駄菓子を手にとり、昭和レトロ好きがわざわざ訪れ、複数のメディアに「昭和のままの喫茶店」として紹介される、今福西の時間が止まった一軒だ。",
    ],
  },
  {
    id: "r18",
    name: "居酒屋 浅い月会い 大阪城北詰駅前店",
    cuisine: "居酒屋",
    area: "都島区・大阪城北詰",
    region: "osaka",
    rating: "3.08",
    shape: "wide",
    image: "/restaurants/r18/r18-image-1.jpg",
    heroImages: [
      "/restaurants/r18/r18-image-1.jpg",
      "/restaurants/r18/r18-image-2.jpg",
      "/restaurants/r18/r18-image-3.jpg",
      "/restaurants/r18/r18-image-4.jpg",
    ],
    gallery: [
      "/restaurants/r18/r18-image-1.jpg",
      "/restaurants/r18/r18-image-2.jpg",
      "/restaurants/r18/r18-image-3.jpg",
      "/restaurants/r18/r18-image-4.jpg",
      "/restaurants/r18/r18-image-5.jpg",
    ],
    desc: "JR東西線「大阪城北詰」駅1番出口から徒歩1〜2分、ホワイトチムニービル2階。カウンター・テーブル・ペット可テラスの3シーンで計30席。秘伝のタレで仕上げた鶏の唐揚げ500円と280円ドリンクが看板の、肩の凝らない居酒屋。",
    address: "大阪府大阪市都島区片町2-7-54 ホワイトチムニー 2F",
    hours: "月〜金 ランチ 11:30〜14:00 / ディナー 17:00〜翌0:00",
    closed: "土曜・日曜・祝日",
    seats: "30席（テーブル10／カウンター8／テラス12）",
    budget: "夜 ￥2,000〜￥2,999",
    nearest: "JR東西線 大阪城北詰駅 1番出口 徒歩1〜2分",
    phone: "06-6356-1128",
    reservationUrl: "https://www.hotpepper.jp/strJ004402380/",
    source: {
      label: "ホットペッパーグルメ",
      url: "https://www.hotpepper.jp/strJ004402380/",
    },
    tags: ["居酒屋", "おでん", "海鮮", "テラス席", "ペット可", "宴会"],
    highlights: [
      "秘伝のタレで二度揚げした鶏の唐揚げ（500円）が店内人気No.1",
      "カウンター・テーブル・ペット可テラス席の3シーン、10名以上で貸切可",
      "JR東西線「大阪城北詰」駅1番出口 徒歩1〜2分",
      "サッポロ黒ラベル生・デュワーズハイボール各280円の低価格ドリンク",
    ],
    body: [
      "JR東西線「大阪城北詰」駅1番出口を出て、ホワイトチムニービル2階へ。「居酒屋 浅い月会い 大阪城北詰駅前店」は、カウンター8席、テーブル10席、ペット連れ可のテラス12席で計30席。昼はランチ（11:30〜14:00）、夜は17:00から翌0:00と、使いやすい2部構成だ。",
      "人気No.1は秘伝のタレで仕上げた「鶏の唐揚げ」（500円）。山芋のふわふわ焼き（550円）やおでん各種など素直な一品が揃い、サッポロ黒ラベル生・デュワーズハイボール各280円という低価格ドリンクが空気を軽くする。飲み放題付きコースは3,500円〜。",
      "テラスはペット同伴可、10名以上で貸切対応と間口は広い。平日は大阪城北詰・京橋エリアの仕事帰りに、週末は少人数宴会や仲間との集まりに。夜の予算は平均2,000〜3,000円と肩の凝らない居酒屋として機能している。",
    ],
  },
  {
    id: "r19",
    name: "おばんざいと炭火焼 小次郎",
    cuisine: "居酒屋（おばんざい・炭火焼）",
    area: "福島区・野田阪神",
    region: "osaka",
    rating: "3.02",
    shape: "tall",
    image: "/restaurants/r19/r19-image-1.jpg",
    heroImages: [
      "/restaurants/r19/r19-image-1.jpg",
      "/restaurants/r19/r19-image-2.jpg",
      "/restaurants/r19/r19-image-3.jpg",
      "/restaurants/r19/r19-image-4.jpg",
    ],
    gallery: [
      "/restaurants/r19/r19-image-1.jpg",
      "/restaurants/r19/r19-image-2.jpg",
      "/restaurants/r19/r19-image-3.jpg",
      "/restaurants/r19/r19-image-4.jpg",
      "/restaurants/r19/r19-image-5.jpg",
    ],
    desc: "Osaka Metro千日前線「野田阪神」駅8番出口から徒歩3分。2025年12月開業の新店。姉妹店「亀太郎」の特製出汁を引き継ぐおばんざいと備長炭炭火焼きが看板。1F〜2F計45席、宴会コース4,500円〜。",
    address: "大阪府大阪市福島区大開1-13-1",
    hours: "月・水〜金 17:00〜翌0:00 / 土日祝 16:00〜翌0:00（料理L.O. 23:00）",
    closed: "火曜",
    seats: "45席（1F カウンター7席＋テーブル / 2F 貸切宴会スペース6〜20名）",
    budget: "夜 ￥2,000〜￥3,000",
    nearest: "Osaka Metro千日前線 野田阪神駅 8番出口 徒歩約3分",
    phone: "050-1792-5888",
    reservationUrl: "https://www.hotpepper.jp/strJ004558750/",
    source: {
      label: "ホットペッパーグルメ",
      url: "https://www.hotpepper.jp/strJ004558750/",
    },
    tags: ["居酒屋", "おばんざい", "炭火焼", "宴会", "個室", "貸切"],
    highlights: [
      "2025年12月開業。姉妹店「亀太郎」と同じ特製出汁を使うおばんざい",
      "知覧鶏モモ肉タタキ・備長炭炭火焼きが看板。1F〜2F計45席",
      "Osaka Metro千日前線「野田阪神」駅 8番出口 徒歩約3分",
      "宴会コース 4,500円〜、2F貸切宴会スペース6〜20名対応",
    ],
    body: [
      "Osaka Metro千日前線「野田阪神」駅8番出口から徒歩3分。野田阪神本通商店会の一角、旧「定食や 江戸善」跡地に2025年12月12日オープンした「おばんざいと炭火焼 小次郎」がある。1F はカウンター7席に複数テーブル、2Fは6〜20名対応の貸切宴会スペース、計45席のウッディな空間だ。",
      "おばんざいと炭火焼きを看板に据えるのは、姉妹店「亀太郎」と共通する特製出汁を生かした業態。知覧鶏モモ肉タタキ、サーモン炭タタキ、子持ちニシンの丸干しや備長炭による炭火焼きが揃う。宴会コースは飲み放題付きで4,500円〜、満足コース5,000円〜。",
      "夜の平均予算は2,000〜3,000円。土日祝は16:00から開くので、早めの夕食にも対応する。野田阪神本通という商店街内の立地で、地元密着の宴会居酒屋として動き始めたばかりの新店だ。",
    ],
  },
  {
    id: "r20",
    name: "アンナンブルー izumi168",
    cuisine: "ベトナム料理",
    area: "東区・泉",
    region: "nagoya",
    rating: "3.50",
    shape: "wide",
    image: "/restaurants/r20/r20-image-1.jpg",
    heroImages: [
      "/restaurants/r20/r20-image-1.jpg",
      "/restaurants/r20/r20-image-2.jpg",
      "/restaurants/r20/r20-image-3.jpg",
      "/restaurants/r20/r20-image-4.jpg",
    ],
    gallery: [
      "/restaurants/r20/r20-image-1.jpg",
      "/restaurants/r20/r20-image-2.jpg",
      "/restaurants/r20/r20-image-3.jpg",
      "/restaurants/r20/r20-image-4.jpg",
      "/restaurants/r20/r20-image-5.jpg",
    ],
    desc: "名古屋市営地下鉄桜通線「高岳」駅2番出口から徒歩約5分、東区泉の路地に面したベトナム料理ダイニングバー。創業20年来の看板・生春巻（ゴイクン）は来店客の約9割が注文。完全個室（最大10名）・テラス席（ペット可）完備。食べログ3.50。",
    address: "愛知県名古屋市東区泉3-11-29 1F",
    hours: "火〜金・祝前 18:00〜23:00 / 土日祝 ランチ11:30〜15:00・ディナー18:00〜23:00（料理L.O. 22:00）",
    closed: "月曜（祝日の場合は翌火曜）",
    seats: "30席（完全個室最大10名・テラス席あり）",
    budget: "夜 ￥4,000〜￥4,999 / 昼 ￥1,000〜￥1,999",
    nearest: "名古屋市営地下鉄桜通線 高岳駅 2番出口 徒歩約5分",
    phone: "052-908-3929",
    reservationUrl: "https://www.hotpepper.jp/strJ003559994/",
    source: {
      label: "ホットペッパーグルメ",
      url: "https://www.hotpepper.jp/strJ003559994/",
    },
    tags: ["ベトナム料理", "エスニック", "個室", "デート", "記念日", "テラス席"],
    highlights: [
      "来店客の約9割が注文する生春巻（ゴイクン）が創業20年来の看板",
      "完全個室（最大10名）・テラス席（ペット可、喫煙可）あり",
      "名古屋市営地下鉄桜通線「高岳」駅 2番出口 徒歩約5分",
      "食べログ3.50（76件）。夜の予算4,000〜5,000円",
    ],
    body: [
      "名古屋市営地下鉄桜通線「高岳」駅2番出口から徒歩約5分、東区泉の路地に面した「アンナンブルー izumi168」がある。2022年8月に、同名店「アンナンブルー栄」の復活版として、34年続いたメキシコ料理店「ロスノビオス」跡地に居抜きで開いたベトナム料理・ダイニングバーだ。",
      "創業20年来の看板は生春巻（ゴイクン）。来店客の約9割が注文する定番で、「日本人の口に合うマイルドなアレンジ」が評価されている。バインセオ（1,600円）、鶏肉のフォー（1,400円）、旧ロスノビオスから引き継いだソペス（1,200円）など、ベトナムとメキシコが混在するメニューが並ぶ。食べログは3.50（76件）。",
      "シックに落とした照明、完全個室（最大10名）、ペット可・喫煙可のテラス席を備えた30席。デート・記念日・接待・少人数の会食に向く構成で、夜の予算は4,000〜5,000円。土日はランチ11:30〜もあり。",
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
