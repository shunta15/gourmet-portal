import Link from "next/link";
import { getAllRestaurants } from "@/lib/db/restaurants";
import { FEATURES } from "@/lib/data";
import { REGIONS, type RegionKey } from "@/lib/regions";
import { sized } from "@/lib/imageUrl";
import { buildChapters, buildFlags, CLOCK_PICK, HERO_PICK, photoFor } from "@/lib/portal/noren/picks";
import NorenHero from "@/components/portal/noren/NorenHero";
import Chapter from "@/components/portal/noren/Chapter";
import NightClock from "@/components/portal/noren/NightClock";
import Nobori from "@/components/portal/noren/Nobori";
import "./top.css";
import { noFeature } from "@/lib/portal/noren/nav";

// 暖簾のデザインのグルメのトップ（見本）。proto/beauty の /v/noren を持ってきたもの。プレビュー・ローカル専用（門は layout.tsx）。
export const dynamic = "force-dynamic";

/** 特集の表示用に、題名を「主題（最初の読点まで）」と「続き」に分ける */
function splitTitle(t: string): [string, string] {
  const i = t.search(/[、。，]/);
  if (i <= 0 || i > 12) return [t.length > 12 ? t.slice(0, 12) : t, t.length > 12 ? t.slice(12) : ""];
  return [t.slice(0, i), t.slice(i + 1).replace(/^[、。\s]+/, "")];
}

const PRINCIPLES = [
  { k: "誇張しない", en: "No exaggeration", body: "「最高」「絶品」といった言葉は使いません。住所、営業時間、写真など、確かめられることを書きます。" },
  { k: "順位をつけない", en: "No rankings", body: "点数や星、ランキングで店を並べません。このページの並びも、順位ではありません。" },
  { k: "口コミを転載しない", en: "No reposted reviews", body: "ほかのサイトの口コミや評価は、掲載しません。" },
];

export default async function Page() {
  const restaurants = await getAllRestaurants();
  const byId = new Map(restaurants.map((r) => [r.id, r]));
  const regionName = (k: string) => REGIONS[k as RegionKey]?.name ?? k;

  const chapters = buildChapters(restaurants, regionName);

  const heroShop = byId.get(HERO_PICK[0]);
  const heroPhoto = sized((heroShop && photoFor(heroShop, HERO_PICK[1])) || chapters[3].shops[0].img, 1600);
  const clockShop = byId.get(CLOCK_PICK[0]);
  const clockPhoto = sized((clockShop && photoFor(clockShop, CLOCK_PICK[1])) || heroPhoto, 1400);

  // エリア：掲載店のある地域を、掲載数の多い順に
  const counts = restaurants.reduce<Record<string, number>>((m, r) => ((m[r.region] = (m[r.region] ?? 0) + 1), m), {});
  const regions = (Object.keys(REGIONS) as RegionKey[])
    .filter((k) => counts[k])
    .sort((a, b) => counts[b] - counts[a])
    .map((k) => ({ key: k, name: REGIONS[k].name, en: REGIONS[k].nameEn, count: counts[k] }));
  const flags = buildFlags(restaurants, regions);

  // 特集：タグが重ならないように先頭から7本
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
      {/* 1 暖簾 */}
      <NorenHero photo={heroPhoto} count={restaurants.length} areas={regions.length} />

      {/* 2 いま何時 */}
      <NightClock photo={clockPhoto} />

      {/* 3 章 */}
      <div className="vN-chs" id="chapters">
        <div className="vN-chs-intro">
          <div className="vN-chs-intro-tx vN-rv">
            <p className="vN-chs-intro-k">五つの章</p>
            <p className="vN-chs-intro-t">
              麺、鮨、肉、酒、蕎。<br />
              暖簾の一文字ごとに、<br />
              実在の店を数軒ずつ。
            </p>
            <p className="vN-chs-intro-s">スクロールで店が入れ替わります。縦書きの店名を押すと、その店のページへ。数字は、業種表記に当てはまる掲載店の数です。</p>
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
          <Chapter key={c.key} c={c} index={i} total={chapters.length} />
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
          <Nobori flags={flags} total={restaurants.length} />
        </div>
      </section>

      {/* 5 特集（お品書き） */}
      <section className="vN-menu" id="features" aria-label="特集">
        <div className="vN-menu-head vN-rv">
          <h2 className="vN-tate-h">特集</h2>
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
                <Link href={noFeature(f.id)} data-cursor="READ">
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
          <Link href="/feature" data-cursor="ALL">特集をすべて見る <span aria-hidden="true">→</span></Link>
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
