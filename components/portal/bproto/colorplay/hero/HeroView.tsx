/**
 * トップの最初の画面(赤い面)。「塗る」: 赤が筆で塗られて現れ、見出しが 1 字ずつ乗る。スクロールで次の色が塗り重なる。なぞると色の跡が残る(HeroPaint)。
 * オーナー決定(2026-10-13)で「塗る」。文言は今の画面にあるものだけ。サーバーコンポーネント(マークアップだけ)。動きの制御は client コンポーネント(HeroPaint)が受け持つ。
 */
import type { CSSProperties } from "react";
import "./hero.css";
import HeroPaint from "./HeroPaint";

// 2026-10-14 オーナー提供の高解像度の画像に差し替え(元 532×632 → 1100×1306。比率は同じなので width/height はそのまま)
export const IMG = "/_portal/bproto/colorplay/hero-photo.jpg";
export const LINES = ["この街で、", "わたしは", "もっとカワイイ。"];
const css = (o: Record<string, string | number>) => o as CSSProperties;

/** 筆の先のかすれ(右端がぎざぎざの形)。種から決まるので、サーバーとブラウザで同じになる */
function rag(seed: number): string {
  let s = seed * 9301 + 49297;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pts = ["0% 0%", "90% 0%"];
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const x = 92.5 + r() * 7.5 - (i % 2 ? 0 : 2.2);
    pts.push(`${x.toFixed(1)}% ${((i / n) * 100).toFixed(1)}%`);
  }
  pts.push("0% 100%");
  return `polygon(${pts.join(",")})`;
}

export function Copy({ chars = false }: { chars?: boolean }) {
  let n = 0;
  return (
    <div className="cp-hero-copy">
      <h1 className="cp-h1" aria-label={chars ? LINES.join("") : undefined}>
        {LINES.map((t, l) => (
          <span className="cp-line" key={l} style={css({ "--l": l })} aria-hidden={chars ? "true" : undefined}>
            {chars ? [...t].map((c, i) => (<span className="cp-ch" key={i} style={css({ "--c": n++ })}>{c}</span>)) : t}
          </span>
        ))}
      </h1>
      <p className="cp-hero-sub">見つかる、行ける、好きになれる。<br />地域のビューティーサロンポータル</p>
      <p className="cp-script cp-hero-sc" aria-hidden="true">Machinowa<br />&nbsp;&nbsp;&nbsp;Beauty</p>
    </div>
  );
}

export function Photo() {
  return (
    <div className="cp-hero-photo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG} alt="" width={532} height={632} fetchPriority="high" />
    </div>
  );
}

export const Tag = () => (
  <div className="cp-hero-tag" aria-hidden="true">
    <b>COLOR<br />PLAY</b>
    <span>キレイで、<br />あそぼう。</span>
  </div>
);

/* ---------- 塗る ---------- */
const COATS = ["c0", "c1", "c2", "c3"]; // 赤(開いた時) → ピンク → 水色 → 黒(スクロールで塗り重なる)

function Paint() {
  return (
    <section className="cp-hero" id="cp-hero" data-hero="1" data-sp="o" data-sp-pause>
      <div className="hp-coats" aria-hidden="true">
        {COATS.map((c, ci) => (
          <div className={`hp-coat ${c}`} key={c}>
            {Array.from({ length: 6 }, (_, k) => (
              <i className="hp-s" key={k} style={css({ "--k": k, "--d": k % 2 ? 1 : -1, clipPath: rag(ci * 7 + k + 3) })} />
            ))}
          </div>
        ))}
      </div>
      <div className="cp-wrap cp-hero-in">
        <Copy chars />
        <Photo />
        <Tag />
      </div>
      <HeroPaint />
      <span className="cp-hero-cut" aria-hidden="true" />
    </section>
  );
}

export default function HeroView() {
  return <Paint />;
}
