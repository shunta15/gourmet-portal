/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { preload } from "react-dom";
import { IMG } from "./const";
import "./hero.css";

const H = `${IMG}/hero`;
const G = "#3f9e5a", O = "#f28a2a", P = "#ee5a7a", B = "#1f93d6";
const L1: [string, string][] = [["ま", O], ["ち", O], ["の", G], ["楽", P], ["し", O], ["さ", O], ["、", G]];
const L2: [string, string][] = [["ま", G], ["る", G], ["ご", G], ["と", G], ["見", B], ["つ", B], ["か", B], ["る", B], ["。", O]];

const BUBBLES = [
  { k: "b1", x: 152, y: 100, w: 130, h: 68, cx: 66, cy: 29, rot: -9, lines: ["お気に入りの", "お店が見つかる!"], fs: 12.6, d: 0.55 },
  { k: "b2", x: 185, y: 258, w: 145, h: 84, cx: 71, cy: 40, rot: -7, lines: ["家族で", "おでかけしよう!"], fs: 11.6, d: 0.8 },
  { k: "b3", x: 935, y: 72, w: 177, h: 80, cx: 107, cy: 39, rot: -7, lines: ["ペットと一緒に", "楽しめるお店も!"], fs: 12.6, d: 1.05 },
  { k: "b4", x: 898, y: 258, w: 142, h: 64, cx: 65, cy: 35, rot: -6, lines: ["このまち、", "やっぱり好き!"], fs: 12.6, d: 1.3 },
];

export default function Hero() {
  preload(`${H}/bg.webp`, { as: "image", fetchPriority: "high" });
  return (
    <section className="hm-hero" aria-label="ヒーロー">
      <div className="hm-hero-stage">
        <div className="hm-bgwrap"><img className="hm-bg" src={`${H}/bg.webp`} alt="" width={1440} height={603} fetchPriority="high" /></div>
        <div className="hm-clouds" aria-hidden="true"><i /><i /><i /></div>
        {/* 流れる鳥・ふわふわの風船 */}
        <img className="hm-fly hm-bird b1" style={{ left: "calc(733 * var(--u))", top: "calc(81 * var(--u))" }} src={`${H}/bird1.webp`} alt="" width={56} height={53} />
        <img className="hm-fly hm-bird b2" style={{ left: "calc(763 * var(--u))", top: "calc(101 * var(--u))" }} src={`${H}/bird2.webp`} alt="" width={56} height={53} />
        <img className="hm-fly hm-bird b3" style={{ left: "calc(823 * var(--u))", top: "calc(237 * var(--u))" }} src={`${H}/bird3.webp`} alt="" width={51} height={46} />
        <img className="hm-balloon" style={{ left: "calc(815 * var(--u))", top: "calc(63 * var(--u))" }} src={`${H}/balloon.webp`} alt="" width={64} height={82} />

        <h1 className="hm-title" aria-label="まちの楽しさ、まるごと見つかる。">
          <span className="hm-l1" aria-hidden="true">{L1.map(([c, col], i) => <i key={i} style={{ color: col, animationDelay: `${0.2 + i * 0.08}s`, ["--r" as string]: `${[-4, 3, -2, 4, -3, 2, 0][i]}deg` }}>{c}</i>)}</span>
          <span className="hm-l2" aria-hidden="true">{L2.map(([c, col], i) => <i key={i} style={{ color: col, animationDelay: `${0.8 + i * 0.08}s`, ["--r" as string]: `${[3, -3, 2, -2, 4, -3, 2, -2, 0][i]}deg` }}>{c}</i>)}</span>
        </h1>
        <p className="hm-sub hm-kure">人も、お店も、まちの魅力も。ぜんぶ、つながる。</p>

        {BUBBLES.map((b) => (
          <button type="button" key={b.k} className="hm-bub hm-jump" aria-label={b.lines.join("")}
            style={{ left: `calc(${b.x} * var(--u))`, top: `calc(${b.y} * var(--u))`, width: `calc(${b.w} * var(--u))`, height: `calc(${b.h} * var(--u))`, animationDelay: `${b.d}s, ${b.d + 0.8}s`, ["--ox" as string]: `${b.k === "b1" || b.k === "b2" ? 8 : b.k === "b3" ? 55 : 10}%` }}>
            <img src={`${H}/${b.k}.webp`} alt="" width={Math.round(b.w * 1.283)} height={Math.round(b.h * 1.283)} />
            <span className="hm-bt hm-kure" style={{ left: `calc(${b.cx} * var(--u))`, top: `calc(${b.cy} * var(--u))`, fontSize: `calc(${b.fs} * var(--u))`, lineHeight: `calc(${b.fs * 1.7} * var(--u))`, rotate: `${b.rot}deg` }}>{b.lines.map((l) => <span key={l}>{l}</span>)}</span>
          </button>
        ))}

        <form className="hm-search" role="search" action="/search" onSubmit={undefined}>
          <svg className="hm-s-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.6" fill="none" stroke="#9aa" strokeWidth="2" /><path d="m15.4 15.4 5 5" stroke="#9aa" strokeWidth="2.2" strokeLinecap="round" /></svg>
          <input type="search" name="q" placeholder="エリア・駅名・お店の名前などで検索" aria-label="検索" />
          <button type="submit" className="hm-s-go hm-press">検索</button>
        </form>

        <div className="hm-pills">
          <Link href="/search" className="hm-pill hm-p-map hm-press">
            <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M3 12 13 9l12 3 11-3v21l-11 3-12-3-10 3Z" fill="#fff" stroke="#2f9a5a" strokeWidth="2.6" strokeLinejoin="round" /><path d="M13 9v21M25 12v21" stroke="#2f9a5a" strokeWidth="2.2" /><path d="M20 22s-6-5.4-6-9.6a6 6 0 0 1 12 0C26 16.600 20 22 20 22Z" fill="#2f9a5a" /><circle cx="20" cy="12.300" r="2.300" fill="#fff" /></svg>
            <span><b>地図で探す</b><small>近くのお店を見つけよう</small></span>
          </Link>
          <Link href="/search" className="hm-pill hm-p-stn hm-press">
            <svg viewBox="0 0 40 40" aria-hidden="true"><rect x="8" y="4" width="24" height="28" rx="6" fill="#1d6fc4" /><rect x="12" y="9" width="16" height="9" rx="2" fill="#fff" /><circle cx="14" cy="25" r="2.200" fill="#fff" /><circle cx="26" cy="25" r="2.200" fill="#fff" /><path d="M13 32 9 38M27 32l4 6M16 4l1.500-2h5L24 4" stroke="#1d6fc4" strokeWidth="2.600" strokeLinecap="round" fill="none" /></svg>
            <span><b>駅から探す</b><small>利用する駅から探そう</small></span>
          </Link>
          <Link href="/feature" className="hm-pill hm-p-mov hm-press">
            <svg viewBox="0 0 40 40" aria-hidden="true"><rect x="3" y="6" width="34" height="28" rx="5" fill="#f28a1c" /><path d="M16 12.500 28 20l-12 7.500Z" fill="#fff" /></svg>
            <span><b>動画で探す</b><small>まちの魅力を動画でチェック</small></span>
          </Link>
        </div>
      </div>
    </section>
  );
}
