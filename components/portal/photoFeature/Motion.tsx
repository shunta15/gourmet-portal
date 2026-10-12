"use client";
import { useEffect } from "react";
import Lightbox from "./Lightbox";

/**
 * 写真が主役の特集記事（試作）の動き。動かすのは transform・opacity・clip-path（と、「続きを読む」の高さ）だけ。
 * スクロールは passive リスナーで受けて、requestAnimationFrame 1 回にまとめる（読む → 書く の順。レイアウトの読み書きを混ぜない）。
 * 現れる動きは IntersectionObserver（画面に入ったとき 1 回）。effect の後始末（リスナー・observer・rAF・クラス・付けた属性）は全部戻す
 * （Strict Mode の二重実行・ページを移って戻ったときも、もう一度 最初から動く）。
 *
 *  1. 巻頭: 写真と題の札が、スクロールで違う速さでずれる（--hy / --ty。PC だけ）。常時の動き（ゆっくり）は CSS
 *  2. 読み進みの印: 画面の端の朱の線（--prog）と、いまの視点の番号（めくれる）
 *  3. 視点ごとの写真の現れ方: [data-rvw].in を付ける（仕組みは CSS）。写真の中身が流れる（data-par）は --py を入れる
 *  4. 画面に留める場面（.pf-stack）: スクロールの進みで、重なった写真が 1 枚ずつ入れ替わる（--t / --d）
 *  6. 「続きを読む」: 高さがなめらかに開く（Web Animations）
 *  8. 近づくと少し反応するボタン（.pf-mag）、店ページへの小さなボタンの出し入れ
 * 「動きを減らす」設定では、現れ・ずれ・留める場面・読み進みの印は何もしない（最初から全部見える）。大きく見る幕（Lightbox）と、「続きを読む」は動かずに使える。
 */
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

export default function Motion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".pf-root");
    if (!root) return;
    const cleanups: (() => void)[] = [];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrowMq = window.matchMedia("(max-width: 760px)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // ───── 「続きを読む」: 高さがなめらかに開く・閉じる（JS が無ければ details のまま） ─────
    const anims = new Set<Animation>();
    const onSummary = (e: MouseEvent) => {
      const sum = (e.target as HTMLElement | null)?.closest("summary");
      const det = sum?.parentElement;
      if (!sum || !det || det.tagName !== "DETAILS" || !root.contains(det)) return;
      const body = det.querySelector<HTMLElement>(".pf-more__b");
      if (reduce || !body || typeof body.animate !== "function") return; // そのまま details が開閉する
      e.preventDefault();
      const opening = !(det as HTMLDetailsElement).open;
      const run = (from: number, to: number, done: () => void) => {
        const a = body.animate([{ height: `${from}px`, opacity: from < to ? 0 : 1 }, { height: `${to}px`, opacity: from < to ? 1 : 0 }], { duration: 480, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" });
        anims.add(a);
        a.onfinish = () => {
          anims.delete(a);
          done();
        };
        a.oncancel = () => anims.delete(a);
      };
      if (opening) {
        (det as HTMLDetailsElement).open = true;
        const h = body.getBoundingClientRect().height;
        run(0, h, () => undefined);
      } else {
        const h = body.getBoundingClientRect().height;
        run(h, 0, () => {
          (det as HTMLDetailsElement).open = false;
        });
      }
    };
    root.addEventListener("click", onSummary);
    cleanups.push(() => {
      root.removeEventListener("click", onSummary);
      anims.forEach((a) => a.cancel());
      anims.clear();
    });

    // ───── 近づくと少し反応するボタン（マウスのときだけ。タッチは、画面に入ったとき光る） ─────
    const mags = Array.from(root.querySelectorAll<HTMLElement>(".pf-mag"));
    let mx = -1e4;
    let my = -1e4;
    let magRaf = 0;
    const magFrame = () => {
      magRaf = 0;
      const rs = mags.map((b) => b.getBoundingClientRect());
      mags.forEach((b, i) => {
        const r = rs[i];
        if (r.width === 0) return;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const R = 120 + r.width / 2;
        const d = Math.hypot(dx, dy);
        if (d < R) {
          const k = 1 - d / R;
          b.style.setProperty("--mx", `${clamp(dx * 0.16, -9, 9).toFixed(1)}px`);
          b.style.setProperty("--my", `${clamp(dy * 0.22, -7, 7).toFixed(1)}px`);
          b.style.setProperty("--ms", (1 + 0.05 * k).toFixed(3));
        } else {
          b.style.removeProperty("--mx");
          b.style.removeProperty("--my");
          b.style.removeProperty("--ms");
        }
      });
    };
    if (!reduce && finePointer && mags.length) {
      const onMove = (e: PointerEvent) => {
        mx = e.clientX;
        my = e.clientY;
        if (!magRaf) magRaf = requestAnimationFrame(magFrame);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        if (magRaf) cancelAnimationFrame(magRaf);
        mags.forEach((b) => ["--mx", "--my", "--ms"].forEach((k) => b.style.removeProperty(k)));
      });
    }

    if (reduce) {
      return () => cleanups.forEach((f) => f());
    }

    // ───── ここから、動き（動きを減らす設定のときは何もしない） ─────
    root.classList.add("pf-js");
    cleanups.push(() => root.classList.remove("pf-js"));

    // 現れる（画面に入ったとき 1 回）: 文・筆の跡・朱の印は .pf-rv/.pf-rvb/.pf-rvs、写真の列は [data-rvw]
    const reveal = Array.from(root.querySelectorAll<HTMLElement>(".pf-rv, .pf-rvb, .pf-rvs, [data-rvw], .pf-info .pf-mag"));
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          if (el.classList.contains("pf-mag")) el.classList.add("pf-pulse");
          else el.classList.add("in");
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.04 },
    );
    reveal.forEach((el) => io.observe(el));
    cleanups.push(() => {
      io.disconnect();
      reveal.forEach((el) => el.classList.remove("in", "pf-pulse"));
    });

    // スクロールの連動
    const cover = root.querySelector<HTMLElement>(".pf-cover");
    const hud = root.querySelector<HTMLElement>(".pf-hud");
    const hudCur = root.querySelector<HTMLElement>(".pf-hud__cur");
    const hudPrev = root.querySelector<HTMLElement>(".pf-hud__prev");
    const fab = root.querySelector<HTMLElement>(".pf-fab");
    const info = root.querySelector<HTMLElement>(".pf-info");
    const body = root.querySelector<HTMLElement>(".pf-body");
    const secs = Array.from(root.querySelectorAll<HTMLElement>(".pf-body [data-no]"));
    const pars = Array.from(root.querySelectorAll<HTMLImageElement>("img[data-par]"));
    // 写真ごとの拡大の余白（--z）と、ずらし方は、最初に 1 回だけ読む（フレームごとに style を読まない）
    const parInfo = pars.map((im) => {
      const fig = im.parentElement as HTMLElement;
      const flow = im.dataset.par === "flow";
      return { flow, z: parseFloat(fig.style.getPropertyValue("--z")) || 1.04, k: flow ? 1 : Math.min(1, parseFloat(im.dataset.par || "0.5")) };
    });
    const stacks = Array.from(root.querySelectorAll<HTMLElement>("[data-stack]")).map((el) => ({ el, ph: Array.from(el.querySelectorAll<HTMLElement>(".pf-st")) }));
    let curNo = "";
    let raf = 0;

    const frame = () => {
      raf = 0;
      const vh = window.innerHeight;
      const y = window.scrollY;
      const narrow = narrowMq.matches;
      const docH = document.documentElement.scrollHeight;

      // ── 読む ──
      const parRects = pars.map((im) => (im.parentElement as HTMLElement).getBoundingClientRect());
      const stackRects = stacks.map((s) => s.el.getBoundingClientRect());
      const secRects = secs.map((s) => s.getBoundingClientRect());
      const infoTop = info ? info.getBoundingClientRect().top : Infinity;
      const bodyRect = body ? body.getBoundingClientRect() : null;

      // ── 書く ──
      // 1. 巻頭: 写真と題の札が、違う速さでずれる（PC だけ）
      if (cover) {
        if (!narrow && y < vh * 1.6) {
          cover.style.setProperty("--hy", `${(y * 0.16).toFixed(1)}px`);
          cover.style.setProperty("--ty", `${(-y * 0.1).toFixed(1)}px`);
        } else if (cover.style.getPropertyValue("--hy")) {
          cover.style.removeProperty("--hy");
          cover.style.removeProperty("--ty");
        }
      }
      // 3d. 写真の中身が、枠の中でゆっくり流れる（枠は動かない）。ほかの写真の視差は PC だけ（スマホは軽くする）
      pars.forEach((im, i) => {
        const { flow, z, k } = parInfo[i];
        if (narrow && !flow) return;
        const r = parRects[i];
        if (r.bottom < -200 || r.top > vh + 200) return;
        const p = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
        const maxShift = ((z - 1) / 2) * r.height * 0.9; // 枠の外が見えない範囲
        im.style.setProperty("--py", `${(-p * maxShift * k).toFixed(1)}px`);
      });
      // 4. 留める場面: 重なった写真が 1 枚ずつ入れ替わる
      stacks.forEach((s, i) => {
        const r = stackRects[i];
        const total = Math.max(1, r.height - vh);
        const p = clamp(-r.top / total);
        const n = s.ph.length;
        const u = p * (n - 1);
        s.ph.forEach((el, j) => {
          const t = j < n - 1 ? clamp(u - j) : 0;
          const d = Math.min(2, Math.max(0, j - u));
          // 直接 transform に書く（var() の計算を挟まない。写真は左へ送り出して舞台の外に出すので、opacity は動かさない）
          el.style.transform = `translate3d(${(t * -118).toFixed(2)}%, ${(t * -5).toFixed(2)}%, 0) rotate(${(t * -10 + j * 0.7 - 1).toFixed(2)}deg) scale(${(1 - d * 0.025).toFixed(4)})`;
        });
      });
      // 2. 読み進みの印
      if (hud) {
        const prog = clamp(y / Math.max(1, docH - vh));
        hud.style.setProperty("--prog", prog.toFixed(4));
        const span = Math.max(0, vh * 0.8 - 20);
        hudCur?.parentElement?.style.setProperty("--hy", `${(prog * span).toFixed(1)}px`);
        hud.classList.toggle("pf-hud--on", y > vh * 0.35);
        // いまの視点（画面の真ん中にかかっている区画。2 つの視点の区画は、下半分で 2 つめ）
        let no = "";
        for (let i = 0; i < secs.length; i++) {
          const r = secRects[i];
          if (r.top <= vh * 0.5 && r.bottom > vh * 0.5) {
            no = secs[i].dataset.no || "";
            const no2 = secs[i].dataset.no2;
            if (no2 && (vh * 0.5 - r.top) / Math.max(1, r.height) > 0.55) no = no2;
          }
        }
        if (bodyRect && (bodyRect.bottom < vh * 0.35 || bodyRect.top > vh * 0.65)) no = bodyRect.top > vh * 0.65 ? "" : no;
        if (no !== curNo) {
          const old = curNo;
          curNo = no;
          if (hudCur && hudPrev) {
            hudPrev.textContent = old;
            hudCur.textContent = no;
            hudPrev.classList.remove("is-out");
            hudCur.classList.remove("is-in");
            void hudCur.offsetWidth;
            if (old) hudPrev.classList.add("is-out");
            if (no) hudCur.classList.add("is-in");
          }
        }
      }
      // 8. 店ページへの小さなボタンの出し入れ
      if (fab) fab.classList.toggle("pf-fab--on", y > vh * 0.9 && infoTop > vh * 0.9);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    ro?.observe(document.body);
    schedule();
    cleanups.push(() => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
      pars.forEach((im) => im.style.removeProperty("--py"));
      stacks.forEach((s) =>
        s.ph.forEach((el) => {
          el.style.removeProperty("transform");
        }),
      );
      cover?.style.removeProperty("--hy");
      cover?.style.removeProperty("--ty");
      hud?.classList.remove("pf-hud--on");
      hud?.style.removeProperty("--prog");
      fab?.classList.remove("pf-fab--on");
    });

    return () => cleanups.forEach((f) => f());
  }, []);
  return <Lightbox />;
}
