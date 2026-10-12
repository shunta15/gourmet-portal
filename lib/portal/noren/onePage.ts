import { RELEASE_REST } from "./release";
import { FEATURED_SINGLE_IDS } from "./featureSingle";

/**
 * 1 店 1 ページ（見本。2026-10-12 オーナー指示「店舗ページと特集記事は一緒に」）。
 * 特集の一覧の最初の 20 本の特集記事（FEATURED_SINGLE_IDS）は、写真が主役の特集記事 + 記事の終わりの店舗情報を、店ページ側の URL /restaurant/<店の ID> で 1 ページとして出す。
 * 特集記事の URL /feature/<記事 ID> は、同じ店の /restaurant/<店の ID> へ恒久リダイレクト（next.config.ts）。サイト内のリンクは、はじめから /restaurant/<店の ID> を指す（featureHrefOf）。
 * 切り替え NOREN_ONE_PAGE が false（RELEASE_REST が false の本番の main）のときは、全部今までどおり（店ページ・特集記事ページは別々）。
 *
 * 軽いファイル（lib/data・lib/articleStores を読まない。クライアントの部品から import される nav.ts・next.config.ts からも使う）。
 * 記事 ID → 店 ID の対応は、既存の対応表 ARTICLE_STORE_ID_BY_FEATURE（lib/articleStores.ts）の対象ぶんの写し。ID の完全一致だけで引く（店名・題の部分一致は使わない）。
 * 既存の対応表と食い違わないことは、店ページ（app/gourmet/restaurant/[id]/page.tsx）が描くときに確かめる（食い違えば 1 ページ化せず、今までの店ページを出す）。
 */
export const NOREN_ONE_PAGE = RELEASE_REST;

/** 記事 ID → 店 ID（FEATURED_SINGLE_IDS の 20 本） */
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

// 20 本の並びは FEATURED_SINGLE_IDS と同じ（食い違いは開発時に見つける）
if (process.env.NODE_ENV !== "production") {
  const a = [...FEATURED_SINGLE_IDS].map(NFC).sort().join("|");
  const b = Object.keys(ONE_PAGE_SHOP_OF_FEATURE).map(NFC).sort().join("|");
  if (a !== b) console.error("[onePage] ONE_PAGE_SHOP_OF_FEATURE と FEATURED_SINGLE_IDS が食い違っています");
}
