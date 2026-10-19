/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Slider from "./Slider";
import { IMG } from "./const";
import "./lower.css";

const B = `${IMG}/lower/`;
/** 見本の座標(1182 基準)。y は見本の絶対座標、節の上端(--oy)を引いて置く。 */
const P = (x: number, y: number, w?: number, h?: number) =>
  ({ "--x": x, "--y": y, ...(w !== undefined ? { "--w": w } : {}), ...(h !== undefined ? { "--h": h } : {}) }) as React.CSSProperties;
const OY = (y: number) => ({ "--oy": y }) as React.CSSProperties;

const CATS = [
  { k: "gourmet", name: "グルメ", sub: ["おいしいお店を", "見つける"], href: "/gourmet", px: 63, pw: 134, cx: 130, col: "#f27b2f", ay: 645, op: "50% 88%" },
  { k: "beauty", name: "ビューティー", sub: ["キレイを楽しむ"], href: "/beauty", px: 220, pw: 138, cx: 289, col: "#ee5d8e", ay: 639, op: "50% 24%" },
  { k: "bodycare", name: "ボディケア", sub: ["からだを整える"], href: "/bodycare", px: 384, pw: 173, cx: 473, col: "#4aa84a", ay: 639, op: "50% 22%" },
  { k: "pet", name: "ペット", sub: ["ペットと一緒に"], href: "/pet", px: 583, pw: 162, cx: 662, col: "#8b6cf0", ay: 639, op: "50% 9%" },
  { k: "leisure", name: "おでかけ", sub: ["遊ぶ・体験する"], href: "/leisure", px: 769, pw: 158, cx: 845, col: "#2f8de0", ay: 639, op: "50% 42%" },
  { k: "stay", name: "ステイ", sub: ["泊まる・くつろぐ"], href: "/stay", px: 952, pw: 162, cx: 1034, col: "#f6b620", ay: 639, op: "50% 46%" },
];
const VINES = [["v0", 24, 425, 52, 265], ["v1", 190, 566, 46, 124], ["v2", 350, 548, 52, 142], ["v3", 538, 554, 54, 136], ["v4", 726, 548, 52, 142], ["v5", 912, 562, 54, 128], ["v6", 1104, 415, 52, 275]] as const;
const TTL = [..."今日はどんな"].map((c) => ({ c, k: 0 })).concat([..."楽しみ"].map((c) => ({ c, k: 1 })), [..."を見つける？"].map((c) => ({ c, k: 0 })));
const NEWS = [
  { img: "news1.webp", date: "2025.04.12", t: ["春のまちでおすすめスポットを開催！"], y: 722 },
  { img: "news2.webp", date: "2025.04.08", t: ["駅前に新しいカフェがオープンしました"], y: 764 },
  { img: "news3.webp", date: "2025.04.01", t: ["ゴールデンウィークの", "おすすめ特集を公開！"], y: 806 },
  { img: "news4.webp", date: "2025.03.28", t: ["ペットと楽しめる公園特集を追加しました"], y: 850 },
];
const CARDS = [
  { k: "story", x: 41, w: 252, t: "まちのストーリー", d: ["宮崎・高岡町で34年続くうどん屋を", "お孫さんが受け継ぐ話をご紹介"], href: "/feature/花見うどん・ラーメン", b: { x: 168, y: 5, w: 84, h: 50, l: ["34年続く店を", "孫が受け継ぐ"], f: 10.2 } },
  { k: "family", x: 310, w: 267, t: "家族でおでかけ", d: ["上野動物園や葛西臨海公園など、", "東京の子連れスポットを5つご紹介"], href: "/feature/new-tokyo-family", b: { x: 189, y: 4, w: 74, h: 46, l: ["年齢で選べる", "定番の施設。"], f: 10.2 } },
  { k: "pet", x: 591, w: 267, t: "ペットと楽しめるお店", d: ["愛犬と食事できるドッグレストランの", "区画がある、旭川のカフェをご紹介"], href: "/restaurant/r304", b: { x: 188, y: 3, w: 76, h: 46, l: ["愛犬と一緒に", "食事できる。"], f: 10.2 } },
];

export default function Lower() {
  return (
    <>
      {/* 1. 業種の札 6 枚(間に花のつる) */}
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
              <span className="h2-a h2-catn" style={P(c.cx - 85, 586, 170, 26)}>{c.name}</span>
              <span className="h2-a h2-cats-sub" style={P(c.cx - 85, 613.5, 170, 34)}>{c.sub.map((t, j) => <span key={j}>{t}</span>)}</span>
              <i className="h2-a h2-catarr" style={{ ...P(c.cx - 14, c.ay, 28, 28), background: c.col }}>→</i>
            </Link>
          ))}
        </div>
        {VINES.map(([k, x, y, w, h], i) => (
          <span key={k} className="h2-a h2-vinew" data-io style={{ ...P(x, y, w, h), ["--i" as string]: i }}><img className="h2-vine" src={`${B}${k}.webp`} alt="" /></span>
        ))}
      </section>

      {/* 2. 春の特集+まちの最新情報 */}
      <section className="h2-feat" style={OY(692)} aria-label="春の特集とまちの最新情報">
        <div className="h2-a h2-slidewrap" data-io-early style={P(38, 692, 644, 201)}><Slider /></div>
        <div className="h2-a h2-news" data-io-early style={P(697, 692, 451, 201)}>
          <img className="h2-a h2-nicon" style={P(0, 692, 38, 36)} src={`${B}news-icon.webp`} alt="" />
          <b className="h2-a h2-nt" style={P(44, 695, 200, 24)}>まちの最新情報</b>
          <Link href="/feature" className="h2-a h2-more h2-press" style={P(333, 697, 100, 20)}>もっと見る <span aria-hidden>→</span></Link>
          <ul>
            {NEWS.map((n, i) => (
              <li key={i} className="h2-a h2-nrow" style={{ ...P(7, n.y, 436, 40), ["--i" as string]: i }}>
                <Link href="/feature" className="h2-nlink">
                  <span className="h2-nth"><img src={`${B}${n.img}`} alt="" /></span>
                  <span className="h2-nd">{n.date}</span>
                  <span className="h2-nti">{n.t.map((t, j) => <span key={j}>{t}</span>)}</span>
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
            <Link key={c.k} href={c.href} className="h2-a h2-card h2-press" style={{ ...P(c.x, 902, c.w, 141), ["--i" as string]: i }}>
              <span className="h2-cph"><img src={`${B}card-${c.k}.webp`} alt="" /></span>
              <span className="h2-cbub h2-kure" style={{ left: `calc(${c.b.x} * var(--u))`, top: `calc(${c.b.y} * var(--u))`, width: `calc(${c.b.w} * var(--u))`, height: `calc(${c.b.h} * var(--u))`, fontSize: `calc(${c.b.f} * var(--u))`, animationDelay: `${0.5 + i * 0.15}s, ${i * 0.7}s` }}><span>{c.b.l[0]}</span><span>{c.b.l[1]}</span></span>
              <b className="h2-ctt">{c.t}</b>
              <span className="h2-cdd">{c.d[0]}<br />{c.d[1]}</span>
              <i className="h2-carr" aria-hidden="true">→</i>
            </Link>
          ))}
          <Link href="/videos" className="h2-a h2-card h2-vcard h2-press" aria-label="動画で見つかる まちの新しい魅力 — 動画で見る" style={{ ...P(876, 902, 266, 139), ["--i" as string]: 3 }}>
            {/* オーナー作の画像(見出し・説明・「動画で見る」のボタンは画像に描かれている)。再生ボタンの位置に光の輪だけ重ねる */}
            <span className="h2-cph h2-vph"><img src={`${B}card-video.webp`} alt="" /></span>
            <i className="h2-vring" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 4. 街の絵の帯 */}
      <section className="h2-band" style={OY(1040)} data-live aria-label="街の絵">
        <div className="h2-bandclip">
          <img className="h2-far" src={`${B}art.webp`} alt="" />
          <img className="h2-a h2-fx h2-fx-sun" style={P(326, 1064, 32, 32)} src={`${B}fx-sun.webp`} alt="" />
          <img className="h2-a h2-fx h2-fx-balloon" style={P(852, 1054, 36, 50)} src={`${B}fx-balloon.webp`} alt="" />
          <img className="h2-a h2-fx h2-fx-bird b1" style={P(232, 1070, 24, 22)} src="/_portal/hproto/machi2/hero/bird3.webp" alt="" width={51} height={46} />
          <img className="h2-a h2-fx h2-fx-bird b2" style={P(740, 1072, 24, 22)} src="/_portal/hproto/machi2/hero/bird2.webp" alt="" width={56} height={53} />
          <img className="h2-near" src={`${B}art-near.webp`} alt="" />
        </div>
        <p className="h2-a h2-tag h2-hand" data-io style={P(390, 1062, 400, 74)}>
          <span className="h2-tl"><span>このまちで、もっとつながる。</span></span>
          <span className="h2-tl h2-tl2"><span>もっと<b>好き</b>になる。</span></span>
        </p>
        <div className="h2-a h2-sign" style={P(962, 1086, 174, 122)}>
          <p className="h2-hand"><span>日常が、</span><span>ちょっと特別になる</span><span>まちのポータルサイト</span><b>マチノワ</b></p>
        </div>
      </section>

      {/* 5. フッター */}
      <footer className="h2-foot" style={OY(1228)}>
        <img className="h2-a h2-flogo" style={P(40, 1244, 164, 42)} src={`${IMG}/common/logo-foot.webp`} alt="マチノワ Machinowa" />
        <p className="h2-a h2-fsub" style={P(219, 1250, 220, 40)}>まちの人・お店・くらしがつながる<br />ローカルポータルサイト</p>
        <i className="h2-a h2-fvr" style={P(440, 1245, 1, 55)} />
        <ul className="h2-a h2-fl" style={P(502, 1240, 220, 70)}><li><Link href="/about">マチノワについて</Link></li><li><Link href="/contact">掲載をご検討の方へ</Link></li><li><Link href="/feature">お知らせ</Link></li><li><Link href="/contact">よくあるご質問</Link></li></ul>
        <i className="h2-a h2-fvr" style={P(743, 1245, 1, 55)} />
        <ul className="h2-a h2-fl" style={P(789, 1240, 220, 70)}><li><Link href="/terms">利用規約</Link></li><li><Link href="/privacy">プライバシーポリシー</Link></li><li><Link href="/contact">お問い合わせ</Link></li></ul>
        <p className="h2-a h2-copy" style={P(291, 1305, 600, 16)}>© 2025 マチノワ Machinowa. All rights reserved.</p>
      </footer>
    </>
  );
}
