import type { CSSProperties } from "react";
import Link from "next/link";
import { SHAPES } from "../p4/shapes";
import { IMG, HREF_SPECIAL, CATS, CAT_R, Arrow, P4Header, P4Footer } from "../p4/P4Chrome";
// 決まった言葉(発注者の決定。言い換えない・足さない・削らない)。machi2/copy.ts は proto-portal/hub-concepts/COPY-FINAL.md の写し
import { CATCH, HEAD, P1_ONE, P2, P3 } from "../machi2/copy";
import P4Motion from "./P4Motion";
import "./p4motion.css";

// 総合トップの試作「見本4(丸い切り抜き)」の横型(PC)版。
// 見本(1024×1536 の縦長)を画面幅で引き伸ばさず、ヒーローだけ見本の座標(--u = 見本の 1px、最大 1.2px)で組み、
// そのほかの段は普通の大きさの文字で横に組む。768px 前後より狭いときは縦に積む。
// 2026-10-29 本番用に、仮の # や文字を今ある実在のページへ置き換えた(配置・札の枚数・形・色は試作のまま)。リンク先の表は下の HREF_* にまとめてある。
const U = (n: number) => `calc(var(--u) * ${n})`;
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
// 札の字を白い長方形の真ん中に置くための寄せ [PC の横 tx, PC の縦 ty, スマホの横, スマホの縦](単位 em。+ = 右・下)。
// 縦書きの「、」は字の枠の右上に小さく乗るので、枠だけを真ん中にすると見た目の字(インク)が上に寄る。字のインクの縦横の余白が等しくなるよう、Playwright で 1440 と 390 の両方を実測して決めた。
const LABEL_OFFS: Record<string, [number, number, number, number]> = {
  "食べて、": [-0.035, 0.408, -0.004, 0.371],
  "動いて、": [-0.027, 0.41, -0.01, 0.397],
  "癒されて、": [-0.04, 0.38, -0.011, 0.359],
  "キレイになって、": [0.358, -0.02, 0.081, 0.077],
  "出かけて、": [-0.055, 0.373, -0.044, 0.362],
  "楽しんで、": [-0.023, 0.395, -0.001, 0.414],
  "泊まって、": [-0.035, 0.404, -0.005, 0.386],
  "整えて、": [-0.021, 0.385, -0.01, 0.381],
};
// 大見出し(決まったキャッチコピー HEAD の 3 行)の 1 字ずつの揺れ [大きさ(倍), 傾き(度), 上下(em)]。見本は筆ペン風の手書きで、字の大きさがそろわず少し踊っている。字は HEAD から取る(ここには字を書かない)
const H1_WOBBLE: [number, number, number][][] = [
  [[1.08, -2, -0.02], [0.9, 3, 0], [1.04, -2, 0.02], [0.96, 3, -0.03], [1.06, -3, 0], [0.88, 3, 0.02], [1.02, -2, 0], [0.95, 0, 0]],
  [[1.1, -3, 0], [0.96, 2, 0.03], [1.04, -3, 0], [1.0, 2, 0.02], [1.06, -2, -0.02], [0.92, 3, 0.03], [0.98, 0, 0]],
  [[1.0, -2, 0.02], [1.04, 3, 0], [0.94, -2, 0.03], [1.04, 3, -0.02], [1.0, -2, 0], [0.96, 2, 0.02], [0.95, 0, 0]],
];
const H1: [string, number, number, number][][] = HEAD.map((line, li) => [...line].map((ch, ci) => [ch, ...H1_WOBBLE[li][ci]] as [string, number, number, number]));
// 丸い札・下の青い札の言葉は、決まった言葉を切り分けただけ(字は変えない)
const BADGE_LINES = P1_ONE.match(/[^。]+。/g) ?? [P1_ONE]; // 店と出会う。/人とつながる。/輪が広がる。
const P2_LINES = P2.split("\n"); // 1 行目 = 青い札の見出し / 2 行目 = 本文
const P3_LINES = P3.split("\n"); // ヒーローの小文(2 行)
// 利用シーンの行き先(2026-10-29 オーナー指示: グルメは 1 つだけ残し、ほかは総合らしい行き先へ)。友人と = グルメの絞り込み(group 77 店) / 家族と = アクティビティ / ひとりで = ボディケア / ペットと = ペット
const SCENES: [string, string, string][] = [
  ["友人と", "楽しむ", "/search?scene=group"],
  ["家族と", "おでかけ", "/activity"],
  ["ひとりで", "ゆっくり", "/bodycare"],
  ["ペットと", "一緒に", "/pet"],
];

export default function P4MotionHome() {
  const allShapes = [...HERO, "story", "city"] as const;
  return (
    <div className="p4-page p4m">
      <P4Motion />
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

      <P4Header />

      {/* ヒーロー */}
      <section className="p4-hero" aria-label="ヒーロー">
        <div className="p4-hero-text">
          <h1 className="p4-h1" aria-label={CATCH}>
            {H1.map((line, li) => (
              <span key={li} aria-hidden>
                {line.map(([ch, s, r, dy], ci) => (
                  <i key={ci} className="p4m-ch" style={{ fontSize: `${s}em`, transform: `translateY(${dy}em) rotate(${r}deg)`, "--i": li * 8 + ci } as CSSProperties}>{ch}</i>
                ))}
              </span>
            ))}
          </h1>
          <p className="p4-lead p4m-lead">
            {P3_LINES[0]}<br />{P3_LINES[1]}
          </p>
        </div>
        {/* 街並みの線画(2026-10-29 高画質版 2000×667・背景を透明にした webp)。窓(.p4-street)は元の切り出しと同じ位置・同じ範囲で、左は画面の端まで届き、写真のブロブの下に重なる */}
        <div className="p4-street p4m-street" aria-hidden>
          <img src={IMG + "n_art_street_hq.webp"} alt="" width={2000} height={667} />
        </div>
        <div className="p4-collage p4m-collage">
          {HERO.map((k, bi) => {
            const s = SHAPES[k];
            const pos = { left: U(s.x - OX), top: U(s.y - OY), width: U(s.w), height: U(s.h) };
            const fill = { left: 0, top: 0, width: "100%", height: "100%", clipPath: `url(#p4c-${k})` };
            const hi = HIRES[k];
            // 動きのための入れ物(位置・大きさは元のブロブと同じ): blobw = 登場(ポップイン) / tilt = ホバーの傾き / breath = 呼吸 / shadow = ホバーの影(切り抜きの形)
            const photo = !hi ? (
              <img src={IMG + "n_" + k + ".webp"} alt="" className="p4-blob" style={fill} />
            ) : (
              <div className="p4-blob" style={fill}>
                <img src={IMG + "n_" + k + ".webp"} alt="" className="p4-blob-img" width={1536} height={1024} style={{ width: `${(1536 / hi[2]) * 100}%`, left: `${(-hi[0] / hi[2]) * 100}%`, top: `${(-hi[1] / hi[3]) * 100}%` }} />
              </div>
            );
            return (
              <div key={k} className="p4m-blobw" data-tilt="blob" style={{ ...pos, "--i": bi } as CSSProperties}>
                <div className="p4m-tilt">
                  <div className="p4m-breath" style={{ "--b": bi } as CSSProperties}>
                    <span className="p4m-shadow" aria-hidden><i style={{ clipPath: `url(#p4c-${k})` }} /></span>
                    {photo}
                  </div>
                </div>
              </div>
            );
          })}
          {LABELS.map(([cx, cy, w, h, t, r, href, mx, my], li) => (
            <Link
              key={cx + "-" + cy}
              href={href}
              className={"p4-label p4m-label " + (r ? "p4-label-h" : "p4-label-v")}
              style={{ "--x": U(cx - OX), "--y": U(cy - OY), "--w": U(w), "--h": U(h), "--n": t.length, "--r": `${r}deg`, ...(mx ? { "--mx": U(mx - OX), "--my": U((my ?? cy) - OY) } : {}), "--li": li, "--tx": LABEL_OFFS[t][0], "--ty": LABEL_OFFS[t][1], "--mtx": LABEL_OFFS[t][2], "--mty": LABEL_OFFS[t][3] } as CSSProperties}
            >
              <span className="p4-label-t">{r ? <>キレイに<br className="p4-br" />なって、</> : t}</span>
            </Link>
          ))}
          <div className="p4-badge p4m-badge" style={{ left: U(620 - OX), top: U(212 - OY), width: U(180), height: U(180) }}>
            <div className="p4m-float">
            <svg viewBox="0 0 180 180" width="100%" height="100%" aria-hidden>
              <path d="M90 2C140 1 179 40 178 91C177 141 138 179 88 178C38 177 1 139 2 89C3 40 42 3 90 2Z" fill="#faf8f2" stroke="#5a554f" strokeWidth="1.1" />
            </svg>
            <span className="p4-badge-t">
              <span style={{ display: "block", transform: "translateX(2px)" }}>{BADGE_LINES[0]}</span>
              <span style={{ display: "block", transform: "translateX(-3px)" }}>{BADGE_LINES[1]}</span>
              <span style={{ display: "block", transform: "translateX(1px)" }}>{BADGE_LINES[2]}</span>
            </span>
            <span className="p4-badge-en">MACHINOWA</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8つのカテゴリー */}
      <section className="p4-catsec" aria-label="カテゴリー">
        <div className="p4-catsec-head p4m-io">
          <div className="p4-catsec-title">
            <p className="p4-en p4m-r">CATEGORY</p>
            <h2 className="p4-h2 p4m-mask">8つのカテゴリーから見つける、街の楽しみ方。</h2>
          </div>
          <p className="p4-sub p4m-r" style={{ "--d": "0.3s" } as CSSProperties}>グルメからくらしまで、あなたの「好き」がきっと見つかる。</p>
        </div>
        <div className="p4-cats p4m-io">
          {CATS.map(([k, ja, en], i) => (
            <Link key={k} href={"/" + k} className="p4-cat p4m-r" data-tilt="card" style={{ "--d": `${i * 0.09}s` } as CSSProperties}>
              <div className="p4m-img" style={{ borderRadius: CAT_R[i % 4] }}>
                <img src={IMG + "n_cat_" + k + ".webp"} alt="" style={{ borderRadius: CAT_R[i % 4] }} />
              </div>
              <span className="p4-cat-ja">{ja}</span>
              <span className="p4-cat-en">{en}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 街のストーリー / シーン */}
      <section className="p4-duo" aria-label="街のストーリーとシーン">
        <div className="p4-story-cell p4m-io">
          <img src={IMG + "n_story.webp"} alt="" className="p4-story-img p4m-r" style={{ clipPath: "url(#p4c-story)", "--d": "0.1s" } as CSSProperties} />
          <div className="p4-story-body">
            <h2 className="p4-h3 p4m-mask">街のストーリー</h2>
            <p className="p4-small p4m-r" style={{ "--d": "0.25s" } as CSSProperties}>お店・人・街の魅力を紡ぐ<br />読みものコンテンツ。</p>
            <Link href={HREF_SPECIAL} className="p4-btn p4m-r" style={{ "--d": "0.4s" } as CSSProperties}>特集をみる<Arrow /></Link>
          </div>
          <span className="p4-script p4-script-story p4m-r" style={{ "--d": "0.55s" } as CSSProperties}>Special<br /><span style={{ marginLeft: 30 }}>Contents</span></span>
        </div>
        <div className="p4-scene-cell p4m-io">
          <p className="p4-en p4m-r">SCENE</p>
          <h2 className="p4-h3 p4m-mask">こんなシーンで楽しめる。</h2>
          <p className="p4-small p4m-r" style={{ "--d": "0.2s" } as CSSProperties}>日常のあらゆるシーンで、マチノワがあなたの街時間を彩ります。</p>
          <div className="p4-scenes">
            {SCENES.map(([a, b, href], i) => (
              <Link key={a} href={href} className="p4-scene p4m-r" data-tilt="card" style={{ "--d": `${0.3 + i * 0.12}s` } as CSSProperties}>
                <div className="p4m-img" style={{ borderRadius: i % 2 ? "44% 44% 38% 38% / 30% 30% 22% 22%" : "46% 46% 36% 36% / 28% 28% 24% 24%" }}>
                  <img src={IMG + "n_s" + i + "_hq.webp"} alt="" style={{ borderRadius: i % 2 ? "44% 44% 38% 38% / 30% 30% 22% 22%" : "46% 46% 36% 36% / 28% 28% 24% 24%" }} />
                </div>
                <span>{a}<br />{b}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 特集記事(2026-10-29 「ABOUT マチノワについて」の段を替えた。並び・絵・写真・札は変えず文字だけ) */}
      <section className="p4-about p4m-io" id="feature" aria-label="特集記事">
        <div className="p4-about-l">
          <div className="p4-about-text">
            <p className="p4-en p4m-r">FEATURE</p>
            <h2 className="p4-h4 p4m-mask">特集記事</h2>
            <p className="p4-small p4m-r" style={{ "--d": "0.2s" } as CSSProperties}>マチノワで紹介しているお店の<br />特集記事をまとめています。</p>
            <Link href={HREF_SPECIAL} className="p4-btn p4m-r" style={{ "--d": "0.35s" } as CSSProperties}>特集記事を見る<Arrow /></Link>
          </div>
          <img src={IMG + "n_art_people.webp"} alt="" className="p4-people p4m-r" style={{ "--d": "0.2s" } as CSSProperties} />
        </div>
        <div className="p4-about-c">
          <img src={IMG + "n_city.webp"} alt="" className="p4-city p4m-r p4m-par" data-par="0.05" style={{ clipPath: "url(#p4c-city)", "--d": "0.15s" } as CSSProperties} />
          <span className="p4-script p4-script-town p4m-r" style={{ "--d": "0.5s" } as CSSProperties}>Connect<br /><span style={{ marginLeft: 26 }}>The Town</span></span>
        </div>
        <div className="p4-blue p4m-r" style={{ "--d": "0.3s" } as CSSProperties}>
          <img src={IMG + "n_art_cam.webp"} alt="" className="p4-cam" />
          <div>
            <h2 className="p4-h4">{(P2_LINES[0].match(/[^、]+、/g) ?? [P2_LINES[0]]).map((t, i) => (i ? [<br key={"b" + i} />, t] : t))}</h2>
            <p className="p4-small">{P2_LINES[1]}</p>
          </div>
        </div>
      </section>

      <P4Footer />
    </div>
  );
}
