// 自動生成: node automation/scene-articles/emit.mjs（手で編集しない。再実行で上書きされる）
// 材料: automation/scene-articles/out/<記事ID>.json（ライターが書く）＋ lib/data.ts の店データ
// 利用シーン別の特集記事。lib/data.ts の FEATURES / FEATURE_ARTICLES / FEATURE_INDEXABLE_IDS に合流する。
import type { Feature, FeatureArticle } from "./regions";

/** 記事ごとの付帯情報: どのシーン（lib/scenes.ts の slug）×どの地域/街の記事か、載せた店 */
export type SceneFeatureMeta = {
  scene: string;
  /** "<region>"（地域）または "<region>/<街>"（街）。lib/townIntros.ts の鍵と同じ形 */
  area: string;
  areaLabel: string;
  storeIds: string[];
  tags?: string[];
};

export const SCENE_FEATURES: Feature[] = [];

export const SCENE_FEATURE_ARTICLES: Record<string, FeatureArticle> = {};

export const SCENE_FEATURE_META: Record<string, SceneFeatureMeta> = {};
