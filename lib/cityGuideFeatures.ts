import type { Feature, FeatureArticle } from "./data";

// 旧 city guide ガイド記事 (guide-* 50件) はユーザー指示により削除済。
// すべて noindex で、ホームページ・特集一覧から到達できなかった。
export const CITY_GUIDE_FEATURES: Feature[] = [];
export const CITY_GUIDE_FEATURE_ARTICLES: Record<string, FeatureArticle> = {};
