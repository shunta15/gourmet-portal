/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { preload } from "react-dom";
import { IMG } from "./const";
import { HEAD, P1_ONE, P3_ONE, MIHON_HEAD, MIHON_SUB } from "./copy";
import "./hero.css";

const H = `${IMG}/hero`;
const G = "#3f9e5a", O = "#f28a2a", P = "#ee5a7a", B = "#1f93d6", R = "#e8503a", T = "#2a8f78", T2 = "#1d8aa6";
const COLS: Record<string, string[]> = {
  c1: [O, O, G, G, P, O, O, G],
  c2: [G, G, G, B, P, B, B],
  c3: [O, O, G, G, B, B, O],
  m1: [O, O, T, R, T, T, T],
  m2: [T, T, T, T2, T2, T, T, T, T, T, T, T],
};
const ROT = [-4, 3, -2, 4, -3, 2, 0, -2];

const BUBBLES = [
  { k: "b1", x: 184, y: 52, w: 124, h: 65, cx: 63, cy: 28, rot: -9, lines: ["お気に入りの", "お店が見つかる!"], fs: 11.4, d: 0.55, ox: 8 },
  { k: "b2", x: 190, y: 164, w: 114, h: 66, cx: 56, cy: 31, rot: -7, lines: ["今日は", "どこへ行こう?"], fs: 11.4, d: 0.8, ox: 8 },
  { k: "b3", x: 858, y: 150, w: 138, h: 62, cx: 80, cy: 30, rot: -7, lines: ["ペットと一緒に", "楽しめるお店も!"], fs: 11.4, d: 1.05, ox: 55 },
  { k: "b4", x: 930, y: 214, w: 112, h: 52, cx: 52, cy: 28, rot: -6, lines: ["このまち、", "やっぱり好き!"], fs: 11.4, d: 1.3, ox: 10 },
];

export default function Hero({ mihon }: { mihon: boolean }) {
  preload(`${H}/bg.webp`, { as: "image", fetchPriority: "high" });
  const lines = (mihon ? MIHON_HEAD : HEAD).map((t, i) => ({ k: i, chars: Array.from(t), col: COLS[(mihon ? "m" : "c") + (i + 1)] }));
  const hlLine = mihon ? 0 : 1, hlChar = mihon ? 3 : 4;
  const subs = mihon ? [...MIHON_SUB] : [P1_ONE, P3_ONE];
  let n = 0;
  const sub = subs.map((t) => Array.from(t).map((c) => ({ c, n: n++ })));
  const lastN = n - 1;
  return (
    <section className="h2-hero" aria-label="ヒーロー">
      <div className="h2-hero-stage">
        {/* 層 1: 背景の絵(ゆっくり寄る+マウスでいちばん小さく動く) */}
        <div className="h2-bgwrap"><img className="h2-bg" src={`${H}/bg.webp`} alt="" width={2000} height={667} fetchPriority="high" /></div>
        <div className="h2-clouds" aria-hidden="true"><i /><i /><i /></div>
        {/* 流れる鳥・ふわふわの風船(背景の絵の気球とは別の位置) */}
        <img className="h2-fly h2-bird b1" style={{ left: "calc(430 * var(--u))", top: "calc(54 * var(--u))" }} src={`${H}/bird1.webp`} alt="" width={56} height={53} />
        <img className="h2-fly h2-bird b2" style={{ left: "calc(470 * var(--u))", top: "calc(74 * var(--u))" }} src={`${H}/bird2.webp`} alt="" width={56} height={53} />
        <img className="h2-fly h2-bird b3" style={{ left: "calc(520 * var(--u))", top: "calc(20 * var(--u))" }} src={`${H}/bird3.webp`} alt="" width={51} height={46} />
        <img className="h2-balloon" style={{ left: "calc(668 * var(--u))", top: "calc(10 * var(--u))" }} src={`${H}/balloon.webp`} alt="" width={64} height={82} />
        {/* 層 2: 吹き出し・看板 */}
        {BUBBLES.map((b) => (
          <button type="button" key={b.k} className="h2-bub h2-jump" aria-label={b.lines.join("")}
            style={{ left: `calc(${b.x} * var(--u))`, top: `calc(${b.y} * var(--u))`, width: `calc(${b.w} * var(--u))`, height: `calc(${b.h} * var(--u))`, animationDelay: `${b.d}s, ${b.d + 0.8}s`, ["--ox" as string]: `${b.ox}%` }}>
            <img src={`${H}/${b.k}.webp`} alt="" width={Math.round(b.w * 1.283)} height={Math.round(b.h * 1.283)} />
            <span className="h2-bt h2-kure" style={{ left: `calc(${b.cx} * var(--u))`, top: `calc(${b.cy} * var(--u))`, fontSize: `calc(${b.fs} * var(--u))`, lineHeight: `calc(${b.fs * 1.6} * var(--u))`, rotate: `${b.rot}deg` }}>{b.lines.map((l) => <span key={l}>{l}</span>)}</span>
          </button>
        ))}
        <div className="h2-board" aria-label="Good Local Life"><span className="h2-board-in h2-script">Good<br />Local<br />Life</span></div>
        {/* 層 3: 文字・検索 */}
        <h1 className="h2-title">
          {lines.map((l, li) => (
            <span key={l.k} className={`h2-ln h2-l${li + 1}`} style={{ animationDelay: `${0.15 + li * 0.14}s` }}>
              {l.chars.map((c, i) => (
                <i key={i} className={li === hlLine && i === hlChar ? "h2-hl" : c === "、" ? "h2-pc" : undefined} style={{ color: l.col[i], animationDelay: `${0.15 + li * 0.14 + i * 0.05}s`, ["--r" as string]: `${ROT[i % ROT.length]}deg` }}>{c}</i>
              ))}
            </span>
          ))}
        </h1>
        <p className="h2-sub h2-kure">
          {sub.map((ln, li) => (
            <span key={li} className="h2-sln">{ln.map((x) => <i key={x.n} className={x.n === lastN ? "h2-last" : undefined} style={{ ["--n" as string]: x.n }}>{x.c}</i>)}</span>
          ))}
        </p>
        <form className="h2-search" role="search" action="/search">
          <svg className="h2-s-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.6" fill="none" stroke="#7f95b4" strokeWidth="2" /><path d="m15.4 15.4 5 5" stroke="#7f95b4" strokeWidth="2.2" strokeLinecap="round" /></svg>
          <input type="search" name="q" placeholder="エリア・駅名・お店やスポットの名前などで検索" aria-label="検索" />
          <button type="submit" className="h2-s-go h2-press"><span>検索</span></button>
        </form>
        <div className="h2-pills">
          <Link href="/map" className="h2-pill h2-p-map h2-press">
            <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M3 12 13 9l12 3 11-3v21l-11 3-12-3-10 3Z" fill="#fff" stroke="#2f9a5a" strokeWidth="2.6" strokeLinejoin="round" /><path d="M13 9v21M25 12v21" stroke="#2f9a5a" strokeWidth="2.2" /><path d="M20 22s-6-5.4-6-9.6a6 6 0 0 1 12 0C26 16.600 20 22 20 22Z" fill="#2f9a5a" /><circle cx="20" cy="12.300" r="2.300" fill="#fff" /></svg>
            <span><b>地図から探す</b><small>地図でお店やスポットを見つけよう</small></span>
          </Link>
          <Link href="/station" className="h2-pill h2-p-stn h2-press">
            <svg viewBox="0 0 40 40" aria-hidden="true"><rect x="8" y="4" width="24" height="28" rx="6" fill="#1d6fc4" /><rect x="12" y="9" width="16" height="9" rx="2" fill="#fff" /><circle cx="14" cy="25" r="2.200" fill="#fff" /><circle cx="26" cy="25" r="2.200" fill="#fff" /><path d="M13 32 9 38M27 32l4 6M16 4l1.500-2h5L24 4" stroke="#1d6fc4" strokeWidth="2.600" strokeLinecap="round" fill="none" /></svg>
            <span><b>駅から探す</b><small>よく利用する駅の周辺から探せる</small></span>
          </Link>
          <Link href="/videos" className="h2-pill h2-p-mov h2-press">
            <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#f26a2a" /><path d="M16 12.500 29 20l-13 7.500Z" fill="#fff" /></svg>
            <span><b>動画で探す</b><small>まちの魅力を動画でチェック</small></span>
          </Link>
        </div>
      </div>
    </section>
  );
}
