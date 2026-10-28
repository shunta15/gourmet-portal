/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

// 総合トップの試作「p3」: 写真コラージュの見本(1024×1536 の PC 画面)をそのまま再現する。
// 文言は見本のまま(「マチノワについて」「リフレッシュ」「おすすめ」・架空の特集名などは、案が決まってから置き換える。試作だけで本番には出さない)。
// 寸法は全部「見本の画素 × var(--u)」。--u = min(画面幅, 1600px) ÷ 1024。写真は見本から切り出した仮の画像(public/_portal/hproto/p3/)。
const IMG = "/_portal/hproto/p3/";

type V = Record<string, string | number>;
const sty = (o: V): CSSProperties => o as CSSProperties;
const r = (n: number) => +n.toFixed(2);
/** 箱: 親の左上からの座標(x,y)と大きさ(w,h)。見本の画素。 */
const a = (x: number, y: number, w?: number, h?: number, more: V = {}) =>
  sty({ "--x": r(x), "--y": r(y), ...(w != null ? { "--w": r(w) } : {}), ...(h != null ? { "--h": r(h) } : {}), ...more });
/** 文字: x と 1 行目の中心 cy(見本の画素)・字の大きさ fs・行の高さ lh。 */
const t = (x: number, cy: number, fs: number, lh = fs * 1.5, more: V = {}) =>
  sty({ "--x": r(x), "--y": r(cy - lh / 2), "--fs": fs, "--lh": lh, ...more });

function Arrow({ style }: { style?: CSSProperties }) {
  return (
    <svg className="p3-arrow" style={style} viewBox="0 0 12 6" aria-hidden="true">
      <path d="M0 3h11M8.4.5 11.4 3 8.4 5.5" fill="none" stroke="currentColor" strokeWidth=".8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Chev() {
  return (
    <svg className="p3-chev" viewBox="0 0 8 12" aria-hidden="true">
      <path d="M2 1.5 6.2 6 2 10.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Ic({ children, vb = 32, sw = 1.9 }: { children: ReactNode; vb?: number; sw?: number }) {
  return (
    <svg viewBox={`0 0 ${vb} ${vb}`} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const CAT_ICONS: Record<string, ReactNode> = {
  gourmet: (
    <Ic>
      <path d="M8 4v9a3 3 0 0 0 3 3v12M5 4v7M11 4v7M14 4v9a3 3 0 0 1-3 3" />
      <path d="M23 28V4c-3.2 2.4-4.6 6.4-4.6 10.4 0 2.4 1 3.6 2.6 3.6h2" />
    </Ic>
  ),
  beauty: (
    <Ic>
      <path d="M11 5c-4 2-6 7-5 12 .8 4.2 4.4 9 9.5 10 5.5 1 10.5-3 10.5-9 0-4-3-5-3-9 0-3-3.5-5-6-4-1.8.7-3 1.6-6 0Z" />
      <path d="M12 9c-2 3-1.5 7 .5 9.5M15 12c-1 2.5 0 5 1.8 6.6" />
    </Ic>
  ),
  bodycare: (
    <Ic>
      <path d="M6 7c3-3 7-2 8.5.8L18 14l-4.5 3.5L7 12.5C5.5 11 5 9 6 7Z" />
      <path d="M26 25c-3 3-7 2-8.5-.8L14 18l4.5-3.5 6.5 5C26.5 21 27 23 26 25Z" />
      <path d="M20 5c3 0 6 3 6 6l-4 .5M12 27c-3 0-6-3-6-6l4-.5" />
    </Ic>
  ),
  pet: (
    <Ic>
      <ellipse cx="7.5" cy="14" rx="2.4" ry="3.2" />
      <ellipse cx="13" cy="8.6" rx="2.4" ry="3.4" />
      <ellipse cx="19.5" cy="8.6" rx="2.4" ry="3.4" />
      <ellipse cx="25" cy="14" rx="2.4" ry="3.2" />
      <path d="M16 15c-4 0-7.5 4.5-7.5 8 0 2.6 2.2 3.6 4.4 3.2 1.2-.3 2-.7 3.1-.7s1.9.4 3.1.7c2.2.4 4.4-.6 4.4-3.2 0-3.5-3.5-8-7.5-8Z" />
    </Ic>
  ),
  stay: (
    <Ic>
      <path d="M3 7v19M3 21h26v5M29 21v-5a4 4 0 0 0-4-4H13v9" />
      <circle cx="8.3" cy="15.5" r="2.7" />
    </Ic>
  ),
  activity: (
    <Ic>
      <path d="M2 27 12 8l5 9 3-4 10 14Z" />
      <path d="M12 8l-3.5 6.5 3 2.5 2-2 3 2.5M20 13l2.5 4-2.5 1.5" />
    </Ic>
  ),
  sports: (
    <Ic>
      <path d="M2 22.5c0-4 1.5-5 3.5-5.5l3-9 3 2.5c3 2.5 6 4 12 5 2 .5 4 2.5 4 5v3.5H2Z" />
      <path d="M2 22.5h26M12.5 12.5l-2 3.5M16 15l-2 3.5" />
    </Ic>
  ),
  life: (
    <Ic>
      <path d="M6 12h17v6a8.5 8.5 0 0 1-8.5 8.5A8.5 8.5 0 0 1 6 18Z" />
      <path d="M23 14h2.5a3 3 0 0 1 0 6H22.5M10 6c-1 1.5 1 2.5 0 4M15 6c-1 1.5 1 2.5 0 4M4 29h22" />
    </Ic>
  ),
};

const CATS: [string, string, string, string, string][] = [
  ["グルメ", "GOURMET", "gourmet", "/gourmet", "#c75641"],
  ["ビューティー", "BEAUTY", "beauty", "/beauty", "#b36372"],
  ["ボディケア", "BODY CARE", "bodycare", "/bodycare", "#c4634f"],
  ["ペット", "PET", "pet", "/pet", "#5c8955"],
  ["ステイ", "STAY", "stay", "/stay", "#3c6b98"],
  ["アクティビティ", "ACTIVITY", "activity", "/activity", "#ea9f39"],
  ["スポーツ", "SPORTS", "sports", "/sports", "#34abb3"],
  ["くらし", "LIFE", "life", "/life", "#826596"],
];
const FEATS: [string, string][] = [
  ["地元で見つけた\nこだわりのランチ", "/feature"],
  ["心と体が整う\nリラクゼーション特集", "/feature"],
  ["自然の中で楽しむ\nアクティブな体験", "/feature"],
];
const SCENES: string[] = ["友達と\nランチに行きたい", "家族で\nおでかけしたい", "一人で\nゆっくり過ごしたい", "愛犬と\n一緒に楽しみたい", "体を動かして\nリクレッシュしたい", "特別な日に\n利用したい"];
const CONTENTS: [string, string, string, number, number, number][] = [
  ["街歩きコース", "地元の魅力を巡る\nおすすめのモデルコースを紹介。", "walk", 41, 315, 1],
  ["インタビュー", "つくる人・営む人の\n想いを取材。", "talk", 365, 301, 2],
  ["マチノワについて", "このサイトに込めた想いと\n地域への取り組み。", "about", 675, 310, 3],
];

const CONT_ICONS: Record<string, ReactNode> = {
  walk: (
    <Ic vb={40} sw={2.6}>
      <path d="M6 33V17l6-3v19M12 33V9l8-4 8 4v24M28 33V15l6 3v15M3 33h34" />
      <path d="M16 15h4M16 20h4M16 25h4M24 15h.01M24 20h.01M24 25h.01" />
    </Ic>
  ),
  talk: (
    <Ic vb={40} sw={2.6}>
      <circle cx="20" cy="20" r="16" />
      <circle cx="20" cy="16" r="5" />
      <path d="M10 31c1.5-5 5-7.5 10-7.5S28.5 26 30 31" />
    </Ic>
  ),
  about: (
    <Ic vb={40} sw={2.6}>
      <circle cx="20" cy="20" r="16" />
      <path d="M15 11v18l14-9Z" />
      <path d="M15 20h8" />
    </Ic>
  ),
};

export default function P3Home() {
  const lines = (s: string) => s.split("\n").map((l, i) => <span key={i}>{l}</span>);
  return (
    <div className="p3-root">
      <div className="p3-page">
        {/* ── ヘッダー ── */}
        <header className="p3-hdr">
          <i className="p3-wedge" aria-hidden="true" />
          <div className="p3-bar" />
          <Link href="/" className="p3-logo p3-a" style={a(27, 0, 150, 58)} aria-label="マチノワ">
            <span className="p3-logo-j p3-t" style={t(18.6, 25, 27, 30)}>マチノワ</span>
            <span className="p3-logo-e p3-t" style={t(35.5, 46, 6.5, 8)}>MACHINOWA</span>
          </Link>
          <p className="p3-tag p3-t" style={t(194, 29, 11.6, 16)}>街の“好き”が見つかる、つながる。</p>
          <nav className="p3-nav" aria-label="メイン">
            <Link className="p3-t" style={t(553, 29, 10.5, 16)} href="/search">お店を探す</Link>
            <Link className="p3-t" style={t(634.4, 29, 10.5, 16)} href="/feature">特集</Link>
            <Link className="p3-t" style={t(683, 29, 10.5, 16)} href="#">街歩き</Link>
            <Link className="p3-t" style={t(744, 29, 10.5, 16)} href="#">マチノワについて</Link>
          </nav>
          <span className="p3-hdrsep" aria-hidden="true" />
          <Link href="#" className="p3-hic p3-heart p3-a" style={a(880, 18.5, 20, 20)} aria-label="お気に入り">
            <svg viewBox="0 0 24 24"><path d="M12 21.2C4.5 15 2 11.5 2 8.2 2 5.2 4.3 3 7 3c2 0 3.8 1.1 5 3 1.2-1.9 3-3 5-3 2.7 0 5 2.2 5 5.2 0 3.3-2.5 6.8-10 13Z" fill="currentColor" /></svg>
          </Link>
          <Link href="#" className="p3-hic p3-user p3-a" style={a(922.5, 17.5, 22, 22)} aria-label="マイページ">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="9.5" r="3.4" /><path d="M5.8 18.5c1.4-3 3.6-4.3 6.2-4.3s4.8 1.3 6.2 4.3" /></svg>
          </Link>
          <button type="button" className="p3-hic p3-menu p3-a" style={a(967, 18.5, 20, 20)} aria-label="メニュー">
            <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
        </header>

        {/* ── ヒーロー(写真のコラージュ) ── */}
        <section className="p3-hero" aria-label="この街で、好きが見つかる。">
          <div className="p3-collage" aria-hidden="true">
            <img className="p3-pc p3-a" style={a(0, 59, 513, 335)} src={`${IMG}hero-woman.webp`} alt="" />
            <img className="p3-pc p3-a" style={a(493, 59, 190, 194)} src={`${IMG}hero-massage.webp`} alt="" />
            <img className="p3-pc p3-a" style={a(654, 59, 194, 205)} src={`${IMG}hero-bed.webp`} alt="" />
            <img className="p3-pc p3-a" style={a(852, 59, 172, 213)} src={`${IMG}hero-yoga.webp`} alt="" />
            <img className="p3-pc p3-a" style={a(467, 230, 239, 164)} src={`${IMG}hero-dog.webp`} alt="" />
            <img className="p3-pc p3-a" style={a(691, 213, 333, 181)} src={`${IMG}hero-mount.webp`} alt="" />
          </div>
          <div className="p3-herotext">
            <h1 className="p3-t p3-h1" style={t(45, 156, 31.5, 45)}>
              <span>この街で、</span>
              <span>好きが見つかる。</span>
              <span>つながる。</span>
            </h1>
            <p className="p3-t p3-hp" style={t(46, 292, 13, 22.5)}>
              <span>グルメ・美容・宿・遊び・暮らしまで。</span>
              <span>あなたの毎日に、</span>
              <span>ちょっといい出会いを。</span>
            </p>
            <p className="p3-hand p3-t" style={t(205, 352, 18, 22)} aria-hidden="true">
              <span>Good local</span>
              <span>Good life</span>
            </p>
          </div>
        </section>

        {/* ── 8 業種 ── */}
        <section className="p3-cats" aria-label="業種">
          {CATS.map(([jp, en, key, href, col], i) => (
            <Link key={key} href={href} className="p3-cat p3-a" style={a(23 + i * 122.9, 422, 117.3, 236.6, { "--c": col })}>
              <img className="p3-a p3-cat-ph" style={a(0, 0, 117.3, 179)} src={`${IMG}cat-${i + 1}.webp`} alt="" />
              <span className="p3-cat-band p3-a" style={a(0, 179, 117.3, 57.6)}>
                <span className="p3-cat-ic p3-a" style={a(13, 14.5, 29, 29)}>{CAT_ICONS[key]}</span>
                <span className="p3-cat-tx">
                  <span className="p3-cat-jp p3-t" style={t(49, 22, jp.length >= 6 ? 9 : 10, 14)}>{jp}</span>
                  <span className="p3-cat-en p3-t" style={t(50, 37.5, 7.5, 10)}>{en}</span>
                </span>
              </span>
            </Link>
          ))}
        </section>

        {/* ── 特集 ── */}
        <section className="p3-feat" aria-label="特集">
          <Link href="/feature" className="p3-fmain p3-a" style={a(41, 686, 607, 248)}>
            <img className="p3-a p3-fmain-ph" style={a(0, 0, 607, 248)} src={`${IMG}feat-main.webp`} alt="" />
            <span className="p3-fbadge p3-a" style={a(28.6, 26, 62, 27.6)}>特集</span>
            <span className="p3-fh p3-t" style={t(29, 82, 26.6, 38)}>
              <span>この街で過ごす、</span>
              <span>ちょっと特別な一日。</span>
            </span>
            <span className="p3-fsub p3-t" style={t(29, 157, 12, 20)}>
              <span>地元で見つける、</span>
              <span>お気に入りの過ごし方。</span>
            </span>
            <span className="p3-fbtn p3-a" style={a(28.6, 199.6, 124, 29)}>
              <span>特集をみる</span>
              <Arrow />
            </span>
          </Link>
          {FEATS.map(([txt, href], i) => (
            <Link key={i} href={href} className="p3-frow p3-a" style={a(667, [686, 770, 854.5][i], 320, 76.5)}>
              <img className="p3-a p3-frow-ph" style={a(0, 0, 91, 76.5)} src={`${IMG}feat-${i + 1}.webp`} alt="" />
              <span className="p3-frow-t p3-t" style={t(106.7, 25.5, 13, 22.5)}>{lines(txt)}</span>
              <span className="p3-round p3-a" style={a(288, 26, 25, 25)}><Chev /></span>
            </Link>
          ))}
        </section>

        {/* ── シーンから見つける ── */}
        <section className="p3-scenes" aria-label="シーンから見つける">
          <div className="p3-shead">
          <h2 className="p3-t p3-h2" style={t(42.5, 990, 23.9, 32)}>シーンから見つける</h2>
          <span className="p3-dash p3-a" style={a(276, 990, 16, 1)} aria-hidden="true" />
          <p className="p3-t p3-sub" style={t(307, 992.5, 9.5, 14)}>こんな時におすすめのお店・スポットをまとめました。</p>
          <Link href="/search" className="p3-t p3-more" style={t(853.5, 992.5, 10, 14)}>
            <span>すべてのシーンを見る</span>
            <Arrow />
          </Link>
          </div>
          {SCENES.map((txt, i) => (
            <Link key={i} href="/search" className="p3-scene p3-a" style={a(36.4 + i * 160.3, 1023, 152.6, 166)}>
              <span className="p3-scene-top">
                <img className="p3-a p3-scene-ph" style={a(0, 0, 152.6, 99.5)} src={`${IMG}scene-${i + 1}.webp`} alt="" />
                <span className="p3-round p3-a p3-round-s" style={a(118.6, 87.5, 25, 25)}><Chev /></span>
              </span>
              <span className="p3-scene-t p3-t" style={t(14.6, 122.6, 12.5, 20.5)}>{lines(txt)}</span>
              <span className="p3-a p3-scene-chev" style={a(133, 129, 6, 8)}><Chev /></span>
            </Link>
          ))}
        </section>

        {/* ── 街をもっと楽しむコンテンツ ── */}
        <section className="p3-contents" aria-label="街をもっと楽しむコンテンツ">
          <div className="p3-shead">
          <h2 className="p3-t p3-h2" style={t(41, 1249.7, 21.7, 30)}>街をもっと楽しむコンテンツ</h2>
          <span className="p3-dash p3-a" style={a(339, 1251.5, 16, 1)} aria-hidden="true" />
          <p className="p3-t p3-sub" style={t(371, 1251.7, 9.8, 14)}>お店の紹介だけでなく、街の魅力や人、暮らしにまつわる情報をお届けします。</p>
          <Link href="#" className="p3-t p3-more" style={t(832, 1251, 10, 14)}>
            <span>すべてのコンテンツを見る</span>
            <Arrow />
          </Link>
          </div>
          {CONTENTS.map(([title, desc, key, x, w, n]) => (
            <Link key={key} href="#" className="p3-cont p3-a" style={a(x, 1282, w, 206)}>
              <img className="p3-a p3-cont-ph" style={a(0, 0, w, 121)} src={`${IMG}cont-${n}.webp`} alt="" />
              <span className="p3-cont-body">
                <span className="p3-cont-ic p3-a" style={a(18, 135, 38, 38)}>{CONT_ICONS[key]}</span>
                <span className="p3-cont-tx">
                  <span className="p3-cont-t p3-t" style={t(73.7, 143.8, 12.5, 18)}>{title}</span>
                  <span className="p3-cont-d p3-t" style={t(73.7, 168, 10.5, 17)}>{lines(desc)}</span>
                </span>
                <span className="p3-round p3-a p3-round-c" style={a(w - 36, 154, 20, 20)}><Chev /></span>
              </span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
