/**
 * 最初のページ(/beauty)。COLOR PLAY。
 * 上から: 赤い画面(動きは「塗る」。オーナー決定 2026-10-13)
 *   → 3 つのボタン(お店を探す・エリア・種類) → 種類を選ぶ色の札 → エリアを選ぶ所 → 店の写真の札。
 * リンクは本物のページ(/beauty/search ほか)へ。件数はすべてデータから数える。
 * 飾りの画像(/_portal/bproto/colorplay/*.jpg)は、同じファイル名で差し替えるだけで済む(幅・高さは比率だけを使い、固定の大きさにしない)。
 */
import Link from "next/link";
import "./top-tiles.css";
import JsonLd from "@/components/portal/JsonLd";
import Header from "../Header";
import Footer from "../Footer";
import { IconAll, IconArrow, IconPin, IconSearch } from "@/components/portal/bproto/colorplay/Icons";
import HeroView from "@/components/portal/bproto/colorplay/hero/HeroView";
import { loadShops } from "@/lib/portal/colorplay/data";
import { KIND_IMAGES } from "@/lib/portal/colorplay/kindImages";
import { searchHref, shopHref } from "@/lib/portal/colorplay/search";
import type { CpShop } from "@/lib/portal/colorplay/types";
import type { CpSite } from "@/lib/portal/colorplay/site";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { VERTICALS } from "@/lib/verticals";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { sized } from "@/lib/imageUrl";

// 大きな英字の帯(ことばは、いまの画面にあるものだけ)
const rep = (a: string[]) => Array.from({ length: 6 }, () => a).flat();
const RIB_A = rep(["COLOR PLAY", "●", "HAIR", "●", "NAIL", "●", "BEAUTY", "●"]);
const RIB_B = rep(["Machinowa Beauty", "●", "キレイで、あそぼう。", "●"]);
const TILT = [-9, 6, -6, 9];
const SHOP_TILES = 8;

/** 種類の札: 英字・色。写真は lib/portal/colorplay/kindImages.ts の表(種類と合うものだけ。無い種類は色面と大きな字だけ) */
const PANELS: Record<string, { en: string[]; cls: string }> = {
  hair: { en: ["HAIR"], cls: "kp-sky" },
  esthetic: { en: ["ESTHETIC"], cls: "kp-red" },
  "hair-removal": { en: ["HAIR", "REMOVAL"], cls: "kp-blue" },
  nail: { en: ["NAIL"], cls: "kp-pink" },
  eyelash: { en: ["EYELASH"], cls: "kp-black" },
};

/** 店の写真の札: 写真のある店から、種類が偏らないよう 種類を順に回して 1 軒ずつ(各種類の中は店 ID の順)。決め方は固定 */
function pickShops(shops: CpShop[], kinds: string[], n: number): CpShop[] {
  const lists = kinds.map((k) => shops.filter((s) => s.kind === k && s.main).sort((a, b) => a.id.localeCompare(b.id)));
  const out: CpShop[] = [];
  for (let round = 0; out.length < n; round++) {
    let any = false;
    for (const l of lists) {
      if (l[round] && out.length < n) {
        out.push(l[round]);
        any = true;
      }
    }
    if (!any) break;
  }
  return out;
}

/** 3 つの丸薬形のボタン */
function Pills({ site, total }: { site: CpSite; total: number }) {
  return (
    <nav className="cp-pills" id="cp-pills" data-sp="o" data-sp-src="cp-hero" aria-label="入口">
      <Link href={`${site.base}/search`} className="cp-pill p-pink" style={{ ["--p" as string]: 0 }}>
        <IconSearch size={30} />
        <span><b>お店を探す</b><small>全国{total}店を、種類・エリアから</small></span>
      </Link>
      <Link href="#area" className="cp-pill p-blue" style={{ ["--p" as string]: 1 }}>
        <IconPin size={30} />
        <span><b>エリア</b><small>店の多い順に見る</small></span>
      </Link>
      <Link href="#kinds" className="cp-pill p-black" style={{ ["--p" as string]: 2 }}>
        <IconAll size={30} />
        <span><b>種類</b><small>ヘアサロン・ネイルなど</small></span>
      </Link>
    </nav>
  );
}

export function cpTopPage(site: CpSite) {
  return async function Page() {
    const shops = await loadShops(site);
    const v = VERTICALS[site.key];
    const ld = breadcrumb([
      { name: "マチノワ", url: absUrl("/") },
      { name: v.name, url: absUrl(v.path) },
    ]);

    // 種類(件数 0 は出さない)
    const kinds = site.kinds
      .map((k) => ({ ...k, n: shops.filter((s) => s.kind === k.slug).length }))
      .filter((k) => k.n > 0);
    // エリア(店のある都道府県。多い順。同数は都道府県コード順)
    const prefCount = new Map<string, number>();
    for (const s of shops) prefCount.set(s.pref, (prefCount.get(s.pref) ?? 0) + 1);
    const areas = [...prefCount.entries()]
      .map(([slug, n]) => ({ slug, n, p: PREFECTURES.find((x) => x.slug === slug)! }))
      .sort((a, b) => b.n - a.n || a.p.code.localeCompare(b.p.code));
    const tiles = pickShops(shops, kinds.map((k) => k.slug), SHOP_TILES);
    const tier = (n: number) => (n >= 9 ? "xl" : n >= 4 ? "l" : n >= 2 ? "m" : "s");

    return (
      <>
        <JsonLd data={ld} />
        <Header base={site.base} logoA={site.logoA} logoB={site.logoB} onColor />
        <main id="cp-main" tabIndex={-1}>
          <HeroView />

          <div className="cp-wrap">
            <Pills site={site} total={shops.length} />
          </div>
          <nav className="cp-mini-pills" data-sp="o" data-sp-src="cp-pills" data-sp-show aria-label="入口(スクロール中に上に残る帯)">
            <Link href={`${site.base}/search`} className="mp-pink"><IconSearch size={18} />お店を探す</Link>
            <Link href="#area" className="mp-blue"><IconPin size={18} />エリア</Link>
            <Link href="#kinds" className="mp-black"><IconAll size={18} />種類</Link>
          </nav>

          <section className="cp-kinds-sec" id="kinds" aria-labelledby="cp-kinds-h">
            <div className="cp-wrap"><h2 className="cp-h2 cp-rv" id="cp-kinds-h">種類を、選ぶ。<IconArrow size={22} /></h2></div>
            <div className="cp-kp" data-sp="g">
              {kinds.map((k, i) => {
                const pn = PANELS[k.slug] ?? { en: [k.name], cls: "kp-sky" };
                const img = KIND_IMAGES[k.slug];
                return (
                  <Link key={k.slug} href={searchHref(site, { kind: k.slug })} className={`kp-i ${pn.cls} ${img ? "has-ph" : "no-ph"} ${Math.max(...pn.en.map((l) => l.length)) >= 7 ? "lg" : ""}`} data-sp="e" style={{ ["--n" as string]: i, ["--of" as string]: kinds.length }}>
                    <span className="kp-c">
                      {img && (
                        <span className="kp-ph">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.src} alt="" loading="lazy" width={img.w} height={img.h} style={img.pos ? { objectPosition: img.pos } : undefined} />
                        </span>
                      )}
                      <span className="kp-t">
                        <b className="cp-cond">{pn.en.map((l, j) => (<span key={j}>{l}</span>))}</b>
                        <em>{k.name}</em>
                        <small>{k.n}店</small>
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="cp-ribbons" data-sp="p" aria-hidden="true">
            <div className="cp-rib rib-a"><div className="cp-rib-row cp-cond">{RIB_A.map((w, i) => (<span key={i}>{w}</span>))}</div></div>
            <div className="cp-rib rib-b"><div className="cp-rib-row cp-cond">{RIB_B.map((w, i) => (<span key={i}>{w}</span>))}</div></div>
          </section>

          <section className="cp-wrap cp-area-sec" id="area" aria-labelledby="cp-area-h">
            <h2 className="cp-h2 cp-rv" id="cp-area-h">エリアを、選ぶ。<IconArrow size={22} /></h2>
            <ul className="cp-area-list">
              {areas.map((a, i) => (
                <li key={a.slug} data-sp="e" style={{ ["--i" as string]: i % 6 }}>
                  <Link href={searchHref(site, { pref: a.slug })} className={`ar ar-${tier(a.n)}`}>
                    <b>{a.p.short}</b><small>{a.n}店</small>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {tiles.length > 0 && (
            <section className="cp-wrap cp-features" id="shops" data-sp="e" aria-labelledby="cp-shops-h">
              <h2 className="cp-h2 cp-rv" id="cp-shops-h">お店を、のぞく。<IconArrow size={22} /></h2>
              <ul className="cp-tiles">
                {tiles.map((s, i) => (
                  <li key={s.id} data-sp="e p" style={{ ["--i" as string]: i % 4, ["--r" as string]: TILT[i % TILT.length] }}>
                    <Link href={shopHref(site, s.id)} prefetch={false} className="cp-tile">
                      {s.main && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sized(s.main.src, 640)} alt={s.main.alt} loading="lazy" decoding="async" width={s.main.w} height={s.main.h} />
                      )}
                      <span className="cp-tile-t"><strong>{s.name}</strong><small>{s.prefName}{s.city ? ` ${s.city}` : ""}　{s.kindName}</small></span>
                      <span className="cp-tile-go" aria-hidden="true"><IconArrow size={16} /></span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="cp-more cp-more-pair">
                <Link href={`${site.base}/search`}>すべてのお店を見る({shops.length}店)</Link>
                <Link href={`${site.base}/special`}>特集記事を読む</Link>
              </p>
            </section>
          )}
        </main>
        <Footer site={site} />
      </>
    );
  };
}
