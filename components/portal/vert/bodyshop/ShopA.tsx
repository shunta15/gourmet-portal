import "./bodyshop.css";
import "./shop-a.css";
import Link from "next/link";
import { KZ_FONT_CLASSES } from "../korogashi/fonts";
import UnrollFx from "./UnrollFx";
import { BsBody, BsCrumb, BsFacts, BsHeader, BsImg, BsMenu, BsMoreShops, KIND_EN, nameSize } from "./Shared";
import type { BsShop } from "@/lib/portal/vert/bodyshop/model";

/**
 * 案 A「広げる」: 店のページ全体が、床に敷いた丸めたマットを転がして広げていく作り。
 * 見出しごとに、マットの帯(紙のラベル入り)が転がってきて、スクロールの位置に合わせて広げる。広げた所に文と写真が出る。
 * 最初の画面は、開くと同時に大きなマットが転がり、店名の帯が現れる。細くなった巻きをつかんで上へ引くと巻き戻り、離すと広がり直す。
 * 仕組み: 各面の --u(広げた割合 0〜1)・--th(巻きの回転)を CSS 変数で持ち、マットの太さ・位置・帯の字の向きを calc() で決める。
 * スクロールの位置からの --u/--th は UnrollFx(クライアント。データは持たない)が付ける。最初の画面だけは CSS の動きで始まる(JS を待たない)。
 */
function Sheet({ id, tone, label, children, className = "" }: { id?: string; tone?: string; label: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`ba-u ba-sec ${className}`} data-ba-u style={tone ? { ["--tone" as string]: tone } : undefined}>
      <div className="ba-sheet">{children}</div>
      <div className="ba-run" aria-hidden="true">
        <div className="ba-roll">
          <span className="ba-lab">
            <b>{label}</b>
          </span>
        </div>
      </div>
    </section>
  );
}

export default function ShopA({ shop, v }: { shop: BsShop; v: number }) {
  const ph = shop.photos;
  const rest = ph.slice(1);
  const dark = "#3b3d40";
  return (
    <div suppressHydrationWarning className={`bs bs-floor ba ${KZ_FONT_CLASSES}`} data-ba style={{ ["--mat" as string]: shop.color }}>
      <script dangerouslySetInnerHTML={{ __html: "var r=document.currentScript.parentElement;r.classList.add('ba-js');if(matchMedia('(prefers-reduced-motion: reduce)').matches)r.classList.add('ba-still');setTimeout(function(){r.classList.add('ba-late')},4000)" }} />
      <BsHeader />
      <main>
        <div className="ba-hero-wrap" id="bs-top">
          <section className="ba-u ba-hero" data-ba-hero aria-label="店の紹介">
            <div className="ba-sheet">
              <div className={`ba-paper ba-hero-in${ph.length > 0 ? " has-ph" : ""}`}>
                <div className="ba-hero-copy">
                  <BsCrumb shop={shop} />
                  <p className="ba-kind">
                    <i>No.{String(Math.max(1, ["seitai", "sekkotsu", "shinkyu", "massage", "relaxation", "stretch"].indexOf(shop.kindSlug) + 1)).padStart(2, "0")}</i>
                    <b>{shop.kindName}</b>
                    <em>{KIND_EN[shop.kindSlug] ?? ""}</em>
                  </p>
                  <h1 className={`ba-name sz-${nameSize(shop.name.length)}`}>{shop.name}</h1>
                  {shop.kana && <p className="ba-kana">{shop.kana}</p>}
                  <p className="ba-area">
                    {shop.prefName}
                    {shop.city ? `　${shop.city}` : ""}
                  </p>
                  {shop.headline && <p className="ba-head">{shop.headline}</p>}
                </div>
                {ph.length > 0 && (
                  <figure className="ba-ph">
                    <BsImg p={ph[0]} eager sizes="(max-width: 800px) 90vw, 46vw" />
                  </figure>
                )}
              </div>
            </div>
            <div className="ba-run" aria-hidden="true">
              <div className="ba-roll">
                <span className="ba-lab">
                  <b>{shop.kindName}</b>
                </span>
              </div>
            </div>
          </section>
        </div>

        {rest.length > 0 && (
          <Sheet label="写真" tone={shop.color}>
            <ul className={`ba-gal ba-gal-${Math.min(rest.length, 4)}`}>
              {rest.map((p, i) => (
                <li key={p.src} style={{ ["--r" as string]: `${i % 2 ? 1.4 : -1.4}deg` }}>
                  <BsImg p={p} sizes="(max-width: 800px) 90vw, 40vw" />
                </li>
              ))}
            </ul>
          </Sheet>
        )}

        {shop.panels.map((p, i) => (
          <Sheet key={p.no} id={`bs-sec-${i}`} label={`No.${p.no}　${p.label}`} tone={i % 2 ? dark : shop.color}>
            <div className="ba-paper">
              <p className="ba-no" aria-hidden="true">
                No.{p.no}
              </p>
              <h2 className="ba-h">{p.heading}</h2>
              {p.sub && <p className="ba-sub">{p.sub}</p>}
              <BsBody p={p} />
            </div>
          </Sheet>
        ))}

        {shop.hasStory && (shop.quote || shop.closing.length > 0) && (
          <Sheet label="まとめ" tone={dark}>
            <div className="ba-paper ba-quote">
              {shop.quote && (
                <blockquote>
                  <p>{shop.quote}</p>
                  {shop.quoteCite && <cite>{shop.quoteCite}</cite>}
                </blockquote>
              )}
              {shop.closing.map((t, i) => (
                <p key={i} className="ba-closing">
                  {t}
                </p>
              ))}
            </div>
          </Sheet>
        )}

        {shop.menus.length > 0 && (
          <Sheet label="メニュー" tone={shop.color}>
            <div className="ba-paper">
              <h2 className="ba-h">メニュー</h2>
              <BsMenu shop={shop} />
            </div>
          </Sheet>
        )}

        <Sheet id="bs-access" label="店舗情報" tone={dark} className="ba-access">
          <div className="ba-paper">
            <h2 className="ba-h">店舗情報</h2>
            <BsFacts shop={shop} />
          </div>
        </Sheet>

        <Sheet label="ほかの店" tone={shop.color}>
          <div className="ba-paper">
            <BsMoreShops shop={shop} v={v} />
          </div>
        </Sheet>
        <p className="ba-back">
          <Link href="/bodycare">ボディケアのトップへ</Link>
        </p>
      </main>
      <UnrollFx />
    </div>
  );
}
