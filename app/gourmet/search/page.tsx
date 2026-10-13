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
import { parseTown } from "@/lib/towns";
import { SCENES } from "@/lib/scenes";
import { SEARCH_LOOK, resolveLook } from "@/lib/portal/noren/looks";
import BlockFonts from "@/components/portal/noren/BlockFonts";
import { BlockSearchBox, BlockSearchBoxStatic, BlockSearchSticky } from "@/components/portal/noren/BlockSearchBox";
import { heroImagesOf } from "@/lib/portal/noren/shop";
import { isUsableFeatureImage } from "@/lib/portal/noren/usableImage";
import { sized } from "@/lib/imageUrl";
import { getSceneRoundups } from "@/lib/portal/noren/sceneRoundups";
import { RELEASE_PERIPHERY } from "@/lib/portal/noren/release";

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

// 上の帯の写真に使う店（G6「街歩き」の試作と同じ選び方: 店先の暖簾の写真）。店 ID の完全一致
const BAND_SHOP = "r259";
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  assertPortalLive();
  if (!NOREN_SEARCH_REWRITE) notFound();
  // 見た目（lib/portal/noren/looks.ts）。URL の ?look= は見本でだけ効く（本番は読まない = ページは今までどおり静的のまま）
  const allowUrl = process.env.VERCEL_ENV !== "production";
  const look = resolveLook(SEARCH_LOOK, allowUrl ? one((await searchParams).look) : "", allowUrl);
  const block = look === "block";
  const restaurants = await getAllRestaurants();
  // 必要な項目だけに絞って渡す（写真は暖簾の店ページと同じ判定を通したもの。評価の数字は渡さない）。最寄り駅（nearest）も渡す（地図のピンの店の情報の札に出す。block では、駅名でも探せる）
  const items = restaurants.map((r) => ({ ...toSearchShop(r), nearest: r.nearest }));
  const bandShop = block ? restaurants.find((r) => r.id === BAND_SHOP) : undefined;
  const bandPhoto = bandShop ? [...heroImagesOf(bandShop), ...(bandShop.gallery ?? [])].find(isUsableFeatureImage) ?? "" : "";
  // こだわり条件は公開スイッチ ON のときだけ（ここは ON のときしか開けない）
  const facets = buildFacetPayload(restaurants);
  // 地図のピン用: 座標のある店だけの [緯度, 経度]（小数 5 桁。地理院の地図に出す）
  const coords: Record<string, [number, number]> = {};
  for (const r of items) {
    const g = GEO[r.id];
    if (g) coords[r.id] = [Math.round(g.lat * 1e5) / 1e5, Math.round(g.lng * 1e5) / 1e5];
  }
  // 地図の目印の地名用: 店 → 市区町村（lib/towns.ts の取り出し方。名前の部分一致では対応させない）
  const townOf: Record<string, string> = {};
  for (const r of restaurants) {
    const t = parseTown(r.address || "", r.region);
    if (t) townOf[r.id] = t.town;
  }
  // 結果の一覧は、URL の引数を読むクライアント（Suspense の中）が描く。描かれる前（サーバーが出す HTML）はフッターが画面に入っていて、描かれた約 0.4 秒後に押し下げられ、
  // PC で CLS 0.30 になっていた。RELEASE_PERIPHERY のあいだは、結果の領域に最小の高さを予約して、フッターが最初から画面の外に居るようにする（結果が短いときも位置は変わらない）。
  const search0 = (
    <Suspense fallback={null}>
        <NorenSearch
          restaurants={items}
          facets={facets}
          coords={coords}
          townOf={townOf}
          sceneDefs={SCENES.map((x) => ({ slug: x.slug, name: x.name, matchTags: x.matchTags }))}
          look={look}
          allowLookUrl={allowUrl}
          sceneRoundups={getSceneRoundups()}
        />
      </Suspense>
  );
  const search = RELEASE_PERIPHERY ? <div style={{ minHeight: "calc(100svh - 120px)" }}>{search0}</div> : search0;
  if (block) {
    // 参考画像 2 枚目の形: 上に店の写真の帯と見出し → タブ → 地図と一覧 → 検索結果。ヘッダーはこのページだけ白（blocksearch.css の :has(.vBk-page)）
    return (
      <div className="vBk vBk-page">
        <BlockFonts />
        <section className="vBk-ban" aria-label="お店を探す">
          {bandPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="vBk-ban-img" src={sized(bandPhoto, 1600)} alt="" decoding="async" fetchPriority="high" />
          )}
          <div className="vBk-wrap vBk-ban-in">
            <h1>お店を探す</h1>
            <p>地図から、リストから、気になるお店を見つけよう。</p>
            {/* 検索の箱は、どのタブを開いていても常に見える（キーワード・エリアは URL の ?q= ?region= と合う）。引数を読むまでは、同じ形のふつうの form */}
            <Suspense fallback={<BlockSearchBoxStatic />}>
              <BlockSearchBox />
            </Suspense>
          </div>
        </section>
        {/* 帯の箱が画面から消えたら、ヘッダーの下に細く留まる検索の欄 */}
        <Suspense fallback={null}>
          <BlockSearchSticky />
        </Suspense>
        {search}
      </div>
    );
  }
  return (
    <>
      <ListHero crumbs={[TOP_CRUMB, { label: "店をさがす" }]} eyebrow="店をさがす" eyebrowEn="Search" cloth="さがす" compact>
        <h1 id="vI-h1" className="vI-h1 is-s vSc-lead">
          食べたいお店を、<em>見つける。</em>
        </h1>
      </ListHero>
      {search}
    </>
  );
}
