/**
 * 動画ファイル（サイトに置いた mp4）→ Video のアダプタ。
 * 元データは lib/regions.ts の SHORT_VIDEOS（グルメのトップ・店ページの動画カルーセル用。そちらは変えない）。
 * SHORT_VIDEOS の likes / comments / saves と duration（"0:30" 固定）は実際の値ではないので引き継がない。
 * uploadDate は分からないので入れない（→ 視聴ページは noindex・VideoObject なし）。
 */
import { SHORT_VIDEOS } from "@/lib/regions";
import type { Video } from "./types";

/**
 * 動画ファイルの長さ（秒）。2026-10-04 に ffprobe で実測した値。
 * 新しいファイルを SHORT_VIDEOS に足したら、ここにも実測値を足す（無ければ長さは表示しない）。
 */
const MEASURED_DURATION: Record<string, number> = {
  "/videos/nazatu/1-1.mp4": 34.2,
  "/videos/nazatu/1-2.mp4": 38.1,
  "/videos/nazatu/3-2.mp4": 82.8,
  "/videos/nazatu/photo.mp4": 15.9,
  "/videos/nazatu/review.mp4": 35.0,
};

export function getFileVideos(): Video[] {
  return SHORT_VIDEOS.filter((s) => !!s.videoUrl).map((s) => {
    const src = s.videoUrl as string;
    const duration = MEASURED_DURATION[src];
    return {
      id: s.id,
      source: "file" as const,
      src,
      thumbnail: s.thumbnail,
      title: s.title,
      storeIds: s.restaurantId ? [s.restaurantId] : [],
      vertical: true,
      // SHORT_VIDEOS はグルメのサイトの動画（業態ラベルが付いている）。店に紐づかないので業種だけ持たせる
      industry: "gourmet" as const,
      ...(duration ? { duration } : {}),
    };
  });
}
