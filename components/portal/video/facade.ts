import type { Video } from "@/lib/videos/types";
import { displayTitle, formatDuration } from "@/lib/videos/display";
import type { FacadeVideo } from "./VideoFacade";

/** サーバーで Video → 再生部品の props に直す */
export function toFacade(v: Video): FacadeVideo {
  return {
    id: v.id,
    source: v.source,
    tiktokId: v.tiktokId,
    src: v.src,
    thumbnail: v.thumbnail,
    title: displayTitle(v),
    vertical: v.vertical,
    durationLabel: formatDuration(v.duration),
  };
}
