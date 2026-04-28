"use client";
import { useEffect, useRef, useState } from "react";
import { NATIONAL } from "@/lib/data";
import { useParallax, useTypewriter } from "@/lib/hooks";

export default function Hero() {
  const N = NATIONAL;
  const [idx, setIdx] = useState(0);
  const [inView, setInView] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(
      () => setIdx((i) => (i + 1) % N.heroImages.length),
      4500
    );
    return () => clearInterval(t);
  }, [N.heroImages.length]);

  useEffect(() => {
    const t = setTimeout(() => setInView(true), 80);
    return () => clearTimeout(t);
  }, []);

  useParallax(mediaRef, 0.15);

  const typed = useTypewriter(
    ["北海道から沖縄まで。", "今宵、どこで食す。", "一皿ずつ、旅をする。"],
    80,
    2200
  );

  return (
    <section className="hero">
      <div className="hero-media" ref={mediaRef}>
        {N.heroImages.map((src, i) => (
          <div
            key={i}
            className={"img " + (i === idx ? "active" : "")}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>
      <div className="hero-grid" />
      <div className="hero-vertical">マチノワ · 全国版 2026</div>
      <div className="hero-inner">
        <div className="hero-meta">
          <span>◎ {N.brand} · 全国飲食店ポータル</span>
          <span>第24号 · 2026年 春号</span>
        </div>
        <h1 className={"hero-title " + (inView ? "in" : "")}>
          <span className="line">
            <span>{N.tagline[0]}</span>
          </span>
          <span className="line">
            <span>
              <em>{N.tagline[1]}</em>
            </span>
          </span>
        </h1>
        <div className="hero-type-line">
          <span className="typewriter">{typed}</span>
        </div>
        <div className="hero-sub">
          <p>
            {N.subtitle}{" "}
            広告や掲載料ではなく、編集部の舌と足で選んだ一軒ずつを、取材記事とともにお届けします。
          </p>
          <div className="cta">
            <div className="scroll-hint">
              下へスクロール <div className="bar" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
