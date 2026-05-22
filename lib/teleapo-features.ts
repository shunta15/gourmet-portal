/**
 * teleapo-features.ts
 *
 * テレアポ経由で P列=詰めOK になった店舗の特集記事を格納する。
 * 自動生成エージェントが追記していく。手動編集不要。
 *
 * 公開設定: noindex（FEATURE_ARTICLES のみ。FEATURES には載せない）
 * URL: /feature/{id}
 */
import type { FeatureArticle } from "./data";

export const TELEAPO_FEATURE_ARTICLES: Record<string, FeatureArticle> = {
  // ↓ エージェントが自動追記 ↓
};
