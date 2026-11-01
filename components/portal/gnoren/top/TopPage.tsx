import Link from "next/link";
import type { CSSProperties } from "react";
import SectionHeading from "../common/SectionHeading";
import { Townscape } from "../common/Decor";
import { ArrowRight } from "../common/icons";
import { AREAS, AREA_X, CATS, CAT_X, FEATURES, FEAT_X, SCENES, SCENE_X, TOP_FEATURE, TOP_FEATURE_SAMPLE, TOP_SEARCH } from "./data";
import { CAT_ICONS, ChevronRight } from "./icons";
import Reveal from "./Reveal";
import "./top.css";

const IMG = "/_portal/gnoren/top";

/* 画像の実寸(2 倍で保存) */
const CAT_WH: [number, number] = [240, 166];

/** トップ(見本 1)。見本 1086×1448 の 1:1 再現。PC は見本の座標どおり(--u)、スマホは縦に積む。 */
export default function TopPage() {
  return (
    <main className="gn-top">
      <Reveal />
      <div className="gn-top-in">
        {/* ───────── ヒーロー ───────── */}
        <section className="gn-top-hero" aria-label="マチノワ グルメ">
          <div className="gn-top-hero-bg" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${IMG}/hero.webp`} alt="" width={2172} height={856} fetchPriority="high" />
          </div>
          <div className="gn-top-hero-copy">
            <h1 className="gn-top-h1">
              <span>布越しに見える、</span>
              <span>街の美味しい景色。</span>
            </h1>
            <p className="gn-top-lead">
              <span>暖簾をくぐれば、いつもの街が</span>
              <span>もっとおいしく、もっとたのしくなる。</span>
              <span>マチノワ グルメで、あなたの食べたいがきっと見つかります。</span>
            </p>
            <Link href={TOP_SEARCH} className="gn-top-cta">
              <span>おいしいお店をさがす</span>
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
          <p className="gn-top-stats-cap">マチノワ グルメで見つかる</p>
          <ul className="gn-top-stats-list">
            <li className="gn-top-stat gn-top-stat-1">
              <p className="gn-top-stat-main">
                <b className="gn-top-num">509</b>
                <span className="gn-top-unit">店舗</span>
              </p>
              <p className="gn-top-stat-sub">この街の、選りすぐりの飲食店</p>
            </li>
            <li className="gn-top-stat gn-top-stat-2">
              <p className="gn-top-stat-main">
                <b className="gn-top-num">41</b>
                <span className="gn-top-unit">エリア</span>
              </p>
              <p className="gn-top-stat-sub">街のあらゆるエリアから</p>
            </li>
            <li className="gn-top-stat gn-top-stat-3">
              <p className="gn-top-stat-main">
                <b className="gn-top-num">7</b>
                <span className="gn-top-unit">料理分類</span>
              </p>
              <p className="gn-top-stat-sub">きっと見つかる、好きな味</p>
            </li>
          </ul>
        </section>

        {/* ───────── 料理から探す ───────── */}
        <section className="gn-top-sec gn-top-cat" aria-labelledby="gn-top-cat-h" data-rv>
          <SectionHeading
            className="gn-top-head gn-top-head-cat"
            title="料理から探す"
            lead="気になる暖簾を上げて、食の世界をのぞいてみませんか。"
            href={TOP_SEARCH}
          />
          <h2 id="gn-top-cat-h" className="gn-top-sr">料理から探す</h2>
          <ul className="gn-top-cat-track">
            {CATS.map((c, i) => {
              const Icon = CAT_ICONS[i];
              return (
                <li key={c.key} className="gn-top-cat-li" style={{ "--x": CAT_X[i] } as CSSProperties}>
                  <Link href={TOP_SEARCH} className={`gn-top-noren is-${c.tone}`} aria-label={`${c.label}のお店をさがす`}>
                    <span className="gn-top-cloth gn-linen" aria-hidden="true" />
                    <Icon className="gn-top-noren-ic" />
                    <span className="gn-top-noren-label">{c.label}</span>
                    <span className="gn-top-noren-ph">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${IMG}/cat-${i + 1}.webp`} alt="" width={CAT_WH[0]} height={CAT_WH[1]} loading="lazy" decoding="async" />
                    </span>
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
            lead="気になるエリアの暖簾を上げて、街のおいしいお店に出会いましょう。"
            href={TOP_SEARCH}
          />
          <h2 id="gn-top-area-h" className="gn-top-sr">エリアから探す</h2>
          <ul className="gn-top-area-track">
            {AREAS.map((a, i) => (
              <li key={a.name} className="gn-top-area-li" style={{ "--x": AREA_X[i] } as CSSProperties}>
                <Link href={TOP_SEARCH} className={`gn-top-banner is-${a.tone}${"rod" in a ? " is-darkrod" : ""}`} aria-label={`${a.name}のお店をさがす`}>
                  <span className="gn-top-banner-rod" aria-hidden="true" />
                  <span className="gn-top-banner-ph">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${IMG}/area-${i + 1}.webp`} alt="" width={140} height={318} loading="lazy" decoding="async" />
                  </span>
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
            <Link href={TOP_SEARCH} className="gn-top-map-btn">
              <span>
                全<b>41</b>エリアから探す
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
            lead="今日の気分にぴったりの一軒が見つかります。"
            href={TOP_SEARCH}
          />
          <h2 id="gn-top-scene-h" className="gn-top-sr">シーンから探す</h2>
          <ul className="gn-top-scene-list">
            {SCENES.map((s, i) => (
              <li key={s.title} className="gn-top-scene-li" style={{ "--x": SCENE_X[i] } as CSSProperties}>
                <Link href={TOP_SEARCH} className="gn-top-scene-card">
                  <span className="gn-top-scene-ph">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${IMG}/scene-${i + 1}.webp`} alt="" width={308} height={170} loading="lazy" decoding="async" />
                  </span>
                  <span className="gn-top-scene-t">{s.title}</span>
                  <span className="gn-top-scene-d">
                    <span>{s.lines[0]}</span>
                    <span>{s.lines[1]}</span>
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
            lead="街の食をもっと楽しむ、読みもの特集。"
            href={TOP_FEATURE}
          />
          <h2 id="gn-top-feat-h" className="gn-top-sr">特集から読む</h2>
          <ul className="gn-top-feat-list">
            {FEATURES.map((f, i) => (
              <li key={i} className="gn-top-feat-li" style={{ "--x": FEAT_X[i] } as CSSProperties}>
                <Link
                  href={TOP_FEATURE_SAMPLE}
                  className={`gn-top-fcard is-${f.tone}${"big" in f ? " is-big" : ""}${f.title.length === 1 ? " is-one" : ""}`}
                  style={{ "--gn-n": f.title.length } as CSSProperties}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="gn-top-fcard-img" src={`${IMG}/feature-${i + 1}.webp`} alt="" width={476} height={300} loading="lazy" decoding="async" />
                  <span className="gn-top-fcard-t">
                    {f.title.map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </span>
                  <span className="gn-top-fcard-s">
                    {f.sub.map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
