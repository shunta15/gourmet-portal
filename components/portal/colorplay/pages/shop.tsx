/**
 * 1 店 1 ページ(/{v}/shop/{id})。COLOR PLAY(試作 app/proto-beauty/colorplay/shop/page.tsx の本番版)。
 * 写真は 0〜3 枚しかないので、枚数に合わせて組み方を変える(空の枠・壊れた画像・同じ写真の繰り返しを出さない)。
 *   0 枚: 写真の枠を出さず、色面と店名の大きな字で見せる / 1 枚: 大きく 1 枚 / 2〜3 枚: 並べる(大 1 枚+小 1〜2 枚)
 * 紹介文が無い店は、基本情報だけのページ。メニューの料金は出さない(データに価格があっても出さない)。
 * 構造化データ・metadata は、これまでの店ページ(components/portal/pages/shop.tsx)と同じ考え方(URL は変えない)。
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../Header";
import Footer from "../Footer";
import CpLinks from "../CpLinks";
import { MiniCard } from "../Cards";
import Heart from "@/components/portal/bproto/colorplay/Heart";
import JsonLd from "@/components/portal/JsonLd";
import { IconChevron, IconPin } from "@/components/portal/bproto/colorplay/Icons";
import { loadDetail, loadFeatures } from "@/lib/portal/colorplay/data";
import { searchHref, shopHref } from "@/lib/portal/colorplay/search";
import type { CpSite } from "@/lib/portal/colorplay/site";
import { getCategory, getVertical } from "@/lib/verticals";
import { shopLinks, socialLinks, type ShopLink } from "@/lib/portal/sns";
import { mapsSearchUrl } from "@/lib/maps";
import { breadcrumb, localBusiness } from "@/lib/seo/jsonld";
import { SITE_URL, absUrl } from "@/lib/seo/util";
import { sized } from "@/lib/imageUrl";

type Props = { params: Promise<{ id: string }> };

const safeDecode = (s: string): string => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export function cpShopPage(site: CpSite) {
  return async function Page({ params }: Props) {
    const { id } = await params;
    const hit = await loadDetail(site, safeDecode(id));
    if (!hit) notFound();
    const { detail: d, sameArea, sameKind } = hit;
    const features = await loadFeatures(site);
    const featuresHref = features.length > 0 ? `${site.base}#features` : undefined;
    const p = d.place;
    const s = d.shop;
    const v = getVertical(site.key);
    const cat = getCategory(v, p.category);
    const path = shopHref(site, s.id);
    const n = d.photos.length;
    const hasAbout = d.lede.length > 0 || d.sections.length > 0 || !!d.feature;

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

    const crumb = (
      <nav className="cp-crumb" aria-label="パンくず">
        <Link href={site.base}>TOP</Link><IconChevron size={12} />
        <Link href={searchHref(site, { pref: s.pref })}>{s.prefName}</Link><IconChevron size={12} />
        <Link href={searchHref(site, { kind: s.kind, pref: s.pref })}>{s.kindName}</Link><IconChevron size={12} />
        <span aria-current="page">{s.name}</span>
      </nav>
    );
    const addr = (
      <p className="cp-addr cp-addr-l"><IconPin size={18} /><span>{s.address}{d.headline && (<><br /><small>{d.headline}</small></>)}</span></p>
    );
    const cta = (
      <div className="cp-cta">
        <Heart id={s.id} name={s.name} className="cp-heart-l" />
        {primary && <CpLinks links={[primary]} storeId={s.id} page={path} variant="primary" />}
      </div>
    );
    const tabs = [
      { href: "#top", label: "トップ" },
      ...(hasAbout ? [{ href: "#about", label: "店について" }] : []),
      { href: "#access", label: "アクセス" },
    ];

    return (
      <>
        <JsonLd data={ld} />
        <JsonLd data={crumbLd} />
        <Header base={site.base} logoA={site.logoA} logoB={site.logoB} featuresHref={featuresHref} />
        <main id="cp-main" tabIndex={-1}>
          {n > 0 ? (
            <div className={`cp-wrap cp-shop-top`} id="top">
              <div className="cp-shop-left">
                {crumb}
                <h1 className="cp-h1d"><span className="cp-line" style={{ ["--l" as string]: 0 }}>{s.name}</span></h1>
                {d.nameKana && <p className="cp-kana">{d.nameKana}</p>}
                <p className="cp-tags"><span className={`cp-tag k-${s.kind}`}>{s.kindName}</span></p>
                {addr}
              </div>
              <div className="cp-shop-right">
                <div className={`cp-shop-photos n${n}`} data-sp="p">
                  {d.photos.map((x, i) => (
                    <div key={x.src} className={`cp-sp cp-sp-${i}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sized(x.src, i === 0 ? 1024 : 640)}
                        alt={x.alt}
                        width={x.w ?? 1200}
                        height={x.h ?? 800}
                        loading={i === 0 ? "eager" : "lazy"}
                        fetchPriority={i === 0 ? "high" : undefined}
                        decoding="async"
                      />
                    </div>
                  ))}
                  {n === 1 && <p className="cp-script cp-shop-sc" aria-hidden="true">{site.scriptShop.split("\n").map((l, i) => (<span key={i}>{i > 0 && <br />}{l}</span>))}</p>}
                </div>
                {cta}
              </div>
            </div>
          ) : (
            <div className="cp-wrap cp-shop-0" id="top">
              <div className={`cp-shop-0-in k-${s.kind}-bg`}>
                {crumb}
                <h1 className="cp-h1d cp-h1-big"><span className="cp-line" style={{ ["--l" as string]: 0 }}>{s.name}</span></h1>
                {d.nameKana && <p className="cp-kana">{d.nameKana}</p>}
                <p className="cp-tags"><span className={`cp-tag k-${s.kind}`}>{s.kindName}</span></p>
                {addr}
                {cta}
                <p className="cp-script cp-shop-0-sc" aria-hidden="true">{site.scriptShop.split("\n").map((l, i) => (<span key={i}>{i > 0 && <br />}{l}</span>))}</p>
              </div>
            </div>
          )}

          <nav className="cp-tabs cp-wrap" aria-label="ページ内の移動">
            {tabs.map((t, i) => (<a key={t.href} href={t.href} className={i === 0 ? "is-on" : undefined}>{t.label}</a>))}
          </nav>

          {hasAbout && (
            <section className="cp-wrap cp-about" id="about">
              <div className="cp-about-t cp-rv">
                {d.headline && <h2 className="cp-h2d">{d.headline}</h2>}
                {d.lede.map((t, i) => (<p key={i}>{t}</p>))}
                {d.sections.map((x) => (
                  <div key={x.heading} className="cp-sec">
                    <h3>{x.heading}</h3>
                    {x.body.map((t, i) => (<p key={i}>{t}</p>))}
                  </div>
                ))}
                {d.feature && (
                  <p className="cp-feat">
                    <Link href={d.feature.href} prefetch={false}>特集記事を読む<span aria-hidden="true"> →</span></Link>
                  </p>
                )}
              </div>
              <aside className="cp-bluecard cp-rv" aria-hidden="true" style={{ ["--i" as string]: 1 }}>
                <p className="cp-script">{site.scriptAbout.split("\n").map((l, i) => (<span key={i}>{i > 0 && <br />}{l}</span>))}</p>
              </aside>
            </section>
          )}

          <section className="cp-wrap cp-access cp-rv" id="access">
            <h2 className="cp-h2">アクセス</h2>
            <dl>
              <div><dt>住所</dt><dd>{s.address}</dd></div>
              {d.station && <div><dt>最寄り駅</dt><dd>{d.station}</dd></div>}
              {d.hours.length > 0 && (
                <div><dt>営業時間</dt><dd>{d.hours.length === 1 ? d.hours[0] : (<ul className="cp-hours">{d.hours.map((h, i) => (<li key={i}>{h}</li>))}</ul>)}</dd></div>
              )}
              {d.holidays && <div><dt>定休日</dt><dd>{d.holidays}</dd></div>}
              {d.phone && <div><dt>電話</dt><dd>{all.find((l) => l.kind === "phone") ? <a href={all.find((l) => l.kind === "phone")!.href}>{d.phone}</a> : d.phone}</dd></div>}
            </dl>
            <CpLinks links={all} storeId={s.id} page={path} variant="row" />
            <p className="cp-note-d">営業時間などは変わることがあります。お出かけの前に公式サイトでご確認ください。</p>
          </section>

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
        </main>
        <Footer site={site} featuresHref={featuresHref} />
      </>
    );
  };
}
