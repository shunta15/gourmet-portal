"use client";
import { useState } from "react";
import { SHORT_VIDEOS, type ShortVideo } from "@/lib/data";

function VideoPlayer({
  video,
  onClose,
}: {
  video: ShortVideo;
  onClose: () => void;
}) {
  return (
    <div
      className="video-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="video-close"
        onClick={onClose}
        aria-label="閉じる"
      >
        ×
      </button>
      <div className="video-frame" onClick={(e) => e.stopPropagation()}>
        {video.videoUrl ? (
          /\.(mp4|webm|mov)(\?|$)/i.test(video.videoUrl) ? (
            <video
              src={video.videoUrl}
              controls
              autoPlay
              playsInline
              poster={video.thumbnail}
            />
          ) : (
            <iframe
              src={video.videoUrl}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title={video.title}
            />
          )
        ) : (
          <div className="video-fallback">
            <div
              className="thumb"
              style={{ backgroundImage: `url(${video.thumbnail})` }}
            />
            <div className="msg">動画は準備中です</div>
          </div>
        )}
        <div className="video-meta">
          <div className="title">{video.title}</div>
          <div className="stats">
            <span>♥ {video.likes}</span>
            <span>💬 {video.comments}</span>
            <span>🔖 {video.saves}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RestaurantShortVideos({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const [active, setActive] = useState<ShortVideo | null>(null);
  const videos = SHORT_VIDEOS.filter((v) => v.restaurantId === restaurantId);

  return (
    <section className="article">
      <div className="article-head reveal">
        <div className="label">
          動画
          <span className="big">{videos.length || "—"}</span>
        </div>
        <div>
          <h2>
            ショート、<em>動画。</em>
          </h2>
          <p className="sub">
            編集部撮り下ろしのショート動画。タップで再生できます。
          </p>
        </div>
      </div>

      <div className="restaurant-shorts">
        {videos.length > 0 ? (
          videos.map((v) => (
            <button
              key={v.id}
              type="button"
              className="short-card"
              onClick={() => setActive(v)}
              data-cursor="WATCH"
            >
              <div
                className="thumb"
                style={{ backgroundImage: `url(${v.thumbnail})` }}
              />
              <div className="play-btn" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M7 4.5v13l11-6.5L7 4.5z" fill="currentColor" />
                </svg>
              </div>
              <div className="cuisine-tag">
                <span className="emoji">{v.cuisineEmoji}</span>
                {v.cuisineLabel}
              </div>
              <div className="duration">{v.duration}</div>
              <div className="overlay">
                <div className="title">{v.title}</div>
                <div className="stats">
                  <span>♥ {v.likes}</span>
                  <span>💬 {v.comments}</span>
                  <span>🔖 {v.saves}</span>
                </div>
              </div>
            </button>
          ))
        ) : (
          <>
            {[0, 1, 2].map((i) => (
              <div key={i} className="short-card placeholder">
                <div className="thumb-placeholder" />
                <div className="placeholder-label">撮影予定</div>
                <div className="overlay">
                  <div className="title">編集部 撮り下ろし</div>
                  <div className="store">この店舗の動画 準備中</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {active && <VideoPlayer video={active} onClose={() => setActive(null)} />}
    </section>
  );
}
