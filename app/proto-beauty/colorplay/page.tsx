import Link from "next/link";
import Header from "@/components/portal/bproto/colorplay/Header";
import Footer from "@/components/portal/bproto/colorplay/Footer";
import { IconArrow, IconPin, IconSearch, IconSparkle } from "@/components/portal/bproto/colorplay/Icons";
import { loadFeatures, loadShops } from "@/lib/portal/bproto/colorplay/data";
import { BASE, searchHref } from "@/lib/portal/bproto/colorplay/types";

export default async function Page() {
  const [features, shops] = await Promise.all([loadFeatures(), loadShops()]);
  const has = (k: string) => shops.some((s) => s.kind === k);
  return (
    <>
      <Header onColor />
      <section className="cp-hero">
        <div className="cp-wrap cp-hero-in">
          <div className="cp-hero-copy">
            <h1 className="cp-h1">
              <span className="cp-line" style={{ ["--l" as string]: 0 }}>この街で、</span>
              <span className="cp-line" style={{ ["--l" as string]: 1 }}>わたしは</span>
              <span className="cp-line" style={{ ["--l" as string]: 2 }}>もっとカワイイ。</span>
            </h1>
            <p className="cp-hero-sub">見つかる、行ける、好きになれる。<br />地域のビューティーサロンポータル</p>
            <p className="cp-script cp-hero-sc" aria-hidden="true">Machinowa<br />&nbsp;&nbsp;&nbsp;Beauty</p>
          </div>
          <div className="cp-hero-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/_portal/bproto/colorplay/ref-hero.jpg" alt="" width={532} height={632} fetchPriority="high" />
          </div>
          <div className="cp-hero-tag" aria-hidden="true">
            <b>COLOR<br />PLAY</b>
            <span>キレイで、<br />あそぼう。</span>
          </div>
        </div>
      </section>

      <div className="cp-wrap">
        <nav className="cp-pills" aria-label="入口">
          <Link href={`${BASE}/search`} className="cp-pill p-pink" style={{ ["--p" as string]: 0 }}>
            <IconSearch size={30} />
            <span><b>お店を探す</b><small>サロンの種類・エリアから</small></span>
          </Link>
          <Link href={`${BASE}/search#area`} className="cp-pill p-blue" style={{ ["--p" as string]: 1 }}>
            <IconPin size={30} />
            <span><b>エリア</b><small>店の多い順に見る</small></span>
          </Link>
          <Link href="#features" className="cp-pill p-black" style={{ ["--p" as string]: 2 }}>
            <IconSparkle size={30} />
            <span><b>特集</b><small>特集記事を読む</small></span>
          </Link>
        </nav>
      </div>

      <section className="cp-panels" aria-label="種類から探す">
        <Link href={has("hair") ? searchHref({ kind: "hair" }) : `${BASE}/search`} className="cp-panel pn-hair">
          <span className="cp-panel-ph"><img src="/_portal/bproto/colorplay/ref-hair.jpg" alt="" loading="lazy" width={296} height={264} /></span>
          <span className="cp-panel-t"><b className="cp-cond">HAIR</b><span>で、<br />あそぶ。</span></span>
        </Link>
        <Link href={has("nail") ? searchHref({ kind: "nail" }) : `${BASE}/search`} className="cp-panel pn-nail">
          <span className="cp-panel-ph"><img src="/_portal/bproto/colorplay/own-nails.jpg" alt="" loading="lazy" width={380} height={282} /></span>
          <span className="cp-panel-t"><b className="cp-cond">NAIL</b><span>で、<br />ときめく。</span></span>
        </Link>
        <Link href={has("esthetic") ? searchHref({ kind: "esthetic" }) : `${BASE}/search`} className="cp-panel pn-beauty">
          <span className="cp-panel-ph"><img src="/_portal/bproto/colorplay/ref-beauty.jpg" alt="" loading="lazy" width={178} height={378} /></span>
          <span className="cp-panel-t"><b className="cp-cond">BEAUTY</b><span>で、<br />わたしらしく。</span></span>
        </Link>
      </section>

      <section className="cp-wrap cp-features" id="features">
        <h2 className="cp-h2 cp-rv">特集を、読む。<IconArrow size={22} /></h2>
        <ul className="cp-tiles">
          {features.slice(0, 4).map((f, i) => (
            <li key={f.id} className="cp-rv" style={{ ["--i" as string]: i }}>
              <Link href={f.href} className="cp-tile">
                {f.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.photo.src} alt={f.photo.alt} loading="lazy" decoding="async" />
                )}
                <span className="cp-tile-t">{f.title}</span>
                <span className="cp-tile-go" aria-hidden="true"><IconArrow size={16} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Footer />
    </>
  );
}
