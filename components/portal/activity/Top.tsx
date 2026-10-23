import Link from "next/link";
import Banner from "./Banner";
import HeroSearch from "./HeroSearch";
import MovieList, { type MovieItem } from "./MovieList";
import ShopCard from "./ShopCard";
import { Flag, IcArrow, IcBook, IcCamera, IcCheck, Mountain, Pine, Pines, Plane, Stamp, Waves } from "./Deco";
import { aLinks, searchUrl } from "./links";
import { PICKS, pickShops, prefShort, toCard, type AShop } from "./data";
import { REGION_GROUPS, regionArg, regionKeyOf } from "./filters";
import { durationLabel, twoLines, type Video } from "./editorial";

const IMG = "/_portal/activity/";

/**
 * 最初に並ぶ 4 枚の写真の札。見本の英字(HIKING・POTTERY・CYCLING・CAMP)は、実在の店の種類に合わせて替えた
 * (MOUNTAIN = 山・空 / CRAFT = ものづくり体験 / WATER = 海・川 / CAMP = キャンプができる店)。k は並びの位置の名前。写真は見本の飾りの画像(店の写真ではない)。
 */
const TILES = [
  { k: "hiking", img: "top-hiking.webp", n: "01", en: "MOUNTAIN", cap: ["歩くたび、", "好きがふえる。"] },
  { k: "pottery", img: "top-pottery.webp", n: "02", en: "CRAFT", cap: ["つくる時間が、", "旅になる。"] },
  { k: "cycling", img: "top-movie-1.webp", n: "03", en: "WATER", cap: ["風と、どこまでも。"] },
  { k: "camp", img: "top-camp.webp", n: "02", en: "CAMP", cap: ["家族の時間が、", "もっと特別に。"] },
];

/**
 * エリアの札 5 枚。位置は見本のまま。見本の「甲信越」は、いま店の無い地方なので、同じ位置のまま「九州・沖縄」に替えた
 * (写真は見本の飾りの画像から。位置の名前 slot は見本の CSS の名前のまま)。ほかの 4 枚は見本どおり(関東・東海・関西・中国・四国)。
 */
const AREAS = [
  { slot: "tokyo", group: "kanto", img: "top-area-tokyo.webp" },
  { slot: "koshinetsu", group: "kyushu", img: "ar-season-summer.webp" },
  { slot: "tokai", group: "tokai", img: "top-area-tokai.webp" },
  { slot: "kansai", group: "kansai", img: "top-area-kansai.webp" },
  { slot: "chushikoku", group: "chushikoku", img: "top-area-chushikoku.webp" },
] as const;

/**
 * テーマの丸 7 枚(見本どおりの枚数・位置)。中身は、実在の店で絞り込める種類・体験スタイル(リンク先は絞り込みが効く探す)。
 * 種類 3(海・川・山・空・ものづくり体験)+ 体験スタイル 4(初心者歓迎・手ぶらでOK・雨の日・子連れ)。丸の写真は見本の飾りの画像。
 */
const THEMES = [
  { k: "water", t: ["海・川の", "アクティビティ"], to: searchUrl({ kind: ["sea-river"] }) },
  { k: "hiking", t: ["山・空の体験"], to: searchUrl({ kind: ["mountain-sky"] }) },
  { k: "craft", t: ["ものづくり体験"], to: searchUrl({ kind: ["craft"] }) },
  { k: "cycling", t: ["初心者歓迎"], to: searchUrl({ scene: ["beginner"] }) },
  { k: "camp", t: ["手ぶらでOK"], to: searchUrl({ scene: ["hands-free"] }) },
  { k: "indoor", t: ["雨の日"], to: searchUrl({ scene: ["rainy-day"] }) },
  { k: "family", t: ["子連れ"], to: searchUrl({ scene: ["with-children"] }) },
];

/** はじめての方へ(4 つの質問。ガイドのページ /activity/article/guide の同じ質問へ) */
const GUIDE = ["服装・持ち物は?", "どんな準備が必要?", "申し込みの流れは?", "安全に楽しむポイント"];

function Head({ n, t, en, sub, more }: { n: string; t: string; en: string; sub?: string; more?: boolean }) {
  return (
    <div className="t-head">
      <Flag n={n} className="t-head-flag" />
      <h2 className="t-head-t">{t}</h2>
      <p className="t-head-en">{en}</p>
      {sub ? <p className="t-head-sub">{sub}</p> : null}
      {more ? (
        <Link href={aLinks.search} className="t-head-more">
          もっと見る <IcArrow />
        </Link>
      ) : null}
    </div>
  );
}

/** 最初のページ(見本 84)。実在の店は「掲載中の体験」の札・エリアの札・動画・写真の格子だけ(架空の店で埋めない) */
export default function Top({ shops, videos }: { shops: AShop[]; videos: Video[] }) {
  // エリアの札の文字は、データから(その地方の都道府県と、店の数)
  const areaOf = (group: string) => {
    const g = REGION_GROUPS.find((x) => x.key === group)!;
    const list = shops.filter((s) => regionKeyOf(s.region) === group);
    const prefs = [...new Set(list.map((s) => prefShort(s.pref, s.prefName)))];
    return { name: g.name, n: list.length, prefs };
  };
  const areaKeys = REGION_GROUPS.filter((g) => shops.some((s) => regionKeyOf(s.region) === g.key)).map((g) => g.key);
  const movies: MovieItem[] = videos.flatMap((v) => {
    const s = shops.find((x) => x.id === v.storeId);
    if (!s) return [];
    return [{ id: v.id, lines: twoLines(v.title, 12), dur: durationLabel(v.durationSec), poster: v.poster, src: v.src, title: v.title, shopName: s.name, shopHref: aLinks.shop(s.id) }];
  });
  const guideQs = GUIDE.map((g, i) => ({ t: g, n: i + 1 }));
  // 写真の格子(6 枚)は、掲載中の店の写真(店ごとに 2 枚目)
  const grid = pickShops(shops, PICKS.top).flatMap((s) => {
    const p = s.photoList[1] ?? s.photoList[0];
    return p ? [{ id: s.id, src: p.src, alt: p.alt }] : [];
  });
  return (
    <div className="apa-page apa-top">
      {/* ---- ヒーロー ---- */}
      <section className="t-hero" aria-label="マチノワ アクティビティ">
        <i className="t-yel t-yel-1" />
        <i className="t-yel t-yel-2" />
        <i className="t-yel t-yel-3" />
        <i className="t-yel t-yel-4" />
        <figure className="t-hero-photo apa-perf">
          <img src={`${IMG}top-hero-lake.webp`} alt="" />
          <figcaption className="apa-hand">
            漕ぎ出そう、
            <br />
            いつもの毎日から。
          </figcaption>
          <Stamp id="hero" className="t-hero-stamp" ring="MACHINOWA ACTIVITY" mountain wave />
        </figure>
        <Pine className="t-pine t-pine-a" />

        <div className="t-ticket">
          <div className="t-ticket-in">
            <p className="t-ticket-lab">MACHINOWA ACTIVITY</p>
            <h1 className="t-ticket-h1">
              <span>あたらしい</span>
              <span>体験に、</span>
              <em>でかけよう。</em>
            </h1>
            <p className="t-ticket-p">
              遊ぶ。感じる。つながる。
              <br />
              マチノワで見つかる、わたしのアクティビティ。
            </p>
            <Plane className="t-ticket-plane" />
            <Waves className="t-ticket-waves" />
            <Pines className="t-ticket-pines" />
            <Mountain className="t-ticket-mtn" />
            <span className="t-ticket-good">
              GOOD ACTIVITY
              <br />
              GOOD LIFE
            </span>
          </div>
          <Stamp id="tk" className="t-ticket-stamp" mountain wave={false} />
        </div>

        {TILES.map((t) => (
          <div key={t.k} className={`t-tile t-tile-${t.k}`}>
            <figure className="t-tile-ph">
              <img src={`${IMG}${t.img}`} alt="" />
              <figcaption className="apa-hand">
                {t.cap.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </figcaption>
            </figure>
            <span className="t-tile-tab">
              <b>{t.n}</b>
              <i>{t.en}</i>
            </span>
          </div>
        ))}
      </section>

      {/* ---- 検索 ---- */}
      <HeroSearch areas={areaKeys} />

      {/* ---- 01 掲載中の体験(実在の店 6 枚) ---- */}
      <section className="t-feat" aria-labelledby="t-feat-h">
        <Head n="01" t="掲載中の体験" en="LISTED ACTIVITIES" sub="今、行きたい!マチノワのアクティビティ" more />
        <div className="t-feat-deco" aria-hidden="true">
          <Pines className="t-feat-pines" />
          <Mountain className="t-feat-mtn" />
        </div>
        <div className="t-cards">
          {pickShops(shops, PICKS.top).map((s) => (
            <ShopCard key={s.id} s={toCard(s)} />
          ))}
        </div>
      </section>

      {/* ---- 02 エリアで見つける ---- */}
      <section className="t-area" aria-labelledby="t-area-h">
        <Head n="02" t="エリアで見つける" en="FIND BY AREA" sub="行きたいエリアから、特別な体験を見つけよう" />
        <div className="t-area-deco" aria-hidden="true">
          <Pine className="t-area-pine" />
          <Mountain className="t-area-mtn" />
        </div>
        <div className="t-area-cards">
          {AREAS.map((a) => {
            const info = areaOf(a.group);
            return (
              <Link key={a.slot} href={searchUrl({ region: regionArg(a.group) })} className={`t-area-card t-area-${a.slot}`}>
                <img src={`${IMG}${a.img}`} alt="" loading="lazy" />
                <span className="t-area-txt">
                  <b>{info.name}</b>
                  <small>{info.prefs.join("・")}の</small>
                  <small>体験 {info.n}件</small>
                </span>
                <span className="t-area-go">
                  <IcArrow />
                </span>
              </Link>
            );
          })}
        </div>
        <div className="t-area-map" aria-hidden="true">
          <img className="t-area-map-img" src={`${IMG}top-map.webp`} alt="" />
          <Stamp id="jp" className="t-area-map-stamp" ring="EXPLORE OF JAPAN" mountain={false} />
          <Pine className="t-area-mp1" />
          <Pine className="t-area-mp2" />
          <Pine className="t-area-mp3" />
        </div>
        <Link href={aLinks.search} className="t-area-all">
          エリア一覧を見る <IcArrow />
        </Link>
      </section>

      {/* ---- 03 テーマ / 04 はじめての方へ ---- */}
      <section className="t-theme" aria-labelledby="t-theme-h">
        <div className="t-theme-l">
          <Head n="02" t="アクティビティのテーマ" en="ACTIVITY THEMED" sub="気になるテーマから、やってみたい体験を見つけよう" more />
          <ul className="t-theme-list">
            {THEMES.map((t) => (
              <li key={t.k}>
                <Link href={t.to} className="t-theme-it">
                  <img src={`${IMG}top-theme-${t.k}.webp`} alt="" loading="lazy" />
                  <span>
                    {t.t.map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="t-guide">
          <Flag n="04" className="t-guide-flag" />
          <h2 className="t-guide-t">はじめての方へ</h2>
          <p className="t-guide-en">BEGINNER&apos;S GUIDE</p>
          <p className="t-guide-sub">初めてでも迷わない!体験の基本ガイド</p>
          <Link href={aLinks.guide} className="t-guide-btn">
            はじめてガイドを見る <IcArrow />
          </Link>
          <i className="t-guide-yel" />
          <img className="t-guide-img" src={`${IMG}top-guide.webp`} alt="" loading="lazy" />
          <p className="t-guide-hand apa-hand">
            はじめての
            <br />
            体験が、
            <br />
            きっと好きになる。
          </p>
          <span className="t-guide-sticker">
            <span className="apa-hand">
              はじめて
              <br />
              の方へ
            </span>
            <IcBook className="t-guide-sticker-ic" />
          </span>
          <ul className="t-guide-list">
            {guideQs.map((g) => (
              <li key={g.n}>
                <Link href={aLinks.guideAt(g.n)}>
                  <IcCheck />
                  {g.t}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- 05 動画(店の写真から作った動画。札を押すとその場で再生) ---- */}
      <section className="t-movie" aria-labelledby="t-movie-h">
        <Head n="05" t="動画でみる マチノワのアクティビティ" en="MOVIE CLIPS" sub="店の写真から作った動画で、体験をのぞいてみよう" />
        <div className="t-movie-box">{movies.length > 0 ? <MovieList items={movies} /> : null}</div>
        <aside className="t-ig" aria-label="体験の写真">
          <span className="t-ig-ic">
            <IcCamera />
          </span>
          <p className="t-ig-name">
            掲載している体験の写真
            <b>MACHINOWA ACTIVITY</b>
          </p>
          <Link href={aLinks.search} className="t-ig-follow">
            体験を探す
          </Link>
          <div className="t-ig-grid">
            {grid.map((g, i) => (
              <img key={g.id} className={`t-ig-${i + 1}`} src={g.src} alt={g.alt} loading="lazy" />
            ))}
          </div>
          <p className="t-ig-hand apa-hand">
            気になる
            <br />
            体験を探そう!
          </p>
        </aside>
      </section>

      <Banner v="top" href={aLinks.search} />
    </div>
  );
}
