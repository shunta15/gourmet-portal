/**
 * 動画のサムネイル一覧（サーバー）。タップで視聴ページへ。駅ページ・県ページ・総合トップ・視聴ページの関連動画で使う。
 * ここでは再生しない（重いプレーヤーを読み込まない）。eager は横に流す入口（総合トップ）用で、画面外のサムネイルも先に読む。
 */
import Link from "next/link";
import type { Video } from "@/lib/videos/types";
import { displayTitle, formatDuration, videoHref } from "@/lib/videos/display";

export default function VideoTiles({ videos, className = "", eager = false }: { videos: Video[]; className?: string; eager?: boolean }) {
  return (
    <ul className={`mp-vd-tiles ${className}`.trim()}>
      {videos.map((v) => {
        const du = formatDuration(v.duration);
        return (
          <li key={v.id}>
            <Link href={videoHref(v)} prefetch={false} className="mp-vd-tile" data-cursor="WATCH">
              <span className="img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.thumbnail}
                  alt=""
                  width={v.vertical ? 360 : 640}
                  height={v.vertical ? 640 : 360}
                  loading={eager ? "eager" : "lazy"}
                  decoding="async"
                />
                <span className="ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                  </svg>
                </span>
                {du && <span className="du">{du}</span>}
              </span>
              <b>{displayTitle(v)}</b>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
