import { Fragment, type CSSProperties } from "react";
import Link from "next/link";
import Shell from "../common/Shell";
import { Reveal, MaskLines } from "../common/Motion";
import { IconArrow } from "../common/Icons";
import KindName from "../common/KindName";
import Nm from "../common/Nm";
import { vkImg, vkLinks, type VkConfig } from "../config";
import { dotDate, interleave, kindsWithShops, loadArticles, loadShops, regionsWithShops, REGIONS, type LiveArticle, type LiveShop } from "../common/live";
import HeroSearch from "./HeroSearch";
import FeatureSlider, { type FeatureSlide } from "./FeatureSlider";
import "./top.css";

/* eslint-disable @next/next/no-img-element */

// 新業種の最初のページ(本番 /activity・/sports・/life。ステイの決定デザイン「最初のページ」と同じ組み立て)。中身は実在の店(getPlaces(業種))。
// 架空の店名・日付・記事・「おすすめ」「〇選」は出さない。実データが無い欄は出さない(店が 0 件でも壊れない)。
// 飾りの写真(ヒーロー・種類の札・エリア帯の背景)は Wikimedia Commons の CC0・パブリックドメインの写真(public/_portal/vkit/{業種}/top/。出典は configs/credits.json)。
// 店の写真(特集の大きな写真・店のカード・記事の写真・エリアの札)は、その店の実物の写真だけ。

function Hero({ cfg, areas, kinds }: { cfg: VkConfig; areas: Array<{ label: string; prefs: Array<{ slug: string; name: string }> }>; kinds: Array<{ slug: string; name: string }> }) {
  const L = vkLinks(cfg);
  const T = vkImg(cfg).top;
  const t = cfg.top;
  return (
    <section className="vk-t-hero" aria-label={cfg.brand}>
      <div className="vk-t-photo vk-live">
        <img className="vk-kb" src={`${T}/hero.webp`} width={t.heroW} height={t.heroH} alt="" fetchPriority="high" style={{ objectPosition: `50% ${t.heroFocus}%` }} />
        <p className="vk-t-vert" aria-hidden="true">
          {t.vertical[0]}
          <br />
          {t.vertical[1]}
        </p>
      </div>
      <div className="vk-t-panel">
        <p className="vk-lab vk-t-lab">{t.edition}</p>
        <MaskLines as="h1" className="vk-t-h1" lines={[<Fragment key="l1">{t.h1[0]}<span className="vk-t-cm">、</span></Fragment>, t.h1[1], t.h1[2]]} delay={120} step={150} />
        <Reveal as="p" variant="fade" delay={600} className="vk-t-lead">
          {t.lead[0]}
          <br />
          {t.lead[1]}
        </Reveal>
        <Reveal as="p" variant="fade" delay={800} className="vk-t-p">
          <Nm text={t.intro} />
        </Reveal>
      </div>
      <HeroSearch action={L.search} areas={areas} kinds={kinds} hint={t.hint} noun={cfg.noun} icon={cfg.kinds[0].icon} />
    </section>
  );
}

function Kinds({ cfg, kinds }: { cfg: VkConfig; kinds: ReturnType<typeof kindsWithShops> }) {
  const L = vkLinks(cfg);
  const T = vkImg(cfg).top;
  return (
    <section className="vk-t-kinds" id="vk-type" aria-label={`${cfg.noun}の種類から探す`} data-n={kinds.length}>
      <ul data-io-group>
        {kinds.map((k) => {
          const ui = cfg.kinds.find((x) => x.slug === k.slug);
          if (!ui) return null;
          return (
            <li key={k.slug} className="io">
              <Link href={L.searchWith({ kind: k.slug })} className="vk-t-kc vk-hov" aria-label={`${k.name}(${k.count}件)を見る`}>
                <span className="vk-t-kc-ph vk-zoom">
                  <img src={`${T}/${ui.img}`} width={564} height={354} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="vk-t-kc-b">
                  <span className="vk-t-kc-n">
                    <KindName name={k.name} />
                  </span>
                  <span className="vk-t-kc-e">{ui.en}</span>
                  <IconArrow className="vk-t-kc-a" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Feature({ cfg, items }: { cfg: VkConfig; items: LiveArticle[] }) {
  const L = vkLinks(cfg);
  const t = cfg.top;
  const slides: FeatureSlide[] = items.map((a) => ({
    id: a.id,
    href: L.article(a.id),
    area: a.shop.area || a.shop.prefName,
    title: a.shop.name,
    desc: a.title,
    photo: a.photo,
  }));
  return (
    <section className="vk-t-feat" aria-labelledby="vk-t-feat-h">
      <div className="vk-t-feat-in">
        <div className="vk-t-feat-l">
          <p className="vk-lab vk-t-feat-lab io">Special Feature</p>
          <h2 id="vk-t-feat-h" className="vk-t-feat-h io" style={{ ["--d" as string]: "80ms" }}>
            {t.featH[0]}
            <br />
            {t.featH[1]}
          </h2>
          <p className="vk-t-feat-p io" style={{ ["--d" as string]: "160ms" }}>
            {t.featP[0]}
            <br />
            {t.featP[1]}
            <br />
            {t.featP[2]}
            <br />
            {t.featP[3]}
          </p>
          <Link href={L.special} className="vk-more vk-t-feat-link io" style={{ ["--d" as string]: "240ms" }}>
            特集記事をみる
            <IconArrow />
          </Link>
        </div>
        <FeatureSlider slides={slides} />
      </div>
    </section>
  );
}

function Listed({ cfg, shops }: { cfg: VkConfig; shops: LiveShop[] }) {
  const L = vkLinks(cfg);
  const t = cfg.top;
  return (
    <>
      <section className="vk-t-stays" aria-labelledby="vk-t-stays-h">
        <div className="vk-t-stays-in">
          <div className="vk-t-stays-h">
            <h2 id="vk-t-stays-h" className="vk-lab vk-t-stays-lab io">
              {t.listedEn[0]}
              <br />
              {t.listedEn[1]}
            </h2>
            <p className="vk-t-stays-jp io" style={{ ["--d" as string]: "80ms" }}>
              掲載している{cfg.noun}
            </p>
          </div>
          <ul data-io-group>
            {shops.map((s) => (
              <li key={s.id} className="io">
                <Link href={L.shop(s.id)} className="vk-t-sc vk-hov">
                  <span className="vk-t-sc-ph vk-zoom">
                    <img src={s.photo!.src} width={s.photo!.w} height={s.photo!.h} alt="" loading="lazy" decoding="async" />
                  </span>
                  <span className="vk-t-sc-b">
                    <span className="vk-t-sc-n">
                      <Nm text={s.name} />
                    </span>
                    {s.area ? <span className="vk-t-sc-a">{s.area}</span> : null}
                  </span>
                  <IconArrow className="vk-t-sc-ar" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="vk-t-stays">
        <p className="vk-t-stays-more">
          <Link href={L.search} className="vk-more vk-more--plain">
            {cfg.noun}をすべて見る
            <IconArrow />
          </Link>
        </p>
      </div>
    </>
  );
}

type AreaTile = { key: string; name: string; photo: { src: string; w: number; h: number } | null; count: number; href: string };

/** 地方の札。中国と四国は 1 つ(中国・四国)にまとめる。都道府県が 1 つだけの地方は pref、複数のときは region(地方のスラッグ。カンマ区切り)で探すページへ。札の写真はその地方の店の実物の写真(無ければ色の面) */
function areaTiles(cfg: VkConfig, shops: LiveShop[]): AreaTile[] {
  const L = vkLinks(cfg);
  const regs = regionsWithShops(shops);
  const out: AreaTile[] = [];
  for (const r of regs) {
    if (r.slug === "shikoku" && out.some((t) => t.key === "chugoku")) continue;
    let slugs = [r.slug];
    let prefs = r.prefs;
    let name = r.name;
    let count = r.count;
    let shop = r.shop;
    if (r.slug === "chugoku") {
      const sk = regs.find((x) => x.slug === "shikoku");
      if (sk) {
        slugs = ["chugoku", "shikoku"];
        prefs = [...r.prefs, ...sk.prefs];
        name = "中国・四国";
        count += sk.count;
        shop = shop ?? sk.shop;
      }
    }
    const href = prefs.length === 1 ? L.searchWith({ pref: prefs[0].slug }) : `${L.search}?region=${slugs.join(",")}`;
    out.push({ key: r.slug, name, photo: shop?.photo ? { src: shop.photo.src, w: shop.photo.w, h: shop.photo.h } : null, count, href });
  }
  return out;
}

function Area({ cfg, tiles }: { cfg: VkConfig; tiles: AreaTile[] }) {
  const L = vkLinks(cfg);
  const T = vkImg(cfg).top;
  const t = cfg.top;
  return (
    <section className="vk-t-area" id="vk-area" aria-labelledby="vk-t-area-h">
      <div className="vk-t-area-bg">
        <img src={`${T}/area-bg.webp`} width={1800} height={760} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="vk-t-area-txt">
        <h2 id="vk-t-area-h" className="vk-t-area-h io">
          {t.areaH[0]}
          <br />
          {t.areaH[1]}
        </h2>
        <p className="vk-t-area-p io" style={{ ["--d" as string]: "100ms" }}>
          {t.areaP[0]}
          <br />
          {t.areaP[1]}
        </p>
        <Link href={L.search} className="vk-t-area-btn io" style={{ ["--d" as string]: "200ms" }}>
          エリアから探す
          <IconArrow />
        </Link>
      </div>
      <p className="vk-t-area-script" aria-hidden="true">
        {t.areaScript[0]}
        <br />
        {t.areaScript[1]}
      </p>
      {tiles.length > 0 ? (
        <ul className="vk-t-tiles" data-io-group>
          {tiles.map((a, i) => (
            <li key={a.key} className="io">
              <Link href={a.href} className="vk-t-tile vk-hov" aria-label={`${a.name}(${a.count}件)を見る`}>
                <span className="vk-t-tile-ph vk-zoom" style={{ ["--vk-tv" as string]: i % 3 } as CSSProperties}>
                  {a.photo ? <img src={a.photo.src} width={a.photo.w} height={a.photo.h} alt="" loading="lazy" decoding="async" /> : <span className="vk-t-tile-en">{a.name}</span>}
                </span>
                <span className="vk-t-tile-b">
                  {a.name}
                  <IconArrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function Articles({ cfg, items }: { cfg: VkConfig; items: LiveArticle[] }) {
  const L = vkLinks(cfg);
  return (
    <section className="vk-t-arts" aria-labelledby="vk-t-arts-h">
      <div className="vk-t-arts-in">
        <div className="vk-t-arts-head">
          <h2 id="vk-t-arts-h" className="vk-t-arts-h io">
            {cfg.noun}の
            <br />
            記事
          </h2>
          <Link href={L.shops} className="vk-more vk-more--plain vk-t-arts-more io" style={{ ["--d" as string]: "100ms" }}>
            店舗紹介をもっと見る
            <IconArrow />
          </Link>
        </div>
        <ul data-io-group>
          {items.map((a) => (
            <li key={a.id} className="io">
              <Link href={L.article(a.id)} className="vk-t-ac vk-hov">
                <span className="vk-t-ac-ph vk-zoom">
                  <img src={a.photo.src} width={a.photo.w} height={a.photo.h} alt="" loading="lazy" decoding="async" />
                </span>
                <span>
                  <span className="vk-t-ac-n">
                    <Nm text={a.shop.name} />
                  </span>
                  <span className="vk-t-ac-s">
                    <Nm text={[a.shop.area, a.shop.kindName].filter(Boolean).join("・")} />
                  </span>
                  {a.date ? <time className="vk-t-ac-d" dateTime={a.date}>{dotDate(a.date)} 確認</time> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** 掲載 0 件のあいだ、札の代わりに出す短い案内 */
function Preparing({ cfg }: { cfg: VkConfig }) {
  return (
    <section className="vk-t-prep" id="vk-type" aria-labelledby="vk-t-prep-h">
      <span id="vk-area" />
      <h2 id="vk-t-prep-h">掲載準備中です</h2>
      <p>{cfg.top.prep}</p>
    </section>
  );
}

/** 重複を避けて n 件取る(足りなければ除外に入れた物からも足す) */
function take<T extends { id: string }>(primary: T[], exclude: Array<{ id: string }>, n: number): T[] {
  const ex = new Set(exclude.map((s) => s.id));
  return [...primary.filter((s) => !ex.has(s.id)), ...primary.filter((s) => ex.has(s.id))].slice(0, n);
}

/** shops を渡すと、その店で組む(確認用。本番のページは渡さない = getPlaces(業種)) */
export default async function VkTop({ cfg, shops: given }: { cfg: VkConfig; shops?: LiveShop[] }) {
  const shops = given ?? (await loadShops(cfg));
  const kinds = kindsWithShops(cfg, shops);
  const arts = loadArticles(cfg, shops);
  const feats = arts.slice(0, 3);
  const listed = take(interleave(cfg, shops.filter((s) => s.photo)), feats.map((a) => a.shop), 4);
  const strip = take(arts, feats, 3);
  const tiles = areaTiles(cfg, shops);
  // 検索の箱のエリア(店のある都道府県を地方ごとに)
  const areas = regionsWithShops(shops).map((r) => ({
    label: r.name,
    prefs: [...r.prefs]
      .sort((a, b) => REGIONS.find((x) => x.slug === r.slug)!.prefs.indexOf(a.slug) - REGIONS.find((x) => x.slug === r.slug)!.prefs.indexOf(b.slug))
      .map((p) => ({ slug: p.slug, name: p.name })),
  }));

  return (
    <Shell cfg={cfg} page="top">
      <div className="vk-t">
        <Hero cfg={cfg} areas={areas} kinds={kinds.map((k) => ({ slug: k.slug, name: k.name }))} />
        {kinds.length > 0 ? <Kinds cfg={cfg} kinds={kinds} /> : <Preparing cfg={cfg} />}
        {feats.length > 0 ? <Feature cfg={cfg} items={feats} /> : null}
        {listed.length > 0 ? <Listed cfg={cfg} shops={listed} /> : null}
        {tiles.length > 0 ? <Area cfg={cfg} tiles={tiles} /> : null}
        {strip.length > 0 ? <Articles cfg={cfg} items={strip} /> : null}
      </div>
    </Shell>
  );
}

