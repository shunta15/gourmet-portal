"use client";
import { useRef } from "react";

const B = "/_portal/hproto/machi/lower/";
/** 写真の上の吹き出し(見本から切り出した形+HTMLの文字)。押すとぽんと跳ねる。座標は写真の画素(見本基準)。s は表示倍率。 */
export default function Bubble({ img, w, h, x, y, lines, f = 11, s = 1, rot = -5 }: {
  img: string; w: number; h: number; x: number; y: number; lines: string[]; f?: number; s?: number; rot?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const pop = () => {
    const el = ref.current; if (!el) return;
    el.classList.remove("hm-l-bpop"); void el.offsetWidth; el.classList.add("hm-l-bpop");
    window.setTimeout(() => el.classList.remove("hm-l-bpop"), 700);
  };
  return (
    <button ref={ref} type="button" aria-label={lines.join("")} onPointerDown={pop} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="hm-l-bub"
      style={{ "--x": x, "--y": y, "--w": w, "--h": h, "--f": f, "--s": s, "--rot": `${rot}deg`, ...(img ? { backgroundImage: `url(${B}${img})` } : {}) } as React.CSSProperties}>
      <span className="hm-l-bubt hm-hand">{lines.map((l, i) => <span key={i}>{l}</span>)}</span>
    </button>
  );
}
