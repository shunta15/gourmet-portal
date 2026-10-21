"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import PawRun from "../PawRun";
import { IconArrow } from "../../common/Icons";

/** 一覧に出す 1 本(サーバーで点検済みの文字・写真。シリアライズできる形だけ) */
export type LiveCardData = {
  id: string;
  href: string;
  tag: string;
  title: string;
  desc: string;
  /** 「確認 2026.10.09」の形(無ければ空) */
  date: string;
  dateIso: string;
  img: { src: string; w: number; h: number };
};
export type LiveTab = { key: string; label: string; items: LiveCardData[] };

const STEP = 12;

/** タブの文字を 1 文字ずつの箱に分ける(フリップで文字が順に縦に回るため) */
function Chars({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((c, i) => (
        <span className="ar-ch" key={i} style={{ ["--i" as string]: i } as CSSProperties}>
          {c}
        </span>
      ))}
    </>
  );
}

/** タブの幅(見本 948 幅での px)。字数から見積もる(見本: 4 字 108.5・8 字 137。種類のタブが 7 つ並んでも 836 に収まる幅) */
const tabW = (label: string) => Math.max(76, Math.round(26 + 14.5 * Array.from(label).length));

/**
 * 記事の一覧(種類ごとのタブ。最初のタブは「すべて」)。見本の LatestTabs(../LatestTabs.tsx)と同じ動き: タブの下線が滑り、文字が縦に回って入れ替わり、
 * カードは左の列は左から・右の列は右から寄ってくる。見本は 4 本ずつだが、実在の記事は何本あるか分からないので、12 本ずつ「もっと見る」で足す(全部に届く)。
 */
export default function LiveTabs({ tabs, label = "記事の一覧" }: { tabs: LiveTab[]; label?: string }) {
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState<Record<string, number>>({});
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
  const count = Math.min(shown[tab.key] ?? STEP, tab.items.length);
  const items = tab.items.slice(0, count);
  return (
    <section className="ar-lt arl-lt pt-wrap" aria-label={label} id="ar-latest">
      <PawRun className="ar-paws--lt" count={12} direction="right" />
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
              style={{ width: `calc(${tabW(t.label)} * var(--u))` }}
              aria-label={`${t.label}(${t.items.length}本)`}
              onClick={() => setActive(i)}
            >
              <span className="ar-tab-t" aria-hidden="true">
                <span className="ar-tab-a">
                  <Chars text={t.label} />
                </span>
                <span className="ar-tab-b">
                  <Chars text={t.label} />
                </span>
              </span>
            </button>
          ))}
        </div>
        <span className="arl-count" aria-live="polite">
          {tab.items.length}本
        </span>
      </div>
      <ul className="ar-lt-grid pt-skew" data-skew="0.45" id="ar-tabpanel" role="tabpanel" aria-labelledby={`ar-tab-${tab.key}`} key={tab.key} data-io-group>
        {items.map((c, i) => (
          <li key={c.id} className="io" data-io={i % 4 < 2 ? "left" : "right"}>
            <Link href={c.href} className="ar-lt-card ar-lift pt-hov pt-tilt" data-tilt="6">
              <span className="ar-lt-img pt-zoom pt-shine ar-sheen">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img.src} width={c.img.w} height={c.img.h} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="ar-lt-body">
                {c.tag ? <span className="ar-tagp">{c.tag}</span> : null}
                <h3 className="ar-lt-t arl-clamp3">{c.title}</h3>
                {c.desc ? <p className="ar-lt-d arl-clamp2">{c.desc}</p> : null}
                <span className="ar-lt-foot">
                  {c.date ? (
                    <time className="ar-date" dateTime={c.dateIso}>
                      {c.date}
                    </time>
                  ) : (
                    <span />
                  )}
                  <span className="pt-arrow ar-lt-arrow">
                    <IconArrow />
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {count < tab.items.length ? (
        <p className="arl-more">
          <button type="button" className="arl-more-btn pt-press" onClick={() => setShown((s) => ({ ...s, [tab.key]: count + STEP }))}>
            もっと見る({tab.items.length - count}本)
          </button>
        </p>
      ) : null}
    </section>
  );
}
