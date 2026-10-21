import Link from "next/link";
import Img from "./Img";
import { ArtIcon } from "./ArtIcons";
import { Lines } from "./ArticleCard";
import { IconArrow } from "../common/Icons";
import { Reveal, MaskLines, Write } from "../common/Motion";
import { SEARCH_HREF, ARTICLES_HREF, ARTICLE_HREF } from "../common/site";
import { CATEGORIES, SCENES, FEATURE_MAIN, FEATURE_SMALL, EXPERTS, RECOMMEND, type CatItem } from "./data";

/** ヒーロー: ARTICLE「ペットとの暮らしを、もっと豊かに。」。大見出しは 1 行ずつマスクで現れ、添え書きは左から書かれ、写真はゆっくり寄り、縁に光が走る */
export function Hero() {
  return (
    <section className="ar-hero pt-live" aria-label="記事">
      <div className="ar-hero-bg pt-shine">
        <Img className="pt-kb" src="hero.webp" w={1896} h={488} alt="笑顔で犬に顔を寄せる女性" eager />
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
      <div className="ar-rowhead io">
        <h2 id={id} className="ar-h2">
          {title}
        </h2>
        <Link className="pt-more ar-more" href={SEARCH_HREF}>
          {more}
          <IconArrow />
        </Link>
      </div>
      <ul className="ar-grid5" data-io-group>
        {items.map((it) => (
          <li key={it.id} className="io">
            <Link href={it.href} className="ar-cc pt-hov">
              <span className="ar-cc-img pt-zoom">
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

/** 特集記事(大 1 + 小 2) */
export function Features() {
  const m = FEATURE_MAIN;
  return (
    <section className="ar-feat pt-wrap" aria-labelledby="ar-h-feat" id="ar-feature">
      <div className="ar-rowhead io">
        <h2 id="ar-h-feat" className="ar-h2 ar-h2--lg">
          特集記事
        </h2>
        <Link className="pt-more ar-more" href={ARTICLES_HREF}>
          すべての特集を見る
          <IconArrow />
        </Link>
      </div>
      <div className="ar-feat-grid">
        <div className="io ar-fb-wrap" data-io="zoom">
          <Link href={m.href} className="ar-fb pt-hov pt-live">
            <span className="ar-fb-photo pt-zoom pt-shine">
              <Img src={m.img} w={952} h={468} alt="" />
            </span>
            <span className="ar-fb-txt">
              <span className="ar-fb-label">{m.label}</span>
              <h3 className="ar-fb-t">
                <Lines lines={m.title} />
              </h3>
              <p className="ar-fb-d">
                <Lines lines={m.desc} />
              </p>
              <time className="ar-date ar-fb-date">{m.date}</time>
            </span>
            <span className="pt-arrow ar-fb-arrow">
              <IconArrow />
            </span>
          </Link>
        </div>
        <ul className="ar-fs-col" data-io-group>
          {FEATURE_SMALL.map((s) => (
            <li key={s.title[0]} className="io">
              <Link href={s.href} className="ar-fs pt-hov">
                <span className="ar-fs-img pt-zoom">
                  <Img src={s.img} w={s.w} h={s.h} alt="" />
                </span>
                <span className="ar-fs-body">
                  <h3 className="ar-fs-t">
                    <Lines lines={s.title} />
                  </h3>
                  <p className="ar-fs-d">
                    <Lines lines={s.desc} />
                  </p>
                  <time className="ar-date ar-fs-date">{s.date}</time>
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
      <div className="ar-ex-in">
        <div className="ar-ex-head">
          <h2 id="ar-h-ex" className="ar-ex-h">
            専門家コラム
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
        <ul className="ar-ex-list" data-io-group>
          {EXPERTS.map((e) => (
            <li key={e.tag} className="io">
              <Link href={ARTICLE_HREF} className="ar-exc pt-hov">
                <span className="ar-exc-img pt-zoom">
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
      <div className="ar-rc-in">
        <div className="ar-rowhead">
          <h2 id="ar-h-rc" className="ar-h2 ar-h2--md">
            こんな記事もおすすめ
          </h2>
          <Link className="pt-more ar-more" href={ARTICLES_HREF}>
            すべての記事を見る
            <IconArrow />
          </Link>
        </div>
        <ul className="ar-rc-grid" data-io-group>
          {RECOMMEND.map((r) => (
            <li key={r.title[0]} className="io">
              <Link href={ARTICLE_HREF} className="ar-rcc pt-hov">
                <span className="ar-rcc-img pt-zoom">
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
