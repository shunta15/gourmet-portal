import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FEATURES, REGIONS, type RegionKey } from "@/lib/data";
import { getFeatureCountsByRegion, getFeaturesByRegion } from "@/lib/featureRegions";
import { CardGrid, ListHero, ShopFeatureGrid, TOP_CRUMB } from "@/components/portal/noren/FeatureList";
import PhotoFeatureShell from "@/components/portal/photoFeature/PhotoFeatureShell";
import RoundupListPage from "@/components/portal/photoFeature/roundup/RoundupListPage";
import { getRoundupShelves, toListCard } from "@/lib/portal/photoFeature/roundupList";
import { NOREN_FEATURE_ROUNDUP_PHOTO } from "@/lib/portal/noren/featureScene";
import { THEME_GROUPS, countByTheme, filterByTheme, getFeaturedSingleCards, getRoundupGroups, toCardItem } from "@/lib/portal/noren/featureList";
import {
  FEATURE_KIND_ROUNDUP,
  FEATURE_KIND_ROUNDUP_ALL,
  FEATURE_KIND_SINGLE,
  FEATURE_ROUNDUP_NOTE,
  FEATURE_ROUNDUP_WALK,
  FEATURE_SHELF_ROUNDUP_ID,
  FEATURE_SHELF_SINGLE_ID,
  FEATURE_SHELF_WALK_ID,
  FEATURE_SINGLE_NOTE,
  FEATURE_WALK_NOTE,
} from "@/lib/portal/noren/featureKinds";
import { assertPortalLive } from "@/lib/portal/launch";
import { NOREN_FEATURE_INDEX_REWRITE } from "@/lib/portal/noren/rewrites";
import { RELEASE_FEATURE } from "@/lib/portal/noren/release";
import LegacyFeatureIndexPage, { legacyMetadata } from "./LegacyFeatureIndexPage";

// 特集記事のトップ（一覧）の暖簾版の実体（内部のパス）。公開スイッチ ON のとき、/feature が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical は /feature のまま。この内部のパス /gourmet/feature は外に出さない）。
// 枠は app/gourmet/layout.tsx（暖簾の枠）。絞り込み（?region=・?theme=・?all=1）の結果は、今の app/feature/page.tsx と同じ中身・並び（まとめ記事の側）。
// 一覧の上の方は 3 つの棚: 「特集記事」（店 1 軒の記事。FEATURED_SINGLE_IDS の本）→「シーン別まとめ記事」（利用シーン + 複数の店 = FEATURES のうち isSceneShopFeature）→「街歩き・コース」（FEATURES のそれ以外）。名称は lib/portal/noren/featureKinds.ts。
// 見た目: NOREN_FEATURE_ROUNDUP_PHOTO が true のあいだは、店舗特集記事と同じ世界（和紙の地・筆の線・朱の印・小さな暖簾の見出し。components/portal/photoFeature/roundup/RoundupListPage.tsx）。false は今までの暗い暖簾の見た目（3 棚）。
// 公開スイッチ OFF のあいだは 404（レイアウトとここで assertPortalLive）。NOREN_FEATURE_INDEX_REWRITE=false のあいだも 404。
const newMetadata: Metadata = {
  title: `特集 — ${FEATURE_KIND_SINGLE}・${FEATURE_KIND_ROUNDUP}・${FEATURE_ROUNDUP_WALK}を読む | マチノワ`,
  description: `店を 1 軒ずつ紹介する${FEATURE_KIND_SINGLE}と、利用シーンに合わせて複数の店を紹介する${FEATURE_KIND_ROUNDUP}、街の歩き方をまとめた${FEATURE_ROUNDUP_WALK}。地域・テーマ・利用シーンから絞り込んで読めます。`,
  alternates: { canonical: "/feature" },
};

async function NewFeatureIndexPage({
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
    if (NOREN_FEATURE_ROUNDUP_PHOTO) {
      return (
        <PhotoFeatureShell>
          <RoundupListPage kind="filtered" activeLabel={activeLabel} items={filtered.map(toListCard)} />
        </PhotoFeatureShell>
      );
    }
    const items = filtered.map(toCardItem);
    return (
      <>
        <ListHero
          crumbs={[TOP_CRUMB, { label: "特集", href: "/feature" }, { label: activeLabel }]}
          eyebrow={activeLabel}
          cloth={region && availableRegions.includes(region) ? REGIONS[region].name : theme ?? FEATURE_KIND_ROUNDUP}
          compact
        >
          <h1 id="vI-h1" className="vI-h1">
            {FEATURE_KIND_ROUNDUP_ALL}<span className="n">{filtered.length}</span>件
          </h1>
          <p>
            <Link href="/feature" className="vI-back" data-cursor="BACK">← フィルタを変える</Link>
          </p>
        </ListHero>
        <section className="vI-list" aria-label={`${FEATURE_KIND_ROUNDUP_ALL}の一覧`}>
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

  // ───────── フィルタ未選択時: 3 つの棚 ─────────
  if (NOREN_FEATURE_ROUNDUP_PHOTO) {
    const sh = await getRoundupShelves();
    return (
      <PhotoFeatureShell>
        <RoundupListPage
          kind="shelves"
          singles={sh.singles}
          scene={sh.scene}
          walk={sh.walk}
          regions={availableRegions.map((k) => ({ key: k, name: REGIONS[k].name, nameEn: REGIONS[k].nameEn, count: counts[k] }))}
          themes={THEME_GROUPS.filter((g) => countByTheme(g) > 0).map((g) => ({ label: g.label, labelEn: g.labelEn, count: countByTheme(g) }))}
          allCount={FEATURES.length}
        />
      </PhotoFeatureShell>
    );
  }
  const singles = await getFeaturedSingleCards();
  const roundup = getRoundupGroups();
  return (
    <>
      <ListHero crumbs={[TOP_CRUMB, { label: "特集" }]} eyebrow="特集" cloth="特集">
        <h1 id="vI-h1" className="vI-h1">
          特集を、<em>読む。</em>
        </h1>
        <p className="vI-lead">
          {FEATURE_KIND_SINGLE}は店を 1 軒ずつ、{FEATURE_KIND_ROUNDUP}は利用シーンに合わせて複数の店を、{FEATURE_ROUNDUP_WALK}は街の歩き方を紹介します。
        </p>
      </ListHero>

      {/* 特集記事（店 1 軒の記事。FEATURED_SINGLE_IDS の並び） */}
      <section id={FEATURE_SHELF_SINGLE_ID} className="vI-shelf vI-shelf--tokushu" aria-labelledby="vI-single">
        <div className="vI-sec-in">
          <div className="vI-sh vN-rv">
            <div>
              <h2 id="vI-single" className="vF-h2d">{FEATURE_KIND_SINGLE}</h2>
              <p>{FEATURE_SINGLE_NOTE}{singles.length} 本。</p>
            </div>
          </div>
          <ShopFeatureGrid items={singles} label={FEATURE_KIND_SINGLE} />
        </div>
      </section>

      {/* シーン別まとめ記事（利用シーン + 複数の店）。絞り込み・検索の部品は今までどおり */}
      <section id={FEATURE_SHELF_ROUNDUP_ID} className="vI-shelf vI-shelf--matome" aria-labelledby="vI-roundup">
        <div className="vI-sec-in">
          <div className="vI-sh vN-rv">
            <div>
              <h2 id="vI-roundup" className="vF-h2d">{FEATURE_KIND_ROUNDUP}</h2>
              <p>{FEATURE_ROUNDUP_NOTE}{roundup.scene.length} 本。</p>
            </div>
            <Link href="/feature/search" className="vI-sh-link" data-cursor="SEARCH">キーワードで探す →</Link>
          </div>

          <div className="vI-fl vN-rv">
            <h3>地域で絞る（{availableRegions.length} 地域）</h3>
            <ul className="vI-tiles">
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
          <div className="vI-fl vN-rv">
            <h3>テーマ・シーンで絞る</h3>
            <ul className="vI-tiles">
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

          <CardGrid items={roundup.scene} label={FEATURE_KIND_ROUNDUP} />
        </div>
      </section>

      {/* 街歩き・コース（FEATURES のうち、利用シーン + 複数の店の記事以外） */}
      <section id={FEATURE_SHELF_WALK_ID} className="vI-shelf vI-shelf--walk" aria-labelledby="vI-walk">
        <div className="vI-sec-in">
          <div className="vI-sh vN-rv">
            <div>
              <h2 id="vI-walk" className="vF-h2d">{FEATURE_ROUNDUP_WALK}</h2>
              <p>{FEATURE_WALK_NOTE}{roundup.walk.length} 本。</p>
            </div>
          </div>
          <CardGrid items={roundup.walk} label={FEATURE_ROUNDUP_WALK} />

          <div className="vI-cta vN-rv">
            <Link href="/feature?all=1" className="vI-ulink" data-cursor="ALL">{FEATURE_KIND_ROUNDUP_ALL}を一覧で見る（{FEATURES.length}件）</Link>
          </div>
        </div>
      </section>
    </>
  );
}

// RELEASE_FEATURE が false のあいだは、今の本番（main）の特集のトップ（LegacyFeatureIndexPage）を出す。true で 3 棚の新しい一覧（NewFeatureIndexPage）
export const metadata: Metadata = RELEASE_FEATURE ? newMetadata : legacyMetadata;
export default RELEASE_FEATURE ? NewFeatureIndexPage : LegacyFeatureIndexPage;
