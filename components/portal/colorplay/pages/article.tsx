/**
 * 店の特集記事・紹介記事のページ(/{v}/article/{店 ID})。COLOR PLAY の店のページ(pages/shop.tsx・shopModel.tsx)と同じ部品・同じ CSS(.sh-*)で、読む向きに組んだもの。
 *
 * 組み: 入口(種類の色面が開いて、記事の題と写真が出てくる。「店舗紹介を見る」の赤いボタン) → 本文(見出しごとに色面が替わる節。特集のポイントの写真は節の中に)
 *       → 店の写真 → 引用・おわりの文(黒) → メニュー(名前だけ) → 最後の帯(この店。店のページへ進むボタン・情報の出どころ) → ほかの記事。
 * 本文は折り畳まず全部出す(読むページ)。料金・評価・順位は出さない(文は lib/portal/colorplay/text.ts の点検に通ったものだけ)。新しい帯・流れる文字・飾りは足さない。
 *
 * 【2026-10-26 試作】店のページと店の特集記事は別ページ(店のページには記事の導入だけ。本文は記事にだけ置く)。canonical は記事自身。robots は店のページと同じ gate(掲載数 3 以上で index)。
 * 特集の ID(/{v}/feature/{id} の ID)で開いた場合は、店の ID の URL へ恒久の転送。
 */
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import JsonLd from "@/components/portal/JsonLd";
import Header from "../Header";
import Footer from "../Footer";
import { ArticleMini } from "../ArticleCards";
import { IconArrow, IconChevron, IconPin } from "@/components/portal/bproto/colorplay/Icons";
import { articleHref, loadArticle, loadArticleItems, type CpArticle, type CpArticleSection } from "@/lib/portal/colorplay/articles";
import { shopHref } from "@/lib/portal/colorplay/search";
import { shopListHref } from "@/lib/portal/colorplay/shopList";
import { loadShops } from "@/lib/portal/colorplay/data";
import type { CpSite } from "@/lib/portal/colorplay/site";
import { getGeneratedFeatures } from "@/lib/places/features";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { getVertical } from "@/lib/verticals";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { sized } from "@/lib/imageUrl";
import { HERO_TONE, nameSize, safeDecode } from "./shopModel";
import "../article.css";

type Props = { params: Promise<{ id: string }> };

/** 色面の順(入口の色と黒を除いて順に回す。隣どうしが同じ色にならない) */
const POOL = ["pink", "blue", "red", "sky"];

function Section({ s, band, right }: { s: CpArticleSection; band: string; right: boolean }) {
  return (
    <section className={`sh-sec art-sec bg-${band}`} id={s.id} data-sp="e p">
      <p className="sh-no cp-cond" aria-hidden="true">{s.no}</p>
      <div className={`cp-wrap sh-sec-in sh-2col ${right ? "rev" : ""}`}>
        <div className="sh-hd">
          <h2 className="sh-h">{s.heading}</h2>
          {s.sub && <p className="sh-sub">{s.sub}</p>}
        </div>
        <div className={`sh-card ${right ? "al-r" : ""}`}>
          {s.photos.map((ph) => (
            <figure key={ph.src} className="art-fig">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sized(ph.src, 900)} alt={ph.alt} width={ph.w ?? 1200} height={ph.h ?? 800} loading="lazy" decoding="async" />
            </figure>
          ))}
          {s.body.map((t, i) => (<p key={i}>{t}</p>))}
          {s.specs.length > 0 && (
            <dl className="sh-specs">
              {s.specs.map((x) => (<div key={x.k}><dt>{x.k}</dt><dd>{x.v}</dd></div>))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}

function Body({ site, a }: { site: CpSite; a: CpArticle }) {
  const { item } = a;
  const s = item.shop;
  const tone = HERO_TONE[s.kind] ?? "red";
  const ink = tone === "pink" || tone === "sky" || tone === "blue";
  const pool = POOL.filter((b) => b !== tone);
  // 色面は 入口の色と黒を除いて順に回し、隣どうしが同じ色にならないようにする(最後の帯は、赤いボタンが見える色=赤以外)
  let k = 0;
  let prev = "";
  const take = (not: string[] = []): string => {
    for (;;) {
      const b = pool[k++ % pool.length];
      if (b !== prev && !not.includes(b)) {
        prev = b;
        return b;
      }
    }
  };
  const bands = a.sections.map(() => take());
  const galBand = a.gallery.length > 0 ? take() : "";
  const hasQuote = !!(a.quote || a.closing.length > 0);
  if (hasQuote) prev = "black";
  const menuBand = a.menus.length > 0 ? take() : "";
  const endBand = take(["red"]);
  const shopUrl = shopHref(site, item.id);
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: getVertical(site.key).name, url: absUrl(getVertical(site.key).path) },
    { name: "店舗紹介", url: absUrl(shopListHref(site)) },
    { name: s.name, url: absUrl(articleHref(site, item.id)) },
  ]);
  const hero = a.hero;
  const checked = a.checkedAt?.replace(/^(\d{4})-(\d{2})-(\d{2})$/, (_m, y, mo, da) => `${y}年${Number(mo)}月${Number(da)}日`);

  return (
    <>
      <JsonLd data={ld} />
      <Header base={site.base} logoA={site.logoA} logoB={site.logoB} onColor ink={ink} invert={tone === "black"} />
      <main id="cp-main" tabIndex={-1}>
        <section className={`sh-hero art-hero t-${tone} ${hero ? "has-ph" : "no-ph"}`} id="top" data-sp="o">
          <div className="sh-curtain" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="sh-shape sh-s1" aria-hidden="true" />
          <div className="sh-shape sh-s2" aria-hidden="true" />
          <div className="cp-wrap sh-hero-in">
            <nav className="cp-crumb" aria-label="パンくず">
              <Link href={site.base}>TOP</Link><IconChevron size={12} />
              <Link href={shopListHref(site)}>店舗紹介</Link><IconChevron size={12} />
              <span aria-current="page">{s.name}</span>
            </nav>
            <div className="sh-hero-grid">
              <div className="sh-hero-copy">
                <p className="cp-tags">
                  <span className={`cp-tag k-${s.kind}`}>{s.kindName}</span>
                  {item.featured && <span className="cp-tag">特集</span>}
                </p>
                <h1 className={`sh-name sz-${nameSize(item.title.length)}`}><span className="cp-line" style={{ ["--l" as string]: 0 }}>{item.title}</span></h1>
                <p className="art-shop">{s.name}</p>
                <p className="cp-addr cp-addr-l"><IconPin size={18} /><span>{s.address}</span></p>
                <div className="cp-cta">
                  <Link href={shopUrl} className="cp-red">店舗詳細を見る<IconArrow size={18} /></Link>
                </div>
              </div>
              {hero && (
                <div className="sh-hero-ph">
                  <div className="sh-cut">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sized(hero.src, 1024)} alt={hero.alt} width={hero.w ?? 1200} height={hero.h ?? 800} fetchPriority="high" decoding="async" />
                  </div>
                </div>
              )}
            </div>
          </div>
          <span className="cp-hero-cut" aria-hidden="true" />
        </section>

        {a.sections.map((sec, i) => (<Section key={i} s={sec} band={bands[i]} right={i % 2 === 1} />))}

        {a.gallery.length > 0 && (
          <section className={`sh-sec sh-gal-sec bg-${galBand}`} aria-label="店の写真">
            <div className="cp-wrap sh-sec-in">
              <ul className={`sh-gal g${Math.min(a.gallery.length, 6)}`}>
                {a.gallery.map((x, i) => (
                  <li key={x.src} data-sp="e" style={{ ["--i" as string]: i % 3, ["--r" as string]: i % 2 ? 3 : -3 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sized(x.src, 800)} alt={x.alt} width={x.w ?? 1200} height={x.h ?? 800} loading="lazy" decoding="async" />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {hasQuote && (
          <section className="sh-sec art-quote bg-black sh-quote" data-sp="e p">
            <div className="cp-wrap sh-sec-in">
              {a.quote && (
                <blockquote className="sh-bq"><p>{a.quote}</p>{a.quoteCite && <cite>{a.quoteCite}</cite>}</blockquote>
              )}
              {a.closing.map((t, i) => (<p key={i} className="sh-closing">{t}</p>))}
            </div>
          </section>
        )}

        {a.menus.length > 0 && (
          <section className={`sh-sec bg-${menuBand} sh-menu`} data-sp="e" aria-labelledby="art-menu-h">
            <div className="cp-wrap sh-sec-in">
              <h2 className="sh-h" id="art-menu-h">メニュー</h2>
              <ul className="sh-chips">
                {a.menus.map((m, i) => (<li key={i}>{m}</li>))}
              </ul>
            </div>
          </section>
        )}

        <section className={`sh-sec art-end bg-${endBand}`} data-sp="e" aria-labelledby="art-end-h">
          <div className="cp-wrap sh-sec-in">
            <h2 className="sh-h" id="art-end-h">この記事のお店</h2>
            <div className="art-end-box">
              <p className="cp-tags"><span className={`cp-tag k-${s.kind}`}>{s.kindName}</span></p>
              <p className="art-end-name">{s.name}</p>
              <p className="cp-addr cp-addr-l"><IconPin size={18} /><span>{s.address}</span></p>
              <div className="cp-cta art-end-cta">
                <Link href={shopUrl} className="cp-red">店舗詳細を見る<IconArrow size={18} /></Link>
              </div>
            </div>
            {a.sources.length > 0 && (
              <div className="sh-src">
                <h3>情報の出どころ</h3>
                <ul>
                  {a.sources.map((x) => (
                    <li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.label}<span className="cp-sr">(別のタブで開きます)</span></a></li>
                  ))}
                </ul>
                {a.checkedAt && checked && <p>確認日　<time dateTime={a.checkedAt}>{checked}</time></p>}
              </div>
            )}
          </div>
        </section>

        {a.more.length > 0 && (
          <section className="cp-wrap cp-more-shops" aria-labelledby="art-more-h">
            <h2 className="cp-h2 cp-rv" id="art-more-h">ほかの記事</h2>
            <div className="cp-minis">{a.more.map((x, i) => (<ArticleMini key={x.id} site={site} a={x} i={i} />))}</div>
            <p className="cp-more"><Link href={shopListHref(site)}>店舗紹介の一覧を見る</Link></p>
          </section>
        )}
      </main>
      <Footer site={site} />
    </>
  );
}

export function cpArticlePage(site: CpSite) {
  /** URL の ID → 記事のある店の ID。特集の ID で来たら、店の ID の URL へ転送する先を返す。無ければ null */
  async function resolve(raw: string): Promise<{ id: string } | { to: string } | null> {
    const id = safeDecode(raw);
    const items = await loadArticleItems(site);
    if (items.some((i) => i.id === id)) return { id };
    const f = (await getGeneratedFeatures(site.key)).find((x) => x.id === id);
    if (f?.placeId && items.some((i) => i.id === f.placeId)) return { to: articleHref(site, f.placeId) };
    return null;
  }

  async function staticParams() {
    return (await loadArticleItems(site)).map((i) => ({ id: i.id }));
  }

  async function generateMetadata({ params }: Props): Promise<Metadata> {
    const r = await resolve((await params).id);
    if (!r || !("id" in r)) return notFoundMetadata();
    const a = await loadArticle(site, r.id);
    if (!a) return notFoundMetadata();
    const v = getVertical(site.key);
    const { item } = a;
    const s = item.shop;
    const shops = await loadShops(site);
    const where = `${s.prefName}${s.city}`;
    const hero = a.hero;
    return buildMetadata({
      vertical: site.key,
      title: item.featured ? `${item.title}｜${v.brand}` : `${s.name}の紹介記事｜${where ? `${where}の` : ""}${s.kindName}｜${v.brand}`,
      description: a.description,
      // 【2026-10-26】店のページと店の特集記事は別ページ。正本は記事自身
      path: articleHref(site, item.id),
      count: shops.length,
      ...(hero ? { image: { url: hero.src, width: hero.w, height: hero.h, alt: hero.alt } } : {}),
    });
  }

  async function Page({ params }: Props) {
    const r = await resolve((await params).id);
    if (!r) notFound();
    if ("to" in r) permanentRedirect(r.to);
    const a = await loadArticle(site, r.id);
    if (!a) notFound();
    return <Body site={site} a={a} />;
  }

  return { generateMetadata, Page, staticParams };
}
