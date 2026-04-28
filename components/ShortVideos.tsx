"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SHORT_VIDEOS, RESTAURANTS } from "@/lib/data";

export default function ShortVideos() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const scroll = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.7), behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const denom = el.scrollWidth - el.clientWidth;
      const p = denom > 0 ? el.scrollLeft / denom : 0;
      setProgress(p);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="shorts">
      <div className="section-head">
        <div className="no">
          <b style={{ color: "var(--accent)" }}>◎ 03</b>SHORTS / ショート動画
        </div>
        <h2 className="reveal-line">
          <span>
            観て食べたくなる、<em>30秒。</em>
          </span>
        </h2>
        <div className="lede">
          編集部が撮り下ろす、縦型ショート動画。タップで店舗ページへ。
        </div>
      </div>

      <div className="shorts-carousel" ref={scrollerRef}>
        {SHORT_VIDEOS.map((v) => {
          const r = RESTAURANTS.find((x) => x.id === v.restaurantId);
          return (
            <Link
              key={v.id}
              href={`/restaurant/${v.restaurantId}`}
              className="short-card"
              data-cursor="WATCH"
            >
              <div
                className="thumb"
                style={{ backgroundImage: `url(${v.thumbnail})` }}
              />
              <div className="play-btn" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path
                    d="M7 4.5v13l11-6.5L7 4.5z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="cuisine-tag">
                <span className="emoji">{v.cuisineEmoji}</span>
                {v.cuisineLabel}
              </div>
              <div className="duration">{v.duration}</div>
              <div className="overlay">
                <div className="title">{v.title}</div>
                {r && (
                  <div className="store">
                    {r.name} <span className="dot">·</span> {r.area}
                  </div>
                )}
                <div className="stats">
                  <span>♥ {v.likes}</span>
                  <span>💬 {v.comments}</span>
                  <span>🔖 {v.saves}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="carousel-ctl">
        <button type="button" onClick={() => scroll(-1)} data-cursor="PREV">
          <svg width="24" height="10" viewBox="0 0 24 10" fill="none">
            <path
              d="M23 5H1M1 5L5 1M1 5L5 9"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
          前へ
        </button>
        <div className="progress">
          <div
            className="bar"
            style={{ width: `${Math.max(12, progress * 100)}%` }}
          />
        </div>
        <button type="button" onClick={() => scroll(1)} data-cursor="NEXT">
          次へ
          <svg width="24" height="10" viewBox="0 0 24 10" fill="none">
            <path
              d="M1 5H23M23 5L19 1M23 5L19 9"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
