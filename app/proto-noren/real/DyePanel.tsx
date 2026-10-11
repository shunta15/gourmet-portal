"use client";
import { useEffect, useState } from "react";
import { DYE_EVENT, DYE_LIST, parseDye, type DyeKind } from "@/components/portal/noren-real/clothReal";
import {
  BRIGHT_EVENT, GROUND_LIST, NOREN_REAL_BRIGHT, NOREN_REAL_GROUND, PAPER_LIST, parseBright, parseGround, parsePaper,
  type NorenRealBright, type NorenRealGround, type NorenRealPaper,
} from "@/lib/portal/noren/realTop";

/**
 * 暖簾（リアル版）の見え方を選ぶ小さな操作盤。見本のルート専用（本番に持っていく部品ではない）。
 * - 暖簾の色: 押すと、読み込み直しなしで布の色が替わり、URL の ?dye= も書き替わる。
 * - 明るさ 1〜5: 読み込み直しなしで替わり、URL の ?bright= も書き替わる（1 = 今まで通り）。
 * - 地の色（墨・藍墨・焦茶・鉄紺・灰墨）・紙の色（生成り・白茶・灰白）: 読み込み直しなしで、枠（.vN）の data-ground / data-paper を付け替える（CSS は noren-real/ground.css）。URL の ?ground= ?paper= も書き替わる。
 * - 時刻 昼・夜・今: 灯りの強さは時刻で決まるので、URL の ?t=12:30 / ?t=21:30 を付けて読み込み直す（今 = ?t= を外す）。色・明るさは引き継ぐ。
 */
const LEVELS: NorenRealBright[] = [1, 2, 3, 4, 5];
const TIMES: { key: string; label: string; t: string | null }[] = [
  { key: "day", label: "昼", t: "12:30" },
  { key: "night", label: "夜", t: "21:30" },
  { key: "now", label: "今", t: null },
];

export default function DyePanel() {
  const [cur, setCur] = useState<DyeKind>("ai");
  const [bright, setBright] = useState<NorenRealBright>(NOREN_REAL_BRIGHT);
  const [t, setT] = useState<string | null>(null);
  const [ground, setGround] = useState<NorenRealGround>(NOREN_REAL_GROUND);
  const [paper, setPaper] = useState<NorenRealPaper>("kinari");
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    setCur(parseDye(qs.get("dye")) ?? "ai");
    setBright(parseBright(qs.get("bright")) ?? NOREN_REAL_BRIGHT);
    setT(qs.get("t"));
    // スマホ幅では、布を隠さないよう、はじめは畳んでおく（「見え方」を押すと開く）
    if (window.matchMedia("(max-width:640px)").matches) setOpen(false);
    const g = parseGround(qs.get("ground")) ?? NOREN_REAL_GROUND;
    const pp = parsePaper(qs.get("paper")) ?? "kinari";
    setGround(g);
    setPaper(pp);
    // 指定があるときだけ、枠に付ける（指定なしは本番の既定のまま）
    const root = document.querySelector<HTMLElement>(".vN");
    if (root) {
      if (qs.get("ground") && parseGround(qs.get("ground"))) root.dataset.ground = g;
      if (qs.get("paper") && parsePaper(qs.get("paper"))) root.dataset.paper = pp;
    }
  }, []);
  const rewrite = (name: string, v: string) => {
    try {
      const u = new URL(location.href);
      u.searchParams.set(name, v);
      history.replaceState(null, "", u.toString());
    } catch {}
  };
  const pick = (k: DyeKind) => {
    setCur(k);
    window.dispatchEvent(new CustomEvent(DYE_EVENT, { detail: k }));
    rewrite("dye", k);
  };
  const pickBright = (b: NorenRealBright) => {
    setBright(b);
    window.dispatchEvent(new CustomEvent(BRIGHT_EVENT, { detail: b }));
    rewrite("bright", String(b));
  };
  const pickGround = (g: NorenRealGround) => {
    setGround(g);
    const root = document.querySelector<HTMLElement>(".vN");
    if (root) root.dataset.ground = g;
    rewrite("ground", g);
  };
  const pickPaper = (k: NorenRealPaper) => {
    setPaper(k);
    const root = document.querySelector<HTMLElement>(".vN");
    if (root) root.dataset.paper = k;
    rewrite("paper", k);
  };
  const pickTime = (v: string | null) => {
    try {
      const u = new URL(location.href);
      if (v) u.searchParams.set("t", v);
      else u.searchParams.delete("t");
      location.assign(u.toString());
    } catch {}
  };
  return (
    <div className="dp" role="group" aria-label="暖簾の見え方">
      <style>{CSS}</style>
      <button type="button" className="dp-b dp-fold" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        見え方を変える {open ? "▾" : "▴"}
      </button>
      <div className="dp-body" hidden={!open}>
      <div className="dp-r">
        <span className="dp-t">暖簾の色</span>
        {DYE_LIST.map((d) => (
          <button key={d.key} type="button" className="dp-b" data-on={cur === d.key ? "1" : "0"} aria-pressed={cur === d.key} onClick={() => pick(d.key)}>
            <i style={{ background: d.swatch }} />
            {d.label}
          </button>
        ))}
      </div>
      <div className="dp-r">
        <span className="dp-t">地の色</span>
        {GROUND_LIST.map((g) => (
          <button key={g.key} type="button" className="dp-b" data-on={ground === g.key ? "1" : "0"} aria-pressed={ground === g.key} onClick={() => pickGround(g.key)}>
            <i style={{ background: g.swatch }} />
            {g.label}
          </button>
        ))}
      </div>
      <div className="dp-r">
        <span className="dp-t">紙の色</span>
        {PAPER_LIST.map((g) => (
          <button key={g.key} type="button" className="dp-b" data-on={paper === g.key ? "1" : "0"} aria-pressed={paper === g.key} onClick={() => pickPaper(g.key)}>
            <i style={{ background: g.swatch }} />
            {g.label}
          </button>
        ))}
      </div>
      <div className="dp-r">
        <span className="dp-t">明るさ</span>
        {LEVELS.map((n) => (
          <button key={n} type="button" className="dp-b dp-n" data-on={bright === n ? "1" : "0"} aria-pressed={bright === n} aria-label={`明るさ ${n}`} onClick={() => pickBright(n)}>
            {n}
          </button>
        ))}
      </div>
      <div className="dp-r">
        <span className="dp-t">時刻</span>
        {TIMES.map((x) => (
          <button key={x.key} type="button" className="dp-b dp-n" data-on={t === x.t ? "1" : "0"} aria-pressed={t === x.t} onClick={() => pickTime(x.t)}>
            {x.label}
          </button>
        ))}
      </div>
      </div>
    </div>
  );
}

const CSS = `
.dp{position:fixed;left:12px;bottom:12px;z-index:60;display:flex;flex-direction:column;gap:2px;max-width:calc(100vw - 24px);padding:5px 6px;border-radius:10px;background:rgba(14,11,9,.74);border:1px solid rgba(239,230,214,.16);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);font:500 12px/1 var(--f-sans,system-ui,sans-serif);color:#d9cfbd}
.dp-body{display:flex;flex-direction:column;gap:2px}
.dp-body[hidden]{display:none}
.dp-fold{justify-content:flex-start;min-height:44px;font-size:12px;opacity:.9}
.dp-r{display:flex;align-items:center;gap:4px}
.dp-t{flex:0 0 5.4em;padding:0 4px;font-size:12px;letter-spacing:.04em;white-space:nowrap;opacity:.78}
.dp-b{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;min-width:44px;padding:0 9px;border-radius:7px;border:1px solid transparent;background:transparent;color:inherit;font:inherit;letter-spacing:.06em;cursor:pointer;-webkit-tap-highlight-color:transparent}
.dp-b i{display:block;width:14px;height:14px;border-radius:3px;border:1px solid rgba(239,230,214,.4)}
.dp-n{font-size:14px;font-weight:600}
.dp-b:hover{background:rgba(239,230,214,.08)}
.dp-b[data-on="1"]{border-color:rgba(239,230,214,.7);background:rgba(239,230,214,.16);color:#fff}
.dp-b:focus-visible{outline:2px solid #e8643f;outline-offset:1px}
@media (max-width:640px){.vR-hero .vN-cue{bottom:56px}.dp{left:8px;bottom:8px;padding:3px 4px;gap:0}.dp-r{gap:2px}.dp-t{flex-basis:4.6em;padding:0 2px;letter-spacing:0}.dp-b{padding:0 6px;gap:4px}}
`;
