/**
 * シーン特集記事（lib/sceneFeatures.ts）への導線用の取り出し。
 * シーンページ・地域ハブ・街ページが「該当するシーン特集」の枠を出すのに使う（記事が無ければ空配列 → 枠は出ない）。
 * 返すのはクライアントへ渡せる軽いカード情報だけ（記事本文は含めない）。
 */
import { SCENES } from "./scenes";
import { SCENE_FEATURES, SCENE_FEATURE_META } from "./sceneFeatures";

export type SceneFeatureCard = {
  id: string;
  title: string;
  kicker: string;
  image: string;
  sceneName: string;
  areaLabel: string;
  href: string;
};

const sceneName = (slug: string) => SCENES.find((s) => s.slug === slug)?.name ?? slug;

function toCard(id: string): SceneFeatureCard | null {
  const f = SCENE_FEATURES.find((x) => x.id === id);
  const m = SCENE_FEATURE_META[id];
  if (!f || !m) return null;
  return {
    id,
    title: f.title,
    kicker: f.kicker,
    image: f.image,
    sceneName: sceneName(m.scene),
    areaLabel: m.areaLabel,
    href: `/feature/${encodeURIComponent(id)}`,
  };
}

function pick(filter: (m: (typeof SCENE_FEATURE_META)[string]) => boolean): SceneFeatureCard[] {
  return Object.keys(SCENE_FEATURE_META)
    .filter((id) => filter(SCENE_FEATURE_META[id]))
    .map(toCard)
    .filter((c): c is SceneFeatureCard => !!c);
}

/** シーンページ用: このシーンの特集（全地域・全街） */
export const sceneFeaturesForScene = (slug: string) => pick((m) => m.scene === slug);

/** 街ページ用: この街のシーン特集 */
export const sceneFeaturesForTown = (region: string, town: string) =>
  pick((m) => m.area === `${region}/${town}`);

/** 地域ハブ用: この地域の特集（地域単位と、地域内の街の特集） */
export const sceneFeaturesForRegion = (region: string) =>
  pick((m) => m.area === region || m.area.startsWith(`${region}/`));

/** シーン特集の記事 ID か（地域ハブの汎用「特集記事」枠から重複を外すのに使う） */
export const isSceneFeatureId = (id: string) => id in SCENE_FEATURE_META;
