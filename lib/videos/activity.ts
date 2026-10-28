/**
 * アクティビティの動画 6 本（店の写真から作った短い動画。横長 1280x720）。
 * 元データは lib/videos/activity.json の 1 か所だけ。/videos（lib/videos/index.ts）も、
 * /activity の「動画でみる」欄（components/portal/activity/editorial.ts の loadVideos）も、ここ経由で同じファイルを読む（二重管理にしない）。
 *
 * activity.json の形:
 *  [{ id, storeId, title, durationSec, src, poster, uploadDate }]
 *  - durationSec: ffprobe で実測した長さ（秒）。2026-10-24 実測（22.0 / 24.08 / 22.0 / 22.0 / 21.0 / 19.0）
 *  - src / poster: public/_portal/activity/videos/{id}.mp4 / .webp
 *  - uploadDate: 本番に初めて出た日。追加コミット（2d631ade・2026-10-23 19:15 JST・main）と、本番への反映が 2026-10-23 であることで確認した日付。
 *    新しい動画を足すときは、その動画が本番に出た日だけを入れる（分からないときは入れない）
 * サーバー専用（lib/videos/index.ts と同じ。クライアントコンポーネントから import しない）。
 */
import raw from "./activity.json";
import { HELD_PLACE_IDS } from "@/lib/places/newVerticals";
import type { Video } from "./types";

export type ActivityVideoRow = {
  id: string;
  storeId: string;
  title: string;
  durationSec: number;
  src: string;
  poster: string;
  uploadDate?: string;
};

const PREFIX = "/_portal/activity/videos/";
const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

let memo: ActivityVideoRow[] | null = null;

/** 検証を通った行だけ（保留の店は出さない）。JSON の並び順がそのまま表示順 */
export function activityVideoRows(): ActivityVideoRow[] {
  if (memo) return memo;
  const out: ActivityVideoRow[] = [];
  for (const x of raw as unknown as Array<Record<string, unknown>>) {
    const id = str(x?.id);
    const storeId = str(x?.storeId);
    const src = str(x?.src);
    const poster = str(x?.poster);
    const sec = Number(x?.durationSec);
    const date = str(x?.uploadDate);
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(id) || !storeId || HELD_PLACE_IDS.includes(storeId)) continue;
    if (!src.startsWith(PREFIX) || !poster.startsWith(PREFIX) || !(sec > 0)) continue;
    out.push({
      id,
      storeId,
      title: str(x.title),
      durationSec: sec,
      src,
      poster,
      ...(date && !Number.isNaN(Date.parse(date)) ? { uploadDate: date } : {}),
    });
  }
  memo = out;
  return out;
}

/** /videos 用の Video（店に紐づく・横長・動画ファイル） */
export function getActivityVideos(): Video[] {
  return activityVideoRows().map((r) => ({
    id: r.id,
    source: "file" as const,
    src: r.src,
    thumbnail: r.poster,
    title: r.title,
    storeIds: [r.storeId],
    vertical: false,
    ...(r.uploadDate ? { uploadDate: r.uploadDate } : {}),
    duration: r.durationSec,
  }));
}
