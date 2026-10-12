import "server-only";
/**
 * 「さがす」で利用シーンを選んだとき、結果の上に出す「シーン別のまとめ記事」（利用シーン+複数の店の記事）の札を、シーンごとに作る（サーバー専用）。
 *
 * 材料と照合（すべて記事のデータの項目の完全一致。題や本文の字の部分一致は使わない）:
 *  - 記事の集合: lib/data の FEATURES（特集の一覧と同じ集合・同じ並び）のうち、isSceneShopFeature(id, 記事) が true のもの
 *  - シーン: lib/sceneFeatures.ts の SCENE_FEATURE_META[id].scene（lib/scenes.ts の SCENES[].slug と同じ綴り）が、そのシーンのスラッグと等しい
 *  - 地域: SCENE_FEATURE_META[id].area（"<region>" または "<region>/<街>"）。並べ替えは lib/portal/noren/sceneRoundupOrder.ts
 * 記事の URL は、今の記事の URL を作る関数（nav.ts の LIVE_LINKS.feature）の結果。星・点数・口コミ件数は持たない。
 * 非表示の店 1 軒だけの記事（lib/hiddenStores.ts）は、この集合に入らない（FEATURES に無い）。
 * クライアントへは、札の最小限の項目（SceneRoundupCard）だけを、全シーンぶん（24 本ほど）まとめて渡す（ページは静的のまま。どれを出すかは URL を読むクライアントが決める）。
 */
import { FEATURES, FEATURE_ARTICLES } from "@/lib/data";
import { SCENES } from "@/lib/scenes";
import { SCENE_FEATURE_META } from "@/lib/sceneFeatures";
import { isHiddenFeature } from "@/lib/hiddenStores";
import { isSceneShopFeature } from "./featureScene";
import { cardImage } from "./featureList";
import { LIVE_LINKS } from "./nav";
import type { SceneRoundupCard } from "./sceneRoundupOrder";

export function getSceneRoundups(): Record<string, SceneRoundupCard[]> {
  const out: Record<string, SceneRoundupCard[]> = {};
  const slugs = new Set(SCENES.map((s) => s.slug));
  for (const f of FEATURES) {
    const meta = SCENE_FEATURE_META[f.id];
    const a = FEATURE_ARTICLES[f.id];
    if (!meta || !a || isHiddenFeature(f.id) || !isSceneShopFeature(f.id, a) || !slugs.has(meta.scene)) continue;
    (out[meta.scene] ??= []).push({
      id: f.id,
      title: f.title,
      img: cardImage(f),
      areaLabel: meta.areaLabel,
      area: meta.area,
      href: LIVE_LINKS.feature(f.id),
    });
  }
  return out;
}
