/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Slider from "./Slider";
import { CARD_FEATURE, IMG } from "./const";
import type { CardPhotos } from "./cards";
import type { NewsRow } from "./news";
import { PROD_FOOT_COPY } from "./prodData";
import { ContactLink } from "@/components/portal/ContactLine";
import { CATS } from "./catsData";
import "./lower.css";

const B = `${IMG}/lower/`;
/** 見本の座標(1182 基準)。y は見本の絶対座標、節の上端(--oy)を引いて置く。 */
const P = (x: number, y: number, w?: number, h?: number) =>
  ({ "--x": x, "--y": y, ...(w !== undefined ? { "--w": w } : {}), ...(h !== undefined ? { "--h": h } : {}) }) as React.CSSProperties;
const OY = (y: number) => ({ "--oy": y }) as React.CSSProperties;
/** カードの写真の枠を 82 → 196 に広げた分 114 + 下の波の線(motion-plus.css の .h2-cards::after)が説明の文字にかからないための余白 12 = 126(見本の画素)。カードの高さと、その下の節(街の絵・フッター)のずれはこの値だけ。lower.css の .h2-cards の高さ(140 + D)と必ず合わせる */
const D = 126;
const CH = 141 + D;
/** カードより下の節用: 見本の y に D を足して置く */
const PD = (x: number, y: number, w?: number, h?: number) => P(x, y + D, w, h);

/** 札の間のつる(airy では見えない)。左端 v0・右端 v6 と、札と札の間(札の数 − 1 か所)に v1〜v5 の絵を順に使いまわす。位置は札(catsData の CATS)の左右の端から決める */
const VINE_MID = [["v1", 46, 566, 124], ["v2", 52, 548, 142], ["v3", 54, 554, 136], ["v4", 52, 548, 142], ["v5", 54, 562, 128]] as const;
const VINES: readonly (readonly [string, number, number, number, number])[] = [
  ["v0", CATS[0].px - 10 - 29, 425, 52, 265],
  ...CATS.slice(0, -1).map((c, i) => {
    const [k, w, y, h] = VINE_MID[i % VINE_MID.length];
    return [k, c.px + c.pw + 10 + 3 + 4 - w / 2, y, w, h] as const; // 札の右の端 + 間の半分(3) + 見本の寄り(4) が、つるの中心
  }),
  ["v6", CATS[CATS.length - 1].px + CATS[CATS.length - 1].pw + 10 - 20, 415, 52, 275],
];
const TTL = [..."今日はどんな"].map((c) => ({ c, k: 0 })).concat([..."楽しみ"].map((c) => ({ c, k: 1 })), [..."を見つける？"].map((c) => ({ c, k: 0 })));
const CARDS = [
  { k: "story", x: 41, w: 252, t: "まちのストーリー", d: ["宮崎・高岡町で34年続くうどん屋を", "お孫さんが受け継ぐ話をご紹介"], href: `/feature/${CARD_FEATURE.story}`, op: "50% 50%", b: { x: 168, y: 5, w: 84, h: 50, l: ["34年続く店を", "孫が受け継ぐ"], f: 10.2 } },
  { k: "family", x: 310, w: 267, t: "家族でおでかけ", d: ["上野動物園や葛西臨海公園など、", "東京の子連れスポットを5つご紹介"], href: `/feature/${CARD_FEATURE.family}`, op: "50% 50%", b: { x: 189, y: 4, w: 74, h: 46, l: ["年齢で選べる", "定番の施設。"], f: 10.2 } },
  { k: "pet", x: 591, w: 267, t: "ペットと楽しめるお店", d: ["愛犬と食事できるドッグレストランの", "区画がある、旭川のカフェをご紹介"], href: "/restaurant/r304", b: { x: 188, y: 3, w: 76, h: 46, l: ["愛犬と一緒に", "食事できる。"], f: 10.2 } },
];

/** 記事の実際の写真を出すカード(story・family)の写真。渡されていない・他のカードは undefined(= 今までの画像) */
const ph = (k: string, cards?: CardPhotos) => (k === "story" || k === "family" ? cards?.[k] : undefined);

const NEWS_Y = [722, 764, 806, 850];

/** news = 「まちの最新情報」(特集記事の実データ。news.ts の latestNews)。フッターは著作表記だけ(prodData.ts の PROD_FOOT_COPY)。 */
export default function Lower({ news, cards }: { news: NewsRow[]; cards?: CardPhotos }) {
  const rows = news.slice(0, 4).map((n, i) => ({ src: n.img, date: n.date, t: [n.title], y: NEWS_Y[i], href: n.href }));
  return (
    <>
      {/* 1. 業種の札 8 枚(間に花のつる) */}
      <section className="h2-cats" style={OY(394)} aria-label="業種から探す">
        <h2 className="h2-a h2-ttl" data-io style={P(330, 399, 522, 44)} aria-label="今日はどんな楽しみを見つける？">
          <svg className="h2-tick h2-tick-l" viewBox="0 0 30 24" aria-hidden="true"><path d="M3 20 12 4M14 21l8-15" stroke="#f08a3c" strokeWidth="2.4" strokeLinecap="round" /></svg>
          <span className="h2-ttl-t" aria-hidden="true">{TTL.map((x, i) => <i key={i} className={x.k ? "h2-tk" : undefined} style={{ ["--c" as string]: i }}>{x.c}</i>)}</span>
          <svg className="h2-tick h2-tick-r" viewBox="0 0 30 24" aria-hidden="true"><path d="M27 20 18 4M16 21l-8-15" stroke="#f08a3c" strokeWidth="2.4" strokeLinecap="round" /></svg>
        </h2>
        <img className="h2-a h2-decor h2-sway" style={P(168, 396, 140, 44)} src={`${B}decor-l.webp`} alt="" />
        <img className="h2-a h2-decor h2-sway h2-sway2" style={P(836, 396, 280, 44)} src={`${B}decor-r.webp`} alt="" />
        <div className="h2-cardrow" data-io>
          {CATS.map((c, i) => (
            <Link key={c.k} href={c.href} className="h2-cat h2-press" style={{ ["--i" as string]: i, ["--x0" as string]: c.px - 10, ["--w0" as string]: c.pw + 20 }}>
              <span className="h2-a h2-catbg" style={{ width: "100%", height: "100%" }} />
              <span className="h2-a h2-catph" style={P(c.px, 437, c.pw, 121)}><img src={`${B}cat-${c.k}.webp`} alt="" style={{ objectPosition: c.op }} /></span>
              <img className="h2-a h2-caticon" style={P(c.cx - 27, 532, 54, 54)} src={`${B}ic-${c.k}.webp`} alt="" />
              <span className={c.long ? "h2-a h2-catn is-long" : "h2-a h2-catn"} style={P(c.px - 10, 586, c.pw + 20, 26)}>{c.name}</span>
              <span className="h2-a h2-cats-sub" style={P(c.px - 10, 613.5, c.pw + 20, 34)}>{c.sub.map((t, j) => <span key={j}>{t}</span>)}</span>
              <i className="h2-a h2-catarr" style={{ ...P(c.cx - 14, c.ay, 28, 28), background: c.col }}>→</i>
            </Link>
          ))}
        </div>
        {VINES.map(([k, x, y, w, h], i) => (
          <span key={`${k}-${i}`} className="h2-a h2-vinew" data-io style={{ ...P(x, y, w, h), ["--i" as string]: i }}><img className="h2-vine" src={`${B}${k}.webp`} alt="" /></span>
        ))}
      </section>

      {/* 2. 春の特集+まちの最新情報 */}
      <section className="h2-feat" style={OY(692)} aria-label="春の特集とまちの最新情報">
        <div className="h2-a h2-slidewrap" data-io-early style={P(38, 692, 644, 201)}><Slider /></div>
        <div className="h2-a h2-news" data-io-early style={P(697, 692, 451, 201)}>
          <img className="h2-a h2-nicon" style={P(0, 692, 38, 36)} src={`${B}news-icon.webp`} alt="" />
          <b className="h2-a h2-nt" style={P(44, 695, 200, 24)}>まちの最新情報</b>
          <ul>
            {rows.map((n, i) => (
              <li key={i} className="h2-a h2-nrow" style={{ ...P(7, n.y, 436, 40), ["--i" as string]: i }}>
                <Link href={n.href} className="h2-nlink">
                  <span className="h2-nth"><img src={n.src} alt="" loading="lazy" decoding="async" /></span>
                  {n.date && <span className="h2-nd">{n.date}</span>}
                  <span className="h2-nti h2-nti-real">{n.t.map((t, j) => <span key={j}>{t}</span>)}</span>
                  <i className="h2-nchev" aria-hidden="true">›</i>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. 下の 4 枚のカード */}
      <section className="h2-cards" style={OY(900)} aria-label="読みもの">
        <div className="h2-cardlist h2-strip" data-io>
          {CARDS.map((c, i) => (
            <Link key={c.k} href={c.href} className="h2-a h2-card h2-press" style={{ ...P(c.x, 902, c.w, CH), ["--i" as string]: i }}>
              <span className="h2-cph">{ph(c.k, cards) ? <img src={ph(c.k, cards)} alt="" decoding="async" style={{ objectPosition: c.op }} /> : <img src={`${B}card-${c.k}.webp`} alt="" />}</span>
              <span className="h2-cbub h2-kure" style={{ left: `calc(${c.b.x} * var(--u))`, top: `calc(${c.b.y} * var(--u))`, width: `calc(${c.b.w} * var(--u))`, height: `calc(${c.b.h} * var(--u))`, fontSize: `calc(${c.b.f} * var(--u))`, animationDelay: `${0.5 + i * 0.15}s, ${i * 0.7}s` }}><span>{c.b.l[0]}</span><span>{c.b.l[1]}</span></span>
              <b className="h2-ctt">{c.t}</b>
              <span className="h2-cdd">{c.d[0]}<br />{c.d[1]}</span>
              <i className="h2-carr" aria-hidden="true">→</i>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. 街の絵の帯 */}
      <section className="h2-band" style={OY(1040 + D)} data-live aria-label="街の絵">
        <div className="h2-bandclip">
          <img className="h2-far" src={`${B}art.webp`} alt="" />
          <img className="h2-a h2-fx h2-fx-sun" style={PD(326, 1064, 32, 32)} src={`${B}fx-sun.webp`} alt="" />
          <img className="h2-a h2-fx h2-fx-balloon" style={PD(852, 1054, 36, 50)} src={`${B}fx-balloon.webp`} alt="" />
          <img className="h2-a h2-fx h2-fx-bird b1" style={PD(232, 1070, 24, 22)} src="/_portal/hproto/machi2/hero/bird3.webp" alt="" width={51} height={46} />
          <img className="h2-a h2-fx h2-fx-bird b2" style={PD(740, 1072, 24, 22)} src="/_portal/hproto/machi2/hero/bird2.webp" alt="" width={56} height={53} />
          <img className="h2-near" src={`${B}art-near.webp`} alt="" />
        </div>
        <p className="h2-a h2-tag h2-hand" data-io style={PD(390, 1062, 400, 74)}>
          <span className="h2-tl"><span>このまちで、もっとつながる。</span></span>
          <span className="h2-tl h2-tl2"><span>もっと<b>好き</b>になる。</span></span>
        </p>
        <div className="h2-a h2-sign" style={PD(962, 1086, 174, 122)}>
          <p className="h2-hand"><span>日常が、</span><span>ちょっと特別になる</span><span>まちのポータルサイト</span><b>マチノワ</b></p>
        </div>
      </section>

      {/* 5. フッター */}
      <footer className="h2-foot" style={OY(1228 + D)}>
        <img className="h2-a h2-flogo" style={PD(40, 1244, 164, 42)} src={`${IMG}/common/logo-foot.webp`} alt="マチノワ Machinowa" />
        <p className="h2-a h2-fsub" style={PD(219, 1250, 220, 40)}>まちの人・お店・くらしがつながる<br />ローカルポータルサイト</p>
        <p className="h2-a h2-copy" style={PD(291, 1303, 600, 14)}>{PROD_FOOT_COPY}</p>
        <p className="h2-a h2-copy h2-contact" style={PD(291, 1316, 600, 13)}>
          <ContactLink />
        </p>
      </footer>
    </>
  );
}
