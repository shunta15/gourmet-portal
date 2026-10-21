import { Fragment } from "react";
import Link from "next/link";
import { getAllRestaurants } from "@/lib/db/restaurants";
import { FEATURES } from "@/lib/data";
import { REGIONS, type RegionKey } from "@/lib/regions";
import { sized, sizedSrcSet, CARD_SIZES } from "@/lib/imageUrl";
import { buildChapters, buildFlags, HERO_PICK, photoFor } from "@/lib/portal/noren/picks";
import NorenHeroReal from "./NorenHeroReal";
import Chapter from "@/components/portal/noren/Chapter";
import Nobori from "@/components/portal/noren/Nobori";
import { RELEASE_FEATURE, RELEASE_REST } from "@/lib/portal/noren/release";
import { FEATURE_KIND_ROUNDUP, FEATURE_KIND_SINGLE, FEATURE_ROUNDUP_WALK } from "@/lib/portal/noren/featureKinds";
import OpenSearchBlock from "@/components/portal/noren/OpenSearchBlock";
import { buildOpenSearchData } from "@/lib/portal/noren/openSearch";
import { buildBlockTop } from "@/lib/portal/noren/blockTop";
import { resolveOpen, type OpenView } from "@/lib/portal/noren/looks";
import "../noren/top.css";
import "./real.css";
import { NOREN_HERO_KEYS, type NorenLinks } from "@/lib/portal/noren/nav";
import type { NorenRealSpShape } from "@/lib/portal/noren/realTop";
import type { DyeKind } from "./clothReal";

/**
 * 暖簾のグルメのトップ（リアル版）。最初の画面は NorenHeroReal。本番の /gourmet（app/gourmet/page.tsx。色は固定）が使う。
 */

function splitTitle(t: string): [string, string] {
  const i = t.search(/[、。，]/);
  if (i <= 0 || i > 12) return [t.length > 12 ? t.slice(0, 12) : t, t.length > 12 ? t.slice(12) : ""];
  return [t.slice(0, i), t.slice(i + 1).replace(/^[、。\s]+/, "")];
}

const PRINCIPLES = [
  { k: "誇張しない", en: "No exaggeration", body: "「最高」「絶品」といった言葉は使いません。住所、営業時間、写真など、確かめられることを書きます。" },
  { k: "順位をつけない", en: "No rankings", body: "点数や星、ランキングで店を並べません。このページの並びも、順位ではありません。" },
  { k: "口コミを転載しない", en: "No reposted reviews", body: RELEASE_REST ? "口コミの文章は転載しません。評価の数字は、出典（Google）を明記したものだけを載せます。" : "ほかのサイトの口コミや評価は、掲載しません。" },
];

export default async function GourmetNorenHomeReal({
  links,
  dye = "ai",
  allowUrlOverride = false,
  spShape,
  allowSpUrl = false,
  allowCopyUrl = false,
  searchOpen,
}: {
  links: NorenLinks;
  dye?: DyeKind;
  allowUrlOverride?: boolean;
  /** スマホ幅の暖簾の丈の案（省略すると realTop.ts の NOREN_REAL_SP_SHAPE） */
  spShape?: NorenRealSpShape;
  /** URL の ?sp= で丈の案を上書きできるか（本番でないときだけ true。app/gourmet/page.tsx が VERCEL_ENV で判定して渡す） */
  allowSpUrl?: boolean;
  /** URL の ?copy=1〜5 で見出し・リードの候補に替えられるか（?sp= と同じ。本番でないときだけ true） */
  allowCopyUrl?: boolean;
  /** 「店を、さがす。」の節の色・タイルの有無・帯の地図（lib/portal/noren/looks.ts の resolveOpen。省略は既定） */
  searchOpen?: OpenView;
}) {
  const restaurants = await getAllRestaurants();
  const byId = new Map(restaurants.map((r) => [r.id, r]));
  const regionName = (k: string) => REGIONS[k as RegionKey]?.name ?? k;

  const chapters = buildChapters(restaurants, regionName);
  const openSearchData = buildOpenSearchData(restaurants);
  const blockTop = buildBlockTop(restaurants, openSearchData.cuisines, openSearchData.regions);

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
        allowCopyUrl={allowCopyUrl}
        genres={openSearchData.cuisines}
      />

      {/* 2 店をさがす(2026-10-11 オーナー指示。暖簾の直後、章の入口の前。件数はここ=サーバーで数える) */}
      <OpenSearchBlock data={openSearchData} tiles={blockTop.tiles} bandAreas={blockTop.bandAreas} view={searchOpen ?? resolveOpen({}, false)} />

      {/* 3 章 */}
      {/* 章の前置き（「七つの章」の見出し・説明・7 つの目次）は置かない（2026-10-12 オーナー指示「ここいらないかな」）。「店を、さがす。」の節のすぐ下から、和食の章が始まる */}
      <div className="vN-chs" id="chapters">
        {chapters.map((c, i) => (
          <Fragment key={c.key}>
            {/* フッターの暖簾（今の本番の 5 つ）の行き先 #ch-sushi・#ch-soba の別名の目印。入口の「和」の章の手前に着く */}
            {i === 0 && (
              <>
                <i id="ch-sushi" aria-hidden="true" style={{ display: "block", height: 0 }} />
                <i id="ch-soba" aria-hidden="true" style={{ display: "block", height: 0 }} />
              </>
            )}
            <Chapter c={c} index={i} total={chapters.length} shopBase={links.shopBase} />
          </Fragment>
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
      {/* 節の見出し・「すべて見る」の言い方は、特集の 3 棚（RELEASE_FEATURE）に合わせる。false のあいだは今の本番の「まとめ記事」「特集記事・まとめ記事」 */}
      <section className="vN-menu" id="features" aria-label={RELEASE_FEATURE ? "特集" : "まとめ記事"}>
        <div className="vN-menu-head vN-rv">
          <h2 className="vN-tate-h">{RELEASE_FEATURE ? "特集" : "まとめ記事"}</h2>
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
                    <img src={sized(f.image, 480)} srcSet={sizedSrcSet(f.image)} sizes={CARD_SIZES} alt="" loading="lazy" decoding="async" />
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
          <Link href="/feature" data-cursor="ALL">{RELEASE_FEATURE ? `${FEATURE_KIND_SINGLE}・${FEATURE_KIND_ROUNDUP}・${FEATURE_ROUNDUP_WALK}` : "特集記事・まとめ記事"}をすべて見る <span aria-hidden="true">→</span></Link>
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
