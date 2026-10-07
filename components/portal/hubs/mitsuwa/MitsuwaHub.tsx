"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import type { HubItem } from "@/lib/portal/hub";
import type { Week } from "@/lib/portal/openNow";

/**
 * 総合トップ案「三つの輪 MITSUWA」（コンセプト 2）— 最初の画面（クライアント）。
 *
 * 主役は、文字でできた 3 つの輪。「ひと」「みせ」「まち」の字が帯のように円をぐるりと回る、立体の輪（CSS 3D・preserve-3d）。
 * 輪は 48 枚の細い板（1 枚 7.5°）を円周に並べ、同じ 1 本の字の帯を板ごとにずらして見せる（円筒に字を巻く）。
 * 手前の板は黒・白・朱の帯に黄・黒・白の字、奥の板は「裏」の面（薄い色・字は鏡文字）。
 * 3 つの輪は軸の向きが違い、大きさ違いで入れ子（ジャイロ）。ゆっくり回り、つかんで回せる（慣性）。
 * 業種を選ぶと 3 つの輪が一瞬そろって 1 つの輪（3 段）に重なり、またほどける。入るときは輪の中へ飛び込む。
 *
 * 描画は毎フレーム transform だけを直接書く（React の state は書かない）。画面の外・タブが裏のときは止める。
 * 動きを減らす設定では、輪は止まった形のまま・入る動きも無し（同じ行き先へそのまま移る）。
 */

/** コンセプト 2 の見出し（COPY.md 一字一句）。行ごとの区切りは見た目だけ（つなげると原文のまま） */
const HEADLINE_SEGS = ["ひと、", "みせ、", "まち。", "つながる輪。"];
/** コンセプト 2 の本文の第 1 段落（COPY.md 一字一句） */
const LEAD = "街をつくっているのは、そこに暮らす人と、街に根付くお店。";

type RingDef = {
  id: string;
  /** 帯に巻く字（slots 文字ぶん。1 文字が 1 コマ） */
  text: string;
  slots: number;
  /** 半径（u 単位） */
  R: number;
  /** 帯の高さ・字の大きさ（u 単位） */
  H: number;
  fs: number;
  /** 軸の向き（画面の中の傾き）と、こちらへ倒す角度（度） */
  roll: number;
  tilt: number;
  /** ひとりでに回る速さ（度/秒）と、つかんで回したときの効き */
  speed: number;
  mult: number;
};

const RINGS: RingDef[] = [
  { id: "hito", text: "ひと・".repeat(6), slots: 18, R: 100, H: 34, fs: 29, roll: 0, tilt: -24, speed: 8, mult: 1 },
  { id: "mise", text: "みせ・".repeat(5), slots: 15, R: 82, H: 34, fs: 29, roll: 62, tilt: -26, speed: -11, mult: 1.15 },
  { id: "machi", text: "まち・".repeat(4), slots: 12, R: 66, H: 34, fs: 29, roll: -62, tilt: -28, speed: 14, mult: 1.3 },
];
const SEGS = 48;
/** 陰の濃さの上限。黒の帯（0）は白を重ねて手前を明るく、白・朱の帯は暗い色を重ねて縁と奥を沈める */
const SHADE_MAX = [0.05, 0.32, 0.36];
/** 板 k の角度 k×7.5° の sin/cos（陰の計算を軽くする） */
const SEG_SIN = Array.from({ length: SEGS }, (_, k) => Math.sin((k * 7.5 * Math.PI) / 180));
const SEG_COS = Array.from({ length: SEGS }, (_, k) => Math.cos((k * 7.5 * Math.PI) / 180));

/** 1 つの輪に重なったとき（3 段）。半径をそろえ、軸の方向に積む */
const MERGE_R = RINGS[1].R;
const MERGE_OFF = [-(RINGS[1].H / 2 + (RINGS[0].H * (MERGE_R / RINGS[0].R)) / 2 + 0.6), 0, RINGS[1].H / 2 + (RINGS[2].H * (MERGE_R / RINGS[2].R)) / 2 + 0.6];
const MERGE_TILT = -22;
/** 入る動きの長さ（ミリ秒） */
const DIVE_MS = 780;
/** 入るとき、画面全体を手前へ送る距離（u 単位）。輪の穴をくぐり抜ける */
const DIVE_Z = 318;

const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

function Ring({ r, index }: { r: RingDef; index: number }) {
  const chars = Array.from({ length: SEGS }, (_, i) => i);
  return (
    <div className="mw-intro" style={{ ["--delay" as string]: `${0.1 + index * 0.22}s`, ["--from" as string]: `${index % 2 ? 420 : -420}deg` } as CSSProperties}>
      <div
        className="mw-ring"
        data-r={index}
        style={
          {
            ["--R" as string]: r.R,
            ["--H" as string]: r.H,
            ["--fs" as string]: r.fs,
            ["--slots" as string]: r.slots,
            ["--roll" as string]: r.roll,
            ["--tilt" as string]: r.tilt,
          } as CSSProperties
        }
      >
        <div className="mw-spin">
          {chars.map((i) => (
            <i className="mw-seg" key={i} style={{ ["--i" as string]: i } as CSSProperties}>
              <b className="mw-f">
                <span className="mw-strip">{r.text}</span>
                <em className="mw-sh" />
              </b>
              <b className="mw-b">
                <span className="mw-strip">{r.text}</span>
              </b>
            </i>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MitsuwaHub({
  items,
  gourmetTotal,
  featureTotal,
  open,
}: {
  items: HubItem[];
  gourmetTotal: number;
  featureTotal: number;
  open: { weeks: Week[]; n: number[] };
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [openNow, setOpenNow] = useState<{ open: number; known: number } | null>(null);
  const api = useRef({ pulse: () => {}, go: (_p: string) => {}, nudge: (_el: HTMLElement | null) => {} });

  /* ───────────── いま営業中の数（営業時間が確かな店だけ。現在時刻はブラウザで当てる。HubStage と同じ数え方） ───────────── */
  useEffect(() => {
    let stop = false;
    const calc = async () => {
      const m = await import("@/lib/portal/openNow");
      const now = Date.now();
      let o = 0;
      let k = 0;
      open.weeks.forEach((w, i) => {
        k += open.n[i];
        if (m.isOpenState(m.getOpenStatus(w, now).state)) o += open.n[i];
      });
      if (!stop) setOpenNow({ open: o, known: k });
    };
    const ric = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    // 輪が動き続けて空きが出なくても 1.2 秒以内には数える（timeout）
    const h = ric ? ric(() => void calc(), { timeout: 1200 }) : window.setTimeout(() => void calc(), 400);
    const iv = window.setInterval(() => void calc(), 60_000);
    return () => {
      stop = true;
      window.clearInterval(iv);
      if (!ric) window.clearTimeout(h);
    };
  }, [open]);

  /* ───────────── 輪のエンジン ───────────── */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scene = root.querySelector<HTMLElement>(".mw-scene");
    const ringsEl = root.querySelector<HTMLElement>(".mw-rings");
    const h1 = root.querySelector<HTMLElement>(".mw-h1");
    const hwrap = root.querySelector<HTMLElement>(".mw-hwrap");
    const veil = root.querySelector<HTMLElement>(".mw-veil");
    const probe = root.querySelector<HTMLElement>(".mw-probe");
    const wraps = Array.from(root.querySelectorAll<HTMLElement>(".mw-ring"));
    const spins = Array.from(root.querySelectorAll<HTMLElement>(".mw-spin"));
    // 陰（板ごとの重ね色の濃さ）。輪ごとに SEGS 枚。値が変わったときだけ書く
    const shades = wraps.map((w) => Array.from(w.querySelectorAll<HTMLElement>(".mw-sh")));
    const shadeLast = RINGS.map(() => new Float32Array(SEGS).fill(-1));
    if (!scene || !ringsEl || !h1 || !hwrap || !veil || !probe || wraps.length !== RINGS.length) return;

    const persp = root.querySelector<HTMLElement>(".mw-persp");
    const stageEl = root.querySelector<HTMLElement>(".mw-stage");
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = mq.matches;
    let u = 3.9;
    // 入るとき、輪の穴が画面の真ん中に来るように、舞台ごと動かす距離（px）
    let dx = 0;
    let dy = 0;
    const measure = () => {
      u = (probe.getBoundingClientRect().width || 390) / 100;
      if (!stageEl) return;
      const cs = getComputedStyle(stageEl);
      const cx = (parseFloat(cs.getPropertyValue("--cx")) / 100) * stageEl.clientWidth;
      const cy = (parseFloat(cs.getPropertyValue("--cy")) / 100) * stageEl.clientHeight;
      dx = root.clientWidth / 2 - cx;
      dy = root.clientHeight * 0.46 - cy;
    };

    /* 状態（React には載せない） */
    const S = {
      t: 0,
      angle: RINGS.map((_, i) => i * 37),
      extra: 0, // つかんで回したあとの余韻（度/秒）
      idle: 1, // ひとりでに回る勢い（つかんでいる間は 0 に寄せる）
      m: 0, // 1 つの輪に重なった度合い（バネ）
      mv: 0,
      mt: 0,
      d: 0, // 入る動きの進み具合 0〜1
      yaw: 0,
      pitch: 0,
      tyaw: 0,
      tpitch: 0,
      dragging: false,
    };
    let diveT0 = 0;
    let diving = false;
    let leavingNow = false;
    let raf = 0;
    let last = 0;
    let visible = true;
    const timers: number[] = [];

    /* 陰: 板の「向き」から、手前が明るく・縁と奥が沈むように、板ごとの重ね色の濃さを決める（光は左上の手前から） */
    const shade = (i: number, rollDeg: number, tiltDeg: number) => {
      const rr = (rollDeg * Math.PI) / 180;
      const tt = (tiltDeg * Math.PI) / 180;
      const cr = Math.cos(rr);
      const sr = Math.sin(rr);
      const ct = Math.cos(tt);
      const st = Math.sin(tt);
      const els = shades[i];
      const last = shadeLast[i];
      const a0 = (S.angle[i] * Math.PI) / 180;
      const sa = Math.sin(a0);
      const ca = Math.cos(a0);
      for (let k = 0; k < SEGS; k++) {
        const sn = sa * SEG_COS[k] + ca * SEG_SIN[k];
        const cs = ca * SEG_COS[k] - sa * SEG_SIN[k];
        const y1 = -cs * st;
        const z2 = cs * ct;
        let o = 0;
        if (z2 > 0.02) {
          const x2 = sn * cr - y1 * sr;
          const y2 = sn * sr + y1 * cr;
          const dot = x2 * -0.34 + y2 * -0.5 + z2 * 0.8;
          const lit = clamp01(0.5 + 0.5 * dot);
          o = i === 0 ? SHADE_MAX[0] * lit * lit * lit : SHADE_MAX[i] * clamp01(0.62 * (1 - lit) + 0.38 * (1 - z2) * (1 - z2) * 2);
        }
        o = Math.round(o * 500) / 500;
        if (o !== last[k]) {
          last[k] = o;
          els[k].style.opacity = String(o);
        }
      }
    };

    let frameNo = 0;
    const render = (force = false) => {
      const m = S.m;
      // 陰はゆるやかに変わるので、1 フレームおきに書く（初回・サイズ変更・動きを減らす設定の切替は必ず書く）
      const doShade = force || (frameNo++ & 1) === 0;
      const e = smooth(S.d);
      const tiltM = MERGE_TILT + (-90 - MERGE_TILT) * smooth(S.d / 0.82);
      for (let i = 0; i < RINGS.length; i++) {
        const r = RINGS[i];
        const sw = reduce ? 0 : Math.sin(S.t * 0.55 + i * 2.1);
        const sw2 = reduce ? 0 : Math.sin(S.t * 0.41 + i * 1.3);
        const roll = lerp(r.roll + 5 * sw, 0, m);
        const tilt = lerp(r.tilt + 4 * sw2, tiltM, m);
        const sc = lerp(1, MERGE_R / r.R, m);
        const off = lerp(0, MERGE_OFF[i] * u, m);
        wraps[i].style.transform = `rotateZ(${roll.toFixed(2)}deg) rotateX(${tilt.toFixed(2)}deg) translateY(${off.toFixed(1)}px) scale(${sc.toFixed(4)})`;
        spins[i].style.transform = `rotateY(${S.angle[i].toFixed(2)}deg)`;
        if (doShade) shade(i, roll, tilt);
      }
      const bob = reduce ? 0 : Math.sin(S.t * 0.7) * 0.9 * u;
      ringsEl.style.transform = `translateY(${(bob - 12 * u * Math.min(1.1, m)).toFixed(1)}px) rotateX(${S.pitch.toFixed(2)}deg) rotateY(${S.yaw.toFixed(2)}deg) scale(${(1 + 0.05 * Math.min(1.15, m)).toFixed(4)})`;
      scene.style.transform = S.d > 0 ? `translateZ(${(DIVE_Z * u * e * e).toFixed(1)}px)` : "";
      if (persp) persp.style.transform = S.d > 0 ? `translate(${(dx * e).toFixed(1)}px, ${(dy * e).toFixed(1)}px)` : "";
      h1.style.opacity = S.d > 0 ? String(1 - clamp01((S.d - 0.3) / 0.35)) : "";
      hwrap.style.transform = S.d > 0 ? `scale(${(1 + 1.3 * e * e).toFixed(3)})` : "";
      veil.style.opacity = S.d > 0 ? String(smooth((S.d - 0.74) / 0.26)) : "0";
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      S.t += dt;

      if (diving) S.d = clamp01((now - diveT0) / DIVE_MS);

      // 余韻と、ひとりでに回る勢い
      if (!S.dragging) S.extra *= Math.exp(-dt / 0.8);
      S.idle += ((S.dragging ? 0 : 1) - S.idle) * Math.min(1, dt * 2.2);
      const boost = S.d * 520;
      if (!S.dragging) {
        for (let i = 0; i < RINGS.length; i++) {
          const r = RINGS[i];
          S.angle[i] += (r.speed * S.idle + (S.extra + boost) * r.mult) * dt;
        }
      }

      // 重なる度合い（バネ）
      let rem = dt;
      while (rem > 0) {
        const h = Math.min(rem, 1 / 120);
        const acc = 210 * (S.mt - S.m) - 20 * S.mv;
        S.mv += acc * h;
        S.m += S.mv * h;
        rem -= h;
      }

      // ポインタの視差（輪の全体がほんの少し向きを変える）
      const k = Math.min(1, dt * 3.2);
      const f = 1 - S.d;
      S.yaw += (S.tyaw * f - S.yaw) * k;
      S.pitch += (S.tpitch * f - S.pitch) * k;

      render();
      if (visible && !document.hidden && !reduce) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (raf || reduce || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    /* 業種を選んだとき: 一瞬 1 つの輪に重なり、ほどける */
    let pulseT = 0;
    const pulse = () => {
      if (reduce || leavingNow) return;
      S.mt = 1;
      window.clearTimeout(pulseT);
      pulseT = window.setTimeout(() => {
        if (!leavingNow) S.mt = 0;
        kick();
      }, 950);
      kick();
    };
    /* 入る: 重なって、輪の穴へ飛び込む */
    const go = (path: string) => {
      if (leavingNow) return;
      leavingNow = true;
      setLeaving(true);
      if (reduce) {
        router.push(path);
        return;
      }
      window.clearTimeout(pulseT);
      S.mt = 1;
      S.dragging = false;
      diving = true;
      diveT0 = performance.now();
      kick();
      timers.push(window.setTimeout(() => router.push(path), DIVE_MS + 20));
    };
    const nudge = (el: HTMLElement | null) => {
      if (!el || reduce) return;
      el.classList.remove("nudge");
      void el.offsetWidth;
      el.classList.add("nudge");
    };
    api.current = { pulse, go, nudge };

    /* ── ポインタ（つかんで回す） ── */
    type Sample = { t: number; x: number };
    let drag: { id: number; x0: number; y0: number; last: number; on: boolean; s: Sample[] } | null = null;
    const onDown = (e: PointerEvent) => {
      if (reduce || leavingNow) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if ((e.target as Element | null)?.closest("a,button,[data-nodrag]")) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, last: e.clientX, on: false, s: [{ t: e.timeStamp, x: e.clientX }] };
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && !reduce && !leavingNow) {
        const r = root.getBoundingClientRect();
        S.tyaw = (((e.clientX - r.left) / r.width) * 2 - 1) * 9;
        S.tpitch = -(((e.clientY - r.top) / r.height) * 2 - 1) * 5;
        kick();
      }
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0;
      const dy = e.clientY - drag.y0;
      if (!drag.on) {
        if (Math.abs(dx) < 6) return;
        if (Math.abs(dy) > Math.abs(dx) * 1.1) {
          drag = null; // 縦の動き（ページのスクロール）
          return;
        }
        drag.on = true;
        S.dragging = true;
        S.extra = 0;
        root.classList.add("is-touched");
        drag.last = e.clientX;
        try {
          root.setPointerCapture(e.pointerId);
        } catch {
          /* 取れなくても動く */
        }
        root.classList.add("is-drag");
        kick();
      }
      const step = e.clientX - drag.last;
      drag.last = e.clientX;
      for (let i = 0; i < RINGS.length; i++) S.angle[i] += step * 0.3 * RINGS[i].mult;
      drag.s.push({ t: e.timeStamp, x: e.clientX });
      while (drag.s.length > 2 && e.timeStamp - drag.s[0].t > 110) drag.s.shift();
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.on) {
        const a = drag.s[0];
        const b = drag.s[drag.s.length - 1];
        const span = (b.t - a.t) / 1000;
        const fresh = e.timeStamp - b.t < 90;
        const v = fresh && span > 0.012 ? ((b.x - a.x) / span) * 0.3 : 0; // 度/秒
        S.extra = Math.max(-520, Math.min(520, v));
        S.dragging = false;
        root.classList.remove("is-drag");
        kick();
      }
      drag = null;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        S.tyaw = 0;
        S.tpitch = 0;
      }
    };
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    root.addEventListener("pointerleave", onLeave);

    /* ── スクロール: ページを動かした勢いで、輪が少し回る（画面にあるあいだだけ） ── */
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const d = y - lastY;
      lastY = y;
      if (reduce || leavingNow || !visible || Math.abs(d) < 2) return;
      S.extra = Math.max(-420, Math.min(420, S.extra + d * 0.35));
      kick();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ── 矢印キー（入力欄の中は除く） ── */
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (reduce || leavingNow || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const r = root.getBoundingClientRect();
      if (r.bottom < window.innerHeight * 0.5 || r.top > window.innerHeight * 0.5) return;
      S.extra = Math.max(-520, Math.min(520, S.extra + (e.key === "ArrowRight" ? 150 : -150)));
      root.classList.add("is-touched");
      kick();
    };
    window.addEventListener("keydown", onKey);

    const onReduce = () => {
      reduce = mq.matches;
      if (reduce) {
        cancelAnimationFrame(raf);
        raf = 0;
        S.m = S.mt = S.mv = 0;
        S.extra = 0;
        S.yaw = S.pitch = 0;
        S.t = 0;
        render(true);
      } else kick();
    };
    mq.addEventListener("change", onReduce);

    // 画面の外・タブが裏のときは止める
    const io = new IntersectionObserver(
      (es) => {
        visible = es[es.length - 1].isIntersecting;
        if (visible) kick();
        else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 },
    );
    io.observe(root);
    const onVis = () => {
      if (!document.hidden) kick();
    };
    document.addEventListener("visibilitychange", onVis);

    // 戻る（bfcache）で戻ったとき、入る動きの途中の形を元に戻す
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      leavingNow = false;
      diving = false;
      S.d = 0;
      S.mt = 0;
      setLeaving(false);
      render(true);
      kick();
    };
    window.addEventListener("pageshow", onShow);

    const ro = new ResizeObserver(() => {
      measure();
      render(true);
    });
    ro.observe(probe);
    measure();
    render(true);
    kick();

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(pulseT);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pageshow", onShow);
      document.removeEventListener("visibilitychange", onVis);
      mq.removeEventListener("change", onReduce);
      io.disconnect();
      ro.disconnect();
    };
  }, [router]);

  /* ───────────── リンクの扱い（修飾キー付き・中クリックはブラウザに任せる） ───────────── */
  const plain = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  const onGo = (it: HubItem) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!plain(e)) return;
    e.preventDefault();
    api.current.go(it.path);
  };

  const live = items.filter((it) => it.live);
  const rest = items.filter((it) => !it.live);

  const renderTag = (it: HubItem) => {
    const cls = `mw-tag ${it.live ? "is-live" : it.enter ? "is-ready" : "is-wait"}`;
    const head = (
      <span className="mw-t-head">
        <span className="nm">{it.name}</span>
        {it.live && (
          <span className="en" aria-hidden="true">
            {it.en}
          </span>
        )}
      </span>
    );
    if (it.enter) {
      return (
        <li key={it.key} className="mw-li" data-k={it.key}>
          <Link
            href={it.path}
            prefetch={false}
            className={cls}
            onClick={onGo(it)}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") {
                api.current.pulse();
                router.prefetch(it.path);
              }
            }}
            onFocus={(e) => {
              if (e.currentTarget.matches(":focus-visible")) api.current.pulse();
            }}
          >
            {head}
            {it.live ? (
              <span className="mw-t-state">
                <i aria-hidden="true" />
                掲載中
              </span>
            ) : (
              <span className="mw-sr">掲載準備中</span>
            )}
            {it.live && (
              <span className="mw-t-figs">
                <span className="f">
                  <b>{fmt(gourmetTotal)}</b>
                  <em>店</em>
                </span>
                <span className="f">
                  <em>特集</em>
                  <b>{fmt(featureTotal)}</b>
                  <em>本</em>
                </span>
                <span className="f is-open" data-on={openNow ? "" : undefined}>
                  <em>いま営業中</em>
                  <b>{openNow ? fmt(openNow.open) : "–"}</b>
                  <em>軒</em>
                  <small>営業時間が確かな{openNow ? fmt(openNow.known) : "–"}店のうち</small>
                </span>
              </span>
            )}
            <span className="mw-t-go">
              <span className="t">{it.live ? `${it.name}に入る` : "ページを見る"}</span>
              <span className="ar" aria-hidden="true">
                →
              </span>
            </span>
          </Link>
        </li>
      );
    }
    return (
      <li key={it.key} className="mw-li" data-k={it.key}>
        <div
          className={cls}
          onPointerEnter={(e) => e.pointerType === "mouse" && api.current.pulse()}
          onClick={(e) => {
            api.current.pulse();
            api.current.nudge(e.currentTarget);
          }}
        >
          {head}
          <span className="mw-sr">掲載準備中</span>
        </div>
      </li>
    );
  };

  return (
    <section ref={rootRef} className={`mw${leaving ? " is-leaving" : ""}`} aria-labelledby="mw-h1">
      <div className="mw-stage">
        <div className="mw-hwrap">
            <h1 id="mw-h1" className="mw-h1">
            {HEADLINE_SEGS.map((seg, si) => {
              const base = HEADLINE_SEGS.slice(0, si).join("").length;
              return (
                <span key={si} className={`seg${si === HEADLINE_SEGS.length - 1 ? " l2" : ""}`}>
                  {Array.from(seg).map((c, ci) => (
                    <span key={ci} className="ch" style={{ ["--ci" as string]: base + ci } as CSSProperties}>
                      {c}
                    </span>
                  ))}
                </span>
              );
            })}
          </h1>
        </div>
        <span className="mw-hint" aria-hidden="true">
          <svg viewBox="0 0 48 24" width="36" height="18" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 5 4 12l10 7M34 5l10 7-10 7" />
          </svg>
        </span>
        <div className="mw-persp">
          <div className="mw-scene">
            <div className="mw-rings" aria-hidden="true">
              {RINGS.map((r, i) => (
                <Ring key={r.id} r={r} index={i} />
              ))}
            </div>
          </div>
        </div>
        <span className="mw-probe" aria-hidden="true" />
      </div>

      <header className="mw-bar" data-nodrag>
        <Link href="/" className="mw-logo" aria-label="マチノワ" aria-current="page">
          <span className="ja">マチノワ</span>
          <span className="en">Machinowa</span>
        </Link>
        <Link href="/find" prefetch={false} className="mw-find">
          <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M13 13l4.5 4.5" />
          </svg>
          <span>さがす</span>
        </Link>
      </header>

      <div className="mw-foot">
        <p className="mw-lead">{LEAD}</p>
        <ul className="mw-tags" data-nodrag>
          {live.map((it) => renderTag(it))}
          {/* 準備中の 5 つをひとまとめに括る見出し（「掲載準備中」は、ここに 1 回だけ。各札には読み上げ用に残す） */}
          <li className="mw-grp" aria-hidden="true">
            <i />
            <span>掲載準備中</span>
          </li>
          {rest.map((it) => renderTag(it))}
        </ul>
      </div>
      <div className="mw-veil" aria-hidden="true" />
    </section>
  );
}
