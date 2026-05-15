import type { Feature, FeatureArticle } from "./data";

// 旧 curated (G01-G05 / S01-S10 / course-*) 全件 noindex 記事は
// ユーザー指示により削除済。
export const CURATED_FEATURES: Feature[] = [];
export const CURATED_FEATURE_ARTICLES: Record<string, FeatureArticle> = {};
