import type { Metadata } from "next";
import Link from "next/link";
import "@/components/portal/portal.css";
import PortalFonts from "@/components/portal/PortalFonts";
import PortalHero, { type HeroVertical } from "@/components/portal/PortalHero";
import Entrances from "@/components/portal/Entrances";
import AreaBlocks from "@/components/portal/AreaBlocks";
import FeatureStrip from "@/components/portal/FeatureStrip";
import RingMark from "@/components/portal/RingMark";
import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";
import { VERTICAL_FACE } from "@/lib/portal/meta";
import { getPortalHomeData } from "@/lib/portal/home";

// 総合トップは試作。検索エンジンには載せない（公開時に外す）。
export const metadata: Metadata = {
  title: "マチノワ — 街の店を、業種をまたいで探す",
  description:
    "グルメ・ビューティー・ボディケア・ペット・おでかけ・ステイ。街の店を、業種をまたいで探せるポータル「マチノワ」。",
  alternates: { canonical: "/" },
  robots: { index: false, follow: false },
};

const ORDER: VerticalKey[] = ["gourmet", "beauty", "bodycare", "pet", "leisure", "stay"];

const MANIFESTO: { t: string; k?: VerticalKey }[] = [
  { t: "食べる。", k: "gourmet" },
  { t: "整える。", k: "beauty" },
  { t: "ほぐす。", k: "bodycare" },
  { t: "連れていく。", k: "pet" },
  { t: "出かける。", k: "leisure" },
  { t: "泊まる。", k: "stay" },
  { t: "暮らしの用事は、" },
  { t: "どれも街の中にある。" },
  { t: "マチノワは、" },
  { t: "それを一つの輪でつなぐ。" },
];

export default async function Page() {
  const data = await getPortalHomeData();

  const heroVerticals: HeroVertical[] = ORDER.map((k) => ({
    key: k,
    name: VERTICALS[k].name,
    en: VERTICAL_FACE[k].en,
    path: VERTICALS[k].path,
    color: VERTICALS[k].accent.color,
    live: k === "gourmet",
  }));

  return (
    <>
      <PortalFonts />

      <PortalHero verticals={heroVerticals} total={data.gourmetTotal} features={data.featureTotal} />

      <section className="mp-sec mp-mf" data-progress="through" aria-label="マチノワの考え方">
        <div className="mp-wrap">
          <p className="mp-kicker">Why Machinowa</p>
          <p className="mp-mf-text" style={{ ["--n" as string]: MANIFESTO.length }}>
            {MANIFESTO.map((w, i) => (
              <span
                key={i}
                className="w"
                style={{ ["--i" as string]: i, ...(w.k ? { ["--ac" as string]: VERTICALS[w.k].accent.color } : {}) }}
                data-v={w.k}
              >
                {w.t}
              </span>
            ))}
          </p>
        </div>
      </section>

      <Entrances
        gourmet={VERTICALS.gourmet}
        others={ORDER.slice(1).map((k) => VERTICALS[k])}
        total={data.gourmetTotal}
        prefCount={data.gourmetPrefCount}
        featureTotal={data.featureTotal}
        photos={data.photos}
      />

      <section id="area" className="mp-sec mp-area" aria-labelledby="mp-area-h">
        <div className="mp-wrap">
          <header className="mp-sec-head" data-reveal>
            <p className="mp-kicker">02 — Areas</p>
            <h2 id="mp-area-h" className="mp-h2">エリアから探す</h2>
            <p className="mp-lead">
              都道府県を地方ごとに並べています。グルメの掲載がある県は店数を表示し、グルメの地域ページへ進みます。
            </p>
          </header>
          <AreaBlocks
            skyline
            items={data.prefs.map((p) => ({
              slug: p.slug,
              short: p.short,
              block: p.block,
              count: p.count,
              href: p.href,
              lit: p.hasGourmet,
            }))}
          />
        </div>
      </section>

      <FeatureStrip items={data.features} />

      <section id="about" className="mp-sec mp-about" aria-labelledby="mp-about-h">
        <div className="mp-wrap mp-about-grid">
          <header data-reveal>
            <p className="mp-kicker">04 — About</p>
            <h2 id="mp-about-h" className="mp-h2 sm">マチノワについて</h2>
            <RingMark className="mp-about-ring" />
          </header>
          <div data-reveal style={{ ["--i" as string]: 1 }}>
            <p className="mp-about-lead">
              「マチノワ／街の輪」は、日本の街と店を語るオンライン誌です。一軒の店を、街の文脈と一緒に紹介します。
            </p>
            <p className="mp-about-text">
              記事には事実情報のみを載せ、誇張・推測・虚偽は使いません。営業時間や料金など変動する情報は「訪問前に公式確認」と明記します。
            </p>
            <p className="mp-about-links">
              <Link href="/about" className="mp-btn ghost" data-cursor="ABOUT">
                編集部について <span aria-hidden="true">→</span>
              </Link>
              <Link href="/editorial/guidelines">掲載基準</Link>
              <Link href="/contact">お問い合わせ</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
