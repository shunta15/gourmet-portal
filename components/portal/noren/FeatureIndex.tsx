"use client";
import { useEffect, useRef, useState } from "react";

export type IndexItem = { id: string; no: string; name: string };

/**
 * 記事の店・スポットの目次。PC は左に縦に、スマホは上に横に貼り付く。読んでいる所が朱になる。
 * 記事全体の読み進み具合は、画面の上の朱い線で出す。
 */
export default function FeatureIndex({ items, targetId }: { items: IndexItem[]; targetId: string }) {
  const [cur, setCur] = useState(0);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = items.map((it) => document.getElementById(it.id)).filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (es) => {
        // 画面の上 1/3 の帯に入っている中で、いちばん下（後ろ）のものを「いま読んでいる所」にする
        for (const e of es) (e.target as HTMLElement).dataset.seen = e.isIntersecting ? "1" : "0";
        let k = -1;
        els.forEach((el, i) => {
          if (el.dataset.seen === "1") k = i;
        });
        if (k >= 0) setCur(k);
      },
      { rootMargin: "-18% 0px -62% 0px" }
    );
    els.forEach((el) => io.observe(el));

    const sheet = document.getElementById(targetId);
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!sheet || !bar.current) return;
        const r = sheet.getBoundingClientRect();
        const span = Math.max(1, r.height - window.innerHeight * 0.6);
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.35 - r.top) / span));
        bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items, targetId]);

  return (
    <>
      <div className="vF-prog" aria-hidden="true">
        <div ref={bar} />
      </div>
      <nav className="vF-idx-col" aria-label="記事の店の一覧">
       <div className="vF-idx">
        <ol>
          {items.map((it, i) => (
            <li key={it.id}>
              <a href={`#${it.id}`} aria-current={i === cur ? "true" : undefined} aria-label={`${it.no} ${it.name}`} data-cursor="JUMP">
                <span>{it.no}</span>
              </a>
            </li>
          ))}
        </ol>
        <p className="vF-idx-cur" aria-hidden="true" key={cur}>
          {items[cur]?.name}
        </p>
       </div>
      </nav>
    </>
  );
}
