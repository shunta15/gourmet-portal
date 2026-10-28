import type { CSSProperties } from "react";
import Link from "next/link";
import { SHAPES } from "./shapes";
import ContactLine from "@/components/portal/ContactLine";

// 総合トップの試作「見本4(丸い切り抜き)」の横型(PC)版。
// 見本(1024×1536 の縦長)を画面幅で引き伸ばさず、ヒーローだけ見本の座標(--u = 見本の 1px、最大 1.2px)で組み、
// そのほかの段は普通の大きさの文字で横に組む。768px 前後より狭いときは縦に積む。
// 2026-10-29 本番用に、仮の # や文字を今ある実在のページへ置き換えた(配置・札の枚数・形・色は試作のまま)。リンク先の表は下の HREF_* にまとめてある。
const U = (n: number) => `calc(var(--u) * ${n})`;
const IMG = "/_portal/hproto/p4/";
// コラージュの原点(見本の座標)
const OX = 308;
const OY = 49;

// 高画質に差し替えた 8 枚 = ヒーローの写真すべて(2026-10-29 オーナー提供)の見せる窓 [x0, y0, 幅, 高さ](元画像 1536×1024 の px。幅/高さ = そのブロブの縦横比)
// h1 = 食べて(カフェの女性) / h2 = 動いて(ジムの男性) / h3 = 癒されて(犬) / h4 = キレイになって・横札(ヘッドスパ) / h6 = ステイ・ベッド(寝室。縦札「キレイになって、」の写真) / h5 = 出かけて / h8 = 楽しんで / h7 = 整えて
const HIRES: Record<string, [number, number, number, number]> = {
  h2: [180, 0, 1178, 1024], // 札と鉄アレイが重ならないよう 30px 右へ(2026-10-29)
  h3: [600, 0, 755, 1024],
  h4: [60, 0, 1431, 1024],
  h6: [100, 0, 1331, 1024],
  h1: [200, 0, 1200, 951], // 食べて(カフェの女性。顔とカップ)
  h5: [100, 0, 1299, 1024], // 出かけて(山と湖)
  h8: [0, 200, 1536, 690], // 楽しんで(陶芸。手と器)
  h7: [490, 0, 1032, 900], // 整えて(整体。施術者の手と背中)
};
const HERO = ["h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"] as const;
// 札: [中心 x, 中心 y, 幅, 高さ, 文字, 傾き, 行き先, スマホの中心 x, スマホの中心 y](見本の座標)。行き先は札の隣の写真に合わせた業種の最初のページ(8 枚の写真 = 8 業種)。
// 2026-10-29 位置直し: 札は必ず写真の縁の内側(縁から 6〜15 以上あける)に収め、顔・施術者の手・窓の柱には重ねない。字の大きさは全札 14 にそろえた。
// 幅・高さは PC の大きさ。スマホ(390 幅)では字の下限(9px)で箱が自動で広がる(中心は変わらない)。横札はスマホだけ 2 行(キレイに/なって、)にして写真に収める。
const LABELS: [number, number, number, number, string, number, string, number?, number?][] = [
  [470, 160, 30, 76, "食べて、", 0, "/gourmet"],
  [814, 106, 30, 76, "動いて、", 0, "/sports"],
  [992, 126, 30, 92, "癒されて、", 0, "/pet"],
  [888, 359, 137, 28, "キレイになって、", -3, "/beauty", 890, 364],
  [545, 417, 30, 76, "出かけて、", 0, "/activity"],
  [481, 538, 30, 76, "楽しんで、", 0, "/life"],
  [810, 458, 30, 92, "泊まって、", 0, "/stay"],
  [982, 468, 30, 76, "整えて、", 0, "/bodycare"],
];
// ヘッダー・フッターのナビ。「マチノワについて」は 2026-10-29 オーナー指示で外した / 特集 = 特集の一覧 / 街歩き = 特集の一覧の「街歩き・コース」の棚。
// インタビュー・お知らせは、中身が合うページがまだ無いので # のまま(オーナー判断待ち)
const NAV: readonly (readonly [string, string])[] = [
  ["特集", "/feature"],
  ["街歩き", "/feature#walk"],
  ["インタビュー", "#"],
  ["お知らせ", "#"],
];
// 大見出しの 1 字ずつの揺れ [字, 大きさ(倍), 傾き(度), 上下(em)]。見本は筆ペン風の手書きで、字の大きさがそろわず少し踊っている(2026-10-29 オーナー指示「文字をキャッチコピー通りに」)
const H1: [string, number, number, number][][] = [
  [["こ", 0.95, -2, 0.02], ["の", 0.9, 3, 0], ["街", 1.08, -2, -0.02], ["の", 0.84, 4, -0.04]],
  [["好", 1.2, -3, 0], ["き", 1.08, 2, 0.03], ["が", 1.06, -3, 0], ["、", 1.0, 0, 0]],
  [["み", 1.0, -2, 0.02], ["つ", 0.97, 3, 0], ["か", 1.0, -2, 0.03], ["る", 1.02, 3, -0.02], ["。", 0.95, 0, 0]],
];
const HREF_FEATURE = "/feature";
const HREF_FAV = "/list";
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
// 利用シーン(店をさがすの絞り込み。どれも結果が出る: group 77 店 / 子連れ・家族連れ 17 店 / solo 22 店 / pet-friendly 3 店)
const SCENES: [string, string, string][] = [
  ["友人と", "楽しむ", "/search?scene=group"],
  ["家族と", "おでかけ", "/search?f=kids"],
  ["ひとりで", "ゆっくり", "/search?scene=solo"],
  ["ペットと", "一緒に", "/search?scene=pet-friendly"],
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
// 内向きのリンクは Link、同じページ内(#…)や # は <a>
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return href.startsWith("/") ? <Link href={href}>{children}</Link> : <a href={href}>{children}</a>;
}
const Logo = () => (
  <Link href="/" className="p4-logo" aria-label="マチノワ トップへ">
    <span className="p4-logo-ja">マチノワ</span>
    <span className="p4-logo-en">MACHINOWA</span>
  </Link>
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
        <nav className="p4-nav" aria-label="サイトナビゲーション">
          {NAV.map(([t, h]) => (
            <NavLink key={t} href={h}>{t}</NavLink>
          ))}
        </nav>
        <details className="p4-menu">
          <summary className="p4-burger" aria-label="メニュー"><i /><i /><i /></summary>
          <ul className="p4-menu-list">
            {CATS.map(([k, ja]) => (
              <li key={k}><Link href={"/" + k}>{ja}</Link></li>
            ))}
            <li><Link href={HREF_FAV}>お気に入り</Link></li>
          </ul>
        </details>
      </header>

      {/* ヒーロー */}
      <section className="p4-hero" aria-label="ヒーロー">
        <div className="p4-hero-text">
          <h1 className="p4-h1" aria-label="この街の好きが、みつかる。">
            {H1.map((line, li) => (
              <span key={li} aria-hidden>
                {line.map(([ch, s, r, dy], ci) => (
                  <i key={ci} style={{ fontSize: `${s}em`, transform: `translateY(${dy}em) rotate(${r}deg)` }}>{ch}</i>
                ))}
              </span>
            ))}
          </h1>
          <p className="p4-lead">
            マチノワは、地域の魅力的なお店・人・文化・体験をつなぐ<br />街のポータルサイトです。
          </p>
        </div>
        <img src={IMG + "n_art_street.webp"} alt="" className="p4-street" />
        <div className="p4-collage">
          {HERO.map((k) => {
            const s = SHAPES[k];
            const box = { left: U(s.x - OX), top: U(s.y - OY), width: U(s.w), height: U(s.h), clipPath: `url(#p4c-${k})` };
            const hi = HIRES[k];
            if (!hi) return <img key={k} src={IMG + "n_" + k + ".webp"} alt="" className="p4-blob" style={box} />;
            // 高画質版(1536×1024)。ブロブの形・位置はそのまま、写真のどこを見せるかを窓(x0,y0,cw,ch。元画像の px。cw/ch = ブロブの縦横比)で決める
            const [x0, y0, cw, ch] = hi;
            return (
              <div key={k} className="p4-blob" style={box}>
                <img src={IMG + "n_" + k + ".webp"} alt="" className="p4-blob-img" width={1536} height={1024} style={{ width: `${(1536 / cw) * 100}%`, left: `${(-x0 / cw) * 100}%`, top: `${(-y0 / ch) * 100}%` }} />
              </div>
            );
          })}
          {LABELS.map(([cx, cy, w, h, t, r, href, mx, my]) => (
            <Link
              key={cx + "-" + cy}
              href={href}
              className={"p4-label " + (r ? "p4-label-h" : "p4-label-v")}
              style={{ "--x": U(cx - OX), "--y": U(cy - OY), "--w": U(w), "--h": U(h), "--n": t.length, "--r": `${r}deg`, ...(mx ? { "--mx": U(mx - OX), "--my": U((my ?? cy) - OY) } : {}) } as CSSProperties}
            >
              {r ? <>キレイに<br className="p4-br" />なって、</> : t}
            </Link>
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
            <Link key={k} href={"/" + k} className="p4-cat">
              <img src={IMG + "n_cat_" + k + ".webp"} alt="" style={{ borderRadius: CAT_R[i % 4] }} />
              <span className="p4-cat-ja">{ja}</span>
              <span className="p4-cat-en">{en}</span>
            </Link>
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
            <Link href={HREF_FEATURE} className="p4-btn">特集をみる<Arrow /></Link>
          </div>
          <span className="p4-script p4-script-story">Special<br /><span style={{ marginLeft: 30 }}>Contents</span></span>
        </div>
        <div className="p4-scene-cell">
          <p className="p4-en">SCENE</p>
          <h2 className="p4-h3">こんなシーンで楽しめる。</h2>
          <p className="p4-small">日常のあらゆるシーンで、マチノワがあなたの街時間を彩ります。</p>
          <div className="p4-scenes">
            {SCENES.map(([a, b, href], i) => (
              <Link key={a} href={href} className="p4-scene">
                <img src={IMG + "n_s" + i + ".webp"} alt="" style={{ borderRadius: i % 2 ? "44% 44% 38% 38% / 30% 30% 22% 22%" : "46% 46% 36% 36% / 28% 28% 24% 24%" }} />
                <span>{a}<br />{b}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 特集記事(2026-10-29 「ABOUT マチノワについて」の段を替えた。並び・絵・写真・札は変えず文字だけ) */}
      <section className="p4-about" id="feature" aria-label="特集記事">
        <div className="p4-about-l">
          <div className="p4-about-text">
            <p className="p4-en">FEATURE</p>
            <h2 className="p4-h4">特集記事</h2>
            <p className="p4-small">マチノワで紹介しているお店の<br />特集記事をまとめています。</p>
            <Link href={HREF_FEATURE} className="p4-btn">特集記事を見る<Arrow /></Link>
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
      <footer className="p4-footwrap">
      <div className="p4-foot">
        <Logo />
        <nav className="p4-fnav" aria-label="フッターナビゲーション">
          {NAV.map(([t, h]) => (
            <NavLink key={t} href={h}>{t}</NavLink>
          ))}
        </nav>
        <span className="p4-soc">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="#2b2724" strokeWidth="2" /><circle cx="12" cy="12" r="4.2" fill="none" stroke="#2b2724" strokeWidth="2" /><circle cx="17.3" cy="6.7" r="1.2" fill="#2b2724" /></svg>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M13 3v11.5a3.5 3.5 0 1 1-3.5-3.5M13 3c.4 2.6 2 4.4 5 4.7" fill="none" stroke="#2b2724" strokeWidth="2.6" strokeLinecap="round" /></svg>
          <svg viewBox="0 0 24 24" width="20" height="18" aria-hidden><rect x="1.5" y="4.5" width="21" height="15" rx="4.5" fill="#2b2724" /><path d="M10 9l5 3-5 3z" fill="#f3efea" /></svg>
        </span>
        <i className="p4-fdiv" />
        <Link href={HREF_FAV} className="p4-fav">
          <span className="p4-fav-i"><Heart c="#2b2724" f={false} /></span>お気に入り
        </Link>
      </div>
      <ContactLine className="p4-contact" style={{ margin: 0, padding: "0 var(--wrap) 18px", textAlign: "center", color: "#5a544d", opacity: 1 }} />
      </footer>
    </div>
  );
}
