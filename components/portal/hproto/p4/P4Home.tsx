import Fit from "./Fit";
import { SHAPES } from "./shapes";

// 総合トップの試作「見本4(丸い切り抜き)」の再現。座標はすべて見本(1024×1536)の px。Fit が画面幅に合わせて拡大縮小する。
const A = (x: number, y: number, w?: number, h?: number): React.CSSProperties => ({ left: x, top: y, width: w, height: h });
const IMG = "/_portal/hproto/p4/";

const HERO = ["h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"] as const;
// [x0,y0,x1,y1, 文字, 傾き, 字の大きさ]
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
const NAV = [
  ["マチノワについて", 279],
  ["特集", 412],
  ["街歩き", 468],
  ["インタビュー", 536],
  ["お知らせ", 633],
] as const;
const FNAV = [
  ["マチノワについて", 262],
  ["特集", 372],
  ["街歩き", 422],
  ["インタビュー", 484],
  ["お知らせ", 575],
] as const;
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
const SCENE_X = [536, 655, 773, 893];

const Heart = ({ c = "#d9423f", f = true }: { c?: string; f?: boolean }) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
    <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 2.8 4.5 6.4 4.5c2.2 0 4 1.3 5.6 3.2 1.6-1.9 3.4-3.2 5.6-3.2 3.6 0 5.5 3.7 4 7.2C19.5 16.4 12 21 12 21z" fill={f ? c : "none"} stroke={c} strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
const Arrow = () => (
  <svg viewBox="0 0 24 10" width="14" height="6" aria-hidden>
    <path d="M1 5h21M17 1l5 4-5 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function P4Home() {
  const allShapes = [...HERO, "story", "city"] as const;
  return (
    <Fit>
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
      <header className="p4-abs" style={A(0, 0, 1024, 58)}>
        <a href="#" className="p4-logo p4-abs" style={A(55, 8)}>
          <span className="p4-logo-ja">マチノワ</span>
          <span className="p4-logo-en">MACHINOWA</span>
        </a>
        <nav>
          {NAV.map(([t, x]) => (
            <a key={t} href="#" className="p4-nav p4-abs" style={{ left: x, top: 21 }}>{t}</a>
          ))}
          {[396, 452, 517, 616].map((x) => (
            <i key={x} className="p4-sep p4-abs" style={{ left: x, top: 22 }} />
          ))}
        </nav>
        <span className="p4-abs p4-fav" style={{ left: 851, top: 20 }}>
          <span style={{ width: 13, height: 13, display: "inline-block" }}><Heart /></span>お気に入り
        </span>
        <span className="p4-abs p4-burger" style={{ left: 949, top: 19 }}><i /><i /><i /></span>
      </header>

      {/* ヒーロー */}
      <section aria-label="ヒーロー">
        <h1 className="p4-h1">
          <span className="p4-abs" style={{ left: 50, top: 103, transform: "rotate(-7deg)" }}>この街の</span>
          <span className="p4-abs" style={{ left: 68, top: 170, transform: "rotate(-7deg)" }}>好きが、</span>
          <span className="p4-abs" style={{ left: 90, top: 232, transform: "rotate(-7deg)" }}>みつかる。</span>
        </h1>
        <p className="p4-lead p4-abs" style={A(52, 332)}>
          マチノワは、地域の魅力的なお店・人・文化・体験をつなぐ<br />街のポータルサイトです。
        </p>
        <img src={IMG + "n_art_street.webp"} alt="" className="p4-abs" style={A(0, 333, 490, 202)} />

        {HERO.map((k) => {
          const s = SHAPES[k];
          return (
            <img key={k} src={IMG + "n_" + k + ".webp"} alt="" className="p4-abs" style={{ ...A(s.x, s.y, s.w, s.h), clipPath: `url(#p4c-${k})` }} />
          );
        })}
        {LABELS.map(([x0, y0, x1, y1, t, r, fs]) => (
          <span key={x0 + "-" + y0} className="p4-label p4-abs" style={{ left: x0 - 1, top: y0 - 1, width: x1 - x0 + 2, height: y1 - y0 + 2, transform: `rotate(${r}deg)`, fontSize: fs, writingMode: r ? "horizontal-tb" : "vertical-rl" }}>{t}</span>
        ))}
        <div className="p4-badge p4-abs" style={A(620, 212, 180, 180)}>
          <svg viewBox="0 0 180 180" width="180" height="180" aria-hidden>
            <path d="M90 2C140 1 179 40 178 91C177 141 138 179 88 178C38 177 1 139 2 89C3 40 42 3 90 2Z" fill="#faf8f2" stroke="#5a554f" strokeWidth="1.1" />
          </svg>
          <span className="p4-badge-t">
            <span style={{ display: "block", transform: "translateX(2px)" }}>いつもの街が、</span>
            <span style={{ display: "block", transform: "translateX(-4px)" }}>もっと好きになる。</span>
          </span>
          <span className="p4-badge-en">MACHINOWA</span>
        </div>
      </section>

      {/* 8つのカテゴリー */}
      <section aria-label="カテゴリー">
        <p className="p4-en p4-abs" style={{ left: 222, top: 605 }}>CATEGORY</p>
        <h2 className="p4-h2 p4-abs" style={{ left: 222, top: 623 }}>8つのカテゴリーから見つける、街の楽しみ方。</h2>
        <p className="p4-sub p4-abs" style={{ left: 0, width: 1024, textAlign: "center", top: 671 }}>グルメからくらしまで、あなたの「好き」がきっと見つかる。</p>
        {CATS.map(([k, ja, en], i) => {
          const x = Math.round(37 + 120.4 * i);
          return (
            <a key={k} href="#" className="p4-cat p4-abs" style={A(x, 702, 113, 160)}>
              <img src={IMG + "n_cat_" + k + ".webp"} alt="" style={{ width: 113, height: 121, borderRadius: CAT_R[i % 4] }} />
              <span className="p4-cat-ja">{ja}</span>
              <span className="p4-cat-en">{en}</span>
            </a>
          );
        })}
      </section>

      {/* 街のストーリー / シーン */}
      <section aria-label="街のストーリーとシーン">
        <div className="p4-abs" style={{ ...A(0, 892, 500, 343), background: "#fdfcfa" }} />
        <div className="p4-abs" style={{ ...A(490, 892, 534, 343), background: "#f7f0e5" }} />
        <img src={IMG + "n_story.webp"} alt="" className="p4-abs p4-story" style={{ ...A(SHAPES.story.x, SHAPES.story.y, SHAPES.story.w, SHAPES.story.h), clipPath: "url(#p4c-story)" }} />
        <h2 className="p4-h3 p4-abs" style={{ left: 55, top: 997 }}>街のストーリー</h2>
        <p className="p4-small p4-abs" style={{ left: 55, top: 1042 }}>お店・人・街の魅力を紡ぐ<br />読みものコンテンツ。</p>
        <a href="#" className="p4-btn p4-abs" style={A(53, 1104, 147, 39)}>特集をみる<Arrow /></a>
        <span className="p4-script p4-abs" style={{ left: 30, top: 1160, transform: "rotate(-14deg)", transformOrigin: "left top" }}>Special<br /><span style={{ marginLeft: 30 }}>Contents</span></span>

        <p className="p4-en p4-abs" style={{ left: 556, top: 923 }}>SCENE</p>
        <h2 className="p4-h3 p4-abs" style={{ left: 558, top: 940 }}>こんなシーンで楽しめる。</h2>
        <p className="p4-small p4-abs" style={{ left: 557, top: 981 }}>日常のあらゆるシーンで、マチノワがあなたの街時間を彩ります。</p>
        {SCENES.map(([a, b], i) => (
          <a key={a} href="#" className="p4-scene p4-abs" style={A(SCENE_X[i], 1017, 107, 190)}>
            <img src={IMG + "n_s" + i + ".webp"} alt="" style={{ width: 107, height: 131, borderRadius: i % 2 ? "44% 44% 38% 38% / 30% 30% 22% 22%" : "46% 46% 36% 36% / 28% 28% 24% 24%" }} />
            <span>{a}<br />{b}</span>
          </a>
        ))}
      </section>

      {/* マチノワについて */}
      <section aria-label="マチノワについて">
        <p className="p4-en p4-abs" style={{ left: 55, top: 1262 }}>ABOUT</p>
        <h2 className="p4-h4 p4-abs" style={{ left: 55, top: 1281 }}>マチノワについて</h2>
        <p className="p4-small p4-abs" style={{ left: 55, top: 1319, lineHeight: "22px" }}>地域の魅力をつなぎ、<br />街の新しい発見や出会いを生み出します。</p>
        <a href="#" className="p4-btn p4-abs" style={A(53, 1373, 177, 38)}>マチノワについて<Arrow /></a>
        <img src={IMG + "n_art_people.webp"} alt="" className="p4-abs" style={A(270, 1280, 114, 136)} />
        <img src={IMG + "n_city.webp"} alt="" className="p4-abs" style={{ ...A(SHAPES.city.x, SHAPES.city.y, SHAPES.city.w, SHAPES.city.h), clipPath: "url(#p4c-city)" }} />
        <div className="p4-abs p4-blue" style={A(650, 1228, 374, 212)} />
        <span className="p4-script p4-abs" style={{ left: 586, top: 1397, transform: "rotate(-14deg)", transformOrigin: "left top", fontSize: 19 }}>Connect<br /><span style={{ marginLeft: 26 }}>The Town</span></span>
        <img src={IMG + "n_art_cam.webp"} alt="" className="p4-abs" style={A(676, 1256, 116, 104)} />
        <h2 className="p4-h4 p4-abs" style={{ left: 802, top: 1250, lineHeight: "37px" }}>街で見つける、<br />新しい好き。</h2>
        <p className="p4-small p4-abs" style={{ left: 802, top: 1316, lineHeight: "22px" }}>マチノワは、地域の魅力的なお店や<br />人・文化・体験をつなぎ、<br />この街をもっと豊かにしていく<br />ポータルサイトです。</p>
      </section>

      {/* フッター */}
      <footer className="p4-abs p4-foot" style={A(0, 1458, 1024, 78)}>
        <a href="#" className="p4-logo p4-abs" style={A(55, 18)}>
          <span className="p4-logo-ja">マチノワ</span>
          <span className="p4-logo-en">MACHINOWA</span>
        </a>
        {FNAV.map(([t, x]) => (
          <a key={t} href="#" className="p4-fnav p4-abs" style={{ left: x, top: 31 }}>{t}</a>
        ))}
        <svg className="p4-abs" style={A(747, 31, 16, 16)} viewBox="0 0 24 24" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="#2b2724" strokeWidth="2" /><circle cx="12" cy="12" r="4.2" fill="none" stroke="#2b2724" strokeWidth="2" /><circle cx="17.3" cy="6.7" r="1.2" fill="#2b2724" /></svg>
        <svg className="p4-abs" style={A(780, 31, 16, 16)} viewBox="0 0 24 24" aria-hidden><path d="M13 3v11.5a3.5 3.5 0 1 1-3.5-3.5M13 3c.4 2.6 2 4.4 5 4.7" fill="none" stroke="#2b2724" strokeWidth="2.6" strokeLinecap="round" /></svg>
        <svg className="p4-abs" style={A(812, 31, 18, 16)} viewBox="0 0 24 24" aria-hidden><rect x="1.5" y="4.5" width="21" height="15" rx="4.5" fill="#2b2724" /><path d="M10 9l5 3-5 3z" fill="#f3efea" /></svg>
        <i className="p4-abs" style={{ left: 863, top: 26, width: 1, height: 28, background: "#cfc9c0" }} />
        <span className="p4-abs p4-fav" style={{ left: 898, top: 31, fontSize: 10 }}>
          <span style={{ width: 14, height: 14, display: "inline-block" }}><Heart c="#2b2724" f={false} /></span>お気に入り
        </span>
      </footer>
    </Fit>
  );
}
