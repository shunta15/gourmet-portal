import { getFeatureArticleById } from "@/lib/db/features";
import { isBlockedImage } from "@/lib/imageBlocklist";
import { sized } from "@/lib/imageUrl";
import { CARD_FEATURE } from "./const";

/** 「読みもの」カードの写真(リンク先の記事の一番上の写真)。取れなかったカードは入らない(= 今までの画像のまま) */
export type CardPhotos = Partial<Record<keyof typeof CARD_FEATURE, string>>;

/**
 * サーバー側専用(DB を読むので client component から import しない)。
 * 記事ページ(app/feature/[id]/page.tsx)と同じ getFeatureArticleById の heroImage を使う
 * = Supabase の DB に行があれば DB の hero_image、無ければコード(data.ts)の heroImage。表示禁止・差し替えも記事ページと同じ結果。
 * 読むだけ(SELECT)で、書き込みはしない。写真は表示幅に合わせた縮小版(sized 720)にする。
 * 表示禁止の差し替え画像(_placeholder)になる記事は入れない(今までの画像に戻す)。
 */
export async function cardPhotos(): Promise<CardPhotos> {
  const out: CardPhotos = {};
  await Promise.all(
    (Object.keys(CARD_FEATURE) as (keyof typeof CARD_FEATURE)[]).map(async (k) => {
      try {
        const hero = (await getFeatureArticleById(CARD_FEATURE[k]))?.heroImage;
        if (!hero || hero.includes("/_placeholder/") || isBlockedImage(hero)) return;
        const url = sized(hero, 720);
        if (!url.includes("/_placeholder/")) out[k] = url;
      } catch {
        // 取れなければ入れない(今までの画像)
      }
    }),
  );
  return out;
}
