import type { CSSProperties } from "react";
import Link from "next/link";
import ArticleShell from "./ArticleShell";
import { Sec, P, Arrow, Leaf } from "./parts";
import { BASE, SEARCH_HREF, SPECIAL_HREF, articleHref, shopHref, shopListHref } from "../common/site";
import { kindIsDark } from "@/lib/portal/vert/bodygreen/shops";
import { articleTitleOf, type BsArticleItem } from "@/lib/portal/vert/bodyshop/articles";
import type { BsShop } from "@/lib/portal/vert/bodyshop/model";

/**
 * 店の特集記事(店 1 軒の記事。/bodycare/article/<店の ID>)。【2026-10-26 試作】見た目は案4 の記事の型(ArticleShell・kind="feature")。
 * 文は店のデータの紹介記事・特集記事(loadBsShop の点検済みの文)だけ。足さない・言い換えない。順位・評価・料金・口コミは出さない。
 * 店のページ(/bodycare/shop/<ID>)へは「店舗詳細を見る」(ヒーロー右・右の追従カード・記事の終わりの帯)で戻れる。
 */

const dotDate = (s?: string) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s.replace(/-/g, ".") : "");
const httpOnly = (u: string) => /^https?:\/\//i.test(u);

/** 見出しを 2 行までに分ける(長いときは「、」「。」か中ほどで) */
function splitTitle(t: string): string[] {
  if (t.length <= 16) return [t];
  const mid = Math.ceil(t.length / 2);
  let at = -1;
  for (let d = 0; d < t.length; d++) {
    for (const i of [mid - d, mid + d]) {
      if (i > 3 && i < t.length - 3 && /[、。,，・\s]/.test(t[i - 1])) {
        at = i;
        break;
      }
    }
    if (at > 0) break;
  }
  if (at < 0) at = mid;
  return [t.slice(0, at), t.slice(at)];
}

const Face = ({ shop }: { shop: BsShop }) => (
  <span className={`ar-face${kindIsDark(shop.kindSlug) ? " is-dark" : ""}`} style={{ ["--kc" as string]: shop.color } as CSSProperties} role="img" aria-label={`${shop.name}(写真なし)`}>
    <Leaf size={34} />
    <b>{shop.name}</b>
    <small>{shop.kindName}</small>
  </span>
);

export default function StoreArticle({ shop, more }: { shop: BsShop; more: BsArticleItem[] }) {
  const intro = shop.panels[0];
  const body = shop.panels.slice(1);
  const title = articleTitleOf(shop);
  const area = shop.city || shop.prefName;
  const checked = dotDate(shop.checkedAt);
  const sources = shop.sources.filter((s) => httpOnly(s.url));
  const [pa, pb] = shop.photos;
  const hours = shop.facts.find((f) => f.k === "営業時間")?.v[0] ?? "";
  const closed = shop.facts.find((f) => f.k === "定休日")?.v[0] ?? "";
  const toShop = shopHref(shop.id);
  const officialLinks = shop.links.filter((l) => (l.kind === "website" || l.kind === "reserve") && httpOnly(l.href));

  const points = [
    { id: "a-intro", no: "序", title: "はじめに", tab: "はじめに" },
    ...body.map((pn) => ({ id: `a-${pn.no}`, no: pn.no, title: pn.heading, tab: pn.label })),
  ];
  const introText = [...intro.open, ...intro.rest];
  const lead = (intro.open[0]?.match(/[^。]+。?/)?.[0] ?? "").slice(0, 90);

  return (
    <ArticleShell
      kind="feature"
      crumbs={[{ label: "マチノワ ボディケア", href: BASE }, { label: "店舗紹介", href: shopListHref() }, { label: shop.name, href: toShop }, { label: shop.hasStory ? "特集記事" : "紹介記事" }]}
      chip={shop.hasStory ? "店の特集記事" : "店の紹介記事"}
      title={splitTitle(title)}
      sub={shop.hasStory ? intro.sub : undefined}
      date={checked ? `情報の確認日 ${checked}` : undefined}
      read={`${shop.name}｜${shop.kindName}`}
      lead={lead}
      note={[`${area}の`, shop.kindName]}
      badge={[shop.prefName, shop.kindName]}
      vis={
        <>
          <div className="ar-ph ph-a" data-rv="zoom">
            {pa ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="gr-kb" src={pa.src} alt={pa.alt} width={pa.w} height={pa.h} fetchPriority="high" decoding="async" />
            ) : (
              <Face shop={shop} />
            )}
          </div>
          {pb && (
            <div className="ar-ph ph-b" data-rv="zoom" style={{ ["--d" as string]: "160ms" } as CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pb.src} alt={pb.alt} width={pb.w} height={pb.h} loading="lazy" decoding="async" />
            </div>
          )}
        </>
      }
      pointsTitle="この記事の内容"
      points={points}
      aside={
        <div className="ar-card" data-rv="right">
          <h2 className="ar-card-h gr-vbar">この記事のお店</h2>
          <p className="ar-aside-n">{shop.name}</p>
          <dl className="ar-info">
            <div>
              <dt>種類</dt>
              <dd>{shop.kindName}</dd>
            </div>
            <div>
              <dt>住所</dt>
              <dd>{shop.address}</dd>
            </div>
            {hours && (
              <div>
                <dt>営業時間</dt>
                <dd>{hours}</dd>
              </div>
            )}
            {closed && (
              <div>
                <dt>定休日</dt>
                <dd>{closed}</dd>
              </div>
            )}
          </dl>
          <div className="ar-cta">
            <Link href={toShop} className="gr-btn gr-press gr-shimmer">
              店舗詳細を見る
              <Arrow />
            </Link>
            {officialLinks.map((l) => (
              <a key={l.kind} href={l.href} target="_blank" rel="noopener noreferrer" className="gr-btn gr-btn--line gr-press">
                {l.kind === "reserve" ? "予約ページを開く" : "公式サイトを見る"}
                <Arrow />
                <span className="gr-sr">(別のタブで開きます)</span>
              </a>
            ))}
          </div>
          <p className="ar-small">営業時間や電話・予約・地図は、店舗詳細のページにまとめています。</p>
        </div>
      }
      after={
        <>
          {shop.quote && (
            <blockquote className="ar-quote" data-rv>
              <p>{shop.quote}</p>
              {shop.quoteCite && <cite>{shop.quoteCite}</cite>}
            </blockquote>
          )}
          {shop.closing.length > 0 && (
            <div className="ar-closing" data-rv>
              {shop.closing.map((t, i) => (
                <p key={i} className="ar-p">
                  {t}
                </p>
              ))}
            </div>
          )}
          {shop.menus.length > 0 && (
            <section className="ar-sec" id="a-menu">
              <h2 className="ar-h2 gr-vbar" data-rv>
                メニュー
              </h2>
              <ul className="ar-menus" data-rv-group>
                {shop.menus.slice(0, 12).map((m, i) => (
                  <li key={`${m}-${i}`} className="gr-chip" data-rv>
                    {m}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {sources.length > 0 && (
            <section className="ar-src" id="sources" data-rv>
              <h2 className="ar-src-h gr-vbar">情報の出どころ</h2>
              {checked && <p className="ar-src-d">確認日: {checked}。営業時間やメニューは変わることがあります。お出かけの前に公式サイトなどでご確認ください。</p>}
              <ol>
                {sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="gr-hov">
                      {s.label}
                      <span className="gr-sr">(別のタブで開きます)</span>
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          )}
          <section className="ar-shopband" aria-label="この記事のお店" data-rv>
            <div className="ph">
              {pa ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={(pb ?? pa).src} alt="" loading="lazy" decoding="async" />
              ) : (
                <Face shop={shop} />
              )}
            </div>
            <div className="tx">
              <small>この記事のお店</small>
              <h3>{shop.name}</h3>
              <p>
                {shop.kindName}　{shop.address}
              </p>
              <div className="row">
                <Link href={toShop} className="gr-btn gr-press gr-shimmer">
                  店舗詳細を見る
                  <Arrow />
                </Link>
                {officialLinks.map((l) => (
                  <a key={l.kind} href={l.href} target="_blank" rel="noopener noreferrer" className="gr-btn gr-btn--line gr-press">
                    {l.kind === "reserve" ? "予約ページを開く" : "公式サイトを見る"}
                    <Arrow />
                    <span className="gr-sr">(別のタブで開きます)</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </>
      }
      related={
        <>
          {more.map((m) => (
            <div key={m.id} data-rv>
              <Link href={articleHref(m.id)} className="ar-rc gr-lift gr-hov" style={{ ["--ar-c" as string]: "var(--gr-g)" } as CSSProperties}>
                <div className="ph gr-zoom">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo.src} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="ar-face ar-face--sm" style={{ ["--kc" as string]: m.color } as CSSProperties}>
                      <Leaf size={28} />
                      <b>{m.name}</b>
                    </span>
                  )}
                </div>
                <div className="tx">
                  <small>{m.featured ? "店の特集記事" : "店の紹介記事"}</small>
                  <h3>{m.title}</h3>
                  <p>
                    {m.name}　{m.area}
                  </p>
                </div>
                <span className="gr-arrow">
                  <Arrow />
                </span>
              </Link>
            </div>
          ))}
        </>
      }
      back={[
        { label: "店舗詳細を見る", href: toShop, primary: true },
        { label: "特集の一覧へ", href: SPECIAL_HREF },
        { label: "探すページへ", href: SEARCH_HREF },
      ]}
    >
      <Sec id="a-intro" no="序" title="はじめに">
        {introText.map((t, i) => (
          <P key={i}>{t}</P>
        ))}
      </Sec>
      {body.map((pn) => (
        <Sec key={pn.no} id={`a-${pn.no}`} no={pn.no} title={pn.heading}>
          {pn.sub && (
            <p className="ar-psub" data-rv>
              {pn.sub}
            </p>
          )}
          {[...pn.open, ...pn.rest].map((t, i) => (
            <P key={i}>{t}</P>
          ))}
          {pn.specs.length > 0 && (
            <dl className="ar-specs" data-rv>
              {pn.specs.map((sp) => (
                <div key={sp.k}>
                  <dt>{sp.k}</dt>
                  <dd>{sp.v}</dd>
                </div>
              ))}
            </dl>
          )}
        </Sec>
      ))}
    </ArticleShell>
  );
}
