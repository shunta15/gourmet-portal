// 自動生成: node automation/stores500/build-stores.mjs（手で編集しない。再実行で上書きされる）
// 材料: automation/stores500/gbp/*.json（Googleマップ店舗パネル）+ lib/teleapo-features.ts（記事）+ public/restaurants/teleapo-*/（画像）
// 既存16地域（lib/regions.ts）に入らない都道府県の地域定義。出力した店がある県だけ。
// 地域キー = 都道府県のローマ字。画像は、その県の店の実写があればそれ、無ければ他地域と同じ汎用の街角写真。
import type { Region } from "./regions";

export const ARTICLE_REGIONS = {
  "aomori": {
    "name": "青森",
    "nameEn": "Aomori",
    "tagline": "青森の街と店",
    "subtitle": "八戸市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している青森の飲食店を、街ごとにまとめています。八戸市の店を掲載しています。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-つるや/hero.jpg"
    ],
    "stats": []
  },
  "iwate": {
    "name": "岩手",
    "nameEn": "Iwate",
    "tagline": "岩手の街と店",
    "subtitle": "一関市・奥州市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している岩手の飲食店を、街ごとにまとめています。一関市・奥州市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-喜作/hero.jpg"
    ],
    "stats": []
  },
  "akita": {
    "name": "秋田",
    "nameEn": "Akita",
    "tagline": "秋田の街と店",
    "subtitle": "秋田市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している秋田の飲食店を、街ごとにまとめています。秋田市の店を掲載しています。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-秋桜/hero.jpg"
    ],
    "stats": []
  },
  "yamagata": {
    "name": "山形",
    "nameEn": "Yamagata",
    "tagline": "山形の街と店",
    "subtitle": "山形市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している山形の飲食店を、街ごとにまとめています。山形市の店を掲載しています。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=85"
    ],
    "stats": []
  },
  "fukushima": {
    "name": "福島",
    "nameEn": "Fukushima",
    "tagline": "福島の街と店",
    "subtitle": "郡山市・福島市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している福島の飲食店を、街ごとにまとめています。郡山市・福島市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-旬菜美味南風亭/hero.jpg"
    ],
    "stats": []
  },
  "ibaraki": {
    "name": "茨城",
    "nameEn": "Ibaraki",
    "tagline": "茨城の街と店",
    "subtitle": "つくば市・水戸市・筑西市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している茨城の飲食店を、街ごとにまとめています。つくば市・水戸市・筑西市・神栖市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-和牛焼肉たつ竹/hero.jpg"
    ],
    "stats": []
  },
  "tochigi": {
    "name": "栃木",
    "nameEn": "Tochigi",
    "tagline": "栃木の街と店",
    "subtitle": "佐野市・日光市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している栃木の飲食店を、街ごとにまとめています。佐野市・日光市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-Plaisirプレジール/hero.jpg"
    ],
    "stats": []
  },
  "niigata": {
    "name": "新潟",
    "nameEn": "Niigata",
    "tagline": "新潟の街と店",
    "subtitle": "上越市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している新潟の飲食店を、街ごとにまとめています。上越市の店を掲載しています。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-参道酒場鶏居/hero.jpg"
    ],
    "stats": []
  },
  "toyama": {
    "name": "富山",
    "nameEn": "Toyama",
    "tagline": "富山の街と店",
    "subtitle": "富山市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している富山の飲食店を、街ごとにまとめています。富山市の店を掲載しています。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-ぺんぎん食堂/hero.jpg"
    ],
    "stats": []
  },
  "ishikawa": {
    "name": "石川",
    "nameEn": "Ishikawa",
    "tagline": "石川の街と店",
    "subtitle": "金沢市・小松市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している石川の飲食店を、街ごとにまとめています。金沢市・小松市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-中佐中店すず虫庵/hero.jpg"
    ],
    "stats": []
  },
  "fukui": {
    "name": "福井",
    "nameEn": "Fukui",
    "tagline": "福井の街と店",
    "subtitle": "福井市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している福井の飲食店を、街ごとにまとめています。福井市の店を掲載しています。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-初味寿司本店/hero.jpg"
    ],
    "stats": []
  },
  "nagano": {
    "name": "長野",
    "nameEn": "Nagano",
    "tagline": "長野の街と店",
    "subtitle": "長野市・上田市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している長野の飲食店を、街ごとにまとめています。長野市・上田市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-浜せい/hero.jpg"
    ],
    "stats": []
  },
  "gifu": {
    "name": "岐阜",
    "nameEn": "Gifu",
    "tagline": "岐阜の街と店",
    "subtitle": "多治見市・高山市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している岐阜の飲食店を、街ごとにまとめています。多治見市・高山市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-飛騨あっぽ/hero.jpg"
    ],
    "stats": []
  },
  "mie": {
    "name": "三重",
    "nameEn": "Mie",
    "tagline": "三重の街と店",
    "subtitle": "伊勢市・四日市市・桑名市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している三重の飲食店を、街ごとにまとめています。伊勢市・四日市市・桑名市・松阪市・津市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-炭火鰻のこうせい/hero.jpg"
    ],
    "stats": []
  },
  "tottori": {
    "name": "鳥取",
    "nameEn": "Tottori",
    "tagline": "鳥取の街と店",
    "subtitle": "米子市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している鳥取の飲食店を、街ごとにまとめています。米子市の店を掲載しています。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-おとうふカフェヨルヨル/hero.jpg"
    ],
    "stats": []
  },
  "shimane": {
    "name": "島根",
    "nameEn": "Shimane",
    "tagline": "島根の街と店",
    "subtitle": "松江市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している島根の飲食店を、街ごとにまとめています。松江市の店を掲載しています。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-らーめんとんてき大翔/hero.jpg"
    ],
    "stats": []
  },
  "okayama": {
    "name": "岡山",
    "nameEn": "Okayama",
    "tagline": "岡山の街と店",
    "subtitle": "倉敷市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している岡山の飲食店を、街ごとにまとめています。倉敷市の店を掲載しています。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-讃岐うどん明月/hero.jpg"
    ],
    "stats": []
  },
  "yamaguchi": {
    "name": "山口",
    "nameEn": "Yamaguchi",
    "tagline": "山口の街と店",
    "subtitle": "下関市・防府市・宇部市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している山口の飲食店を、街ごとにまとめています。下関市・防府市・宇部市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-太平楽本店/hero.jpg"
    ],
    "stats": []
  },
  "kagawa": {
    "name": "香川",
    "nameEn": "Kagawa",
    "tagline": "香川の街と店",
    "subtitle": "丸亀市・高松市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している香川の飲食店を、街ごとにまとめています。丸亀市・高松市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-味感真寿美/hero.jpg"
    ],
    "stats": []
  },
  "ehime": {
    "name": "愛媛",
    "nameEn": "Ehime",
    "tagline": "愛媛の街と店",
    "subtitle": "今治市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している愛媛の飲食店を、街ごとにまとめています。今治市の店を掲載しています。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-BistroPaysan/hero.jpg"
    ],
    "stats": []
  },
  "kochi": {
    "name": "高知",
    "nameEn": "Kochi",
    "tagline": "高知の街と店",
    "subtitle": "高知市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している高知の飲食店を、街ごとにまとめています。高知市の店を掲載しています。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-BISTROJOIN/hero.jpg"
    ],
    "stats": []
  },
  "saga": {
    "name": "佐賀",
    "nameEn": "Saga",
    "tagline": "佐賀の街と店",
    "subtitle": "佐賀市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している佐賀の飲食店を、街ごとにまとめています。佐賀市の店を掲載しています。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=85"
    ],
    "stats": []
  },
  "nagasaki": {
    "name": "長崎",
    "nameEn": "Nagasaki",
    "tagline": "長崎の街と店",
    "subtitle": "長崎市・諫早市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している長崎の飲食店を、街ごとにまとめています。長崎市・諫早市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-あづまラーメン/hero.jpg"
    ],
    "stats": []
  },
  "miyazaki": {
    "name": "宮崎",
    "nameEn": "Miyazaki",
    "tagline": "宮崎の街と店",
    "subtitle": "延岡市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している宮崎の飲食店を、街ごとにまとめています。延岡市の店を掲載しています。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-旬肴/hero.jpg"
    ],
    "stats": []
  }
} satisfies Record<string, Region>;

export type ArticleRegionKey = keyof typeof ARTICLE_REGIONS;
