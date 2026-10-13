"use client";
/**
 * 案 A「広げる」の動き(データは持たない。サーバーが出した DOM に付ける)。
 *  - 最初の画面より下の面: 画面の下から 10% の線を、広げた端とする。端が面の上から下へ進むほど --u が 0 → 1 になり、マットが転がって広がる。
 *    巻きの回転 --th はスクロール量に比例(転がりながら進む)。
 *  - 最初の画面: CSS の動きで転がって広がる。巻きをつかんで上へ引くと巻き戻り、離すと広がり直す(ばね)。
 *  - prefers-reduced-motion では何もしない(広げ切った形のまま)。
 */
import { useEffect } from "react";

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

export default function UnrollFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-ba]");
    if (!root) return;
    root.classList.add("ba-js", "ba-ready");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("ba-still");
      return;
    }
    const secs = Array.from(root.querySelectorAll<HTMLElement>("[data-ba-u]"));
    const hero = root.querySelector<HTMLElement>("[data-ba-hero]");
    const last = new Map<HTMLElement, number>();
    let vh = window.innerHeight;
    let raf = 0;
    let dragging = false;
    let spring = 0;

    const apply = () => {
      raf = 0;
      const y = window.scrollY;
      secs.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const u = clamp((vh * 0.9 - r.top) / Math.max(1, r.height), 0, 1);
        const prev = last.get(el);
        if (prev === undefined || Math.abs(prev - u) > 0.0008) {
          el.style.setProperty("--u", u.toFixed(4));
          last.set(el, u);
        }
        if (r.bottom > -100 && r.top < vh + 100) el.style.setProperty("--th", (y / 28 + i * 1.7).toFixed(3));
      });
      if (hero && !dragging && hero.classList.contains("is-free")) hero.style.setProperty("--th", (13 + y / 28).toFixed(3));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onResize = () => {
      vh = window.innerHeight;
      schedule();
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);

    // 最初の画面: 開く動きが終わったら、巻きの回転はスクロールに任せる
    const onEnd = () => {
      if (!hero || dragging) return;
      hero.classList.add("is-free");
      hero.style.setProperty("--u", "1");
      hero.style.setProperty("--th", "13");
    };
    hero?.addEventListener("animationend", onEnd);

    // 巻きをつかむ
    const roll = hero?.querySelector<HTMLElement>(".ba-roll") ?? null;
    let u0 = 1;
    let y0 = 0;
    let h = 1;
    let uNow = 1;
    const setU = (u: number) => {
      uNow = u;
      hero?.style.setProperty("--u", u.toFixed(4));
      hero?.style.setProperty("--th", (13 + (u * h) / 22 + window.scrollY / 28).toFixed(3));
    };
    const onDown = (e: PointerEvent) => {
      if (!hero || e.button !== 0) return;
      e.preventDefault(); // 文字の選択を始めない
      cancelAnimationFrame(spring);
      const cs = parseFloat(getComputedStyle(hero).getPropertyValue("--u"));
      u0 = Number.isFinite(cs) ? cs : 1;
      hero.classList.add("is-drag");
      dragging = true;
      h = hero.getBoundingClientRect().height;
      y0 = e.clientY;
      setU(u0);
      try {
        roll?.setPointerCapture(e.pointerId);
      } catch {}
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      setU(clamp(u0 + (e.clientY - y0) / h, 0.04, 1));
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      const step = () => {
        const nu = uNow + (1 - uNow) * 0.1 + 0.002;
        if (nu >= 0.999) {
          setU(1);
          hero?.classList.remove("is-drag");
          hero?.classList.add("is-free");
          return;
        }
        setU(nu);
        spring = requestAnimationFrame(step);
      };
      spring = requestAnimationFrame(step);
    };
    roll?.addEventListener("pointerdown", onDown);
    roll?.addEventListener("pointermove", onMove);
    roll?.addEventListener("pointerup", onUp);
    roll?.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(spring);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      hero?.removeEventListener("animationend", onEnd);
      roll?.removeEventListener("pointerdown", onDown);
      roll?.removeEventListener("pointermove", onMove);
      roll?.removeEventListener("pointerup", onUp);
      roll?.removeEventListener("pointercancel", onUp);
    };
  }, []);
  return null;
}
