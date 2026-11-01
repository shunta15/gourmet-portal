// 見本 3(店舗紹介)の仮の中身。まず見本どおりに再現するため、店名・文章・値段・日付は見本のまま。本物のデータへの置き換えは後。

export const SHOP = {
  catch: ["炭火の香りがつなぐ、", "人と人、街と酒。"],
  name: "炭火酒場 灯りや",
  tags: ["居酒屋・焼き鳥", "新宿エリア", "新宿駅"],
  lead: ["備長炭で丁寧に焼き上げる焼き鳥と、", "旬の食材を使った季節の一品。", "仕事帰りにふらりと立ち寄れる、温かな灯りの酒場です。"],
};

/** 営業情報の帯(5 つ+地図ボタン)。icon は icons.tsx の INFO_ICONS のキー */
export const INFO = [
  { key: "hours", icon: "clock", label: "営業時間", value: "17:00 - 24:00", sub: ["(L.O. 23:30)"] },
  { key: "closed", icon: "calendar", label: "定休日", value: "日曜日", sub: ["※年末年始は休業"] },
  { key: "seats", icon: "seat", label: "席数", value: "42席", sub: ["カウンター・テーブル・個室あり"] },
  { key: "budget", icon: "yen", label: "予算", value: "3,000円 〜 5,000円", sub: ["(お一人様)"] },
  { key: "access", icon: "pin", label: "アクセス", value: "JR新宿駅 東口 徒歩5分", sub: ["東京都新宿区新宿3-6-10", "新宿三丁目ビル1F"] },
] as const;
export const MAP_BUTTON = "地図を見る";

/** ギャラリー(5 枚。幅は見本どおり不揃い)。w/h は見本のピクセル */
export const GALLERY = [
  { img: "gallery1", w: 176, h: 153, alt: "カウンターで店員が働く店内" },
  { img: "gallery2", w: 133, h: 153, alt: "お猪口に注がれる日本酒" },
  { img: "gallery3", w: 166, h: 153, alt: "炭火で焼かれる串" },
  { img: "gallery4", w: 174, h: 153, alt: "格子窓のある座敷席" },
  { img: "gallery5", w: 140, h: 153, alt: "提灯と暖簾のある入り口" },
] as const;

export const MENU = [
  { img: "menu1", name: "おまかせ串盛り（5本）", price: "1,280円", desc: ["備長炭で焼き上げた、", "定番から旬の串まで。"], alt: "おまかせ串盛り" },
  { img: "menu2", name: "名物 もも肉の炭火焼き", price: "980円", desc: ["香ばしい炭の香りと", "ジューシーな旨み。"], alt: "もも肉の炭火焼き" },
  { img: "menu3", name: "地鶏のたたき", price: "880円", desc: ["新鮮な地鶏を使った", "人気の一品。"], alt: "地鶏のたたき" },
  { img: "menu4", name: "旬の焼き野菜盛り合わせ", price: "780円", desc: ["季節ごとの味わいを", "炭火でシンプルに。"], alt: "旬の焼き野菜盛り合わせ" },
] as const;

export const SCENES = {
  lead: ["肩ひじ張らずに過ごせる、", "大人のための居酒屋です。"],
  body: ["カウンター席では、目の前で焼き上がる", "臨場感を。テーブル席や個室では、仲間との", "語らいの時間を。さまざまなシーンで", "ご利用いただけます。"],
  photos: [
    { img: "small1", label: "カウンター席" },
    { img: "small2", label: "テーブル席" },
    { img: "small3", label: "個室" },
    { img: "small4", label: "落ち着いた照明" },
  ],
};

export const COLUMN = {
  tag: "コラム",
  title: ["炭火にこだわる理由", "―― 灯りやの焼き鳥がうまいわけ"],
  desc: "店主が語る、炭・鶏・タレ、そしてこの街で続ける想い。",
  link: "記事を読む",
};
