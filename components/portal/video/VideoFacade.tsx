"use client";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";

/** 再生部品に渡す最小限の値（サーバーから props で渡す。lib/videos は読まない） */
export interface FacadeVideo {
  id: string;
  source: "tiktok" | "file";
  tiktokId?: string;
  src?: string;
  thumbnail: string;
  title: string;
  vertical: boolean;
  /** "0:34" のような長さ（実測できたものだけ） */
  durationLabel?: string | null;
}

/**
 * 動画のファサード。最初はサムネイルと再生ボタンだけで、重いプレーヤーは読み込まない。
 * タップすると TikTok は埋め込みプレーヤー（iframe）、動画ファイルは <video>（preload="none"）に差し替える。
 * 動画ファイルの再生は、タップの操作の中で play() を呼ぶ（スマホのブラウザは操作の外では再生させない）。
 * 失敗したときはコントロールを残すので、利用者がそのまま再生できる。
 */
export default function VideoFacade({ video, eager = false }: { video: FacadeVideo; eager?: boolean }) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const w = video.vertical ? 360 : 640;
  const h = video.vertical ? 640 : 360;

  const start = () => {
    flushSync(() => setActive(true));
    const el = ref.current;
    if (el) el.play().catch(() => {});
  };

  return (
    <div className={`mp-vd-media ${video.vertical ? "v" : "h"}`} data-active={active ? "true" : undefined}>
      {!active ? (
        <button type="button" className="mp-vd-play" onClick={start} aria-label={`「${video.title}」を再生`} data-cursor="PLAY">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnail}
            alt=""
            width={w}
            height={h}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            {...(eager ? { fetchPriority: "high" as const } : {})}
          />
          <span className="ic" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26">
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
            </svg>
          </span>
          {video.durationLabel && <span className="du">{video.durationLabel}</span>}
        </button>
      ) : video.source === "tiktok" && video.tiktokId ? (
        <iframe
          src={`https://www.tiktok.com/player/v1/${video.tiktokId}?autoplay=1&rel=0`}
          title={video.title}
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <video ref={ref} src={video.src} controls playsInline preload="none" poster={video.thumbnail} />
      )}
    </div>
  );
}
