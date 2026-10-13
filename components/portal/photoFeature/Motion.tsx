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

    // ───── 小見出しと文の札が重ならないようにする（PC。動きを減らす設定でも働く） ─────
    // 小見出し（縦書きの白抜き・短冊）が長く、同じ側の文の札の上端より下まで伸びるときだけ、その視点の小見出しを反対側の端へ移す（.pf-flip）。
    // 札の「現れる」の 22px のずれなど、動きの変形は引いて、並びそのものの位置で比べる。重ならなければ、何もしない（元の並びのまま）。
    const tyOf = (el: Element) => {
      const t = getComputedStyle(el).transform;
      if (!t || t === "none") return 0;
      try {
        return new DOMMatrixReadOnly(t).m42;
      } catch {
        return 0;
      }
    };
    const shiftOf = (el: Element, stop: Element) => {
      let sum = 0;
      for (let n: Element | null = el; n && n !== stop; n = n.parentElement) sum += tyOf(n);
      return sum;
    };
    const fitHeads = () => {
      root.querySelectorAll<HTMLElement>(".pf-v--A, .pf-v--B").forEach((v) => {
        v.classList.remove("pf-flip");
        const tx = v.querySelector<HTMLElement>(".pf-v__tx");
        const hd = v.querySelector<HTMLElement>(".pf-ov, .pf-tz");
        if (!tx || !hd) return;
        if (getComputedStyle(tx).backgroundColor === "rgba(0, 0, 0, 0)") return; // 札ではない（スマホ・縦長の写真は、文が写真の外）
        const cr = tx.getBoundingClientRect();
        const cardTop = cr.top - shiftOf(tx, v);
        let hb = -Infinity;
        let hl = Infinity;
        let hr = -Infinity;
        hd.querySelectorAll<HTMLElement>(".pf-col").forEach((c) => {
          const r = c.getBoundingClientRect();
          if (r.width < 1) return;
          hb = Math.max(hb, r.bottom - shiftOf(c, v));
          hl = Math.min(hl, r.left);
          hr = Math.max(hr, r.right);
        });
        if (hb === -Infinity) return;
        if (Math.min(hr, cr.right) - Math.max(hl, cr.left) > 2 && hb > cardTop - 10) v.classList.add("pf-flip");
      });
    };
    fitHeads();
    const onFit = () => fitHeads();
    window.addEventListener("resize", onFit, { passive: true });
    const roFit = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onFit) : null;
    roFit?.observe(document.body);
    void document.fonts?.ready.then(onFit);
    cleanups.push(() => {
      window.removeEventListener("resize", onFit);
      roFit?.disconnect();
      root.querySelectorAll(".pf-flip").forEach((e) => e.classList.remove("pf-flip"));
    });

    if (reduce) {
      return () => cleanups.forEach((f) => f());
    }

    // ───── ここから、動き（動きを減らす設定のときは何もしない） ─────
    root.classList.add("pf-js");
    cleanups.push(() => root.classList.remove("pf-js"));

    // 現れる（画面に入ったとき 1 回）: 文・筆の跡・朱の印は .pf-rv/.pf-rvb/.pf-rvs、写真の列は [data-rvw]
    const reveal = Array.from(root.querySelectorAll<HTMLElement>(".pf-rv, .pf-rvb, .pf-rvs, [data-rvw], .pf-nr, .pf-info .pf-mag"));
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
    const coverPh = cover?.querySelector<HTMLElement>(".pf-cover__ph") ?? null;
    const coverCap = cover?.querySelector<HTMLElement>(".pf-cover__cap") ?? null;
    const coverLede = root.querySelector<HTMLElement>(".pf-lede");
    const hud = root.querySelector<HTMLElement>(".pf-hud");
    const hudCur = root.querySelector<HTMLElement>(".pf-hud__cur");
    const hudPrev = root.querySelector<HTMLElement>(".pf-hud__prev");
    const fab = root.querySelector<HTMLElement>(".pf-fab");
    const fabTargets = Array.from(root.querySelectorAll<HTMLElement>(".pf-v__tx p, .pf-v__tx summary, .pf-lede__in p, .pf-closing p, .pf-quote p, .pf-dl, .pf-info__t, .pf-tz, .pf-ov .pf-vt, .pf-nr, .pf-cover__cap, .pf-cover__t, .pf-btn, .pf-door, .pf-hd, .pf-more__b p")).filter((el) => !el.closest(".pf-fab"));
    const info = root.querySelector<HTMLElement>(".pf-info");
    const body = root.querySelector<HTMLElement>(".pf-body");
    const secs = Array.from(root.querySelectorAll<HTMLElement>(".pf-body [data-no], .pf-body [data-nos]"));
    const pars = Array.from(root.querySelectorAll<HTMLImageElement>("img[data-par]"));
    // 写真ごとの拡大の余白（--z）と、ずらし方は、最初に 1 回だけ読む（フレームごとに style を読まない）
    const parInfo = pars.map((im) => {
      const fig = im.parentElement as HTMLElement;
      const flow = im.dataset.par === "flow";
      return { flow, z: parseFloat(fig.style.getPropertyValue("--z")) || 1.04, k: flow ? 1 : Math.min(1, parseFloat(im.dataset.par || "0.5")) };
    });
    const stacks = Array.from(root.querySelectorAll<HTMLElement>("[data-stack]")).map((el) => {
      const ph = Array.from(el.querySelectorAll<HTMLElement>(".pf-st"));
      return { el, ph, ov: ph.map((f) => f.querySelector<HTMLElement>(".pf-ov")) };
    });
    // 暖簾らしさの連動: 竿と進みの布・暗い面の灯り・写真の傾きと照り・横に流れる帯・伸び縮みする飾り・数え上がる数字
    const rod = root.querySelector<HTMLElement>(".pf-rod");
    const darks = Array.from(root.querySelectorAll<HTMLElement>(".pf-dark")).map((el) => ({ el, lamp: el.querySelector<HTMLElement>(".pf-lamp i"), cx: 0, cy: 0, init: false, vx: 0, vy: 0, lr: 340 }));
    const films = Array.from(root.querySelectorAll<HTMLElement>("[data-film]")).map((el) => ({ el, track: el.querySelector<HTMLElement>(".pf-film__track"), travel: 0 }));
    const scrubs = Array.from(root.querySelectorAll<SVGElement>("[data-scrub]"));
    const figs = pars.map((im) => im.parentElement as HTMLElement);
    const darkOf = figs.map((f) => darks.findIndex((d) => d.el.contains(f)));
    const fst = figs.map(() => ({ ax: 0, ay: 0, lit: 0, lx: 0, ly: 0, on: false }));
    let px = -1e4;
    let py = -1e4;
    let lastY = window.scrollY;
    let vyS = 0;
    let curNo = "";
    let raf = 0;
    const sizeFilms = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const narrow = narrowMq.matches;
      films.forEach((f) => {
        if (!f.track) return;
        if (narrow) {
          f.el.style.height = "";
          f.track.style.transform = "";
          f.travel = 0;
          return;
        }
        const travel = Math.max(0, f.track.scrollWidth - vw + 60);
        f.travel = travel;
        // 横へ流れる分だけ、画面に留める（最大 2 画面ぶん）
        f.el.style.height = `${Math.round(vh + Math.min(2 * vh, Math.max(0.8 * vh, travel * 0.9)))}px`;
      });
      darks.forEach((d) => {
        if (d.lamp) d.lr = d.lamp.offsetWidth / 2 || 340;
      });
    };
    sizeFilms();
    // 店の案内の数字: 画面に入ったとき、0 から数え上がる（データにある数字だけ。終わったら元の文字に戻す）
    const nums = Array.from(root.querySelectorAll<HTMLElement>(".pf-num"));
    let countRaf = 0;
    const counted = new Set<HTMLElement>();
    const runCount = () => {
      nums.forEach((n) => {
        n.dataset.txt = n.textContent || "";
        n.style.minWidth = `${n.getBoundingClientRect().width}px`;
        n.style.display = "inline-block";
        n.textContent = "0";
      });
      const t0 = performance.now();
      const step = (now: number) => {
        const k = clamp((now - t0) / 1200);
        const e = 1 - Math.pow(1 - k, 3);
        nums.forEach((n) => {
          const to = parseInt(n.dataset.to || "0", 10);
          const v = Math.round(to * e);
          n.textContent = n.dataset.comma ? v.toLocaleString("en-US") : String(v);
        });
        if (k < 1) countRaf = requestAnimationFrame(step);
        else nums.forEach((n) => { n.textContent = n.dataset.txt || n.textContent; n.style.minWidth = ""; n.style.display = ""; });
      };
      countRaf = requestAnimationFrame(step);
    };
    const dl = root.querySelector<HTMLElement>(".pf-dl");
    const countIo = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting && !counted.has(e.target as HTMLElement)) {
            counted.add(e.target as HTMLElement);
            countIo.disconnect();
            runCount();
          }
        }
      },
      { threshold: 0.3 },
    );
    if (dl && nums.length) countIo.observe(dl);

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
      const filmRects = films.map((f) => f.el.getBoundingClientRect());
      const darkRects = darks.map((d) => d.el.getBoundingClientRect());
      const scrubRects = scrubs.map((el) => el.getBoundingClientRect());
      vyS = vyS * 0.85 + (y - lastY) * 0.15;
      lastY = y;

      // ── 書く ──
      // 1. 巻頭: 写真と題の札が、違う速さでずれる（PC だけ）
      if (cover) {
        if (!narrow && y < vh * 1.6) {
          // 写真が下へずれる量は、写真の下（店名の札・導入の文）の字に乗らない範囲まで（巻頭の写真の下端 = 変形の前の位置。札・導入の上端 = 変形しない）。余白が大きければ、今までどおり y × 0.16
          let hy = y * 0.16;
          const ph = coverPh;
          if (ph) {
            const below = [coverCap, coverLede].map((el) => (el ? el.getBoundingClientRect().top : Infinity)).reduce((m, v) => Math.min(m, v), Infinity);
            const natBottom = cover.getBoundingClientRect().top + ph.offsetTop + ph.offsetHeight;
            if (Number.isFinite(below)) hy = Math.min(hy, Math.max(0, below - natBottom - 6));
          }
          cover.style.setProperty("--hy", `${hy.toFixed(1)}px`);
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
        if (narrow) {
          // スマホは留めない（横にはらう帯）。送り出しの変形を戻す
          s.ph.forEach((el, j) => {
            if (el.style.transform) el.style.removeProperty("transform");
            s.ov[j]?.style.removeProperty("opacity");
          });
          return;
        }
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
          // 小見出しは、いちばん上の写真のものだけ（入れ替わる途中で、2 つの小見出しが重ならない）
          const ov = s.ov[j];
          if (ov) ov.style.opacity = (clamp(1 - t * 6) * clamp(1 - d * 4)).toFixed(3);
        });
      });
      // 横に流れる帯: 縦のスクロールが、写真の列の横送りになる
      films.forEach((f, i) => {
        if (!f.track || f.travel <= 0) return;
        const r = filmRects[i];
        const p = clamp(-r.top / Math.max(1, r.height - vh));
        f.track.style.transform = `translate3d(${(-p * f.travel).toFixed(1)}px, 0, 0)`;
      });
      // 暗い面: 提灯の灯りが、マウス（スマホはスクロールの位置）に合わせて動く
      let inDark = false;
      darks.forEach((d, i) => {
        const r = darkRects[i];
        if (r.top < vh * 0.5 && r.bottom > vh * 0.5) inDark = true;
        if (!d.lamp || r.bottom < -200 || r.top > vh + 200) return;
        const usePointer = finePointer && px > -1e3;
        const tx = usePointer ? px - r.left : r.width * (0.5 + 0.3 * Math.sin(y * 0.004 + i * 2));
        const ty = usePointer ? py - r.top : vh * 0.5 - r.top;
        if (!d.init) {
          d.cx = tx;
          d.cy = ty;
          d.init = true;
        }
        d.cx += (tx - d.cx) * 0.16;
        d.cy += (ty - d.cy) * 0.16;
        d.lamp.style.transform = `translate3d(${(d.cx - d.lr).toFixed(1)}px, ${(d.cy - d.lr).toFixed(1)}px, 0)`;
        d.vx = r.left + d.cx;
        d.vy = r.top + d.cy;
      });
      root.classList.toggle("is-dark", inDark);
      // 写真: 乗ると（PC）わずかに傾き、灯りの照りが動く。スマホはスクロールの速さでわずかに傾く。暗い面では、灯りに近い写真ほど明るく照らされる
      figs.forEach((f, i) => {
        const r = parRects[i];
        const st = fst[i];
        if (r.bottom < -100 || r.top > vh + 100) return;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        let tax = 0;
        let tay = 0;
        let tlit = 0;
        let tlx = 0;
        let tly = 0;
        if (finePointer && px > -1e3 && px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) {
          tax = clamp((px - cx) / (r.width / 2), -1, 1);
          tay = clamp((py - cy) / (r.height / 2), -1, 1);
          tlit = 1;
          tlx = tax * r.width * 0.5;
          tly = tay * r.height * 0.5;
        } else if (!finePointer) {
          tay = clamp(vyS * 0.03, -1, 1);
          tlit = clamp(Math.abs(vyS) * 0.04, 0, 0.8);
          tlx = clamp(vyS * 4, -r.width * 0.4, r.width * 0.4);
        }
        const di = darkOf[i];
        if (di >= 0 && darks[di].init) {
          const dx = darks[di].vx - cx;
          const dy = darks[di].vy - cy;
          const dist = Math.hypot(dx, dy);
          tlit = clamp(1.1 - dist / (Math.max(r.width, r.height) * 0.9 + 160), 0, 1);
          tlx = clamp(dx, -r.width * 0.9, r.width * 0.9);
          tly = clamp(dy, -r.height * 0.9, r.height * 0.9);
        }
        st.ax += (tax - st.ax) * 0.14;
        st.ay += (tay - st.ay) * 0.14;
        st.lit += (tlit - st.lit) * 0.14;
        st.lx += (tlx - st.lx) * 0.2;
        st.ly += (tly - st.ly) * 0.2;
        const active = Math.abs(st.ax) + Math.abs(st.ay) + st.lit > 0.004;
        if (!active && !st.on) return;
        st.on = active;
        const ang = Math.hypot(st.ax, st.ay) * (finePointer ? 2 : 1.4);
        f.style.rotate = active ? (finePointer ? `${(-st.ay).toFixed(3)} ${st.ax.toFixed(3)} 0 ${ang.toFixed(2)}deg` : `1 0 0 ${(st.ay * 1.4).toFixed(2)}deg`) : "";
        f.style.setProperty("--lit", st.lit.toFixed(3));
        f.style.setProperty("--lx", `${st.lx.toFixed(1)}px`);
        f.style.setProperty("--ly", `${st.ly.toFixed(1)}px`);
      });
      // 筆の跡・朱の印は、スクロールの位置に連動して伸び縮みする（止まった飾りにしない）
      scrubs.forEach((el, i) => {
        const r = scrubRects[i];
        if (r.bottom < -50 || r.top > vh + 50) return;
        const p = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2), -1, 1);
        const a = 1 - Math.abs(p);
        if (el.dataset.scrub === "brush") el.style.scale = `${(0.5 + 0.5 * a).toFixed(3)} 1`;
        else {
          el.style.scale = (0.88 + 0.22 * a).toFixed(3);
          el.style.rotate = `${(p * 16).toFixed(1)}deg`;
        }
      });
      // 2. 読み進みの印
      if (hud) {
        const prog = clamp(y / Math.max(1, docH - vh));
        hud.style.setProperty("--prog", prog.toFixed(4));
        if (rod) {
          rod.style.setProperty("--pp", prog.toFixed(4));
          rod.style.setProperty("--rs", `${clamp(vyS * 0.5, -10, 10).toFixed(2)}deg`);
        }
        const span = Math.max(0, vh * 0.8 - 20);
        void span;
        hud.classList.toggle("pf-hud--on", y > vh * 0.35);
        // いまの視点（画面の真ん中にかかっている区画。2 つの視点の区画は、下半分で 2 つめ）
        let no = "";
        for (let i = 0; i < secs.length; i++) {
          const r = secRects[i];
          if (r.top <= vh * 0.5 && r.bottom > vh * 0.5) {
            const nos = (secs[i].dataset.nos || secs[i].dataset.no || "").split(",");
            no = nos.length > 1 ? nos[Math.min(nos.length - 1, Math.floor(clamp((vh * 0.5 - r.top) / Math.max(1, r.height), 0, 0.999) * nos.length))] : nos[0];
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
      if (fab) {
        let on = y > vh * 0.9 && infoTop > vh * 0.9;
        // 本文・小見出しの字の上に重なるときは、出さない（字を隠さない）。字の枠（pointer-events が無い小見出しも含む）の位置で調べる
        if (on) {
          const r = fab.getBoundingClientRect();
          on = !fabTargets.some((el) => {
            const b = el.getBoundingClientRect();
            return b.width > 0 && b.bottom > 0 && b.top < vh && Math.min(b.right, r.right + 4) - Math.max(b.left, r.left - 4) > 0 && Math.min(b.bottom, r.bottom + 4) - Math.max(b.top, r.top - 4) > 0;
          });
        }
        fab.classList.toggle("pf-fab--on", on);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onPointer = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      schedule();
    };
    const onLeave = () => {
      px = -1e4;
      py = -1e4;
      schedule();
    };
    const onResize = () => {
      sizeFilms();
      schedule();
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    if (finePointer) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave, { passive: true });
    }
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    ro?.observe(document.body);
    schedule();
    cleanups.push(() => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      countIo.disconnect();
      if (countRaf) cancelAnimationFrame(countRaf);
      nums.forEach((n) => {
        if (n.dataset.txt) n.textContent = n.dataset.txt;
        n.style.minWidth = "";
        n.style.display = "";
      });
      films.forEach((f) => {
        f.el.style.height = "";
        f.track?.style.removeProperty("transform");
      });
      figs.forEach((f) => {
        f.style.removeProperty("rotate");
        ["--lit", "--lx", "--ly"].forEach((k) => f.style.removeProperty(k));
      });
      scrubs.forEach((el) => {
        el.style.removeProperty("scale");
        el.style.removeProperty("rotate");
      });
      darks.forEach((d) => d.lamp?.style.removeProperty("transform"));
      root.classList.remove("is-dark");
      rod?.style.removeProperty("--pp");
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
      pars.forEach((im) => im.style.removeProperty("--py"));
      stacks.forEach((s) =>
        s.ph.forEach((el, j) => {
          el.style.removeProperty("transform");
          s.ov[j]?.style.removeProperty("opacity");
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
