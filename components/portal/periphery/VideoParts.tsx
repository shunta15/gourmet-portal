/**
 * 周りのページの動画の部品（サーバー）。動画の一覧 /videos・動画のページ /videos/<id> で使う。
 * 再生の仕組み（VideoFacade: サムネイル → タップで TikTok の埋め込み／動画ファイル）は今のまま。ここは札の見た目（.pp-*）だけ。
 * 動画・店・リンク先・表示の字は、今のページ（VideoCard・VideoTiles）と同じ。
 */
import Link from "next/link";
import type { Video } from "@/lib/videos/types";
import type { VideoStore } from "@/lib/videos/stores";
import { displayTitle, formatDuration, videoHref } from "@/lib/videos/display";
import VideoFacade from "@/components/portal/video/VideoFacade";
import { toFacade } from "@/components/portal/video/facade";
import { videoTone } from "@/components/portal/video/VideoCard";

/** 動画 1 本の札（動画の一覧）。写真（サムネイル）が主役で、題・店・最寄りの駅が下に付く */
export function VideoCardP({ video, stores, eager = false }: { video: Video; stores: VideoStore[]; eager?: boolean }) {
  const tone = videoTone(video, stores);
  const title = displayTitle(video);
  return (
    <article className="pp-vcard">
      <VideoFacade video={toFacade(video)} eager={eager} />
      <div className="pp-vmeta">
        {tone.label && <small className="pp-vtag">{tone.label}</small>}
        <h3 className="pp-vtitle">
          <Link href={videoHref(video)} prefetch={false} data-cursor="WATCH">
            {title}
          </Link>
        </h3>
        {stores.map((s) => (
          <p className="pp-vstore" key={s.id}>
            <Link href={s.href} prefetch={false} className="nm" data-cursor="SHOP">
              {s.name}
            </Link>
            <span className="sub">{[s.categoryName, s.prefShort, s.area].filter(Boolean).join("・")}</span>
            {/* 駅のページ（/station）は総合サイトの前の見た目のページなので、リンクにしない（駅名だけ出す） */}
            {s.station && <span className="st">最寄り: {s.station.heading}</span>}
          </p>
        ))}
      </div>
    </article>
  );
}

/** 動画のサムネイルの一覧（動画のページの「他の動画」）。タップで視聴ページへ（ここでは再生しない） */
export function VideoTilesP({ videos }: { videos: Video[] }) {
  return (
    <ul className="pp-tiles">
      {videos.map((v) => {
        const du = formatDuration(v.duration);
        return (
          <li key={v.id}>
            <Link href={videoHref(v)} prefetch={false} className="pp-tile" data-cursor="WATCH">
              <span className="pp-tile__img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.thumbnail}
                  alt=""
                  width={v.vertical ? 360 : 640}
                  height={v.vertical ? 640 : 360}
                  loading="lazy"
                  decoding="async"
                />
                <span className="pp-tile__ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                  </svg>
                </span>
                {du && <span className="pp-tile__du">{du}</span>}
              </span>
              <b>{displayTitle(v)}</b>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
