/**
 * トップの最初の画面(赤い面)の「動きの案」3 つ。?hero=1 / 2 / 3 で切り替える(見本専用。指定なしは page.tsx に今のまま)。
 *   1 塗る   : 赤が筆で塗られて現れ、見出しが 1 字ずつ乗る。スクロールで次の色が塗り重なる。なぞると色の跡が残る(HeroPaint)
 *   2 留める : 最初の画面を 2〜3 画面ぶん留め、背景の色・見出しの色・形・右上の札が順に入れ替わる。最後に 3 つのタブがせり上がる(HeroStage)
 *   3 流れる : 見出しと COLOR PLAY の帯が逆向きに流れ、スクロールの速さで速くなり傾く。写真は触る/傾けると向きが変わる。形が弾んで漂う(HeroFlow)
 * 文言は今の画面にあるものだけ。サーバーコンポーネント(マークアップだけ)。動きの制御は各 client コンポーネントが受け持つ。
 */
import type { CSSProperties, ReactNode } from "react";
import "./hero.css";
import HeroFlow from "./HeroFlow";
import HeroPaint from "./HeroPaint";
import HeroStage from "./HeroStage";

export type HeroVariant = 1 | 2 | 3;

const IMG = "/_portal/bproto/colorplay/ref-hero.jpg";
const LINES = ["この街で、", "わたしは", "もっとカワイイ。"];
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

function Copy({ chars = false }: { chars?: boolean }) {
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

function Photo() {
  return (
    <div className="cp-hero-photo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG} alt="" width={532} height={632} fetchPriority="high" />
    </div>
  );
}

const Tag = () => (
  <div className="cp-hero-tag" aria-hidden="true">
    <b>COLOR<br />PLAY</b>
    <span>キレイで、<br />あそぼう。</span>
  </div>
);

/* ---------- 案 1: 塗る ---------- */
const COATS = ["c0", "c1", "c2", "c3"]; // 赤(開いた時) → ピンク → 水色 → 黒(スクロールで塗り重なる)

function Paint() {
  return (
    <section className="cp-hero" id="cp-hero" data-hero="1" data-sp="o">
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

/* ---------- 案 2: 留める ---------- */
const DOTS = ["#d11d22", "#fb9bdc", "#c2e5fb", "#111111"];

function Stage({ pills }: { pills: ReactNode }) {
  return (
    <div className="cp-stage" id="cp-stage" data-scene="0" data-pills="0" data-end="0">
      <section className="cp-hero" id="cp-hero" data-hero="2">
        <div className="st-bg st-b1" aria-hidden="true" />
        <div className="st-bg st-b2" aria-hidden="true" />
        <div className="st-bg st-b3" aria-hidden="true" />
        <div className="st-shapes" aria-hidden="true">
          <i className="st-sh sh0"><svg viewBox="0 0 100 100" focusable="false"><circle cx="50" cy="50" r="46" fill="#fb9bdc" /><circle cx="50" cy="50" r="46" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="1.2" strokeDasharray="2 3.2" /></svg></i>
          <i className="st-sh sh1"><svg viewBox="0 0 100 100" focusable="false"><path d="M22 98V42Q22 5 50 5Q78 5 78 42V98Z" fill="#4fa9ee" /><rect x="31" y="15" width="8" height="48" rx="4" fill="#fff" fillOpacity=".5" /></svg></i>
          <i className="st-sh sh2"><svg viewBox="0 0 100 100" focusable="false"><path d="M50 90S8 64 8 36A21 21 0 0150 28 21 21 0 0192 36C92 64 50 90 50 90Z" fill="#f80257" /><ellipse cx="29" cy="34" rx="7" ry="4" transform="rotate(-30 29 34)" fill="#fff" fillOpacity=".45" /></svg></i>
          <i className="st-sh sh3"><svg viewBox="0 0 100 100" focusable="false"><path d="M50 3L58 30 83 17 70 42 97 50 70 58 83 83 58 70 50 97 42 70 17 83 30 58 3 50 30 42 17 17 42 30Z" fill="#f80257" /></svg></i>
        </div>
        <div className="cp-wrap cp-hero-in">
          <Copy />
          <Photo />
          <div className="st-tags" aria-hidden="true">
            <div className="st-tg tg0"><b>COLOR<br />PLAY</b><span>キレイで、<br />あそぼう。</span></div>
            <div className="st-tg tg1"><b>COLOR PLAY</b><span>キレイで、あそぼう。</span></div>
            <div className="st-tg tg2"><b>COLOR<br />PLAY</b><span>キレイで、<br />あそぼう。</span></div>
            <div className="st-tg tg3"><b>COLOR<br />PLAY</b></div>
          </div>
        </div>
        <ol className="st-dots" aria-hidden="true">
          {DOTS.map((c, i) => (<li key={i} style={css({ "--dc": c })} />))}
        </ol>
        <span className="st-cue" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" focusable="false"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        {pills}
        <HeroStage />
      </section>
    </div>
  );
}

/* ---------- 案 3: 流れる ---------- */
const ROWS = [
  { t: "COLOR PLAY", cls: "o", dir: 1, v: 70, n: 5, top: 2 },
  { t: "この街で、わたしはもっとカワイイ。", cls: "f", dir: -1, v: 55, n: 4, top: 26 },
  { t: "COLOR PLAY", cls: "p", dir: 1, v: 95, n: 5, top: 50 },
  { t: "もっとカワイイ。", cls: "q", dir: -1, v: 65, n: 6, top: 75 },
];
// 色の丸・ネイルチップ・色見本・輪。x,y は画面に対する % の置き場所、d は奥行き(大きいほど手前でよく動く)
const SHAPES = [
  { k: "dot", c: "var(--pink)", w: 58, x: 60, y: 11, d: 1.3 },
  { k: "tip", c: "var(--hot)", w: 38, x: 93, y: 12, d: 1.5 },
  { k: "dot", c: "var(--sky)", w: 30, x: 76, y: 5, d: 0.8 },
  { k: "swatch", c: "var(--blue)", w: 40, x: 97, y: 44, d: 1.1 },
  { k: "ring", c: "#fff", w: 62, x: 52, y: 63, d: 0.7 },
  { k: "tip", c: "var(--pink)", w: 34, x: 58, y: 80, d: 1.4 },
  { k: "dot", c: "#fff", w: 22, x: 50, y: 30, d: 0.5 },
  { k: "swatch", c: "var(--hot)", w: 36, x: 42, y: 86, d: 1.0 },
  { k: "dot", c: "var(--blue)", w: 44, x: 8, y: 80, d: 1.2 },
  { k: "tip", c: "var(--sky)", w: 32, x: 24, y: 92, d: 1.6 },
  { k: "ring", c: "var(--pink)", w: 48, x: 90, y: 90, d: 0.9 },
  { k: "dot", c: "var(--hot)", w: 26, x: 36, y: 8, d: 0.6 },
  { k: "swatch", c: "var(--pink)", w: 34, x: 4, y: 40, d: 0.9 },
  { k: "tip", c: "#fff", w: 28, x: 70, y: 94, d: 1.1 },
];

function Flow() {
  return (
    <section className="cp-hero" id="cp-hero" data-hero="3" data-sp="o">
      <div className="hf-bands" aria-hidden="true">
        {ROWS.map((r, i) => (
          <div className={`hf-row hf-${r.cls}`} key={i} style={css({ top: `${r.top}%` })}>
            <div className="hf-track" data-dir={r.dir} data-v={r.v}>
              {Array.from({ length: r.n }, (_, j) => (<span className="hf-unit" key={j}>{r.t}<i>●</i></span>))}
            </div>
          </div>
        ))}
      </div>
      <div className="cp-wrap cp-hero-in">
        <Copy />
        <Photo />
        <Tag />
        <div className="hf-shapes" aria-hidden="true">
          {SHAPES.map((s, i) => (
            <i key={i} className={`hf-sh hf-${s.k}`} data-x={s.x} data-y={s.y} data-d={s.d} style={css({ "--w": s.w, "--c": s.c, left: `${s.x}%`, top: `${s.y}%` })} />
          ))}
        </div>
      </div>
      <HeroFlow />
      <span className="cp-hero-cut" aria-hidden="true" />
    </section>
  );
}

export default function HeroView({ variant, pills }: { variant: HeroVariant; pills?: ReactNode }) {
  if (variant === 1) return <Paint />;
  if (variant === 2) return <Stage pills={pills} />;
  return <Flow />;
}
