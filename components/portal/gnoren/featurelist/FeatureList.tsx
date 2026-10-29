import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "../common/icons";
import { THEMES, NEWS, NOREN_CONTENT, SAMPLE_HREF } from "./data";
import { ICONS } from "./icons";
import { NOREN_GEOM } from "./norenGeom";
import "./featurelist.css";

const IMG = "/_portal/gnoren/featurelist";
type V = CSSProperties & Record<`--${string}`, string | number>;

// 暖簾を吊る小さな木の留め具(見本 5 の位置)
const PEGS: [number, number][] = [[333.7, 55], [421, 63], [520, 66], [616.8, 68.8], [719.5, 70], [825, 67], [925.8, 63.8], [1030.5, 58]];

function Noren({ i }: { i: number }) {
  const t = THEMES[i];
  const g = NOREN_GEOM[t.key];
  const c = NOREN_CONTENT[t.key];
  const Ic = ICONS[t.key];
  const clip = `polygon(${g.poly.map(([x, y]) => `${((x / g.w) * 100).toFixed(2)}% ${((y / g.h) * 100).toFixed(2)}%`).join(",")})`;
  const pc = (v: number, o: number, s: number) => `${(((v - o) / s) * 100).toFixed(2)}%`;
  return (
    <Link
      href={`#gn-fl-theme-${t.key}`}
      className={`gn-fl-nr gn-fl-nr-${c.tone}`}
      style={{ "--x": g.x, "--y": g.y, "--w": g.w, "--h": g.h, "--i": i } as V}
      aria-label={`${t.noren}の特集へ`}
    >
      <span className="gn-fl-nr-cloth" style={{ backgroundImage: `url(${IMG}/noren-${t.key}.webp)`, clipPath: clip }} aria-hidden="true" />
      <span className="gn-fl-nr-ic" style={{ left: pc(c.icon[0], g.x, g.w), top: pc(c.icon[1], g.y, g.h), height: `calc(var(--s) * ${c.ih})`, transform: `translate(-50%,-50%) rotate(${c.rot}deg)` }}>
        <Ic />
      </span>
      <span className="gn-fl-nr-lb" style={{ left: pc(c.label[0], g.x, g.w), top: pc(c.label[1], g.y, g.h), fontSize: `calc(var(--s) * ${c.lh})`, transform: `translate(-50%,-50%) rotate(${c.rot}deg)` }}>
        {t.noren}
      </span>
    </Link>
  );
}

export default function FeatureList() {
  return (
    <main className="gn-fl">
      {/* ───── ヒーロー + 今、読みたい ───── */}
      <section className="gn-fl-hero" aria-labelledby="gn-fl-h1">
        <div className="gn-fl-top">
        <div className="gn-fl-hero-bg" aria-hidden="true" />
        <div className="gn-fl-hero-txt">
          <h1 id="gn-fl-h1" className="gn-fl-h1">特集から読む</h1>
          <p className="gn-fl-lead">
            この街の食を、もっと深く、もっと楽しく。<br />
            シーンやテーマから見つける、<br />
            マチノワ グルメの特集記事です。
          </p>
        </div>

        {PEGS.map(([x, y], i) => (
          <span key={i} className="gn-fl-peg" style={{ left: `calc(var(--u) * ${x})`, top: `calc(var(--u) * ${y})` }} aria-hidden="true" />
        ))}
        <nav className="gn-fl-norens" aria-label="特集のテーマ">
          {THEMES.map((_, i) => (
            <Noren key={i} i={i} />
          ))}
        </nav>

        <p className="gn-fl-gscript gn-script" aria-hidden="true">
          Machinowa Gourmet<br />Feature
        </p>
        </div>

        <article className="gn-fl-pick">
          <Link href={SAMPLE_HREF} className="gn-fl-pick-link" aria-label="この街で出会う、とっておきのランチ。特集を読む">
            <img src={`${IMG}/pick.webp`} alt="" width={1538} height={480} className="gn-fl-pick-img" />
            <span className="gn-fl-pick-shade" aria-hidden="true" />
            <span className="gn-fl-tag"><span>今、読みたい</span></span>
            <span className="gn-fl-pick-t gn-mincho">この街で出会う、<br />とっておきのランチ</span>
            <span className="gn-fl-pick-d">
              地元で愛される定番から、話題の新店まで。<br />
              何度でも訪れたくなる、この街のランチを<br />
              集めました。
            </span>
            <span className="gn-fl-pick-btn">
              特集を読む
              <ArrowRight />
            </span>
          </Link>
        </article>

        <div className="gn-fl-side" aria-hidden="true">
          <p className="gn-fl-pul gn-mincho">PICK UP<br />LUNCH</p>
          <img src={`${IMG}/polaroid.webp`} alt="" width={272} height={372} className="gn-fl-pola" />
          <p className="gn-fl-note">
            いつもの街に、<br />
            おいしい発見。<br />
            ランチがもっと<br />
            好きになる。
          </p>
          <img src={`${IMG}/leaf.webp`} alt="" width={256} height={352} className="gn-fl-leaf" />
        </div>
      </section>

      {/* ───── テーマから探す ───── */}
      <section className="gn-fl-themes" aria-labelledby="gn-fl-h2a">
        <div className="gn-fl-sh">
          <h2 id="gn-fl-h2a" className="gn-fl-sh-t">テーマから探す</h2>
          <img src={`${IMG}/townscape.webp`} alt="" width={1146} height={150} className="gn-fl-town" />
          <p className="gn-fl-find gn-script" aria-hidden="true">Find your favorite feature</p>
          <Link href={SAMPLE_HREF} className="gn-fl-more">
            すべての特集を見る
            <ArrowRight />
          </Link>
        </div>

        <div className="gn-fl-cards">
          {THEMES.map((t, i) => {
            const Ic = ICONS[t.key];
            return (
              <Link
                key={t.key}
                id={`gn-fl-theme-${t.key}`}
                href={SAMPLE_HREF}
                className={`gn-fl-card gn-fl-card-r${t.row} gn-fl-tone-${t.tone}`}
                style={{ "--x": t.x, "--w": t.w, "--i": i } as V}
              >
                <span className="gn-fl-card-hd gn-linen">
                  <Ic className="gn-fl-card-ic" />
                  <span className="gn-fl-card-hl gn-mincho"><b>{t.head}</b>の特集</span>
                </span>
                <span className="gn-fl-card-ph">
                  <img src={`${IMG}/theme-${t.key}.webp`} alt="" loading="lazy" />
                </span>
                <span className="gn-fl-go" aria-hidden="true"><ArrowRight /></span>
                <span className="gn-fl-card-t gn-mincho">{t.title[0]}<br />{t.title[1]}</span>
                <span className="gn-fl-card-d">{t.desc[0]}<br />{t.desc[1]}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───── 新着の特集記事 ───── */}
      <section className="gn-fl-news" aria-labelledby="gn-fl-h2b">
        <div className="gn-fl-nh">
          <h2 id="gn-fl-h2b" className="gn-fl-nh-t gn-mincho">新着の特集記事</h2>
          <span className="gn-fl-nh-rule" aria-hidden="true" />
          <Link href={SAMPLE_HREF} className="gn-fl-nh-more">
            すべて見る
            <ArrowRight />
          </Link>
        </div>
        <ul className="gn-fl-nlist">
          {NEWS.map((n, i) => (
            <li key={n.img} className="gn-fl-ni" style={{ "--x": n.x, "--w": n.w, "--i": i } as V}>
              <Link href={SAMPLE_HREF} className="gn-fl-ni-a">
                <span className="gn-fl-ni-ph">
                  <img src={`${IMG}/new-${n.img}.webp`} alt="" />
                </span>
                <span className="gn-fl-go gn-fl-go-s" aria-hidden="true"><ArrowRight /></span>
                <span className="gn-fl-ni-t gn-mincho">{n.title[0]}<br />{n.title[1]}</span>
                <span className="gn-fl-chips">
                  {n.tags.map((g) => (
                    <span key={g.t} className={g.warm ? "gn-fl-chip is-warm" : "gn-fl-chip"}>#{g.t}</span>
                  ))}
                </span>
                <time className="gn-fl-date">{n.date}</time>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ───── 下の帯 ───── */}
      <section className="gn-fl-band" aria-label="すべての特集へ">
        <img src={`${IMG}/band.webp`} alt="" className="gn-fl-band-bg" loading="lazy" />
        <h2 className="gn-fl-band-t gn-mincho">この街の、まだ知らないおいしいに、<br />きっと出会える。</h2>
        <p className="gn-fl-band-s">マチノワ グルメの特集で、食のある暮らしをもっと豊かに。</p>
        <Link href={SAMPLE_HREF} className="gn-fl-band-btn">
          すべての特集を見る
          <ArrowRight />
        </Link>
      </section>
    </main>
  );
}
