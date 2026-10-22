"use client";

import { useEffect, useState } from "react";

/**
 * 記事のヒーロー右の「INDEX」(01 はじめに … 基本情報・店の情報)。節の見出しへ移動し、読んでいる節の番号と文字が明るくなる。
 * 節には id を付けておく(items の id と同じ)。動きを減らす設定のときは移動も即座に。
 */
export default function IndexNav({ items }: { items: Array<{ id: string; label: string }> }) {
  const [cur, setCur] = useState(items[0]?.id ?? "");
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      let c = items[0]?.id ?? "";
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.42) c = it.id;
      }
      setCur(c);
    };
    const on = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  const go = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <nav className="vk-a-idx" aria-label="この記事の目次">
      <p className="vk-a-idx-h">
        <span className="vk-a-idx-n">01</span> INDEX
      </p>
      <ol>
        {items.map((it, i) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className={cur === it.id ? "is-on" : ""} aria-current={cur === it.id ? "true" : undefined} onClick={(e) => go(e, it.id)}>
              <span className="vk-a-idx-no">{String(i + 1).padStart(2, "0")}</span>
              <span className="vk-a-idx-t">{it.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
