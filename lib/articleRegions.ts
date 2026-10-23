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
    "subtitle": "八戸市・むつ市・弘前市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している青森の飲食店を、街ごとにまとめています。八戸市・むつ市・弘前市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-つるや/hero.jpg"
    ],
    "stats": []
  },
  "iwate": {
    "name": "岩手",
    "nameEn": "Iwate",
    "tagline": "岩手の街と店",
    "subtitle": "奥州市・一関市・花巻市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している岩手の飲食店を、街ごとにまとめています。奥州市・一関市・花巻市・北上市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-喜作/hero.jpg"
    ],
    "stats": []
  },
  "miyagi": {
    "name": "宮城",
    "nameEn": "Miyagi",
    "tagline": "宮城の街と店",
    "subtitle": "多賀城市・登米市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している宮城の飲食店を、街ごとにまとめています。多賀城市・登米市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-PizzeriaHAIJI/hero.jpg"
    ],
    "stats": []
  },
  "akita": {
    "name": "秋田",
    "nameEn": "Akita",
    "tagline": "秋田の街と店",
    "subtitle": "秋田市・大仙市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している秋田の飲食店を、街ごとにまとめています。秋田市・大仙市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
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
    "subtitle": "郡山市・南相馬市・福島市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している福島の飲食店を、街ごとにまとめています。郡山市・南相馬市・福島市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
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
    "subtitle": "佐野市・栃木市・日光市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している栃木の飲食店を、街ごとにまとめています。佐野市・栃木市・日光市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-Plaisirプレジール/hero.jpg"
    ],
    "stats": []
  },
  "chiba": {
    "name": "千葉",
    "nameEn": "Chiba",
    "tagline": "千葉の街と店",
    "subtitle": "市川市・松戸市・千葉市中央区 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している千葉の飲食店を、街ごとにまとめています。市川市・松戸市・千葉市中央区・船橋市・市原市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-フランス料理の総菜食堂パ・マル/hero.jpg"
    ],
    "stats": []
  },
  "niigata": {
    "name": "新潟",
    "nameEn": "Niigata",
    "tagline": "新潟の街と店",
    "subtitle": "上越市・南魚沼市・柏崎市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している新潟の飲食店を、街ごとにまとめています。上越市・南魚沼市・柏崎市・燕市・新潟市江南区などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
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
    "subtitle": "金沢市・小松市・白山市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している石川の飲食店を、街ごとにまとめています。金沢市・小松市・白山市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-中佐中店すず虫庵/hero.jpg"
    ],
    "stats": []
  },
  "fukui": {
    "name": "福井",
    "nameEn": "Fukui",
    "tagline": "福井の街と店",
    "subtitle": "福井市・越前市・坂井市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している福井の飲食店を、街ごとにまとめています。福井市・越前市・坂井市・敦賀市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-初味寿司本店/hero.jpg"
    ],
    "stats": []
  },
  "yamanashi": {
    "name": "山梨",
    "nameEn": "Yamanashi",
    "tagline": "山梨の街と店",
    "subtitle": "笛吹市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している山梨の飲食店を、街ごとにまとめています。笛吹市の店を掲載しています。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-新中国料理大三元/hero.jpg"
    ],
    "stats": []
  },
  "nagano": {
    "name": "長野",
    "nameEn": "Nagano",
    "tagline": "長野の街と店",
    "subtitle": "茅野市・伊那市・佐久市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している長野の飲食店を、街ごとにまとめています。茅野市・伊那市・佐久市・長野市・飯田市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-浜せい/hero.jpg"
    ],
    "stats": []
  },
  "gifu": {
    "name": "岐阜",
    "nameEn": "Gifu",
    "tagline": "岐阜の街と店",
    "subtitle": "多治見市・羽島市・高山市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している岐阜の飲食店を、街ごとにまとめています。多治見市・羽島市・高山市・中津川市・可児郡御嵩町などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
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
    "subtitle": "倉敷市・岡山市北区・総社市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している岡山の飲食店を、街ごとにまとめています。倉敷市・岡山市北区・総社市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
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
  "tokushima": {
    "name": "徳島",
    "nameEn": "Tokushima",
    "tagline": "徳島の街と店",
    "subtitle": "阿南市・徳島市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している徳島の飲食店を、街ごとにまとめています。阿南市・徳島市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-阿波酔処しずく/hero.jpg"
    ],
    "stats": []
  },
  "kagawa": {
    "name": "香川",
    "nameEn": "Kagawa",
    "tagline": "香川の街と店",
    "subtitle": "丸亀市・高松市・三豊市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している香川の飲食店を、街ごとにまとめています。丸亀市・高松市・三豊市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-味感真寿美/hero.jpg"
    ],
    "stats": []
  },
  "ehime": {
    "name": "愛媛",
    "nameEn": "Ehime",
    "tagline": "愛媛の街と店",
    "subtitle": "今治市・四国中央市・新居浜市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している愛媛の飲食店を、街ごとにまとめています。今治市・四国中央市・新居浜市・西条市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
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
    "subtitle": "伊万里市・佐賀市・鳥栖市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している佐賀の飲食店を、街ごとにまとめています。伊万里市・佐賀市・鳥栖市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-本格中華料理チャイナキッチン和/hero.jpg"
    ],
    "stats": []
  },
  "nagasaki": {
    "name": "長崎",
    "nameEn": "Nagasaki",
    "tagline": "長崎の街と店",
    "subtitle": "大村市・長崎市・諫早市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している長崎の飲食店を、街ごとにまとめています。大村市・長崎市・諫早市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-あづまラーメン/hero.jpg"
    ],
    "stats": []
  },
  "kumamoto": {
    "name": "熊本",
    "nameEn": "Kumamoto",
    "tagline": "熊本の街と店",
    "subtitle": "玉名市・熊本市東区・熊本市南区 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している熊本の飲食店を、街ごとにまとめています。玉名市・熊本市東区・熊本市南区などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-【ランチ】土鍋ご飯AOI【金土祝前の夜】BistroAOI/hero.jpg"
    ],
    "stats": []
  },
  "oita": {
    "name": "大分",
    "nameEn": "Oita",
    "tagline": "大分の街と店",
    "subtitle": "中津市・日田市・宇佐市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している大分の飲食店を、街ごとにまとめています。中津市・日田市・宇佐市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-本格焼肉レストラン家族亭/hero.jpg"
    ],
    "stats": []
  },
  "miyazaki": {
    "name": "宮崎",
    "nameEn": "Miyazaki",
    "tagline": "宮崎の街と店",
    "subtitle": "延岡市・宮崎市・都城市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している宮崎の飲食店を、街ごとにまとめています。延岡市・宮崎市・都城市・東臼杵郡門川町などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-旬肴/hero.jpg"
    ],
    "stats": []
  },
  "okinawa": {
    "name": "沖縄",
    "nameEn": "Okinawa",
    "tagline": "沖縄の街と店",
    "subtitle": "うるま市・豊見城市・名護市 ――― 掲載店を街ごとに。",
    "intro": "マチノワで紹介している沖縄の飲食店を、街ごとにまとめています。うるま市・豊見城市・名護市などの店が並びます。営業時間・定休日・住所・地図を、店舗ごとのページで確認できます。",
    "heroImages": [
      "/restaurants/teleapo-ゆで餃子JINGJIAOZI/hero.jpg"
    ],
    "stats": []
  }
} satisfies Record<string, Region>;

export type ArticleRegionKey = keyof typeof ARTICLE_REGIONS;
