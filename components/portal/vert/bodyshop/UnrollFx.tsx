"use client";
/**
 * 案 A「広げる」の動き(データは持たない。サーバーが出した DOM に付ける)。
 *  - 最初の画面より下の面: 画面の上から 78% の線を、広げた端とする。端が面の上から下へ進むほど --u が 0 → 1 になり、マットが転がって広がる。
 *    巻きの回転 --th はスクロール量に比例(転がりながら進む)。面の上端が近づくまで巻きは見せない(--arr。画面の下に半分だけ見える棒を出さない)。
 *  - 最初の画面: CSS の動き(約 3.4 秒)で転がって広がり、そのあとも巻きは回り続ける。巻きは太く、つかめる範囲も広い(上下 40px)。
 *    つかんで上へ引くと巻き戻り、離すと、ばね(重さと勢いがある)でゆっくり転がって元へ戻る。静かなときは、ときどき小さく引いて見せる。
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
    const wrap = hero?.parentElement ?? null;
    const last = new Map<HTMLElement, number>();
    let vh = window.innerHeight;
    let raf = 0;
    let dragging = false;
    let used = false;
    let spring = 0;
    let tugTimer = 0;

    const apply = () => {
      raf = 0;
      const y = window.scrollY;
      secs.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        // 節ごとに、巻き解け方の速さを少し変える(速め・ふつう・遅め)。広げた端は画面の上から 80% の線より下へ出さない(巻きが下端で切れない)
        const H = Math.max(1, r.height);
        const lin = clamp((vh * 0.78 - r.top) / H, 0, 1);
        const u = Math.min(Math.pow(lin, [1, 0.82, 1.2][i % 3]), clamp((vh * 0.8 - r.top) / H, 0, 1));
        const umin = Math.min(0.04, 24 / H); // 巻きが面の上端から離れすぎない(背の高い面でも、巻きの位置は上端から 24px まで)
        const edgeY = r.top + Math.max(u, umin) * H;
        if (el.dataset.um !== umin.toFixed(4)) {
          el.dataset.um = umin.toFixed(4);
          el.style.setProperty("--umin", umin.toFixed(4));
        }
        const prev = last.get(el);
        if (prev === undefined || Math.abs(prev - u) > 0.0008) {
          el.style.setProperty("--u", u.toFixed(4));
          last.set(el, u);
        }
        if (r.bottom > -100 && r.top < vh + 100) {
          el.style.setProperty("--th", (y / 26 + i * 1.7).toFixed(3));
          el.style.setProperty("--arr", clamp((vh * 0.86 - edgeY) / (vh * 0.05), 0, 1).toFixed(3)); // 巻きが画面に全部入ってから見せる(下端で半分切れない)
        }
      });
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

    // 最初の画面: 開く動きが終わったら、巻きは自分で回り続ける
    const onEnd = () => {
      if (!hero || dragging) return;
      hero.style.setProperty("--u", "1");
      hero.style.setProperty("--th", "16");
      hero.classList.add("is-free");
      scheduleTug(1400);
    };
    hero?.addEventListener("animationend", onEnd);
    // 読み込みが遅く、開く動きがもう終わっているとき(animationend を取りこぼす)も、すぐ引き継ぐ
    if (hero && hero.getAnimations().every((a) => a.playState === "finished")) onEnd();

    // ばね: u を 1(広げ切った)へ。勢い vel(1 秒あたり)を持つ。離したあと・小さく引いて見せるときに使う
    const roll = hero?.querySelector<HTMLElement>(".ba-roll") ?? null;
    let uNow = 1;
    let h = 1;
    const setU = (u: number) => {
      uNow = u;
      hero?.style.setProperty("--u", u.toFixed(4));
      if (dragging || spring) hero?.style.setProperty("--th", (16 + (u * h) / 24).toFixed(3));
    };
    const runSpring = (v0: number) => {
      cancelAnimationFrame(spring);
      let vel = v0;
      let t0 = performance.now();
      const step = (now: number) => {
        const dt = Math.min(0.04, (now - t0) / 1000);
        t0 = now;
        const k = 15;
        const c = 2.3;
        vel += (-k * (uNow - 1) - c * vel) * dt;
        let nu = uNow + vel * dt;
        if (nu <= 0.04) {
          nu = 0.04;
          vel = -vel * 0.4;
        } else if (nu > 1.1) {
          nu = 1.1;
          vel = -vel * 0.3;
        }
        setU(nu);
        if (Math.abs(1 - nu) < 0.0015 && Math.abs(vel) < 0.02) {
          spring = 0;
          setU(1);
          hero?.classList.remove("is-drag");
          hero?.classList.add("is-free");
          if (!used) scheduleTug(7000);
          return;
        }
        spring = requestAnimationFrame(step);
      };
      spring = requestAnimationFrame(step);
    };
    function scheduleTug(ms: number) {
      window.clearTimeout(tugTimer);
      if (used) return;
      tugTimer = window.setTimeout(() => {
        if (used || dragging || !hero) return;
        const r = hero.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return scheduleTug(4000);
        h = r.height;
        hero.classList.add("is-drag"); // 開く動きの CSS を止めて、ばねで小さく引く
        runSpring(-0.55);
      }, ms);
    }

    // 巻きをつかむ(PC のマウス・スマホの指)
    let u0 = 1;
    let y0 = 0;
    let lastY = 0;
    let lastT = 0;
    let vel = 0;
    const onDown = (e: PointerEvent) => {
      if (!hero || e.button !== 0) return;
      e.preventDefault(); // 文字の選択・ページのスクロールを始めない
      cancelAnimationFrame(spring);
      spring = 0;
      window.clearTimeout(tugTimer);
      const cs = parseFloat(getComputedStyle(hero).getPropertyValue("--u"));
      u0 = Number.isFinite(cs) ? cs : 1;
      hero.classList.add("is-drag", "is-free");
      dragging = true;
      used = true;
      wrap?.classList.add("is-used");
      h = hero.getBoundingClientRect().height;
      y0 = e.clientY;
      lastY = e.clientY;
      lastT = performance.now();
      vel = 0;
      setU(u0);
      try {
        roll?.setPointerCapture(e.pointerId);
      } catch {}
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = (now - lastT) / 1000;
      const nu = clamp(u0 + (e.clientY - y0) / h, 0.04, 1.1);
      if (dt > 0.004) vel = vel * 0.5 + (((e.clientY - lastY) / h) / dt) * 0.5;
      lastY = e.clientY;
      lastT = now;
      setU(nu);
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      if (performance.now() - lastT > 170) vel = 0;
      runSpring(clamp(vel * 1.25, -5, 5));
    };
    roll?.addEventListener("pointerdown", onDown);
    roll?.addEventListener("pointermove", onMove);
    roll?.addEventListener("pointerup", onUp);
    roll?.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(spring);
      window.clearTimeout(tugTimer);
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
