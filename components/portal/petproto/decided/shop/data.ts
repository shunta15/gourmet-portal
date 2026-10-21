// ペット決定案「②店舗紹介(店舗詳細)」の仮データ(見本 sora cafe の文字をそのまま使う。店名・評価・料金・文章は仮の内容)。
// 写真は見本から切り出したもの(public/_portal/petproto/decided/shop/)。
import { IMG_SHOP } from "../common/site";

export const IMG = IMG_SHOP;

export const SHOP = {
  name: "sora cafe",
  kana: "ソラカフェ",
  category: "カフェ・飲食店",
  catch: ["湖を望むテラスで愛犬と過ごす", "やさしい時間"],
  lead: ["自然に囲まれたロケーションで、愛犬と一緒にゆったり", "と食事やカフェタイムを楽しめるドッグフレンドリーな", "カフェです。地元の食材を使ったこだわりのメニューと、", "開放的なテラス席で、特別なひとときをお過ごしください。"],
  handwriting: ["いっしょだから。", "もっとおいしい。"],
  tags: [
    { id: "small", label: "小型犬OK" },
    { id: "terrace", label: "テラスOK" },
    { id: "large", label: "大型犬OK" },
    { id: "parking", label: "駐車場あり" },
  ],
} as const;

export const STRIP = [
  { src: `${IMG}/strip-1.webp`, w: 214, alt: "湖を望むテラス席" },
  { src: `${IMG}/strip-2.webp`, w: 155, alt: "笑顔のゴールデンレトリバー" },
  { src: `${IMG}/strip-3.webp`, w: 116, alt: "季節のプレート" },
  { src: `${IMG}/strip-4.webp`, w: 157, alt: "木のぬくもりの店内" },
  { src: `${IMG}/strip-5.webp`, w: 216, alt: "ソファで待つトイプードル" },
] as const;

export const ABOUT = ["目の前に広がる湖と季節の自然を感じながら、", "愛犬と一緒に食事が楽しめるカフェです。", "木のぬくもりあふれる店内と開放的なテラス席で、", "飼い主さんも愛犬も、心地よく過ごせる空間をご用意しています。", "地元の新鮮な食材を使ったフードやスイーツ、", "わんちゃん用のメニューもご用意。", "週末にはドッグイベントも開催しています。"];

export const INFO_ROWS = [
  { id: "address", icon: "pin", label: "住所", lines: ["〒248-0014", "神奈川県鎌倉市由比ガ浜1-12-8"] },
  { id: "hours", icon: "clock", label: "営業時間", lines: ["9:00 - 18:00", "（フード L.O. 17:00 / ドリンク L.O. 17:30）"], sub: true },
  { id: "closed", icon: "calendar", label: "定休日", lines: ["火曜日（祝日の場合は営業）"] },
  { id: "tel", icon: "phone", label: "電話番号", lines: ["0467-23-8811"] },
  { id: "site", icon: "link", label: "公式サイト", lines: ["https://sora-cafe.jp"], link: true },
  { id: "sns", icon: "sns", label: "SNS", lines: [] },
] as const;

export const MENU = {
  desc: ["地元の食材を使ったこだわりのカフェメニュー。", "わんちゃん用のメニューもご用意しています。"],
  items: [
    { src: `${IMG}/menu-1.webp`, name: "季節のプレートランチ", price: "¥1,480", desc: ["旬の野菜と地元食材を使った", "人気のプレート。"] },
    { src: `${IMG}/menu-2.webp`, name: "自家製チーズケーキ", price: "¥650", desc: ["濃厚でなめらかな口どけ。", "コーヒーとの相性も抜群。"] },
    { src: `${IMG}/menu-3.webp`, name: "わんちゃん用プレート", price: "¥550", desc: ["鶏ささみと季節の野菜を使った、", "愛犬のためのやさしいごはん。"] },
  ],
} as const;

export const FACILITY = {
  desc: ["愛犬と飼い主さんが快適に過ごせるよう、", "さまざまな設備・サービスをご用意しています。"],
  items: [
    { id: "terrace", label: "テラス席あり", w: 30.2, h: 27.2 },
    { id: "house", label: "店内一部OK", w: 25.8, h: 24.5 },
    { id: "dog-s", label: "小型犬OK", w: 32.8, h: 28.7 },
    { id: "dog-l", label: "大型犬OK", w: 32.5, h: 28.7 },
    { id: "bone", label: "わんちゃん用メニュー", w: 32.7, h: 25.5 },
    { id: "car", label: "駐車場あり", w: 29.8, h: 23 },
  ],
} as const;

export const SCENE = {
  desc: ["こんなシーンでのご利用がおすすめです。"],
  items: [
    { src: `${IMG}/scene-1.webp`, title: "週末のおでかけに", desc: ["自然の中で愛犬とリフレッシュ", "したい日に。"] },
    { src: `${IMG}/scene-2.webp`, title: "友人とのランチに", desc: ["愛犬連れの友人と一緒に、", "楽しいカフェタイムを。"] },
    { src: `${IMG}/scene-3.webp`, title: "記念日のお祝いに", desc: ["愛犬の誕生日など、特別な", "一日にもおすすめです。"] },
    { src: `${IMG}/scene-4.webp`, title: "ひとり時間にも", desc: ["愛犬とゆったり、のんびり", "過ごしたいときに。"] },
  ],
} as const;

export const ACCESS = {
  train: { title: "電車でお越しの方", lines: ["JR鎌倉駅からバスで約10分", "「由比ガ浜」下車 徒歩3分"] },
  car: { title: "お車でお越しの方", lines: ["横浜横須賀道路 朝比奈ICから約20分", "専用駐車場 5台あり"] },
} as const;

export const TABLE = [
  { k: "席数", v: "テーブル席 30席（うちテラス席 20席）" },
  { k: "平均予算", v: "¥1,000 〜 ¥2,000" },
  { k: "支払い方法", v: "現金・クレジットカード・電子マネー" },
  { k: "禁煙・喫煙", v: "全席禁煙" },
  { k: "ペット同伴", v: "テラス席・一部店内席OK" },
  { k: "駐車場", v: "あり（5台）" },
] as const;

export const REVIEWS = [
  { av: `${IMG}/av-1.webp`, name: "ゆきさん", date: "2024.09.15", score: 5, text: ["テラス席からの景色が最高で、愛犬もリラックス", "して過ごせました。料理もとても美味しく、", "また絶対に行きたいです！"] },
  { av: `${IMG}/av-2.webp`, name: "タクさん", date: "2024.08.22", score: 4.5, text: ["わんちゃん用のプレートがあって、愛犬も大喜び。", "スタッフさんも親切で、居心地の良いカフェ", "でした。"] },
  { av: `${IMG}/av-3.webp`, name: "まいさん", date: "2024.07.10", score: 5, text: ["週末のランチで利用しました。湖を眺めながら", "愛犬とゆっくり過ごせて、最高の時間でした。", "また行きます！"] },
] as const;

export const RELATED = [
  { src: `${IMG}/rel-1.webp`, title: ["愛犬と行きたい", "鎌倉のドッグフレンドリーなカフェ5選"], date: "2024.10.12", l: 0, w: 175.5 },
  { src: `${IMG}/rel-2.webp`, title: ["テラスで楽しむ", "秋のカフェ時間"], date: "2024.09.28", l: 194, w: 171.5 },
  { src: `${IMG}/rel-3.webp`, title: ["鎌倉エリアの", "愛犬とのおでかけスポット10選"], date: "2024.09.10", l: 375, w: 174.5 },
  { src: `${IMG}/rel-4.webp`, title: ["愛犬と一緒に楽しめる", "カフェのマナーと過ごし方"], date: "2024.08.05", l: 565, w: 188.5 },
] as const;

/** 追従するタブ(見本には無い。スクロールで上に付いてくる薄い帯) */
export const TABS = [
  { id: "about", label: "about", sub: "お店について" },
  { id: "menu", label: "Menu", sub: "メニュー" },
  { id: "facility", label: "Facility", sub: "施設・サービス" },
  { id: "scene", label: "Scene", sub: "シーン" },
  { id: "access", label: "Access", sub: "アクセス" },
  { id: "review", label: "Review", sub: "口コミ" },
];
