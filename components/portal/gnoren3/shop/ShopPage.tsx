import type { CSSProperties } from "react";
import "./shop.css";
import { ArrowR, IconMap, INFO_ICONS } from "./icons";
import Gallery from "./Gallery";
import { COLUMN, INFO, MAP_BUTTON, MENU, SCENES, SHOP } from "./data";

const IMG = "/_portal/gnoren3/shop";

/**
 * 店舗紹介(見本 3 = 1086×1448)。PC は見本の座標どおり(--u)、≤768px は縦に積む。
 * 座標 --l/--t/--w/--h は「見本の画素」。--l = 見本の x、--t = 属する帯の上端からの y(見本の y − 帯の上端)。
 * 帯の上端(見本の y): ヒーロー 55 / 営業情報 426 / ギャラリー 556 / おすすめ 761 / 店内 1020 / 関連 1303。
 * 文字は --t = 字の見た目の上端(ink top)で書き、CSS の --o(字の上の余白)を引いて置く。
 */
const P = (l: number, t: number, w?: number, h?: number) => ({ "--l": l, "--t": t, "--w": w, "--h": h }) as CSSProperties;

/** 暖簾(布)の画像と文字。cx,cy = 画像の左上の見本座標。文字の座標は画像内の見本座標(= 見本の座標 − 画像の左上) */
type BannerKey = "gal" | "menu" | "ins" | "rel";
function Banner({ k, title, sub }: { k: BannerKey; title: string; sub: string[] }) {
  const w = { gal: 208, menu: 233, ins: 232, rel: 223 }[k];
  const h = { gal: 148, menu: 148, ins: 171, rel: 140 }[k];
  return (
    <div className={`gn3-shop-bn gn3-shop-bn-${k}`} style={{ "--bw": w, "--bh": h } as CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="gn3-shop-bn-img" src={`${IMG}/banner_${k}.webp`} alt="" aria-hidden="true" width={w * 2} height={h * 2} loading="lazy" decoding="async" />
      <p className="gn3-shop-bn-t">{title}</p>
      <p className="gn3-shop-bn-s">
        {sub.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </p>
    </div>
  );
}

export default function ShopPage() {
  return (
    <main className="gn3-shop">
      {/* ───── ヒーロー(見本 y55〜426) ───── */}
      <section className="gn3-shop-hero" aria-label="お店の紹介">
        <div className="gn3-shop-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="gn3-shop-hero-img" src={`${IMG}/hero.webp`} alt="提灯と暖簾のある店先と、炭火で焼かれる焼き鳥" width={2172} height={742} fetchPriority="high" />
          <div className="gn3-shop-hero-txt">
            <p className="gn3-shop-catch gn3-shop-a" style={P(566, 68)}>
              {SHOP.catch.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </p>
            <h1 className="gn3-shop-name gn3-shop-a" style={P(566, 135)}>
              {SHOP.name}
            </h1>
            <ul className="gn3-shop-tags">
              {SHOP.tags.map((t, i) => (
                <li key={t} className={`gn3-shop-tag gn3-shop-tag-${i + 1} gn3-shop-a`} style={P([564, 677, 773][i], 190, [105, 88, 70][i], 30)}>
                  {t}
                </li>
              ))}
            </ul>
            <p className="gn3-shop-lead gn3-shop-a" style={P(566, 258)}>
              {SHOP.lead.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </p>
          </div>
        </div>
      </section>

      {/* ───── 営業情報の帯(見本 y426〜556) ───── */}
      <section className="gn3-shop-info" aria-label="店舗情報">
        <div className="gn3-shop-in">
          <span className="gn3-shop-div gn3-shop-a" style={P(193, 24, 1, 81)} aria-hidden="true" />
          <span className="gn3-shop-div gn3-shop-a" style={P(345, 24, 1, 81)} aria-hidden="true" />
          <span className="gn3-shop-div gn3-shop-a" style={P(527, 24, 1, 81)} aria-hidden="true" />
          <span className="gn3-shop-div gn3-shop-a" style={P(731, 24, 1, 81)} aria-hidden="true" />
          <dl className="gn3-shop-cells">
            {INFO.map((c, i) => {
              const Icon = INFO_ICONS[c.icon];
              const g = CELL[i];
              return (
                <div key={c.key} className={`gn3-shop-cell gn3-shop-cell-${c.key}`}>
                  <Icon className="gn3-shop-cell-ic gn3-shop-a" style={P(g.ix, g.iy, g.iw, g.ih)} />
                  <dt className="gn3-shop-cell-l gn3-shop-a" style={P(g.lx, 29)}>
                    {c.label}
                  </dt>
                  <dd className="gn3-shop-cell-v gn3-shop-a" style={P(g.vx, g.vy)}>
                    {c.value}
                  </dd>
                  <dd className="gn3-shop-cell-s gn3-shop-a" style={P(g.sx, g.sy)}>
                    {c.sub.map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </dd>
                </div>
              );
            })}
          </dl>
          <a className="gn3-shop-map gn3-shop-a" style={P(947, 29, 93, 70)} href="#access" aria-label="地図を見る">
            <IconMap className="gn3-shop-map-ic" />
            <span className="gn3-shop-map-t">
              {MAP_BUTTON}
              <ArrowR className="gn3-shop-map-ar" />
            </span>
          </a>
        </div>
      </section>

      {/* ───── ギャラリー 店の風景(見本 y556〜761) ───── */}
      <section className="gn3-shop-sec gn3-shop-gal" aria-labelledby="gn3-shop-h-gal">
        <div className="gn3-shop-in">
          <div className="gn3-shop-bnpos" style={P(22, -1)}>
            <h2 id="gn3-shop-h-gal" className="gn3-shop-visually-hidden">ギャラリー 店の風景</h2>
            <Banner k="gal" title="ギャラリー" sub={["店の風景"]} />
          </div>
          <Gallery />
        </div>
      </section>

      {/* ───── おすすめの一品(見本 y761〜1020) ───── */}
      <section className="gn3-shop-sec gn3-shop-menu" aria-labelledby="gn3-shop-h-menu">
        <div className="gn3-shop-in">
          <div className="gn3-shop-bnpos" style={P(24, -1)}>
            <h2 id="gn3-shop-h-menu" className="gn3-shop-visually-hidden">おすすめの一品</h2>
            <Banner k="menu" title="おすすめの一品" sub={["炭火で引き出す、", "素材のうまさ。"]} />
          </div>
          <a className="gn3-shop-menu-all gn3-shop-a" style={P(917, 12)} href="#menu">
            すべてのメニューを見る
            <ArrowR className="gn3-shop-menu-all-ar" />
          </a>
          <ul className="gn3-shop-dishes">
            {MENU.map((m, i) => (
              <li key={m.img} className="gn3-shop-dish gn3-shop-a" style={P([260, 455, 657, 860][i], 31, [179, 186, 186, 183][i])}>
                <div className="gn3-shop-dish-ph">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${IMG}/${m.img}.webp`} alt={m.alt} loading="lazy" decoding="async" />
                </div>
                <h3 className="gn3-shop-dish-n">{m.name}</h3>
                <p className="gn3-shop-dish-p">{m.price}</p>
                <p className="gn3-shop-dish-d">
                  {m.desc.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── 店内のご案内(見本 y1020〜1303) ───── */}
      <section className="gn3-shop-sec gn3-shop-ins" aria-labelledby="gn3-shop-h-ins">
        <div className="gn3-shop-ins-ext" aria-hidden="true" />
        <div className="gn3-shop-in">
          <div className="gn3-shop-bnpos" style={P(23, -1)}>
            <h2 id="gn3-shop-h-ins" className="gn3-shop-visually-hidden">店内のご案内</h2>
            <Banner k="ins" title="店内のご案内" sub={["木の温もりと、", "やさしい灯りに包まれて。"]} />
          </div>
          {/* 画像の下 1/4 には小さな写真(見本どおり重ねる)が焼き込まれている。スマホでは上 3/4 だけ見せる */}
          <div className="gn3-shop-ins-ph gn3-shop-a" style={P(169, 1, 917, 267)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="gn3-shop-ins-img" src={`${IMG}/inside.webp`} alt="木の温もりのあるカウンターと店内" width={1834} height={534} loading="lazy" decoding="async" />
          </div>
          <div className="gn3-shop-ins-txt gn3-shop-a" style={P(799, 40)}>
            <p className="gn3-shop-ins-lead">
              {SCENES.lead.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </p>
            <p className="gn3-shop-ins-body">
              {SCENES.body.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </p>
          </div>
          <ul className="gn3-shop-smalls">
            {SCENES.photos.map((s, i) => (
              <li key={s.img} className="gn3-shop-small gn3-shop-a" style={P([204, 399, 603, 836][i], 202, [184, 192, 222, 214][i], 67)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${IMG}/${s.img}.webp`} alt={s.label} loading="lazy" decoding="async" />
                <span className="gn3-shop-small-c">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── 関連記事(見本 y1303〜1448) ───── */}
      <section className="gn3-shop-sec gn3-shop-rel" aria-labelledby="gn3-shop-h-rel">
        <div className="gn3-shop-in">
          <div className="gn3-shop-bnpos" style={P(24, 0)}>
            <h2 id="gn3-shop-h-rel" className="gn3-shop-visually-hidden">関連記事</h2>
            <Banner k="rel" title="関連記事" sub={["この店の、", "もっと深い話。"]} />
          </div>
          <article className="gn3-shop-col">
            <div className="gn3-shop-col-ph gn3-shop-a" style={P(262, 15, 233, 112)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${IMG}/related.webp`} alt="炭火の前で串を焼く店主" loading="lazy" decoding="async" />
            </div>
            <p className="gn3-shop-col-tag gn3-shop-a" style={P(516, 17, 55, 23)}>
              {COLUMN.tag}
            </p>
            <h3 className="gn3-shop-col-t gn3-shop-a" style={P(517, 49)}>
              {COLUMN.title.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h3>
            <p className="gn3-shop-col-d gn3-shop-a" style={P(517, 99)}>
              {COLUMN.desc}
            </p>
            <a className="gn3-shop-col-a gn3-shop-a" style={P(948, 66)} href="/proto-gourmet/n3/feature/sample">
              {COLUMN.link}
              <ArrowR className="gn3-shop-col-ar" />
            </a>
          </article>
        </div>
      </section>
    </main>
  );
}

// 営業情報の各セル(見本の座標。y は帯の上端 426 からの値)。ix/iy/iw/ih = アイコン、lx = ラベル x、vx/vy = 値、sx/sy = 補足
const CELL = [
  { ix: 58, iy: 26, iw: 19, ih: 19, lx: 85, vx: 60, vy: 58, sx: 60, sy: 83 },
  { ix: 218, iy: 27, iw: 18, ih: 18, lx: 249, vx: 247, vy: 59, sx: 246, sy: 82 },
  { ix: 373, iy: 28, iw: 21, ih: 17, lx: 407, vx: 374, vy: 59, sx: 375, sy: 83 },
  { ix: 549, iy: 27, iw: 19, ih: 19, lx: 582, vx: 579, vy: 60, sx: 581, sy: 84 },
  { ix: 755, iy: 28, iw: 14, ih: 18, lx: 784, vx: 777, vy: 57, sx: 778, sy: 79 },
] as const;
