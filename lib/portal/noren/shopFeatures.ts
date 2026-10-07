/**
 * この店が載っている特集記事を探す（サーバー専用。lib/data を読むのでクライアントから import しない）。
 * 店ページには今も「対になる特集記事」（featureId）への行き先があるが、利用シーン別の特集（lib/sceneFeatures.ts）の
 * ように、店を並べる型の記事に載っている店は featureId を持たない。記事の店ブロックが /restaurant/<店ID> へ
 * 向いている記事を、コード側の記事から探して「関連記事」として出す。
 */
import { FEATURE_ARTICLES } from "@/lib/data";
import { getFeatureArticleById } from "@/lib/db/features";
import { isBlockedImage } from "@/lib/imageBlocklist";
import { isUnusableImage } from "./shop";

export type RelatedFeature = { id: string; title: string; sub: string; image: string; kicker: string; paired: boolean };

export async function featuresOfShop(shopId: string, pairedId?: string, limit = 3): Promise<RelatedFeature[]> {
  const re = new RegExp(`^/restaurant/${shopId}(?:[/?#]|$)`);
  const ids: string[] = [];
  if (pairedId) ids.push(pairedId);
  for (const [id, a] of Object.entries(FEATURE_ARTICLES)) {
    if (id === pairedId) continue;
    if (a.ranking.some((x) => x.href && re.test(x.href))) ids.push(id);
  }
  const out: RelatedFeature[] = [];
  for (const id of ids.slice(0, limit)) {
    const a = await getFeatureArticleById(id);
    if (!a) continue;
    const img = !isUnusableImage(a.heroImage) && !isBlockedImage(a.heroImage) ? a.heroImage : "";
    out.push({ id: a.id, title: a.title, sub: a.subtitle, image: img, kicker: a.kicker, paired: id === pairedId });
  }
  return out;
}
