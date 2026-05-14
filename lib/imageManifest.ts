/**
 * imageManifest.ts
 * NG-66〜NG-102 記事用 画像管理台帳
 *
 * 管理項目
 *   url      : 画像 URL（Wikimedia Commons サムネイル）
 *   alt      : 代替テキスト（日本語）
 *   source   : 出典サービス名
 *   license  : ライセンス
 *   verified : HTTP 200 確認日（YYYY-MM-DD）
 *   match    : "exact" = 記事のロケーションと完全一致 | "substitute" = 代替画像
 *   note     : 代替理由など補足（省略可）
 */

export type ImageEntry = {
  url: string;
  alt: string;
  source: string;
  license: string;
  verified: string;
  match: "exact" | "substitute";
  note?: string;
};

export const IMAGE_MANIFEST: Record<string, ImageEntry> = {

  // ─── newGuideFeatures4.ts (NG-66〜79) ────────────────────────────────────
  "new-harajuku-backstreet": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Takeshita_Street.jpg/1280px-Takeshita_Street.jpg",
    alt: "原宿竹下通りの街並み",
    source: "Wikimedia Commons",
    license: "CC0 Public Domain",
    verified: "2026-05-15",
    match: "substitute",
    note: "キャットストリート専用画像が Wikimedia Commons に存在しないため竹下通りで代替。竹下通りは原宿エリア内。",
  },
  "new-shimokitazawa-brunch": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Shimokitazawa.jpg/1280px-Shimokitazawa.jpg",
    alt: "下北沢の街並み",
    source: "Wikimedia Commons",
    license: "CC0 Public Domain",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-yanaka-stroll": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Yanaka_Ginza_shopping_street_%284041690725%29.jpg/1280px-Yanaka_Ginza_shopping_street_%284041690725%29.jpg",
    alt: "谷中銀座商店街の風景",
    source: "Wikimedia Commons",
    license: "CC BY 2.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-kagurazaka": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Kagurazaka_path_2009.JPG/960px-Kagurazaka_path_2009.JPG",
    alt: "神楽坂の石畳の小道",
    source: "Wikimedia Commons",
    license: "CC BY-SA 3.0",
    verified: "2026-05-15",
    match: "exact",
    note: "元画像が 2592×1944px のため最大 960px サムネイルを使用。",
  },
  "new-akihabara-gourmet": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Akihabara_Electric_Town%2C_Tokyo%2C_20240823_1617_5580.jpg/1280px-Akihabara_Electric_Town%2C_Tokyo%2C_20240823_1617_5580.jpg",
    alt: "秋葉原電気街の街並み（2024年）",
    source: "Wikimedia Commons",
    license: "CC BY 4.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-ginza-gallery": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Ginza_Place_20241021.jpg/1280px-Ginza_Place_20241021.jpg",
    alt: "銀座プレイスと銀座の街並み（2024年）",
    source: "Wikimedia Commons",
    license: "CC BY 4.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-tsukiji-morning": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Tsukiji_Fish_Market%2C_Tokyo.jpg/1280px-Tsukiji_Fish_Market%2C_Tokyo.jpg",
    alt: "築地魚市場の風景",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-ueno-morning": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Cherry_tree_in_blossom_%40_Ueno_Park_%2813438972635%29.jpg/1280px-Cherry_tree_in_blossom_%40_Ueno_Park_%2813438972635%29.jpg",
    alt: "上野公園の桜（春）",
    source: "Wikimedia Commons",
    license: "CC BY 2.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-asakusa-craft": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Asakusa_Nakamise_2021-12_ac.jpg/1280px-Asakusa_Nakamise_2021-12_ac.jpg",
    alt: "浅草仲見世通りの風景（2021年）",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-shibuya-brunch": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg/1280px-Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg",
    alt: "渋谷スクランブル交差点（2018年）",
    source: "Wikimedia Commons",
    license: "CC BY-SA 2.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-shinjuku-park": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Shinjuku_Gyoen_National_Garden%2C_Tokyo%2C_20240822_1447_5457.jpg/1280px-Shinjuku_Gyoen_National_Garden%2C_Tokyo%2C_20240822_1447_5457.jpg",
    alt: "新宿御苑の日本庭園（2024年）",
    source: "Wikimedia Commons",
    license: "CC BY 4.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-roppongi-art": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Tokyo_Midtown_main.jpg/1280px-Tokyo_Midtown_main.jpg",
    alt: "六本木東京ミッドタウン外観",
    source: "Wikimedia Commons",
    license: "CC BY-SA 3.0 / GFDL",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-marunouchi-walk": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Tokyo-STA_Marunouchi-Entrance_2023.jpg/1280px-Tokyo-STA_Marunouchi-Entrance_2023.jpg",
    alt: "東京駅丸の内口赤レンガ駅舎（2023年）",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-omotesando-brunch": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Aoyama-Omotesando-02.jpg/960px-Aoyama-Omotesando-02.jpg",
    alt: "表参道・青山の街並みとケヤキ並木",
    source: "Wikimedia Commons",
    license: "CC BY-SA 3.0",
    verified: "2026-05-15",
    match: "exact",
    note: "元画像が 1200×900px のため最大 960px サムネイルを使用。",
  },

  // ─── newGuideFeatures5.ts (NG-80〜91) ────────────────────────────────────
  "new-nakameguro-morning": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Meguro_River_cherry_blossom_2025_April.jpg/1280px-Meguro_River_cherry_blossom_2025_April.jpg",
    alt: "目黒川の桜並木（2025年4月）",
    source: "Wikimedia Commons",
    license: "CC0 Public Domain",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-jiyugaoka-patisserie": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Very_cool_shopping_street_in_jiyugaoka_%282460034101%29.jpg/1280px-Very_cool_shopping_street_in_jiyugaoka_%282460034101%29.jpg",
    alt: "自由が丘の商店街の風景",
    source: "Wikimedia Commons",
    license: "CC BY 2.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-kichijoji-lunch": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Inokashira_Park_%40_Kichijoji_%289431564095%29.jpg/1280px-Inokashira_Park_%40_Kichijoji_%289431564095%29.jpg",
    alt: "吉祥寺・井の頭公園",
    source: "Wikimedia Commons",
    license: "CC BY 2.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-futako-tamagawa": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Tama_river_at_Futako_Tamagawa_in_Tokyo_Setagaya.jpg/1280px-Tama_river_at_Futako_Tamagawa_in_Tokyo_Setagaya.jpg",
    alt: "二子玉川の多摩川河川敷",
    source: "Wikimedia Commons",
    license: "CC BY-SA 3.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-shimokitazawa-theater": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Shimokitazawa.jpg/1280px-Shimokitazawa.jpg",
    alt: "下北沢の街並み",
    source: "Wikimedia Commons",
    license: "CC0 Public Domain",
    verified: "2026-05-15",
    match: "substitute",
    note: "下北沢の劇場・ライブハウス専用画像なし。下北沢の街並み画像で代替。",
  },
  "new-sangenjaya-night": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Carrot_Tower_and_an_alley_in_Sangenjaya%2C_Setagaya%2C_Tokyo.jpg/1280px-Carrot_Tower_and_an_alley_in_Sangenjaya%2C_Setagaya%2C_Tokyo.jpg",
    alt: "三軒茶屋キャロットタワーと路地",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-nishi-ogikubo": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/JR_Chuo-Main-Line_Nishi-Ogikubo_Station_Gates.jpg/1280px-JR_Chuo-Main-Line_Nishi-Ogikubo_Station_Gates.jpg",
    alt: "西荻窪駅の改札口",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    verified: "2026-05-15",
    match: "substitute",
    note: "西荻窪アンティーク街の画像なし。西荻窪駅舎で代替。",
  },
  "new-koenji-record": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Koenji_Awa_Odori_Exciting_Love_Part_II._%2838077442%29.jpg/1280px-Koenji_Awa_Odori_Exciting_Love_Part_II._%2838077442%29.jpg",
    alt: "高円寺阿波踊りの様子",
    source: "Wikimedia Commons",
    license: "CC BY 2.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-toyosu-lunch": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Toyosu_Market_Tokyo_2.jpg/1280px-Toyosu_Market_Tokyo_2.jpg",
    alt: "豊洲市場の空撮",
    source: "Wikimedia Commons",
    license: "CC BY-SA 3.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-tachikawa-walk": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Showa_Memorial_Park_20210101.jpg/1280px-Showa_Memorial_Park_20210101.jpg",
    alt: "昭和記念公園と富士山（2021年）",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-hachioji-gourmet": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Mount_Takao_hike_in_January.jpg/1280px-Mount_Takao_hike_in_January.jpg",
    alt: "高尾山（八王子市）のハイキングコース",
    source: "Wikimedia Commons",
    license: "CC0 Public Domain",
    verified: "2026-05-15",
    match: "substitute",
    note: "八王子城専用画像なし。同じ八王子市内にある高尾山で代替。",
  },
  "new-musashino-park": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Inokashira_Park_%40_Kichijoji_%289431564095%29.jpg/1280px-Inokashira_Park_%40_Kichijoji_%289431564095%29.jpg",
    alt: "武蔵野・井の頭公園（吉祥寺）",
    source: "Wikimedia Commons",
    license: "CC BY 2.0",
    verified: "2026-05-15",
    match: "substitute",
    note: "野川・雑木林の画像なし。武蔵野エリア内の井の頭公園で代替（kichijoji-lunchと同 URL）。",
  },

  // ─── newGuideFeatures6.ts (NG-92〜102) ───────────────────────────────────
  "new-yokohama-morning": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Yamashita_Park_%40_Yokohama_%289054590638%29.jpg/1280px-Yamashita_Park_%40_Yokohama_%289054590638%29.jpg",
    alt: "横浜山下公園と港の風景",
    source: "Wikimedia Commons",
    license: "CC BY 2.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-kamakura-coffee": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Tsurugaoka_Hachimangu_001.jpg/1280px-Tsurugaoka_Hachimangu_001.jpg",
    alt: "鎌倉・鶴岡八幡宮の参道と社殿",
    source: "Wikimedia Commons",
    license: "CC0 Public Domain",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-minatomirai-lunch": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Yokohama_Landmark_Tower_and_Minato-Mirai_waterfront_seen_from_the_boat.jpg/1280px-Yokohama_Landmark_Tower_and_Minato-Mirai_waterfront_seen_from_the_boat.jpg",
    alt: "みなとみらいのランドマークタワーと港",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-yokohama-gourmet": {
    url: "https://upload.wikimedia.org/wikipedia/commons/1/12/Zenrin-mon_Gate_of_Yokohama_Chinatown_at_night%2C_Jun_2015.jpg",
    alt: "横浜中華街善隣門（夜景）",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    verified: "2026-05-15",
    match: "exact",
    note: "元画像が 1024×768px のためサムネイルではなく元ファイル URL を使用。",
  },
  "new-enoshima-beach": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Enoshima_20170210-2.jpg/1280px-Enoshima_20170210-2.jpg",
    alt: "江の島の島全景（2017年）",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-kamakura-zen": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Engakuji%2C_Kamakura.jpg/1280px-Engakuji%2C_Kamakura.jpg",
    alt: "北鎌倉・円覚寺のパノラマ",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-shonan-morning": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Shonan_Beach_FM.jpg/1280px-Shonan_Beach_FM.jpg",
    alt: "湘南海岸沿いの施設（Shonan Beach FM）",
    source: "Wikimedia Commons",
    license: "CC0 Public Domain",
    verified: "2026-05-15",
    match: "substitute",
    note: "茅ヶ崎海岸の直接画像なし。湘南海岸沿いの施設画像で代替。",
  },
  "new-odawara-gourmet": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Odawara_Castle_20211201.jpg/1280px-Odawara_Castle_20211201.jpg",
    alt: "小田原城天守閣（2021年）",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-hakone-day": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Owakudani_%40_Hakone_%2810621413133%29.jpg/1280px-Owakudani_%40_Hakone_%2810621413133%29.jpg",
    alt: "箱根大涌谷の噴煙と景観",
    source: "Wikimedia Commons",
    license: "CC BY 2.0",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-yokohama-italian": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Gaikoukan_no_ie.JPG/1280px-Gaikoukan_no_ie.JPG",
    alt: "横浜山手・外交官の家（西洋館）",
    source: "Wikimedia Commons",
    license: "Public Domain",
    verified: "2026-05-15",
    match: "exact",
  },
  "new-kanagawa-weekend": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mount_Fuji_from_Lake_Ashi_20211202-2.jpg/1280px-Mount_Fuji_from_Lake_Ashi_20211202-2.jpg",
    alt: "箱根・芦ノ湖から望む富士山（2021年）",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    verified: "2026-05-15",
    match: "exact",
    note: "神奈川全体を象徴する画像として芦ノ湖と富士山を採用。",
  },
};
