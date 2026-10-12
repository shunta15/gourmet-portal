import "server-only";
import { RELEASE_REST } from "./release";
import { FEATURES, FEATURE_ARTICLES } from "@/lib/data";
import { ARTICLE_STORE_ID_BY_FEATURE } from "@/lib/articleStores";
import { getFeatureArticleById } from "@/lib/db/features";
import { getRestaurantById } from "@/lib/db/restaurants";
import type { Feature } from "@/lib/regions";
import { featureHeroImage } from "@/lib/featureSpotPhotos";
import { isUsableFeatureImage } from "./usableImage";
import type { FeatureCardItem } from "./featureCard";
import { FEATURED_SINGLE_IDS, isDummyFeatureImage } from "./featureSingle";
import { isSceneShopFeature } from "./featureScene";

/**
 * 暖簾の特集記事のトップ（一覧・地域別・特集を探す）のデータ側（サーバー専用）。
 * 元のページ app/feature/page.tsx と同じ並び・同じ絞り込み（THEME_GROUPS・getLatestFeatures・filterByTheme は、そちらと同じ中身。変えるときは両方）。
 */

/** よく出てくる tag を「テーマ」として束ねる（app/feature/page.tsx と同じ） */
export const THEME_GROUPS: { label: string; labelEn: string; tags: string[] }[] = [
  { label: "デート", labelEn: "DATE", tags: ["デート"] },
  // さんぽ = 散歩 = 街歩き（表記ゆれ。RELEASE_REST が true のときだけ足す）
  { label: "観光・街歩き", labelEn: "SIGHTSEEING", tags: ["観光", "街歩き", ...(RELEASE_REST ? ["さんぽ"] : []), "散歩", "散歩・自然", "観光・博物館"] },
  { label: "雨の日", labelEn: "RAINY DAY", tags: ["雨の日"] },
  { label: "夜景・夜遊び", labelEn: "NIGHT", tags: ["夜景"] },
  { label: "カフェ・朝活", labelEn: "CAFE / MORNING", tags: ["カフェ", "カフェ・朝活"] },
  // 子連れ = 家族 = ファミリー（表記ゆれ。RELEASE_REST が true のときだけ足す）
  { label: "家族・子連れ", labelEn: "FAMILY", tags: ["家族", ...(RELEASE_REST ? ["子連れ"] : []), "ファミリー"] },
  { label: "ショッピング", labelEn: "SHOPPING", tags: ["ショッピング"] },
  { label: "アート", labelEn: "ART", tags: ["アート"] },
  // ランチ は食事の特集（scene-lunch-*）。入れる札は「グルメ」だけ（RELEASE_REST が true のときだけ足す）
  { label: "グルメ", labelEn: "GOURMET", tags: ["グルメ", ...(RELEASE_REST ? ["ランチ"] : [])] },
  { label: "時間つぶし", labelEn: "KILL TIME", tags: ["時間つぶし"] },
];

export function countByTheme(group: { tags: string[] }): number {
  const set = new Set(group.tags);
  return FEATURES.filter((f) => set.has(f.tag)).length;
}

export function filterByTheme(themeLabel: string): Feature[] {
  const g = THEME_GROUPS.find((x) => x.label === themeLabel);
  if (!g) return [];
  const set = new Set(g.tags);
  return FEATURES.filter((f) => set.has(f.tag));
}

/** 最新の特集記事を n 本（FEATURE_ARTICLES.date の降順） */
export function getLatestFeatures(n = 3): Feature[] {
  return FEATURES.map((f) => ({ f, date: FEATURE_ARTICLES[f.id]?.date ?? "" }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, n)
    .map((x) => x.f);
}

/**
 * カードの写真。暖簾の特集ページと同じ判定（isUsableFeatureImage = 食べログ・仮の画像・空・表示禁止リストを除く）で、
 * 一覧の写真（Feature.image）が使えなければ、記事の一番上の写真（写真の無い特集に当てた Google マップの写真を含む。featureHeroImage）に替える。
 * どちらも使えなければ空文字（写真なしの布だけのカード）。
 */
export function cardImage(f: Feature): string {
  if (isUsableFeatureImage(f.image)) return f.image;
  const a = FEATURE_ARTICLES[f.id];
  if (a) {
    const h = featureHeroImage(a);
    if (isUsableFeatureImage(h)) return h;
  }
  return "";
}

export function toCardItem(f: Feature): FeatureCardItem {
  return { id: f.id, no: f.no, tag: f.tag, kicker: f.kicker, title: f.title, sub: f.sub, img: cardImage(f) };
}

/**
 * 複数の店・場所が載る記事（lib/data の FEATURES。変更前の「まとめ記事」と同じ集合・同じ並び）を、「シーン別まとめ記事」（scene）と「街歩き・コース」（walk）に分ける。
 * 分け方は記事ページの枠の分け方と同じ（isSceneShopFeature）。2 つを合わせると FEATURES と同じ本数・同じ並びになる（増やさない・減らさない）。
 */
export function getRoundupGroups(): { scene: FeatureCardItem[]; walk: FeatureCardItem[]; total: number } {
  const scene: FeatureCardItem[] = [];
  const walk: FeatureCardItem[] = [];
  for (const f of FEATURES) {
    const a = FEATURE_ARTICLES[f.id];
    (a && isSceneShopFeature(f.id, a) ? scene : walk).push(toCardItem(f));
  }
  return { scene, walk, total: scene.length + walk.length };
}

/** 「特集記事」（店 1 軒の記事）の札 1 枚ぶん */
export type ShopFeatureCardItem = { id: string; img: string; shopName: string; area: string; cuisine: string; title: string };

/**
 * 「特集記事」の棚の札。FEATURED_SINGLE_IDS の本だけを、その順で。
 * 写真は記事ページの入口と同じ主役の写真（補いの表 lib/portal/noren/featureSinglePhotos.ts を通した getFeatureArticleById の heroImage。
 * 使えなければ視点の写真の 1 枚目）。店名・地域・業種は、対の店ページ（ARTICLE_STORE_ID_BY_FEATURE の店のデータ）のものだけ。
 */
/** 一覧の「特集記事」の棚の札。1 本ずつ順に読むと本数ぶん待つ（50 本で 25 秒以上かかった）ので、まとめて同時に読み、結果を 5 分だけ覚えておく（並びは FEATURED_SINGLE_IDS の順のまま） */
let featuredSingleMemo: { at: number; rows: ShopFeatureCardItem[] } | null = null;
export async function getFeaturedSingleCards(): Promise<ShopFeatureCardItem[]> {
  if (featuredSingleMemo && Date.now() - featuredSingleMemo.at < 5 * 60 * 1000) return featuredSingleMemo.rows;
  const usableShot = (u: string | undefined | null) => isUsableFeatureImage(u) && !isDummyFeatureImage(u);
  const rows = await Promise.all(
    FEATURED_SINGLE_IDS.map(async (id): Promise<ShopFeatureCardItem | null> => {
      const sid = ARTICLE_STORE_ID_BY_FEATURE[id];
      const [a, shop] = await Promise.all([getFeatureArticleById(id), sid ? getRestaurantById(sid) : Promise.resolve(null)]);
      if (!a || !shop) return null;
      const img = usableShot(a.heroImage) ? a.heroImage : a.ranking.flatMap((r) => r.images).find(usableShot) ?? "";
      return { id, img, shopName: shop.name, area: shop.area, cuisine: shop.cuisine, title: a.title };
    }),
  );
  const out = rows.filter((x): x is ShopFeatureCardItem => x !== null);
  if (out.length) featuredSingleMemo = { at: Date.now(), rows: out };
  return out;
}
