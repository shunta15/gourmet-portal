import Link from "next/link";
import Banner from "./Banner";
import { Flag, IcArrow, IcCheck, IcChevR, IcClock, Mountain, Pine, Pines, Stamp, Waves } from "./Deco";
import { aLinks, searchUrl } from "./links";
import { PICKS, pickShops, type AShop } from "./data";
import { SEASON_CHAR, dotDate, twoLines, type Editorial } from "./editorial";

const IMG = "/_portal/activity/";

/**
 * 特集ページ(見本 81)。節の数・札の枚数・並びは見本のまま。中身は実在のものに替えた:
 *  01 利用シーン(4 枚)= 実在の店で絞り込める体験スタイル(子連れ・初心者歓迎・手ぶらでOK・雨の日)。リンク先は絞り込みが効く探す
 *  02 ジャンル(4 枚)  = 種類 3(海・川 / 山・空 / ものづくり体験)+ 体験スタイル 1(駐車場あり)。同じく探すへ
 *  03 季節の特集(4 枚)・05 読みもの(3 枚)・04 はじめての方へ = 別の担当が作った lib/activity/editorial.json(editorial.ts)。ファイルが無いあいだは、その欄の札を出さない
 *  06 店ごとの特集記事(4 枚)= 実在の 4 店の記事(特集 features-activity.json がある店はその特集、無い店は紹介記事の見出し)。リンク先は店の記事 /activity/article/{店 ID}
 * 写真は見本の飾りの画像(店の写真ではない)。
 */
type Scene = { k: string; t: string; slug: string; tag: string; red: boolean; lines: (n: number) => [string, string] };
const SCENES: Scene[] = [
  { k: "couple", t: "初心者歓迎の体験", slug: "beginner", tag: "初心者歓迎", red: true, lines: (n) => ["はじめてでも参加できる体験を", `${n}件、掲載しています。`] },
  { k: "family", t: "子連れで楽しむ", slug: "with-children", tag: "子連れ", red: true, lines: (n) => ["子どもも参加できる体験を", `${n}件、掲載しています。`] },
  { k: "solo", t: "手ぶらでOKの体験", slug: "hands-free", tag: "手ぶらでOK", red: true, lines: (n) => ["手ぶらで参加できる体験を", `${n}件、掲載しています。`] },
  { k: "rain", t: "雨の日に楽しむ", slug: "rainy-day", tag: "雨の日", red: false, lines: (n) => ["雨の日も行えると案内された", `体験を${n}件、掲載しています。`] },
];
type Genre = { k: string; img: string; t: string; to: string; lines: (n: number) => [string, string]; count: (s: AShop) => boolean };
const GENRES: Genre[] = [
  { k: "water", img: "ar-genre-water.webp", t: "海・川の体験", to: searchUrl({ kind: ["sea-river"] }), count: (s) => s.kind === "sea-river", lines: () => ["ダイビング・川下り・釣りなど、", "水辺で楽しむ体験。"] },
  { k: "mountain", img: "ar-genre-mountain.webp", t: "山・空の体験", to: searchUrl({ kind: ["mountain-sky"] }), count: (s) => s.kind === "mountain-sky", lines: () => ["森のアスレチック・バギー・乗馬など、", "外で体を動かす体験。"] },
  { k: "craft", img: "ar-genre-craft.webp", t: "ものづくり体験", to: searchUrl({ kind: ["craft"] }), count: (s) => s.kind === "craft", lines: () => ["レザークラフト・レジンアートなど、", "手でつくる体験。"] },
  { k: "indoor", img: "top-area-tokai.webp", t: "駐車場のある体験", to: searchUrl({ scene: ["parking"] }), count: (s) => s.tags.includes("駐車場あり"), lines: (n) => ["駐車場があると案内された体験を", `${n}件、掲載しています。`] },
];
const GUIDE = ["服装・持ち物は?", "どんな準備が必要?", "申し込みの流れは?", "安全に楽しむためのポイント"];

/** 1 行に収まるよう、長い文は先頭から切る(最後は「…」) */
const clip = (t: string, n: number) => {
  const first = t.split("。")[0];
  return first.length <= n ? first : `${first.slice(0, n - 1)}…`;
};

function Head({ n, t, en, sub }: { n: string; t: string; en?: string; sub: string }) {
  return (
    <div className="f-head">
      <Flag n={n} className="f-head-flag" />
      <h2 className="f-head-t">{t}</h2>
      {en ? <p className="f-head-en">{en}</p> : null}
      <p className="f-head-sub">{sub}</p>
    </div>
  );
}

const Go = () => (
  <span className="f-go" aria-hidden="true">
    <IcChevR />
  </span>
);

export default function Article({ shops, editorial }: { shops: AShop[]; editorial: Editorial }) {
  const feats = pickShops(shops, PICKS.article).filter((s) => s.feat && s.photoList[0]);
  const seasons = editorial.seasons.slice(0, 4);
  const mags = editorial.magazine.slice(0, 3);
  return (
    <div className="apa-page apa-article">
      {/* ---- ヒーロー ---- */}
      <section className="f-hero" aria-label="アクティビティ特集">
        <i className="f-yel f-yel-1" />
        <i className="f-yel f-yel-2" />
        <i className="f-yel f-yel-3" />
        <i className="f-yel f-yel-4" />
        <i className="f-tape" />
        <figure className="f-woman">
          <img src={`${IMG}ar-hero-woman.webp`} alt="" />
          <figcaption className="apa-hand">
            <span>あたらしい</span>
            <span>景色に、</span>
            <span>会いにいこう。</span>
          </figcaption>
          <Stamp id="fw" className="f-woman-stamp" ring="MACHINOWA ACTIVITY" mountain wave />
          <Pine className="f-woman-pine f-woman-pine-1" />
          <Pine className="f-woman-pine f-woman-pine-2" />
        </figure>

        <div className="f-ticket">
          <div className="f-ticket-in">
            <p className="f-ticket-lab">MACHINOWA SPECIAL</p>
            <h1 className="f-ticket-h1">
              <span>アクティビティ</span>
              <em>特集</em>
            </h1>
            <p className="f-ticket-sub">
              <span>あそびで見つかる、</span>
              <span>もっと好きなわたし。</span>
            </p>
            <p className="f-ticket-p">
              週末のおでかけから、特別な旅まで。
              <br />
              マチノワが届ける、アクティビティの
              <br />
              役立つ情報を集めた特集ページです。
            </p>
            <Pines className="f-ticket-pines" />
            <Mountain className="f-ticket-mtn" />
            <Mountain className="f-ticket-mtn f-ticket-mtn-2" />
          </div>
        </div>
        <Stamp id="fs" className="f-special" ring="SPECIAL" lines={["SPECIAL"]} mountain={false} />
        <Waves className="f-hero-waves" />

        <figure className="f-p f-p1">
          <img src={`${IMG}ar-hero-lake.webp`} alt="" />
          <figcaption className="apa-hand">
            <span>だれと行く?</span>
            <span>どんなふうに楽しむ?</span>
          </figcaption>
        </figure>
        <figure className="f-p f-p2">
          <img src={`${IMG}ar-hero-spring.webp`} alt="" />
          <figcaption className="apa-hand">
            <span>季節ごとの</span>
            <span>楽しみ方も!</span>
          </figcaption>
        </figure>
        <span className="f-ticket-tab">TICKET</span>
        <figure className="f-p f-p3">
          <img src={`${IMG}ar-hero-kayak.webp`} alt="" />
          <figcaption className="apa-hand">
            <span>きっと、</span>
            <span>好きな体験が見つかる。</span>
          </figcaption>
        </figure>
        <figure className="f-p f-p4">
          <img src={`${IMG}ar-hero-pottery.webp`} alt="" />
          <figcaption className="apa-hand">
            <span>はじめてでも</span>
            <span>探せます!</span>
          </figcaption>
          <Pines className="f-p4-pines" />
        </figure>
      </section>

      {/* ---- 01 利用シーン ---- */}
      <section className="f-sec f-s01" aria-label="利用シーンから探す">
        <div className="f-card-bg" />
        <Head n="01" t="利用シーンから探す" sub="子連れ、はじめて、手ぶらで。シーンに合わせて、体験を探せます。" />
        <Mountain className="f-deco f-s01-mtn" />
        <Pine className="f-deco f-s01-pine" />
        <p className="f-hand-top f-s01-hand apa-hand">
          どんな時間を
          <br />
          過ごしたい?
        </p>
        <ul className="f-cards">
          {SCENES.map((s, i) => (
            <li key={s.k} className={`f-c f-c-${i + 1}`}>
              <Link href={searchUrl({ scene: [s.slug] })} className="f-c-a">
                <span className="f-c-ph">
                  <img src={`${IMG}ar-scene-${s.k}.webp`} alt="" loading="lazy" />
                </span>
                <span className={`f-c-tab${s.red ? " is-red" : ""}`}>{s.t}</span>
                <span className="f-c-d">
                  {s.lines(shops.filter((x) => x.tags.includes(s.tag)).length).map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </span>
                <Go />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- 02 ジャンル ---- */}
      <section className="f-sec f-s02" aria-label="ジャンルから探す">
        <div className="f-card-bg" />
        <Head n="02" t="ジャンルから探す" sub="やってみたいことから、アクティビティをもっと深く知ろう。" />
        <Mountain className="f-deco f-s02-mtn" />
        <Pine className="f-deco f-s02-pine" />
        <p className="f-hand-top f-s02-hand apa-hand">
          どのジャンルで
          <br />
          あそぶ?
        </p>
        <ul className="f-cards">
          {GENRES.map((s, i) => (
            <li key={s.k} className={`f-c f-g f-c-${i + 1}`}>
              <Link href={s.to} className="f-c-a">
                <span className="f-c-ph">
                  <img src={`${IMG}${s.img}`} alt="" loading="lazy" />
                  <span className="f-g-t">{s.t}</span>
                </span>
                <span className="f-c-d">
                  {s.lines(shops.filter(s.count).length).map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </span>
                <Go />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- 03 季節の特集 ---- */}
      <section className="f-sec f-s03" aria-label="季節の特集">
        <div className="f-card-bg" />
        <Head n="03" t="季節の特集" sub="季節ごとの営業と開催の期間から、体験を探そう。" />
        <ul className="f-cards f-seasons">
          {seasons.map((s, i) => (
            <li key={s.id} className={`f-c f-se f-c-${i + 1}`}>
              <Link href={aLinks.season(s.id)} className="f-c-a">
                <span className="f-c-ph">
                  <img src={s.imageFile} alt="" loading="lazy" />
                  <span className={`f-se-c f-se-${s.id}`}>{SEASON_CHAR[s.id]}</span>
                </span>
                <span className="f-se-t">
                  {twoLines(s.title, 15).map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </span>
                <span className="f-se-d">
                  <IcClock />
                  {dotDate(s.date)}
                </span>
                <Go />
              </Link>
            </li>
          ))}
        </ul>
        <div className="f-jp" aria-hidden="true">
          <Pines className="f-jp-pines" />
          <Pine className="f-jp-pine" />
          <Stamp id="ss" className="f-jp-stamp" ring="SEASONAL SPECIAL" mountain={false} />
          <img className="f-jp-map" src={`${IMG}ar-map.webp`} alt="" />
          <p className="f-jp-hand apa-hand">
            日本の四季を
            <br />
            あそびつくそう。
          </p>
        </div>
      </section>

      {/* ---- 04 はじめての方へ ・ 05 読みもの ---- */}
      <section className="f-s45" aria-label="はじめての方へ・読みもの">
        <div className="f-guide">
          <div className="f-card-bg" />
          <Head n="04" t="はじめての方へ" sub="初めての人向けに、アクティビティの基本と楽しみ方をガイド。" />
          <i className="f-guide-yel" />
          <img className="f-guide-img" src={`${IMG}ar-guide.webp`} alt="" loading="lazy" />
          <p className="f-guide-hand apa-hand">
            <span>はじめての</span>
            <span>アクティビティガイド</span>
          </p>
          <svg className="f-guide-spark" viewBox="0 0 20 20" fill="none" stroke="#f2cf2c" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M10 1v6M10 13v6M1 10h6M13 10h6M4 4l3 3M13 13l3 3M16 4l-3 3M7 13l-3 3" />
          </svg>
          <svg className="f-guide-mark" viewBox="0 0 40 44" aria-hidden="true">
            <path d="M20 2 38 22 20 42 2 22Z" fill="#2c9b6a" />
            <path d="M20 2 38 22 20 42Z" fill="#f2d93a" />
            <path d="M20 2 20 42" stroke="#fff" strokeWidth="2" />
          </svg>
          <ul className="f-guide-list">
            {GUIDE.map((g, i) => (
              <li key={g}>
                <Link href={aLinks.guideAt(i + 1)}>
                  <IcCheck />
                  {g}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={aLinks.guide} className="f-guide-btn">
            はじめてガイドを見る <IcArrow />
          </Link>
        </div>

        <div className="f-mag" id="magazine">
          <div className="f-card-bg" />
          <Head n="05" t="読みもの・マガジン" sub="コラム、エリア特集、店の紹介など、アクティビティをもっと楽しむ読みもの。" />
          <Link href={aLinks.magazine} className="f-more f-mag-more">
            もっと見る <IcArrow />
          </Link>
          <ul className="f-mag-list">
            {mags.map((m, i) => (
              <li key={m.id} className={`f-m f-m-${i + 1}`}>
                <Link href={aLinks.mag(m.id)} className="f-m-a">
                  <span className="f-m-ph">
                    <img src={m.imageFile} alt="" loading="lazy" />
                    <span className="f-m-tag">{m.tag}</span>
                  </span>
                  <span className="f-m-t">
                    {twoLines(m.title, 16).map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </span>
                  <span className="f-m-s">{clip(m.lead, 22)}</span>
                  <span className="f-m-d">
                    <IcClock />
                    {dotDate(m.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- 06 店ごとの特集記事(実在の 4 店の記事) ---- */}
      <section className="f-sec f-s06" aria-label="店ごとの特集記事">
        <div className="f-card-bg" />
        <Head n="06" t="店ごとの特集記事" sub="実在の店を一軒ずつ紹介した、店ごとの特集記事。" />
        <Link href={aLinks.search} className="f-more f-s06-more">
          もっと見る <IcArrow />
        </Link>
        <ul className="f-cards f-feats">
          {feats.map((s, i) => (
            <li key={s.id} className={`f-c f-ft f-c-${i + 1}`}>
              <Link href={aLinks.story(s.id)} className="f-c-a">
                <span className="f-c-ph">
                  <img src={s.photoList[0].src} alt={s.photoList[0].alt} loading="lazy" />
                </span>
                <span className="f-ft-t">{s.feat!.plain}</span>
                <span className="f-se-d">
                  <IcClock />
                  {`${s.feat!.dateLabel}${s.feat!.date.replace(/-/g, ".")}`}
                </span>
                <Go />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Banner v="article" href={aLinks.article} />
    </div>
  );
}
