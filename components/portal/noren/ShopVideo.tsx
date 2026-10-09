"use client";
import { useEffect, useRef, useState } from "react";
import { sized } from "@/lib/imageUrl";
import type { ShortVideo } from "@/lib/regions";

/** 「ショート、動画。」今の店ページと同じ中身（動画があればカード、無ければ「撮影予定」の札） */
export default function ShopVideo({ video }: { video: ShortVideo | null }) {
  const [active, setActive] = useState(false);
  const from = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActive(false);
        from.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  if (!video) {
    return (
      <div className="vS-vcard is-empty" role="img" aria-label="撮影予定。編集部 撮り下ろし。この店舗の動画 準備中">
        <span className="vN-seal" aria-hidden="true">輪</span>
        <span className="lb" aria-hidden="true">撮影予定</span>
        <div className="ov" aria-hidden="true">
          <b>編集部 撮り下ろし</b>
          <span>この店舗の動画 準備中</span>
        </div>
      </div>
    );
  }
  return (
    <>
      <button
        type="button"
        className="vS-vcard"
        onClick={(e) => {
          from.current = e.currentTarget;
          setActive(true);
        }}
        data-cursor="WATCH"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sized(video.thumbnail, 640)} alt={video.title} loading="lazy" decoding="async" />
        <span className="play" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 22 22" fill="none"><path d="M7 4.5v13l11-6.5L7 4.5z" fill="currentColor" /></svg>
        </span>
        <span className="tag">{video.cuisineEmoji} {video.cuisineLabel}</span>
        <span className="dur">{video.duration}</span>
        <span className="ov">
          <b>{video.title}</b>
          <span>♥ {video.likes}　💬 {video.comments}　🔖 {video.saves}</span>
        </span>
      </button>
      {active && (
        <div className="vS-vm" role="dialog" aria-modal="true" aria-label={video.title} onClick={() => setActive(false)}>
          <div className="vS-vm-fr" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="vS-vm-x" onClick={() => { setActive(false); from.current?.focus(); }} aria-label="閉じる">×</button>
            {video.videoUrl ? (
              /\.(mp4|webm|mov)(\?|$)/i.test(video.videoUrl) ? (
                <video src={video.videoUrl} controls autoPlay playsInline poster={video.thumbnail} />
              ) : (
                <iframe src={video.videoUrl} allow="autoplay; encrypted-media; fullscreen" allowFullScreen title={video.title} />
              )
            ) : (
              <div className="msg">動画は準備中です</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
