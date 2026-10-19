/* eslint-disable @next/next/no-img-element */
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { IMG } from "./const";

const B = `${IMG}/lower/`;
const SL = [
  { img: "slide1.webp", t1: "春", t1b: "のまちで、", t2: "新しい好きに出会う。", sub: ["花とグルメと、心はずむおでかけ。", "この季節に行きたい、まちのおすすめスポット。"], btn: "春の特集を見る", href: "/feature" },
  { img: "slide2.webp", t1: "水", t1b: "辺のまちで、", t2: "ゆったり過ごそう。", sub: ["川ぞいのカフェと散歩道で、", "ほっとひと息つけるおすすめスポット。"], btn: "水辺の特集を見る", href: "/leisure" },
  { img: "slide3.webp", t1: "市", t1b: "のまちで、", t2: "人と店に出会おう。", sub: ["マルシェとイベントで、", "店と人がつながるまちの週末。"], btn: "市とイベントを見る", href: "/feature" },
];
const N = SL.length;
const INTERVAL = 4500;

/** 春の特集の大きなスライド。4.5 秒ごとに自動で切り替え(乗せている間は止まる)。矢印・丸で切り替え。丸は進み具合が伸びる。 */
export default function Slider() {
  const [i, setI] = useState(0);
  const hover = useRef(false);
  const last = useRef(0);
  const go = useCallback((n: number) => { last.current = performance.now(); setI(((n % N) + N) % N); }, []);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.hidden || hover.current) return;
      if (performance.now() - last.current < INTERVAL - 200) return;
      last.current = performance.now();
      setI((n) => (n + 1) % N);
    }, 500);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="h2-slider" onPointerEnter={() => { hover.current = true; }} onPointerLeave={() => { hover.current = false; last.current = performance.now(); }} data-slide={i}>
      {SL.map((s, k) => (
        <div key={k} className={`h2-sl${i === k ? " is-on" : ""}`} aria-hidden={i !== k}>
          <img className="h2-slimg" src={`${B}${s.img}`} alt="" />
          <img className="h2-slhaze" src={`${B}slide-haze.webp`} alt="" />
          <h2 className="h2-sh h2-press"><span className="h2-sh1"><b>{s.t1}</b>{s.t1b}</span><span className="h2-sh2">{s.t2}</span></h2>
          <p className="h2-ssub">{s.sub[0]}<br />{s.sub[1]}</p>
          <a className="h2-sbtn h2-press" href={s.href} tabIndex={i === k ? 0 : -1}>{s.btn} <span aria-hidden>→</span></a>
        </div>
      ))}
      <p className="h2-sbub h2-kure h2-jump2"><span>いつものまちが</span><span>もっと特別に見える。</span></p>
      <button type="button" aria-label="前の特集" className="h2-arrow h2-prev h2-press" onClick={() => go(i - 1)}>‹</button>
      <button type="button" aria-label="次の特集" className="h2-arrow h2-next h2-press" onClick={() => go(i + 1)}>›</button>
      <div className="h2-dots">
        {Array.from({ length: N }, (_, k) => (
          <button key={k} type="button" aria-label={`特集 ${k + 1}`} aria-current={i === k} className={`h2-dot${i === k ? " is-on" : ""}`} onClick={() => go(k)} />
        ))}
      </div>
    </div>
  );
}
