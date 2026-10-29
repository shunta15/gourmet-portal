/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CSSProperties } from "react";
import { torn, poly, type Pt } from "./torn";
// 決まった言葉(machi2/copy.ts)。言い換えない・足さない・削らない
import { P2 } from "../machi2/copy";
// 総合の特集一覧 /special(総合トップ本体と同じ行き先)
import { HREF_SPECIAL, IMG as P4IMG, Arrow as P4Arrow } from "../p4/P4Chrome";
// 総合の店舗紹介(8 業種それぞれの店舗紹介への入口。app/shop。2026-10-29 新設)
const HREF_SHOP = "/shop";

// 総合トップ(見本4)の「下半分」を、見本1(紙のコラージュ)の下半分の作りで組んだ試作。
// 座標は見本1(1122px 幅)の画素 × var(--u)。紙・写真・手書きの飾りは見本1の試作(proto/hub-next)の部品。上半分と関係なく、この部品だけを差し替える。
// 中身は実在のものだけ: 特集 3 本 = 本番の記事(題名・写真・リンク)/ 新着情報 4 件 = git log で日付を確かめた出来事 / 決まった言葉 = copy.ts。
// 仮のもの(見本1の試作のまま): 街のひとの写真と縦書き・新着情報の写真・街の写真の帯。
const IMG = "/_portal/hproto/p4lower/";

type V = Record<string, string | number>;
const sty = (o: V): CSSProperties => o as CSSProperties;

/** 節の左上(y0)から測る座標の組み立て。a = 箱(x,y,w,h)、t = 文字(x, 1 行目の中心の y, 字の大きさ, 行の高さ)。 */
function S(y0: number) {
  const r = (n: number) => +n.toFixed(2);
  return {
    a: (x: number, y: number, w?: number, h?: number, more: V = {}) => sty({ "--x": r(x), "--y": r(y - y0), ...(w != null ? { "--w": r(w) } : {}), ...(h != null ? { "--h": r(h) } : {}), ...more }),
    t: (x: number, cy: number, fs: number, lh: number, more: V = {}) => sty({ "--x": r(x), "--y": r(cy - lh / 2 - y0), "--fs": fs, "--lh": lh, ...more }),
  };
}

function Arrow({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={`pl-arrow ${className}`} style={style} viewBox="0 0 12 6" aria-hidden="true">
      <path d="M0 3h11M8.4.5 11.4 3 8.4 5.5" fill="none" stroke="currentColor" strokeWidth=".7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ───── 中身(実在のもの) ─────
// 特集 大 = グルメの特集(まとめ記事)。写真は記事の og:image と同じ(restaurants/teleapo-わかしろ/hero.jpg)
const F_MAIN = {
  href: "/feature/scene-lunch-kyoto",
  img: "/restaurants/teleapo-%E3%82%8F%E3%81%8B%E3%81%97%E3%82%8D/hero.jpg",
  head: ["京都のランチ、", "昼の営業が終わる時刻で選ぶ6軒"],
  body: ["ランチの店を決めるとき、何を食べるかより先に、", "昼の営業が何時で終わるかが効いてくる。", "京都市内の5つの区にある6軒。"],
};
// 特集 小 2 本 = 店の特集記事(くらし・ステイ)。写真は記事の og:image と同じ
const F_SMALL = [
  { href: "/life/article/li0004", img: "/_portal/vshops/life-2510/s2.jpg", tag: "くらし", head: "天童の将棋駒専門店、中島清吉商店で知る駒づくりと書き駒体験", body: "明治10年創業の将棋駒の専門店です。" },
  { href: "/stay/article/st0005", img: "/_portal/vshops/lodging-8/s8.jpg", tag: "ステイ", head: "長野県野沢温泉村の山のホテル大瀧", body: "長坂ゴンドラ乗り場の目の前にある小さなホテル。" },
] as const;
// 新着情報 = サイトで実際にあった出来事。日付は git log(main へ入った日)で確認。リンクは実在のページ
const NEWS: [string, string, string, string, string][] = [
  ["2026.10.29", "お知らせ", "g", "総合トップを新しくしました", "/"],
  ["2026.10.28", "動画", "b", "動画のページを全業種共通にしました", "/videos"],
  ["2026.10.26", "くらし", "b", "くらしのページを新しくしました", "/life"],
  ["2026.10.25", "スポーツ", "g", "スポーツのページを新しくしました", "/sports"],
];
// 利用シーンの行き先 = 本番の総合トップ(p4/P4Home.tsx の SCENES)と同じ。写真は p4 の n_s0〜n_s3_hq。友人と = グルメの絞り込み / 家族と = アクティビティ / ひとりで = ボディケア / ペットと = ペット
const SCENES: [string, string, string][] = [
  ["友人と", "楽しむ", "/search?scene=group"],
  ["家族と", "おでかけ", "/activity"],
  ["ひとりで", "ゆっくり", "/bodycare"],
  ["ペットと", "一緒に", "/pet"],
];
// 水色の札の言葉 = 決まった言葉 P2(一字一句そのまま。本番と同じく 1 行目は「、」で 2 行に分けるだけ)
const P2_LINES = P2.split("\n");

export default function Lower() {
  const feat = S(664);
  const peo = S(1003);

  // 紙(破れた縁の多角形 + 地の質感 + 影)。box = 見本の座標の箱、verts = その中の多角形(見本の座標)。y は節の左上(y0)から測り直す
  const P = (y0: number, box: [number, number, number, number], verts: Pt[], seed: number, o: { amps?: number | number[]; step?: number; color?: string; shadow?: boolean; className?: string; plain?: boolean } = {}) => {
    const [x, y, w, h] = box;
    return (
      <div className={`pl-a pl-pwrap${o.shadow === false ? "" : " pl-sh"} ${o.className ?? ""}`} style={sty({ "--x": x, "--y": +(y - y0).toFixed(2), "--w": w, "--h": h })} aria-hidden="true">
        <div className={`pl-fill pl-paper${o.plain ? "" : " pl-g"}`} style={{ clipPath: torn(box, verts, seed, o.amps ?? 1, o.step), ["--pc" as string]: o.color ?? "#ece8e1" } as CSSProperties} />
      </div>
    );
  };

  return (
    <div className="pl-root">
      <div className="pl-page">
        {/* ───────── 特集記事 ───────── */}
        <section className="pl-sec pl-feat" style={sty({ "--h": 339 })} aria-label="特集記事">
          <i className="pl-featbleed" aria-hidden="true" />
          {P(664, [0, 664, 268, 340], [[0, 677], [95, 667], [200, 673], [268, 681], [268, 1002], [0, 1000]], 41, { amps: [0, 1, 1, 0, 1.5, 0], step: 12, color: "#faf8f2", shadow: false, className: "pl-featleft" })}
          <h2 className="pl-t pl-feat-h" style={feat.t(30, 768, 34, 44)}>特集記事</h2>
          <p className="pl-t pl-feat-lead" style={feat.t(31.5, 849.5, 14.5, 25)}>マチノワで紹介しているお店の<br />特集記事をまとめています。</p>
          <Link className="pl-a pl-btn pl-feat-btn" href={HREF_SPECIAL} style={feat.a(31, 914, 186, 38)}>特集をもっと見る<Arrow /></Link>

          <div className="pl-fmain">
            <span className="pl-a pl-feat-main" style={feat.a(268, 682, 463, 330)}>
              <img src={F_MAIN.img} alt="" width={960} height={960} loading="lazy" style={{ clipPath: poly([268, 682, 463, 330], [[268, 682], [731, 682], [731, 1012], [268, 1000]]) }} />
              <i className="pl-shade" aria-hidden="true" />
            </span>
            <span className="pl-a pl-sptag" style={feat.a(289.5, 787, 52, 21)}>特集</span>
            <h3 className="pl-t pl-feat-mh" style={feat.t(290.5, 837, 24.5, 35.5)}>{F_MAIN.head[0]}<br />{F_MAIN.head[1]}</h3>
            <p className="pl-t pl-feat-mp" style={feat.t(290.5, 912.5, 12, 20.5)}>{F_MAIN.body[0]}<br />{F_MAIN.body[1]}<br />{F_MAIN.body[2]}</p>
            <p className="pl-t pl-viewmore" style={feat.t(291, 980.5, 10.5, 14)}>続きを見る<Arrow /></p>
            <Link className="pl-a pl-cover" href={F_MAIN.href} style={feat.a(268, 682, 463, 330)} aria-label={F_MAIN.head.join("")} />
          </div>

          {P(664, [731, 674, 391, 338], [[731, 674], [1122, 674], [1122, 1012], [731, 1012]], 43, { amps: 0, color: "#faf8f2", shadow: false, className: "pl-featright" })}
          {F_SMALL.map((c, i) => {
            const y = i ? 853 : 682; // 写真の上端
            const boxY = i ? 851 : 680; // 紙の上端
            const boxH = i ? 161 : 168;
            return (
              <div key={c.href} className="pl-fs" style={{ display: "contents" }}>
                <Link className="pl-a pl-feat-s" href={c.href} style={feat.a(741, y, i ? 210 : 209, 159)} aria-label={c.head}>
                  <img src={c.img} alt="" width={1200} height={600} loading="lazy" />
                </Link>
                {P(664, [950, boxY, 172, boxH], i ? [[950, 853], [1122, 850], [1122, 1012], [950, 1012]] : [[950, 683], [1122, 679], [1122, 848], [950, 847]], i ? 53 : 47, { amps: i ? [1.5, 0, 0, 0] : [1.5, 0, 0.8, 0], step: 10, color: "#fdfcfa", shadow: false, plain: true, className: "pl-fcard" })}
                <Link className="pl-a pl-fc" href={c.href} style={feat.a(958, boxY + 9, 156, boxH - (i ? 32 : 20))}>
                  <span className="pl-subtag">{c.tag}</span>
                  <h3 className="pl-fc-h">{c.head}</h3>
                  <p className="pl-fc-p">{c.body}</p>
                  <Arrow className="pl-fc-ar" />
                </Link>
              </div>
            );
          })}
        </section>

        {/* ───────── 街のひと + 新着情報 ───────── */}
        <section className="pl-sec pl-pn" style={sty({ "--h": 219 })} aria-label="街のひと・新着情報">
          {P(1003, [0, 1003, 492, 244], [[0, 1006], [60, 1004], [300, 1003], [492, 1004], [492, 1227], [450, 1230.5], [380, 1234], [300, 1237], [200, 1241], [100, 1243.5], [0, 1246]], 61, { amps: [1, 1, 1, 0, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 0], step: 12, color: "#faf8f2", shadow: false, className: "pl-pback" })}
          {/* 店舗紹介の欄(2026-10-29 オーナー指示で「特集記事」の欄を替えた。本番の総合トップ p4 の「特集記事」の段の左と中央の形を、そのまま縮めて置いた。小さな英字 FEATURE と筆記体 Connect The Town は、試作の「英語は外す」に合わせて出さない) */}
          <div className="pl-a pl-about" style={peo.a(30, 1008, 452, 210)}>
            <div className="pl-about-l">
              <div className="pl-about-text">
                <h2 className="p4-h4">店舗紹介</h2>
                <p className="p4-small">マチノワで紹介しているお店を<br />まとめています。</p>
                <Link href={HREF_SHOP} className="p4-btn">店舗紹介を見る<P4Arrow /></Link>
              </div>
              <img src={P4IMG + "n_art_people.webp"} alt="" className="p4-people" width={114} height={136} loading="lazy" />
            </div>
            <div className="pl-about-c">
              <img src={P4IMG + "n_city.webp"} alt="" className="p4-city" width={260} height={200} loading="lazy" style={{ clipPath: "url(#p4c-city)" }} />
            </div>
          </div>

          {P(1003, [484, 1003, 638, 222], [[484, 1021], [494, 1009], [503, 1021], [512, 1011], [517, 1006], [1122, 1004], [1122, 1216], [1010, 1221], [740, 1223], [484, 1222]], 71, { amps: [0.8, 0.8, 0.8, 0.8, 0.8, 0, 1.2, 1.2, 1.2, 0.8], step: 14, color: "#fdfcfa", plain: true, className: "pl-npanel" })}
          <h2 className="pl-t pl-news-h" style={peo.t(515.5, 1051, 24, 32)}>新着情報</h2>
          <Link className="pl-a pl-btn pl-news-btn" href="#" style={peo.a(919, 1039, 170, 26)}>新着情報をもっと見る<Arrow /></Link>
          <ul className="pl-news">
            {NEWS.map(([d, tag, tone, title, href], i) => {
              const cy = 1094.5 + 32.3 * i;
              return (
                <li key={d}>
                  <Link className="pl-newsrow" href={href}>
                    <time className="pl-t pl-nd" style={peo.t(516.5, cy + 1, 11, 14)}>{d}</time>
                    <span className={`pl-a pl-chip pl-chip-${tone}`} style={peo.a(590, cy - 9, 72, 18)}>{tag}</span>
                    <span className="pl-t pl-nt" style={peo.t(685, cy - 1, 12, 16)}>{title}</span>
                  </Link>
                  <i className="pl-a pl-nline" style={peo.a(515, cy + 16, 574, 1)} aria-hidden="true" />
                </li>
              );
            })}
          </ul>
          <img className="pl-a pl-autumn" src={`${IMG}autumn.webp`} alt="" width={207} height={137} loading="lazy" style={peo.a(905, 1075, 207, 137)} />
        </section>

        {/* ───────── 利用シーン + 水色の札(本番の総合トップ p4 の「こんなシーンで楽しめる。」と「ひとつの店との出会い…」の札を横に並べた。街並みの帯と入れ替え。小さな英字 SCENE は出さない) ───────── */}
        <section className="pl-sw" aria-label="利用シーンとマチノワのつながり">
          <div className="pl-sw-scene">
            <h2 className="pl-sw-h3">こんなシーンで楽しめる。</h2>
            <p className="pl-sw-small">日常のあらゆるシーンで、マチノワがあなたの街時間を彩ります。</p>
            <div className="pl-sw-scenes">
              {SCENES.map(([a, b, href], i) => (
                <Link key={a} href={href} className="pl-sw-scene-i">
                  <img src={P4IMG + "n_s" + i + "_hq.webp"} alt="" width={434} height={531} loading="lazy" style={{ borderRadius: i % 2 ? "44% 44% 38% 38% / 30% 30% 22% 22%" : "46% 46% 36% 36% / 28% 28% 24% 24%" }} />
                  <span>{a}<br />{b}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="pl-sw-blue">
            <img src={P4IMG + "n_art_cam.webp"} alt="" className="pl-sw-cam" width={116} height={104} loading="lazy" />
            <div>
              <h2 className="pl-sw-h4">{(P2_LINES[0].match(/[^、]+、/g) ?? [P2_LINES[0]]).map((t, i) => (i ? [<br key={"b" + i} />, t] : t))}</h2>
              <p className="pl-sw-small">{P2_LINES[1]}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
