import "server-only";
import { getPlaces } from "@/lib/places";
import { getGeneratedFeatures } from "@/lib/places/features";
import { vkLinks, type VkConfig } from "../config";
import { hasArticleBody } from "../shop/data";

/**
 * 店の記事のページ(/{業種}/article/{id})がある店の ID と、サイトマップに載せる URL。CSS・画面の部品を import しない(サイトマップ・事前生成から使うため)。
 * 記事のページがある店 = 店のデータの紹介記事に点検を通る文がある店(hasArticleBody)か、店の特集記事(features-{業種}.json)がある店。
 * 店の紹介ページの「紹介記事」リンク・記事ページの事前生成・サイトマップは、どれもこの条件にそろえる(route.tsx / shop/data.ts)。
 */
export async function articleIds(cfg: VkConfig): Promise<string[]> {
  const [places, feats] = await Promise.all([getPlaces(cfg.key), getGeneratedFeatures(cfg.key)]);
  const withFeature = new Set(feats.map((f) => f.placeId).filter((x): x is string => !!x));
  return places.filter((p) => hasArticleBody(p) || withFeature.has(p.id)).map((p) => p.id);
}

/** サイトマップに足す記事ページのパス(ID は vkLinks の article() でエンコード) */
export async function articleSitemapPaths(cfg: VkConfig): Promise<string[]> {
  return (await articleIds(cfg)).map((id) => vkLinks(cfg).article(id));
}
