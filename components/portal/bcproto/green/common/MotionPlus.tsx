"use client";

import { useEffect } from "react";
import "./motion-plus.css";

/**
 * ボディケア案4(緑)の「追加の動き」(GreenShell に 1 つだけ置く。見た目は motion-plus.css)。
 * ページの文・データ・既存の部品には触らず、既存のクラスを外から指して動きを足す。
 *
 * スクロール:
 *  - 節の見出しが 1 字ずつ立ち上がり、下線が左から伸びる(mp-split)
 *  - 写真が左から拭かれて現れる(mp-wipe)/ 写真がスクロールでわずかに動く(img[data-mp-par] の --mp-p)/ 最初の画面の文字が写真よりゆっくり動く(--mp-hy)
 *  - 件数・都道府県数の数字が 0 から数え上がる(カウンター)
 *  - 節の境目に若葉のつるが線画で描かれていく(mp-vine)
 *  - 店・施術の種類・エリア・特集の帯・探すの結果が順に立ち上がる/滑り込む(CSS だけ。motion-plus.css)
 * モーショングラフィック(最初の画面など):
 *  - 若葉がひらひら舞い落ちる(canvas)。マウスの後ろにもつく・押すと舞い上がる
 *  - 木漏れ日の光の筋(mp-rays)・光の粒(mp-bokeh)
 * 触ったとき:
 *  - カード・札がマウスに合わせて 3D に傾く(data-mp-tilt)/ 緑のボタンが少し吸い寄せられる(data-mp-mag)/ 押した所から緑の波紋(mp-ring)
 *
 * 動きを減らす設定では何もしない(最終の状態のまま)。rAF は画面外・非表示タブで止める。スマホ(幅 700px 未満)は軽くする。
 */

const HERO_SEL = ".gt-hero, .gs-hero, .sh-hero, .ar-page";
const HEAD_SEL = ".gt h2, .sh-hd, .ar-card-h, .ar-rel-h, .ar-src-h, .ar-idx-hero .ar-h1";
const WIPE_SEL = ".gr-sph, .gt-type-ph, .gt-ac-ph, .sh-gin, .ar-ph:not(.ar-it), .ar-ic .ph, .ar-wk .ph";
const PAR_SEL = ".gr-sph img, .gt-type-ph img, .gt-ac-ph img, .sh-gin img, .sh-heroimg img, .gt-guide-b img";
const COUNT_SEL = ".gt-type small, .gt-wc-n, .gt-ac small, .gt-badge p";
const VINE_SEL = ".gt-worry, .gt-rec, .gt-area-sec, .gt-bn-sec, .gs-res, .sh-rel, .ar-idx-g";
const TILT_SEL = ".gr-sc, .gt-type, .gt-ac, .gt-bn, .gt-wc, .gt-guide, .gs-card, .ar-kind, .ar-wk, .ar-word, .ar-rc, .sh-mcard";
const MAG_SEL = ".gr-area-btn, .gt-go, .gs-go, .gr-btn, .sh-call, .sh-web, .gs-pg--more, .gt-guide-btn, .gt-worry-all, .gt-rec-all";

const LEAF_COLORS = ["#5e9a6b", "#7fb68a", "#3f7a52", "#a8cf9c", "#8fbf7f", "#c4dba6"];
const LEAF_PATH = typeof Path2D !== "undefined" ? new Path2D("M0 -1 C 0.72 -0.55 0.78 0.3 0 1 C -0.78 0.3 -0.72 -0.55 0 -1 Z") : null;

type Leaf = { x: number; y: number; s: number; r: number; vr: number; vx: number; vy: number; ph: number; amp: number; fl: number; fs: number; col: string; a: number; life: number; trail: boolean; fall: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** 若葉のつる(幅 1200×高さ 40 の線画。節の境目の細い帯に収まる大きさ)。path は pathLength=1 で描かれ、葉は x の位置に合わせて順に開く */
function vineSvg(flip: boolean): string {
  const leaves: Array<[number, number, number, number]> = [
    [110, 15, -45, 0.75],
    [240, 27, 140, 0.7],
    [370, 20, -35, 0.8],
    [520, 11, -150, 0.7],
    [660, 18, -25, 0.8],
    [790, 27, 150, 0.7],
    [930, 29, 25, 0.75],
    [1070, 24, -135, 0.8],
  ];
  const lf = leaves
    .map(([x, y, a, s]) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path class="lf" style="--x:${(x / 1200).toFixed(3)}" d="M0 0 C 6 -9 20 -10 30 0 C 20 10 6 9 0 0 Z"/></g>`)
    .join("");
  return `<svg viewBox="0 0 1200 40" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"${flip ? ' style="transform:scaleX(-1)"' : ""}><path class="v" pathLength="1" d="M0 22 C 120 8 220 34 360 20 S 600 6 720 20 S 980 34 1200 18"/>${lf}</svg>`;
}

export default function MotionPlus() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".gr-root");
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const narrow = () => window.innerWidth < 700;

    const cleanups: Array<() => void> = [];
    let dead = false;

    // ------------------------------------------------------------------ 画面に入ったとき
    const handlers = new WeakMap<Element, Array<() => void>>();
    const io = new IntersectionObserver(
      (ents) => {
        for (const en of ents) {
          if (!en.isIntersecting) continue;
          const hs = handlers.get(en.target);
          io.unobserve(en.target);
          hs?.forEach((f) => f());
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    const onEnter = (el: Element, fn: () => void) => {
      const hs = handlers.get(el);
      if (hs) hs.push(fn);
      else handlers.set(el, [fn]);
      io.observe(el);
    };
    cleanups.push(() => io.disconnect());

    // ------------------------------------------------------------------ 見出しの 1 字ずつ+下線
    const split = (h: HTMLElement) => {
      if (h.querySelector("mp-chs")) return;
      if (Array.from(h.childNodes).some((n) => n.nodeType !== Node.TEXT_NODE)) return; // 中に別の要素があるものは触らない
      const text = h.textContent ?? "";
      if (!text.trim() || text.length > 40) return;
      // 文字の入れ物は <span> にしない(ページの CSS の「.xxx span { display:block }」などに巻き込まれる)。独自タグ mp-chs / mp-ch を使う。
      // 読み上げは見出し自身の aria-label で本来の文字列を返す(textContent は元の文のまま)。
      const wrap = document.createElement("mp-chs");
      wrap.setAttribute("aria-hidden", "true");
      Array.from(text).forEach((c, i) => {
        const s = document.createElement("mp-ch");
        s.style.setProperty("--i", String(Math.min(i, 24)));
        s.textContent = c === " " ? "\u00a0" : c;
        wrap.appendChild(s);
      });
      h.setAttribute("aria-label", text);
      h.textContent = "";
      h.append(wrap);
      h.classList.add("mp-split");
    };

    // ------------------------------------------------------------------ 数字のカウンター
    const counting = new Map<HTMLElement, Array<[Text, string]>>();
    const countUp = (el: HTMLElement) => {
      const nodes: Array<[Text, string]> = [];
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = w.nextNode())) {
        const t = n as Text;
        if (/\d/.test(t.data)) nodes.push([t, t.data]);
      }
      if (!nodes.length) return;
      counting.set(el, nodes);
      const t0 = performance.now();
      const dur = 1500;
      const frame = (now: number) => {
        if (dead || !el.isConnected) return;
        const p = clamp((now - t0) / dur, 0, 1);
        const e = 1 - Math.pow(1 - p, 3);
        for (const [t, orig] of nodes) {
          if (p >= 1) t.data = orig;
          else t.data = orig.replace(/\d+/, (m) => String(Math.round(parseInt(m, 10) * e)));
        }
        if (p < 1) requestAnimationFrame(frame);
        else counting.delete(el);
      };
      // 先に 0 にしてから数え上げる
      for (const [t, orig] of nodes) t.data = orig.replace(/\d+/, "0");
      requestAnimationFrame(frame);
    };
    cleanups.push(() => {
      counting.forEach((nodes) => nodes.forEach(([t, orig]) => (t.data = orig)));
      counting.clear();
    });

    // ------------------------------------------------------------------ 写真のパララックス
    const par = new Set<HTMLElement>();
    let parRaf = 0;
    let heroIn: HTMLElement | null = null;
    const parUpdate = () => {
      parRaf = 0;
      const vh = window.innerHeight;
      // 最初の画面の文字は、スクロールで写真よりゆっくり動く(奥行き)
      if (heroIn && heroIn.isConnected) {
        const y = clamp(window.scrollY, 0, 700);
        heroIn.style.setProperty("--mp-hy", (y * (narrow() ? 0.1 : 0.17)).toFixed(1));
      }
      par.forEach((el) => {
        if (!el.isConnected) {
          par.delete(el);
          return;
        }
        const box = (el.parentElement ?? el).getBoundingClientRect();
        if (box.bottom < -120 || box.top > vh + 120) return;
        const p = clamp((box.top + box.height / 2 - vh / 2) / (vh / 2 + box.height / 2), -1, 1);
        el.style.setProperty("--mp-p", p.toFixed(3));
      });
    };
    const parSchedule = () => {
      if (!parRaf && !document.hidden) parRaf = requestAnimationFrame(parUpdate);
    };
    window.addEventListener("scroll", parSchedule, { passive: true });
    window.addEventListener("resize", parSchedule);
    cleanups.push(() => {
      window.removeEventListener("scroll", parSchedule);
      window.removeEventListener("resize", parSchedule);
      if (parRaf) cancelAnimationFrame(parRaf);
    });

    // ------------------------------------------------------------------ ヒーローの層(光の筋・光の粒・舞う若葉)
    const heroCleanups: Array<() => void> = [];
    const mountHero = (host: HTMLElement) => {
      if (host.dataset.mpHero) return;
      host.dataset.mpHero = "1";
      host.classList.add("mp-host");
      const small = narrow();

      const layer = document.createElement("div");
      layer.className = host.classList.contains("ar-page") ? "mp-layer mp-layer--top" : "mp-layer"; // 記事のページは上の 820px だけ
      layer.setAttribute("aria-hidden", "true");
      const rays = document.createElement("div");
      rays.className = "mp-rays";
      for (let i = 0; i < (small ? 2 : 3); i++) rays.appendChild(document.createElement("i"));
      const bokeh = document.createElement("div");
      bokeh.className = "mp-bokeh";
      for (let i = 0; i < (small ? 5 : 11); i++) {
        const b = document.createElement("i");
        const sz = rand(18, 64);
        b.style.cssText = `left:${rand(2, 96).toFixed(1)}%;top:${rand(8, 92).toFixed(1)}%;width:${sz.toFixed(0)}px;height:${sz.toFixed(0)}px;--bd:${rand(7, 14).toFixed(1)}s;--bl:${(-rand(0, 12)).toFixed(1)}s;--bo:${rand(0.35, 0.8).toFixed(2)}`;
        bokeh.appendChild(b);
      }
      const canvas = document.createElement("canvas");
      canvas.className = "mp-leaves";
      layer.append(rays, bokeh, canvas);
      // ヒーローの背景画像のすぐ後ろ(文字より下)に入れる
      const bg = host.querySelector(":scope > .gt-hero-bg, :scope > .gs-hero-bg, :scope > .sh-hero-bg");
      if (bg && bg.nextSibling) host.insertBefore(layer, bg.nextSibling);
      else host.insertBefore(layer, host.firstChild);

      const ctx = canvas.getContext("2d");
      if (!ctx || !LEAF_PATH) return;
      let W = 0;
      let H = 0;
      let dpr = 1;
      const size = () => {
        const r = layer.getBoundingClientRect();
        W = Math.max(1, r.width);
        H = Math.max(1, r.height);
        dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      };
      size();
      const ro = new ResizeObserver(() => size());
      ro.observe(layer);

      const leaves: Leaf[] = [];
      const mk = (x: number, y: number, trail: boolean): Leaf => ({
        x,
        y,
        s: trail ? rand(7, 13) : rand(8, 17),
        r: rand(0, Math.PI * 2),
        vr: rand(-1.1, 1.1),
        vx: rand(-8, 14),
        vy: trail ? rand(-30, 20) : rand(14, 30),
        ph: rand(0, 6.28),
        amp: rand(14, 34),
        fl: rand(0, 6.28),
        fs: rand(1.4, 3),
        col: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
        a: trail ? rand(0.7, 0.95) : rand(0.5, 0.88),
        life: trail ? 3.2 : 999,
        trail,
        fall: trail ? rand(30, 52) : rand(22, 44),
      });
      const base = small ? 7 : 20;
      for (let i = 0; i < base; i++) leaves.push(mk(rand(0, W), rand(-20, H), false));

      let visible = false;
      let raf = 0;
      let last = 0;
      let lastSpawn = 0;
      let px = -999;
      let py = -999;

      // 文字を避ける: ヒーローの中の文字の矩形(層の座標)を 0.3 秒ごとに取り直し、葉は文字に近づくと薄くなり、重なる前に消える(文字の上に葉が乗らない)
      let avoid: Array<[number, number, number, number]> = [];
      let avoidAt = -1e9;
      let candAt = -1e9;
      let cand: Text[] = [];
      const refreshAvoid = (now: number) => {
        if (now - avoidAt < 300) return;
        avoidAt = now;
        const lr = layer.getBoundingClientRect();
        const rg = document.createRange();
        // 層に掛かる文字の候補(ヘッダーの文字も含む。3 秒ごとに拾い直す)
        if (now - candAt > 3000) {
          candAt = now;
          cand = [];
          const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          let n: Node | null;
          while ((n = tw.nextNode())) {
            if (!(n as Text).data.trim()) continue;
            const pe = n.parentElement;
            if (!pe || pe.closest(".mp-layer,.mp-vine,script,style,noscript")) continue;
            rg.selectNodeContents(n);
            const rb = rg.getBoundingClientRect();
            if (rb.bottom < lr.top - 80 || rb.top > lr.bottom + 80) continue;
            cand.push(n as Text);
          }
        }
        const out: Array<[number, number, number, number]> = [];
        for (const n of cand) {
          if (!n.isConnected) continue;
          rg.selectNodeContents(n);
          for (const r of Array.from(rg.getClientRects())) {
            if (r.width < 2 || r.height < 4 || r.bottom < lr.top - 60 || r.top > lr.bottom + 60) continue;
            out.push([r.left - lr.left, r.top - lr.top, r.right - lr.left, r.bottom - lr.top]);
          }
        }
        avoid = out;
      };

      const step = (now: number) => {
        raf = 0;
        if (dead || !host.isConnected) {
          ro.disconnect();
          return;
        }
        if (!visible || document.hidden) return;
        const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
        last = now;
        refreshAvoid(now);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        for (let i = leaves.length - 1; i >= 0; i--) {
          const l = leaves[i];
          l.ph += dt;
          l.fl += dt * l.fs;
          l.x += (l.vx + Math.sin(l.ph * 1.25) * l.amp) * dt;
          l.y += l.vy * dt;
          l.vy += (l.fall - l.vy) * Math.min(1, dt * 1.1);
          l.vx -= l.vx * Math.min(1, dt * 0.7);
          l.r += (l.vr + Math.sin(l.ph * 0.9) * 0.6) * dt;
          l.vr -= l.vr * Math.min(1, dt * 0.25);
          if (l.trail) {
            l.life -= dt;
            if (l.life <= 0 || l.y > H + 30) {
              leaves.splice(i, 1);
              continue;
            }
          } else {
            if (l.y > H + 24) {
              l.y = -24;
              l.x = rand(0, W);
              l.vy = rand(14, 30);
            }
            if (l.x > W + 30) l.x = -30;
            else if (l.x < -30) l.x = W + 30;
          }
          let fade = l.trail ? clamp(l.life / 1.2, 0, 1) : 1;
          // 文字の矩形からの距離(縦横の遠い方)。葉の外接の正方形が文字に触れる手前から薄くし、触れる所では描かない
          const rr = l.s * 1.7 + 4;
          for (const a of avoid) {
            const d = Math.max(a[0] - l.x, 0, l.x - a[2], a[1] - l.y, 0, l.y - a[3]);
            if (d < rr + 24) {
              fade = Math.min(fade, clamp((d - rr) / 24, 0, 1));
              if (fade <= 0) break;
            }
          }
          if (fade < 0.03) continue;
          ctx.save();
          ctx.translate(l.x, l.y);
          ctx.rotate(l.r);
          ctx.scale(l.s * (0.18 + 0.82 * Math.abs(Math.cos(l.fl))), l.s * 1.5);
          ctx.globalAlpha = l.a * fade;
          ctx.fillStyle = l.col;
          ctx.fill(LEAF_PATH);
          ctx.globalAlpha = l.a * fade * 0.55;
          ctx.strokeStyle = "#2f5a3d";
          ctx.lineWidth = 0.06;
          ctx.beginPath();
          ctx.moveTo(0, -0.95);
          ctx.lineTo(0, 0.95);
          ctx.stroke();
          ctx.restore();
        }
        raf = requestAnimationFrame(step);
      };
      const start = () => {
        if (!raf && visible && !document.hidden && !dead) {
          last = performance.now();
          raf = requestAnimationFrame(step);
        }
      };
      const hio = new IntersectionObserver(
        (ents) => {
          visible = ents[0]?.isIntersecting ?? false;
          if (visible) start();
        },
        { threshold: 0 },
      );
      hio.observe(layer);
      const onVis = () => {
        if (!document.hidden) start();
      };
      document.addEventListener("visibilitychange", onVis);

      // マウスの後ろに若葉がつく / 押すと舞い上がる(PC のみ)
      const local = (e: PointerEvent) => {
        const r = layer.getBoundingClientRect();
        return [e.clientX - r.left, e.clientY - r.top] as const;
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        const [x, y] = local(e);
        if (y < 0 || y > H || x < 0 || x > W) return;
        const sp = Math.hypot(x - px, y - py);
        px = x;
        py = y;
        const now = performance.now();
        if (sp > 6 && now - lastSpawn > 70 && leaves.length < 70) {
          lastSpawn = now;
          const l = mk(x + rand(-6, 6), y + rand(-4, 8), true);
          l.vx = rand(-18, 18);
          leaves.push(l);
        }
      };
      const onDown = (e: PointerEvent) => {
        const [x, y] = local(e);
        for (const l of leaves) {
          const dx = l.x - x;
          const dy = l.y - y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 280) {
            const f = 1 - d / 280;
            l.vy -= 520 * f;
            l.vx += (dx / d) * 260 * f;
            l.vr += rand(-4, 4) * f;
          }
        }
        for (let i = 0; i < (small ? 5 : 9); i++) {
          const l = mk(x, y, true);
          l.vx = rand(-170, 170);
          l.vy = rand(-380, -120);
          l.vr = rand(-5, 5);
          leaves.push(l);
        }
      };
      if (fine) {
        host.addEventListener("pointermove", onMove, { passive: true });
        host.addEventListener("pointerdown", onDown, { passive: true });
      }
      heroCleanups.push(() => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        hio.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerdown", onDown);
        layer.remove();
        delete host.dataset.mpHero;
      });
    };

    // ------------------------------------------------------------------ 画面を見て、足す物を足す(何度呼んでも同じ)
    const registered = new WeakSet<Element>();
    const scan = () => {
      if (dead) return;
      // ヒーロー
      root.querySelectorAll<HTMLElement>(HERO_SEL).forEach(mountHero);
      heroIn = root.querySelector<HTMLElement>(".gt-hero-in");
      // 見出し
      root.querySelectorAll<HTMLElement>(HEAD_SEL).forEach((h) => {
        if (registered.has(h)) return;
        registered.add(h);
        split(h);
        if (h.classList.contains("mp-split")) onEnter(h, () => h.classList.add("mp-in"));
      });
      // 写真の拭き出し
      let wi = 0;
      root.querySelectorAll<HTMLElement>(WIPE_SEL).forEach((el) => {
        if (registered.has(el)) return;
        registered.add(el);
        // 拭き出しの中の拭き出しは付けない(外側が clip-path で隠れている間、内側は IntersectionObserver に「見えていない」と判定され、いつまでも出ない)
        if (el.parentElement?.closest(".mp-wipe")) return;
        el.classList.add("mp-wipe");
        el.style.setProperty("--mp-d", `${(wi++ % 5) * 90}ms`);
        // 自分は clip-path で隠れているので、IntersectionObserver には親(隠れていない枠)を見張らせる
        onEnter(el.parentElement ?? el, () => {
          el.classList.add("mp-in");
          window.setTimeout(() => el.classList.remove("mp-wipe", "mp-in"), 2200);
        });
      });
      // パララックス
      root.querySelectorAll<HTMLElement>(PAR_SEL).forEach((el) => {
        if (registered.has(el)) return;
        registered.add(el);
        el.setAttribute("data-mp-par", "");
        par.add(el);
      });
      parSchedule();
      // 数字
      root.querySelectorAll<HTMLElement>(COUNT_SEL).forEach((el) => {
        if (registered.has(el)) return;
        registered.add(el);
        onEnter(el, () => countUp(el));
      });
      // つる
      let vi = 0;
      root.querySelectorAll<HTMLElement>(VINE_SEL).forEach((el) => {
        if (registered.has(el)) return;
        registered.add(el);
        if (el.querySelector(":scope > .mp-vine")) return;
        if (narrow() && el.matches(".gs-res")) return; // スマホの探すは結果の見出しが節の一番上にあり、つるが文字に重なるので出さない
        const v = document.createElement("div");
        v.className = "mp-vine"; // 置き場所と高さは layoutVine が決める(節と節の隙間にだけ。隙間が狭ければ描かない)
        v.setAttribute("aria-hidden", "true");
        v.innerHTML = vineSvg(vi++ % 2 === 1);
        el.classList.add("mp-vine-host");
        el.insertBefore(v, el.firstChild);
        vineList.push([v, el]);
        layoutVine(v, el);
        onEnter(v, () => v.classList.add("mp-in"));
      });
      // 流れる帯は画面の外では止める
      root.querySelectorAll<HTMLElement>("[data-mp-marquee]").forEach((el) => {
        if (registered.has(el)) return;
        registered.add(el);
        const mio = new IntersectionObserver((ents) => el.classList.toggle("mp-off", !(ents[0]?.isIntersecting ?? true)), { threshold: 0 });
        mio.observe(el);
        cleanups.push(() => mio.disconnect());
      });
    };

    // ------------------------------------------------------------------ つるは節と節の「隙間」にだけ置く
    // 隙間 = 前の節の下端(兄弟の下端)から、この節の一番上の文字(または子)の上端まで。transform の影響を受けない offsetTop で測る。
    const vineList: Array<[HTMLElement, HTMLElement]> = [];
    const relTop = (el: HTMLElement, host: HTMLElement): number | null => {
      let t = 0;
      let cur: HTMLElement | null = el;
      while (cur && cur !== host) {
        t += cur.offsetTop;
        cur = cur.offsetParent as HTMLElement | null;
      }
      return cur === host ? t : null;
    };
    const layoutVine = (v: HTMLElement, host: HTMLElement) => {
      if (!host.isConnected) return;
      // この節の一番上 = 文字の最初の行の上端(要素の位置は offsetTop=変形に左右されない値、要素の中での文字の位置は今の見かけ)と、画像・ボタンなど文字の無い物の上端のうち一番上
      let T = Infinity;
      const tw = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      const rg = document.createRange();
      let n: Node | null;
      while ((n = tw.nextNode())) {
        if (!(n as Text).data.trim()) continue;
        const pe = n.parentElement;
        if (!pe || pe.closest(".mp-vine") || pe.offsetParent === null) continue;
        const base = relTop(pe, host);
        if (base === null) continue;
        rg.selectNodeContents(n);
        const r0 = rg.getClientRects()[0];
        if (!r0) continue;
        T = Math.min(T, base + (r0.top - pe.getBoundingClientRect().top));
      }
      for (const c of Array.from(host.querySelectorAll<HTMLElement>("img, svg, picture, video, canvas, button, select, input, textarea"))) {
        if (c.closest(".mp-vine") || c.offsetParent === null) continue;
        const t = relTop(c, host);
        if (t !== null) T = Math.min(T, t);
      }
      if (!isFinite(T)) T = 0;
      // 前の節の下端(高さ 0 の飾りの要素は飛ばす)
      let B = -10;
      let prev = host.previousElementSibling as HTMLElement | null;
      while (prev && (prev.offsetHeight === 0 || prev.classList.contains("mp-layer"))) prev = prev.previousElementSibling as HTMLElement | null;
      if (prev) {
        const pt = prev.offsetParent === host.offsetParent ? prev.offsetTop : null;
        if (pt !== null) B = pt + prev.offsetHeight - host.offsetTop;
        else {
          const pr = prev.getBoundingClientRect();
          const hr = host.getBoundingClientRect();
          B = pr.bottom - hr.top;
        }
      }
      const gap = T - B;
      const margin = 2;
      const h = Math.min(34, gap - margin * 2);
      if (h < 12) {
        v.style.display = "none";
        v.classList.add("mp-lay");
        return;
      }
      v.style.display = "";
      v.style.top = `${(B + (gap - h) / 2).toFixed(1)}px`;
      v.style.height = `${h.toFixed(1)}px`;
      v.classList.add("mp-lay");
    };
    const layoutVines = () => {
      for (const [v, h] of vineList) layoutVine(v, h);
    };
    {
      let lr = 0;
      const soon = () => {
        if (lr || dead) return;
        lr = requestAnimationFrame(() => {
          lr = 0;
          layoutVines();
        });
      };
      window.addEventListener("resize", soon);
      window.addEventListener("load", soon);
      const lro = new ResizeObserver(soon);
      lro.observe(root);
      const t1 = window.setTimeout(soon, 700);
      const t2 = window.setTimeout(soon, 2500);
      document.fonts?.ready.then(soon).catch(() => {});
      cleanups.push(() => {
        window.removeEventListener("resize", soon);
        window.removeEventListener("load", soon);
        lro.disconnect();
        clearTimeout(t1);
        clearTimeout(t2);
        if (lr) cancelAnimationFrame(lr);
      });
    }

    let scanRaf = 0;
    const scanSoon = () => {
      if (scanRaf || dead) return;
      scanRaf = requestAnimationFrame(() => {
        scanRaf = 0;
        scan();
      });
    };
    // ハイドレーションが済んでから始める(中身を差し込むので、途中だと React の照合とぶつかる)。
    // ページの一番外側の要素に React の印(__reactFiber$…)が付いたら済み。最長 12 秒待ち、それでも付かなければ始める。
    const hydrated = () => {
      const el = root.querySelector<HTMLElement>("[data-gr-page]");
      return !!el && Object.keys(el).some((k) => k.startsWith("__reactFiber$"));
    };
    const t0 = performance.now();
    let startT = 0;
    const begin = () => {
      scan();
      const mo = new MutationObserver((recs) => {
        // 自分の足した物だけの変化では再走査しない
        if (recs.every((r) => Array.from(r.addedNodes).every((n) => n.nodeType !== 1 || (n as HTMLElement).matches?.(".mp-layer,.mp-vine,.mp-ring")))) return;
        scanSoon();
      });
      mo.observe(root, { childList: true, subtree: true });
      cleanups.push(() => mo.disconnect());
    };
    const wait = () => {
      if (dead) return;
      if (hydrated() || performance.now() - t0 > 12000) {
        startT = window.setTimeout(begin, 160);
        return;
      }
      startT = window.setTimeout(wait, 80);
    };
    startT = window.setTimeout(wait, 120);
    cleanups.push(() => window.clearTimeout(startT));

    // ------------------------------------------------------------------ 触ったとき(PC)
    if (fine) {
      let tiltEl: HTMLElement | null = null;
      let tiltRaf = 0;
      let magEl: HTMLElement | null = null;
      const resetTilt = (el: HTMLElement) => {
        el.removeAttribute("data-mp-tilt");
        el.style.removeProperty("--mp-rx");
        el.style.removeProperty("--mp-ry");
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" || narrow()) return;
        const t = e.target as Element | null;
        if (!t || !t.closest) return;
        // 傾き
        const card = t.closest<HTMLElement>(TILT_SEL);
        if (tiltEl && tiltEl !== card) {
          resetTilt(tiltEl);
          tiltEl = null;
        }
        if (card) {
          tiltEl = card;
          const x = e.clientX;
          const y = e.clientY;
          if (!tiltRaf)
            tiltRaf = requestAnimationFrame(() => {
              tiltRaf = 0;
              if (!tiltEl) return;
              const r = tiltEl.getBoundingClientRect();
              const px = clamp((x - r.left) / r.width, 0, 1) - 0.5;
              const py = clamp((y - r.top) / r.height, 0, 1) - 0.5;
              tiltEl.setAttribute("data-mp-tilt", "");
              tiltEl.style.setProperty("--mp-rx", `${(-py * 9).toFixed(2)}deg`);
              tiltEl.style.setProperty("--mp-ry", `${(px * 11).toFixed(2)}deg`);
            });
        }
        // 吸い寄せ
        const btn = t.closest<HTMLElement>(MAG_SEL);
        if (magEl && magEl !== btn) {
          magEl.style.translate = "";
          magEl = null;
        }
        if (btn) {
          magEl = btn;
          btn.setAttribute("data-mp-mag", "");
          const r = btn.getBoundingClientRect();
          const dx = clamp((e.clientX - (r.left + r.width / 2)) * 0.2, -9, 9);
          const dy = clamp((e.clientY - (r.top + r.height / 2)) * 0.3, -6, 6);
          btn.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
        }
      };
      const onLeave = () => {
        if (tiltEl) {
          resetTilt(tiltEl);
          tiltEl = null;
        }
        if (magEl) {
          magEl.style.translate = "";
          magEl = null;
        }
      };
      root.addEventListener("pointermove", onMove, { passive: true });
      root.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
        if (tiltRaf) cancelAnimationFrame(tiltRaf);
        onLeave();
      });
    }

    // ------------------------------------------------------------------ 押した所から緑の波紋(どの端末でも)
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t?.closest?.("select, input, textarea, option")) return;
      const ring = document.createElement("div");
      ring.className = "mp-ring";
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      ring.addEventListener("animationend", () => ring.remove(), { once: true });
      document.body.appendChild(ring);
      window.setTimeout(() => ring.remove(), 1400);
    };
    root.addEventListener("pointerdown", onDown, { passive: true });
    cleanups.push(() => root.removeEventListener("pointerdown", onDown));

    return () => {
      dead = true;
      if (scanRaf) cancelAnimationFrame(scanRaf);
      cleanups.forEach((f) => f());
      heroCleanups.forEach((f) => f());
      document.querySelectorAll(".mp-vine").forEach((n) => n.remove());
      document.querySelectorAll(".mp-ring").forEach((n) => n.remove());
    };
  }, []);
  return null;
}
