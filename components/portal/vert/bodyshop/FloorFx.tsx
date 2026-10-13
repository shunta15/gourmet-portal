"use client";
/**
 * (2026-10-13 作り直し 2) 物は画面の下の床の帯([data-bc-ledge])に置く。つかむと指について持ち上がり、離すと指の速さで飛んで、放物線で落ちて弾み、転がって帯の中へ戻る(投げている間だけ本文の上を通る)。開いた直後だけ、帯の上の空きから落ちてくる。
 * 帯の中で、物を直接つかんで投げる・なぞって転がせる(帯は touch-action:none。文は選択されない)。つかむと重さがあり(ばねで遅れてついてくる)、離すと勢いのまま転がって止まる。
 * 止まったあとも、床がゆっくり揺れて、物が静かに転がり続ける。
 * 案 C「転がる」の動き(データは持たない。サーバーが出した DOM に付ける)。
 * 画面の下の床([data-bc-ledge])に、丸い物(マットの巻き 3・木の玉 2・竹の輪 1)を転がす。円の物理を実時間で進めて canvas([data-bc-cv])に描く:
 *   重力・床とのはね返り・転がり摩擦・壁・円どうしのぶつかり。開くと上から落ちてくる。
 *   スクロールの速さが床の傾きになり(物が転がり、ページの紙も --tilt の分だけ傾く)、指でつかんで投げる・なぞって転がせる。
 * 落ち着いて、スクロールも指も無ければ描画を止める(rAF を回さない)。prefers-reduced-motion では動かさない。
 */
import { useEffect } from "react";

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

type Kind = "mat" | "ball" | "bamboo";
type Ob = { hx: number; x: number; y: number; vx: number; vy: number; r: number; ang: number; w: number; kind: Kind; color: string; grab: boolean };

export default function FloorFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-bc]");
    const cv = root?.querySelector<HTMLCanvasElement>("[data-bc-cv]");
    const ledge = root?.querySelector<HTMLElement>("[data-bc-ledge]");
    if (!root || !cv || !ledge) return;
    root.classList.add("bc-js", "bc-ready");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("bc-still");
      return;
    }
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const matColor = getComputedStyle(root).getPropertyValue("--mat").trim() || "#768697";
    const DROP = 260;
    const born = performance.now();
    let lh = 120;
    let ledgeBox = ledge.getBoundingClientRect();

    let W = 0;
    let H = 0;
    let floorY = 0;
    let dpr = 1;
    let obs: Ob[] = [];
    let raf = 0;
    let last = 0;
    let lastScrollY = window.scrollY;
    let scrollVel = 0;
    let tilt = 0;
    let awakeUntil = 0;
    let grab: Ob | null = null;
    let gx = 0;
    let gy = 0;
    let pxPrev = 0;
    let brushing = false;
    let pvx = 0;
    let pvy = 0;
    let lastPx = 0;
    let lastPy = 0;
    let lastPt = 0;
    let timer = 0;
    let scrolling = false;
    let live = false;
    let lastTq = 9;

    const build = () => {
      const mob = W < 700;
      const base = mob ? 22 : clamp(W * 0.04, 22, 30);
      const all: [Kind, number, number, string][] = [
        ["mat", 1.0, 1.0, matColor],
        ["mat", 0.82, 0.9, "#d8ceb8"],
        ["mat", 0.82, 0, "#7f8864"],
        ["ball", 0.46, 0.62, "#d9b88a"],
        ["ball", 0.4, 0, "#c9d0c8"],
        ["bamboo", 0.62, 0.8, "#7f8f5a"],
      ];
      const spec = (mob ? all.filter((a) => a[2] > 0) : all).map(([kind, k, mk, color]) => [kind, mob ? mk : k, color] as [Kind, number, string]);
      obs = spec.map(([kind, k, color], i) => {
        const r = base * k;
        const hx = W * ((i + 0.5) / spec.length);
        return { hx, x: clamp(hx, r + 2, W - r - 2), y: floorY - r, vx: 0, vy: 0, r, ang: i * 1.3, w: 0, kind, color, grab: false };
      });
    };
    const resize = () => {
      ledgeBox = ledge.getBoundingClientRect();
      lh = ledgeBox.height;
      W = ledge.clientWidth;
      H = lh + DROP;
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      floorY = H - lh * 0.3;
      if (obs.length === 0) build();
      else obs.forEach((o, i) => ((o.hx = W * ((i + 0.5) / obs.length)), (o.x = clamp(o.x, o.r, W - o.r)), (o.y = Math.min(o.y, floorY - o.r))));
      wake(1500);
    };

    const step = (dt: number) => {
      const g = 2300;
      const t = (performance.now() - born) / 1000;
      const ax0 = clamp(tilt, -1, 1) * 420;
      for (let oi = 0; oi < obs.length; oi++) {
        const o = obs[oi];
        if (o.grab) {
          // つかんでいる間: ばねで指へ(重い物ほど遅れてついてくる)
          const m = (o.r / 28) * (o.r / 28);
          const k = 150 / (0.6 + m);
          o.vx += (k * (gx - o.x) - 15 * o.vx) * dt;
          o.vy += (k * (gy - o.y) - 15 * o.vy) * dt;
          o.x += o.vx * dt;
          o.y += o.vy * dt;
          o.w = 0;
          o.x = clamp(o.x, o.r, W - o.r);
          o.y = clamp(o.y, o.r, floorY - o.r);
          continue;
        }
        // 床の傾き(スクロール)+ ゆっくりした揺れ(静かでも転がり続ける)+ 浅い鉢(元の場所へ戻ろうとして、行き来する)
        const kHome = scrolling ? 0.22 : 0.85;
        const ax = ax0 + Math.sin(t * 0.7 + oi * 1.3) * 120 + kHome * (o.hx - o.x);
        if (!scrolling) o.vx *= Math.exp(-0.9 * dt); // 送りが止まったら、ゆっくり元の場所へ散らばって戻る
        o.vy += g * dt;
        o.vx += ax * dt;
        o.x += o.vx * dt;
        o.y += o.vy * dt;
        if (o.y - o.r < 0) {
          o.y = o.r;
          if (o.vy < 0) o.vy = -o.vy * 0.35;
        }
        // 床
        if (o.y + o.r > floorY) {
          o.y = floorY - o.r;
          if (o.vy > 120) o.vy = -o.vy * 0.34;
          else o.vy = 0;
          o.vx *= 1 - Math.min(1, 0.55 * dt); // 転がり摩擦
        }
        // 壁
        if (o.x < o.r) {
          o.x = o.r;
          o.vx = Math.abs(o.vx) * 0.5;
        } else if (o.x > W - o.r) {
          o.x = W - o.r;
          o.vx = -Math.abs(o.vx) * 0.5;
        }
        // 転がり(床の上では、進んだ分だけ回る)
        const onFloor = o.y + o.r >= floorY - 0.5;
        o.w = onFloor ? o.vx / o.r : o.w * (1 - Math.min(1, 0.8 * dt));
        o.ang += o.w * dt;
      }
      // 円どうし
      for (let i = 0; i < obs.length; i++) {
        for (let j = i + 1; j < obs.length; j++) {
          const a = obs[i];
          const b = obs[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 0.001;
          const min = a.r + b.r;
          if (d >= min) continue;
          const nx = dx / d;
          const ny = dy / d;
          const ma = a.r * a.r;
          const mb = b.r * b.r;
          const push = min - d;
          const ka = a.grab ? 0 : mb / (ma + mb);
          const kb = b.grab ? 0 : ma / (ma + mb);
          a.x -= nx * push * (ka || 0);
          a.y -= ny * push * (ka || 0);
          b.x += nx * push * (kb || 0);
          b.y += ny * push * (kb || 0);
          if (Math.abs(ny) > 0.55 && (a.y < b.y ? a : b).y - (a.y < b.y ? a : b).r < H - lh + 2) continue; // 帯より上にいる物は、下の物の手前を通る(帯の上に積み重ならない)
          if (Math.abs(ny) > 0.55) {
            const up = a.y < b.y ? a : b;
            const lo = up === a ? b : a;
            if (!up.grab) up.vx += (up.x >= lo.x ? 1 : -1) * 1400 * dt;
          }
          const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) {
            const imp = (-(1 + 0.38) * rv) / (1 / ma + 1 / mb);
            if (!a.grab) {
              a.vx -= (imp * nx) / ma;
              a.vy -= (imp * ny) / ma;
            }
            if (!b.grab) {
              b.vx += (imp * nx) / mb;
              b.vy += (imp * ny) / mb;
            }
          }
        }
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const nowT = performance.now();
      for (const o of obs) {
        const air = o.y - o.r < H - lh;
        // 帯の上へ出ている物: 手前に浮いているので影を付け、止まっていたら半透明に(本文の字を隠し続けない)
        ctx.globalAlpha = air ? (o.grab && nowT - lastPt > 600 ? 0.4 : 0.66) : 1;
        if (air) {
          ctx.fillStyle = "rgba(30,18,6,.22)";
          ctx.beginPath();
          ctx.arc(o.x + 3, o.y + 15, o.r * 0.96, 0, Math.PI * 2);
          ctx.fill();
        }
        // 影
        const h = clamp((floorY - (o.y + o.r)) / 260, 0, 1);
        ctx.fillStyle = `rgba(40,24,8,${0.32 * (1 - h * 0.8)})`;
        ctx.beginPath();
        ctx.ellipse(o.x + 4, floorY + 2, o.r * (1 - h * 0.4) * 1.05, o.r * 0.2 * (1 - h * 0.4), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.beginPath();
        ctx.arc(0, 0, o.r, 0, Math.PI * 2);
        ctx.clip();
        if (o.kind === "mat") {
          ctx.fillStyle = o.color;
          ctx.fillRect(-o.r, -o.r, o.r * 2, o.r * 2);
          // 巻いた断面の渦(回る)
          ctx.rotate(o.ang);
          ctx.strokeStyle = "rgba(20,14,8,.34)";
          ctx.lineWidth = Math.max(1.2, o.r * 0.055);
          ctx.beginPath();
          const turns = 3.6;
          for (let t = 0; t <= turns * Math.PI * 2; t += 0.12) {
            const rr = o.r * (0.12 + 0.86 * (t / (turns * Math.PI * 2)));
            const px = Math.cos(t) * rr;
            const py = Math.sin(t) * rr;
            if (t === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.rotate(-o.ang);
          // 端の札(丸い紙)
          ctx.fillStyle = "rgba(246,243,234,.92)";
          ctx.beginPath();
          ctx.arc(0, 0, o.r * 0.26, 0, Math.PI * 2);
          ctx.fill();
        } else if (o.kind === "ball") {
          ctx.fillStyle = o.color;
          ctx.fillRect(-o.r, -o.r, o.r * 2, o.r * 2);
          ctx.rotate(o.ang);
          ctx.fillStyle = "rgba(60,36,12,.28)";
          ctx.beginPath();
          ctx.arc(o.r * 0.55, 0, o.r * 0.11, 0, Math.PI * 2);
          ctx.fill();
          ctx.rotate(-o.ang);
        } else {
          ctx.fillStyle = "#e1dfc4";
          ctx.fillRect(-o.r, -o.r, o.r * 2, o.r * 2);
          ctx.rotate(o.ang);
          ctx.strokeStyle = o.color;
          ctx.lineWidth = o.r * 0.34;
          ctx.beginPath();
          ctx.arc(0, 0, o.r * 0.82, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = "rgba(40,50,20,.4)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(o.r * 0.5, 0);
          ctx.lineTo(o.r, 0);
          ctx.stroke();
          ctx.rotate(-o.ang);
        }
        // 丸みの光と影
        const gr = ctx.createRadialGradient(-o.r * 0.38, -o.r * 0.42, o.r * 0.1, 0, 0, o.r * 1.05);
        gr.addColorStop(0, "rgba(255,255,255,.34)");
        gr.addColorStop(0.5, "rgba(255,255,255,0)");
        gr.addColorStop(1, "rgba(20,12,4,.42)");
        ctx.fillStyle = gr;
        ctx.fillRect(-o.r, -o.r, o.r * 2, o.r * 2);
        ctx.restore();
        ctx.strokeStyle = "rgba(20,12,4,.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (!live) {
        live = true;
        root.classList.add("bc-live");
      }
    };

    const wake = (ms: number) => {
      awakeUntil = Math.max(awakeUntil, performance.now() + ms);
      if (timer) {
        window.clearTimeout(timer);
        timer = 0;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      // スクロールの速さ → 床の傾き(物とページの紙)
      const sy = window.scrollY;
      const dS = sy - lastScrollY;
      scrollVel = scrollVel * 0.82 + (dS / Math.max(dt, 0.001)) * 0.18;
      lastScrollY = sy;
      // 送った量に応じて、物が転がる(下へ送ると右へ回りながら進み、上へ戻ると左へ)。模様の向きも回る
      if (dS !== 0) {
        const dd = clamp(dS, -260, 260);
        obs.forEach((o, oi) => {
          if (o.grab) return;
          const dx = dd * (0.24 + 0.05 * oi);
          const nx = clamp(o.x + dx, o.r, W - o.r);
          o.ang += (nx - o.x) / o.r;
          o.x = nx;
          o.vx = clamp(o.vx + (dx / Math.max(dt, 0.008)) * 0.18, -1500, 1500);
        });
      }
      scrolling = Math.abs(scrollVel) > 60;
      tilt += (clamp(scrollVel / 1100, -1, 1) - tilt) * Math.min(1, dt * 8);
      const tq = Math.round(tilt * 12) / 12;
      if (tq !== lastTq) {
        lastTq = tq;
        root.style.setProperty("--tilt", (tq * 1.1).toFixed(3));
      }
      const n = Math.max(1, Math.ceil(dt / (1 / 120)));
      for (let k = 0; k < n; k++) step(dt / n);
      draw();
      if (document.hidden) return;
      // 静かなときは約 30 コマ/秒(描画を軽く)。さわる・スクロールするあいだは毎コマ
      if (Math.abs(tilt) < 0.01 && !grab && now > awakeUntil) timer = window.setTimeout(() => {
        timer = 0;
        raf = requestAnimationFrame(frame);
      }, 28);
      else raf = requestAnimationFrame(frame);
    };

    // 指・マウス
    const pos = (e: PointerEvent) => ({ x: e.clientX - ledgeBox.left, y: e.clientY - (ledgeBox.bottom - H) });
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      ledgeBox = ledge.getBoundingClientRect();
      const p = pos(e);
      let best: Ob | null = null;
      let bd = 1e9;
      for (const o of obs) {
        const d = Math.hypot(o.x - p.x, o.y - p.y);
        if (d < o.r + (e.pointerType === "touch" ? 32 : 18) && d < bd) {
          best = o;
          bd = d;
        }
      }
      pxPrev = p.x;
      if (best) {
        grab = best;
        best.grab = true;
        gx = p.x;
        gy = p.y;
        lastPx = p.x;
        lastPy = p.y;
        lastPt = performance.now();
        pvx = 0;
        pvy = 0;
        ledge.style.cursor = "grabbing";
        try {
          ledge.setPointerCapture(e.pointerId);
        } catch {}
      } else {
        brushing = true;
      }
      wake(800);
    };
    const onMove = (e: PointerEvent) => {
      const p = pos(e);
      if (grab) {
        gx = p.x;
        gy = p.y;
        const now = performance.now();
        const dtp = (now - lastPt) / 1000;
        if (dtp > 0.004) {
          pvx = pvx * 0.5 + ((p.x - lastPx) / dtp) * 0.5;
          pvy = pvy * 0.5 + ((p.y - lastPy) / dtp) * 0.5;
          lastPx = p.x;
          lastPy = p.y;
          lastPt = now;
        }
      } else if (brushing || e.pointerType === "mouse") {
        // なぞる: 触れた物を、動かした向きへ転がす
        const dx = p.x - pxPrev;
        pxPrev = p.x;
        if (Math.abs(dx) > 1) {
          for (const o of obs) {
            if (Math.abs(o.x - p.x) < o.r + 8 && p.y > o.y - o.r - 12) o.vx += clamp(dx, -40, 40) * 11 * (28 / o.r);
          }
          wake(1200);
        }
      }
    };
    const onUp = () => {
      brushing = false;
      if (grab) {
        grab.grab = false;
        // 投げる: 指の速さで飛ぶ(止めてから離したら、ゆっくり落ちる)
        const still = performance.now() - lastPt > 110 ? 0.15 : 1;
        grab.vx = clamp(pvx * 0.9 * still, -2300, 2300);
        grab.vy = clamp(pvy * 0.9 * still, -1500, 2300);
        grab = null;
        ledge.style.cursor = "";
        wake(2500);
      }
    };
    ledge.addEventListener("pointerdown", onDown);
    ledge.addEventListener("pointermove", onMove);
    ledge.addEventListener("pointerup", onUp);
    ledge.addEventListener("pointercancel", onUp);
    const onScroll = () => wake(700);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    const onVis = () => {
      if (!document.hidden) wake(100);
    };
    document.addEventListener("visibilitychange", onVis);
    (window as unknown as { __bcProbe: () => unknown }).__bcProbe = () => ({ o: obs.map((o) => [Math.round(o.x), Math.round(o.y - (H - lh)), Math.round(o.r)]), lh, grab: !!grab, tilt: +tilt.toFixed(2) });

    // 紙: 見える所に来たら置かれる
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-bc-card]"));
    const io = new IntersectionObserver(
      (es) => es.forEach((en) => en.isIntersecting && en.target.classList.add("is-in")),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.04 }
    );
    cards.forEach((c) => io.observe(c));

    // CSS の最初の姿(落ちて弾む物)が終わったら、同じ位置から物理に引き継ぐ
    let stopped = false;
    const start = () => {
      if (stopped) return;
      resize();
      wake(3200);
    };
    const phAnims = Array.from(root.querySelectorAll<HTMLElement>(".bc-ph")).flatMap((p) => p.getAnimations());
    if (phAnims.length > 0) Promise.all(phAnims.map((a) => a.finished.catch(() => null))).then(start);
    else start();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ledge.removeEventListener("pointerdown", onDown);
      ledge.removeEventListener("pointermove", onMove);
      ledge.removeEventListener("pointerup", onUp);
      ledge.removeEventListener("pointercancel", onUp);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return null;
}
