import { Fragment } from "react";
import Link from "next/link";
import Shell from "../../common/Shell";
import { Reveal, MaskLines } from "../../common/Motion";
import { IconArrow } from "../../common/Icons";
import KindName from "../../common/KindName";
import { IMG_TOP as T, syLinks } from "../../common/site";
import { KIND_EN, dotDate, interleave, kindsWithShops, loadStayArticles, loadStayShops, regionsWithShops, REGIONS, type LiveArticle, type LiveShop } from "../../common/live";
import HeroSearch from "../HeroSearch";
import FeatureSlider, { type FeatureSlide } from "../FeatureSlider";
import "../top.css";

/* eslint-disable @next/next/no-img-element */

// ステイの最初のページ(本番 /stay。決定デザイン。見本 4_最初のページ)。中身は実在の宿(getPlaces("stay"))。
// 見本の架空の宿名・日付・記事・「おすすめ」「10選」・予約の日付の箱は出さない。実データが無い欄は出さない(宿が 0 件でも壊れない)。
// 飾りの写真(ヒーロー・種類の札・エリアの札)は見本から切り抜いた素材(public/_portal/stayproto/decided/top/)、エリア帯の背景は Wikimedia Commons(CC0。common/credits.json)。
// 宿の写真(特集の大きな写真・宿のカード・記事の写真)は、その宿の実物の写真だけ。

const L = syLinks("live");
const SEARCH_HINT = "宿名・地名で探す";

/** 種類の札(5 枠の並び。英字は common/live.ts の KIND_EN)。写真は kind-N.webp(ホテル・旅館・グランピング・一棟貸しはオーナー提供の素材) */
const KIND_UI: Record<string, { en: string; img: number }> = {
  hotel: { en: KIND_EN.hotel, img: 1 },
  ryokan: { en: KIND_EN.ryokan, img: 2 },
  pension: { en: KIND_EN.pension, img: 3 },
  glamping: { en: KIND_EN.glamping, img: 4 },
  rental: { en: KIND_EN.rental, img: 5 },
};

/** エリアの札の写真(見本 area-N.webp。見本に無い北陸は甲信越の写真を使う) */
const AREA_IMG: Record<string, number> = { hokkaido: 1, tohoku: 2, kanto: 3, koshinetsu: 4, hokuriku: 4, tokai: 5, kansai: 6, chugoku: 7, shikoku: 7, kyushu: 8, okinawa: 9 };

function Hero({ areas, kinds }: { areas: Array<{ label: string; prefs: Array<{ slug: string; name: string }> }>; kinds: Array<{ slug: string; name: string }> }) {
  return (
    <section className="sy-t-hero" aria-label="マチノワステイ">
      <div className="sy-t-photo sy-live">
        <img className="sy-kb" src={`${T}/hero.webp`} width={1671} height={941} alt="" fetchPriority="high" />
        <p className="sy-t-vert" aria-hidden="true">
          何気ない一泊が、
          <br />
          特別な思い出になる。
        </p>
      </div>
      <div className="sy-t-panel">
        <p className="sy-lab sy-t-lab">The Stay Edition</p>
        <MaskLines as="h1" className="sy-t-h1" lines={[<Fragment key="l1">まだ知らない<span className="sy-t-cm">、</span></Fragment>, "泊まりたい", "場所へ。"]} delay={120} step={150} />
        <Reveal as="p" variant="fade" delay={600} className="sy-t-lead">
          泊まることで、
          <br />
          街がもっと好きになる。
        </Reveal>
        <Reveal as="p" variant="fade" delay={800} className="sy-t-p">
          マチノワステイは、地域の宿泊施設を紹介するポータルサイトです。<span className="sy-kn">ホテル・旅館</span>、<span className="sy-kn">民宿・ペンション・ゲストハウス</span>、<span className="sy-kn">グランピング・キャンプ</span>、<span className="sy-kn">一棟貸し・貸別荘</span>など、実在の宿を、確認できた情報で一軒ずつ紹介します。
        </Reveal>
      </div>
      <HeroSearch action={L.search} areas={areas} kinds={kinds} hint={SEARCH_HINT} />
    </section>
  );
}

function Kinds({ kinds }: { kinds: ReturnType<typeof kindsWithShops> }) {
  return (
    <section className="sy-t-kinds" id="sy-type" aria-label="宿の種類から探す">
      <ul data-io-group>
        {kinds.map((k) => {
          const ui = KIND_UI[k.slug];
          if (!ui) return null;
          return (
            <li key={k.slug} className="io">
              <Link href={L.searchWith({ kind: k.slug })} className="sy-t-kc sy-hov" aria-label={`${k.name}(${k.count}軒)を見る`}>
                <span className="sy-t-kc-ph sy-zoom">
                  <img src={`${T}/kind-${ui.img}.webp`} width={564} height={354} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="sy-t-kc-b">
                  <span className="sy-t-kc-n">
                    <KindName name={k.name} />
                  </span>
                  <span className="sy-t-kc-e">{ui.en}</span>
                  <IconArrow className="sy-t-kc-a" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Feature({ items }: { items: LiveArticle[] }) {
  const slides: FeatureSlide[] = items.map((a) => ({
    id: a.id,
    href: L.article(a.id),
    area: a.shop.area || a.shop.prefName,
    title: a.shop.name,
    desc: a.title,
    photo: a.photo,
  }));
  return (
    <section className="sy-t-feat" aria-labelledby="sy-t-feat-h">
      <div className="sy-t-feat-in">
        <div className="sy-t-feat-l">
          <p className="sy-lab sy-t-feat-lab io">Special Feature</p>
          <h2 id="sy-t-feat-h" className="sy-t-feat-h io" style={{ ["--d" as string]: "80ms" }}>
            旅の余白を、
            <br />
            見つける。
          </h2>
          <p className="sy-t-feat-p io" style={{ ["--d" as string]: "160ms" }}>
            その土地の空気にふれ、
            <br />
            人と出会い、いつもと違う時間が流れる。
            <br />
            実在の宿を一軒ずつ、
            <br />
            確認できた情報で紹介します。
          </p>
          <Link href={L.articles} className="sy-more sy-t-feat-link io" style={{ ["--d" as string]: "240ms" }}>
            特集記事をみる
            <IconArrow />
          </Link>
        </div>
        <FeatureSlider slides={slides} />
      </div>
    </section>
  );
}

function Stays({ shops }: { shops: LiveShop[] }) {
  return (
    <>
      <section className="sy-t-stays" aria-labelledby="sy-t-stays-h">
        <div className="sy-t-stays-in">
          <div className="sy-t-stays-h">
            <h2 id="sy-t-stays-h" className="sy-lab sy-t-stays-lab io">
              Listed
              <br />
              Stays
            </h2>
            <p className="sy-t-stays-jp io" style={{ ["--d" as string]: "80ms" }}>
              掲載している宿
            </p>
          </div>
          <ul data-io-group>
            {shops.map((s) => (
              <li key={s.id} className="io">
                <Link href={L.shop(s.id)} className="sy-t-sc sy-hov">
                  <span className="sy-t-sc-ph sy-zoom">
                    <img src={s.photo!.src} width={s.photo!.w} height={s.photo!.h} alt="" loading="lazy" decoding="async" />
                  </span>
                  <span className="sy-t-sc-b">
                    <span className="sy-t-sc-n">{s.name}</span>
                    {s.area ? <span className="sy-t-sc-a">{s.area}</span> : null}
                  </span>
                  <IconArrow className="sy-t-sc-ar" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="sy-t-stays">
        <p className="sy-t-stays-more">
          <Link href={L.search} className="sy-more sy-more--plain">
            宿をすべて見る
            <IconArrow />
          </Link>
        </p>
      </div>
    </>
  );
}

type AreaTile = { key: string; name: string; img: number; count: number; href: string };

/** 地方の札。見本どおり中国と四国は 1 つ(中国・四国)にまとめる。都道府県が 1 つだけの地方は pref、複数のときは region(地方のスラッグ。カンマ区切り)で探すページへ */
function areaTiles(shops: LiveShop[]): AreaTile[] {
  const regs = regionsWithShops(shops);
  const out: AreaTile[] = [];
  for (const r of regs) {
    if (r.slug === "shikoku" && out.some((t) => t.key === "chugoku")) continue;
    let slugs = [r.slug];
    let prefs = r.prefs;
    let name = r.name;
    let count = r.count;
    if (r.slug === "chugoku") {
      const sk = regs.find((x) => x.slug === "shikoku");
      if (sk) {
        slugs = ["chugoku", "shikoku"];
        prefs = [...r.prefs, ...sk.prefs];
        name = "中国・四国";
        count += sk.count;
      }
    }
    const href = prefs.length === 1 ? L.searchWith({ pref: prefs[0].slug }) : `${L.search}?region=${slugs.join(",")}`;
    out.push({ key: r.slug, name, img: AREA_IMG[r.slug] ?? 1, count, href });
  }
  return out;
}

function Area({ tiles }: { tiles: AreaTile[] }) {
  return (
    <section className="sy-t-area" id="sy-area" aria-labelledby="sy-t-area-h">
      <div className="sy-t-area-bg">
        <img src={`${T}/area-bg.webp`} width={1800} height={760} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="sy-t-area-txt">
        <h2 id="sy-t-area-h" className="sy-t-area-h io">
          エリアから、
          <br />
          新しい旅を見つける。
        </h2>
        <p className="sy-t-area-p io" style={{ ["--d" as string]: "100ms" }}>
          週末の小さな旅から、記念日まで。
          <br />
          行きたいエリアから、宿を探せます。
        </p>
        <Link href={L.search} className="sy-t-area-btn io" style={{ ["--d" as string]: "200ms" }}>
          エリアから探す
          <IconArrow />
        </Link>
      </div>
      <p className="sy-t-area-script" aria-hidden="true">
        Find your
        <br />
        next journey.
      </p>
      {tiles.length > 0 ? (
        <ul className="sy-t-tiles" data-io-group>
          {tiles.map((t) => (
            <li key={t.key} className="io">
              <Link href={t.href} className="sy-t-tile sy-hov" aria-label={`${t.name}(${t.count}軒)を見る`}>
                <span className="sy-t-tile-ph sy-zoom">
                  <img src={`${T}/area-${t.img}.webp`} width={357} height={135} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="sy-t-tile-b">
                  {t.name}
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

function Articles({ items }: { items: LiveArticle[] }) {
  return (
    <section className="sy-t-arts" aria-labelledby="sy-t-arts-h">
      <div className="sy-t-arts-in">
        <div className="sy-t-arts-head">
          <h2 id="sy-t-arts-h" className="sy-t-arts-h io">
            宿の
            <br />
            記事
          </h2>
          <Link href={L.articles} className="sy-more sy-more--plain sy-t-arts-more io" style={{ ["--d" as string]: "100ms" }}>
            記事をもっと見る
            <IconArrow />
          </Link>
        </div>
        <ul data-io-group>
          {items.map((a) => (
            <li key={a.id} className="io">
              <Link href={L.article(a.id)} className="sy-t-ac sy-hov">
                <span className="sy-t-ac-ph sy-zoom">
                  <img src={a.photo.src} width={a.photo.w} height={a.photo.h} alt="" loading="lazy" decoding="async" />
                </span>
                <span>
                  <span className="sy-t-ac-n">{a.shop.name}</span>
                  <span className="sy-t-ac-s">{[a.shop.area, a.shop.kindName].filter(Boolean).join("・")}</span>
                  {a.date ? <time className="sy-t-ac-d" dateTime={a.date}>{dotDate(a.date)} 確認</time> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** 掲載 0 件のあいだ、札の代わりに出す短い案内(VerticalHub の「掲載準備中」と同じ言い方) */
function Preparing() {
  return (
    <section className="sy-t-prep" id="sy-type" aria-labelledby="sy-t-prep-h">
      <h2 id="sy-t-prep-h">掲載準備中です</h2>
      <p>宿の掲載は、まだありません(現在 0 件)。掲載できる宿が確認でき次第、ここに並びます。</p>
    </section>
  );
}

/** 重複を避けて n 件取る(足りなければ除外に入れた物からも足す) */
function take<T extends { id: string }>(primary: T[], exclude: Array<{ id: string }>, n: number): T[] {
  const ex = new Set(exclude.map((s) => s.id));
  return [...primary.filter((s) => !ex.has(s.id)), ...primary.filter((s) => ex.has(s.id))].slice(0, n);
}

/** shops を渡すと、その宿で組む(確認用。本番のページは渡さない = getPlaces("stay")) */
export default async function StayTop({ shops: given }: { shops?: LiveShop[] } = {}) {
  const shops = given ?? (await loadStayShops());
  const kinds = kindsWithShops(shops);
  const arts = await loadStayArticles(shops);
  const feats = arts.slice(0, 3);
  const stays = take(interleave(shops.filter((s) => s.photo)), feats.map((a) => a.shop), 4);
  const strip = take(arts, feats, 3);
  const tiles = areaTiles(shops);
  // 検索の箱のエリア(宿のある都道府県を地方ごとに)
  const areas = regionsWithShops(shops).map((r) => ({ label: r.name, prefs: [...r.prefs].sort((a, b) => REGIONS.find((x) => x.slug === r.slug)!.prefs.indexOf(a.slug) - REGIONS.find((x) => x.slug === r.slug)!.prefs.indexOf(b.slug)).map((p) => ({ slug: p.slug, name: p.name })) }));

  return (
    <Shell page="top" mode="live">
      <div className="sy-t">
        <Hero areas={areas} kinds={kinds.map((k) => ({ slug: k.slug, name: k.name }))} />
        {kinds.length > 0 ? <Kinds kinds={kinds} /> : <Preparing />}
        {feats.length > 0 ? <Feature items={feats} /> : null}
        {stays.length > 0 ? <Stays shops={stays} /> : null}
        {tiles.length > 0 ? <Area tiles={tiles} /> : null}
        {strip.length > 0 ? <Articles items={strip} /> : null}
      </div>
    </Shell>
  );
}
