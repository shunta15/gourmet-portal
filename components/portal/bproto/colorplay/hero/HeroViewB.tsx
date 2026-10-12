/**
 * トップの最初の画面(赤い面)の「動きの案」その 2。?hero=4 / 5 / 6(見本専用。指定なしは page.tsx に今のまま)。
 *   4 くっつく : ジェルのしずくが上から落ちて床にたまり、転がり、くっつき、ちぎれる。触ると押しのけられ、つかめて、傾けると転がる(HeroGel)
 *   5 つまむ   : 見出しの札・人物の写真・形・COLOR PLAY の札が、紙の切り抜きのように指でつまんで動かせる。離すと弾んで元に収まる(HeroPieces)
 *   6 まわる   : 背景が縦長の回転板(赤・ピンク・水色・黒の 4 面)。開くとくるくる回って赤になり、なぞる/タップ/スクロールで面が替わる(HeroSlats)
 * 文言・写真は今の画面にあるものだけ。サーバーコンポーネント(マークアップだけ)。動きの制御は各 client コンポーネントが受け持つ。
 */
import type { CSSProperties } from "react";
import "./hero.css";
import "./hero2.css";
import { Copy, Photo, Tag, LINES, IMG } from "./HeroView";
import HeroGel from "./HeroGel";
import HeroPieces from "./HeroPieces";
import HeroSlats from "./HeroSlats";

export type HeroVariantB = 4 | 5 | 6;

const css = (o: Record<string, string | number>) => o as CSSProperties;

/* ---------- 案 4: くっつく ---------- */
// JS が動き出す前(読み込み直後)に CSS だけで落ちてくるしずく。JS が動いたら、この位置・大きさ・色を引き継いで canvas のしずくに替わる
const PRE = [
  { x: 74, s: 0.12, c: "251,155,220" },
  { x: 83, s: 0.095, c: "79,169,238" },
  { x: 91, s: 0.105, c: "248,2,87" },
  { x: 66, s: 0.07, c: "17,17,17" },
  { x: 95, s: 0.08, c: "194,229,251" },
];

function Gel() {
  return (
    <section className="cp-hero" id="cp-hero" data-hero="4" data-sp="o">
      <div className="cp-wrap cp-hero-in">
        <Copy />
        <Photo />
        <Tag />
      </div>
      <div className="hg-pre" aria-hidden="true">
        {PRE.map((p, i) => (<i key={i} data-c={p.c} style={css({ "--x": p.x, "--s": p.s, "--i": i, "--c": `rgb(${p.c})` })} />))}
      </div>
      <HeroGel />
      <span className="cp-hero-cut" aria-hidden="true" />
    </section>
  );
}

/* ---------- 案 5: つまむ ---------- */
// data-b = スクロールで向かう先(画面の幅・高さに対する割合 x,y と、傾き deg)
const CARD_B = ["0.3,0.62,-9", "0.22,0.44,7", "0.36,0.27,-5"];
const CARD_POS = [{ x: 3, y: 17, r: -3 }, { x: 8, y: 35, r: 2 }, { x: 2, y: 53, r: -2 }];

function Pieces() {
  return (
    <section className="cp-hero" id="cp-hero" data-hero="5" data-sp="o">
      <div className="cp-wrap cp-hero-in">
        <div className="hc-pc hc-photo" data-b="-0.1,0.17,4" style={css({ "--i": 0, "--x": 58, "--y": 6, "--mx": 41, "--my": 11, "--rot": 2.5 })}>
          <div className="hc-bob">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG} alt="" width={532} height={632} fetchPriority="high" draggable={false} />
          </div>
        </div>
        <h1 className="cp-h1 hc-h1">
          {LINES.map((t, l) => (
            <span
              key={l}
              className={`cp-line hc-pc hc-card hc-c${l}`}
              data-b={CARD_B[l]}
              style={css({ "--i": l + 1, "--x": CARD_POS[l].x, "--y": CARD_POS[l].y, "--rot": CARD_POS[l].r })}
            >
              <span className="hc-bob">{t}</span>
            </span>
          ))}
        </h1>
        <p className="cp-hero-sub hc-pc hc-sub" data-b="0.12,0.05,2" style={css({ "--i": 4, "--x": 3, "--y": 74, "--rot": 0 })}>
          <span className="hc-bob">見つかる、行ける、好きになれる。<br />地域のビューティーサロンポータル</span>
        </p>
        <div className="hc-pc hc-tag" aria-hidden="true" data-b="-0.12,0.62,18" style={css({ "--i": 5, "--x": 45, "--y": 5, "--mx": 73, "--my": 9, "--rot": 8 })}>
          <div className="hc-bob">
            <b>COLOR<br />PLAY</b>
            <span>キレイで、<br />あそぼう。</span>
          </div>
        </div>
        <p className="hc-pc hc-script cp-script" aria-hidden="true" data-b="0.1,0.12,-10" style={css({ "--i": 6, "--x": 37, "--y": 77, "--mx": 58, "--my": 72, "--rot": -8 })}>
          <span className="hc-bob">Machinowa<br />&nbsp;&nbsp;&nbsp;Beauty</span>
        </p>
        <i className="hc-pc hc-sh hc-s0" aria-hidden="true" data-b="0.1,0.2,30" style={css({ "--i": 7, "--x": 41, "--y": 36, "--mx": 72, "--my": 58, "--rot": -12 })}>
          <span className="hc-bob"><svg viewBox="0 0 100 100" focusable="false"><circle cx="50" cy="50" r="44" fill="#fb9bdc" stroke="#fff" strokeWidth="6" /><circle cx="50" cy="50" r="34" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.6" strokeDasharray="2 3.4" /></svg></span>
        </i>
        <i className="hc-pc hc-sh hc-s1" aria-hidden="true" data-b="-0.08,0.1,-20" style={css({ "--i": 8, "--x": 91, "--y": 54, "--mx": 84, "--my": 55, "--rot": 14 })}>
          <span className="hc-bob"><svg viewBox="0 0 100 100" focusable="false"><path d="M50 92S6 64 6 34A22 22 0 0150 26 22 22 0 0194 34C94 64 50 92 50 92Z" fill="#f80257" stroke="#fff" strokeWidth="6" strokeLinejoin="round" /><ellipse cx="29" cy="34" rx="7" ry="4" transform="rotate(-30 29 34)" fill="#fff" fillOpacity=".5" /></svg></span>
        </i>
        <i className="hc-pc hc-sh hc-s2" aria-hidden="true" data-b="0.2,0.3,25" style={css({ "--i": 9, "--x": 33, "--y": 4, "--rot": 10 })}>
          <span className="hc-bob"><svg viewBox="0 0 100 100" focusable="false"><path d="M50 4L59 31 85 18 71 43 96 50 71 57 85 82 59 69 50 96 41 69 15 82 29 57 4 50 29 43 15 18 41 31Z" fill="#c2e5fb" stroke="#fff" strokeWidth="5" strokeLinejoin="round" /></svg></span>
        </i>
        <i className="hc-pc hc-sh hc-s3" aria-hidden="true" data-b="0.05,0.34,-14" style={css({ "--i": 10, "--x": 52, "--y": 55, "--mx": 87, "--my": 71, "--rot": 6 })}>
          <span className="hc-bob"><svg viewBox="0 0 100 100" focusable="false"><path d="M18 98V44Q18 6 50 6Q82 6 82 44V98Z" fill="#4fa9ee" stroke="#fff" strokeWidth="6" strokeLinejoin="round" /><rect x="31" y="18" width="9" height="44" rx="4.5" fill="#fff" fillOpacity=".55" /></svg></span>
        </i>
      </div>
      <HeroPieces />
      <span className="cp-hero-cut" aria-hidden="true" />
    </section>
  );
}

/* ---------- 案 6: まわる ---------- */
const FACES = ["#d11d22", "#fb9bdc", "#4fa9ee", "#111111"]; // 赤(開いた時) → ピンク → 水色 → 黒
const SLATS = 10;

function Spin() {
  return (
    <section className="cp-hero" id="cp-hero" data-hero="6" data-ink="light" data-sp="o">
      <div className="hr-slats" aria-hidden="true" style={css({ "--n": SLATS })}>
        {Array.from({ length: SLATS }, (_, i) => (
          <div className="hr-s" key={i} style={css({ "--i": i })}>
            <div className="hr-op">
              <div className="hr-sway">
                {FACES.map((c, k) => (<i className="hr-f" key={k} style={css({ "--k": k, backgroundColor: c })} />))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hr-shades" aria-hidden="true">
        {Array.from({ length: SLATS }, (_, i) => (<i key={i} />))}
      </div>
      <div className="cp-wrap cp-hero-in">
        <Copy />
        <Photo />
        <Tag />
      </div>
      <HeroSlats />
      <span className="cp-hero-cut" aria-hidden="true" />
    </section>
  );
}

export default function HeroViewB({ variant }: { variant: HeroVariantB }) {
  if (variant === 4) return <Gel />;
  if (variant === 5) return <Pieces />;
  return <Spin />;
}
