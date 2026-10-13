"use client";
/**
 * 案 B「回す」の動き(データは持たない。サーバーが出した DOM に付ける)。
 *  - ドラムの角度 θ(度)。スクロール位置から、今読んでいる見出しの面の角度へ向かう(ばね)。
 *  - 指(ポインター)で回す: つかんだ面が指について動き、離すと勢いがついて回り、遅くなったら一番近い面に止まる。止まった面の見出しへスクロールする。
 *  - 面ごとに、手前から離れるほど暗くする(--lit)。最初の開く動き(勢いよく回って止まる)は CSS。終わってから、ここが引き継ぐ。
 *  - prefers-reduced-motion では何もしない(見出しの一覧を出す)。
 */
import { useEffect } from "react";

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

export default function DrumFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-bb]");
    const drum = root?.querySelector<HTMLElement>("[data-bb-drum]");
    const cyl = root?.querySelector<HTMLElement>("[data-bb-cyl]");
    if (!root || !drum || !cyl) return;
    root.classList.add("bb-js", "bb-ready");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("bb-still");
      return;
    }
    const faces = Array.from(cyl.querySelectorAll<HTMLElement>(".bb-face"));
    const N = faces.length;
    const L = Number(root.dataset.l) || N;
    const step = 360 / N;
    const ids = faces.slice(0, L).map((f) => (f.getAttribute("href") ?? "").slice(1));
    let tops: number[] = [];
    let docH = 0;
    let theta = 0;
    let omega = 0;
    let free = false;
    let dragging = false;
    let snapTo: number | null = null;
    let spinning = false;
    let raf = 0;
    let lastT = 0;
    let moved = 0;
    let y0 = 0;
    let th0 = 0;
    let lastY = 0;
    let lastTs = 0;
    let vel = 0;
    let lock = 0;

    const measure = () => {
      tops = ids.map((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      });
      docH = document.documentElement.scrollHeight;
    };
    const fromScroll = () => {
      const y = window.scrollY + window.innerHeight * 0.38;
      if (window.scrollY + window.innerHeight >= docH - 4) return (L - 1) * step;
      let i = 0;
      for (let k = 0; k < L; k++) if (tops[k] <= y) i = k;
      const a = tops[i];
      const b = i < L - 1 ? tops[i + 1] : a + window.innerHeight;
      return (i + clamp((y - a) / Math.max(1, b - a), 0, 1)) * step;
    };
    const paint = () => {
      cyl.style.setProperty("--th", theta.toFixed(3));
      let near = 0;
      let best = 1e9;
      faces.forEach((f, j) => {
        const d = Math.abs((((j * step - theta) % 360) + 540) % 360 - 180);
        f.style.setProperty("--lit", Math.max(0, Math.cos((d * Math.PI) / 180)).toFixed(3));
        if (d < best) {
          best = d;
          near = j;
        }
      });
      faces.forEach((f, j) => f.toggleAttribute("data-on", j === near));
    };
    const section = () => ((Math.round(theta / step) % L) + L) % L;
    const go = (s: number) => {
      const el = document.getElementById(ids[s]);
      if (!el) return;
      lock = performance.now() + 900;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016);
      lastT = now;
      let again = false;
      if (dragging) {
        again = true;
      } else if (spinning) {
        theta += omega * dt;
        omega *= Math.pow(0.04, dt);
        if (Math.abs(omega) < 24) {
          spinning = false;
          snapTo = Math.round(theta / step) * step;
        }
        again = true;
      } else if (snapTo !== null) {
        theta += (snapTo - theta) * Math.min(1, dt * 14);
        if (Math.abs(snapTo - theta) < 0.05) {
          theta = snapTo;
          snapTo = null;
          const s = section();
          const cycle = L * step;
          theta -= Math.floor(theta / cycle) * cycle; // 同じ並びの面(一周ぶん)へ、見た目を変えずに戻す
          go(s);
        }
        again = true;
      } else {
        const tg = fromScroll();
        const d = tg - theta;
        if (Math.abs(d) > 0.04) {
          theta += d * Math.min(1, dt * 9);
          again = true;
        }
      }
      paint();
      if (again || now < lock) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!free) return;
      if (!raf) {
        lastT = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    const release = () => {
      if (free) return;
      const cs = parseFloat(getComputedStyle(cyl).getPropertyValue("--th"));
      theta = Number.isFinite(cs) ? cs : 0;
      cyl.getAnimations().forEach((a) => a.cancel());
      root.classList.add("bb-free");
      free = true;
      measure();
      kick();
    };

    measure();
    const anims = cyl.getAnimations();
    if (anims.length > 0) {
      Promise.all(anims.map((a) => a.finished.catch(() => null))).then(() => {
        if (!free) {
          theta = 0;
          release();
          theta = 0;
          paint();
        }
      });
    } else {
      release();
    }

    const onScroll = () => {
      if (!dragging && snapTo === null && !spinning) kick();
    };
    const onResize = () => {
      measure();
      kick();
    };
    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
    root.addEventListener("toggle", onResize, true);

    // 指で回す
    const R = () => parseFloat(getComputedStyle(drum).getPropertyValue("--R")) || 100;
    let pressed = false;
    let pid = 0;
    const startDrag = (e: PointerEvent) => {
      dragging = true;
      spinning = false;
      snapTo = null;
      th0 = theta;
      y0 = e.clientY;
      lastY = e.clientY;
      lastTs = performance.now();
      vel = 0;
      drum.classList.add("is-grab");
      try {
        drum.setPointerCapture(pid);
      } catch {}
      kick();
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      release();
      pressed = true;
      pid = e.pointerId;
      moved = 0;
      y0 = e.clientY;
      th0 = theta;
      // 止まっていない回転は、触れた所で止める
      if (spinning || snapTo !== null) {
        spinning = false;
        snapTo = null;
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!pressed && !dragging) return;
      if (!dragging) {
        if (Math.abs(e.clientY - y0) < 5) return;
        startDrag(e);
      }
      const degPerPx = (180 / Math.PI) / R();
      theta = th0 - (e.clientY - y0) * degPerPx;
      moved = Math.max(moved, Math.abs(e.clientY - y0));
      const now = performance.now();
      const dts = (now - lastTs) / 1000;
      if (dts > 0) vel = vel * 0.6 + ((-(e.clientY - lastY) * degPerPx) / dts) * 0.4;
      lastY = e.clientY;
      lastTs = now;
      kick();
    };
    const onUp = () => {
      pressed = false;
      if (!dragging) return;
      dragging = false;
      drum.classList.remove("is-grab");
      if (performance.now() - lastTs > 120) vel = 0;
      if (Math.abs(vel) > 90) {
        omega = clamp(vel, -1500, 1500);
        spinning = true;
      } else {
        snapTo = Math.round(theta / step) * step;
      }
      kick();
    };
    const onClick = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    drum.addEventListener("pointerdown", onDown);
    drum.addEventListener("pointermove", onMove);
    drum.addEventListener("pointerup", onUp);
    drum.addEventListener("pointercancel", onUp);
    drum.addEventListener("click", onClick, true);

    // 見出しの帯・写真: 見える所に来たら動かす
    const secs = Array.from(root.querySelectorAll<HTMLElement>("[data-bb-sec]"));
    const io = new IntersectionObserver(
      (es) => es.forEach((en) => en.isIntersecting && en.target.classList.add("is-in")),
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );
    secs.forEach((s) => io.observe(s));
    const pars = Array.from(root.querySelectorAll<HTMLElement>("[data-bb-par]"));
    const par = () => {
      const vh = window.innerHeight;
      pars.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;
        el.style.setProperty("--py", `${(((r.top + r.height / 2) / vh - 0.5) * -26).toFixed(1)}px`);
      });
    };
    par();
    window.addEventListener("scroll", par, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", par);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      root.removeEventListener("toggle", onResize, true);
      drum.removeEventListener("pointerdown", onDown);
      drum.removeEventListener("pointermove", onMove);
      drum.removeEventListener("pointerup", onUp);
      drum.removeEventListener("pointercancel", onUp);
      drum.removeEventListener("click", onClick, true);
    };
  }, []);
  return null;
}
