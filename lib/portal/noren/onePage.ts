import { RELEASE_FEATURE } from "./release";
import { FEATURED_SINGLE_IDS } from "./featureSingle";

/**
 * 1 店 1 ページ（見本。2026-10-12 オーナー指示「店舗ページと特集記事は一緒に」）。
 * 対象の特集記事（下の ONE_PAGE_SHOP_OF_FEATURE の 50 本）は、写真が主役の特集記事 + 記事の終わりの店舗情報を、店ページ側の URL /restaurant/<店の ID> で 1 ページとして出す。
 * 特集記事の URL /feature/<記事 ID> は、同じ店の /restaurant/<店の ID> へ恒久リダイレクト（next.config.ts）。サイト内のリンクは、はじめから /restaurant/<店の ID> を指す（featureHrefOf）。
 * 切り替え NOREN_ONE_PAGE が false（RELEASE_FEATURE が false のとき）のときは、全部今までどおり（店ページ・特集記事ページは別々）。
 *
 * 対象の決め方（2026-10-12）: 店 1 軒の記事（isSingleShopFeature）のうち、
 *   ① 対の店ページがある（pairedShopOfFeature。ARTICLE_STORE_ID_BY_FEATURE の完全一致）、
 *   ② 使える実物の写真が 6 枚以上ある（記事の写真 + 対の店ページの写真を重複なしで数える。lib/imageBlocklist.ts の表示禁止・featureSingle.ts の DUMMY_FEATURE_IMAGES・_placeholder・食べログ等は数えない）、
 *   ③ 店 ID が r72・r277・r330・r368（オーナーが非表示にした 4 店）ではない。
 * 写真が 5 枚以下の記事・対の店ページが無い記事は対象外（今までの枠のまま）。先頭の 20 本は特集の一覧の最初の 20 本、続く 30 本は一覧の棚に足した本（FEATURED_SINGLE_IDS の後ろ）。対象は棚の 50 本と同じ。
 * 条件を満たす記事のうち GOGUMI.・蕎亭う月・かき小屋匠ちゃんの 3 本は、スマホで見どころの縦書きの見出しが本文に重なった（写真のない見どころ・小さな主役の写真の組み）ので、対象から外した（今までの枠のまま）。
 *
 * 軽いファイル（lib/data・lib/articleStores を読まない。クライアントの部品から import される nav.ts・next.config.ts からも使う）。
 * 記事 ID → 店 ID の対応は、既存の対応表 ARTICLE_STORE_ID_BY_FEATURE（lib/articleStores.ts）の対象ぶんの写し。ID の完全一致だけで引く（店名・題の部分一致は使わない）。
 * 既存の対応表と食い違わないことは、店ページ（app/gourmet/restaurant/[id]/page.tsx）が描くときに確かめる（食い違えば 1 ページ化せず、今までの店ページを出す）。
 */
export const NOREN_ONE_PAGE = RELEASE_FEATURE;

/** 記事 ID → 店 ID（対象の 50 本 = FEATURED_SINGLE_IDS の 50 本。先頭の 20 本が先頭の 20 本） */
export const ONE_PAGE_SHOP_OF_FEATURE: Readonly<Record<string, string>> = {
  "スペインバルPALLO": "r361", // スペインバルPALLO
  "日本料理利喜笑店八王子": "r402", // 日本料理 利喜笑店 八王子
  "ぺんぎん食堂": "r399", // ぺんぎん食堂 煮込みと惣菜の店
  "凜喜桜変": "r431", // 凜喜桜変
  "近江牛日本料理ひょうたんや": "r481", // 近江牛 日本料理 ひょうたんや
  "taracafe.": "r512", // tara cafe.
  "SteakHouseG-Base": "r376", // Steak House G-Base
  "寿司割烹粋里": "r434", // 寿司割烹 粋里
  "MOONCAFE": "r454", // MOON CAFE
  "個室焼肉華牛KAGYU": "r450", // 個室焼肉 華牛 KAGYU
  "すし大": "r435", // すし大
  "蒲生第一酒場": "r458", // 蒲生第一酒場
  "海カフェプルメリア": "r455", // 海カフェ プルメリア
  "二福亭": "r457", // 二福亭
  "カフェレガーロ": "r452", // カフェ レガーロ
  "貝焼酒場樹": "r480", // 貝焼酒場 樹
  "グルテンフリーREZAN": "r444", // グルテンフリー REZAN
  "紅梅庵": "r421", // 紅梅庵
  "旬菜笑食屋裕-ひろ-": "r520", // 旬菜笑食屋 裕 -ひろ-
  "お好み焼き千富": "r467", // お好み焼き 千富
  "すし笑魚亭": "r409", // すし笑魚亭 / ティーサロン笑魚亭
  "創作イタリアン肉バルCRAFT": "r459", // 創作イタリアン肉バル CRAFT
  "souvenir": "r418", // souvenir-スヴニール-
  "ManpukuShokudoKante": "r419", // 万福食堂カンテ
  "松寿司本店": "r423", // 松寿司本店
  "diningkitchenLIFE": "r466", // dining kitchen LIFE
  "しんちゃん": "r429", // しんちゃん
  "ロースタリーフィト": "r373", // ロースタリーフィト
  "オステリアバールアマーノ": "r432", // オステリア バール ア マーノ
  "ごはん処湊茶屋": "r395", // ごはん処 湊茶屋
  "太鼓判亭本店": "r427", // 太鼓判亭本店
  "多幸": "r420", // 多幸
  "DolceCucinaAngeloアンジェロ": "r436", // Dolce&Cucina Angelo（アンジェロ）
  "まるこう": "r468", // まるこう
  "ロータスカフェ": "r451", // ロータスカフェ
  "幌馬車樹樹": "r375", // 幌馬車 樹樹
  "FUJICOFFEE（ふじ珈琲）": "r345", // FUJI COFFEE（ふじ珈琲）
  "味感真寿美": "r422", // 味感 真寿美
  "喜重軒": "r424", // 喜重軒
  "すし処隆": "r428", // すし処 隆
  "さつま路": "r430", // さつま路
  "フルーツスノウ": "r433", // フルーツスノウ
  "pepo": "r446", // pepo
  "竹千庵": "r447", // 竹千庵
  "すみか": "r453", // すみか
  "笑酒楽": "r465", // 笑酒楽
  "めん食い処わ": "r473", // めん食い処 わ
  "赤れんが": "r477", // 赤れんが
  "OyatsuBoxPiyo": "r498", // OyatsuBoxPiyo
  "元祖煮ぼうとうの國良": "r521", // 元祖煮ぼうとうの國良
};

const NFC = (s: string) => s.normalize("NFC");
const SHOP_OF = new Map(Object.entries(ONE_PAGE_SHOP_OF_FEATURE).map(([k, v]) => [NFC(k), v] as const));
const FEATURE_OF = new Map(Object.entries(ONE_PAGE_SHOP_OF_FEATURE).map(([k, v]) => [v, k] as const));

/** 1 ページ化する記事の対の店 ID（対象のどれでもなければ null。切り替えが false のときも null） */
export const onePageShopOf = (featureId: string): string | null => (NOREN_ONE_PAGE ? SHOP_OF.get(NFC(featureId)) ?? null : null);

/** 1 ページ化する店の記事 ID（対象のどれでもなければ null。切り替えが false のときも null） */
export const onePageFeatureOf = (shopId: string): string | null => (NOREN_ONE_PAGE ? FEATURE_OF.get(shopId) ?? null : null);

/** 特集記事への行き先。対象の記事は、転送を踏まないよう、はじめから店の URL /restaurant/<店の ID> を指す。それ以外は今までどおり /feature/<記事 ID> */
export const featureHrefOf = (id: string): string => {
  const sid = onePageShopOf(id);
  return sid ? `/restaurant/${sid}` : `/feature/${encodeURIComponent(id)}`;
};

/** 写真が主役の形（1 店 1 ページ）で出す記事か（対象の 50 本。ID の完全一致） */
export const isOnePageFeature = (featureId: string): boolean => SHOP_OF.has(NFC(featureId));

// 特集の一覧の棚（FEATURED_SINGLE_IDS）は、すべて対象の中にあること（食い違いは開発時に見つける）
if (process.env.NODE_ENV !== "production") {
  const miss = [...FEATURED_SINGLE_IDS].filter((id) => !SHOP_OF.has(NFC(id)));
  if (miss.length > 0) console.error("[onePage] FEATURED_SINGLE_IDS に ONE_PAGE_SHOP_OF_FEATURE に無い記事があります:", miss.join(","));
  const shops = Object.values(ONE_PAGE_SHOP_OF_FEATURE);
  if (new Set(shops).size !== shops.length) console.error("[onePage] 同じ店が 2 つの記事に対応しています");
}
