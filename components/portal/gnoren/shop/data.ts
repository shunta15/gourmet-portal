// 見本 3(店舗紹介)の仮の中身。まず見本どおりに再現するため、店名・文章・値段は見本のまま。本物のデータへの置き換えは後。

export const SHOP = {
  catch: ["やさしいごはんと、", "季節の甘味で、", "ほっとひと息。"],
  lead: ["旬の食材をつかった、からだにやさしいごはんと", "季節の甘味が楽しめる、町のごはん屋さん。", "木のぬくもりに包まれた空間で、ゆったりとした時間をお過ごしください。"],
  strips: ["季節を味わう", "ごはんと、", "甘いしあわせ。"],
  tags: [
    { label: "和食", icon: "bowl" },
    { label: "カフェ・甘味", icon: "cup" },
    { label: "駅前エリア", icon: "pin" },
  ] as const,
  nameMain: "ごはんと甘味",
  nameKana: "かぜまち",
  nameTail: "風待ち",
  description: [
    "季節の食材を丁寧に仕立てた定食と、手づくりの甘味が自慢のお店です。",
    "忙しい毎日のなかで、ほっと肩の力を抜いて過ごせるような、",
    "やさしい味と居心地のよい空間をご用意しています。",
  ],
};

export const MENU = [
  { name: "季節の焼き魚定食", price: "1,380円", desc: ["旬の魚を丁寧に焼き上げた、", "風待ちの定番ごはん。季節の小鉢とともに。"], img: "menu1" },
  { name: "季節のあんみつ", price: "880円", desc: ["季節のフルーツと自家製あんこ、", "やさしい甘さの人気の甘味です。"], img: "menu2" },
  { name: "抹茶ラテ", price: "650円", desc: ["香り高い宇治抹茶を使った、", "まろやかな味わい。"], img: "menu3" },
  { name: "季節の彩りごはん", price: "1,280円", desc: ["旬の野菜をたっぷり使った", "月替わりのごはんプレート。"], img: "menu4" },
];

export const GALLERY = [
  { img: "gallery1", alt: "木のテーブルと大きな窓のある店内" },
  { img: "gallery2", alt: "あたたかな灯りの電球" },
  { img: "gallery3", alt: "接客をするスタッフ" },
  { img: "gallery4", alt: "花を飾ったテーブル" },
  { img: "gallery5", alt: "緑が見える窓辺の席" },
];

export const INFO = [
  { key: "addr", label: "住所", icon: "store", lines: ["東京都マチノワ市中央区", "風待ち町1-2-3"], button: "地図で見る" },
  { key: "hours", label: "営業時間", icon: "clock", lines: ["11:00 - 21:00", "(L.O. 20:30)"] },
  { key: "closed", label: "定休日", icon: "calendar", lines: ["水曜日", "(祝日の場合は営業)"] },
  { key: "tel", label: "電話番号", icon: "phone", lines: ["03-1234-5678"] },
  { key: "seats", label: "席数", icon: "chair", lines: ["28席", "(テーブル席・カウンター席)"] },
  { key: "smoke", label: "禁煙・喫煙", icon: "nosmoke", lines: ["全席禁煙"] },
  { key: "access", label: "アクセス", icon: "train", lines: ["マチノワ駅から徒歩3分"] },
] as const;

export const SCENES = [
  { lines: ["ひとりで", "気ままに"], img: "scene1" },
  { lines: ["友人と", "ゆったり"], img: "scene2" },
  { lines: ["家族で", "たのしく"], img: "scene3" },
  { lines: ["食後の", "甘味タイムに"], img: "scene4" },
];
