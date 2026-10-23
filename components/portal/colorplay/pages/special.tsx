/**
 * 特集の記事(/{v}/special/{slug})。利用シーン・業種の特集記事(lib/specials/{v}.json)。COLOR PLAY の記事のページ(pages/article.tsx)と同じ部品・同じ CSS(.sh-*)で、読む向きに組んだもの。
 *
 * 組み: 入口(色面が開いて、記事の題と導入の文が出る。「店舗紹介を見る」の赤いボタン) → 本文(見出しごとに色面が替わる節。節に出てくる店は店舗紹介のページ /{v}/shop/{id} へのリンク)
 *       → おわりの文(黒) → ほかの特集。文は JSON のまま(段落に分けるだけ)。星・口コミ・料金・順位は出さない。
 * robots は店のページと同じ gate(掲載数 3 以上で index)。canonical は自分自身。
 */
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/portal/JsonLd";
import Header from "../Header";
import Footer from "../Footer";
import { SpecialCard, specialTone, SPECIAL_TONES } from "../SpecialCards";
import { IconArrow, IconChevron } from "@/components/portal/bproto/colorplay/Icons";
import { loadShops } from "@/lib/portal/colorplay/data";
import { shopHref } from "@/lib/portal/colorplay/search";
import { findSpecial, jaDate, loadSpecials, paragraphs, specialHref, specialListHref, specialShops, type CpSpecial } from "@/lib/portal/colorplay/specials";
import type { CpSite } from "@/lib/portal/colorplay/site";
import type { CpShop } from "@/lib/portal/colorplay/types";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { getVertical } from "@/lib/verticals";
import { buildMetadata } from "@/lib/seo/meta";
import { article, breadcrumb } from "@/lib/seo/jsonld";
import { ogImage } from "@/lib/seo/og";
import { absUrl } from "@/lib/seo/util";
import { nameSize } from "./shopModel";
import "../article.css";
import "../special.css";

type Props = { params: Promise<{ slug: string }> };

function Section({ site, sp, i, band, right, shops }: { site: CpSite; sp: CpSpecial; i: number; band: string; right: boolean; shops: Map<string, CpShop> }) {
  const sec = sp.sections[i];
  const stores = sec.storeIds.map((id) => shops.get(id)).filter((s): s is CpShop => !!s);
  return (
    <section className={`sh-sec art-sec sp-sec bg-${band}`} data-sp="e p">
      <p className="sh-no cp-cond" aria-hidden="true">{String(i + 1).padStart(2, "0")}</p>
      <div className={`cp-wrap sh-sec-in sh-2col ${right ? "rev" : ""}`}>
        <div className="sh-hd">
          <h2 className="sh-h">{sec.heading}</h2>
        </div>
        <div className={`sh-card ${right ? "al-r" : ""}`}>
          {paragraphs(sec.text).map((t, k) => (<p key={k}>{t}</p>))}
          {stores.length > 0 && (
            <div className="sp-stores">
              <h3>この節に出てくる店</h3>
              <ul>
                {stores.map((s) => (
                  <li key={s.id}>
                    <Link href={shopHref(site, s.id)} prefetch={false}>
                      <span className="sp-sn"><strong>{s.name}</strong><small>{s.kindName}　{s.prefName}{s.city ? ` ${s.city}` : ""}</small></span>
                      <span className="sp-go" aria-hidden="true"><IconArrow size={14} /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Body({ site, sp, index, shops }: { site: CpSite; sp: CpSpecial; index: number; shops: Map<string, CpShop> }) {
  const v = getVertical(site.key);
  const tone = specialTone(index);
  const ink = tone === "pink" || tone === "sky" || tone === "blue";
  // 色面は 入口の色と黒を除いて順に回し、隣どうしが同じ色にならないようにする
  const pool = SPECIAL_TONES.filter((b) => b !== tone);
  let k = 0;
  let prev = "";
  const take = (): string => {
    for (;;) {
      const b = pool[k++ % pool.length];
      if (b !== prev) {
        prev = b;
        return b;
      }
    }
  };
  const bands = sp.sections.map(() => take());
  const all = loadSpecials(site);
  const others = all.filter((x) => x.slug !== sp.slug);
  const path = specialHref(site, sp.slug);
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    { name: "特集", url: absUrl(specialListHref(site)) },
    { name: sp.title, url: absUrl(path) },
  ]);
  const ldArticle = article({
    headline: sp.title,
    description: sp.lead,
    image: absUrl(ogImage(path, sp.title).url),
    url: absUrl(path),
    dateModified: sp.date,
  });

  return (
    <>
      <JsonLd data={ld} />
      <JsonLd data={ldArticle} />
      <Header base={site.base} logoA={site.logoA} logoB={site.logoB} onColor ink={ink} />
      <main id="cp-main" tabIndex={-1}>
        <section className={`sh-hero art-hero sp-hero t-${tone} no-ph`} id="top" data-sp="o">
          <div className="sh-curtain" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="sh-shape sh-s1" aria-hidden="true" />
          <div className="sh-shape sh-s2" aria-hidden="true" />
          <div className="cp-wrap sh-hero-in">
            <nav className="cp-crumb" aria-label="パンくず">
              <Link href={site.base}>TOP</Link><IconChevron size={12} />
              <Link href={specialListHref(site)}>特集</Link><IconChevron size={12} />
              <span aria-current="page">{sp.title}</span>
            </nav>
            <div className="sh-hero-grid">
              <div className="sh-hero-copy">
                <p className="cp-tags"><span className="cp-tag">特集</span></p>
                <h1 className={`sh-name sz-${nameSize(sp.title.length)}`}><span className="cp-line" style={{ ["--l" as string]: 0 }}>{sp.title}</span></h1>
                <p className="sp-lead">{sp.lead}</p>
                <p className="sp-date"><time dateTime={sp.date}>{jaDate(sp.date)}</time></p>
                <div className="cp-cta">
                  <Link href={`${site.base}/shop`} className="cp-red">店舗紹介を見る<IconArrow size={18} /></Link>
                </div>
              </div>
            </div>
          </div>
          <span className="cp-hero-cut" aria-hidden="true" />
        </section>

        {sp.sections.map((_, i) => (<Section key={i} site={site} sp={sp} i={i} band={bands[i]} right={i % 2 === 1} shops={shops} />))}

        {sp.closing && (
          <section className="sh-sec art-quote bg-black sh-quote" data-sp="e p">
            <div className="cp-wrap sh-sec-in">
              <p className="sp-closing">{sp.closing}</p>
            </div>
          </section>
        )}

        {others.length > 0 && (
          <section className="cp-wrap sp-others-wrap" aria-labelledby="sp-others-h">
            <h2 className="cp-h2 cp-rv" id="sp-others-h">ほかの特集</h2>
            <div className="art-list sp-others">
              {others.map((s) => (<SpecialCard key={s.slug} site={site} sp={s} i={all.indexOf(s)} no={all.indexOf(s) + 1} />))}
            </div>
            <p className="cp-more cp-more-pair">
              <Link href={`${site.base}/shop`}>店舗紹介を見る</Link>
              <Link href={specialListHref(site)}>特集の一覧を見る</Link>
            </p>
          </section>
        )}
      </main>
      <Footer site={site} />
    </>
  );
}

export function cpSpecialPage(site: CpSite) {
  const staticParams = () => loadSpecials(site).map((s) => ({ slug: s.slug }));

  async function generateMetadata({ params }: Props): Promise<Metadata> {
    const sp = findSpecial(site, (await params).slug);
    if (!sp) return notFoundMetadata();
    const v = getVertical(site.key);
    return buildMetadata({
      vertical: site.key,
      title: `${sp.title}｜${v.brand}`,
      description: sp.lead,
      path: specialHref(site, sp.slug),
      count: (await loadShops(site)).length,
    });
  }

  async function Page({ params }: Props) {
    const sp = findSpecial(site, (await params).slug);
    if (!sp) notFound();
    const index = loadSpecials(site).indexOf(sp);
    return <Body site={site} sp={sp} index={index} shops={await specialShops(site, sp)} />;
  }

  return { generateMetadata, Page, staticParams };
}
