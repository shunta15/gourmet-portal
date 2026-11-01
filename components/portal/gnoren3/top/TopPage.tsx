import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { CircleArrow, CuisineIcon, MoreArrow, NorenMark, StatIcon } from "./icons";
import {
  AREAS, AREA_H, AREA_TOP, BASE, CUISINE, CUISINE_CARD_H, CUISINE_CARD_Y, CUISINE_H, CUISINE_ICON_CY, CUISINE_LABEL_CY, CUISINE_TOP,
  FEATURES, FEATURE_CARD_H, FEATURE_CARD_Y, FEATURE_H, FEATURE_TOP, HERO_H, HERO_TOP, IMG, SCENES, SCENE_CARD_H, SCENE_CARD_Y, SCENE_H, SCENE_TOP, STATS,
} from "./data";
import "./top.css";

/** 位置の CSS 変数(PC は calc(var(--u) * 値)。スマホでは使わない) */
const v = (o: Record<string, number | undefined>) => o as unknown as CSSProperties;

/** 見出し(h2 + リード + 「すべて見る →」)。座標は見本の絶対 y(top を引いて使う) */
function Heading({
  top, title, titleX, titleCy, titleFs = 19, lead, leadX, leadCy, more, moreX, moreCy, arrowX = 1022, href, tone = "light",
}: {
  top: number; title: string; titleX: number; titleCy: number; titleFs?: number; lead?: string; leadX?: number; leadCy?: number;
  more: string; moreX: number; moreCy: number; arrowX?: number; arrowY?: number; href: string; tone?: "light" | "dark";
}) {
  return (
    <div className={`gn3-top-hd gn3-top-hd--${tone}`}>
      <h2 className="gn3-top-h2 gn3-top-a" style={v({ "--x": titleX, "--cy": titleCy - top, "--f": titleFs })}>{title}</h2>
      {lead ? <p className="gn3-top-lead gn3-top-a" style={v({ "--x": leadX, "--cy": (leadCy ?? titleCy) - top, "--f": 10.5 })}>{lead}</p> : null}
      <Link href={href} className="gn3-top-more gn3-top-a" style={v({ "--x": moreX, "--cy": moreCy - top, "--f": 10, "--ax": arrowX - moreX })}>
        <span>{more}</span>
        <MoreArrow className="gn3-top-more-arrow" />
      </Link>
    </div>
  );
}

function Vert({ x, y, f, ls, className, children }: { x: number; y: number; f: number; ls: number; className: string; children: ReactNode }) {
  // x = 列の中心、y = 最初の字の em 上端(見本の絶対 y)。縦書き。
  return (
    <span className={`gn3-top-v ${className}`} aria-hidden="true" style={v({ "--x": x - f / 2, "--y": y - HERO_TOP, "--f": f, "--ls": ls })}>
      {children}
    </span>
  );
}

export default function TopPage() {
  return (
    <main className="gn3-top">
      {/* ───────── ヒーロー(見本 y55〜541) ───────── */}
      <section className="gn3-top-bleed gn3-top-bleed--hero" aria-label="マチノワ">
        <i className="gn3-top-edge gn3-top-edge--l" aria-hidden="true" style={{ backgroundImage: `url(${IMG}/hero-edge-l.webp)` }} />
        <i className="gn3-top-edge gn3-top-edge--r" aria-hidden="true" style={{ backgroundImage: `url(${IMG}/hero-edge-r.webp)` }} />
        <div className="gn3-top-hero" style={v({ "--h": HERO_H })}>
          <div className="gn3-top-stage">
            <div className="gn3-top-pic">
              <img className="gn3-top-pic-img" src={`${IMG}/hero.webp`} alt="" width={2172} height={972} fetchPriority="high" decoding="async" />
              {/* 左の暖簾 */}
              <Vert x={360.5} y={141} f={24} ls={3.4} className="gn3-top-ink">グルメから</Vert>
              <Vert x={322} y={144} f={24} ls={3.8} className="gn3-top-ink">広がる</Vert>
              <Vert x={283} y={143.5} f={24} ls={5.2} className="gn3-top-ink">街との輪</Vert>
              {/* 中央の暖簾(ロゴ) */}
              <NorenMark className="gn3-top-ink gn3-top-mark gn3-top-a" style={v({ "--x": 544, "--y": 145 - HERO_TOP, "--w": 61, "--h": 57 })} />
              <span className="gn3-top-ink gn3-top-logo gn3-top-a" aria-hidden="true" style={v({ "--x": 497, "--y": 216.5 - HERO_TOP, "--f": 35 })}>マチノワ</span>
              {/* 右の暖簾 */}
              <Vert x={847} y={136} f={11.5} ls={2.1} className="gn3-top-ink gn3-top-ink--s">暖簾を上げれば</Vert>
              <Vert x={819.5} y={136.5} f={11.5} ls={1.6} className="gn3-top-ink gn3-top-ink--s">きっと、いい出会いがある。</Vert>
              {/* 提灯 */}
              <NorenMark slit={false} className="gn3-top-ink gn3-top-mark gn3-top-a" style={v({ "--x": 1025, "--y": 258 - HERO_TOP, "--w": 39, "--h": 36 })} />
              <span className="gn3-top-ink gn3-top-lantern gn3-top-a" aria-hidden="true" style={v({ "--x": 1002, "--y": 303 - HERO_TOP, "--f": 18 })}>マチノワ</span>
              {/* 黒板 */}
              <Vert x={67.5} y={394} f={10.5} ls={1.6} className="gn3-top-chalk">うまいもんで</Vert>
              <Vert x={42.5} y={395} f={10.5} ls={1.5} className="gn3-top-chalk">この街は、もっと楽しい</Vert>
            </div>
          </div>
          {/* スマホ: 画像の下に見出し文 */}
          <div className="gn3-top-mlead">
            <h1 className="gn3-top-h1">グルメから広がる街との輪</h1>
            <p>暖簾を上げれば、きっと、いい出会いがある。</p>
          </div>
          {/* 数字帯 */}
          <ul className="gn3-top-stats" aria-label="マチノワの掲載数">
            {STATS.map((s, i) => (
              <li key={s.label} className="gn3-top-stat">
                <StatIcon kind={s.icon} className="gn3-top-stat-icon gn3-top-a" style={v({ "--x": s.iconX, "--y": s.iconY - HERO_TOP, "--w": s.iconW, "--h": s.iconH })} />
                <span className="gn3-top-stat-num gn3-top-a" style={v({ "--x": s.tx + 0.5, "--cy": s.numCy - HERO_TOP, "--f": 28 })}>{s.num}</span>
                <span className="gn3-top-stat-lab gn3-top-a" style={v({ "--x": s.tx + 1, "--cy": s.labCy - HERO_TOP, "--f": s.lf, "--ls": s.ls })}>{s.label}</span>
                {i < 2 ? <span className="gn3-top-stat-div gn3-top-a" aria-hidden="true" style={v({ "--x": i === 0 ? 447 : 623, "--y": 464 - HERO_TOP, "--w": 2, "--h": 43 })} /> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── 料理からさがす(見本 y541〜804) ───────── */}
      <section className="gn3-top-sec" style={v({ "--h": CUISINE_H })}>
        <div className="gn3-top-in">
          <Heading top={CUISINE_TOP} title="料理からさがす" titleX={48} titleCy={568} more="すべての料理からさがす" moreX={896} moreCy={571} href={`${BASE}/search`} />
          <ul className="gn3-top-cuisine">
            {CUISINE.map((c, i) => (
              <li key={c.label} className="gn3-top-ccard-li gn3-top-a" style={v({ "--x": c.left, "--y": CUISINE_CARD_Y - CUISINE_TOP, "--w": c.w, "--h": CUISINE_CARD_H })}>
                <Link href={`${BASE}/search`} className={`gn3-top-ccard gn3-top-tone--${c.tone}`} style={v({ "--cw": c.w })}>
                  <span className="gn3-top-ccard-in">
                    <img src={`${IMG}/cuisine-${i + 1}.webp`} alt="" width={c.w * 2} height={CUISINE_CARD_H * 2} loading="lazy" decoding="async" />
                    <CuisineIcon kind={c.icon} className="gn3-top-cicon gn3-top-a" style={v({ "--x": c.cx - c.left - 20, "--y": CUISINE_ICON_CY - 20 - CUISINE_CARD_Y, "--w": 40, "--h": 40 })} />
                    <span className="gn3-top-clabel gn3-top-a" style={v({ "--cx": c.cx - c.left, "--cy": CUISINE_LABEL_CY - CUISINE_CARD_Y, "--f": 14.5 })}>{c.label}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── エリアからさがす(見本 y804〜1027) ───────── */}
      <section className="gn3-top-bleed gn3-top-bleed--area">
        <i className="gn3-top-edge gn3-top-edge--l" aria-hidden="true" style={{ backgroundImage: `url(${IMG}/area-edge-l.webp)` }} />
        <i className="gn3-top-edge gn3-top-edge--r" aria-hidden="true" style={{ backgroundImage: `url(${IMG}/area-edge-r.webp)` }} />
        <div className="gn3-top-area" style={v({ "--h": AREA_H })}>
          <div className="gn3-top-area-img" aria-hidden="true" style={{ backgroundImage: `url(${IMG}/area.webp)` }} />
          <Heading top={AREA_TOP} tone="dark" title="エリアからさがす" titleX={50} titleCy={833} lead="気になる街で、うまい店と出会う" leadX={241} leadCy={833.5} more="すべてのエリアからさがす" moreX={890} moreCy={835.5} href={`${BASE}/search`} />
          <ul className="gn3-top-flags">
            {AREAS.map((a) => {
              const [rx, ry, rw, rh] = a.rect;
              return (
                <li key={a.label} className="gn3-top-flag-li">
                  <Link href={`${BASE}/search`} className={`gn3-top-flag gn3-top-tone--${a.tone} gn3-top-a`} style={v({ "--x": rx, "--y": ry - AREA_TOP, "--w": rw, "--h": rh })} aria-label={`${a.label}からさがす`}>
                    <span className="gn3-top-flag-t gn3-top-a" style={v({ "--x": a.tx - rx - 7, "--y": a.ty - ry, "--f": 14, "--ls": a.ls })}>{a.label}</span>
                    <CircleArrow className="gn3-top-flag-c gn3-top-a" style={v({ "--x": a.cx - rx - 9.5, "--y": a.cy - ry - 9.5, "--w": 19, "--h": 19 })} />
                  </Link>
                </li>
              );
            })}
            <li className="gn3-top-flag-li gn3-top-flag-all">
              <Link href={`${BASE}/search`} className="gn3-top-all gn3-top-a" style={v({ "--x": 920, "--y": 944 - AREA_TOP, "--w": 130, "--h": 52 })}>
                <span className="gn3-top-all-a gn3-top-a" style={v({ "--x": 5, "--cy": 959 - 944, "--f": 12.5 })}>全 <b>41</b> エリア</span>
                <span className="gn3-top-all-b gn3-top-a" style={v({ "--x": 5, "--cy": 980.5 - 944, "--f": 12.5 })}>からさがす</span>
                <CircleArrow className="gn3-top-all-c gn3-top-a" style={v({ "--x": 1013.5 - 920, "--y": 956 - 944, "--w": 29, "--h": 29 })} />
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* ───────── シーンからさがす(見本 y1027〜1226) ───────── */}
      <section className="gn3-top-sec" style={v({ "--h": SCENE_H })}>
        <div className="gn3-top-in">
          <Heading top={SCENE_TOP} title="シーンからさがす" titleX={50} titleCy={1057.5} lead="どんな時間も、街のいい店と。" leadX={238} leadCy={1059.5} more="すべてのシーンからさがす" moreX={890} moreCy={1059.5} href={`${BASE}/search`} />
          <ul className="gn3-top-scenes">
            {SCENES.map((s, i) => (
              <li key={s.a} className="gn3-top-scard-li gn3-top-a" style={v({ "--x": s.left, "--y": SCENE_CARD_Y - SCENE_TOP, "--w": s.w, "--h": SCENE_CARD_H })}>
                <Link href={`${BASE}/search`} className="gn3-top-scard">
                  <img src={`${IMG}/scene-${i + 1}.webp`} alt="" width={s.w * 2} height={SCENE_CARD_H * 2} loading="lazy" decoding="async" />
                  <span className="gn3-top-scard-t gn3-top-a" style={v({ "--x": s.tx - s.left, "--cy": 1168.5 - SCENE_CARD_Y, "--f": 14 })}>
                    {s.a}<br />{s.b}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── 特集(見本 y1226〜1448) ───────── */}
      <section className="gn3-top-sec" style={v({ "--h": FEATURE_H })}>
        <div className="gn3-top-in">
          <Heading top={FEATURE_TOP} title="特集" titleX={48} titleCy={1245} titleFs={20} lead="街の人、店、文化がつながる読みもの" leadX={112} leadCy={1247.5} more="すべての特集を見る" moreX={919} moreCy={1249.5} href={`${BASE}/feature`} />
          <ul className="gn3-top-feats">
            {FEATURES.map((f, i) => (
              <li key={f.a} className="gn3-top-fcard-li gn3-top-a" style={v({ "--x": f.left, "--y": FEATURE_CARD_Y - FEATURE_TOP, "--w": f.w, "--h": FEATURE_CARD_H })}>
                <Link href={`${BASE}/feature/sample`} className="gn3-top-fcard">
                  <img src={`${IMG}/feature-${i + 1}.webp`} alt="" width={f.w * 2} height={FEATURE_CARD_H * 2} loading="lazy" decoding="async" />
                  <span className="gn3-top-fcard-t gn3-top-a" style={v({ "--x": f.tx - f.left, "--cy": 1381 - FEATURE_CARD_Y, "--f": 15 })}>
                    {f.a}<br />{f.b}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
