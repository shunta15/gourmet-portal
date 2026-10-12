"use client";
/**
 * 案 6「まわる」: 最初の画面の背景が、縦に並んだ細長い回転板(4 面: 赤・ピンク・水色・黒)になっている。
 *  - 開いた瞬間: 板が左から順にくるくる回って赤い面になる(これは CSS だけ。JS が無くても動く)。そのあとも板はゆらゆら揺れ続ける
 *  - なぞる: ポインタが通った板が、通った向きに傾いて揺り戻す(隣の板にも波が伝わる)。押さえて横になぞると、板がついてきて回る。離すと一番近い面で止まる
 *  - タップ: 押した所から順に、板がぱたぱたと次の面へ返る。しばらく触らないと、赤い面へ波のように戻る
 *  - 傾ける/動かす: 見る位置(perspective-origin)がずれて、板の厚みが見える
 *  - スクロール: 左から順に回り、赤 → ピンク → 水色 → 黒の順に面が替わる
 * 板を回すのは transform(rotateY)と影の opacity だけ。rAF は動いている間だけ。
 * 面の色が明るい(ピンク・水色)間は、見出しの色を黒にする(data-ink)。「動きを減らす」設定のときは何もしない(CSS が板を隠して赤い面のまま)。
 */
import { useEffect, useRef } from "react";

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const ease = (u: number) => u * u * (3 - 2 * u);

export default function HeroSlats() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const hero = ref.current?.closest<HTMLElement>(".cp-hero");
    const field = hero?.querySelector<HTMLElement>(".hr-slats");
    if (!hero || !field) return;
    const heroEl: HTMLElement = hero;
    const fieldEl: HTMLElement = field;
    const slats = Array.from(field.querySelectorAll<HTMLElement>(".hr-s"));
    const shades = Array.from(hero.querySelectorAll<HTMLElement>(".hr-shades i"));
    const N = slats.length;
    if (!N) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const a = new Float64Array(N); // いまの角度
    const v = new Float64Array(N); // 角度の速さ
    const base = new Float64Array(N); // 止まる角度(90 の倍数。なぞっている間は動く)
    const at = new Float64Array(N); // 予約: この時刻になったら add を足す
    const add = new Float64Array(N);
    const tg = new Float64Array(N);

    let on = false;
    let raf = 0;
    let visible = true;
    let last = 0;
    let W = 1, H = 1, sw = 1, ap = 1;
    let o = 0;
    let pressed = false;
    let moved = 0;
    let downX = 0, downT = 0, lastX = -1;
    let ox = 0.5, oy = 0.5, cx = 0.5, cy = 0.5; // 見る位置(0〜1)
    let idleAt = 0;
    let ink = "light";
    let autoUntil = 0; // 自動の「1 周」の間は、見出しの色を替えない
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let timer = 0;
    let oriOn = false;
    let oriT = 0;

    const measure = () => {
      W = hero.clientWidth;
      H = hero.clientHeight;
      sw = W / N;
      ap = Math.max(1, (slats[0].offsetWidth || sw) / 2);
    };

    const kick = () => {
      if (on && visible && !raf && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const rippleFrom = (x: number, step: number, ms: number) => {
      const now = performance.now();
      const c = clamp(Math.floor(x / sw), 0, N - 1);
      for (let i = 0; i < N; i++) {
        at[i] = now + Math.abs(i - c) * ms;
        add[i] += step;
      }
      kick();
    };
    const goHome = (from: number) => {
      const now = performance.now();
      const c = clamp(Math.floor(from / sw), 0, N - 1);
      for (let i = 0; i < N; i++) {
        const home = Math.round(base[i] / 360) * 360;
        if (Math.abs(home - base[i]) > 1) {
          at[i] = now + Math.abs(i - c) * 70;
          add[i] += home - base[i];
        }
      }
      kick();
    };

    function frame(now: number) {
      const hero = heroEl;
      const field = fieldEl;
      raf = 0;
      if (!on || !visible || document.hidden) return;
      const dt = Math.min(0.033, last ? (now - last) / 1000 : 0.016);
      last = now;
      const r = hero.getBoundingClientRect();
      o = clamp(-r.top / Math.max(r.height, 1));
      const pn = performance.now();
      let moving = false;
      let light = 0;
      for (let i = 0; i < N; i++) {
        if (add[i] !== 0 && pn >= at[i]) {
          base[i] += add[i];
          add[i] = 0;
        }
        tg[i] = base[i] + 270 * ease(clamp((o * 1.35 - (i / Math.max(1, N - 1)) * 0.35) / 0.6));
      }
      for (let i = 0; i < N; i++) {
        const e = a[i] - tg[i];
        const lf = i > 0 ? a[i - 1] - tg[i - 1] : e;
        const rt = i < N - 1 ? a[i + 1] - tg[i + 1] : e;
        v[i] += (-72 * e - 8.5 * v[i] + 20 * ((lf + rt) * 0.5 - e)) * dt;
        a[i] += v[i] * dt;
        const off = ((a[i] % 90) + 90) % 90;
        const sh = 0.15 * (1 - Math.cos((off * Math.PI * 2) / 90));
        slats[i].style.transform = `translateZ(${(-ap).toFixed(1)}px) rotateY(${a[i].toFixed(2)}deg)`;
        if (shades[i]) shades[i].style.opacity = sh.toFixed(3);
        const f = ((Math.round(a[i] / 90) % 4) + 4) % 4;
        if ((f === 1 || f === 2) && (off < 28 || off > 62)) light++;
        if (Math.abs(e) > 0.04 || Math.abs(v[i]) > 0.4 || add[i] !== 0) moving = true;
      }
      const nink = light >= N * 0.6 ? "dark" : light <= N * 0.4 ? "light" : ink;
      if (nink !== ink && pn >= autoUntil) {
        ink = nink;
        hero.dataset.ink = ink;
      }
      // 見る位置: ポインタ/傾きに合わせてゆっくり追う
      cx += (ox - cx) * Math.min(1, dt * 5);
      cy += (oy - cy) * Math.min(1, dt * 5);
      field.style.perspectiveOrigin = `${(50 + (cx - 0.5) * 36).toFixed(2)}% ${(45 + (cy - 0.5) * 18).toFixed(2)}%`;
      if (Math.abs(ox - cx) > 0.002 || Math.abs(oy - cy) > 0.002) moving = true;
      if (moving || pressed) raf = requestAnimationFrame(frame);
      else {
        // 止まったら、角度の数字が大きくなりすぎないよう 360 で畳む
        for (let i = 0; i < N; i++) {
          const k = Math.floor(base[i] / 360);
          if (k !== 0 && o < 0.001) { base[i] -= k * 360; a[i] -= k * 360; }
        }
      }
    }

    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      ox = clamp(x / r.width);
      oy = clamp(y / r.height);
      const dx = lastX < 0 ? 0 : x - lastX;
      lastX = x;
      idleAt = performance.now();
      if (pressed) {
        moved += Math.abs(dx);
        for (let i = 0; i < N; i++) {
          const g = Math.exp(-Math.pow((x - (i + 0.5) * sw) / (2.2 * sw), 2));
          base[i] += dx * 0.85 * g;
        }
      } else if (e.pointerType === "mouse" || e.pointerType === "pen") {
        for (let i = 0; i < N; i++) {
          const g = Math.exp(-Math.pow((x - (i + 0.5) * sw) / (1.4 * sw), 2));
          v[i] += dx * 7 * g;
        }
      }
      kick();
    };
    const onDown = (e: PointerEvent) => {
      pressed = true;
      moved = 0;
      downT = performance.now();
      const r = hero.getBoundingClientRect();
      downX = e.clientX - r.left;
      lastX = downX;
      idleAt = downT;
      if (e.pointerType === "touch") askOrientation();
      kick();
    };
    const onUp = () => {
      if (!pressed) return;
      pressed = false;
      lastX = -1;
      idleAt = performance.now();
      if (moved < 10 && performance.now() - downT < 400) {
        rippleFrom(downX, 90, 55);
      } else {
        for (let i = 0; i < N; i++) {
          // 勢いの向きに少し先まで行って、一番近い面で止まる
          base[i] = Math.round((base[i] + v[i] * 0.12) / 90) * 90;
        }
      }
      kick();
    };
    const onLeave = () => { lastX = -1; };
    const onScroll = () => kick();
    const onOri = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      ox = clamp(0.5 + e.gamma / 60);
      oy = clamp(0.5 + (e.beta - 50) / 80);
      oriT = performance.now();
      kick();
    };
    const addOri = () => {
      if (oriOn) return;
      oriOn = true;
      window.addEventListener("deviceorientation", onOri, { passive: true });
    };
    const askOrientation = () => {
      const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
      if (D && typeof D.requestPermission === "function" && !oriOn) D.requestPermission().then((s) => s === "granted" && addOri()).catch(() => {});
    };
    const onVis = () => (document.hidden ? undefined : kick());

    // 9 秒ごとの見せ場(触っていないとき): 左から順に 1 周
    const tick = () => {
      if (!on || !visible || document.hidden || pressed) return;
      const n = performance.now();
      if (o > 0.02) return;
      if (n - idleAt > 2000 && n - oriT > 1500) {
        let off = false;
        for (let i = 0; i < N; i++) if (Math.abs(base[i] - Math.round(base[i] / 360) * 360) > 1) off = true;
        if (off) { goHome(ox * W); idleAt = n; return; }
      }
      if (n - idleAt > 9000) {
        idleAt = n;
        autoUntil = n + 2600;
        rippleFrom(0, 360, 70);
      }
    };

    const start = () => {
      if (on) return;
      on = true;
      idleAt = performance.now();
      measure();
      hero.addEventListener("pointermove", onMove, { passive: true });
      hero.addEventListener("pointerdown", onDown, { passive: true });
      hero.addEventListener("pointerup", onUp, { passive: true });
      hero.addEventListener("pointercancel", onUp, { passive: true });
      hero.addEventListener("pointerleave", onLeave, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("visibilitychange", onVis);
      const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } }).DeviceOrientationEvent;
      if (D && typeof D.requestPermission !== "function") addOri();
      ro = new ResizeObserver(() => { measure(); kick(); });
      ro.observe(hero);
      io = new IntersectionObserver((es) => {
        visible = es[es.length - 1].isIntersecting;
        if (visible) kick();
      });
      io.observe(hero);
      timer = window.setInterval(tick, 800);
      kick();
    };
    const stop = () => {
      if (!on) return;
      on = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      window.clearInterval(timer);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerdown", onDown);
      hero.removeEventListener("pointerup", onUp);
      hero.removeEventListener("pointercancel", onUp);
      hero.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("deviceorientation", onOri);
      oriOn = false;
      document.removeEventListener("visibilitychange", onVis);
      ro?.disconnect();
      io?.disconnect();
      ro = null; io = null;
      slats.forEach((s) => s.style.removeProperty("transform"));
      shades.forEach((s) => s.style.removeProperty("opacity"));
      field.style.removeProperty("perspective-origin");
      hero.dataset.ink = "light";
      a.fill(0); v.fill(0); base.fill(0); add.fill(0);
    };
    const onMq = () => (mq.matches ? stop() : start());

    if (!mq.matches) start();
    mq.addEventListener("change", onMq);
    return () => {
      mq.removeEventListener("change", onMq);
      stop();
    };
  }, []);

  return <span ref={ref} hidden />;
}
