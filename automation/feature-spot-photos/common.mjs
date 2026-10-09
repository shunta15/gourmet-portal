// build.mjs / report.mjs の共通部分: lib/*.ts を読む準備と、「写真の無いポイント」の数え方(1 か所)。
//   実行は `node --no-warnings --experimental-strip-types automation/feature-spot-photos/<スクリプト>.mjs`
//   (Node 22.6 以降。22.18 以降は --experimental-strip-types なしでも動く。lib/data.ts を読むので、起動に 1 秒ほどかかる)
import { register } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
/** 呼んだ場所(--records などの相対パスの基準)。このあとリポジトリの直下に移る(lib/featureSpotPhotos.ts が process.cwd() からファイルを読むため) */
export const CALLER_CWD = process.cwd();
process.chdir(ROOT);
register('./ts-loader.mjs', import.meta.url);

/** コード側のデータと、本番と同じ判定の関数。lib/data.ts を読む(DB には触らない) */
export async function loadCode() {
  const data = await import(ROOT + '/lib/data.ts');
  const blocklist = await import(ROOT + '/lib/imageBlocklist.ts');
  const usableMod = await import(ROOT + '/lib/portal/noren/usableImage.ts'); // FeaturePage.tsx・当てはめと同じ 1 つの関数
  const spotMod = await import(ROOT + '/lib/featureSpotPhotos.ts'); // 当てはめ(本番の取り出し口が使うもの)
  return {
    FEATURE_ARTICLES: data.FEATURE_ARTICLES,
    FEATURE_INDEXABLE_IDS: data.FEATURE_INDEXABLE_IDS,
    data,
    sanitizeFeatureArticle: blocklist.sanitizeFeatureArticle,
    usable: usableMod.isUsableFeatureImage,
    applyFeatureSpotPhotos: spotMod.applyFeatureSpotPhotos,
    getFeatureSpotPhotos: spotMod.getFeatureSpotPhotos,
  };
}

/**
 * 写真の無いポイントの番号(spotNo = ranking の何番めか。1 始まり = ranking[i] の i + 1)と、一番上の写真が使えないか。
 * 数え方は inventory.mjs と同じ: コードの FEATURE_ARTICLES に sanitizeFeatureArticle をかけ(lib/db/features.ts の getFeatureArticleById と同じ順)、
 * FeaturePage.tsx の判定(r.images.filter(usable).length === 0 / !usable(heroImage))。当てはめのあとの記事は使わない。
 */
export function lackOf(article, usable) {
  const spots = [];
  article.ranking.forEach((r, i) => {
    if (!(r.images ?? []).some((u) => usable(u))) spots.push(i + 1);
  });
  return { spots, heroUnusable: !usable(article.heroImage) };
}
