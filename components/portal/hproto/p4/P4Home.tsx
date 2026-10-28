import { SHAPES } from "./shapes";

// 総合トップの試作「見本4(丸い切り抜き)」の横型(PC)版。
// 見本(1024×1536 の縦長)を画面幅で引き伸ばさず、ヒーローだけ見本の座標(--u = 見本の 1px、最大 1.2px)で組み、
// そのほかの段は普通の大きさの文字で横に組む。768px 前後より狭いときは縦に積む。
const U = (n: number) => `calc(var(--u) * ${n})`;
const IMG = "/_portal/hproto/p4/";
// コラージュの原点(見本の座標)
const OX = 308;
const OY = 49;

const HERO = ["h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"] as const;
// [x0,y0,x1,y1, 文字, 傾き, 字の大きさ](見本の座標)
const LABELS: [number, number, number, number, string, number, number][] = [
  [459, 114, 493, 198, "食べて、", 0, 16],
  [842, 89, 875, 176, "動いて、", 0, 16],
  [971, 225, 997, 302, "癒されて、", 0, 13],
  [840, 344, 960, 391, "キレイになって、", -4, 15],
  [528, 372, 560, 466, "出かけて、", 0, 16],
  [465, 492, 498, 584, "楽しんで、", 0, 16],
  [780, 408, 811, 513, "キレイになって、", 0, 12],
  [929, 483, 961, 558, "整えて、", 0, 16],
];
const NAV = ["マチノワについて", "特集", "街歩き", "インタビュー", "お知らせ"] as const;
const CATS = [
  ["gourmet", "グルメ", "GOURMET"],
  ["beauty", "ビューティー", "BEAUTY"],
  ["bodycare", "ボディケア", "BODYCARE"],
  ["pet", "ペット", "PET"],
  ["stay", "ステイ", "STAY"],
  ["activity", "アクティビティ", "ACTIVITY"],
  ["sports", "スポーツ", "SPORTS"],
  ["life", "くらし", "LIFESTYLE"],
] as const;
const CAT_R = ["36% 42% 38% 34% / 32% 36% 42% 36%", "40% 34% 42% 36% / 36% 40% 34% 42%", "34% 40% 36% 42% / 40% 34% 40% 36%", "42% 36% 34% 40% / 34% 42% 36% 40%"];
const SCENES = [
  ["友人と", "楽しむ"],
  ["家族と", "おでかけ"],
  ["ひとりで", "リフレッシュ"],
  ["ペットと", "一緒に"],
];

const Heart = ({ c = "#d9423f", f = true }: { c?: string; f?: boolean }) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
    <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 2.8 4.5 6.4 4.5c2.2 0 4 1.3 5.6 3.2 1.6-1.9 3.4-3.2 5.6-3.2 3.6 0 5.5 3.7 4 7.2C19.5 16.4 12 21 12 21z" fill={f ? c : "none"} stroke={c} strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
const Arrow = () => (
  <svg viewBox="0 0 24 10" width="16" height="7" aria-hidden>
    <path d="M1 5h21M17 1l5 4-5 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Logo = () => (
  <a href="#" className="p4-logo">
    <span className="p4-logo-ja">マチノワ</span>
    <span className="p4-logo-en">MACHINOWA</span>
  </a>
);

export default function P4Home() {
  const allShapes = [...HERO, "story", "city"] as const;
  return (
    <div className="p4-page">
      {/* 切り抜きの形(objectBoundingBox) */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          {allShapes.map((k) => (
            <clipPath key={k} id={"p4c-" + k} clipPathUnits="objectBoundingBox">
              <path d={SHAPES[k].d} />
            </clipPath>
          ))}
        </defs>
      </svg>

      {/* ヘッダー */}
      <header className="p4-header">
        <Logo />
        <nav className="p4-nav">
          {NAV.map((t) => (
            <a key={t} href="#">{t}</a>
          ))}
        </nav>
        <span className="p4-fav">
          <span className="p4-fav-i"><Heart /></span>お気に入り
        </span>
        <span className="p4-burger" aria-hidden><i /><i /><i /></span>
      </header>

      {/* ヒーロー */}
      <section className="p4-hero" aria-label="ヒーロー">
        <div className="p4-hero-text">
          <h1 className="p4-h1">
            <span>この街の</span>
            <span>好きが、</span>
            <span>みつかる。</span>
          </h1>
          <p className="p4-lead">
            マチノワは、地域の魅力的なお店・人・文化・体験をつなぐ<br />街のポータルサイトです。
          </p>
        </div>
        <img src={IMG + "n_art_street.webp"} alt="" className="p4-street" />
        <div className="p4-collage">
          {HERO.map((k) => {
            const s = SHAPES[k];
            return (
              <img key={k} src={IMG + "n_" + k + ".webp"} alt="" className="p4-blob" style={{ left: U(s.x - OX), top: U(s.y - OY), width: U(s.w), height: U(s.h), clipPath: `url(#p4c-${k})` }} />
            );
          })}
          {LABELS.map(([x0, y0, x1, y1, t, r, fs]) => (
            <span
              key={x0 + "-" + y0}
              className="p4-label"
              style={{ left: U(x0 - 1 - OX), top: U(y0 - 1 - OY), width: U(x1 - x0 + 2), height: U(y1 - y0 + 2), transform: `rotate(${r}deg)`, fontSize: `max(10px, ${U(fs)})`, writingMode: r ? "horizontal-tb" : "vertical-rl" }}
            >
              {t}
            </span>
          ))}
          <div className="p4-badge" style={{ left: U(620 - OX), top: U(212 - OY), width: U(180), height: U(180) }}>
            <svg viewBox="0 0 180 180" width="100%" height="100%" aria-hidden>
              <path d="M90 2C140 1 179 40 178 91C177 141 138 179 88 178C38 177 1 139 2 89C3 40 42 3 90 2Z" fill="#faf8f2" stroke="#5a554f" strokeWidth="1.1" />
            </svg>
            <span className="p4-badge-t">
              <span style={{ display: "block", transform: "translateX(2px)" }}>いつもの街が、</span>
              <span style={{ display: "block", transform: "translateX(-4px)" }}>もっと好きになる。</span>
            </span>
            <span className="p4-badge-en">MACHINOWA</span>
          </div>
        </div>
      </section>

      {/* 8つのカテゴリー */}
      <section className="p4-catsec" aria-label="カテゴリー">
        <div className="p4-catsec-head">
          <div className="p4-catsec-title">
            <p className="p4-en">CATEGORY</p>
            <h2 className="p4-h2">8つのカテゴリーから見つける、街の楽しみ方。</h2>
          </div>
          <p className="p4-sub">グルメからくらしまで、あなたの「好き」がきっと見つかる。</p>
        </div>
        <div className="p4-cats">
          {CATS.map(([k, ja, en], i) => (
            <a key={k} href="#" className="p4-cat">
              <img src={IMG + "n_cat_" + k + ".webp"} alt="" style={{ borderRadius: CAT_R[i % 4] }} />
              <span className="p4-cat-ja">{ja}</span>
              <span className="p4-cat-en">{en}</span>
            </a>
          ))}
        </div>
      </section>

      {/* 街のストーリー / シーン */}
      <section className="p4-duo" aria-label="街のストーリーとシーン">
        <div className="p4-story-cell">
          <img src={IMG + "n_story.webp"} alt="" className="p4-story-img" style={{ clipPath: "url(#p4c-story)" }} />
          <div className="p4-story-body">
            <h2 className="p4-h3">街のストーリー</h2>
            <p className="p4-small">お店・人・街の魅力を紡ぐ<br />読みものコンテンツ。</p>
            <a href="#" className="p4-btn">特集をみる<Arrow /></a>
          </div>
          <span className="p4-script p4-script-story">Special<br /><span style={{ marginLeft: 30 }}>Contents</span></span>
        </div>
        <div className="p4-scene-cell">
          <p className="p4-en">SCENE</p>
          <h2 className="p4-h3">こんなシーンで楽しめる。</h2>
          <p className="p4-small">日常のあらゆるシーンで、マチノワがあなたの街時間を彩ります。</p>
          <div className="p4-scenes">
            {SCENES.map(([a, b], i) => (
              <a key={a} href="#" className="p4-scene">
                <img src={IMG + "n_s" + i + ".webp"} alt="" style={{ borderRadius: i % 2 ? "44% 44% 38% 38% / 30% 30% 22% 22%" : "46% 46% 36% 36% / 28% 28% 24% 24%" }} />
                <span>{a}<br />{b}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* マチノワについて */}
      <section className="p4-about" aria-label="マチノワについて">
        <div className="p4-about-l">
          <div className="p4-about-text">
            <p className="p4-en">ABOUT</p>
            <h2 className="p4-h4">マチノワについて</h2>
            <p className="p4-small">地域の魅力をつなぎ、<br />街の新しい発見や出会いを生み出します。</p>
            <a href="#" className="p4-btn">マチノワについて<Arrow /></a>
          </div>
          <img src={IMG + "n_art_people.webp"} alt="" className="p4-people" />
        </div>
        <div className="p4-about-c">
          <img src={IMG + "n_city.webp"} alt="" className="p4-city" style={{ clipPath: "url(#p4c-city)" }} />
          <span className="p4-script p4-script-town">Connect<br /><span style={{ marginLeft: 26 }}>The Town</span></span>
        </div>
        <div className="p4-blue">
          <img src={IMG + "n_art_cam.webp"} alt="" className="p4-cam" />
          <div>
            <h2 className="p4-h4">街で見つける、<br />新しい好き。</h2>
            <p className="p4-small">マチノワは、地域の魅力的なお店や<br />人・文化・体験をつなぎ、<br />この街をもっと豊かにしていく<br />ポータルサイトです。</p>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="p4-foot">
        <Logo />
        <nav className="p4-fnav">
          {NAV.map((t) => (
            <a key={t} href="#">{t}</a>
          ))}
        </nav>
        <span className="p4-soc">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="#2b2724" strokeWidth="2" /><circle cx="12" cy="12" r="4.2" fill="none" stroke="#2b2724" strokeWidth="2" /><circle cx="17.3" cy="6.7" r="1.2" fill="#2b2724" /></svg>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M13 3v11.5a3.5 3.5 0 1 1-3.5-3.5M13 3c.4 2.6 2 4.4 5 4.7" fill="none" stroke="#2b2724" strokeWidth="2.6" strokeLinecap="round" /></svg>
          <svg viewBox="0 0 24 24" width="20" height="18" aria-hidden><rect x="1.5" y="4.5" width="21" height="15" rx="4.5" fill="#2b2724" /><path d="M10 9l5 3-5 3z" fill="#f3efea" /></svg>
        </span>
        <i className="p4-fdiv" />
        <span className="p4-fav">
          <span className="p4-fav-i"><Heart c="#2b2724" f={false} /></span>お気に入り
        </span>
      </footer>
    </div>
  );
}
