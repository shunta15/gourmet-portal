"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ArticleCard from "./ArticleCard";
import { IconArrow } from "../common/Icons";
import { ARTICLES_HREF } from "../common/site";
import type { Card } from "./data";

type Tab = { key: string; label: string; w: number; items: Card[] };

/** 新着記事 / 人気記事 / 編集部のおすすめ。タブの下線が滑って移り、カードは順にせり上がる */
export default function LatestTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const n = list.current;
    if (!n) return;
    const place = () => {
      const b = n.querySelector<HTMLElement>(`[data-i="${active}"]`);
      if (!b || !b.offsetWidth) return;
      n.style.setProperty("--ix", `${b.offsetLeft}px`);
      n.style.setProperty("--iw", `${b.offsetWidth}px`);
    };
    place();
    // 画面の幅が変わる(--u が変わる)たびに測り直す。resize の順番に左右されないよう ResizeObserver で
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(place) : null;
    ro?.observe(n);
    window.addEventListener("resize", place);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [active]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = (active + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
    setActive(n);
    list.current?.querySelector<HTMLElement>(`[data-i="${n}"]`)?.focus();
  };

  const tab = tabs[active];
  return (
    <section className="ar-lt pt-wrap" aria-label="記事の新着・人気・おすすめ" id="ar-latest">
      <div className="ar-tabs-row io">
        <div className="ar-tabs" role="tablist" ref={list} onKeyDown={onKey}>
          <i className="ar-tabs-ind" aria-hidden="true" />
          {tabs.map((t, i) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`ar-tab-${t.key}`}
              aria-selected={i === active}
              aria-controls="ar-tabpanel"
              tabIndex={i === active ? 0 : -1}
              data-i={i}
              className={`ar-tab pt-press ${i === active ? "is-on" : ""}`}
              style={{ width: `calc(${t.w} * var(--u))` }}
              onClick={() => setActive(i)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Link className="pt-more ar-more" href={ARTICLES_HREF}>
          すべての記事を見る
          <IconArrow />
        </Link>
      </div>
      <ul className="ar-lt-grid" id="ar-tabpanel" role="tabpanel" aria-labelledby={`ar-tab-${tab.key}`} key={tab.key} data-io-group>
        {tab.items.map((c) => (
          <ArticleCard key={c.title.join("")} c={c}  />
        ))}
      </ul>
    </section>
  );
}
