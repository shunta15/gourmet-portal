"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type FlagProp = {
  key: string;
  name: string;
  count: number;
  w: number;
  h: number;
  shop: { id: string; name: string; station: string; img: string } | null;
};

/**
 * エリアののぼり。幅と長さは掲載数に比例し、布越しに各エリアの実在店の写真が透ける。
 * 風（＝スクロールの速さ）とホバーで揺れる。
 */
export default function Nobori({ flags, total }: { flags: FlagProp[]; total: number }) {
  const ul = useRef<HTMLUListElement>(null);
  const [cur, setCur] = useState(0);
  const hov = useRef(-1);

  useEffect(() => {
    const el = ul.current!;
    const items = Array.from(el.querySelectorAll<HTMLElement>("li"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf = 0;
    let vis = false;
    let lastY = window.scrollY;
    let vel = 0;
    const boost = items.map(() => 0);
    const io = new IntersectionObserver((es) => { vis = es[0].isIntersecting; }, { rootMargin: "80px" });
    io.observe(el);
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const y = window.scrollY;
      vel = vel * 0.92 + Math.min(1, Math.abs(y - lastY) / 50) * 0.08;
      lastY = y;
      if (!vis) return;
      const t = (now - t0) / 1000;
      items.forEach((li, i) => {
        boost[i] += ((hov.current === i ? 1 : 0) - boost[i]) * 0.08;
        const amp = 0.9 + vel * 5.5 + boost[i] * 4.2;
        const a = amp * (Math.sin(t * (0.9 + boost[i] * 1.6) + i * 0.83) * 0.7 + Math.sin(t * 1.9 + i * 2.1) * 0.3);
        li.style.transform = `rotate(${a.toFixed(3)}deg)`;
      });
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const c = flags[cur];
  const on = (i: number) => {
    hov.current = i;
    setCur(i);
  };

  return (
    <div className="vN-nb-wrap">
      <ul ref={ul} className="vN-nobori" onMouseLeave={() => (hov.current = -1)}>
        {flags.map((f, i) => (
          <li key={f.key} style={{ ["--w" as string]: `${f.w}px`, ["--h" as string]: f.h }}>
            <Link
              href={`/region/${f.key}`}
              className="vN-nb-a"
              data-on={i === cur ? "1" : "0"}
              data-cursor="AREA"
              onMouseEnter={() => on(i)}
              onFocus={() => on(i)}
              onBlur={() => (hov.current = -1)}
              aria-label={`${f.name}（${f.count}軒）`}
            >
              <i className="vN-nb-bar" />
              {f.shop && <span className="vN-nb-ph" style={{ backgroundImage: `url(${f.shop.img})` }} />}
              <span className="vN-nb-wv" />
              <b>{f.name}</b>
              <span className="vN-nb-c">
                <em>{f.count}</em>軒
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="vN-nb-cap" aria-live="polite">
        <span className="vN-nb-cap-k">
          {c.name}<em>{c.count}</em>軒
          <small>/ 全 {total} 軒</small>
        </span>
        {c.shop && (
          <Link href={`/proto-noren/restaurant/${c.shop.id}`} data-cursor="VIEW" className="vN-nb-cap-s">
            布に透ける写真：{c.shop.name}
            {c.shop.station ? `（${c.shop.station}）` : ""}
            <span aria-hidden="true"> →</span>
          </Link>
        )}
      </p>
    </div>
  );
}
