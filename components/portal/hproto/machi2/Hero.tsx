/* eslint-disable @next/next/no-img-element */
import { Fragment } from "react";
import Link from "next/link";
import { preload } from "react-dom";
import { IMG } from "./const";
import SeasonStage from "./SeasonStage";
import { seasonSrc, type Season } from "./season";
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

export default function Hero({ mihon, season }: { mihon: boolean; season: Season }) {
  // 最初の季節の絵だけ優先して読む(ほかの季節は表示後にクライアントで順に読む)
  preload(seasonSrc(IMG, season), { as: "image", fetchPriority: "high" });
  const lines = (mihon ? MIHON_HEAD : HEAD).map((t, i) => ({ k: i, chars: Array.from(t), col: COLS[(mihon ? "m" : "c") + (i + 1)] }));
  const hlLine = mihon ? 0 : 1, hlChar = mihon ? 3 : 4;
  const subs = mihon ? [...MIHON_SUB] : [P1_ONE, P3_ONE];
  let n = 0;
  // スマホでは 2 段落目を最後の「、」で 2 行に折る(字は変えない。折る印は css が出すだけ)
  const sub = subs.map((t, si) => { const cs = Array.from(t); return { bi: si === 1 ? cs.lastIndexOf("、") : -1, cs: cs.map((c) => ({ c, n: n++ })) }; });
  const lastN = n - 1;
  return (
    <section className="h2-hero" aria-label="ヒーロー" data-season={season}>
      <div className="h2-hero-stage">
        {/* 層 1: 背景の絵(春夏秋冬・「輪」で切り替わる・ゆっくり寄る+マウスでいちばん小さく動く)と季節の札 */}
        <SeasonStage initial={season} />
        <div className="h2-clouds" aria-hidden="true"><i /><i /><i /></div>
        {/* 流れる鳥・ふわふわの風船(背景の絵の気球とは別の位置) */}
        <img className="h2-fly h2-bird b1" style={{ left: "calc(430 * var(--u))", top: "calc(54 * var(--u))" }} src={`${H}/bird1.webp`} alt="" width={56} height={53} />
        <img className="h2-fly h2-bird b2" style={{ left: "calc(470 * var(--u))", top: "calc(74 * var(--u))" }} src={`${H}/bird2.webp`} alt="" width={56} height={53} />
        <img className="h2-fly h2-bird b3" style={{ left: "calc(520 * var(--u))", top: "calc(46 * var(--u))" }} src={`${H}/bird3.webp`} alt="" width={51} height={46} />
        <img className="h2-balloon" style={{ left: "calc(668 * var(--u))", top: "calc(58 * var(--u))" }} src={`${H}/balloon.webp`} alt="" width={64} height={82} />
        {/* 層 2: 看板 */}
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
            <span key={li} className="h2-sln">{ln.cs.map((x, xi) => (
              <Fragment key={x.n}>
                <i className={[x.n === lastN ? "h2-last" : "", xi === ln.bi ? "h2-brk-a" : "", ln.bi >= 0 && xi === ln.bi + 1 ? "h2-brk-b" : ""].filter(Boolean).join(" ") || undefined} style={{ ["--n" as string]: x.n }}>{x.c}</i>
                {xi === ln.bi && <br className="h2-mbr" />}
              </Fragment>
            ))}</span>
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
