import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/meta";
import BlockFonts from "@/components/portal/noren/BlockFonts";
import { BlockCard } from "@/components/portal/noren/BlockSearchParts";
import { getAllRestaurants } from "@/lib/db/restaurants";
import { assertPortalLive } from "@/lib/portal/launch";
import { toSearchShop } from "@/lib/portal/noren/sceneShop";
import { NOREN_SHOP_REWRITE } from "@/lib/portal/noren/rewrites";
import { MENU_SHOPS } from "@/lib/portal/noren/nav";
import { VERTICALS } from "@/lib/verticals";
import { notFound } from "next/navigation";
import "@/components/portal/noren/blocksearch.css";

// 店舗紹介の一覧（/restaurant。グルメのメニュー「店舗紹介」の行き先）の実体（内部のパス）。
// 公開スイッチ ON のとき、/restaurant が next.config.ts の rewrites でここに来る（ブラウザの URL・canonical は /restaurant のまま。
// この内部のパス /gourmet/restaurant は直接開くと /restaurant へ恒久リダイレクトされる）。枠は app/gourmet/layout.tsx（暖簾のヘッダー・フッター）。
// 中身: 見出し「店舗紹介」と件数（実数）、掲載中の全店の札。札を押すと、その店の店舗紹介ページ（/restaurant/<店 ID>）を開く。絞り込みは付けない。
// 札・並べ方・ページ送りは「さがす」（components/portal/noren/NorenSearch.tsx の block の見た目）と同じ部品・同じ作法: BlockCard・.vBk-grid・.vBk-pager・1 ページ 24 店・?page=。
// 店の並びは店 ID の番号の順（ページ送りの途中で順番が入れ替わらないように決めておく）。非表示の店（lib/hiddenStores.ts）は getAllRestaurants が外している。
// robots: 1 ページ目は index、2 ページ目以降（?page=2〜）は noindex,follow（他の業種の一覧と同じ決まり）。canonical は、どのページも自分自身。
// 公開スイッチ OFF のあいだは 404（レイアウトとここで assertPortalLive）。

/** 1 ページに出す店の数（「さがす」と同じ） */
const PER = 24;

const BRAND = VERTICALS.gourmet.brand;

/** 店 ID の番号（r12 → 12）。r＋数字でない ID は最後に並べる */
const idNo = (id: string) => (/^r\d+$/.test(id) ? parseInt(id.slice(1), 10) : Number.MAX_SAFE_INTEGER);

type ShopCards = ReturnType<typeof toSearchShop>[];
/**
 * 掲載中の全店の札のデータ（店 ID の番号の順）。ページ送りのたびに DB を読まないよう、結果を 5 分だけ覚えておく
 * （特集の一覧の getFeaturedSingleCards と同じ作法。lib/portal/noren/featureList.ts）。
 */
let shopCardsMemo: { at: number; rows: ShopCards } | null = null;
async function getShopCards(): Promise<ShopCards> {
  if (shopCardsMemo && Date.now() - shopCardsMemo.at < 5 * 60 * 1000) return shopCardsMemo.rows;
  const all = await getAllRestaurants();
  const rows = all
    .map(toSearchShop)
    .sort((a, b) => idNo(a.id) - idNo(b.id) || a.id.localeCompare(b.id))
    // 札に使わない長い文は持たない（覚えておく量を小さくする）
    .map((r) => ({ ...r, desc: "", address: "" }));
  if (rows.length) shopCardsMemo = { at: Date.now(), rows };
  return rows;
}

const pageOf = (v: string | string[] | undefined) => {
  const s = Array.isArray(v) ? v[0] : v;
  return Math.max(1, parseInt(s ?? "1", 10) || 1);
};
const hrefOf = (page: number) => (page <= 1 ? MENU_SHOPS : `${MENU_SHOPS}?page=${page}`);

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  assertPortalLive();
  const items = await getShopCards();
  const pages = Math.max(1, Math.ceil(items.length / PER));
  const cur = Math.min(pageOf((await searchParams).page), pages);
  const base = buildMetadata({
    vertical: "gourmet",
    title: `店舗紹介${cur > 1 ? `（${cur} ページ目）` : ""} | ${BRAND}`,
    description: `${BRAND}に掲載している全 ${items.length} 店の一覧です。店名・エリア・種類を見て、1 店ずつの紹介ページへ進めます。`,
    path: hrefOf(cur),
    count: items.length,
  });
  // 2 ページ目以降は noindex,follow（1 ページ目だけ index。canonical は自分自身）
  return cur > 1 ? { ...base, robots: { index: false, follow: true } } : base;
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  assertPortalLive();
  if (!NOREN_SHOP_REWRITE) notFound();
  const items = await getShopCards();
  const pages = Math.max(1, Math.ceil(items.length / PER));
  const cur = Math.min(pageOf((await searchParams).page), pages);
  const shown = items.slice((cur - 1) * PER, cur * PER);
  return (
    <div className="vBk vBk-page">
      <BlockFonts />
      <section className="vBk-wrap vBk-main" aria-labelledby="vBk-shops-h">
        <div className="vBk-reshead">
          <h1 id="vBk-shops-h">店舗紹介</h1>
          <p className="vBk-count">
            <strong>{items.length}</strong>件
          </p>
        </div>
        <ul className="vBk-grid" aria-label="店舗紹介">
          {shown.map((r, i) => (
            <BlockCard key={r.id} r={r} eager={i < 3} />
          ))}
        </ul>
        {pages > 1 && (
          <nav className="vBk-pager" aria-label="ページ">
            {cur > 1 && <Link href={hrefOf(cur - 1)} rel="prev">前へ</Link>}
            <span aria-current="page">
              {cur} / {pages}
            </span>
            {cur < pages && <Link href={hrefOf(cur + 1)} rel="next">次へ</Link>}
          </nav>
        )}
      </section>
    </div>
  );
}
