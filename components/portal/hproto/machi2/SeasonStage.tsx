/* eslint-disable @next/next/no-img-element */
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { IMG, STILL_SRC } from "./const";
import { SEASONS, SEASON_SEC, seasonSrc, type Season } from "./season";
import { setSeason } from "./seasonStore";

// 2026-10-21 オーナーの新しい季節の絵 4 枚(川辺の公園。楕円の写真なし)は 4 枚とも 2000×667
const SIZE: Record<Season, [number, number]> = { spring: [2000, 667], summer: [2000, 667], autumn: [2000, 667], winter: [2000, 667] };
type Layer = { id: number; season: Season };

/**
 * 最初の画面の背景の絵(春夏秋冬)。季節の札(ボタン)は無し。
 *  - 最初の季節は親(サーバー)が日本時間の月から決めて渡す。ここは続きを受け持つ
 *  - 約 6 秒ごとに次の季節へ。「輪」が中央(川と橋)から円形に広がって前の絵を覆う(clip-path)。縁に白い光の輪が 1 本走る
 *  - 自動の切り替えは setInterval(250ms) で経過を数える。画面外・非表示タブでは数えない(戻ると続きから)
 *  - 切り替え前に次の絵を decode まで済ませる。最初の季節の絵だけ優先、ほかは表示後に順に読む
 *  - prefers-reduced-motion: 自動の切り替えなし
 *  - still(試作 /proto-home/still 用。本番は渡さない=今のまま): 季節の絵の代わりに 1 枚の絵(hero-still.webp)だけを出す。切り替え・輪・タイマーは動かさない
 */
export default function SeasonStage({ initial, still = false }: { initial: Season; still?: boolean }) {
  return still ? <StillStage initial={initial} /> : <SeasonCycle initial={initial} />;
}

/** 1 枚の絵だけの背景。絵の位置・切り出し(.h2-sbg / .h2-bg)は季節の絵と同じ。季節は最初の 1 回だけ seasonStore に知らせる(特集スライドの 1 枚目は今まで通りその季節) */
function StillStage({ initial }: { initial: Season }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setSeason(initial);
    const st = root.current?.closest<HTMLElement>(".h2-hero-stage") ?? null;
    const hero = st?.closest<HTMLElement>(".h2-hero") ?? null;
    if (hero) hero.dataset.season = initial;
    // 画面外・非表示タブでは飾りの動き(光の筋・粒)を止める(季節の切り替えと同じ)
    const f = { off: false, hid: false };
    const pause = () => { if (st) st.toggleAttribute("data-pause", f.off || f.hid); };
    let io: IntersectionObserver | undefined;
    if (hero) { io = new IntersectionObserver((es) => { f.off = !es.some((e) => e.isIntersecting); pause(); }); io.observe(hero); }
    const vis = () => { f.hid = document.hidden; pause(); };
    document.addEventListener("visibilitychange", vis); vis();
    return () => { io?.disconnect(); document.removeEventListener("visibilitychange", vis); };
  }, [initial]);
  return (
    <div ref={root} className="h2-seasonroot">
      <div className="h2-bgwrap" aria-hidden="true">
        <div className="h2-sbg" data-s="still">
          <img className="h2-bg" src={STILL_SRC} alt="" width={2000} height={667} fetchPriority="high" />
        </div>
      </div>
    </div>
  );
}

function SeasonCycle({ initial }: { initial: Season }) {
  const [layers, setLayers] = useState<Layer[]>([{ id: 0, season: initial }]);
  const root = useRef<HTMLDivElement>(null);
  const curRef = useRef<Season>(initial);
  const busy = useRef(false);
  const pending = useRef<Season | null>(null);
  const goRef = useRef<(t: Season) => Promise<void>>(async () => {});
  const nid = useRef(0);
  const cache = useRef(new Map<Season, Promise<void>>());
  const flags = useRef({ off: false, hid: false });
  const elapsed = useRef(0);
  const reduced = useRef(false);

  const stage = () => root.current?.closest<HTMLElement>(".h2-hero-stage") ?? null;
  const applyPause = useCallback(() => {
    const f = flags.current, st = stage();
    if (st) st.toggleAttribute("data-pause", f.off || f.hid);
  }, []);

  const warm = useCallback((s: Season) => {
    let p = cache.current.get(s);
    if (!p) {
      const im = new Image();
      im.src = seasonSrc(IMG, s);
      p = (typeof im.decode === "function" ? im.decode() : Promise.resolve()).catch(() => {});
      cache.current.set(s, p);
    }
    return p;
  }, []);

  const go = useCallback(async (target: Season) => {
    // 切り替えの最中に押された札は、終わってから(最後に押したものだけ)続けて切り替える
    if (busy.current) { pending.current = target; return; }
    if (target === curRef.current) return;
    busy.current = true; pending.current = null;
    await Promise.race([warm(target), new Promise((r) => setTimeout(r, 4000))]);
    const id = ++nid.current;
    curRef.current = target; elapsed.current = 0;
    setLayers((l) => [l[l.length - 1], { id, season: target }]);
    setSeason(target);
    const hero = stage()?.closest<HTMLElement>(".h2-hero");
    if (hero) hero.dataset.season = target;
    window.setTimeout(() => {
      setLayers((l) => l.slice(-1)); busy.current = false;
      const p = pending.current; pending.current = null;
      if (p && p !== curRef.current) void goRef.current(p);
    }, reduced.current ? 0 : 1750);
  }, [warm]);
  useEffect(() => { goRef.current = go; }, [go]);

  const next = useCallback(() => {
    const i = SEASONS.indexOf(curRef.current);
    void go(SEASONS[(i + 1) % SEASONS.length]);
  }, [go]);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSeason(initial);
    const hero = stage()?.closest<HTMLElement>(".h2-hero");
    if (hero) hero.dataset.season = curRef.current;
    // 次の絵は表示後に順に読む(最初の 1 枚だけが優先)
    const order: Season[] = [];
    const i0 = SEASONS.indexOf(initial);
    for (let k = 1; k < 4; k++) order.push(SEASONS[(i0 + k) % 4]);
    const timers = order.map((s, k) => window.setTimeout(() => { void warm(s); }, 900 + k * 1400));
    // 画面外・非表示タブでは進み具合の線(=自動の切り替え)を止める
    let io: IntersectionObserver | undefined;
    if (hero) { io = new IntersectionObserver((es) => { flags.current.off = !es.some((e) => e.isIntersecting); applyPause(); }); io.observe(hero); }
    const vis = () => { flags.current.hid = document.hidden; applyPause(); };
    document.addEventListener("visibilitychange", vis); vis();
    // 自動の切り替え: 約 6 秒ごと。画面外・非表示タブ・切り替えの最中は数えない。動きを減らす設定では切り替えない
    const auto = reduced.current ? 0 : window.setInterval(() => {
      const f = flags.current;
      if (f.off || f.hid || busy.current) return;
      elapsed.current += 250;
      if (elapsed.current >= SEASON_SEC * 1000) { elapsed.current = 0; next(); }
    }, 250);
    return () => { timers.forEach(clearTimeout); if (auto) clearInterval(auto); io?.disconnect(); document.removeEventListener("visibilitychange", vis); };
  }, [initial, warm, applyPause, next]);

  const top = layers[layers.length - 1];
  return (
    <div ref={root} className="h2-seasonroot">
      <div className="h2-bgwrap" aria-hidden="true">
        {layers.map((l, i) => (
          <div key={l.id} className={`h2-sbg${layers.length > 1 && i === layers.length - 1 ? " is-new" : ""}`} data-s={l.season}>
            <img className="h2-bg" src={seasonSrc(IMG, l.season)} alt="" width={SIZE[l.season][0]} height={SIZE[l.season][1]} fetchPriority={l.id === 0 ? "high" : undefined} />
          </div>
        ))}
        {layers.length > 1 && <i key={`r${top.id}`} className="h2-ring" />}
      </div>
    </div>
  );
}
