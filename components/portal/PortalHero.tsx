"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { afterLcpIdle, silkAllowed } from "./silkGate";

// WebGL の絹は初期の JS に入れない。LCP の後・アイドル時に、出してよい環境だけで読み込む（silkGate.ts）
const PortalSilk = dynamic(() => import("./PortalSilk"), { ssr: false });

export interface HeroVertical {
  key: string;
  name: string;
  en: string;
  path: string;
  color: string;
  /** グルメのように掲載がある業種か */
  live: boolean;
}

function Chars({ text, base = 0 }: { text: string; base?: number }) {
  return (
    <>
      {Array.from(text).map((c, i) => (
        <span key={i} className="ch" style={{ ["--i" as string]: base + i }}>
          {c}
        </span>
      ))}
    </>
  );
}

const CX = 200;
const CY = 200;
const R = 150;
const rad = (deg: number) => (deg * Math.PI) / 180;
const pt = (deg: number, r: number) => [CX + r * Math.cos(rad(deg)), CY + r * Math.sin(rad(deg))] as const;

/**
 * 総合トップのヒーロー。絹のシェーダ＋大見出し＋「輪」（6業種を一周でつなぐ）。
 * 輪の業種に触れると、布の上でその業種の色がふくらむ。
 * 絹（WebGL）は LCP の後・アイドル時に始める。スマホ・低電力・動きを減らす設定では CSS のグラデーションだけ（silkGate.ts）。
 */
export default function PortalHero({
  verticals,
  total,
  features,
}: {
  verticals: HeroVertical[];
  /** グルメの掲載店数（実数） */
  total: number;
  /** グルメ特集の本数（実数） */
  features: number;
}) {
  const [focus, setFocus] = useState(-1);
  const [silk, setSilk] = useState(false);
  useEffect(() => {
    if (!silkAllowed()) return;
    return afterLcpIdle(() => setSilk(true));
  }, []);
  const soon = verticals.filter((v) => !v.live).map((v) => v.name);
  const act = (i: number) => ({
    onMouseEnter: () => setFocus(i),
    onMouseLeave: () => setFocus(-1),
    onFocus: () => setFocus(i),
    onBlur: () => setFocus(-1),
  });

  return (
    <section className="mp-hero" aria-labelledby="mp-hero-title" style={focus >= 0 ? ({ ["--fc" as string]: verticals[focus].color } as React.CSSProperties) : undefined}>
      <div className="mp-silk-fallback" aria-hidden="true" />
      {silk && <PortalSilk colors={verticals.map((v) => v.color)} focus={focus} />}

      <div className="mp-hero-meta tl" aria-hidden="true">
        <span>Machinowa — 街の輪</span>
        <span>Local guide across 6 categories</span>
      </div>

      <h1 id="mp-hero-title" className="mp-hero-title">
        <span className="mp-sr">マチノワ 街の店を、業種をまたいで探す。</span>
        <span className="l1" aria-hidden="true"><Chars text="街の店を、" /></span>
        <span className="l2" aria-hidden="true"><Chars text="マチノワ" base={5} /></span>
        <span className="l3" aria-hidden="true"><Chars text="業種をまたいで探す。" base={9} /></span>
      </h1>

      <div className="mp-ring-wrap">
        <div className="mp-ring">
          <svg viewBox="0 0 400 400" className="mp-ring-svg" role="img" aria-label="6つの業種をつなぐ輪">
            <circle cx={CX} cy={CY} r={R + 34} className="mp-ring-guide" />
            <circle cx={CX} cy={CY} r={R - 34} className="mp-ring-guide thin" />
            {verticals.map((v, i) => {
              const mid = -90 + i * 60;
              const [x0, y0] = pt(mid - 26, R);
              const [x1, y1] = pt(mid + 26, R);
              return (
                <path
                  key={v.key}
                  d={`M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`}
                  className={`mp-ring-arc${focus === i ? " on" : ""}${v.live ? " live" : ""}`}
                  style={{ ["--ac" as string]: v.color, ["--d" as string]: i }}
                />
              );
            })}
            {verticals.map((v, i) => {
              const [x, y] = pt(-90 + i * 60, R);
              return <circle key={v.key} cx={x} cy={y} r={focus === i ? 8 : 5} className="mp-ring-node" style={{ ["--ac" as string]: v.color }} />;
            })}
            <g className="mp-ring-orbit">
              <circle cx={CX + R} cy={CY} r="3.2" />
            </g>
          </svg>
          <div className="mp-ring-core" aria-hidden="true">
            <b>輪</b>
            <small>{focus >= 0 ? verticals[focus].en : "Machinowa"}</small>
          </div>
          {verticals.map((v, i) => {
            const a = -90 + i * 60;
            const [x, y] = pt(a, R + 52);
            const c = Math.cos(rad(a));
            const side = Math.abs(c) < 0.25 ? "mid" : c > 0 ? "r" : "l";
            return (
              <Link
                key={v.key}
                href={v.path}
                className={`mp-ring-label ${side}${focus === i ? " on" : ""}`}
                style={{ left: `${(x / 400) * 100}%`, top: `${(y / 400) * 100}%`, ["--ac" as string]: v.color }}
                data-cursor={v.en.toUpperCase()}
                {...act(i)}
              >
                <b>{v.name}</b>
                <small>{v.live ? "掲載中" : "掲載準備中"}</small>
              </Link>
            );
          })}
        </div>
      </div>

      <p className="mp-hero-lede">
        <span className="ph">街の店を、業種をまたいで探せるポータル。</span>
        <span className="ph">
          いまはグルメ <b>{total.toLocaleString("ja-JP")}</b> 店・特集 <b>{features}</b> 本を掲載中。
        </span>
        <span className="ph">{soon.join("・")}は</span>
        <span className="ph">掲載準備中です。</span>
      </p>

      <div className="mp-hero-foot">
        <span className="mp-cue" aria-hidden="true">
          <i />
          Scroll
        </span>
        <ul className="mp-hero-chips" aria-label="業種の入口">
          {verticals.map((v, i) => (
            <li key={v.key}>
              <Link href={v.path} style={{ ["--ac" as string]: v.color }} className={focus === i ? "on" : undefined} data-cursor={v.en.toUpperCase()} {...act(i)}>
                <i aria-hidden="true" />
                {v.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
