"use client";
/**
 * 特集記事の「店を地図でまとめて見る」（巡り図）。公開スイッチ ON のときだけ FeatureClient が React.lazy で読み込む。
 *
 * 記事に出てくる店を、座標から自分で描いた略図（実際の地図タイルは使わない・北が上・縦横同じ縮尺）に並べ、
 * 出発の店から「まだ訪ねていない一番近い店へ」の順に線を引く（hop）。店どうしが離れている記事（wide）は、順路は描かず、
 * 出発の店からの直線距離の輪で見せる。順番は近さから機械的に並べた目安。距離は直線だけで、徒歩の分数・道のりは出さない。
 * 計算は lib/portal/fmap.ts、配置は lib/portal/fmapLayout.ts、データは lib/portal/fmapData.ts（サーバー）。
 *
 * 動き: 画面に入ったとき、またはもう一度たどる・出発の店を変えたとき、ペンが順路をたどって線が引かれ、
 * 通った店に朱の判子が押される（一覧の番号も同時に朱になる）。prefers-reduced-motion では最初から描き終えた状態。
 */
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import SaveButton from "./SaveButton";
import { addManySaved, announce, getList, useSavedList } from "@/lib/portal/savedList";
import { trackTap } from "@/lib/portal/track";
import { sized } from "@/lib/imageUrl";
import { fmtDist, fmtStraight, frameHeight, orderFrom, textW, type FmapData } from "@/lib/portal/fmap";
import { DISC_R, layoutFmap, type LayoutOut } from "@/lib/portal/fmapLayout";
import { CSS } from "./featureMapCss";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeIO = (v: number) => 0.5 - Math.cos(Math.PI * clamp01(v)) / 2;
const easeOut = (v: number) => 1 - (1 - clamp01(v)) ** 3;

function IconArrow({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" aria-hidden="true">
      <path d="M6 14 14 6M7 6h7v7" />
    </svg>
  );
}
function IconDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M7 1.5v10M2.8 7.6 7 11.8l4.2-4.2" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" aria-hidden="true">
      <path d="m3 8.4 3.2 3.2L13 4.6" />
    </svg>
  );
}
function IconReplay() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M16.2 10a6.2 6.2 0 1 1-2-4.6" />
      <path d="M16.6 2.8v3.6h-3.6" />
    </svg>
  );
}

export default function FeatureMap({ data }: { data: FmapData }) {
  const { mode, stops, aside, stations } = data;
  const [start, setStart] = useState(stops[0].id);
  const [pin, setPin] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [seen, setSeen] = useState(false);
  const [run, setRun] = useState(0);
  const [said, setSaid] = useState("");
  const [size, setSize] = useState({ w: 760, h: 500, ready: false });

  const cart = useRef<HTMLDivElement>(null);
  const cnt = useRef<HTMLElement>(null);
  const rng = useRef<HTMLInputElement>(null);
  const gotRef = useRef(0);
  const [scrubK, setScrubK] = useState<number | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const raf = useRef(0);
  const t0 = useRef(0);
  const running = useRef(false);
  const reduced = useRef(false);

  const ord = useMemo(() => orderFrom(mode, stops, start), [mode, stops, start]);
  const sel = pin ?? start;
  const selK = Math.max(0, ord.stops.findIndex((s) => s.id === sel));
  const selStop = ord.stops[selK];
  const L: LayoutOut = useMemo(
    () => layoutFmap({ stops, order: ord, mode, stations, w: size.w, h: size.h }),
    [stops, ord, mode, stations, size.w, size.h],
  );
  const Lref = useRef(L);
  Lref.current = L;
  const ordRef = useRef(ord);
  ordRef.current = ord;

  /* 幅を測る。図は px 単位で描く（文字・線の太さを画面の幅によらず一定にする） */
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const measure = () => {
      const w = Math.round(el.clientWidth);
      if (!w) return;
      const h = frameHeight(stops, w);
      setSize((s) => (s.w === w && s.h === h && s.ready ? s : { w, h, ready: true }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stops]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    const on = () => (reduced.current = mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  /* 画面に入ったら 1 度だけ描き始める */
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /*
   * 描画の状態を DOM に書く。入力は 2 通り:
   *  - 時刻 t（ms）。t = -1 は描く前、Infinity は描き終わり。自動で描くとき（rAF）に使う
   *  - 位置 f（0〜1）。順路をつまみでたどるとき。hop は順路の長さに対する割合、wide は 店の並びに対する割合
   * 返り値は、時刻で描くときの全体の長さ（ms）。
   */
  const drive = (t: number, f?: number) => {
    const root = svg.current;
    const lay = Lref.current;
    const o = ordRef.current;
    if (!root || !lay) return;
    const scrub = f !== undefined;
    const n = o.stops.length;
    const P = o.stops.map((s) => lay.anchor[s.id]);
    const T0 = 380;
    const reached = new Array<number>(n).fill(0);
    const legDone = new Array<boolean>(n).fill(false);
    let total = 0;
    let frac = 0;
    let done = false;
    let ringP = (j: number) => easeOut((t - 300 - j * 110) / 760);

    if (mode === "hop") {
      const len: number[] = [0];
      for (let k = 1; k < n; k++) len.push(Math.hypot(P[k].x - P[k - 1].x, P[k].y - P[k - 1].y));
      const maxLen = Math.max(1, ...len);
      const sum = len.reduce((a, b) => a + b, 0) || 1;
      const prog: number[] = new Array(n).fill(0);
      let walker = 0;
      if (scrub) {
        const D = clamp01(f!) * sum;
        let acc = 0;
        for (let k = 1; k < n; k++) {
          prog[k] = clamp01((D - acc) / (len[k] || 1));
          acc += len[k];
        }
        walker = 1;
        done = f! >= 0.999;
      } else {
        const st: number[] = [0];
        const en: number[] = [0];
        const ar: number[] = [T0];
        for (let k = 1; k < n; k++) {
          const dur = 320 + 380 * Math.sqrt(len[k] / maxLen);
          st[k] = ar[k - 1] + 150;
          en[k] = st[k] + dur;
          ar[k] = en[k];
        }
        total = ar[n - 1] + 520;
        for (let k = 1; k < n; k++) prog[k] = t >= en[k] ? 1 : t <= st[k] ? 0 : easeIO((t - st[k]) / (en[k] - st[k]));
        walker = t >= T0 && t < total ? (t > total - 380 ? clamp01((total - t) / 380) : 1) : 0;
        done = t === Infinity || (t >= 0 && t >= total - 320);
      }
      let drawn = 0;
      let px = P[0].x;
      let py = P[0].y;
      for (let k = 1; k < n; k++) {
        drawn += len[k] * prog[k];
        if (prog[k] > 0 && prog[k] < 1) {
          px = P[k - 1].x + (P[k].x - P[k - 1].x) * prog[k];
          py = P[k - 1].y + (P[k].y - P[k - 1].y) * prog[k];
        } else if (prog[k] >= 1) {
          px = P[k].x;
          py = P[k].y;
        }
        legDone[k] = prog[k] >= 1;
        reached[k] = prog[k] >= 1 ? 1 : 0; // 着いた店 = その区間を描き終えた店
      }
      reached[0] = scrub ? 1 : t >= T0 ? 1 : 0;
      frac = drawn / sum;
      const off = String(1 - clamp01(frac));
      root.querySelectorAll<SVGElement>(".fm-route,.fm-bleed").forEach((e) => (e.style.strokeDashoffset = off));
      const wk = root.querySelector<SVGGElement>(".fm-walker");
      if (wk) {
        wk.style.opacity = String(walker);
        wk.setAttribute("transform", `translate(${px.toFixed(1)} ${py.toFixed(1)})`);
      }
    } else {
      const s0 = 380;
      const dur = 640;
      const sAt = (i: number) => s0 + (i - 1) * 120;
      const prog: number[] = new Array(n).fill(0);
      if (scrub) {
        for (let i = 1; i < n; i++) prog[i] = clamp01(f! * (n - 1) - (i - 1));
        ringP = () => (f! > 0 ? 1 : 0);
        done = f! >= 0.999;
      } else {
        for (let i = 1; i < n; i++) prog[i] = easeOut((t - sAt(i)) / dur);
        total = sAt(n - 1) + dur + 300;
        done = t === Infinity || (t >= 0 && t >= total - 320);
      }
      for (let i = 1; i < n; i++) {
        const e = root.querySelector<SVGElement>(`[data-ray="${i}"]`);
        if (e) e.style.strokeDashoffset = String(1 - prog[i]);
        reached[i] = prog[i] >= 0.86 ? 1 : 0;
        legDone[i] = prog[i] >= 0.92;
      }
      reached[0] = scrub ? 1 : t >= s0 ? 1 : 0;
      frac = n > 1 ? prog.slice(1).reduce((a, b) => a + b, 0) / (n - 1) : 0;
      root.querySelectorAll<SVGElement>("[data-ring]").forEach((e) => {
        const p = ringP(Number(e.getAttribute("data-ring")));
        e.style.opacity = String(p);
        e.style.transform = `scale(${0.7 + 0.3 * p})`;
      });
      root.querySelectorAll<SVGElement>("[data-ringl]").forEach((e) => {
        e.style.opacity = String(ringP(Number(e.getAttribute("data-ringl"))));
      });
    }

    const fin = t === Infinity;
    root.querySelectorAll<SVGElement>("[data-leg]").forEach((e) => {
      const k = Number(e.getAttribute("data-leg"));
      const v = fin || legDone[k] ? "1" : "0";
      if (e.getAttribute("data-done") !== v) e.setAttribute("data-done", v);
    });
    const got = fin ? n : reached.reduce((a, b) => a + b, 0);
    gotRef.current = got;
    if (cnt.current) {
      const txt = got >= n ? `${n}軒` : `${got}/${n}`;
      if (cnt.current.textContent !== txt) cnt.current.textContent = txt;
    }
    if (cart.current) {
      const dn = fin || done ? "1" : "0";
      if (cart.current.getAttribute("data-done") !== dn) cart.current.setAttribute("data-done", dn);
    }
    if (rng.current && !scrub) rng.current.value = String(Math.round((fin ? 1 : clamp01(frac)) * 1000));
    const rows = list.current?.querySelectorAll<HTMLElement>("li[data-krow]");
    for (let k = 0; k < n; k++) {
      const v = fin ? "1" : String(reached[k]);
      const g = root.querySelector<SVGElement>(`[data-k="${k}"]`);
      if (g && g.getAttribute("data-reached") !== v) g.setAttribute("data-reached", v);
    }
    rows?.forEach((r) => {
      const k = Number(r.getAttribute("data-krow"));
      const v = fin ? "1" : String(reached[k] ?? 0);
      if (r.getAttribute("data-reached") !== v) r.setAttribute("data-reached", v);
    });
    return total;
  };
  const driveRef = useRef(drive);
  driveRef.current = drive;

  const begin = () => {
    cancelAnimationFrame(raf.current);
    running.current = false;
    setScrubK(null);
    if (reduced.current) {
      driveRef.current(Infinity);
      return;
    }
    driveRef.current(-1);
    running.current = true;
    t0.current = performance.now();
    const tick = (now: number) => {
      const t = now - t0.current;
      const total = driveRef.current(t) ?? 0;
      if (t < total) raf.current = requestAnimationFrame(tick);
      else {
        running.current = false;
        driveRef.current(Infinity);
      }
    };
    raf.current = requestAnimationFrame(tick);
  };

  /* 描き始める・描き直す（もう一度・出発の店を変えたとき） */
  useIso(() => {
    if (!size.ready) return;
    if (!seen) {
      if (!reduced.current) driveRef.current(-1);
      return;
    }
    begin();
    return () => {
      cancelAnimationFrame(raf.current);
      running.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, start, seen, size.ready, mode]);

  /* 描いていないあいだに大きさが変わったら、いまの状態に合わせ直す */
  useIso(() => {
    if (!size.ready || running.current) return;
    driveRef.current(seen || reduced.current ? Infinity : -1);
  }, [size.w, size.h, seen, size.ready]);

  const pick = (id: string) => {
    setPin(id);
    const k = ord.stops.findIndex((s) => s.id === id);
    const s = ord.stops[k];
    if (!s) return;
    setSaid(`「${s.name}」を選びました。${distLine(k)}`);
  };
  const distLine = (k: number): string => {
    if (k === 0) return mode === "hop" ? "ここが出発です。" : "出発の店です。";
    return mode === "hop"
      ? `ひとつ前の店「${ord.stops[k - 1].name}」から${fmtStraight(ord.d[k])}。`
      : `出発の店から${fmtStraight(ord.d[k])}。`;
  };
  const setStartTo = (id: string) => {
    setStart(id);
    setPin(id);
    setSaid(`「${stops.find((s) => s.id === id)?.name ?? ""}」を出発にして、順番を引き直しました。`);
  };

  const savedIds = useSavedList();
  const allSaved = ord.stops.every((s) => savedIds.includes(s.id));
  const saveAll = () => {
    const before = new Set(getList());
    const r = addManySaved(ord.stops.map((s) => s.id));
    for (const s of ord.stops) if (!before.has(s.id)) trackTap({ storeId: s.id, kind: "save", page: typeof location !== "undefined" ? decodeURI(location.pathname) : "" });
    announce(
      r.added > 0
        ? `${r.added}軒を候補に入れました${r.skipped > 0 ? `（${r.skipped}軒は50店の上限で入れられませんでした）` : ""}`
        : r.skipped > 0
          ? "候補リストは50店までです。ほかの店を外すと入れられます。"
          : "この店はすべて候補に入っています",
    );
  };
  const ticks = useMemo(() => {
    const n2 = ord.stops.length;
    if (mode !== "hop") return ord.stops.map((_, k) => (n2 > 1 ? k / (n2 - 1) : 0));
    const len = [0];
    for (let k = 1; k < n2; k++) len.push(Math.hypot(L.anchor[ord.stops[k].id].x - L.anchor[ord.stops[k - 1].id].x, L.anchor[ord.stops[k].id].y - L.anchor[ord.stops[k - 1].id].y));
    const sum = len.reduce((a, b) => a + b, 0) || 1;
    let acc = 0;
    return len.map((l) => (acc += l) / sum);
  }, [L, ord, mode]);
  const onScrub = (e: React.FormEvent<HTMLInputElement>) => {
    cancelAnimationFrame(raf.current);
    running.current = false;
    driveRef.current(0, Number(e.currentTarget.value) / 1000);
    setScrubK(gotRef.current);
  };
  const routeD = ord.stops.map((s, k) => `${k ? "L" : "M"}${L.anchor[s.id].x.toFixed(1)} ${L.anchor[s.id].y.toFixed(1)}`).join("");
  const maxD = Math.max(1, ...ord.d);
  const n = ord.stops.length;
  const hopLine = mode === "hop";

  return (
    <section className="fm" aria-labelledby="fm-h" data-mode={mode} data-seen={seen ? "1" : "0"}>
      <style href="fm-base" precedence="fm">
        {CSS}
      </style>

      <div className="fm-head">
        <div>
          <div className="fm-kick">MAP</div>
          <span className="fm-big" aria-hidden="true">
            巡
          </span>
        </div>
        <div>
          <h3 className="fm-h" id="fm-h">
            店を、<em>地図で。</em>
          </h3>
          <p className="fm-sub">
            {hopLine ? (
              <>
                この記事の{n}軒を、座標から描いた図に並べました。出発の店から、まだ訪ねていない一番近い店へ。
                <b>順番は近さから機械的に並べた目安</b>で、店どうしの距離は<b>直線</b>です。道のりや徒歩の時間ではありません。
              </>
            ) : (
              <>
                この記事の{n}軒は、いちばん離れた店どうしで直線{fmtDist(data.spanM)}ほど。はしごには向かないので、順路は引かず、
                <b>出発の店からの直線距離</b>で近い順に並べました。順番は機械的な目安で、道のりや移動の時間ではありません。
              </>
            )}
          </p>
        </div>
      </div>

      <div className="fm-body">
        <div className="fm-left">
          <div className="fm-frame" ref={frame} data-ready={size.ready ? "1" : "0"} style={size.ready ? { minHeight: size.h } : undefined}>
            <button type="button" className="fm-replay" onClick={() => setRun((r) => r + 1)} data-cursor="REPLAY">
              <IconReplay />
              {hopLine ? "もう一度たどる" : "もう一度ひろげる"}
            </button>
            <div className="fm-cart" ref={cart} aria-hidden="true">
              <b>巡り図</b>
              <i ref={cnt}>{n}軒</i>
            </div>
            <svg
              ref={svg}
              className="fm-svg"
              width={size.w}
              height={size.h}
              viewBox={`0 0 ${size.w} ${size.h}`}
              role="img"
              aria-label={`この記事の店${n}軒の位置を、座標から計算して並べた略図。北が上、格子のひと目は約${L.unitLabel}。同じ内容を右（または下）の一覧にも書いています。`}
            >
              <defs>
                <filter id="fm-paper" x="0" y="0" width="100%" height="100%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n" />
                  <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.28  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.9 -0.34" />
                </filter>
              </defs>
              <rect x={0} y={0} width={size.w} height={size.h} filter="url(#fm-paper)" opacity={0.5} aria-hidden="true" />
              <g className="fm-grid" aria-hidden="true">
                {L.gridX.map((x, i) => (
                  <line key={`x${i}`} x1={x} y1={0} x2={x} y2={size.h} />
                ))}
                {L.gridY.map((y, i) => (
                  <line key={`y${i}`} x1={0} y1={y} x2={size.w} y2={y} />
                ))}
                <path
                  className="fm-cross"
                  d={L.gridX
                    .flatMap((x) => L.gridY.map((y) => `M${(x - 4).toFixed(1)} ${y.toFixed(1)}H${(x + 4).toFixed(1)}M${x.toFixed(1)} ${(y - 4).toFixed(1)}V${(y + 4).toFixed(1)}`))
                    .join("")}
                />
              </g>
              <rect className="fm-rule" x={7} y={7} width={size.w - 14} height={size.h - 14} aria-hidden="true" />

              {L.stations.map((st) => (
                <g key={st.name + st.x} className="fm-st" aria-hidden="true">
                  <rect x={st.x - 3.5} y={st.y - 3.5} width={7} height={7} />
                  {st.label && (
                    <text className="fm-st-t" x={st.label.x} y={st.label.y} textAnchor={st.label.anchor}>
                      {st.label.text}
                    </text>
                  )}
                </g>
              ))}

              {!hopLine && (
                <g aria-hidden="true">
                  {L.rings.map((r, j) => (
                    <g key={`${start}-r${j}`}>
                      <circle className="fm-ring" data-ring={j} cx={L.anchor[ord.stops[0].id].x} cy={L.anchor[ord.stops[0].id].y} r={r.r} />
                      {r.label && (
                        <text className="fm-ringlab" data-ringl={j} x={r.label.x} y={r.label.y} textAnchor="middle">
                          {r.label.text}
                        </text>
                      )}
                    </g>
                  ))}
                  {ord.stops.slice(1).map((s, i) => (
                    <line
                      key={`${start}-ray${s.id}`}
                      className="fm-ray"
                      data-ray={i + 1}
                      pathLength={1}
                      x1={L.anchor[ord.stops[0].id].x}
                      y1={L.anchor[ord.stops[0].id].y}
                      x2={L.anchor[s.id].x}
                      y2={L.anchor[s.id].y}
                    />
                  ))}
                </g>
              )}

              {hopLine && (
                <g aria-hidden="true">
                  <path className="fm-bleed" pathLength={1} d={routeD} />
                  <path className="fm-route" pathLength={1} d={routeD} />
                </g>
              )}
              <g aria-hidden="true">
                {L.legs.map((g) => (
                  <g key={`${start}-leg${g.k}`}>
                    {hopLine && g.px > 46 && (
                      <path className="fm-chev" data-leg={g.k} data-done="1" d="M-5 -4.5 5 0-5 4.5z" transform={`translate(${g.mx.toFixed(1)} ${g.my.toFixed(1)}) rotate(${g.ang.toFixed(1)})`} />
                    )}
                    {g.label && (
                      <g data-leg={g.k} data-done="1">
                        <rect
                          className="fm-pill"
                          x={g.label.x - (textW(g.label.text, 12) + 12) / 2}
                          y={g.label.y - 13}
                          width={textW(g.label.text, 12) + 12}
                          height={18}
                        />
                        <text className="fm-leglab" x={g.label.x} y={g.label.y} textAnchor="middle">
                          {g.label.text}
                        </text>
                      </g>
                    )}
                  </g>
                ))}
              </g>

              {ord.stops.map((s) => {
                const a = L.anchor[s.id];
                const d = L.disc[s.id];
                const off = Math.hypot(a.x - d.x, a.y - d.y) > 3;
                return (
                  <g key={s.id} aria-hidden="true">
                    {off && <line className="fm-leader" x1={a.x} y1={a.y} x2={d.x} y2={d.y} />}
                    <circle className="fm-anchor" cx={a.x} cy={a.y} r={2.6} />
                  </g>
                );
              })}

              {ord.stops.map((s, k) => {
                const d = L.disc[s.id];
                const lab = L.label[s.id];
                return (
                  <g key={s.id} aria-hidden="true">
                    <g
                      className="fm-pt"
                      transform={`translate(${d.x.toFixed(1)} ${d.y.toFixed(1)})`}
                      data-k={k}
                      data-reached="1"
                      data-sel={sel === s.id ? "1" : "0"}
                      data-hover={hover === s.id ? "1" : "0"}
                      data-cursor="PICK"
                      onClick={() => pick(s.id)}
                      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(s.id)}
                      onPointerLeave={(e) => e.pointerType === "mouse" && setHover(null)}
                    >
                      <circle className="fm-hit" r={26} />
                      <circle className="fm-ping" r={DISC_R + 6} />
                      {k === 0 && <circle className="fm-startring" r={DISC_R + 5} />}
                      <g className="fm-stamp">
                        <circle className="fm-disc" r={DISC_R} />
                        <text className="fm-num" y={5.4}>
                          {k + 1}
                        </text>
                      </g>
                    </g>
                    {lab && (
                      <text className="fm-lab" x={lab.x} y={lab.y} textAnchor={lab.anchor} data-on={sel === s.id || hover === s.id ? "1" : "0"}>
                        {pin === s.id || hover === s.id ? (lab.full ?? lab.text) : lab.text}
                      </text>
                    )}
                    {k === 0 && L.flag && (
                      <g className="fm-flag" aria-hidden="true">
                        <rect x={L.flag.x - 17} y={L.flag.y} width={34} height={17} />
                        <text x={L.flag.x} y={L.flag.y + 12.5}>
                          出発
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {hopLine && (
                <g className="fm-walker" aria-hidden="true">
                  <circle className="g" r={13} />
                  <circle className="c" r={4.6} />
                </g>
              )}

              <g className="fm-north" aria-hidden="true">
                <line x1={L.north.x} y1={L.north.y + 6} x2={L.north.x} y2={L.north.y + 30} />
                <path d={`M${L.north.x} ${L.north.y - 6}l6 16h-12z`} />
                <text x={L.north.x} y={L.north.y + 46}>
                  北
                </text>
              </g>
              <g className="fm-scale" aria-hidden="true">
                <line x1={L.scale.x} y1={L.scale.y} x2={L.scale.x + L.stepPx} y2={L.scale.y} />
                <line x1={L.scale.x} y1={L.scale.y - 5} x2={L.scale.x} y2={L.scale.y + 5} />
                <line x1={L.scale.x + L.stepPx} y1={L.scale.y - 5} x2={L.scale.x + L.stepPx} y2={L.scale.y + 5} />
                <text x={L.scale.x + L.stepPx + 10} y={L.scale.y + 4}>
                  格子ひと目 約{L.unitLabel}
                </text>
              </g>
            </svg>
          </div>



          <div className="fm-scrub">
            <label htmlFor="fm-range">{hopLine ? "順路をたどる" : "店をひろげる"}</label>
            <div className="fm-rangewrap">
              <input
                id="fm-range"
                ref={rng}
                className="fm-range"
                type="range"
                min={0}
                max={1000}
                step={1}
                defaultValue={1000}
                onInput={onScrub}
                aria-valuetext={scrubK === null ? undefined : scrubK <= 0 ? "まだ出発していません" : `${scrubK}軒目「${ord.stops[Math.min(scrubK, n) - 1]?.name ?? ""}」まで`}
                data-cursor="DRAG"
              />
              <div className="fm-ticks" aria-hidden="true">
                {ticks.map((p, k) => (
                  <i key={k} style={{ left: `calc(11px + (100% - 22px) * ${p.toFixed(4)})` }} />
                ))}
              </div>
            </div>
          </div>

          <div className="fm-card" data-nothumb={selStop.image ? "0" : "1"} key={selStop.id}>
            {selStop.image && <img className="fm-thumb" src={sized(selStop.image, 240)} alt="" width={96} height={96} loading="lazy" />}
            <div>
              <div className="fm-ctop">
                <span>{selStop.rank ? `記事 ${selStop.rank}` : "この記事の店"}</span>
                {selK === 0 && <span className="fm-badge">出発の店</span>}
              </div>
              <h4 className="fm-cname">{selStop.name}</h4>
              <p className="fm-cmeta">
                {[selStop.cuisine, selStop.area].filter(Boolean).join(" · ")}
                {selStop.station ? `${selStop.cuisine || selStop.area ? " · " : ""}最寄り ${selStop.station}` : ""}
              </p>
              <p className="fm-cdist">{distLine(selK)}</p>
              {selStop.approx && <p className="fm-cwarn">位置は住所から求めたもので、街区ひとつぶんほどの誤差があります。</p>}
            </div>
            <div className="fm-acts">
              {selK === 0 ? (
                <span className="fm-btn on">
                  <IconCheck />
                  出発の店
                </span>
              ) : (
                <button type="button" className="fm-btn pri" onClick={() => setStartTo(selStop.id)} data-cursor="START">
                  ここから出発にする
                </button>
              )}
              <Link className="fm-btn" href={selStop.href} prefetch={false} data-cursor="VIEW">
                店のページを見る
                <IconArrow size={16} />
              </Link>
              <SaveButton id={selStop.id} name={selStop.name} variant="inline" />
            </div>
          </div>
          <p className="fm-note">
            点か一覧の店を選ぶと札が出て、「ここから出発にする」で順番が引き直されます。位置は店の座標（緯度・経度）から計算した相対位置で、<b>実際の地図ではありません</b>。北が上、格子のひと目は約{L.unitLabel}。
            {L.stations.length > 0 && "四角の印は、各店の案内に最寄り駅として書かれている駅です。"}
          </p>
          <p className="fm-sr" aria-live="polite">
            {said}
          </p>
        </div>

        <div className="fm-right">
          <div className="fm-listh">
            <span>{hopLine ? "近い順の目安" : "出発の店から近い順"}</span>
            <span>{n}軒</span>
          </div>
          <ol className="fm-list" ref={list}>
            {ord.stops.map((s, k) => {
              const isSel = sel === s.id;
              return (
                <li
                  key={s.id}
                  className="fm-li"
                  data-krow={k}
                  data-reached="1"
                  data-line={hopLine && n > 1 ? "1" : "0"}
                  data-first={k === 0 ? "1" : "0"}
                  data-last={k === n - 1 ? "1" : "0"}
                >
                  {hopLine && k > 0 && (
                    <div className="fm-leg">
                      <IconDown />
                      <span>{fmtStraight(ord.d[k])}</span>
                      <span className="fm-bar" style={{ width: `${Math.max(6, Math.round((ord.d[k] / maxD) * 100))}%` }} aria-hidden="true" />
                    </div>
                  )}
                  <div
                    className="fm-row"
                    data-sel={isSel ? "1" : "0"}
                    data-hover={hover === s.id ? "1" : "0"}
                    data-start={k === 0 ? "1" : "0"}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setHover(s.id)}
                    onPointerLeave={(e) => e.pointerType === "mouse" && setHover(null)}
                  >
                    <button
                      type="button"
                      className="fm-pick"
                      aria-current={isSel ? "true" : undefined}
                      onClick={() => pick(s.id)}
                      onFocus={() => setHover(s.id)}
                      onBlur={() => setHover(null)}
                      data-cursor="PICK"
                    >
                      <span className="fm-mk" aria-hidden="true">
                        {k + 1}
                      </span>
                      <span>
                        <span className="fm-nm">
                          {s.name}
                          {k === 0 && <i>出発</i>}
                        </span>
                        <span className="fm-mt">{[s.cuisine, s.area].filter(Boolean).join(" · ")}</span>
                        {!hopLine && k > 0 && (
                          <span className="fm-mt">
                            <b>出発の店から{fmtStraight(ord.d[k])}</b>
                            <span className="fm-bar w" style={{ width: `${Math.max(4, Math.round((ord.d[k] / maxD) * 100))}%` }} aria-hidden="true" />
                          </span>
                        )}
                      </span>
                    </button>
                    <Link className="fm-go" href={s.href} prefetch={false} aria-label={`${s.name}のページを開く`} data-cursor="VIEW">
                      <IconArrow />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>

          <button type="button" className="fm-btn pri fm-all" disabled={allSaved} onClick={saveAll} data-cursor="SAVE">
            {allSaved ? `${n}軒すべて候補に入っています` : hopLine ? `この順で${n}軒を、すべて候補に入れる` : `${n}軒を、すべて候補に入れる`}
          </button>

          {aside.length > 0 && (
            <div className="fm-aside">
              <h4>図に出せない店</h4>
              <p>位置のデータがない店は、図には置かず（位置は作りません）、ここに並べます。</p>
              <ul>
                {aside.map((a, i) => (
                  <li key={a.name + i}>
                    {a.href ? (
                      <Link href={a.href} prefetch={false} data-cursor="VIEW">
                        <span>{a.name}</span>
                        <IconArrow size={16} />
                      </Link>
                    ) : (
                      <span>
                        <span>{a.name}</span>
                        <small>店のページがありません</small>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
