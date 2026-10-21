// 記事一覧(見本 記事.webp)と記事本文の仮データ。店名・日付・文章はすべて仮の内容(見本の再現)。
import { ARTICLE_HREF, SEARCH_HREF } from "../common/site";

export type CatItem = { id: string; label: string; icon: string; img: string; w: number; h: number; href: string };

/** カテゴリから探す(見本 5) */
export const CATEGORIES: CatItem[] = [
  { id: "grooming", label: "トリミング", icon: "scissors", img: "cat-grooming.webp", w: 308, h: 158, href: SEARCH_HREF },
  { id: "hotel", label: "ペットホテル", icon: "house", img: "cat-hotel.webp", w: 304, h: 158, href: SEARCH_HREF },
  { id: "cafe", label: "ドッグカフェ", icon: "cup", img: "cat-cafe.webp", w: 310, h: 158, href: SEARCH_HREF },
  { id: "hospital", label: "動物病院", icon: "stetho", img: "cat-hospital.webp", w: 308, h: 158, href: SEARCH_HREF },
  { id: "outing", label: "おでかけ", icon: "tree", img: "cat-outing.webp", w: 314, h: 158, href: SEARCH_HREF },
];

/** シーンから探す(見本 5) */
export const SCENES: CatItem[] = [
  { id: "rain", label: "雨の日", icon: "umbrella", img: "scene-rain.webp", w: 306, h: 170, href: SEARCH_HREF },
  { id: "trip", label: "初めての犬連れ旅行", icon: "car", img: "scene-trip.webp", w: 306, h: 170, href: SEARCH_HREF },
  { id: "large", label: "大型犬OK", icon: "paw", img: "scene-large.webp", w: 312, h: 170, href: SEARCH_HREF },
  { id: "indoor", label: "室内で過ごせる", icon: "house", img: "scene-indoor.webp", w: 308, h: 170, href: SEARCH_HREF },
  { id: "senior", label: "シニア犬向け", icon: "heart", img: "scene-senior.webp", w: 314, h: 170, href: SEARCH_HREF },
];

export type Card = { tag: string; title: string[]; desc: string[]; date: string; img: string; w: number; h: number; href: string };

/** 特集記事(大 1) */
export const FEATURE_MAIN = {
  label: "FEATURE",
  title: ["愛犬と行きたい", "秋のおでかけスポット10選"],
  desc: ["紅葉が美しい公園や、愛犬と一緒に楽しめる", "カフェ・宿泊施設など、秋におすすめの", "おでかけスポットを厳選してご紹介します。"],
  date: "2024.10.12",
  img: "feature.webp",
  href: ARTICLE_HREF,
};

/** 特集記事(小 2) */
export const FEATURE_SMALL = [
  {
    title: ["初めての犬連れ旅行ガイド", "準備から当日の流れまで"],
    desc: ["愛犬との旅行をもっと楽しみたいための", "準備・持ち物・注意点を詳しく解説。"],
    date: "2024.09.28",
    img: "fs-trip.webp",
    w: 292,
    h: 208,
    href: ARTICLE_HREF,
  },
  {
    title: ["シニア犬との暮らしを考える", "〜ずっと元気でいてほしいから〜"],
    desc: ["食事・運動・住環境など、シニア期の", "ケアのポイントを専門家が解説。"],
    date: "2024.09.15",
    img: "fs-senior.webp",
    w: 292,
    h: 212,
    href: ARTICLE_HREF,
  },
];

/** 新着 / 人気 / 編集部のおすすめ(各 4)。2 つ目・3 つ目は見本に無いので、同じ写真の素材から組んだ仮の内容 */
export const TABS: Array<{ key: string; label: string; w: number; items: Card[] }> = [
  {
    key: "new",
    label: "新着記事",
    w: 108.5,
    items: [
      { tag: "ドッグカフェ", title: ["愛犬と楽しむ!", "テラス席のあるカフェ特集"], desc: ["一緒に食事を楽しめる、テラス席のある", "ドッグカフェをエリア別にご紹介。"], date: "2024.10.10", img: "lt-cafe.webp", w: 402, h: 208, href: ARTICLE_HREF },
      { tag: "トリミング", title: ["トリミングの頻度はどれくらい?", "犬種別の目安とケアのポイント"], desc: ["愛犬の健康と快適な暮らしのために。", "トリミングの適切な頻度を解説します。"], date: "2024.10.08", img: "lt-trimming.webp", w: 396, h: 208, href: ARTICLE_HREF },
      { tag: "ペットホテル", title: ["ペットホテルの選び方と", "事前に確認したい5つのポイント"], desc: ["大切な愛犬を安心して預けるために、", "チェックすべきポイントをまとめました。"], date: "2024.10.05", img: "lt-hotel.webp", w: 396, h: 208, href: ARTICLE_HREF },
      { tag: "おでかけ", title: ["関東の愛犬と歩ける", "絶景ハイキングコース5選"], desc: ["自然の中でリフレッシュできる、", "愛犬と一緒に楽しめるハイキングコースを", "ご紹介します。"], date: "2024.10.02", img: "lt-hiking.webp", w: 396, h: 208, href: ARTICLE_HREF },
    ],
  },
  {
    key: "popular",
    label: "人気記事",
    w: 119,
    items: [
      { tag: "おでかけ", title: ["雨の日でも楽しめる", "室内おでかけスポットまとめ"], desc: ["天気を気にせず、愛犬と過ごせる", "室内のスポットをご紹介します。"], date: "2024.09.30", img: "scene-rain.webp", w: 306, h: 170, href: ARTICLE_HREF },
      { tag: "旅行", title: ["初めての犬連れ旅行の", "持ち物チェックリスト"], desc: ["出発前に見直したい持ち物を、", "シーン別にまとめました。"], date: "2024.09.26", img: "scene-trip.webp", w: 306, h: 170, href: ARTICLE_HREF },
      { tag: "おでかけ", title: ["大型犬と楽しむ", "おでかけのヒント"], desc: ["広い場所で思いきり過ごすための、", "準備とマナーを解説します。"], date: "2024.09.22", img: "scene-large.webp", w: 312, h: 170, href: ARTICLE_HREF },
      { tag: "暮らし", title: ["シニア犬と暮らす", "毎日のケアのポイント"], desc: ["年齢に合わせた過ごし方を、", "やさしく解説します。"], date: "2024.09.18", img: "scene-senior.webp", w: 314, h: 170, href: ARTICLE_HREF },
    ],
  },
  {
    key: "editor",
    label: "編集部のおすすめ",
    w: 137,
    items: [
      { tag: "動物病院", title: ["はじめての動物病院", "受診前に準備しておきたいこと"], desc: ["初診の前に確認しておきたい", "持ち物や伝えたいことをまとめました。"], date: "2024.09.14", img: "cat-hospital.webp", w: 308, h: 158, href: ARTICLE_HREF },
      { tag: "暮らし", title: ["お部屋で過ごす時間を", "もっと心地よく"], desc: ["室内で愛犬とのんびり過ごすための", "ちょっとした工夫をご紹介します。"], date: "2024.09.10", img: "scene-indoor.webp", w: 308, h: 170, href: ARTICLE_HREF },
      { tag: "おでかけ", title: ["愛犬と歩く", "季節ごとの散歩コース"], desc: ["四季の景色を楽しみながら歩ける、", "散歩の楽しみ方を解説します。"], date: "2024.09.06", img: "cat-outing.webp", w: 314, h: 158, href: ARTICLE_HREF },
      { tag: "ドッグカフェ", title: ["カフェで過ごすときの", "マナーと持ち物"], desc: ["愛犬と一緒に過ごす前に知っておきたい", "ポイントをまとめました。"], date: "2024.09.02", img: "cat-cafe.webp", w: 310, h: 158, href: ARTICLE_HREF },
    ],
  },
];

/** 専門家コラム(3) */
export const EXPERTS = [
  { title: ["犬と猫の健康診断、", "いつ受けるべき?"], tag: "獣医師コラム", date: "2024.09.20", img: "ex-vet.webp", w: 152, h: 158 },
  { title: ["愛犬との信頼関係を深める", "しつけのコツ"], tag: "ドッグトレーナーコラム", date: "2024.09.12", img: "ex-trainer.webp", w: 146, h: 158 },
  { title: ["ペットの食事、", "見直してみませんか?"], tag: "ペット栄養士コラム", date: "2024.09.05", img: "ex-food.webp", w: 146, h: 158 },
];

/** こんな記事もおすすめ(5) */
export const RECOMMEND = [
  { title: ["雨の日でも楽しめる", "室内おでかけスポット"], img: "rc-rain.webp", w: 314, h: 106 },
  { title: ["大型犬とも泊まれる", "宿特集"], img: "rc-stay.webp", w: 306, h: 106 },
  { title: ["犬と一緒に行ける", "季節のイベント情報"], img: "rc-season.webp", w: 304, h: 106 },
  { title: ["ペットと防災", "いざという時の備え"], img: "rc-bousai.webp", w: 306, h: 106 },
  { title: ["はじめての多頭飼い", "気をつけたいポイント"], img: "rc-multi.webp", w: 314, h: 106 },
];
