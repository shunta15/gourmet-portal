"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type ShopProp = {
  id: string;
  name: string;
  station: string;
  area: string;
  regionName: string;
  cuisine: string;
  img: string;
};
export type ChapterProp = {
  key: string;
  kanji: string;
  no: string;
  en: string;
  ja: string;
  note: string;
  count: number;
  shops: ShopProp[];
};

/** 縦書きの店名の大きさ（長い名前ほど小さく） */
function fs(name: string): number {
  const L = Array.from(name).length;
  if (L <= 6) return 1;
  if (L <= 9) return 0.84;
  if (L <= 13) return 0.68;
  return 0.56;
}

/** shopBase: 店ページの行き先の手前（見本は "/proto-noren/restaurant"、本番の /gourmet は "/restaurant"）。`${shopBase}/${id}` */
export default function Chapter({ c, index, total, shopBase }: { c: ChapterProp; index: number; total: number; shopBase: string }) {
  const sec = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const hover = useRef<number | null>(null);
  const n = c.shops.length;

  useEffect(() => {
    const el = sec.current!;
    let raf = 0;
    let ticking = false;
    const calc = () => {
      ticking = false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = Math.max(1, r.height - vh);
      const p = Math.min(0.9999, Math.max(0, -r.top / span));
      el.style.setProperty("--cp", p.toFixed(4));
      el.dataset.on = r.top < vh * 0.9 && r.bottom > vh * 0.1 ? "1" : "0";
      const i = Math.min(n - 1, Math.floor(p * n));
      if (hover.current === null || i !== lastI) {
        if (i !== lastI) hover.current = null;
        setActive((a) => (a === i ? a : hover.current ?? i));
      }
      lastI = i;
    };
    let lastI = -1;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(calc);
      }
    };
    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [n]);

  const cur = c.shops[Math.min(active, n - 1)];

  return (
    <section
      ref={sec}
      className="vN-ch-sec"
      id={`ch-${c.key}`}
      data-on="0"
      style={{ ["--n" as string]: n }}
      aria-label={`${c.ja}の章`}
    >
      <div className="vN-ch-stage">
        <div className="vN-ch-bgglow" aria-hidden="true" />

        <header className="vN-ch-head">
          <span className="vN-ch-no">
            <i>{c.no}</i>
            <small>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</small>
          </span>
          <h2 className="vN-ch-title">
            <span className="vN-ch-ja">{c.ja}</span>
            <span className="vN-ch-en">{c.en}</span>
          </h2>
        </header>

        <div className="vN-kj-wrap" aria-hidden="true">
          <span className="vN-kj vN-kj--line">{c.kanji}</span>
          {c.shops.map((s, i) => (
            <span
              key={s.id}
              className="vN-kj vN-kj--img"
              data-on={i === active ? "1" : "0"}
              style={{ backgroundImage: `url(${s.img})` }}
            >
              {c.kanji}
            </span>
          ))}
        </div>

        <div className="vN-cols" role="list">
          {c.shops.map((s, i) => (
            <Link
              key={s.id}
              href={`${shopBase}/${s.id}`}
              role="listitem"
              className="vN-col"
              data-on={i === active ? "1" : "0"}
              data-cursor="VIEW"
              style={{ ["--f" as string]: fs(s.name) }}
              onMouseEnter={() => {
                hover.current = i;
                setActive(i);
              }}
              onFocus={() => setActive(i)}
            >
              <span className="vN-col-no">{String(i + 1).padStart(2, "0")}</span>
              <b className="vN-col-nm">{s.name}</b>
              <span className="vN-col-st">{s.station || s.area}</span>
            </Link>
          ))}
        </div>

        <div className="vN-ch-foot">
          <p className="vN-ch-count">
            掲載 <b>{c.count}</b> 軒
            <small>{c.note}</small>
          </p>
          <Link href={`${shopBase}/${cur.id}`} className="vN-ch-cur" data-cursor="VIEW" key={cur.id}>
            <span className="vN-ch-cur-k">{cur.regionName}{cur.area && cur.area !== cur.regionName ? ` · ${cur.area}` : ""}</span>
            <span className="vN-ch-cur-n">{cur.name}</span>
            <span className="vN-ch-cur-c">{cur.cuisine}{cur.station ? ` / ${cur.station}` : ""}</span>
            <span className="vN-ch-cur-go">この店を見る →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
