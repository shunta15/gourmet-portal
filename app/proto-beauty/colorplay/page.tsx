import Link from "next/link";
import Header from "@/components/portal/bproto/colorplay/Header";
import Footer from "@/components/portal/bproto/colorplay/Footer";
import { IconArrow, IconPin, IconSearch, IconSparkle } from "@/components/portal/bproto/colorplay/Icons";
import HeroView, { type HeroVariant } from "@/components/portal/bproto/colorplay/hero/HeroView";
import { loadFeatures, loadShops } from "@/lib/portal/bproto/colorplay/data";
import { BASE, searchHref } from "@/lib/portal/bproto/colorplay/types";

// 大きな英字の帯(ことばは、いまの画面にあるものだけ)
const rep = (a: string[]) => Array.from({ length: 6 }, () => a).flat();
const RIB_A = rep(["COLOR PLAY", "●", "HAIR", "●", "NAIL", "●", "BEAUTY", "●"]);
const RIB_B = rep(["Machinowa Beauty", "●", "キレイで、あそぼう。", "●"]);
const TILT = [-9, 6, -6, 9];

// 3 つの丸薬形のボタン。stage=true は案 2(最初の画面の中でせり上がる)で、スクロール連動の印(data-sp)を付けない
function Pills({ stage = false }: { stage?: boolean }) {
  const sp = stage ? {} : { "data-sp": "o", "data-sp-src": "cp-hero" };
  return (
    <nav className="cp-pills" id="cp-pills" {...sp} aria-label="入口">
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
  );
}

// ?hero=1 / 2 / 3 で最初の画面の動きの案を切り替える(1・2・3 以外は今のまま)
function pickHero(v: string | string[] | undefined): HeroVariant | 0 {
  const x = Array.isArray(v) ? v[0] : v;
  return x === "1" ? 1 : x === "2" ? 2 : x === "3" ? 3 : 0;
}

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const [features, shops, sp] = await Promise.all([loadFeatures(), loadShops(), searchParams]);
  const hero = pickHero(sp.hero);
  const has = (k: string) => shops.some((s) => s.kind === k);
  return (
    <>
      <Header onColor />
      {hero !== 0 ? (
        <HeroView variant={hero} pills={hero === 2 ? <Pills stage /> : undefined} />
      ) : (
      <section className="cp-hero" id="cp-hero" data-sp="o">
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
        <span className="cp-hero-cut" aria-hidden="true" />
      </section>
      )}

      {hero !== 2 && (
        <>
          <div className="cp-wrap">
            <Pills />
          </div>

          <nav className="cp-mini-pills" data-sp="o" data-sp-src="cp-pills" data-sp-show aria-label="入口(スクロール中に上に残る帯)">
            <Link href={`${BASE}/search`} className="mp-pink"><IconSearch size={18} />お店を探す</Link>
            <Link href={`${BASE}/search#area`} className="mp-blue"><IconPin size={18} />エリア</Link>
            <Link href="#features" className="mp-black"><IconSparkle size={18} />特集</Link>
          </nav>
        </>
      )}

      <section className="cp-panels" data-sp="g" aria-label="種類から探す">
        <Link href={has("hair") ? searchHref({ kind: "hair" }) : `${BASE}/search`} className="cp-panel pn-hair" data-sp="e p" style={{ ["--n" as string]: 0 }}>
          <span className="cp-panel-ph"><img src="/_portal/bproto/colorplay/ref-hair.jpg" alt="" loading="lazy" width={296} height={264} /></span>
          <span className="cp-panel-t"><b className="cp-cond">HAIR</b><span>で、<br />あそぶ。</span></span>
        </Link>
        <Link href={has("nail") ? searchHref({ kind: "nail" }) : `${BASE}/search`} className="cp-panel pn-nail" data-sp="e p" style={{ ["--n" as string]: 1 }}>
          <span className="cp-panel-ph"><img src="/_portal/bproto/colorplay/own-nails.jpg" alt="" loading="lazy" width={380} height={282} /></span>
          <span className="cp-panel-t"><b className="cp-cond">NAIL</b><span>で、<br />ときめく。</span></span>
        </Link>
        <Link href={has("esthetic") ? searchHref({ kind: "esthetic" }) : `${BASE}/search`} className="cp-panel pn-beauty" data-sp="e p" style={{ ["--n" as string]: 2 }}>
          <span className="cp-panel-ph"><img src="/_portal/bproto/colorplay/ref-beauty.jpg" alt="" loading="lazy" width={178} height={378} /></span>
          <span className="cp-panel-t"><b className="cp-cond">BEAUTY</b><span>で、<br />わたしらしく。</span></span>
        </Link>
      </section>

      <section className="cp-ribbons" data-sp="p" aria-hidden="true">
        <div className="cp-rib rib-a"><div className="cp-rib-row cp-cond">{RIB_A.map((w, i) => (<span key={i}>{w}</span>))}</div></div>
        <div className="cp-rib rib-b"><div className="cp-rib-row cp-cond">{RIB_B.map((w, i) => (<span key={i}>{w}</span>))}</div></div>
      </section>

      <section className="cp-wrap cp-features" id="features" data-sp="e">
        <h2 className="cp-h2 cp-rv">特集を、読む。<IconArrow size={22} /></h2>
        <ul className="cp-tiles">
          {features.slice(0, 4).map((f, i) => (
            <li key={f.id} data-sp="e p" style={{ ["--i" as string]: i, ["--r" as string]: TILT[i % TILT.length] }}>
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
