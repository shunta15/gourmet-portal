import type { MetadataRoute } from "next";
import { isIndexable } from "@/lib/seo/gate";
import { SITE_URL, absUrl } from "@/lib/seo/util";
import { assertPortalLive } from "@/lib/portal/launch";
import { getAllVideos } from "@/lib/videos";
import { getVideoStores } from "@/lib/videos/stores";
import { displayTitle, isVideoIndexable, tiktokPlayerUrl, videoDescription } from "@/lib/videos/display";

export const revalidate = 3600;

/**
 * /videos/sitemap.xml。index 対象の視聴ページだけ（投稿日が分かる動画＝VideoObject を出せる動画）と、
 * それをまとめる /videos（index 対象の動画が 3 本以上のとき）。動画の情報（sitemap の videos 項目）も付ける。
 * 今は投稿日が分かる動画が無いので空。既存の /sitemap.xml は変えない。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  assertPortalLive(); // 公開スイッチ OFF のあいだは 404（lib/portal/launch.ts）
  const videos = getAllVideos().filter(isVideoIndexable);
  const out: MetadataRoute.Sitemap = [];
  if (isIndexable(videos.length)) out.push({ url: `${SITE_URL}/videos` });
  const stores = await getVideoStores(videos.flatMap((v) => v.storeIds));
  for (const v of videos) {
    const store = stores.get(v.storeIds[0] ?? "");
    out.push({
      url: `${SITE_URL}/videos/${v.id}`,
      videos: [
        {
          title: displayTitle(v),
          thumbnail_loc: absUrl(v.thumbnail),
          description: videoDescription(v, store?.name),
          publication_date: v.uploadDate,
          ...(v.source === "tiktok" && v.tiktokId ? { player_loc: tiktokPlayerUrl(v.tiktokId) } : {}),
          ...(v.source === "file" && v.src ? { content_loc: absUrl(v.src) } : {}),
          ...(v.duration ? { duration: Math.round(v.duration) } : {}),
        },
      ],
    });
  }
  return out;
}
