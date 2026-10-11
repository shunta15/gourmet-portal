/**
 * 店 1 軒の特集記事（isSingleShopFeature）の「足りない写真」を、対の店ページ（ARTICLE_STORE_ID_BY_FEATURE で対応が決まっている同じ店）の
 * 写真で補う表。軽いファイル（fs・process は使わない。サーバー専用の import も足さない）。
 *
 * - 当てる写真は、対の店の /restaurants/<店の ID>/ のフォルダか、その店のデータ（image・heroImages・gallery）に載っている写真だけ。
 *   ほかの店の写真・素材写真・生成画像・外から新しく取った写真は入れない。店名の部分一致で店を探さない（記事 ID → 店 ID の表だけ）。
 * - 書き方（記事ごと・視点ごとに、どの写真を当てるかを明示する。自動で順番に当てない）:
 *     "<記事 ID>": { hero?: "<写真のパス>", points?: { "<視点の番号（1 始まり。ranking[i] の i + 1）>": ["<写真のパス>", …] } }
 *   hero を書くと、その記事の主役の写真（heroImage）をその写真に替える。
 *   points の番号を書くと、その視点の写真（images）を、書いた並びの写真だけに替える（元の写真は残さない。
 *   元の写真が主役と同じ絵で「同じ写真が 2 度出る」視点は、ここで別の写真に替える）。書かなかった視点・記事は今までどおり。
 * - 当てる所: lib/db/features.ts の getFeatureArticleById（DB から読んだ記事にも、コード側の記事にも、同じ記事 ID で効く）。
 * - 元に戻すなら、この表の中身を {} にする。
 */
import type { FeatureArticle } from "@/lib/regions";

export type FeatureSinglePhotoEntry = {
  /** 主役の写真（公開パス）。書いたときだけ heroImage を替える */
  hero?: string;
  /** 視点の番号（ranking の何番めか。1 始まり。文字列）→ その視点の写真の並び（元の写真と入れ替える） */
  points?: Record<string, string[]>;
};
export type FeatureSinglePhotos = Record<string, FeatureSinglePhotoEntry>;

export const FEATURE_SINGLE_PHOTOS: FeatureSinglePhotos = {
  // GOGUMI.（r405 の店）: 視点 1（看板コーヒー）の写真が主役と同じ絵（hero.jpg）だった。同じ店の point1.jpg（抹茶のドリンク）に替える。
  //   ※ 本文はコーヒーの話で、写真は抹茶のドリンク（同じ店の飲み物。直接は合わない）。
  "GOGUMI.": {
    points: { "1": ["/restaurants/teleapo-GOGUMI./point1.jpg"] },
  },
  // 赤れんが（r477 の店）: 視点 1（手ごねハンバーグのこだわり）は、本文と合う看板の写真（hero.jpg）を持つが、主役も同じ写真だった。
  //   主役を、同じ店の point2.jpg（入口まわり・店内）に替え、視点 1 はそのまま看板の写真にする（視点の本文と写真は合ったまま）。
  "赤れんが": {
    hero: "/restaurants/teleapo-赤れんが/point2.jpg",
  },
};

const has = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);
const isPath = (v: unknown): v is string => typeof v === "string" && v.startsWith("/");

/**
 * 記事に、表の写真を当てて返す（元の記事は変えない。表に無い記事・当てるものが無い記事は、同じオブジェクトをそのまま返す）。
 * 形が想定と違うものは、何も当てない。
 */
export function applyFeatureSinglePhotos<A extends FeatureArticle>(article: A, table: FeatureSinglePhotos = FEATURE_SINGLE_PHOTOS): A {
  if (!article || !has(table, article.id)) return article;
  const entry = table[article.id];
  if (!entry || typeof entry !== "object") return article;
  let out: A = article;
  if (isPath(entry.hero)) out = { ...out, heroImage: entry.hero };
  const points = entry.points;
  if (points && typeof points === "object" && Array.isArray(article.ranking)) {
    let ranking: typeof article.ranking | null = null;
    for (let i = 0; i < article.ranking.length; i++) {
      const key = String(i + 1);
      const list = has(points, key) ? points[key] : undefined;
      if (!Array.isArray(list)) continue;
      const imgs = list.filter(isPath);
      if (imgs.length === 0) continue;
      if (!ranking) ranking = article.ranking.slice();
      ranking[i] = { ...article.ranking[i], images: imgs };
    }
    if (ranking) out = { ...out, ranking };
  }
  return out;
}
