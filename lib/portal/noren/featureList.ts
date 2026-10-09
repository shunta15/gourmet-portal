import "server-only";
import { FEATURES, FEATURE_ARTICLES } from "@/lib/data";
import type { Feature } from "@/lib/regions";
import { featureHeroImage } from "@/lib/featureSpotPhotos";
import { isUsableFeatureImage } from "./usableImage";
import type { FeatureCardItem } from "./featureCard";

/**
 * 暖簾の特集記事のトップ（一覧・地域別・特集を探す）のデータ側（サーバー専用）。
 * 元のページ app/feature/page.tsx と同じ並び・同じ絞り込み（THEME_GROUPS・getLatestFeatures・filterByTheme は、そちらと同じ中身。変えるときは両方）。
 */

/** よく出てくる tag を「テーマ」として束ねる（app/feature/page.tsx と同じ） */
export const THEME_GROUPS: { label: string; labelEn: string; tags: string[] }[] = [
  { label: "デート", labelEn: "DATE", tags: ["デート"] },
  { label: "観光・街歩き", labelEn: "SIGHTSEEING", tags: ["観光", "街歩き", "散歩", "散歩・自然", "観光・博物館"] },
  { label: "雨の日", labelEn: "RAINY DAY", tags: ["雨の日"] },
  { label: "夜景・夜遊び", labelEn: "NIGHT", tags: ["夜景"] },
  { label: "カフェ・朝活", labelEn: "CAFE / MORNING", tags: ["カフェ", "カフェ・朝活"] },
  { label: "家族・子連れ", labelEn: "FAMILY", tags: ["家族", "ファミリー"] },
  { label: "ショッピング", labelEn: "SHOPPING", tags: ["ショッピング"] },
  { label: "アート", labelEn: "ART", tags: ["アート"] },
  { label: "グルメ", labelEn: "GOURMET", tags: ["グルメ"] },
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
