import "./bodyshop.css";
import "./shop-b.css";
import Link from "next/link";
import { KZ_FONT_CLASSES } from "../korogashi/fonts";
import DrumFx from "./DrumFx";
import { BsBody, BsCrumb, BsFacts, BsHeader, BsImg, BsMenu, BsMoreShops, KIND_EN, nameSize } from "./Shared";
import type { BsShop } from "@/lib/portal/vert/bodyshop/model";

/**
 * 案 B「回す」: 丸めたマットのドラムを、指で回して見出しを選ぶ作り。
 * ドラムの面は紙の帯(見出しの名前入り)。スクロールすると、ドラムが今読んでいる見出しの面へ回る。指でまわすと勢いがついて回り、止まった面の見出しへ移る。
 * 開くと同時に、ドラムが勢いよく回って店名の面で止まる。PC は左に固定、スマホは上に固定の細い帯。本文はふつうに縦に流れる(スクロールを奪わない)。
 * 仕組み: ドラムは CSS の 3D(面を rotateX で円筒に並べる)。角度 --th は DrumFx(クライアント。データは持たない)がスクロール・指・勢いから決める。
 * JS なし・動きを減らす設定では、ドラムの代わりに見出しの一覧(ページ内の移動)を出す。
 */
type Item = { id: string; sub: string; label: string };

export default function ShopB({ shop, v }: { shop: BsShop; v: number }) {
  const ph = shop.photos;
  const items: Item[] = [
    { id: "bs-top", sub: KIND_EN[shop.kindSlug] ?? "TOP", label: shop.name.length > 13 ? `${shop.name.slice(0, 12)}…` : shop.name },
    ...shop.panels.map((p, i) => ({ id: `bs-sec-${i}`, sub: `No.${p.no}`, label: p.label })),
    ...(shop.hasStory && (shop.quote || shop.closing.length > 0) ? [{ id: "bs-end", sub: "NOTE", label: "まとめ" }] : []),
    ...(shop.menus.length > 0 ? [{ id: "bs-menu", sub: "MENU", label: "メニュー" }] : []),
    { id: "bs-access", sub: "INFO", label: "店舗情報" },
    { id: "bs-more", sub: "MORE", label: "ほかの店" },
  ];
  const L = items.length;
  const N = L < 8 ? L * Math.ceil(8 / L) : L;
  const ft = (2 * Math.tan(Math.PI / N)).toFixed(4);
  const faces = Array.from({ length: N }, (_, j) => ({ ...items[j % L], j, dup: j >= L }));

  return (
    <div suppressHydrationWarning className={`bs bs-floor bb ${KZ_FONT_CLASSES}`} data-bb data-l={L} style={{ ["--mat" as string]: shop.color }}>
      <script dangerouslySetInnerHTML={{ __html: "var r=document.currentScript.parentElement;r.classList.add('bb-js');if(matchMedia('(prefers-reduced-motion: reduce)').matches)r.classList.add('bb-still');setTimeout(function(){r.classList.add('bb-late')},4000)" }} />
      <BsHeader />
      <div className="bb-grid">
        <aside className="bb-rail" aria-label="ページ内の移動">
          <div className="bb-drum" data-bb-drum style={{ ["--n" as string]: N, ["--step" as string]: `${360 / N}deg`, ["--ft" as string]: ft }}>
            <div className="bb-cyl" data-bb-cyl>
              {faces.map((f) => (
                <a key={f.j} className="bb-face" href={`#${f.id}`} data-j={f.j} style={{ ["--j" as string]: f.j }} {...(f.dup ? { tabIndex: -1, "aria-hidden": true } : {})}>
                  <i>{f.sub}</i>
                  <b>{f.label}</b>
                </a>
              ))}
            </div>
            <span className="bb-lens" aria-hidden="true" />
          </div>
          <ol className="bb-nav">
            {items.map((it) => (
              <li key={it.id}>
                <a href={`#${it.id}`}>
                  <i>{it.sub}</i>
                  <b>{it.label}</b>
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <main className="bb-main">
          <section className="bb-hero" id="bs-top" data-bb-sec>
            <BsCrumb shop={shop} />
            <p className="bb-kind">
              <b>{shop.kindName}</b>
              <em>{KIND_EN[shop.kindSlug] ?? ""}</em>
            </p>
            <h1 className={`bb-name sz-${nameSize(shop.name.length)}`}>{shop.name}</h1>
            {shop.kana && <p className="bb-kana">{shop.kana}</p>}
            <p className="bb-area">
              {shop.prefName}
              {shop.city ? `　${shop.city}` : ""}
            </p>
            {shop.headline && <p className="bb-head">{shop.headline}</p>}
            {ph.length > 0 && (
              <figure className="bb-fig bb-fig-hero" data-bb-par>
                <BsImg p={ph[0]} eager sizes="(max-width: 900px) 92vw, 52vw" />
              </figure>
            )}
          </section>

          {shop.panels.map((p, i) => {
            const pic = ph[i + 1];
            return (
              <section key={p.no} id={`bs-sec-${i}`} className={`bb-sec${pic ? " has-pic" : ""}`} data-bb-sec>
                <div className="bb-sec-txt">
                  <p className="bb-sno">No.{p.no}</p>
                  <h2 className="bb-h">{p.heading}</h2>
                  {p.sub && <p className="bb-sub">{p.sub}</p>}
                  <BsBody p={p} />
                </div>
                {pic && (
                  <figure className="bb-fig" data-bb-par style={{ ["--r" as string]: `${i % 2 ? 1.2 : -1.2}deg` }}>
                    <BsImg p={pic} sizes="(max-width: 900px) 92vw, 30vw" />
                  </figure>
                )}
              </section>
            );
          })}
          {ph.length > shop.panels.length + 1 && (
            <section className="bb-sec" data-bb-sec aria-label="写真">
              <ul className="bb-gal">
                {ph.slice(shop.panels.length + 1).map((p, i) => (
                  <li key={p.src} style={{ ["--r" as string]: `${i % 2 ? 1 : -1}deg` }}>
                    <BsImg p={p} sizes="(max-width: 900px) 46vw, 24vw" />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {shop.hasStory && (shop.quote || shop.closing.length > 0) && (
            <section id="bs-end" className="bb-sec bb-quote" data-bb-sec>
              {shop.quote && (
                <blockquote>
                  <p>{shop.quote}</p>
                  {shop.quoteCite && <cite>{shop.quoteCite}</cite>}
                </blockquote>
              )}
              {shop.closing.map((t, i) => (
                <p key={i} className="bb-closing">
                  {t}
                </p>
              ))}
            </section>
          )}

          {shop.menus.length > 0 && (
            <section id="bs-menu" className="bb-sec" data-bb-sec>
              <p className="bb-sno">MENU</p>
              <h2 className="bb-h">メニュー</h2>
              <BsMenu shop={shop} />
            </section>
          )}

          <section id="bs-access" className="bb-sec bb-access" data-bb-sec>
            <p className="bb-sno">INFO</p>
            <h2 className="bb-h">店舗情報</h2>
            <BsFacts shop={shop} />
          </section>

          <section id="bs-more" className="bb-sec" data-bb-sec>
            <BsMoreShops shop={shop} v={v} />
            <p className="bb-back">
              <Link href="/bodycare">ボディケアのトップへ</Link>
            </p>
          </section>
        </main>
      </div>
      <DrumFx />
    </div>
  );
}
