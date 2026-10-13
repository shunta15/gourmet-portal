import "./bodyshop.css";
import "./shop-c.css";
import Link from "next/link";
import { KZ_FONT_CLASSES } from "../korogashi/fonts";
import FloorFx from "./FloorFx";
import { BsBody, BsCrumb, BsFacts, BsHeader, BsImg, BsMenu, BsMoreShops, KIND_EN, nameSize } from "./Shared";
import type { BsShop } from "@/lib/portal/vert/bodyshop/model";

/**
 * 案 C「転がる」: 木の床の上に紙を置いていく作り。画面の下の床に、丸めたマット・玉・竹の輪が転がっている。
 * 開くと同時に、画面の上から落ちてきて床で転がる。スクロールすると床が傾き(ページの紙も少し傾く)、物が転がる。指でつかんで投げる・なぞって転がす。
 * 仕組み: FloorFx(クライアント。データは持たない)が、円の物理(重力・床・壁・円どうしのぶつかり・転がり摩擦)を実時間で進めて canvas に描く。
 *   動くのは落ち着くまでの間と、スクロール・指のあいだだけ(止まれば描画も止める)。
 * JS なし・動きを減らす設定・WebGL なしでも読める: 床の帯だけ出す(物は描かない)。
 */
/** 床の物(PC 6 つ・スマホ 4 つ)。k/mk は大きさの倍率(PC/スマホ)、mi はスマホでの並び順。FloorFx の spec と同じ */
const PH: { k: number; mk?: number; mi: number; c: string }[] = [
  { k: 1, mk: 1, mi: 0, c: "var(--mat)" },
  { k: 0.82, mk: 0.9, mi: 1, c: "#d8ceb8" },
  { k: 0.82, mi: -1, c: "#7f8864" },
  { k: 0.46, mk: 0.62, mi: 2, c: "#d9b88a" },
  { k: 0.4, mi: -1, c: "#c9d0c8" },
  { k: 0.62, mk: 0.8, mi: 3, c: "#7f8f5a" },
];

export default function ShopC({ shop, v }: { shop: BsShop; v: number }) {
  const ph = shop.photos;
  const kindNo = String(Math.max(1, ["seitai", "sekkotsu", "shinkyu", "massage", "relaxation", "stretch"].indexOf(shop.kindSlug) + 1)).padStart(2, "0");
  return (
    <div suppressHydrationWarning className={`bs bs-floor bc ${KZ_FONT_CLASSES}`} data-bc style={{ ["--mat" as string]: shop.color }}>
      <script dangerouslySetInnerHTML={{ __html: "var r=document.currentScript.parentElement;r.classList.add('bc-js');if(matchMedia('(prefers-reduced-motion: reduce)').matches)r.classList.add('bc-still');setTimeout(function(){r.classList.add('bc-late')},4000)" }} />
      <BsHeader />
      <main className="bc-main">
        <section className={`bc-hero${ph.length === 0 ? " no-ph" : ""}`} id="bs-top" aria-label="店の紹介">
          <div className="bc-hero-copy">
            <BsCrumb shop={shop} />
            <p className="bc-tag">
              <i>No.{kindNo}</i>
              <b>{shop.kindName}</b>
              <em>{KIND_EN[shop.kindSlug] ?? ""}</em>
            </p>
            <h1 className={`bc-name sz-${nameSize(shop.name.length)}`}>{shop.name}</h1>
            {shop.kana && <p className="bc-kana">{shop.kana}</p>}
            <p className="bc-area">
              {shop.prefName}
              {shop.city ? `　${shop.city}` : ""}
            </p>
            {shop.headline && <p className="bc-head">{shop.headline}</p>}
          </div>
          {ph.length > 0 && (
            <div className={`bc-prints bc-prints-${Math.min(ph.length, 3)}`}>
              {ph.slice(0, 3).map((p, i) => (
                <figure key={p.src} className="bc-print" style={{ ["--i" as string]: i }}>
                  <BsImg p={p} eager={i === 0} sizes="(max-width: 900px) 70vw, 34vw" />
                </figure>
              ))}
            </div>
          )}
        </section>

        {shop.panels.map((p, i) => {
          const pic = ph[i + 3];
          return (
            <section key={p.no} id={`bs-sec-${i}`} className="bc-card" data-bc-card style={{ ["--r" as string]: `${i % 2 ? 0.5 : -0.5}deg` }}>
              <p className="bc-no">
                <i>No.{p.no}</i>
                <b>{p.label}</b>
              </p>
              <h2 className="bc-h">{p.heading}</h2>
              {p.sub && <p className="bc-sub">{p.sub}</p>}
              <BsBody p={p} />
              {pic && (
                <figure className="bc-print bc-print-in" style={{ ["--i" as string]: i % 2 }}>
                  <BsImg p={pic} sizes="(max-width: 900px) 80vw, 36vw" />
                </figure>
              )}
            </section>
          );
        })}
        {ph.length > shop.panels.length + 3 && (
          <section className="bc-card" data-bc-card aria-label="写真" style={{ ["--r" as string]: "0.4deg" }}>
            <ul className="bc-gal">
              {ph.slice(shop.panels.length + 3).map((p, i) => (
                <li key={p.src} style={{ ["--i" as string]: i % 2 }}>
                  <BsImg p={p} sizes="(max-width: 900px) 44vw, 22vw" />
                </li>
              ))}
            </ul>
          </section>
        )}

        {shop.hasStory && (shop.quote || shop.closing.length > 0) && (
          <section className="bc-card bc-quote" data-bc-card style={{ ["--r" as string]: "-0.4deg" }}>
            {shop.quote && (
              <blockquote>
                <p>{shop.quote}</p>
                {shop.quoteCite && <cite>{shop.quoteCite}</cite>}
              </blockquote>
            )}
            {shop.closing.map((t, i) => (
              <p key={i} className="bc-closing">
                {t}
              </p>
            ))}
          </section>
        )}

        {shop.menus.length > 0 && (
          <section className="bc-card" data-bc-card style={{ ["--r" as string]: "0.5deg" }}>
            <p className="bc-no">
              <i>MENU</i>
              <b>メニュー</b>
            </p>
            <h2 className="bc-h">メニュー</h2>
            <BsMenu shop={shop} />
          </section>
        )}

        <section id="bs-access" className="bc-card bc-access" data-bc-card style={{ ["--r" as string]: "-0.3deg" }}>
          <p className="bc-no">
            <i>INFO</i>
            <b>店舗情報</b>
          </p>
          <h2 className="bc-h">店舗情報</h2>
          <BsFacts shop={shop} />
        </section>

        <section className="bc-card bc-more" data-bc-card style={{ ["--r" as string]: "0.3deg" }}>
          <BsMoreShops shop={shop} v={v} />
          <p className="bc-back">
            <Link href="/bodycare">ボディケアのトップへ</Link>
          </p>
        </section>
      </main>

      {/* 画面の下の床の帯(壁と木の床)。物はこの帯の中だけで転がる(開いた直後だけ、上から落ちてくる)。指でつかんで投げる。物は canvas に描く */}
      <div className="bc-ledge" data-bc-ledge aria-hidden="true">
        <i className="bc-fade" />
        {/* JS が動き出すまで(と、JS なし・動きを減らす設定のとき)の物。CSS だけで落ちて弾む。FloorFx が起動したら、同じ位置から物理に引き継ぐ */}
        {PH.map((p, i) => (
          <i key={i} className="bc-ph" data-m={p.mk ? "1" : "0"} style={{ ["--k" as string]: p.k, ["--mk" as string]: p.mk ?? 0, ["--fx" as string]: (i + 0.5) / 6, ["--fm" as string]: p.mi >= 0 ? (p.mi + 0.5) / 4 : 0, ["--d" as string]: `${i * 60}ms`, ["--c" as string]: p.c }} />
        ))}
        <canvas className="bc-cv" data-bc-cv />
      </div>
      <FloorFx />
    </div>
  );
}
