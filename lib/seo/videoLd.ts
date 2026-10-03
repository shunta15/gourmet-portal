/**
 * 視聴ページの VideoObject（JSON-LD）。投稿日（uploadDate）が分かる動画だけに出す。
 * 再生数・いいねなどの数字は入れない。embedUrl（TikTok）または contentUrl（動画ファイル）のどちらかを必ず付ける。
 */
import type { Video } from "@/lib/videos/types";
import { isoDuration, isVideoIndexable, tiktokPlayerUrl } from "@/lib/videos/display";
import { absUrl } from "./util";

export function videoObject(v: Video, p: { name: string; description: string }): Record<string, unknown> | null {
  if (!isVideoIndexable(v) || !v.uploadDate) return null;
  const embedUrl = v.source === "tiktok" && v.tiktokId ? tiktokPlayerUrl(v.tiktokId) : undefined;
  const contentUrl = v.source === "file" && v.src ? absUrl(v.src) : undefined;
  if (!embedUrl && !contentUrl) return null;
  const dur = isoDuration(v.duration);
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: p.name,
    description: p.description,
    thumbnailUrl: [absUrl(v.thumbnail)],
    uploadDate: v.uploadDate,
    ...(embedUrl ? { embedUrl } : {}),
    ...(contentUrl ? { contentUrl } : {}),
    ...(dur ? { duration: dur } : {}),
  };
}
