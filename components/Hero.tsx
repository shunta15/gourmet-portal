"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { NATIONAL } from "@/lib/data";
import { useParallax, useTypewriter } from "@/lib/hooks";

export default function Hero() {
  const N = NATIONAL;
  const [idx, setIdx] = useState(0);
  const [inView, setInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 768px)");
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setIsMobile(mqMobile.matches);
      setReducedMotion(mqReduced.matches);
    };
    update();
    mqMobile.addEventListener("change", update);
    mqReduced.addEventListener("change", update);
    return () => {
      mqMobile.removeEventListener("change", update);
      mqReduced.removeEventListener("change", update);
    };
  }, []);

  // Mobile: 2 images only (data savings). Desktop: full set.
  const slides = isMobile ? N.heroImages.slice(0, 2) : N.heroImages;

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = isMobile ? 7000 : 4500;
    const t = setInterval(
      () => setIdx((i) => (i + 1) % slides.length),
      interval
    );
    return () => clearInterval(t);
  }, [slides.length, isMobile]);

  useEffect(() => {
    const t = setTimeout(() => setInView(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Disable parallax on reduced-motion or mobile.
  useParallax(mediaRef, reducedMotion || isMobile ? 0 : 0.15);

  const typed = useTypewriter(
    ["北海道から沖縄まで。", "今宵、どこで食す。", "一皿ずつ、旅をする。"],
    80,
    2200
  );

  return (
    <section className="hero">
      <div className="hero-media" ref={mediaRef}>
        {slides.map((src, i) => (
          <div
            key={src}
            className={"img-wrap " + (i === idx ? "active" : "")}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={i === 0}
              fetchPriority={i === 0 ? "high" : "low"}
              sizes="100vw"
              quality={i === 0 ? 75 : 65}
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </div>
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
