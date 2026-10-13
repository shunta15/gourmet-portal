"use client";
/**
 * スクロールに連動する動きの司令塔。
 * [data-sp="p e o g"] を持つ要素ごとに、スクロール位置から 0〜1 の進み具合を計って CSS 変数に入れる(動かすのは CSS 側。ここでは transform などを直接触らない)。
 *   --sp-p : 画面の下から入って上へ抜けるまでの進み具合
 *   --sp-e : 入ってくる進み具合(上端が画面の下端にいる時 0 → 画面の約 4 割の高さまで来た時 1)
 *   --sp-o : 上へ抜けていく進み具合(上端が画面の上端にいる時 0 → 下端が画面の上端に来た時 1)
 *   --sp-g : 上端が画面の 85% の高さにいる時 0 → 画面の上端に来た時 1
 * data-sp-src="id" があれば、その id の要素の位置で測る。data-sp-show があれば、o が動き出したら .is-in を付ける。data-sp-pause があれば、画面の外にいる間 .is-off を付ける。
 * 画面に無い要素は 0 か 1 に固定して、値が変わった時だけ書く。rAF は scroll のたびに 1 回だけ。
 * 「動きを減らす」設定のときは何もしない(変数は付かず、CSS の既定値=落ち着いた見た目のまま)。
 */
import { useEffect, useRef } from "react";

type Item = { el: HTMLElement; src: HTMLElement; keys: string[]; show: boolean; pause: boolean; last: Record<string, string> };

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function ScrollFx() {
  const prog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".cp-root");
    const bar = prog.current;
    if (!root || !bar) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let items: Item[] = [];
    let tabs: { box: HTMLElement; links: HTMLAnchorElement[]; secs: (HTMLElement | null)[] } | null = null;
    let raf = 0;
    let lastTab = -1;
    let lastPage = "";
    let mo: MutationObserver | null = null;
    let on = false;
    let t1 = 0;

    const scan = () => {
      items = Array.from(root.querySelectorAll<HTMLElement>("[data-sp]")).map((el) => {
        const id = el.dataset.spSrc;
        return {
          el,
          src: (id && document.getElementById(id)) || el,
          keys: (el.dataset.sp || "").split(/\s+/).filter(Boolean),
          show: el.hasAttribute("data-sp-show"),
          pause: el.hasAttribute("data-sp-pause"),
          last: {},
        };
      });
      const box = root.querySelector<HTMLElement>(".cp-tabs");
      if (box) {
        const links = Array.from(box.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
        tabs = { box, links, secs: links.map((a) => document.getElementById(a.getAttribute("href")!.slice(1))) };
      } else tabs = null;
      lastTab = -1;
    };

    const frame = () => {
      const vh = window.innerHeight;
      const rects = items.map((it) => it.src.getBoundingClientRect());
      items.forEach((it, i) => {
        const top = rects[i].top;
        const h = Math.max(rects[i].height, 1);
        let p: number, e: number, o: number, g: number;
        if (top > vh * 1.3) p = e = o = g = 0;
        else if (top + h < -vh * 0.3) p = e = o = g = 1;
        else {
          p = clamp((vh - top) / (vh + h));
          e = clamp((vh - top) / (vh * 0.6));
          o = clamp(-top / h);
          g = clamp((vh * 0.85 - top) / (vh * 0.85));
        }
        const v: Record<string, number> = { p, e, o, g };
        for (const k of it.keys) {
          const s = v[k].toFixed(3);
          if (it.last[k] !== s) {
            it.last[k] = s;
            it.el.style.setProperty(`--sp-${k}`, s);
          }
        }
        if (it.show) it.el.classList.toggle("is-in", o > 0.04);
        // data-sp-pause: 画面の外(下に 1.3 画面以上 / 上に抜けて 0.3 画面以上)では .is-off を付ける。常時の揺れの animation を止めるため(CSS 側)
        if (it.pause) it.el.classList.toggle("is-off", top > vh * 1.3 || top + h < -vh * 0.3);
      });

      const max = document.documentElement.scrollHeight - vh;
      const page = (max > 0 ? clamp(window.scrollY / max) : 0).toFixed(3);
      if (page !== lastPage) {
        lastPage = page;
        bar.style.setProperty("--sp-page", page);
        if (tabs) tabs.box.style.setProperty("--sp-tp", page);
      }

      if (tabs) {
        const line = (window.innerWidth <= 900 ? 60 : 76) + 120;
        let idx = 0;
        tabs.secs.forEach((s, i) => {
          if (s && s.getBoundingClientRect().top <= line) idx = i;
        });
        if (idx !== lastTab) {
          lastTab = idx;
          tabs.links.forEach((a, i) => {
            a.classList.toggle("is-on", i === idx);
            if (i === idx) a.setAttribute("aria-current", "location");
            else a.removeAttribute("aria-current");
          });
        }
      }
    };

    const tick = () => {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; frame(); });
    };
    const rescan = () => { scan(); tick(); };

    const start = () => {
      if (on) return;
      on = true;
      scan();
      frame();
      window.addEventListener("scroll", tick, { passive: true });
      window.addEventListener("resize", tick, { passive: true });
      window.addEventListener("load", rescan);
      mo = new MutationObserver(rescan);
      mo.observe(root, { childList: true, subtree: true });
      t1 = window.setTimeout(rescan, 700);
    };
    const stop = () => {
      if (!on) return;
      on = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      window.clearTimeout(t1);
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
      window.removeEventListener("load", rescan);
      mo?.disconnect();
      mo = null;
      for (const it of items) {
        for (const k of it.keys) it.el.style.removeProperty(`--sp-${k}`);
        it.el.classList.remove("is-in", "is-off");
      }
      bar.style.removeProperty("--sp-page");
      tabs?.box.style.removeProperty("--sp-tp");
      items = [];
      tabs = null;
      lastPage = "";
    };
    const onMq = () => (mq.matches ? stop() : start());

    if (!mq.matches) start();
    mq.addEventListener("change", onMq);
    return () => {
      mq.removeEventListener("change", onMq);
      stop();
    };
  }, []);

  return (
    <div className="cp-prog" ref={prog} aria-hidden="true">
      <i />
    </div>
  );
}
