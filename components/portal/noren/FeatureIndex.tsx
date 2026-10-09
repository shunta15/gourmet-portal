"use client";
import { useEffect, useRef, useState } from "react";

export type IndexItem = { id: string; no: string; name: string };

/**
 * 記事の店・場所の目次。画面の上に渡した竿に、小さな暖簾の札が並ぶ。いま読んでいる店の札が朱になる。
 * 巻頭を過ぎてから出る（巻頭では暖簾そのものが目次）。記事全体の読み進み具合は、画面の上の朱い線。
 */
export default function FeatureIndex({ items, bodyId }: { items: IndexItem[]; bodyId: string }) {
  const [cur, setCur] = useState(0);
  const [on, setOn] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const ol = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const els = items.map((it) => document.getElementById(it.id)).filter(Boolean) as HTMLElement[];
    const body = document.getElementById(bodyId);
    if (els.length === 0 || !body) return;
    // 画面の上 1/3 の帯に入っている中で、いちばん後ろのものを「いま読んでいる所」にする
    const io = new IntersectionObserver(
      (es) => {
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
    // 札は、記事の本文（巻頭の下から、編集後記まで）が画面にあるあいだ出す
    const io2 = new IntersectionObserver(
      (es) => {
        const r = es[0];
        setOn(r.isIntersecting && r.boundingClientRect.top < window.innerHeight * 0.6);
      },
      { threshold: [0, 0.01, 0.1, 0.5], rootMargin: "-60px 0px -40% 0px" }
    );
    io2.observe(body);
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!bar.current) return;
        const r = body.getBoundingClientRect();
        const span = Math.max(1, r.height - window.innerHeight * 0.6);
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.35 - r.top) / span));
        bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
        setOn(r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.3);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      io2.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items, bodyId]);

  // いま読んでいる札が、横に長い札の列の外に出ないように送る
  useEffect(() => {
    const l = ol.current;
    const a = l?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!l || !a) return;
    const left = a.offsetLeft - l.clientWidth / 2 + a.clientWidth / 2;
    l.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [cur]);

  return (
    <>
      <div className="vF-prog" aria-hidden="true">
        <div ref={bar} />
      </div>
      <nav className={`vF-idx${on ? " is-on" : ""}`} aria-label="記事の店・場所の一覧" aria-hidden={!on || undefined}>
        <div className="vF-idx-rod" aria-hidden="true" />
        <ol ref={ol}>
          {items.map((it, i) => (
            <li key={it.id}>
              <a href={`#${it.id}`} tabIndex={on ? 0 : -1} aria-current={i === cur ? "true" : undefined} aria-label={`${it.no}　${it.name}`} data-cursor="JUMP">
                <span>{it.no}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
