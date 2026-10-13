import "./bodyshop.css";
import "./shop-b.css";
import Link from "next/link";
import { KZ_FONT_CLASSES } from "../korogashi/fonts";
import DrumFx from "./DrumFx";
import { BsBody, BsCrumb, BsFacts, BsHeader, BsImg, BsMenu, BsMoreShops, KIND_EN, nameSize } from "./Shared";
import type { BsShop } from "@/lib/portal/vert/bodyshop/model";

/**
 * 案 B「回す」(2026-10-13 作り直し): 丸めたマット(大きな筒)そのものが、ページの主役。
 * 画面いっぱいの筒の面に、店の紹介の節が 1 つずつ載っている(面は紙の札を巻いたもの)。スクロールすると筒が回って次の節が正面に来て、
 * 正面に来た節は平らに開いて読める(長い節は、読んでいる間、面の中で文が上へ進む)。PC では筒をマウスでつかんで回せる(勢いがついて回り、節の境で止まる)。スマホは指でスクロールすると筒が回る。
 * 固定の目次の帯は無い。「店舗情報のみ見る」は上の固定の帯のボタンで、押すと筒が店舗情報の面へ回る。
 * 仕組み: 面を CSS 3D(rotateX)で筒に並べ、角度 --th とページの縦の位置の対応は DrumFx(クライアント。データは持たない)が持つ。
 * JS なし・動きを減らす設定では、筒にせず、節の札を縦に並べた普通のページ(読める・押せる)。
 */
type Item = { id: string; key: string };

export default function ShopB({ shop, v }: { shop: BsShop; v: number }) {
  const ph = shop.photos;
  const kindNo = String(Math.max(1, ["seitai", "sekkotsu", "shinkyu", "massage", "relaxation", "stretch"].indexOf(shop.kindSlug) + 1)).padStart(2, "0");
  const extra = ph.slice(shop.panels.length + 1);
  const hasEnd = shop.hasStory && (shop.quote || shop.closing.length > 0);
  const items: Item[] = [
    { id: "bs-top", key: "hero" },
    ...shop.panels.map((_, i) => ({ id: `bs-sec-${i}`, key: `p${i}` })),
    ...(extra.length > 0 ? [{ id: "bs-photos", key: "photos" }] : []),
    ...(hasEnd ? [{ id: "bs-end", key: "end" }] : []),
    ...(shop.menus.length > 0 ? [{ id: "bs-menu", key: "menu" }] : []),
    { id: "bs-access", key: "access" },
  ];
  const L = items.length;
  const N = Math.max(L, 8);
  const ft = (2 * Math.tan(Math.PI / N)).toFixed(4);

  const body = (key: string) => {
    if (key === "hero")
      return (
        <div className="bb-hero">
          <BsCrumb shop={shop} />
          <p className="bb-kind">
            <i>No.{kindNo}</i>
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
            <figure className="bb-fig">
              <BsImg p={ph[0]} eager sizes="(max-width: 900px) 80vw, 560px" />
            </figure>
          )}
        </div>
      );
    if (key.startsWith("p")) {
      const i = Number(key.slice(1));
      const p = shop.panels[i];
      const pic = ph[i + 1];
      return (
        <>
          <p className="bb-sno">No.{p.no}</p>
          <h2 className="bb-h">{p.heading}</h2>
          {p.sub && <p className="bb-sub">{p.sub}</p>}
          <BsBody p={p} />
          {pic && (
            <figure className="bb-fig">
              <BsImg p={pic} sizes="(max-width: 900px) 80vw, 460px" />
            </figure>
          )}
        </>
      );
    }
    if (key === "photos")
      return (
        <>
          <p className="bb-sno">PHOTO</p>
          <h2 className="bb-h">写真</h2>
          <ul className="bb-gal">
            {extra.map((p) => (
              <li key={p.src}>
                <BsImg p={p} sizes="(max-width: 900px) 44vw, 24vw" />
              </li>
            ))}
          </ul>
        </>
      );
    if (key === "end")
      return (
        <div className="bb-quote">
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
        </div>
      );
    if (key === "menu")
      return (
        <>
          <p className="bb-sno">MENU</p>
          <h2 className="bb-h">メニュー</h2>
          <BsMenu shop={shop} />
        </>
      );
    return (
      <>
        <p className="bb-sno">INFO</p>
        <h2 className="bb-h">店舗情報</h2>
        <BsFacts shop={shop} />
      </>
    );
  };

  return (
    <div suppressHydrationWarning className={`bs bs-floor bb ${KZ_FONT_CLASSES}`} data-bb data-l={L} data-n={N} style={{ ["--mat" as string]: shop.color, ["--n" as string]: N, ["--step" as string]: `${360 / N}deg`, ["--ft" as string]: ft, ["--l" as string]: L }}>
      <script dangerouslySetInnerHTML={{ __html: "var r=document.currentScript.parentElement;r.classList.add('bb-js');if(matchMedia('(prefers-reduced-motion: reduce)').matches)r.classList.add('bb-still');setTimeout(function(){r.classList.add('bb-late')},4000)" }} />
      <BsHeader />
      <main>
        <div className="bb-track" data-bb-track>
          <div className="bb-stage" data-bb-stage>
            <div className="bb-sway">
            <div className="bb-cyl" data-bb-cyl>
              <div className="bb-body" aria-hidden="true">
                {Array.from({ length: 24 }, (_, k) => (
                  <i key={k} className="bb-seg" style={{ ["--k" as string]: k }} />
                ))}
              </div>
              {Array.from({ length: N }, (_, j) =>
                j < L ? (
                  <section key={j} id={items[j].id} className="bb-face" data-j={j} style={{ ["--j" as string]: j }}>
                    <div className="bb-paper">
                      <div className="bb-sc">{body(items[j].key)}</div>
                    </div>
                    <i className="bb-shade" aria-hidden="true" />
                  </section>
                ) : null
              )}
            </div>
            </div>
          </div>
        </div>
        <section className="bb-after">
          <div className="bb-after-in">
            <BsMoreShops shop={shop} v={v} />
            <p className="bb-back">
              <Link href="/bodycare">ボディケアのトップへ</Link>
            </p>
          </div>
        </section>
      </main>
      <DrumFx />
    </div>
  );
}
