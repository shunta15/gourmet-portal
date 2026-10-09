import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FEATURES, REGIONS, type RegionKey } from "@/lib/data";
import { getFeatureCountsByRegion, getFeaturesByRegion } from "@/lib/featureRegions";
import { CardGrid, ListHero, TOP_CRUMB } from "@/components/portal/noren/FeatureList";
import { THEME_GROUPS, countByTheme, filterByTheme, getLatestFeatures, toCardItem } from "@/lib/portal/noren/featureList";
import { assertPortalLive } from "@/lib/portal/launch";
import { NOREN_FEATURE_INDEX_REWRITE } from "@/lib/portal/noren/rewrites";

// 特集記事のトップ（一覧）の暖簾版の実体（内部のパス）。公開スイッチ ON のとき、/feature が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical は /feature のまま。この内部のパス /gourmet/feature は外に出さない）。
// 枠は app/gourmet/layout.tsx（暖簾の枠）。中身・並び・絞り込み（?region=・?theme=・?all=1）・metadata は、今の app/feature/page.tsx と同じ。
// 公開スイッチ OFF のあいだは 404（レイアウトとここで assertPortalLive）。NOREN_FEATURE_INDEX_REWRITE=false のあいだも 404。
export const metadata: Metadata = {
  title: "特集記事 — 地域・テーマから探す | マチノワ",
  description:
    "編集部が週替わりでお届けする特集記事。地域・テーマ・利用シーンから絞り込んで読めます。",
  alternates: { canonical: "/feature" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; theme?: string; all?: string }>;
}) {
  assertPortalLive();
  if (!NOREN_FEATURE_INDEX_REWRITE) notFound();
  const params = await searchParams;
  const region = params.region as RegionKey | undefined;
  const theme = params.theme;
  const showAll = params.all === "1";

  const counts = getFeatureCountsByRegion();
  const availableRegions = (Object.keys(REGIONS) as RegionKey[]).filter((k) => counts[k] > 0);

  // フィルタが選ばれているか判定（今のページと同じ）
  let filtered: typeof FEATURES | null = null;
  let activeLabel = "";
  if (region && availableRegions.includes(region)) {
    filtered = getFeaturesByRegion(region);
    activeLabel = `地域: ${REGIONS[region].name}`;
  } else if (theme) {
    filtered = filterByTheme(theme);
    activeLabel = `テーマ: ${theme}`;
  } else if (showAll) {
    filtered = FEATURES;
    activeLabel = "全件";
  }

  // ───────── フィルタ選択済み: 該当記事のみ表示 ─────────
  if (filtered) {
    const items = filtered.map(toCardItem);
    return (
      <>
        <ListHero
          crumbs={[TOP_CRUMB, { label: "特集", href: "/feature" }, { label: activeLabel }]}
          eyebrow={activeLabel}
          cloth={region && availableRegions.includes(region) ? REGIONS[region].name : theme ?? "特集全件"}
          compact
        >
          <h1 id="vI-h1" className="vI-h1">
            特集記事<span className="n">{filtered.length}</span>件
          </h1>
          <p>
            <Link href="/feature" className="vI-back" data-cursor="BACK">← フィルタを変える</Link>
          </p>
        </ListHero>
        <section className="vI-list" aria-label="特集記事の一覧">
          <div className="vI-list-in">
            {items.length === 0 ? (
              <p className="vI-empty">
                該当する記事がありません。
                <Link href="/feature">他のフィルタを選ぶ →</Link>
              </p>
            ) : (
              <CardGrid items={items} label={activeLabel} />
            )}
          </div>
        </section>
      </>
    );
  }

  // ───────── フィルタ未選択時: カテゴリ ランディング ─────────
  const latest = getLatestFeatures(3).map(toCardItem);
  return (
    <>
      <ListHero crumbs={[TOP_CRUMB, { label: "特集" }]} eyebrow="特集記事" cloth="特集記事">
        <h1 id="vI-h1" className="vI-h1">
          絞り込んで、<em>読む。</em>
        </h1>
        <p className="vI-lead">編集部が週替わりでお届けする特集。地域・テーマから読みたい一本を選んでください。</p>
      </ListHero>

      {/* 最新の特集 */}
      <section className="vI-sec vI-sec--latest" aria-labelledby="vI-latest">
        <div className="vI-sec-in">
          <div className="vI-sh vN-rv">
            <div>
              <h2 id="vI-latest" className="vF-h2d">最新の<em>特集。</em></h2>
              <p>編集部が直近で公開した3本。</p>
            </div>
            <Link href="/feature?all=1" className="vI-sh-link" data-cursor="ALL">全件を見る →</Link>
          </div>
          <CardGrid items={latest} label="最新の特集" />
        </div>
      </section>

      {/* 地域から探す */}
      <section className="vN-paper vI-paper" aria-labelledby="vI-regions">
        <div className="vI-sec-in">
          <div className="vI-sh vN-rv">
            <div>
              <h2 id="vI-regions" className="vF-h2d">地域から<em>探す。</em></h2>
              <p>{availableRegions.length} 地域のミニポータルから特集を絞り込み。</p>
            </div>
          </div>
          <ul className="vI-tiles vN-rv">
            {availableRegions.map((k) => (
              <li key={k}>
                <Link href={`/feature?region=${k}`} className="vI-tile vI-tile--paper" data-cursor="READ">
                  <span className="en">{REGIONS[k].nameEn}</span>
                  <span className="nm">{REGIONS[k].name}</span>
                  <span className="ct">{counts[k]} 記事</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* テーマから探す */}
      <section className="vI-sec" aria-labelledby="vI-themes">
        <div className="vI-sec-in">
          <div className="vI-sh vN-rv">
            <div>
              <h2 id="vI-themes" className="vF-h2d">テーマ・シーンから<em>探す。</em></h2>
              <p>気分・利用シーンから読みたい特集を選ぶ。</p>
            </div>
          </div>
          <ul className="vI-tiles vN-rv">
            {THEME_GROUPS.filter((g) => countByTheme(g) > 0).map((g) => (
              <li key={g.label}>
                <Link href={`/feature?theme=${encodeURIComponent(g.label)}`} className="vI-tile vI-tile--cloth" data-cursor="READ">
                  <span className="en">{g.labelEn}</span>
                  <span className="nm">{g.label}</span>
                  <span className="ct">{countByTheme(g)} 記事</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 全件・検索フォールバック */}
      <div className="vI-cta vN-rv">
        <Link href="/feature/search" className="vI-btn" data-cursor="SEARCH">キーワードで探す →</Link>
        <Link href="/feature?all=1" className="vI-ulink" data-cursor="ALL">全件を一覧で見る（{FEATURES.length}件）</Link>
      </div>
    </>
  );
}
