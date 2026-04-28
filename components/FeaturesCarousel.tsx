"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FEATURES } from "@/lib/data";

export default function FeaturesCarousel() {
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
      const p = el.scrollLeft / (el.scrollWidth - el.clientWidth);
      setProgress(p);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="features">
      <div className="section-head">
        <div className="no">
          <b>◎ 01</b>特集
        </div>
        <h2
          className="reveal-line"
          style={{
            whiteSpace: "nowrap",
            fontSize: "clamp(28px, 5vw, 64px)",
          }}
        >
          <span>
            今月の、<em>特集記事</em>
          </span>
        </h2>
        <div className="lede">
          旅行のお供に。今夜の一軒に。編集部が週替わりでお届けする、下町の読みもの。
        </div>
      </div>

      <div className="features-carousel" ref={scrollerRef}>
        {FEATURES.map((f) => (
          <Link
            key={f.id}
            href={`/feature/${f.id}`}
            className="feature-card"
            data-cursor="READ"
          >
            <div
              className="img"
              style={{ backgroundImage: `url(${f.image})` }}
            />
            <div className="big-no">{f.no}</div>
            <div className="meta">
              <span className="tag">{f.tag}</span>
              <span>{f.kicker}</span>
            </div>
            <div className="body">
              <div className="kicker">特集 / {f.no}</div>
              <h3
                dangerouslySetInnerHTML={{
                  __html: f.title
                    .replace(/焼肉/g, "<em>焼肉</em>")
                    .replace(/和食/g, "<em>和食</em>"),
                }}
              />
              <p>{f.sub}</p>
              <span className="read">
                記事を読む{" "}
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                  <path
                    d="M1 5H15M15 5L11 1M15 5L11 9"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="carousel-ctl">
        <button
          type="button"
          onClick={() => scroll(-1)}
          data-cursor="PREV"
        >
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
