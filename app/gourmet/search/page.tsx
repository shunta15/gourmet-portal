import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import NorenSearch from "@/components/portal/noren/NorenSearch";
import { ListHero, TOP_CRUMB } from "@/components/portal/noren/FeatureList";
import { getAllRestaurants } from "@/lib/db/restaurants";
import { buildFacetPayload } from "@/lib/portal/facets";
import { assertPortalLive } from "@/lib/portal/launch";
import { NOREN_SEARCH_REWRITE } from "@/lib/portal/noren/rewrites";
import { toSearchShop } from "@/lib/portal/noren/sceneShop";
import { GEO } from "@/lib/geo";
import { PREF_BY_REGION, parseTown } from "@/lib/towns";
import { getPrefByName } from "@/lib/areas/prefectures";
import { SCENES } from "@/lib/scenes";

// 店をさがす（/search）の暖簾版の実体（内部のパス）。公開スイッチ ON のとき、/search が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical は /search のまま。この内部のパス /gourmet/search は外に出さない）。枠は app/gourmet/layout.tsx。
// metadata（noindex を含む）・検索の引数・絞り込み・こだわり条件は、今の app/search/page.tsx・components/SearchClient.tsx と同じ。
// OFF のあいだ・NOREN_SEARCH_REWRITE=false のあいだは 404。
// 「店をさがす」の中心のページ: 絞り込みが何も無いときは、キーワードの箱 → エリア → 業種 → 利用シーンの札（NorenSearch の hub。件数はここで数える）。
// 絞り込みがあるとき（?q= ?region= ?cuisine= ?tag= ?scene= ?budget= ?f=）は結果の一覧。
export const metadata: Metadata = {
  title: "店舗を探す — マチノワ",
  description:
    "全国の飲食店を、地域・業種・キーワードで探す。編集部おすすめ店から、隠れ家まで。",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default async function Page() {
  assertPortalLive();
  if (!NOREN_SEARCH_REWRITE) notFound();
  const restaurants = await getAllRestaurants();
  // 必要な項目だけに絞って渡す（写真は暖簾の店ページと同じ判定を通したもの。評価の数字は渡さない）
  const items = restaurants.map(toSearchShop);
  // こだわり条件は公開スイッチ ON のときだけ（ここは ON のときしか開けない）
  const facets = buildFacetPayload(restaurants);
  // 地図のピン用: 座標のある店だけの [緯度, 経度]（小数 5 桁。地理院の地図に出す）
  const coords: Record<string, [number, number]> = {};
  for (const r of items) {
    const g = GEO[r.id];
    if (g) coords[r.id] = [Math.round(g.lat * 1e5) / 1e5, Math.round(g.lng * 1e5) / 1e5];
  }
  // 絵図（a）用: 店 → 住所の都道府県（住所の先頭の都道府県名。無ければ地域から補う。名前の部分一致では対応させない）、店 → 市区町村（lib/towns.ts）、
  // 県 → 地域（その県の店の region のうち最も多いもの。同数なら地域キーの順。1 つの県に地域が複数あっても 1 つに決める。いまの店のデータでは 41 県すべて 1 対 1）
  const PREF_RE = /^(北海道|東京都|大阪府|京都府|.{2,3}?県)/;
  const prefOf: Record<string, string> = {};
  const townOf: Record<string, string> = {};
  const votes = new Map<string, Map<string, number>>();
  for (const r of restaurants) {
    const a = (r.address || "").replace(/^〒?\s*\d{3}-?\d{4}\s*/, "").trim();
    const name = a.match(PREF_RE)?.[1] ?? PREF_BY_REGION[r.region];
    const pref = name ? getPrefByName(name) : null;
    if (pref) {
      prefOf[r.id] = pref.slug;
      const m = votes.get(pref.slug) ?? new Map<string, number>();
      m.set(r.region, (m.get(r.region) ?? 0) + 1);
      votes.set(pref.slug, m);
    }
    const t = parseTown(r.address || "", r.region);
    if (t) townOf[r.id] = t.town;
  }
  const prefRegion: Record<string, string> = {};
  for (const [slug, m] of votes) prefRegion[slug] = [...m.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))[0][0];
  return (
    <>
      <ListHero crumbs={[TOP_CRUMB, { label: "店をさがす" }]} eyebrow="店をさがす" eyebrowEn="Search" cloth="さがす" compact>
        <h1 id="vI-h1" className="vI-h1 is-s vSc-lead">
          食べたいお店を、<em>見つける。</em>
        </h1>
      </ListHero>
      <Suspense fallback={null}>
        <NorenSearch
          restaurants={items}
          facets={facets}
          coords={coords}
          prefOf={prefOf}
          townOf={townOf}
          prefRegion={prefRegion}
          allowMapUrl={process.env.VERCEL_ENV !== "production"}
          sceneDefs={SCENES.map((x) => ({ slug: x.slug, name: x.name, matchTags: x.matchTags }))}
        />
      </Suspense>
    </>
  );
}
