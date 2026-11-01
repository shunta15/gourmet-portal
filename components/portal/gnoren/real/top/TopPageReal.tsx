import Link from "next/link";
import type { CSSProperties } from "react";
import SectionHeading from "../../common/SectionHeading";
import { Townscape } from "../../common/Decor";
import { ArrowRight } from "../../common/icons";
import type { GnLinks } from "../../common/nav";
import { AREA_X, CAT_X, FEAT_X, SCENE_X } from "../../top/data";
import { CAT_ICONS, ChevronRight } from "../../top/icons";
import Reveal from "../../top/Reveal";
import { ENTRANCE_H1, ENTRANCE_LEAD } from "@/lib/portal/noren/entranceCopy";
import { searchHref } from "../common/links";
import type { TopData, TopPhoto } from "@/lib/portal/gnoren/top";
import "../../top/top.css";
import "./real.css";

const IMG = "/_portal/gnoren/top";

/** 料理の暖簾の麻地の色(見本の順: 深緑・生成り・赤・生成り・深緑・赤・生成り) */
const CAT_TONES = ["green", "linen", "red", "linen", "green", "red", "linen"] as const;

/** 見出し h1 の 2 行(ENTRANCE_H1 =「グルメから広がる街との輪」を、見本の 2 行の組み方で。字は変えない) */
const H1_BREAK = "グルメから広がる".length;

function Photo({ p, w, h, lazy = true }: { p: TopPhoto; w: number; h: number; lazy?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={p.src} srcSet={p.srcSet} sizes={p.sizes} alt="" width={w} height={h} loading={lazy ? "lazy" : undefined} decoding="async" />;
}

/**
 * トップ(見本 1)の実データ版。見本 1086×1448 の座標・枚数・飾りは試作 TopPage と同じ(top.css を import)。
 * 文は lib/portal/noren/entranceCopy.ts の確定文(h1・リード)と、数・名前をデータから入れた文だけ。見本の仮の言葉は使わない。
 */
export default function TopPageReal({ data, links }: { data: TopData; links: GnLinks }) {
  const { stats, cats, areas, scenes, features } = data;
  const searchAll = searchHref();
  const h1a = ENTRANCE_H1.slice(0, H1_BREAK);
  const h1b = ENTRANCE_H1.slice(H1_BREAK);

  return (
    <main className="gn-top gn-top-real">
      <Reveal />
      <div className="gn-top-in">
        {/* ───────── ヒーロー ───────── */}
        <section className="gn-top-hero" aria-label="マチノワ グルメ">
          <div className="gn-top-hero-bg" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${IMG}/hero.webp`} alt="" width={2172} height={856} fetchPriority="high" />
          </div>
          <div className="gn-top-hero-copy">
            <h1 className="gn-top-h1" aria-label={ENTRANCE_H1}>
              <span>{h1a}</span>
              <span>{h1b}</span>
            </h1>
            <p className="gn-top-lead">
              <span>{ENTRANCE_LEAD}</span>
            </p>
            <Link href={links.search} className="gn-top-cta">
              <span>店をさがす</span>
              <ArrowRight className="gn-top-cta-ar" />
            </Link>
          </div>
          <div className="gn-top-gallery" aria-hidden="true">
            <span className="gn-script gn-top-gallery-script">Noren Gallery</span>
            <span className="gn-top-gallery-s">
              MACHINOWA GOURMET
              <br />
              GOOD FOOD
              <br />
              GOOD NEIGHBORS
            </span>
          </div>
        </section>

        {/* ───────── 統計帯 ───────── */}
        <section className="gn-top-stats" aria-label="マチノワ グルメの掲載数">
          <Townscape className="gn-top-town" />
          <svg className="gn-top-wave" viewBox="0 0 1086 24" preserveAspectRatio="none" aria-hidden="true">
            <path d="M340 12C470 15 640 14 800 11S1020 6 1086 5" fill="none" stroke="#e0d6c9" strokeWidth="1" />
            <path d="M980 11C1020 8 1060 6 1086 7" fill="none" stroke="#e1d7ca" strokeWidth="1" />
          </svg>
          <p className="gn-top-stats-cap">マチノワ グルメの掲載数</p>
          <ul className="gn-top-stats-list">
            <li className="gn-top-stat gn-top-stat-1">
              <p className="gn-top-stat-main">
                <b className="gn-top-num">{stats.shops}</b>
                <span className="gn-top-unit">店舗</span>
              </p>
              <p className="gn-top-stat-sub">掲載中の飲食店</p>
            </li>
            <li className="gn-top-stat gn-top-stat-2">
              <p className="gn-top-stat-main">
                <b className="gn-top-num">{stats.areas}</b>
                <span className="gn-top-unit">エリア</span>
              </p>
              <p className="gn-top-stat-sub">店のある地域</p>
            </li>
            <li className="gn-top-stat gn-top-stat-3">
              <p className="gn-top-stat-main">
                <b className="gn-top-num">{stats.cuisines}</b>
                <span className="gn-top-unit">料理分類</span>
              </p>
              <p className="gn-top-stat-sub">
                {data.cuisineFirst}から{data.cuisineLast}まで
              </p>
            </li>
          </ul>
        </section>

        {/* ───────── 料理から探す ───────── */}
        <section className="gn-top-sec gn-top-cat" aria-labelledby="gn-top-cat-h" data-rv>
          <SectionHeading
            className="gn-top-head gn-top-head-cat"
            title="料理から探す"
            lead={`${data.cuisineFirst}から${data.cuisineLast}まで、全 ${stats.shops} 軒を ${stats.cuisines} つの分類から。`}
            href={searchAll}
          />
          <h2 id="gn-top-cat-h" className="gn-top-sr">料理から探す</h2>
          <ul className="gn-top-cat-track">
            {cats.map((c, i) => {
              const Icon = CAT_ICONS[i];
              return (
                <li key={c.key} className="gn-top-cat-li" style={{ "--x": CAT_X[i] } as CSSProperties}>
                  <Link href={c.href} className={`gn-top-noren is-${CAT_TONES[i % CAT_TONES.length]}`} aria-label={`${c.label}のお店をさがす`}>
                    <span className="gn-top-cloth gn-linen" aria-hidden="true" />
                    <Icon className="gn-top-noren-ic" />
                    <span className="gn-top-noren-label">{c.label}</span>
                    {c.photo ? (
                      <span className="gn-top-noren-ph">
                        <Photo p={c.photo} w={240} h={166} />
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ───────── エリアから探す ───────── */}
        <section className="gn-top-sec gn-top-area" aria-labelledby="gn-top-area-h" data-rv>
          <SectionHeading
            className="gn-top-head gn-top-head-area"
            title="エリアから探す"
            lead={`店のある ${stats.areas} 地域のうち、店の数が多い ${areas.length} 地域。`}
            href={searchAll}
          />
          <h2 id="gn-top-area-h" className="gn-top-sr">エリアから探す</h2>
          <ul className="gn-top-area-track">
            {areas.map((a, i) => (
              <li key={a.key} className="gn-top-area-li" style={{ "--x": AREA_X[i] } as CSSProperties}>
                <Link href={a.href} className="gn-top-banner is-light" aria-label={`${a.name}のお店をさがす`}>
                  <span className="gn-top-banner-rod" aria-hidden="true" />
                  {a.photo ? (
                    <span className="gn-top-banner-ph">
                      <Photo p={a.photo} w={140} h={318} />
                    </span>
                  ) : null}
                  <span className="gn-top-banner-name">{a.name}</span>
                  <span className="gn-top-banner-go" aria-hidden="true">
                    <ChevronRight />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="gn-top-map">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="gn-top-map-img" src={`${IMG}/map.webp`} alt="" width={628} height={412} loading="lazy" decoding="async" />
            <span className="gn-script gn-top-map-script" aria-hidden="true">Find your area</span>
            <Link href={searchAll} className="gn-top-map-btn">
              <span>
                全<b>{stats.areas}</b>エリアから探す
              </span>
              <ArrowRight className="gn-top-cta-ar" />
            </Link>
          </div>
        </section>

        {/* ───────── シーンから探す ───────── */}
        <section className="gn-top-sec gn-top-scene" aria-labelledby="gn-top-scene-h" data-rv>
          <SectionHeading
            className="gn-top-head gn-top-head-scene"
            title="シーンから探す"
            lead={`利用シーン ${data.sceneTotal} 種のうち、店の数が多い ${scenes.length} 種。`}
            href={searchAll}
          />
          <h2 id="gn-top-scene-h" className="gn-top-sr">シーンから探す</h2>
          <ul className="gn-top-scene-list">
            {scenes.map((s, i) => (
              <li key={s.slug} className="gn-top-scene-li" style={{ "--x": SCENE_X[i] } as CSSProperties}>
                <Link href={s.href} className="gn-top-scene-card">
                  <span className="gn-top-scene-ph">{s.photo ? <Photo p={s.photo} w={308} h={170} /> : null}</span>
                  <span className="gn-top-scene-t">{s.name}</span>
                  <span className="gn-top-scene-d">
                    <span>{s.tagline}</span>
                    <span>{s.count}軒</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ───────── 特集から読む ───────── */}
        <section className="gn-top-sec gn-top-feat" aria-labelledby="gn-top-feat-h" data-rv>
          <SectionHeading
            className="gn-top-head gn-top-head-feat"
            title="特集から読む"
            lead={`街を歩く、季節をたどる。全 ${data.featureTotal} 本。`}
            href={links.feature}
          />
          <h2 id="gn-top-feat-h" className="gn-top-sr">特集から読む</h2>
          <ul className="gn-top-feat-list">
            {features.map((f, i) => (
              <li key={f.id} className="gn-top-feat-li" style={{ "--x": FEAT_X[i] } as CSSProperties}>
                <Link href={f.href} className={`gn-top-fcard is-light${i === 0 ? " is-big" : ""}`}>
                  {f.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="gn-top-fcard-img" src={f.photo.src} srcSet={f.photo.srcSet} sizes={f.photo.sizes} alt="" width={476} height={300} loading="lazy" decoding="async" />
                  ) : null}
                  <span className="gn-top-fcard-t">{f.title}</span>
                  {f.sub ? <span className="gn-top-fcard-s">{f.sub}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
