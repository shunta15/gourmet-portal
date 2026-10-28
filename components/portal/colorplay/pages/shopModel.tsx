/**
 * 店のページの「中身の用意」と、3 つの組みで共通に使う部品(サーバー)。見た目の組みは shop.tsx(今の形)・fx1.tsx・fx2.tsx・fx3.tsx。
 *
 * 組み: 入口(色面が開いて店名と写真が出てくる) → 帯 → 写真 → 紹介(見出しごとに色面が替わる。文は短く見せて「続きを読む」に畳む)
 *       → メニュー(名前だけ) → 店舗情報(黒い面。住所・営業時間・電話・公式サイト・予約・地図) → 同じエリアの店・同じ種類の店。
 * 特集記事のある店(店 ID と特集の placeId が完全一致)は、短い紹介文の代わりに特集記事の本文を出す(二重にしない)。
 * 写真は 0〜3 枚(特集のある店はもっと)。枚数に合わせて組み方を変える(0 枚は色面と店名の大きな字。空の枠・壊れた画像・同じ写真の繰り返しを出さない)。
 * 紹介文が無い店は、入口・帯・店舗情報だけのページ。メニューの料金は出さない。
 * 動きは transform・opacity・clip-path だけ。prefers-reduced-motion と JS なしでは、動かない完成形のまま読める。
 * 構造化データ・metadata は、これまでの店ページ(components/portal/pages/shop.tsx)と同じ考え方(URL は変えない)。
 */
import Link from "next/link";
import Header from "../Header";
import Footer from "../Footer";
import CpLinks from "../CpLinks";
import { MiniCard } from "../Cards";
import Heart from "@/components/portal/bproto/colorplay/Heart";
import JsonLd from "@/components/portal/JsonLd";
import { IconChevron, IconPin } from "@/components/portal/bproto/colorplay/Icons";
import { loadDetail } from "@/lib/portal/colorplay/data";
import { articleHref, loadArticleItems } from "@/lib/portal/colorplay/articles";
import { searchHref, shopHref } from "@/lib/portal/colorplay/search";
import type { CpSite } from "@/lib/portal/colorplay/site";
import { getCategory, getVertical } from "@/lib/verticals";
import { shopLinks, socialLinks, type ShopLink } from "@/lib/portal/sns";
import { mapsSearchUrl } from "@/lib/maps";
import { breadcrumb, localBusiness } from "@/lib/seo/jsonld";
import { SITE_URL, absUrl } from "@/lib/seo/util";
import { sized } from "@/lib/imageUrl";
import { FxText } from "../FxText";


export const safeDecode = (s: string): string => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

/** 入口の色(種類ごと) */
export const HERO_TONE: Record<string, string> = { hair: "red", esthetic: "pink", "hair-removal": "sky", nail: "black", eyelash: "blue" };
export const KIND_EN: Record<string, string> = { hair: "HAIR", esthetic: "ESTHETIC", "hair-removal": "HAIR REMOVAL", nail: "NAIL", eyelash: "EYELASH" };
/** 見出しごとの色面(入口の色を除いて順に回す) */
export const BANDS = ["pink", "blue", "red", "black", "sky"];

export const nameSize = (n: number) => (n <= 6 ? "xl" : n <= 14 ? "l" : n <= 28 ? "m" : "s");
export const rep = (a: string[]) => Array.from({ length: 6 }, () => a).flat();

/** 本文を「見える所」と「続きを読むの中」に分ける。短ければ全部見せる */
export function foldBody(body: string[]): { open: string[]; rest: string[] } {
  const total = body.reduce((n, x) => n + x.length, 0);
  if (total <= 170) return { open: body, rest: [] };
  const sents = body[0].match(/[^。]+。?/g) ?? [body[0]];
  let head = "";
  let i = 0;
  while (i < sents.length && head.length < 100) head += sents[i++];
  const tail = sents.slice(i).join("");
  return { open: [head], rest: [...(tail ? [tail] : []), ...body.slice(1)] };
}

export type PanelData = { no: string; heading: string; sub?: string; body: string[]; specs?: { k: string; v: string }[]; id?: string };

export function Panel({ d, band, right, sp = "e p" }: { d: PanelData; band: string; right: boolean; sp?: string }) {
  const { open, rest } = foldBody(d.body);
  return (
    <section className={`sh-sec bg-${band}`} id={d.id} data-sp={sp}>
      <p className="sh-no cp-cond" aria-hidden="true">{d.no}</p>
      <div className={`cp-wrap sh-sec-in sh-2col ${right ? "rev" : ""}`}>
        <div className="sh-hd">
          <h2 className="sh-h">{d.heading}</h2>
          {d.sub && <p className="sh-sub">{d.sub}</p>}
        </div>
        <div className={`sh-card ${right ? "al-r" : ""}`}>
          {open.map((t, i) => (<p key={i}>{t}</p>))}
          {rest.length > 0 && (
            <details className="sh-more">
              <summary><span className="so">続きを読む</span><span className="sc">たたむ</span></summary>
              {rest.map((t, i) => (<p key={i}>{t}</p>))}
            </details>
          )}
          {d.specs && d.specs.length > 0 && (
            <dl className="sh-specs">
              {d.specs.map((x) => (<div key={x.k}><dt>{x.k}</dt><dd>{x.v}</dd></div>))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}


export type ShopModel = NonNullable<Awaited<ReturnType<typeof buildShopModel>>>;

/** 店のページに要るものを 1 度に用意する。店が無ければ null */
export async function buildShopModel(site: CpSite, id: string) {
  const hit = await loadDetail(site, safeDecode(id));
  if (!hit) return null;
  const { detail: d, sameArea, sameKind } = hit;
  const p = d.place;
  const s = d.shop;
  const v = getVertical(site.key);
  const cat = getCategory(v, p.category);
  const path = shopHref(site, s.id);
  const n = d.photos.length;

  const mapUrl = p.mapUrl ?? mapsSearchUrl(p.name, p.address);
  const all: ShopLink[] = shopLinks({
    phone: p.phone,
    mapUrl,
    reservationUrl: p.reservationUrl,
    instagram: p.instagram,
    tiktok: p.tiktok,
    x: p.x,
    facebook: p.facebook,
    line: p.line,
    website: p.website ?? p.url,
  });
  // 赤い大きなボタンは 予約 > 公式サイト > 地図
  const primary = all.find((l) => l.kind === "reserve") ?? all.find((l) => l.kind === "website") ?? all.find((l) => l.kind === "map");
  const social = socialLinks({ instagram: p.instagram, tiktok: p.tiktok, x: p.x, facebook: p.facebook, line: p.line, website: p.website ?? p.url });

  const ld: Record<string, unknown> = { ...localBusiness(p, cat?.schemaType ?? "LocalBusiness") };
  const img = d.photos[0]?.src ?? p.image;
  if (d.headline) ld.description = d.headline;
  if (img) ld.image = img.startsWith("/") ? absUrl(encodeURI(img)) : img;
  if (social.length > 0) ld.sameAs = social.map((x) => x.href);
  if (!ld.url) ld.url = `${SITE_URL}${path}`;
  const crumbLd = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    ...(cat ? [{ name: s.kindName, url: absUrl(searchHref(site, { kind: s.kind })) }] : []),
    { name: p.name, url: absUrl(path) },
  ]);

  // ---- 紹介の面(特集記事のある店は特集の本文。無ければ短い紹介文) ----
  const panels: PanelData[] = [];
  let no = 0;
  const nn = () => String(++no).padStart(2, "0");
  if (d.story) {
    const st = d.story;
    panels.push({ no: nn(), id: "about", heading: st.title, sub: st.subtitle, body: st.lede });
    for (const pt of st.points) panels.push({ no: nn(), heading: pt.name, sub: pt.purpose, body: pt.body, specs: pt.specs });
  } else {
    if (d.lede.length > 0) panels.push({ no: nn(), id: "about", heading: "紹介", body: d.lede });
    for (const sc of d.sections) panels.push({ no: nn(), id: panels.length === 0 ? "about" : undefined, heading: sc.heading, body: sc.body });
  }
  // 【2026-10-26 試作】店のページと店の特集記事は別ページ。記事のある店は、店のページに紹介の最初の面だけを残し、残りの面・引用・結びは記事(/{v}/article/{id})だけに置く。
  // 記事が薄い店(記事のページが無い店)は、今までどおり店のページに全部ある。
  const hasArticlePage = (await loadArticleItems(site)).some((i) => i.id === s.id);
  const moved = hasArticlePage ? panels.splice(1) : [];
  const articleLink = hasArticlePage ? { href: articleHref(site, s.id), featured: !!d.story, heads: moved.map((x) => x.heading) } : null;
  const hasAbout = panels.length > 0;
  const tone = HERO_TONE[s.kind] ?? "red";
  const ink = tone === "pink" || tone === "sky" || tone === "blue";
  // 面の色は 入口の色と黒(最後の面)を除いて順に回す。隣どうしが同じ色にならない
  const cyc = BANDS.filter((b) => b !== tone && b !== "black");
  const bandOf = (i: number) => cyc[i % (cyc.length - 1)];
  const lastBand = panels.length > 0 ? bandOf(panels.length - 1) : cyc[0];
  const menuBand = lastBand === "sky" ? "pink" : "sky";
  const gallery = d.photos.slice(1);
  const tabs = [
    { href: "#top", label: "トップ" },
    ...(hasAbout ? [{ href: "#about", label: "紹介" }] : []),
    { href: "#access", label: "店舗情報" },
  ];
  const phoneLink = all.find((l) => l.kind === "phone");
  const ribA = rep([KIND_EN[s.kind] ?? s.kindName, "●", s.name, "●"]);
  const ribB = rep([`${s.prefName}${s.city ? ` ${s.city}` : ""}`, "●", "Machinowa Beauty", "●"]);
  const hasQuote = !hasArticlePage && !!(d.story && (d.story.quote || d.story.closing.length > 0));

  return { site, d, p, s, v, cat, path, articleLink, hasArticlePage, n, all, primary, ld, crumbLd, panels, hasAbout, tone, ink, cyc, bandOf, lastBand, menuBand, gallery, tabs, phoneLink, ribA, ribB, hasQuote, sameArea, sameKind };
}

type M = NonNullable<Awaited<ReturnType<typeof buildShopModel>>>;

export function Crumb({ m }: { m: M }) {
  const { site, s } = m;
  return (
    <nav className="cp-crumb" aria-label="パンくず">
      <Link href={site.base}>TOP</Link><IconChevron size={12} />
      <Link href={searchHref(site, { pref: s.pref })}>{s.prefName}</Link><IconChevron size={12} />
      <Link href={searchHref(site, { kind: s.kind, pref: s.pref })}>{s.kindName}</Link><IconChevron size={12} />
      <span aria-current="page">{s.name}</span>
    </nav>
  );
}

export function JsonLds({ m }: { m: M }) {
  return (
    <>
      <JsonLd data={m.ld} />
      <JsonLd data={m.crumbLd} />
    </>
  );
}

export function ShopHeader({ m }: { m: M }) {
  return <Header base={m.site.base} logoA={m.site.logoA} logoB={m.site.logoB} onColor ink={m.ink} invert={m.tone === "black"} />;
}

export function PrimaryCta({ m }: { m: M }) {
  return (
    <div className="cp-cta">
      <Heart id={m.s.id} name={m.s.name} className="cp-heart-l" />
      {m.primary && <CpLinks links={[m.primary]} storeId={m.s.id} page={m.path} variant="primary" />}
    </div>
  );
}

export function InfoButton() {
  return (
    <a className="sh-info-btn" href="#access">店舗情報のみ見る<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg></a>
  );
}

export function Ribbons({ m }: { m: M }) {
  return (
    <section className="cp-ribbons sh-rib" data-sp="p" aria-hidden="true">
      <div className="cp-rib rib-a"><div className="cp-rib-row cp-cond">{m.ribA.map((w, i) => (<span key={i}>{w}</span>))}</div></div>
      <div className="cp-rib rib-b"><div className="cp-rib-row cp-cond">{m.ribB.map((w, i) => (<span key={i}>{w}</span>))}</div></div>
    </section>
  );
}

export function Tabs({ m }: { m: M }) {
  return (
    <nav className="cp-tabs sh-tabs cp-wrap" aria-label="ページ内の移動">
      {m.tabs.map((t, i) => (<a key={t.href} href={t.href} className={i === 0 ? "is-on" : undefined}>{t.label}</a>))}
    </nav>
  );
}

export function GallerySection({ m }: { m: M }) {
  const { gallery, cyc } = m;
  if (gallery.length === 0) return null;
  return (
    <section className={`sh-sec sh-gal-sec bg-${cyc[cyc.length - 1]}`} aria-label="店の写真">
      <div className="cp-wrap sh-sec-in">
        <ul className={`sh-gal g${Math.min(gallery.length, 6)}`}>
          {gallery.map((x, i) => (
            <li key={x.src} data-sp="e" style={{ ["--i" as string]: i % 3, ["--r" as string]: i % 2 ? 3 : -3 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sized(x.src, 800)} alt={x.alt} width={x.w ?? 1200} height={x.h ?? 800} loading="lazy" decoding="async" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PanelList({ m, sp }: { m: M; sp?: string }) {
  return <>{m.panels.map((pd, i) => (<Panel key={i} d={pd} band={m.bandOf(i)} right={i % 2 === 1} sp={sp} />))}</>;
}

export function QuoteSection({ m, sp = "e p" }: { m: M; sp?: string }) {
  const { d } = m;
  if (m.hasArticlePage || !(d.story && (d.story.quote || d.story.closing.length > 0))) return null;
  return (
    <section className="sh-sec bg-black sh-quote" data-sp={sp}>
      <div className="cp-wrap sh-sec-in">
        {d.story.quote && (
          <blockquote className="sh-bq"><p>{d.story.quote}</p>{d.story.quoteCite && <cite>{d.story.quoteCite}</cite>}</blockquote>
        )}
        {d.story.closing.map((t, i) => (<p key={i} className="sh-closing">{t}</p>))}
      </div>
    </section>
  );
}

/** 店の特集記事への入口(記事のある店だけ。本文は /{v}/article/{id}。店のページには置かない) */
export function ArticleLinkSection({ m }: { m: M }) {
  const { articleLink: a, lastBand, menuBand, tone } = m;
  if (!a) return null;
  // 前の面・メニューの面・入口の色と重ならない色面
  const band = ["pink", "blue", "red", "sky"].find((b) => b !== lastBand && b !== (m.d.menus.length > 0 ? menuBand : "") && b !== tone) ?? "pink";
  return (
    <section className={`sh-sec bg-${band} sh-artlink`} data-sp="e" aria-labelledby="sh-artlink-h">
      <div className="cp-wrap sh-sec-in">
        <h2 className="sh-h" id="sh-artlink-h">{a.featured ? "特集記事" : "紹介記事"}</h2>
        {a.heads.length > 0 && (
          <ol className="sh-artlink-l">
            {a.heads.map((h, i) => (<li key={i}><span className="cp-cond">{String(i + 1).padStart(2, "0")}</span>{h}</li>))}
          </ol>
        )}
        <div className="cp-cta">
          <Link href={a.href} className="cp-red">特集記事を読む<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></Link>
        </div>
      </div>
    </section>
  );
}

export function MenuSection({ m, sp = "e" }: { m: M; sp?: string }) {
  const { d, menuBand, lastBand } = m;
  if (d.menus.length === 0) return null;
  return (
    <section className={`sh-sec bg-${m.hasQuote ? menuBand : lastBand === "sky" ? "pink" : "sky"} sh-menu`} data-sp={sp} aria-labelledby="sh-menu-h">
      <div className="cp-wrap sh-sec-in">
        <h2 className="sh-h" id="sh-menu-h">メニュー</h2>
        <ul className="sh-chips">
          {d.menus.map((mm, i) => (<li key={i}>{mm.name}</li>))}
        </ul>
      </div>
    </section>
  );
}

export function AccessSection({ m, typed = false, sp = "e" }: { m: M; typed?: boolean; sp?: string }) {
  const { d, s, phoneLink, all, path } = m;
  const T = ({ t }: { t: string }) => (typed ? <FxText text={t} mode="type" /> : <>{t}</>);
  return (
    <section className="sh-sec sh-access bg-black" id="access" data-sp={sp}>
      <div className="cp-wrap sh-sec-in">
        <h2 className="sh-h">店舗情報</h2>
        <dl className="sh-facts">
          <div><dt>住所</dt><dd><T t={s.address} /></dd></div>
          {d.station && <div><dt>最寄り駅</dt><dd>{d.station}</dd></div>}
          {d.hours.length > 0 && (
            <div><dt>営業時間</dt><dd>{d.hours.length === 1 ? d.hours[0] : (<ul className="cp-hours">{d.hours.map((h, i) => (<li key={i}>{h}</li>))}</ul>)}</dd></div>
          )}
          {d.holidays && <div><dt>定休日</dt><dd>{d.holidays}</dd></div>}
          {d.phone && <div><dt>電話</dt><dd>{phoneLink ? <a href={phoneLink.href}><T t={d.phone} /></a> : <T t={d.phone} />}</dd></div>}
        </dl>
        <CpLinks links={all} storeId={s.id} page={path} variant="row" />
        <p className="cp-note-d">営業時間などは変わることがあります。お出かけの前に公式サイトでご確認ください。</p>
        {d.sources.length > 0 && (
          <div className="sh-src">
            <h3>情報の出どころ</h3>
            <ul>
              {d.sources.map((x) => (
                <li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.label}<span className="cp-sr">(別のタブで開きます)</span></a></li>
              ))}
            </ul>
            {d.checkedAt && <p>確認日　<time dateTime={d.checkedAt}>{d.checkedAt.replace(/^(\d{4})-(\d{2})-(\d{2})$/, (_m, y, mo, da) => `${y}年${Number(mo)}月${Number(da)}日`)}</time></p>}
          </div>
        )}
      </div>
    </section>
  );
}

export function MoreShops({ m }: { m: M }) {
  const { site, sameArea, sameKind } = m;
  return (
    <>
      {sameArea.length > 0 && (
        <section className="cp-wrap cp-more-shops" aria-labelledby="cp-same-area">
          <h2 className="cp-h2 cp-rv" id="cp-same-area">同じエリアの{site.noun}</h2>
          <div className="cp-minis">{sameArea.map((x, i) => (<MiniCard key={x.id} site={site} s={x} i={i} />))}</div>
        </section>
      )}
      {sameKind.length > 0 && (
        <section className="cp-wrap cp-more-shops" aria-labelledby="cp-same-kind">
          <h2 className="cp-h2 cp-rv" id="cp-same-kind">同じ種類の{site.noun}</h2>
          <div className="cp-minis">{sameKind.map((x, i) => (<MiniCard key={x.id} site={site} s={x} i={i} />))}</div>
        </section>
      )}
      <p className="cp-wrap cp-more"><Link href={`${site.base}/special`}>特集記事を読む</Link></p>
    </>
  );
}
