import Link from "next/link";
import { getAllRestaurants } from "@/lib/db/restaurants";
import { FEATURES } from "@/lib/data";
import { REGIONS, type RegionKey } from "@/lib/regions";
import { sized } from "@/lib/imageUrl";
import { buildChapters, buildFlags, HERO_PICK, photoFor } from "@/lib/portal/noren/picks";
import NorenHeroReal from "./NorenHeroReal";
import Chapter from "@/components/portal/noren/Chapter";
import Nobori from "@/components/portal/noren/Nobori";
import OpenSearch from "@/components/portal/noren/OpenSearch";
import { buildOpenSearchData } from "@/lib/portal/noren/openSearch";
import "../noren/top.css";
import "./real.css";
import { NOREN_HERO_KEYS, type NorenLinks } from "@/lib/portal/noren/nav";
import type { NorenRealSpShape } from "@/lib/portal/noren/realTop";
import type { DyeKind } from "./clothReal";

/**
 * 暖簾のグルメのトップ（リアル版の試作）。components/portal/pages/gourmet-noren-home.tsx を写して、
 * 最初の画面（NorenHero）だけを NorenHeroReal に差し替えたもの。最初の画面より下は、いまの入口と同じ中身。
 * 見本（/proto-noren/real。allowUrlOverride で URL の ?dye= などを許す）と、本番の /gourmet（lib/portal/noren/realTop.ts のスイッチが true のときだけ。色は固定）で使う。
 */

function splitTitle(t: string): [string, string] {
  const i = t.search(/[、。，]/);
  if (i <= 0 || i > 12) return [t.length > 12 ? t.slice(0, 12) : t, t.length > 12 ? t.slice(12) : ""];
  return [t.slice(0, i), t.slice(i + 1).replace(/^[、。\s]+/, "")];
}

const PRINCIPLES = [
  { k: "誇張しない", en: "No exaggeration", body: "「最高」「絶品」といった言葉は使いません。住所、営業時間、写真など、確かめられることを書きます。" },
  { k: "順位をつけない", en: "No rankings", body: "点数や星、ランキングで店を並べません。このページの並びも、順位ではありません。" },
  { k: "口コミを転載しない", en: "No reposted reviews", body: "口コミの文章は転載しません。評価の数字は、出典（Google）を明記したものだけを載せます。" },
];

export default async function GourmetNorenHomeReal({
  links,
  dye = "ai",
  allowUrlOverride = false,
  spShape,
  allowSpUrl = false,
}: {
  links: NorenLinks;
  dye?: DyeKind;
  allowUrlOverride?: boolean;
  /** スマホ幅の暖簾の丈の案（省略すると realTop.ts の NOREN_REAL_SP_SHAPE） */
  spShape?: NorenRealSpShape;
  /** URL の ?sp= で丈の案を上書きできるか（本番でないときだけ true。app/gourmet/page.tsx が VERCEL_ENV で判定して渡す） */
  allowSpUrl?: boolean;
}) {
  const restaurants = await getAllRestaurants();
  const byId = new Map(restaurants.map((r) => [r.id, r]));
  const regionName = (k: string) => REGIONS[k as RegionKey]?.name ?? k;

  const chapters = buildChapters(restaurants, regionName);
  const openSearchData = buildOpenSearchData(restaurants);

  const heroShop = byId.get(HERO_PICK[0]);
  const heroPhoto = sized((heroShop && photoFor(heroShop, HERO_PICK[1])) || chapters[3].shops[0].img, 1600);

  const counts = restaurants.reduce<Record<string, number>>((m, r) => ((m[r.region] = (m[r.region] ?? 0) + 1), m), {});
  const regions = (Object.keys(REGIONS) as RegionKey[])
    .filter((k) => counts[k])
    .sort((a, b) => counts[b] - counts[a])
    .map((k) => ({ key: k, name: REGIONS[k].name, en: REGIONS[k].nameEn, count: counts[k] }));
  const flags = buildFlags(restaurants, regions);

  const seen = new Set<string>();
  const seenMain = new Set<string>();
  const feats: typeof FEATURES = [];
  for (const f of FEATURES) {
    const main = splitTitle(f.title)[0];
    if (!f.image || seen.has(f.tag) || seenMain.has(main)) continue;
    seen.add(f.tag);
    seenMain.add(main);
    feats.push(f);
    if (feats.length >= 6) break;
  }

  return (
    <>
      {/* 1 暖簾（リアル版） */}
      {/* 最初の暖簾は 5 枚（和・麺・肉・酒・茶。lib/portal/noren/nav.ts の NOREN_HERO_KEYS）。章そのものは 7 つのまま */}
      <NorenHeroReal
        photo={heroPhoto}
        count={restaurants.length}
        areas={regions.length}
        chapters={NOREN_HERO_KEYS.map((k) => chapters.find((c) => c.key === k)!).map((c) => ({ key: c.key, kanji: c.kanji, ja: c.ja, en: c.en }))}
        defaultDye={dye}
        allowUrlOverride={allowUrlOverride}
        spShape={spShape}
        allowSpUrl={allowSpUrl}
        genres={openSearchData.cuisines}
      />

      {/* 2 店をさがす(2026-10-11 オーナー指示。暖簾の直後、章の入口の前。件数はここ=サーバーで数える) */}
      <OpenSearch data={openSearchData} />

      {/* 3 章 */}
      <div className="vN-chs" id="chapters">
        <div className="vN-chs-intro">
          <div className="vN-chs-intro-tx vN-rv">
            <p className="vN-chs-intro-k">七つの章</p>
            <p className="vN-chs-intro-t">
              和、洋、中、麺、肉、酒、茶。<br />
              暖簾の一文字ごとに、<br />
              実在の店を数軒ずつ。
            </p>
            <p className="vN-chs-intro-s">スクロールで店が入れ替わります。縦書きの店名を押すと、その店のページへ。数字は、その章に入る掲載店の数です。</p>
            <p className="vN-chs-intro-more">
              <span>言葉やエリアで絞るなら、上の「店を、さがす。」から。</span>
              <a href="#open-search" data-cursor="JUMP">店をさがす <span aria-hidden="true">↑</span></a>
            </p>
          </div>
          <ul className="vN-toc vN-rv" style={{ ["--d" as string]: 1 }}>
            {chapters.map((c) => (
              <li key={c.key}>
                <a href={`#ch-${c.key}`} data-cursor="JUMP">
                  <i className="vN-toc-no">{c.no}</i>
                  <b className="vN-toc-k">{c.kanji}</b>
                  <span className="vN-toc-c">
                    <em>{c.count}</em>軒
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        {chapters.map((c, i) => (
          <Chapter key={c.key} c={c} index={i} total={chapters.length} shopBase={links.shopBase} />
        ))}
      </div>

      {/* 4 エリア */}
      <section className="vN-areas" id="areas" aria-label="エリアから">
        <div className="vN-areas-head vN-rv">
          <h2 className="vN-tate-h">街から</h2>
          <p className="vN-areas-note">
            のぼりの幅と長さは、掲載数に比例。<br />
            布に透けるのは、そのエリアの実在の店。<br />
            <span>全 {restaurants.length} 軒 / {regions.length} エリア</span>
          </p>
        </div>
        <div className="vN-rv">
          <Nobori flags={flags} total={restaurants.length} shopBase={links.shopBase} />
        </div>
      </section>

      {/* 5 特集（お品書き） */}
      <section className="vN-menu" id="features" aria-label="まとめ記事">
        <div className="vN-menu-head vN-rv">
          <h2 className="vN-tate-h">まとめ記事</h2>
          <p className="vN-menu-note">
            街を歩く、季節をたどる。<br />
            お品書きのように、いくつか。
            <span>全 {FEATURES.length} 本</span>
          </p>
        </div>
        <ol className="vN-tan vN-rv">
          {feats.map((f, i) => {
            const [main, rest] = splitTitle(f.title);
            return (
              <li key={f.id} style={{ ["--r" as string]: `${[-1.6, 1.1, -0.7, 1.7, -1.2, 0.8][i % 6]}deg`, ["--d" as string]: i }}>
                <Link href={links.feature(f.id)} data-cursor="READ">
                  <i className="vN-tan-pin" />
                  <span className="vN-tan-tag">{f.tag}</span>
                  <span className="vN-tan-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sized(f.image, 480)} alt="" loading="lazy" decoding="async" />
                  </span>
                  <b className="vN-tan-main">{main}</b>
                  {rest && <span className="vN-tan-rest">{rest}</span>}
                  <span className="vN-tan-no">{f.no}</span>
                </Link>
              </li>
            );
          })}
        </ol>
        <p className="vN-menu-more vN-rv">
          <Link href="/feature" data-cursor="ALL">特集記事・まとめ記事をすべて見る <span aria-hidden="true">→</span></Link>
        </p>
      </section>

      {/* 6 掲載方針 */}
      <section className="vN-policy" id="policy" aria-label="掲載方針">
        <div className="vN-policy-head vN-rv">
          <i className="vN-seal" aria-hidden="true">輪</i>
          <p className="vN-policy-k">掲載方針</p>
          <p className="vN-policy-e">Editorial principles</p>
        </div>
        <ul className="vN-pr">
          {PRINCIPLES.map((p, i) => (
            <li key={p.k} className="vN-rv" style={{ ["--d" as string]: i }}>
              <h3>{p.k}</h3>
              <p className="vN-pr-en">{p.en}</p>
              <p className="vN-pr-b">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
