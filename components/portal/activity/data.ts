import "server-only";
import { getPlaces } from "@/lib/places";
import { getGeneratedFeatures, type PlaceFeature } from "@/lib/places/features";
import type { Place } from "@/lib/places/types";
import { activityCfg } from "@/components/portal/vkit/configs";
import { loadShops, vkLineOk, type LivePhoto, type LiveShop } from "@/components/portal/vkit/common/live";
import { weekFromText } from "@/lib/portal/openNow";
import { PREFECTURES } from "@/lib/areas/prefectures";
import type { CardShop } from "./ShopCard";
import type { OpenDay } from "./filters";

/**
 * アクティビティ(青と黄の切手・チケット風。オーナーが決めた「A組」のデザイン)が出す「実在の店」のデータ(サーバー専用)。
 * 元は今アクティビティに載っている実在の店(ac0001〜。lib/places/generated/activity.json。保留の店 = lib/places/newVerticals.ts の HELD_PLACE_IDS は出ない)。
 * 店の基本データ・写真は本物のページと同じ読み口(getPlaces → vkit/common/live の loadShops)。文は店データ(Place)・特集(features-activity.json)・紹介記事(Place.article)から取る。
 * 見本にある星・口コミ・利用者の声・料金・「人気」「NEW」の札・架空のスタッフ・架空の住所は持たない。
 * 下の CURATED は、紹介記事(Place.article)・特集の本文にある事実の文だけを短くまとめたもの(言い換えない・足さない。無い事実はその欄を出さない)。出す前に vkLineOk(料金・評価・おすすめ・人気などを含む文は落とす)に通す。
 * ac0012(SeaChan石垣島)は住所が住宅地の可能性があり、オーナー確認待ちで保留中(出ない)。戻したときのために、画面には市町村までしか出さず、地図のリンク・Google マップの出どころも出さない作りは残してある。
 */

export type LinePhoto = LivePhoto & { cap: string };
export type APlan = { name: string; desc: string; time?: string; cond?: string; photo: LinePhoto };
export type ABlock = { key: "point" | "bring" | "safety" | "flow"; title: string; en: string; items: string[] };
export type ARow = { k: "address" | "phone" | "hours" | "holidays" | "access"; label: string; lines: string[] };
export type ACourse = { title: string; badge: string; tags: string[]; place: string };

export type AShop = LiveShop & {
  nameParts: string[];
  tagline: string;
  kindEn: string;
  lede: string;
  ledeShort: string;
  /** 店舗情報の紹介文(紹介記事の導入のうち点検に通った文を、110 字までで前から) */
  ledeLong: string;
  photoList: LinePhoto[];
  rows: ARow[];
  plans: APlan[];
  blocks: ABlock[];
  course: ACourse;
  sources: Array<{ label: string; url: string }>;
  checkedAt: string;
  feat: { title: string[]; plain: string; sub: string; body: string; date: string; dateLabel: string } | null;
  mapLabel: string;
  /** 店舗紹介の大きな写真に重ねる手書きの文(店の事実だけ。2〜3 行) */
  heroText: string[];
  /** 札の中の短い語(特集のタグ。都道府県・市区町村・駅の語は除く) */
  pills: string[];
  /** 都道府県の英字(右上の赤いスタンプ) */
  prefEn: string;
  /** 営業時間(曜日つきの形から「9:00 〜 17:00」に整えたもの。無ければ空) */
  hoursText: string;
  /** 地図のリンク(店データの緯度経度。番地を伏せる店・緯度経度が無い店は null) */
  mapHref: string | null;
  /** 日付から探すに使う営業日(営業時間・定休日の案内から。分からない曜日は u = 営業日は店に確認) */
  open: OpenDay;
};

/** 写真 1 枚ごとの手書きの短い一言。写真の説明(Place.photos[].what)を、そのまま短くしたもの */
const CAP: Record<string, string> = {
  "/_portal/vshops/leisure-2242/hero.jpg": "森の上空を、ジップスライドで",
  "/_portal/vshops/leisure-2242/p1.jpg": "木の壁を、登る",
  "/_portal/vshops/leisure-2242/p2.jpg": "芝の上の、モルック",
  "/_portal/vshops/leisure-2242/s4.jpg": "2人で並んで、滑る",
  "/_portal/vshops/leisure-2242/s5.jpg": "高い所のロープを、渡る",
  "/_portal/vshops/leisure-2242/s6.jpg": "森のハンモック",
  "/_portal/vshops/leisure-2242/s7.jpg": "吊り輪とブランコの広場",
  "/_portal/vshops/leisure-2526/hero.jpg": "白い壁の、工房の外観",
  "/_portal/vshops/leisure-2526/p1.jpg": "藍染めの革の、バラ形",
  "/_portal/vshops/leisure-2526/p2.jpg": "藍染めの革の、小物",
  "/_portal/vshops/leisure-2526/s4.jpg": "刻印を押した、革の小片",
  "/_portal/vshops/leisure-2526/s5.jpg": "黒い革の、コインケース",
  "/_portal/vshops/leisure-2526/s6.jpg": "藍染めの、小銭入れ",
  "/_portal/vshops/leisure-2526/s7.jpg": "革を、ひだ状に寄せる",
  "/_portal/vshops/leisure-2526/s8.jpg": "染め液に、革をひたす",
  "/_portal/vshops/leisure-2407/hero.jpg": "海の中の、魚の群れ",
  "/_portal/vshops/leisure-2407/p1.jpg": "砂地を泳ぐ、縞模様の魚",
  "/_portal/vshops/leisure-2407/p2.jpg": "岩場を泳ぐ、ダイバー",
  "/_portal/vshops/leisure-2407/s4.jpg": "岩場のそばの、魚の群れ",
  "/_portal/vshops/leisure-2407/s5.jpg": "休憩スペースBのテラス",
  "/_portal/vshops/leisure-2407/s6.jpg": "シャワー室",
  "/_portal/vshops/leisure-2407/s7.jpg": "コインロッカーと休憩スペース",
  "/_portal/vshops/leisure-2407/s8.jpg": "レンタルタンクの置き場",
  "/_portal/vshops/leisure-2407/s9.jpg": "休憩スペースC",
  "/_portal/vshops/leisure-2407/s10.jpg": "海沿いの駐車スペース",
  "/_portal/vshops/leisure-625/hero.jpg": "白い棚に並ぶ、レジンアート",
  "/_portal/vshops/leisure-625/p1.jpg": "エイの形の、海の時計",
  "/_portal/vshops/leisure-625/p2.jpg": "海と波を描いた、ボード",
  "/_portal/vshops/leisure-625/s4.jpg": "貝殻の、フォトフレーム",
  "/_portal/vshops/leisure-625/s5.jpg": "ヒートガンで、白い波を",
  "/_portal/vshops/leisure-625/s6.jpg": "海を描いた、シーサー",
  "/_portal/vshops/leisure-625/s7.jpg": "海の色の、コースター",
  "/_portal/vshops/leisure-2604/hero.jpg": "出発を待つ、四輪バギー",
  "/_portal/vshops/leisure-2604/p1.jpg": "杉林の土の道を、走る",
  "/_portal/vshops/leisure-2604/p2.jpg": "薪の火が燃える、石窯",
  "/_portal/vshops/leisure-2604/s4.jpg": "夜の森の、テント",
  "/_portal/vshops/leisure-2604/s5.jpg": "燃える焚き火",
  "/_portal/vshops/leisure-2604/s6.jpg": "草地を下る、軽トラック",
  "/_portal/vshops/leisure-2604/s7.jpg": "ショベルカーの運転席",
  "/_portal/vshops/leisure-542/hero.jpg": "白い波の急流を、下る",
  "/_portal/vshops/leisure-542/p1.jpg": "桟橋に並ぶ、ゴムボート",
  "/_portal/vshops/leisure-542/p2.jpg": "川面に、飛び込む",
  "/_portal/vshops/leisure-542/s4.jpg": "岩の上から、川へ",
  "/_portal/vshops/leisure-542/s5.jpg": "澄んだ浅瀬に、浮かぶ",
  "/_portal/vshops/leisure-170/hero.jpg": "ダイビングの旗が立つ、店の外観",
  "/_portal/vshops/leisure-170/p1.jpg": "海のモニターのある、店内",
  "/_portal/vshops/leisure-170/p2.jpg": "木のカウンターと、ソファ",
  "/_portal/vshops/leisure-170/s4.jpg": "海の向こうに、富士山",
  "/_portal/vshops/leisure-1251/hero.jpg": "石で区切られた、渓流",
  "/_portal/vshops/leisure-1251/p1.jpg": "花畑ごしの、受付と食堂",
  "/_portal/vshops/leisure-1251/p2.jpg": "川原の浅い流れで、釣り",
  "/_portal/vshops/leisure-1251/s4.jpg": "受付のカウンター",
  "/_portal/vshops/leisure-1251/s5.jpg": "バーベキュー小屋の内側",
  "/_portal/vshops/leisure-1251/s6.jpg": "草地に咲く、ルピナス",
  "/_portal/vshops/leisure-1251/s7.jpg": "緑の中の、入り口の道",
  "/_portal/vshops/leisure-2620/hero.jpg": "池に映る、山と建物",
  "/_portal/vshops/leisure-2620/p1.jpg": "紅葉の下の、東屋",
  "/_portal/vshops/leisure-2620/p2.jpg": "テントと東屋の、区画サイト",
  "/_portal/vshops/leisure-2620/s4.jpg": "網の上の、魚の塩焼き",
  "/_portal/vshops/leisure-2620/s5.jpg": "炎を上げる、焚き火台",
  "/_portal/vshops/leisure-2620/s6.jpg": "雪の積もった、釣り池",
  "/_portal/vshops/leisure-2620/s7.jpg": "新緑の下の、東屋",
  "/_portal/vshops/leisure-2878/hero.jpg": "新緑の林を、馬で進む",
  "/_portal/vshops/leisure-2878/p1.jpg": "放牧地で、草を食べる馬",
  "/_portal/vshops/leisure-2878/p2.jpg": "草の上の、黒い馬",
  "/_portal/vshops/leisure-2878/s4.jpg": "雪の残る放牧地の、馬",
  "/_portal/vshops/leisure-2728/hero.jpg": "海の中の、サンゴと魚",
  "/_portal/vshops/leisure-2728/p1.jpg": "道路の向こうに、海岸",
  "/_portal/vshops/leisure-2728/p2.jpg": "木立の下の、テントサイト",
  "/_portal/vshops/leisure-2759/hero.jpg": "白い砂州の、透きとおる海",
  "/_portal/vshops/leisure-2759/p1.jpg": "浅瀬に着けた、小さな船",
  "/_portal/vshops/leisure-2759/p2.jpg": "サンゴ礁を泳ぐ、ウミガメ",
  "/_portal/vshops/leisure-2759/s4.jpg": "サンゴの上の、ウミガメ",
  "/_portal/vshops/leisure-2759/s5.jpg": "澄んだ浅い海の、後ろ姿",
};

type CuratedPlan = { name: string; desc: string; time?: string; cond?: string; photo: string };
type Curated = {
  /** 札・一覧の一言(店の特集が無い店だけ。紹介記事の事実を短く) */
  tagline?: string;
  /** 店名を 2 行に折る位置(自動で折れない名前だけ) */
  nameParts?: string[];
  /** アクセスの行(特集・紹介記事から拾えない店だけ。記事の「場所と行き方」の事実) */
  access?: string[];
  heroText: string[];
  plans: CuratedPlan[];
  blocks: Array<Omit<ABlock, "items"> & { items: string[] }>;
  extraRows?: ARow[];
  course: ACourse;
};

const V = "/_portal/vshops/";
const CURATED: Record<string, Curated> = {
  ac0001: {
    heroText: ["地上2〜15mの樹上を、", "渡って、滑る。"],
    plans: [
      { name: "アドベンチャーコース", desc: "森の特徴を活かした、樹上のアクティビティが40以上あるコース。ジップスライドは4本。", time: "平均1時間30分〜2時間", cond: "小学4年生以上または身長140cm以上", photo: `${V}leisure-2242/s5.jpg` },
      { name: "クイックアドベンチャー", desc: "アドベンチャー2コースとジップトリップ2コースを組み合わせたショートコース。ジップスライドを4本滑れる。", time: "約1時間(安全講習を含む)", photo: `${V}leisure-2242/hero.jpg` },
      { name: "ジップトリップコース", desc: "ジップスライド2本のコース。手をつないで一緒に滑れるダブルジップスライドがある。", time: "平均30〜40分", cond: "身長110cm以上・予約不要", photo: `${V}leisure-2242/s4.jpg` },
    ],
    blocks: [
      { key: "point", title: "体験のポイント", en: "HIGHLIGHTS", items: ["自然の立木の地上2〜15mの足場を渡る", "樹上のアクティビティは40種類以上", "手をつないで滑れるダブルジップスライド", "運転免許が不要の四輪バギー「カモシカバギー」", "巨大トランポリン・クラフト体験・モルックなどの森の遊び"] },
      { key: "bring", title: "持ち物・服装", en: "WHAT TO BRING", items: ["動きやすい長袖長ズボン(スカートは不可)", "履き慣れた運動靴(ハイヒール・サンダルは不可)", "手袋の着用は必須", "髪が長い場合は結ぶ", "カメラは原則持ち込める"] },
      { key: "safety", title: "安全のための決まり", en: "SAFETY", items: ["参加者全員が、出発前に安全講習を受ける", "安全講習は30分ごと・各回は基本15名まで", "地面から足が離れたら、常にハーネスでコースにつながる", "雹・雷・強風のときは、安全のためクローズ", "体力に不安がある人向けの迂回路がある"] },
    ],
    extraRows: [{ k: "hours", label: "営業日", lines: ["営業日カレンダーで分かります"] }],
    course: { title: "樹上のコースと、森の遊び場", badge: "3コース", tags: ["ジップスライド", "カモシカバギー", "クラフト体験"], place: "三重県・菰野町" },
  },
  ac0002: {
    heroText: ["約20〜30分で完成する、", "レザークラフト体験。"],
    plans: [
      { name: "コインケース", desc: "お名前や絵柄の刻印を入れる、レザークラフトのコインケース。", time: "約20分", cond: "予約制・初心者歓迎", photo: `${V}leisure-2526/s5.jpg` },
      { name: "バラキーホルダー", desc: "藍染めの革を、バラの形に仕上げるキーホルダー。", time: "約30分", cond: "予約制・初心者歓迎", photo: `${V}leisure-2526/p1.jpg` },
      { name: "マルチケース", desc: "お名前を刻印して、金具でとめるマルチケース。", time: "約30分", cond: "予約制・初心者歓迎", photo: `${V}leisure-2526/s4.jpg` },
    ],
    blocks: [
      { key: "point", title: "体験のポイント", en: "HIGHLIGHTS", items: ["約20〜30分で完成するレザークラフト体験", "初心者歓迎・2名から・予約制", "受付は10時から15時、1時間おきの6つの時間帯", "天然藍で染めた革「福山レザー」(瀬戸内の空・瀬戸内の海)", "ランドセルを革小物に仕立て直すリメイクもある"] },
      { key: "flow", title: "予約と当日のこと", en: "RESERVATION", items: ["予約はフォーム・電話・メール・LINEでできる", "当日選べるオプションは、革の色選び・金具追加・コバ処理磨き", "駐車場は4台分", "休みは毎週水曜日と年末年始(要確認)"] },
    ],
    course: { title: "革のワークショップ 3つのメニュー", badge: "3メニュー", tags: ["コインケース", "バラキーホルダー", "マルチケース"], place: "広島県・福山市" },
  },
  ac0003: {
    heroText: ["ショップの目の前が、", "海。"],
    plans: [
      { name: "体験ダイビング", desc: "ライセンスがなくても参加できる初心者向け。午前(9時集合・11時解散)と午後(12時30分集合・14時30分解散)の毎日2回。", time: "潜水時間 20〜40分ほど", cond: "10歳以上・最大水深12mまで", photo: `${V}leisure-2407/p1.jpg` },
      { name: "シュノーケリング", desc: "1時間ほどのレクチャーのあと、自由に海遊びをする。", time: "レクチャー 約1時間", cond: "身長120cm以上", photo: `${V}leisure-2407/hero.jpg` },
      { name: "ファンダイビング", desc: "ビーチから入るビーチガイドパックと、ボートで向かうボートガイドパックの2種類。毎日9時集合。", time: "毎日9時集合", cond: "ボートは2名以上", photo: `${V}leisure-2407/p2.jpg` },
    ],
    blocks: [
      { key: "point", title: "体験のポイント", en: "HIGHLIGHTS", items: ["ショップの目の前が海", "1989年創業・365日年中無休", "体験ダイビングは、ライセンスがなくても参加できる", "更衣室・トイレ・温水シャワーを備える", "磯釣りは、釣り具と餌が用意される"] },
      { key: "bring", title: "持ち物・設備", en: "WHAT TO BRING", items: ["体験ダイビングは、水着とタオル(器材はすべて用意)", "磯釣りは、釣り具と餌が用意される", "コインロッカーと休憩スペース(A・B・C)がある", "温水シャワーは男性用が受付棟の2階・女性用が1階", "レンタルタンクは事前の予約が要る"] },
      { key: "safety", title: "利用の条件・安全", en: "SAFETY", items: ["受付にAEDと緊急用酸素が置かれている", "磯釣りは、ライフジャケットを全員が着用", "体験ダイビングの最大水深は12mまで", "ボートダイビングは2名以上の申し込みが条件", "ファンダイビングは前日15時までに予約"] },
    ],
    extraRows: [{ k: "holidays", label: "定休日", lines: ["年中無休"] }],
    course: { title: "体験ダイビング・シュノーケリング・磯釣り", badge: "5メニュー", tags: ["体験ダイビング", "シュノーケリング", "磯釣り"], place: "静岡県・伊東市" },
  },
  ac0004: {
    tagline: "海を描くレジンアートの体験",
    nameParts: ["石垣島レジンアート", "くくる屋"],
    access: ["ユーグレナモールから徒歩10秒"],
    heroText: ["海を描いて、", "波を入れる。"],
    plans: [
      { name: "時計", desc: "文字盤に海を描いて波を入れ、時計に仕上げる体験。", time: "約1時間30分", cond: "2名で1つの体験もできる", photo: `${V}leisure-625/p1.jpg` },
      { name: "ボード", desc: "ボードに海を描いて波を入れる体験。A4とA5の2つの大きさがある。", time: "約1時間30分", cond: "1名につき1セット", photo: `${V}leisure-625/p2.jpg` },
      { name: "コースター", desc: "2枚のコースターに海を描く体験。", time: "約1時間", cond: "1名につき1セット", photo: `${V}leisure-625/s7.jpg` },
    ],
    blocks: [
      { key: "point", title: "体験のポイント", en: "HIGHLIGHTS", items: ["体験メニューは5つ(時計・ボード・コースター・シーサー・フォトフレーム)", "好きな海の色を描き、樹脂(レジン)を流し、ヒートガンで白い波を描いて仕上げる", "同じものは2つと作れない", "フォトフレームは、琉球ガラス・貝殻・珊瑚を好きなだけ付けられる"] },
      { key: "flow", title: "予約と当日のこと", en: "RESERVATION", items: ["問い合わせは電話・インスタグラムのDM・公式LINEで受け付けている", "予約は「ご予約はこちらから」から進む", "予約だけ先に入れ、体験の内容は当日、店内のメニューと見本を見てから決めることもできる"] },
      { key: "safety", title: "参加のきまり", en: "RULES", items: ["時計とシーサー大パネルは、2名で1つの体験ができる", "それ以外は1名につき1セット", "小さな子も、保護者のサポートがあれば体験できる"] },
    ],
    course: { title: "海を描く、レジンアートの体験", badge: "5メニュー", tags: ["時計", "ボード", "コースター"], place: "沖縄県・石垣市" },
  },
  ac0005: {
    tagline: "バギー・泥あそび・BBQ・キャンプ",
    nameParts: ["CIMAX ×", "東京バギー村"],
    access: ["都心から車で約60分", "駐車場は100台以上"],
    heroText: ["東京ドーム1個分の森で、", "走る・焼く・汚れる。"],
    plans: [
      { name: "バギー 森コース", desc: "レクチャーのあとに森や谷を走る。高低差約27mの急坂「地獄坂」を含む周回コース。", time: "所要1時間", cond: "免許は要らず、年齢制限はない", photo: `${V}leisure-2604/p1.jpg` },
      { name: "石窯ピザ", desc: "生地を伸ばすところから、薪窯で焼き上げるまでの体験。", time: "焼き時間は3〜5分", photo: `${V}leisure-2604/p2.jpg` },
      { name: "キャンプ・カーステイ", desc: "15時に入って、翌日の15時まで過ごす。", time: "15時〜翌15時", cond: "1日1組限定", photo: `${V}leisure-2604/s4.jpg` },
    ],
    blocks: [
      { key: "point", title: "体験のポイント", en: "HIGHLIGHTS", items: ["バギーのコースは3つ(森・ぬたぬた・森さんぽ)", "泥あそび・射的・サバイバルゲームがある", "BBQは屋根付きのテーブルのエリアで、最大100名まで", "ショベルカーを動かす・チェーンソーで倒木を切る・斧で薪を割る体験がある"] },
      { key: "bring", title: "持ち物・貸し出し", en: "WHAT TO BRING", items: ["ぬたぬたコースは、着替えが要る", "ヘルメットとプロテクターは貸し出し", "BBQの食材は持ち込み(コンロと炭はレンタルと販売がある)", "サバイバルゲームは、銃・ゴーグル・迷彩服のレンタルがある", "シャワーと更衣室が使える"] },
      { key: "safety", title: "安全のための決まり", en: "SAFETY", items: ["バギーは全員がレクチャーを受け、インストラクターが先導する", "お子さまが一人で運転できるかは、当日の走行テストで判断(目安は6歳前後)", "射的は18歳未満は、保護者の監督のもとで体験できる", "ショベルカー・チェーンソー・斧の体験には、係員が付く", "バギーの体験に100%の安全はない"] },
    ],
    extraRows: [
      { k: "hours", label: "受付時間", lines: ["9:00 〜 18:00(季節で変わる)"] },
      { k: "holidays", label: "定休日", lines: ["年中無休"] },
    ],
    course: { title: "里山のフィールドで、一日あそぶ", badge: "3コース", tags: ["バギー", "泥あそび", "石窯ピザ"], place: "千葉県・印西市" },
  },
  ac0006: {
    tagline: "吉野川のラフティングとダッキー",
    access: ["近鉄吉野線の大阿太駅から徒歩約15分", "JR五條駅から車で約20分・駐車場あり"],
    heroText: ["吉野川を、", "ゴムボートで下る。"],
    plans: [
      { name: "ラフティング", desc: "8〜10人乗りのゴムボートで川を下る。インストラクターが同乗する。", time: "半日は午前・午後・夕方から選べる", cond: "4歳以上", photo: `${V}leisure-542/hero.jpg` },
      { name: "ダッキー", desc: "2人乗りの、空気で膨らませて使うカヤックを自分たちで操る川下り。", cond: "10歳以上", photo: `${V}leisure-542/p1.jpg` },
      { name: "1日コース", desc: "カルディアキャンプ場で、BBQのランチが付く。", time: "9時45分集合・16時ごろ解散", cond: "最少催行は3名", photo: `${V}leisure-542/p2.jpg` },
    ],
    blocks: [
      { key: "point", title: "体験のポイント", en: "HIGHLIGHTS", items: ["吉野川のラフティング・ダッキーは4月1日から11月末まで", "半日コースと1日コースがある", "コースは当日の水量や川の状態で、上流か下流に決まる", "途中に、高さ約3.0mの飛び込みポイントがある", "ツアー中に撮った写真も提供される"] },
      { key: "bring", title: "装備・参加の条件", en: "CONDITIONS", items: ["ヘルメットとライフジャケットは用意される", "ラフティングは4歳以上・ダッキーは10歳以上", "中学生以下は保護者の同伴・18歳未満は保護者の同意が必要", "最少催行は半日コースが2名・1日コースが3名"] },
      { key: "safety", title: "安全のための決まり", en: "SAFETY", items: ["ラフティングはインストラクターが同乗する", "雨天でも実施されるが、風や増水などで中止になる場合がある", "妊娠中の人と飲酒している人は参加できない"] },
    ],
    extraRows: [{ k: "hours", label: "営業時間", lines: ["9:00 〜 18:00"] }],
    course: { title: "吉野川のラフティングとダッキー", badge: "2コース", tags: ["ラフティング", "ダッキー", "BBQランチ"], place: "奈良県・大淀町" },
  },
  ac0007: {
    tagline: "体験ダイビングとライセンス講習",
    nameParts: ["アモアナ", "ダイビングスクール"],
    access: ["沼津ICから車で2分", "三島駅・沼津駅から送迎あり"],
    heroText: ["沼津ICから車で2分。", "伊豆の海へ、潜りにいく。"],
    plans: [
      { name: "体験ダイビング", desc: "陸上でのレクチャー30分のあと、体験1ダイブが1時間。水深は5mまで。", time: "合わせて1.5時間", cond: "10歳以上・1人から", photo: `${V}leisure-170/s4.jpg` },
      { name: "ライセンス講習", desc: "オープン・ウォーター・ダイバー(OWD)の講習。連続で通わなくても、自分のペースで受けられる。", time: "学科2時間弱・実習2日間", cond: "1人から・少人数制", photo: `${V}leisure-170/p1.jpg` },
      { name: "ファンダイビング", desc: "伊豆のファンダイビングは基本2ダイブ。1ダイブ60分を超えるロングダイビングもできる。", cond: "1人から", photo: `${V}leisure-170/p2.jpg` },
    ],
    blocks: [
      { key: "point", title: "体験のポイント", en: "HIGHLIGHTS", items: ["PADIの5スター・ダイブセンター", "年中無休", "体験ダイビング・OWDライセンス講習・ファンダイビングを扱う", "沼津ICから車で2分", "三島駅・沼津駅へ、行きも帰りも送迎がある"] },
      { key: "bring", title: "持ち物(体験ダイビング)", en: "WHAT TO BRING", items: ["水着", "ハンドタオル・バスタオル", "サンダル", "シャンプー・リンス", "昼食"] },
      { key: "flow", title: "予約と当日のこと", en: "RESERVATION", items: ["申し込みは電話・LINE・ホームページでできる", "集合は、電車なら沼津駅北口・車なら店・ゲートウェイ函南・現地のいずれか", "体験の海洋実習地は、伊豆の海(平沢ビーチ・黄金崎ビーチ)", "支払いは、現金・QR決済・クレジットカード・電子マネー"] },
    ],
    course: { title: "体験ダイビングから、ライセンス講習まで", badge: "3メニュー", tags: ["体験ダイビング", "ライセンス講習", "ファンダイビング"], place: "静岡県・沼津市" },
  },
  ac0008: {
    tagline: "管理つり場で、渓流の釣り",
    access: ["会津鬼怒川線の中三依温泉駅から徒歩30分", "駐車場は50台ほど"],
    heroText: ["石で区切られた", "渓流で、釣る。"],
    plans: [
      { name: "渓流の釣り", desc: "イワナ・ヤマメ・マスから魚種を選ぶと、好きな場所に1人分5匹が放流される。", time: "放流は8時〜12時", cond: "貸し竿あり・手ぶらでも釣りができる", photo: `${V}leisure-1251/p2.jpg` },
      { name: "塩焼き・食事", desc: "釣った魚を、受付の手前の囲炉裏で塩焼きにできる。食堂では、四季そばやイワナそばなどが食べられる。", time: "食堂の注文は15時まで", photo: `${V}leisure-1251/p1.jpg` },
      { name: "バーベキュー", desc: "川のそばと、屋根のある小屋の2か所。食材と器具一式は持ち込み。", time: "7時〜15時", cond: "予約が必要", photo: `${V}leisure-1251/s5.jpg` },
    ],
    blocks: [
      { key: "point", title: "体験のポイント", en: "HIGHLIGHTS", items: ["全長800mの川を、自然石で60区画に区切った管理つり場", "餌釣りのほか、ルアー・フライ・テンカラもできる", "釣りの時間と釣り上げ数に制限はない", "夏季(7月中旬〜9月上旬)には、つかみどりも行われる", "広い芝生の広場と、お花畑がある"] },
      { key: "bring", title: "持ち物・決まり", en: "WHAT TO BRING", items: ["貸し竿は餌釣り用がある(ルアー・フライ用はない)", "バーベキューの食材と器具一式は持ち込み", "支払いは現金のみ", "ペットは同伴できる(リードを外しての散歩と食堂内は不可)"] },
      { key: "safety", title: "利用の決まり", en: "RULES", items: ["釣った魚はリリース禁止(預かる決まり)", "釣り場で泳ぐことは禁止", "冬季は休業。大雨で休業することもある", "予約は前日まで(当日は現地受付のみ)"] },
    ],
    course: { title: "渓流で釣って、塩焼きにする", badge: "3メニュー", tags: ["釣り", "塩焼き", "バーベキュー"], place: "栃木県・日光市" },
  },
  ac0009: {
    tagline: "釣り池でのルアー・フライ、BBQ、キャンプ",
    heroText: ["赤城山のふもと、", "標高750mの釣り池。"],
    plans: [
      { name: "FISHINGコース", desc: "釣りだけのコース。5つの釣り池で、ルアーとフライフィッシングができる。", time: "8時〜16時", cond: "釣り方はルアーとフライ", photo: `${V}leisure-2620/hero.jpg` },
      { name: "BBQコース", desc: "日帰りのBBQコース。釣り堀をオプションで追加できる。", time: "11時入場・17時退場", photo: `${V}leisure-2620/s7.jpg` },
      { name: "CAMPコース", desc: "宿泊のコース。釣り堀をオプションで追加できる。", time: "13時入場・翌11時退場", photo: `${V}leisure-2620/p2.jpg` },
    ],
    blocks: [
      { key: "point", title: "体験のポイント", en: "HIGHLIGHTS", items: ["赤城山のふもと、標高750mにあるキャンプ場", "釣り池は5つ(かつて棚田だった頃の水路跡を再整備)", "放流はニジマス・ヤマメ・イワナなど", "各サイトの東屋の囲炉裏で、釣った魚をその場で焼き魚にできる", "屋根のある東屋は、雨が降ったときも使える"] },
      { key: "bring", title: "レンタル・設備", en: "WHAT TO BRING", items: ["釣竿・リリーサー・ランディングネットのセットはレンタルがある", "ルアーは受付で購入する", "ソロテントのレンタルが2張りある", "サイトは車を横付けできるオートサイト", "水洗のトイレ棟がある"] },
      { key: "safety", title: "利用の決まり", en: "RULES", items: ["保護者の監督があれば、未就学児も利用できる", "ペットは全施設で同伴できる", "台風など危険のある場合を除き、雨でも営業している", "不定休のため、営業はSNSで確かめる"] },
    ],
    course: { title: "釣り池と、BBQとキャンプ", badge: "3コース", tags: ["FISHING", "BBQ", "CAMP"], place: "群馬県・桐生市" },
  },
  ac0010: {
    tagline: "馬に乗って歩く、ホーストレッキング",
    nameParts: ["ライディングクラブ", "ジョバール那須"],
    access: ["新白河駅から車で約20分", "那須フラワーワールドから2分(送迎なし)"],
    heroText: ["一般の人が立ち入れない", "森と草原を、馬で歩く。"],
    plans: [
      { name: "ホーストレッキング", desc: "クラブが管理する私有地で行う。コーヒーブレイク付き。一般向けは並歩(馬が歩く速さ)だけ。", time: "約2時間・9時か13時に集合", cond: "11歳以上70歳未満(通常の対応)", photo: `${V}leisure-2878/hero.jpg` },
      { name: "乗馬レッスン", desc: "ブリティッシュとウエスタンのレッスン。穏やかな性格のポニーから乗り始めることもできる。", cond: "習っている人は4歳から70代", photo: `${V}leisure-2878/p1.jpg` },
      { name: "上級者専用プラン", desc: "速歩・駈歩は、上級者専用プランとして用意されている。", cond: "事前の問い合わせが要る", photo: `${V}leisure-2878/s4.jpg` },
    ],
    blocks: [
      { key: "point", title: "体験のポイント", en: "HIGHLIGHTS", items: ["那須高原のクラブが管理する私有地で行うホーストレッキング", "初心者・カップル・家族も参加できる", "戻ってからコーヒーブレイクがある", "撮影した動画・写真をデータで受け取れる"] },
      { key: "bring", title: "持ち物・服装", en: "WHAT TO BRING", items: ["手首が隠れる長袖・ゆとりのある長ズボン", "足首が隠れる靴下・脱げにくいスニーカー(サンダルとヒールは不可)", "雨がっぱ・着替え・タオル・虫よけスプレー・手袋は持参(貸し出しと販売はない)"] },
      { key: "flow", title: "参加の流れ", en: "FLOW", items: ["受付で説明を聞き、同意書に署名・捺印をする", "クラブの馬場で、約15〜30分、基本操作の練習をして出発する", "予約は前日の17時まで・雨天決行"] },
    ],
    course: { title: "森と草原を歩く、ホーストレッキング", badge: "約2時間", tags: ["ホーストレッキング", "乗馬レッスン", "流鏑馬"], place: "栃木県・那須町" },
  },
  ac0011: {
    tagline: "シュノーケル・カヤック・洞窟探検",
    nameParts: ["ハピネス", "マリン倶楽部"],
    access: ["沖縄自動車道の宜野座から車で約4分", "国道329号線沿い・駐車場は30台分"],
    heroText: ["1グループ貸切の", "ビーチで、海あそび。"],
    plans: [
      { name: "シュノーケルツアー", desc: "集合から解散まで約2時間。", time: "約2時間", cond: "2歳から参加できる", photo: `${V}leisure-2728/hero.jpg` },
      { name: "カヤックアドベンチャーツアー", desc: "集合から解散まで約2時間。", time: "約2時間", cond: "2歳から参加できる", photo: `${V}leisure-2728/p1.jpg` },
      { name: "セットメニュー", desc: "シュノーケル・カヤック・SUPにバナナボートなどを組み合わせる、半日のメニュー。バーベキューをオプションで追加できる。", time: "半日", photo: `${V}leisure-2728/p2.jpg` },
    ],
    blocks: [
      { key: "point", title: "体験のポイント", en: "HIGHLIGHTS", items: ["1グループ貸切制のビーチで遊ぶマリンショップ", "体験ダイビングは、10歳から60歳までが対象・約2時間(器材とウェットスーツの貸し出しがある)", "洞窟探検ツアーは5歳から参加できる", "SUPは60分のレンタルで、2歳から参加できる"] },
      { key: "bring", title: "持ち物・集合", en: "WHAT TO BRING", items: ["集合は開催時間の30分前", "水着は先に着ていく", "バスタオルは各自で持っていく", "温水が出るシャワー施設がある"] },
      { key: "safety", title: "参加の前に", en: "NOTES", items: ["メニュー中に撮った写真はデータで受け取れる", "飲酒している人・総入れ歯・てんかん・妊娠中の人は参加できない"] },
    ],
    course: { title: "海あそびから、洞窟探検まで", badge: "約2時間", tags: ["シュノーケル", "カヤック", "洞窟探検"], place: "沖縄県・宜野座村" },
  },
  ac0012: {
    tagline: "幻の島(浜島)と青の洞窟のツアー",
    nameParts: ["SeaChan", "石垣島"],
    access: ["集合場所はツアーによって異なる"],
    heroText: ["幻の島(浜島)へ、", "船で上陸する。"],
    plans: [
      { name: "幻の島(浜島)上陸のみ", desc: "石垣島から小さな船で、片道約20〜30分。島での自由時間は約60分。", time: "約2時間・1日4便", cond: "0歳から参加できる", photo: `${V}leisure-2759/p1.jpg` },
      { name: "幻の島＋シュノーケル", desc: "島への上陸に、シュノーケリングを加えたツアー。", cond: "0〜65歳が対象", photo: `${V}leisure-2759/hero.jpg` },
      { name: "青の洞窟探検＆ウミガメ", desc: "船酔いの心配がないビーチエントリー。シュノーケルの器材3点セットとライフジャケットを用意している。", time: "約2.5時間・1日4便", cond: "3歳から65歳まで", photo: `${V}leisure-2759/p2.jpg` },
    ],
    blocks: [
      { key: "point", title: "体験のポイント", en: "HIGHLIGHTS", items: ["幻の島(浜島)は、竹富島と小浜島の間にある無人島で、潮の満ち引きで姿を現す", "島への上陸は、泳がなくても参加できる", "船には、日よけテントとトイレがある", "シュノーケリングは、初心者にも講習をおこなう"] },
      { key: "bring", title: "持ち物・服装", en: "WHAT TO BRING", items: ["サンダル・バスタオル・着替えなど", "濡れても良い服装で参加する", "11月から4月末は、ウェットスーツの貸し出しがある", "度付きのレンズもある(予約のときに申し出る)"] },
      { key: "safety", title: "参加の前に", en: "NOTES", items: ["予約のとき、泳ぎの得意・不得意を伝えて、グループ分けをする", "雨でも開催するが、波や風が強すぎるときは中止", "ウミガメは自然の生き物なので、会えない場合もある", "5歳未満の子は、保護者が泳ぎが得意なことやシュノーケルの経験者であることが条件になる"] },
    ],
    extraRows: [{ k: "holidays", label: "定休日", lines: ["受付は年中無休"] }],
    course: { title: "幻の島と、青の洞窟", badge: "3メニュー", tags: ["幻の島", "青の洞窟", "ウミガメ"], place: "沖縄県・石垣市" },
  },
};

/** 営業時間を「9:00 〜 17:00」に整える(「月-水金-日 09:00 - 17:00」「毎日 10:00 - 18:00」の曜日の語と先頭の 0 を外す。曜日は定休日の行にある) */
export function hoursText(h: string): string {
  return h
    .trim()
    .replace(/^(毎日|[月火水木金土日\-・]+)\s*/, "")
    .replace(/\s*[-–]\s*/g, " 〜 ")
    .replace(/(^|\s)0(\d):/g, "$1$2:");
}

/** 住所が住宅地の可能性があり、オーナー確認待ちの店。画面には市町村までしか出さない(番地・地図のリンク・Google マップの出どころは出さない) */
const HIDE_STREET = new Set(["ac0012"]);

/** 「・」で分ける(かっこの中の「・」では分けない) */
function splitDot(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(" || ch === "（") depth++;
    if (ch === ")" || ch === "）") depth = Math.max(0, depth - 1);
    if (ch === "・" && depth === 0) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** 店名を 2 行に折る位置(「・」と空白のあとで折れるよう、折っていい所を残す)。表示は <wbr> を挟む */
function nameParts(name: string): string[] {
  const parts = name.split(/(?<=[・\s])/).map((x) => x.trim()).filter(Boolean);
  if (parts.length === 1 && name.length > 8) {
    // 折る所が無い長い名前は、「センター」「スタジオ」などの前で 2 行にする
    const m = /^(.{4,}?)(センター|スタジオ|ガーデン|パーク|ツアーズ?|ファーム|ラボ)$/.exec(name);
    if (m) return [m[1], m[2]];
  }
  return parts;
}

const KIND_EN: Record<string, string> = { "sea-river": "SEA・RIVER", "mountain-sky": "MOUNTAIN・SKY", craft: "CRAFT", sightseeing: "SIGHTSEEING" };

/** 紹介記事の導入を 1 文ずつ点検し、110 字までに収まる前からの文をつなぐ(最初の 1 文が長いときはその 1 文) */
function ledeLong(t: string | undefined): string {
  const sents = (t ?? "").split(/(?<=。)/).map((x) => x.trim()).filter(Boolean);
  let out = "";
  for (const x of sents) {
    if (!vkLineOk(x)) break;
    if (out && out.length + x.length > 110) break;
    out += x;
  }
  return out;
}

function accessLines(f: PlaceFeature | undefined, p: Place): string[] {
  const specs = (f?.article.ranking ?? []).flatMap((r) => r.specs ?? []);
  const way = specs.find((s) => s.k === "行き方")?.v;
  if (way) return splitDot(way).filter(vkLineOk);
  const park = specs.find((s) => s.k === "駐車場")?.v;
  if (park) return [`駐車場 ${park}`];
  const body = p.article?.sections.find((s) => /場所|行き方|アクセス/.test(s.heading))?.body ?? "";
  const m = /駐車場は[^。]*/.exec(body);
  return m ? [m[0]] : [];
}

/**
 * 営業時間・定休日の案内から、曜日ごとの営業日を作る(filters.ts の OpenDay)。lib/portal/openNow の読み取り(weekFromText)をそのまま使い、読めない案内は推測しない。
 *  - 営業時間が曜日ごとに読めたら、営業する曜日は o、休みの曜日は c(定休日の案内で曜日が分かる)
 *  - 「不定休」の店は、休みの曜日だけ c、あとは分からない u(いつ休むか決まっていない)
 *  - 定休日に「変更あり」の語がある店は、休みの曜日も u(変わることがある)
 *  - 営業時間の案内が無い店は u。ただし定休日が「年中無休」なら全部 o
 *  - 「営業は3月21日〜11月30日」のような期間の案内は range に入れ、期間の外は休み。「年末年始」の休みは 12/29〜1/3 を u にする
 */
export function openDayOf(hours: string, holidays: string): OpenDay {
  const d: OpenDay["d"] = ["u", "u", "u", "u", "u", "u", "u"];
  const out: OpenDay = { d };
  const { week } = weekFromText(hours, holidays);
  const irregular = /不定/.test(holidays);
  const changes = /変更あり|変更になる/.test(holidays);
  if (week) {
    week.d.forEach((w, i) => {
      d[i] = w === null ? "u" : w.length === 0 ? (changes ? "u" : "c") : irregular ? "u" : "o";
    });
    if (week.n) out.n = week.n;
  } else if (/年中無休/.test(holidays)) {
    for (let i = 0; i < 7; i++) d[i] = "o";
  }
  const m = /営業は(\d{1,2})月(\d{1,2})日[〜~～-](\d{1,2})月(\d{1,2})日/.exec(holidays.normalize("NFKC"));
  if (m) out.range = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
  if (/年末年始/.test(holidays)) out.yearend = 1;
  return out;
}

function shopOf(base: LiveShop, p: Place, f: PlaceFeature | undefined): AShop {
  const cur = CURATED[base.id];
  const photoList: LinePhoto[] = base.photos.map((ph) => ({ ...ph, cap: CAP[ph.src] ?? "" }));
  const byPath = new Map(photoList.map((x) => [x.src, x]));
  const pick = (path: string, i: number): LinePhoto => byPath.get(path) ?? photoList[i % Math.max(photoList.length, 1)];

  const subParts = (f?.article.subtitle ?? "").split(" / ");
  const subTag = subParts[2] ?? "";
  const tagline = subTag && vkLineOk(subTag) ? subTag : cur?.tagline && vkLineOk(cur.tagline) ? cur.tagline : "";

  const hide = HIDE_STREET.has(base.id);
  // 番地を伏せる店は、町字(「登野城」など)も文から外して、市町村までにする
  const town = hide ? base.address.replace(base.area, "").replace(/[0-9０-９].*$/, "").trim() : "";
  const scrub = (t: string): string => (town ? t.split(town).join("") : t);
  const rows: ARow[] = [];
  // 番地を伏せる店は、市町村までの「沖縄県石垣市」だけ
  const addr = hide ? base.area : base.address;
  if (addr) rows.push({ k: "address", label: "住所", lines: [addr] });
  if (base.phone) rows.push({ k: "phone", label: "電話", lines: [base.phone] });
  // 営業時間は「月火木-日 10:00 - 18:00」のような曜日つきの形をそのまま出さず、「10:00 〜 18:00」に整える(休みの曜日は定休日の行)
  const hrs = hoursText(base.hours);
  if (hrs) rows.push({ k: "hours", label: "営業時間", lines: [hrs] });
  if (base.holidays) rows.push({ k: "holidays", label: "定休日", lines: [base.holidays] });
  // 店データに無い行だけ、紹介記事の事実から足す(同じ種類の行は重ねない)
  for (const r of cur?.extraRows ?? []) if (!rows.some((x) => x.k === r.k)) rows.push(r);
  const acc = cur?.access ?? accessLines(f, p);
  if (acc.length) rows.push({ k: "access", label: "アクセス", lines: acc });
  // 地図は店データの緯度経度の位置(番地を伏せる店・緯度経度が無い店は出さない)
  const mapHref = !hide && base.lat != null && base.lng != null ? `https://www.google.com/maps/search/?api=1&query=${base.lat},${base.lng}` : null;

  // 特集(features-activity.json)がある店は特集から。無い店は紹介記事(Place.article)の見出し・導入から(日付は記事の確認日)
  const headline = base.article?.headline ?? "";
  const feat = f
    ? {
        title: f.article.titleHTML.split(/<br\s*\/?>/i).map((s) => s.replace(/<[^>]+>/g, "").trim()).filter(Boolean),
        plain: f.article.title,
        sub: subParts.join(" / "),
        body: scrub(base.article?.lede ?? ""),
        date: f.article.date ?? "",
        dateLabel: "",
      }
    : headline
      ? {
          title: scrub(headline).split(/(?<=。)/).map((x) => x.trim()).filter(Boolean),
          plain: scrub(headline),
          sub: [base.kindName, base.area].filter(Boolean).join(" / "),
          body: scrub(base.article?.lede ?? ""),
          date: base.article?.checkedAt ?? "",
          dateLabel: "確認 ",
        }
      : null;

  return {
    ...base,
    nameParts: cur?.nameParts ?? nameParts(base.name),
    tagline,
    kindEn: KIND_EN[base.kind] ?? "",
    lede: scrub((p.article?.lede ?? "").trim()),
    ledeShort: scrub(base.article?.lede ?? ""),
    ledeLong: scrub(ledeLong(p.article?.lede)),
    photoList,
    rows,
    plans: (cur?.plans ?? []).map((pl, i) => ({ ...pl, photo: pick(pl.photo, i) })),
    blocks: (cur?.blocks ?? []).map((b) => ({ ...b, items: b.items.filter(vkLineOk) })).filter((b) => b.items.length > 0),
    course: cur?.course ?? { title: base.name, badge: "", tags: [], place: base.area },
    // 番地を伏せる店は、位置が分かる Google マップのリンクを出どころに出さない
    // 出どころの名前に「その他」(公式サイトのページ名)があれば「ほか」に(「その他」の語は使わない決まり)
    // 6 件で打ち切るとき、Google マップのリンクは落とさない（公式サイトのページが多い店で、末尾のマップが消えていた）
    sources: capSources(
      (p.article?.sources ?? f?.sources ?? []).filter((x) => !(hide && /google\.com\/maps|maps\.google\./.test(x.url))).map((x) => ({ ...x, label: x.label.replace(/その他/g, "ほか") })),
      6,
    ),
    checkedAt: p.article?.checkedAt ?? f?.checkedAt ?? "",
    feat,
    mapLabel: mapHref ? "MAP" : "",
    heroText: cur?.heroText ?? [],
    // 札の中の短い語。特集のタグ(店ごとの語)があればそれ。無い店は店データの体験スタイル(子連れ・初心者歓迎など)
    pills: (f ? f.tags : base.tags)
      .filter((t) => vkLineOk(t) && !/[都道府県市区町村駅]|徒歩|^フォレストアドベンチャー$/.test(t))
      .slice(0, 3),
    prefEn: base.pref.toUpperCase(),
    hoursText: hrs,
    mapHref,
    // 店データに無い定休日(年中無休など)は、紹介記事の事実から足した行(CURATED の extraRows)を使う
    open: openDayOf(base.hours, base.holidays || cur?.extraRows?.find((r) => r.k === "holidays")?.lines[0] || ""),
  };
}

/** 出どころを max 件までにする。Google マップのリンクがあれば 1 件は必ず残す（順番は元のまま） */
function capSources<T extends { url: string }>(list: T[], max: number): T[] {
  if (list.length <= max) return list;
  const isMap = (x: T) => /google\.com\/maps|maps\.google\./.test(x.url);
  const map = list.find(isMap);
  if (!map) return list.slice(0, max);
  const rest = list.filter((x) => x !== map).slice(0, max - 1);
  return list.indexOf(map) < max ? list.slice(0, max) : [...rest, map];
}

export type AData = {
  shops: AShop[];
  /** 店のある地方ごとの数(探すの絞り込みの数。REGIONS の地方 → 「中国・四国」は中国と四国を足す) */
  regionCounts: Record<"kanto" | "koshinetsu" | "tokai" | "kansai" | "chushikoku" | "kyushu", number>;
};

/**
 * 段ごとに出す店(見本の札の枚数に合わせる)。載っている店から、種類・地方がばらけるように選ぶ。同じ段では同じ店を重ねない。
 *  top     = 最初のページ「掲載中の体験」(見本 6 枚)
 *  course  = 探すの「モデルコースで探す」(見本 3 枚)
 *  article = 特集の「店ごとの特集記事」(見本 4 枚)
 * 探すの結果の一覧は載っている店すべて。
 */
export const PICKS = {
  top: ["ac0001", "ac0003", "ac0002", "ac0006", "ac0010", "ac0004"],
  course: ["ac0001", "ac0005", "ac0011"],
  article: ["ac0001", "ac0003", "ac0002", "ac0011"],
} as const;

export function pickShops(shops: AShop[], ids: readonly string[]): AShop[] {
  return ids.map((id) => shops.find((s) => s.id === id)).filter((s): s is AShop => !!s);
}

export async function loadAData(): Promise<AData> {
  const [places, feats] = await Promise.all([getPlaces("activity"), getGeneratedFeatures("activity")]);
  const shops = (await loadShops(activityCfg)).map((s) => {
    const p = places.find((x) => x.id === s.id)!;
    const f = feats.find((x) => x.placeId === s.id);
    return shopOf(s, p, f);
  });
  const reg = (slugs: string[]) => shops.filter((s) => slugs.includes(s.region)).length;
  return {
    shops,
    regionCounts: {
      kanto: reg(["kanto"]),
      koshinetsu: reg(["koshinetsu"]),
      tokai: reg(["tokai"]),
      kansai: reg(["kansai"]),
      chushikoku: reg(["chugoku", "shikoku"]),
      kyushu: reg(["kyushu", "okinawa"]),
    },
  };
}

/** 札(店のカード)に必要な分だけ(クライアントの部品にも渡せる、文字と数字だけ) */
export function toCard(s: AShop): CardShop {
  const p = s.photoList[0];
  return { id: s.id, name: s.name, pref: s.pref, prefName: s.prefName, city: s.city, kindName: s.kindName, hours: s.hoursText, phone: s.phone, tagline: s.tagline, src: p?.src ?? "", alt: p?.alt ?? s.name, region: s.region, kind: s.kind, tags: s.tags, open: s.open };
}

/** 都道府県の短い名前(「三重」。表に無ければ元の名前) */
export function prefShort(slug: string, fallback: string): string {
  return PREFECTURES.find((p) => p.slug === slug)?.short ?? fallback;
}
