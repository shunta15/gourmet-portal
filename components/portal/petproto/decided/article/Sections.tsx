import type { CSSProperties } from "react";
import Link from "next/link";
import Img from "./Img";
import { ArtIcon } from "./ArtIcons";
import { Lines } from "./ArticleCard";
import { IconArrow } from "../common/Icons";
import PawRun from "./PawRun";
import { Reveal, MaskLines, Write, FillHeading } from "../common/Motion";
import { SEARCH_HREF, ARTICLES_HREF, ARTICLE_HREF } from "../common/site";
import { CATEGORIES, SCENES, FEATURE_MAIN, FEATURE_SMALL, EXPERTS, RECOMMEND, type CatItem } from "./data";

/** ヒーロー: ARTICLE「ペットとの暮らしを、もっと豊かに。」。大見出しは 1 行ずつマスクで現れ、添え書きは左から書かれ、写真はゆっくり寄りながらスクロールで少しずれ(パララックス)、縁に光が走る */
export function Hero() {
  return (
    <section className="ar-hero pt-live" aria-label="記事">
      <div className="ar-hero-bg pt-shine">
        <span className="ar-hero-par" data-par="0.015">
          <Img className="pt-kb" src="hero.webp" w={1896} h={488} alt="笑顔で犬に顔を寄せる女性" eager />
        </span>
      </div>
      <div className="ar-hero-in">
        <Reveal as="p" variant="fade" className="ar-hero-label">
          ARTICLE
        </Reveal>
        <MaskLines as="h1" className="ar-hero-h1" lines={["ペットとの暮らしを、", "もっと豊かに。"]} delay={180} step={160} />
        <Write as="p" className="ar-hero-sub" lines={["おでかけスポット、ケアのコツ、専門家のアドバイスまで。", "ペットとの毎日がもっと楽しくなる記事をお届けします。"]} delay={700} step={420} />
      </div>
    </section>
  );
}

function PickRow({ id, title, more, items, variant }: { id: string; title: string; more: string; items: CatItem[]; variant: "cat" | "scene" }) {
  return (
    <section className={`ar-pick ar-pick--${variant} pt-wrap`} aria-labelledby={id} id={`ar-${variant}`}>
      {variant === "scene" ? <PawRun className="ar-paws--scene" count={11} direction="right" /> : null}
      <div className="ar-rowhead io">
        <h2 id={id} className="ar-h2">
          <FillHeading as="span" start={0.96} end={0.6}>{title}</FillHeading>
        </h2>
        <Link className="pt-more ar-more" href={SEARCH_HREF}>
          {more}
          <IconArrow />
        </Link>
      </div>
      <ul className="ar-grid5 pt-skew" data-skew="0.45" data-io-group>
        {items.map((it) => (
          <li key={it.id} className="pt-popin">
            <Link href={it.href} className="ar-cc ar-lift pt-hov pt-tilt" data-tilt="7">
              <span className="ar-cc-img pt-zoom ar-sheen">
                <Img src={it.img} w={it.w} h={it.h} alt="" />
              </span>
              <span className="ar-cc-lab">
                <span className="ar-cc-ic pt-bounce">
                  <ArtIcon name={it.icon} className="pt-draw" />
                </span>
                <span className="ar-cc-t">{it.label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** カテゴリから探す・シーンから探す(各 5) */
export function Picks() {
  return (
    <>
      <PickRow id="ar-h-cat" title="カテゴリから探す" more="すべてのカテゴリを見る" items={CATEGORIES} variant="cat" />
      <PickRow id="ar-h-scene" title="シーンから探す" more="すべてのシーンを見る" items={SCENES} variant="scene" />
    </>
  );
}

/** 特集記事(大 1 + 小 2)。写真は拭かれるように(ワイプ)現れ、文字は順に出る。触ると傾いて(ティルト)光が走る */
export function Features() {
  const m = FEATURE_MAIN;
  const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` }) as CSSProperties;
  return (
    <section className="ar-feat pt-wrap" aria-labelledby="ar-h-feat" id="ar-feature">
      <PawRun className="ar-paws--feat" count={12} direction="left" />
      <div className="ar-rowhead io">
        <h2 id="ar-h-feat" className="ar-h2 ar-h2--lg">
          <FillHeading as="span" start={0.96} end={0.6}>特集記事</FillHeading>
        </h2>
        <Link className="pt-more ar-more" href={ARTICLES_HREF}>
          すべての特集を見る
          <IconArrow />
        </Link>
      </div>
      <div className="ar-feat-grid pt-skew" data-skew="0.4">
        <div className="io ar-fb-wrap" data-io="zoom">
          <Link href={m.href} className="ar-fb ar-lift pt-hov pt-live pt-tilt pt-tilt--glare" data-tilt="4">
            <span className="ar-fb-photo pt-zoom pt-shine pt-wipe ar-sheen" data-wipe="left" style={d(200)}>
              <Img src={m.img} w={952} h={468} alt="" />
            </span>
            <span className="ar-fb-txt">
              <span className="ar-fb-label io" data-io="fade" style={d(700)}>
                {m.label}
              </span>
              <h3 className="ar-fb-t io" style={d(800)}>
                <Lines lines={m.title} />
              </h3>
              <p className="ar-fb-d io" style={d(950)}>
                <Lines lines={m.desc} />
              </p>
              <time className="ar-date ar-fb-date io" data-io="fade" style={d(1100)}>
                {m.date}
              </time>
            </span>
            <span className="pt-arrow ar-fb-arrow">
              <IconArrow />
            </span>
            <i className="pt-tilt-glare" aria-hidden="true" />
          </Link>
        </div>
        <ul className="ar-fs-col" data-io-group>
          {FEATURE_SMALL.map((s, i) => (
            <li key={s.title[0]} className="io" data-io="right" style={d(150 + i * 220)}>
              <Link href={s.href} className="ar-fs ar-lift pt-hov pt-tilt" data-tilt="5">
                <span className="ar-fs-img pt-zoom pt-wipe ar-sheen" data-wipe="up" style={d(350 + i * 220)}>
                  <Img src={s.img} w={s.w} h={s.h} alt="" />
                </span>
                <span className="ar-fs-body">
                  <h3 className="ar-fs-t io" style={d(750 + i * 220)}>
                    <Lines lines={s.title} />
                  </h3>
                  <p className="ar-fs-d io" style={d(880 + i * 220)}>
                    <Lines lines={s.desc} />
                  </p>
                  <time className="ar-date ar-fs-date io" data-io="fade" style={d(1000 + i * 220)}>
                    {s.date}
                  </time>
                </span>
                <span className="pt-arrow ar-arrow--fill ar-fs-arrow">
                  <IconArrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** 専門家コラム(薄いベージュの帯。見出し+説明+コラム 3) */
export function Experts() {
  return (
    <section className="ar-ex io" aria-labelledby="ar-h-ex" id="ar-experts">
      <div className="ar-ex-in pt-bgshift">
        <div className="ar-ex-head">
          <h2 id="ar-h-ex" className="ar-ex-h">
            <FillHeading as="span" start={0.96} end={0.6}>専門家コラム</FillHeading>
          </h2>
          <p className="ar-ex-p">
            <span className="ar-ln">獣医師・トレーナーなど、専門家によるコラムで</span>
            <span className="ar-ln">ペットとの暮らしに役立つ情報をお届けします。</span>
          </p>
        </div>
        <Link className="pt-more ar-more ar-ex-more" href={ARTICLES_HREF}>
          すべてのコラムを見る
          <IconArrow />
        </Link>
        <ul className="ar-ex-list pt-skew" data-skew="0.4" data-io-group>
          {EXPERTS.map((e, i) => (
            <li key={e.tag} className="io" data-io={i === 0 ? "left" : i === 2 ? "right" : "zoom"}>
              <Link href={ARTICLE_HREF} className="ar-exc ar-lift pt-hov pt-tilt" data-tilt="5">
                <span className="ar-exc-img pt-zoom ar-sheen">
                  <Img src={e.img} w={e.w} h={e.h} alt="" />
                </span>
                <span className="ar-exc-body">
                  <h3 className="ar-exc-t">
                    <Lines lines={e.title} />
                  </h3>
                  <span className="ar-tagp ar-tagp--sm">{e.tag}</span>
                  <time className="ar-date ar-exc-date">{e.date}</time>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** こんな記事もおすすめ(5) */
export function Recommend() {
  return (
    <section className="ar-rc io" aria-labelledby="ar-h-rc" id="ar-recommend">
      <div className="ar-rc-in pt-bgshift">
        <div className="ar-rowhead">
          <h2 id="ar-h-rc" className="ar-h2 ar-h2--md">
            <FillHeading as="span" start={0.96} end={0.6}>こんな記事もおすすめ</FillHeading>
          </h2>
          <Link className="pt-more ar-more" href={ARTICLES_HREF}>
            すべての記事を見る
            <IconArrow />
          </Link>
        </div>
        <ul className="ar-rc-grid pt-skew" data-skew="0.4" data-io-group>
          {RECOMMEND.map((r) => (
            <li key={r.title[0]} className="pt-popin">
              <Link href={ARTICLE_HREF} className="ar-rcc ar-lift pt-hov pt-tilt" data-tilt="6">
                <span className="ar-rcc-img pt-zoom ar-sheen">
                  <Img src={r.img} w={r.w} h={r.h} alt="" />
                </span>
                <h3 className="ar-rcc-t">
                  <Lines lines={r.title} />
                </h3>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
