"use client";
import { useEffect, useState } from "react";
import { DYE_EVENT, DYE_LIST, parseDye, type DyeKind } from "@/components/portal/noren-real/clothReal";

/**
 * 暖簾（リアル版）の色の見本を選ぶ小さな操作盤。見本のルート専用（本番に持っていく部品ではない）。
 * 押すと、読み込み直しなしで布の色が替わり、URL の ?dye= も書き替わる。
 */
export default function DyePanel() {
  const [cur, setCur] = useState<DyeKind>("ai");
  useEffect(() => {
    setCur(parseDye(new URLSearchParams(location.search).get("dye")) ?? "ai");
  }, []);
  const pick = (k: DyeKind) => {
    setCur(k);
    window.dispatchEvent(new CustomEvent(DYE_EVENT, { detail: k }));
    try {
      const u = new URL(location.href);
      u.searchParams.set("dye", k);
      history.replaceState(null, "", u.toString());
    } catch {}
  };
  return (
    <div className="dp" role="group" aria-label="暖簾の色">
      <style>{CSS}</style>
      <span className="dp-t">暖簾の色</span>
      {DYE_LIST.map((d) => (
        <button key={d.key} type="button" className="dp-b" data-on={cur === d.key ? "1" : "0"} aria-pressed={cur === d.key} onClick={() => pick(d.key)}>
          <i style={{ background: d.swatch }} />
          {d.label}
        </button>
      ))}
    </div>
  );
}

const CSS = `
.dp{position:fixed;left:12px;bottom:12px;z-index:60;display:flex;align-items:center;flex-wrap:wrap;gap:4px;max-width:calc(100vw - 24px);padding:5px 6px;border-radius:10px;background:rgba(14,11,9,.74);border:1px solid rgba(239,230,214,.16);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);font:500 12px/1 var(--f-sans,system-ui,sans-serif);color:#d9cfbd}
.dp-t{padding:0 6px 0 4px;font-size:11px;letter-spacing:.12em;opacity:.7}
.dp-b{display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:0 9px;border-radius:7px;border:1px solid transparent;background:transparent;color:inherit;font:inherit;letter-spacing:.06em;cursor:pointer;-webkit-tap-highlight-color:transparent}
.dp-b i{display:block;width:14px;height:14px;border-radius:3px;border:1px solid rgba(239,230,214,.4)}
.dp-b:hover{background:rgba(239,230,214,.08)}
.dp-b[data-on="1"]{border-color:rgba(239,230,214,.7);background:rgba(239,230,214,.12);color:#fff}
.dp-b:focus-visible{outline:2px solid #e8643f;outline-offset:1px}
@media (max-width:640px){.vR-hero .vN-cue{bottom:56px}.dp{left:8px;bottom:8px;padding:4px}.dp-t{display:none}.dp-b{padding:0 7px;min-height:40px}}
`;
