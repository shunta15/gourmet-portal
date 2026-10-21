import type { FilterDef } from "./Controls";

// 探すページ(見本の完全再現)の中身。店名・文章は見本のまま(仮の内容)。
export type SearchCard = { id: number; name: string; cat: string; place: string; desc: [string, string]; tags: string[] };

export const CARDS: SearchCard[] = [
  { id: 1, name: "sora cafe", cat: "カフェ・飲食店", place: "東京都 世田谷区", desc: ["縁に囲まれたテラス席で、愛犬と", "ゆったり過ごせるカフェです。"], tags: ["テラスOK", "店内OK", "駐車場あり"] },
  { id: 2, name: "Hotel La mer", cat: "ペットホテル・宿泊", place: "神奈川県 鎌倉市", desc: ["湘南の海を望む、愛犬と泊まれる", "ラグジュアリーホテル。"], tags: ["小型犬OK", "中型犬OK", "大型犬OK"] },
  { id: 3, name: "GREEN FIELD", cat: "ドッグラン", place: "千葉県 千葉市", desc: ["広々とした芝生のドッグラン。", "天然芝でのびのび遊べます。"], tags: ["大型犬OK", "駐車場あり", "予約不要"] },
  { id: 4, name: "はなまる動物病院", cat: "動物病院・クリニック", place: "東京都 渋谷区", desc: ["予防医療から一般診療まで、", "ペットと飼い主に寄り添う動物病院。"], tags: ["予約可", "駐車場あり", "猫もOK"] },
  { id: 5, name: "わんこの雑貨屋さん", cat: "ペット用品・ショップ", place: "神奈川県 横浜市", desc: ["こだわりのフードやおしゃれな", "グッズが揃うセレクトショップ。"], tags: ["駐車場あり", "わんこ同伴OK"] },
  { id: 6, name: "Pacific TABLE", cat: "カフェ・飲食店", place: "神奈川県 葉山町", desc: ["海を眺めるテラスで、地元食材の", "お料理を楽しめるレストラン。"], tags: ["テラスOK", "駐車場あり", "予約可"] },
  { id: 7, name: "レイクサイドヴィラ富士", cat: "ペットホテル・宿泊", place: "山梨県 富士河口湖町", desc: ["富士山を望む、愛犬と泊まれる", "一棟貸しのプライベートヴィラ。"], tags: ["大型犬OK", "駐車場あり", "BBQ可"] },
  { id: 8, name: "わんちゃんの遊び場 ぽてと", cat: "ドッグラン", place: "埼玉県 さいたま市", desc: ["屋内型で雨の日も安心。", "小型犬専用のドッグランです。"], tags: ["小型犬専用", "駐車場あり", "予約可"] },
  { id: 9, name: "cafe ことり", cat: "カフェ・飲食店", place: "千葉県 柏市", desc: ["やさしい食材でつくる、愛犬と", "一緒に楽しめるカフェです。"], tags: ["テラスOK", "店内OK", "駐車場あり"] },
];

export const FILTERS: FilterDef[] = [
  { key: "size", label: "犬のサイズ", value: "すべて", options: ["すべて", "小型犬", "中型犬", "大型犬"], icon: "dog" },
  { key: "indoor", label: "店内OK", value: "指定なし", options: ["指定なし", "店内OK", "店内不可"], icon: "house" },
  { key: "terrace", label: "テラスOK", value: "指定なし", options: ["指定なし", "テラスあり", "テラスなし"], icon: "terrace" },
  { key: "parking", label: "駐車場あり", value: "指定なし", options: ["指定なし", "駐車場あり", "駐車場なし"], icon: "car" },
  { key: "reserve", label: "予約可", value: "指定なし", options: ["指定なし", "予約可", "予約不要"], icon: "calendar" },
  { key: "budget", label: "予算（1人あたり）", value: "指定なし", options: ["指定なし", "〜1,000円", "1,000〜3,000円", "3,000円〜"], icon: "yen" },
];

export type AreaTile = { jp: string; en: string; img: string };
export const AREAS: AreaTile[] = [
  { jp: "東京", en: "TOKYO", img: "area-tokyo" },
  { jp: "神奈川", en: "KANAGAWA", img: "area-kanagawa" },
  { jp: "千葉", en: "CHIBA", img: "area-chiba" },
  { jp: "埼玉", en: "SAITAMA", img: "area-saitama" },
  { jp: "山梨", en: "YAMANASHI", img: "area-yamanashi" },
  { jp: "静岡", en: "SHIZUOKA", img: "area-shizuoka" },
];

export const POPULAR = ["ドッグラン", "ペットと泊まれる宿", "テラス席のあるカフェ", "大型犬OK", "駐車場あり", "予約できるお店"];
