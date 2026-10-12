/**
 * 最初のページ(/beauty)。COLOR PLAY(試作 app/proto-beauty/colorplay/page.tsx の本番版)。
 * 最初の画面の動きは lib/portal/verticalDesign.ts の BEAUTY_HERO(本番は URL の ?hero= を読まない)。
 * リンクは本物のページ(/beauty/search ほか)へ。件数・特集はデータから数える。
 */
import Link from "next/link";
import JsonLd from "@/components/portal/JsonLd";
import Header from "../Header";
import Footer from "../Footer";
import { IconArrow, IconPin, IconSearch, IconSparkle } from "@/components/portal/bproto/colorplay/Icons";
import HeroView, { type HeroVariant } from "@/components/portal/bproto/colorplay/hero/HeroView";
import { loadFeatures, loadShops } from "@/lib/portal/colorplay/data";
import { searchHref } from "@/lib/portal/colorplay/search";
import type { CpSite } from "@/lib/portal/colorplay/site";
import { BEAUTY_HERO, heroOverrideAllowed } from "@/lib/portal/verticalDesign";
import { VERTICALS } from "@/lib/verticals";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { sized } from "@/lib/imageUrl";

// 大きな英字の帯(ことばは、いまの画面にあるものだけ)
const rep = (a: string[]) => Array.from({ length: 6 }, () => a).flat();
const RIB_A = rep(["COLOR PLAY", "●", "HAIR", "●", "NAIL", "●", "BEAUTY", "●"]);
const RIB_B = rep(["Machinowa Beauty", "●", "キレイで、あそぼう。", "●"]);
const TILT = [-9, 6, -6, 9];
const MAX_FEATURES = 8;

type SP = { [key: string]: string | string[] | undefined };

/** 3 つの丸薬形のボタン。stage=true は案 2(最初の画面の中でせり上がる)で、スクロール連動の印(data-sp)を付けない */
function Pills({ site, total, featuresHref, stage = false }: { site: CpSite; total: number; featuresHref?: string; stage?: boolean }) {
  const sp = stage ? {} : { "data-sp": "o", "data-sp-src": "cp-hero" };
  return (
    <nav className="cp-pills" id="cp-pills" {...sp} aria-label="入口">
      <Link href={`${site.base}/search`} className="cp-pill p-pink" style={{ ["--p" as string]: 0 }}>
        <IconSearch size={30} />
        <span><b>お店を探す</b><small>全国{total}店を、種類・エリアから</small></span>
      </Link>
      <Link href={`${site.base}/search#area`} className="cp-pill p-blue" style={{ ["--p" as string]: 1 }}>
        <IconPin size={30} />
        <span><b>エリア</b><small>店の多い順に見る</small></span>
      </Link>
      {featuresHref && (
        <Link href={featuresHref} className="cp-pill p-black" style={{ ["--p" as string]: 2 }}>
          <IconSparkle size={30} />
          <span><b>特集</b><small>特集記事を読む</small></span>
        </Link>
      )}
    </nav>
  );
}

export function cpTopPage(site: CpSite) {
  return async function Page({ searchParams }: { searchParams?: Promise<SP> }) {
    // 見本(production 以外)でだけ、URL の ?hero=1/2/3 で最初の画面の動きを見比べられる。本番は読まない(静的なまま)
    let hero: HeroVariant = BEAUTY_HERO;
    if (heroOverrideAllowed() && searchParams) {
      const sp = await searchParams;
      const x = Array.isArray(sp.hero) ? sp.hero[0] : sp.hero;
      if (x === "1" || x === "2" || x === "3") hero = Number(x) as HeroVariant;
    }
    const [features, shops] = await Promise.all([loadFeatures(site), loadShops(site)]);
    const count = (k: string) => shops.filter((s) => s.kind === k).length;
    const featuresHref = features.length > 0 ? "#features" : undefined;
    const v = VERTICALS[site.key];
    const ld = breadcrumb([
      { name: "マチノワ", url: absUrl("/") },
      { name: v.name, url: absUrl(v.path) },
    ]);
    const panel = (k: string, cls: string, img: { src: string; w: number; h: number }, big: string, t1: string, t2: string, n: number) => (
      <Link href={count(k) > 0 ? searchHref(site, { kind: k }) : `${site.base}/search`} className={`cp-panel ${cls}`} data-sp="e p" style={{ ["--n" as string]: n }}>
        <span className="cp-panel-ph">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.src} alt="" loading="lazy" width={img.w} height={img.h} />
        </span>
        <span className="cp-panel-t">
          <b className="cp-cond">{big}</b>
          <span>{t1}<br />{t2}</span>
          <small className="cp-panel-n">{site.kinds.find((x) => x.slug === k)?.name}　{count(k)}店</small>
        </span>
      </Link>
    );
    return (
      <>
        <JsonLd data={ld} />
        <Header base={site.base} logoA={site.logoA} logoB={site.logoB} featuresHref={featuresHref ? `${site.base}#features` : undefined} onColor />
        <main id="cp-main" tabIndex={-1}>
          <HeroView variant={hero} pills={hero === 2 ? <Pills site={site} total={shops.length} featuresHref={featuresHref} stage /> : undefined} />

          {hero !== 2 && (
            <>
              <div className="cp-wrap">
                <Pills site={site} total={shops.length} featuresHref={featuresHref} />
              </div>
              <nav className="cp-mini-pills" data-sp="o" data-sp-src="cp-pills" data-sp-show aria-label="入口(スクロール中に上に残る帯)">
                <Link href={`${site.base}/search`} className="mp-pink"><IconSearch size={18} />お店を探す</Link>
                <Link href={`${site.base}/search#area`} className="mp-blue"><IconPin size={18} />エリア</Link>
                {featuresHref && <Link href={featuresHref} className="mp-black"><IconSparkle size={18} />特集</Link>}
              </nav>
            </>
          )}

          <section className="cp-panels" data-sp="g" aria-label="種類から探す">
            {panel("hair", "pn-hair", { src: "/_portal/bproto/colorplay/ref-hair.jpg", w: 296, h: 264 }, "HAIR", "で、", "あそぶ。", 0)}
            {panel("nail", "pn-nail", { src: "/_portal/bproto/colorplay/own-nails.jpg", w: 380, h: 282 }, "NAIL", "で、", "ときめく。", 1)}
            {panel("esthetic", "pn-beauty", { src: "/_portal/bproto/colorplay/ref-beauty.jpg", w: 178, h: 378 }, "BEAUTY", "で、", "わたしらしく。", 2)}
          </section>

          <section className="cp-ribbons" data-sp="p" aria-hidden="true">
            <div className="cp-rib rib-a"><div className="cp-rib-row cp-cond">{RIB_A.map((w, i) => (<span key={i}>{w}</span>))}</div></div>
            <div className="cp-rib rib-b"><div className="cp-rib-row cp-cond">{RIB_B.map((w, i) => (<span key={i}>{w}</span>))}</div></div>
          </section>

          {features.length > 0 && (
            <section className="cp-wrap cp-features" id="features" data-sp="e">
              <h2 className="cp-h2 cp-rv">特集を、読む。<IconArrow size={22} /></h2>
              <ul className="cp-tiles">
                {features.slice(0, MAX_FEATURES).map((f, i) => (
                  <li key={f.id} data-sp="e p" style={{ ["--i" as string]: i % 4, ["--r" as string]: TILT[i % TILT.length] }}>
                    <Link href={f.href} prefetch={false} className="cp-tile">
                      {f.photo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sized(f.photo.src, 640)} alt={f.photo.alt} loading="lazy" decoding="async" width={f.photo.w} height={f.photo.h} />
                      )}
                      <span className="cp-tile-t">{f.title}</span>
                      <span className="cp-tile-go" aria-hidden="true"><IconArrow size={16} /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
        <Footer site={site} featuresHref={featuresHref ? `${site.base}#features` : undefined} />
      </>
    );
  };
}
