import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FEATURES, REGIONS, type RegionKey } from "@/lib/data";
import type { Feature } from "@/lib/regions";
import { getFeatureCountsByRegion, getFeaturesByRegion } from "@/lib/featureRegions";
import { CardGrid, ListHero, TOP_CRUMB } from "@/components/portal/noren/FeatureList";
import PhotoFeatureShell from "@/components/portal/photoFeature/PhotoFeatureShell";
import RoundupListPage from "@/components/portal/photoFeature/roundup/RoundupListPage";
import { getRoundupShelves, toListCard } from "@/lib/portal/photoFeature/roundupList";
import { NOREN_FEATURE_ROUNDUP_PHOTO } from "@/lib/portal/noren/featureScene";
import { THEME_GROUPS, countByTheme, filterByTheme, getRoundupGroups, toCardItem } from "@/lib/portal/noren/featureList";
import {
  FEATURE_KIND_ROUNDUP,
  FEATURE_KIND_ROUNDUP_ALL,
  FEATURE_ROUNDUP_NOTE,
  FEATURE_ROUNDUP_WALK,
  FEATURE_SHELF_ROUNDUP_ID,
  FEATURE_SHELF_WALK_ID,
  FEATURE_WALK_NOTE,
} from "@/lib/portal/noren/featureKinds";
import { assertPortalLive } from "@/lib/portal/launch";
import { NOREN_FEATURE_INDEX_REWRITE } from "@/lib/portal/noren/rewrites";

// 特集のトップ（一覧）の暖簾版の実体（内部のパス）。公開スイッチ ON のとき、/feature が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical は /feature のまま。この内部のパス /gourmet/feature は外に出さない）。
// 枠は app/gourmet/layout.tsx（暖簾の枠）。絞り込み（?region=・?theme=・?tag=・?q=・?all=1）の結果は、まとめ記事の側の一覧（シーン別まとめ記事と街歩き・コースの 178 本から）。
// 【2026-10-24 オーナー決定「各業種 4 ページに収める」】一覧の上の方は 2 つの棚: 「シーン別まとめ記事」（利用シーン + 複数の店 = FEATURES のうち isSceneShopFeature）→「街歩き・コース」（FEATURES のそれ以外）。名称は lib/portal/noren/featureKinds.ts。
// 店 1 軒の記事（旧「特集記事」の棚の 50 枚）は、ここに並べない（店は「店舗紹介」 /restaurant）。
// 旧 /feature/search（特集を探す）は、この一覧の中の検索欄（?q=）へ、旧 /feature/region/<キー>（19 ページ）は、地域の絞り込み（?region=<キー>）へ、それぞれ 308（next.config.ts の redirects）。
// 見た目: NOREN_FEATURE_ROUNDUP_PHOTO が true のあいだは、店舗特集記事と同じ世界（和紙の地・筆の線・朱の印・小さな暖簾の見出し。components/portal/photoFeature/roundup/RoundupListPage.tsx）。false は今までの暗い暖簾の見た目（2 棚）。
// 公開スイッチ OFF のあいだは 404（レイアウトとここで assertPortalLive）。NOREN_FEATURE_INDEX_REWRITE=false のあいだも 404。
type SP = { region?: string; theme?: string; all?: string; q?: string; tag?: string };

const baseMetadata: Metadata = {
  title: `特集 — ${FEATURE_KIND_ROUNDUP}・${FEATURE_ROUNDUP_WALK}を読む | マチノワ`,
  description: `利用シーンに合わせて複数の店を紹介する${FEATURE_KIND_ROUNDUP}と、街の歩き方をまとめた${FEATURE_ROUNDUP_WALK}。地域・テーマ・キーワードから絞り込んで読めます。`,
  alternates: { canonical: "/feature" },
};

/** キーワード・タグの引数つき（検索の結果）は noindex,follow（旧 /feature/search と同じ）。それ以外は今までどおり（canonical は /feature） */
export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const p = await searchParams;
  return p.q?.trim() || p.tag?.trim() ? { ...baseMetadata, robots: { index: false, follow: true } } : baseMetadata;
}

/** 2 つの一覧の共通部分（ID の完全一致） */
const intersect = (a: Feature[], b: Feature[]): Feature[] => {
  const ids = new Set(b.map((f) => f.id));
  return a.filter((f) => ids.has(f.id));
};

async function NewFeatureIndexPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  assertPortalLive();
  if (!NOREN_FEATURE_INDEX_REWRITE) notFound();
  const params = await searchParams;
  const region = params.region as RegionKey | undefined;
  const theme = params.theme;
  const tag = (params.tag ?? "").trim();
  const q = (params.q ?? "").trim().slice(0, 60);
  const showAll = params.all === "1";

  const counts = getFeatureCountsByRegion();
  const availableRegions = (Object.keys(REGIONS) as RegionKey[]).filter((k) => counts[k] > 0);

  // フィルタが選ばれているか判定（地域・テーマ・タグ・キーワードは重ねて絞れる。何も無く all=1 なら全件）
  let filtered: Feature[] | null = null;
  const labels: string[] = [];
  const narrow = (list: Feature[]) => (filtered ? intersect(filtered, list) : list);
  if (region && availableRegions.includes(region)) {
    filtered = narrow(getFeaturesByRegion(region));
    labels.push(`地域: ${REGIONS[region].name}`);
  }
  if (theme) {
    filtered = narrow(filterByTheme(theme));
    labels.push(`テーマ: ${theme}`);
  }
  if (tag) {
    filtered = narrow(FEATURES.filter((f) => f.tag === tag));
    labels.push(`タグ: ${tag}`);
  }
  if (q) {
    // キーワード: 題・副題・小見出し・テーマ・番号（旧 /feature/search と同じ対象。大文字小文字は区別しない）
    const needle = q.toLowerCase();
    filtered = narrow(FEATURES.filter((f) => `${f.title} ${f.sub} ${f.kicker} ${f.tag} ${f.no}`.toLowerCase().includes(needle)));
    labels.push(`キーワード: ${q}`);
  }
  if (!filtered && showAll) {
    filtered = FEATURES;
    labels.push("全件");
  }
  const activeLabel = labels.join("・");

  // ───────── フィルタ選択済み: 該当記事のみ表示 ─────────
  if (filtered) {
    if (NOREN_FEATURE_ROUNDUP_PHOTO) {
      return (
        <PhotoFeatureShell>
          <RoundupListPage kind="filtered" activeLabel={activeLabel} items={filtered.map(toListCard)} q={q} />
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

  // ───────── フィルタ未選択時: 2 つの棚 ─────────
  if (NOREN_FEATURE_ROUNDUP_PHOTO) {
    const sh = getRoundupShelves();
    return (
      <PhotoFeatureShell>
        <RoundupListPage
          kind="shelves"
          scene={sh.scene}
          walk={sh.walk}
          regions={availableRegions.map((k) => ({ key: k, name: REGIONS[k].name, nameEn: REGIONS[k].nameEn, count: counts[k] }))}
          themes={THEME_GROUPS.filter((g) => countByTheme(g) > 0).map((g) => ({ label: g.label, labelEn: g.labelEn, count: countByTheme(g) }))}
          allCount={FEATURES.length}
        />
      </PhotoFeatureShell>
    );
  }
  const roundup = getRoundupGroups();
  return (
    <>
      <ListHero crumbs={[TOP_CRUMB, { label: "特集" }]} eyebrow="特集" cloth="特集">
        <h1 id="vI-h1" className="vI-h1">
          特集を、<em>読む。</em>
        </h1>
        <p className="vI-lead">
          {FEATURE_KIND_ROUNDUP}は利用シーンに合わせて複数の店を、{FEATURE_ROUNDUP_WALK}は街の歩き方を紹介します。
        </p>
      </ListHero>

      {/* シーン別まとめ記事（利用シーン + 複数の店）。絞り込み・検索の部品は今までどおり */}
      <section id={FEATURE_SHELF_ROUNDUP_ID} className="vI-shelf vI-shelf--matome" aria-labelledby="vI-roundup">
        <div className="vI-sec-in">
          <div className="vI-sh vN-rv">
            <div>
              <h2 id="vI-roundup" className="vF-h2d">{FEATURE_KIND_ROUNDUP}</h2>
              <p>{FEATURE_ROUNDUP_NOTE}{roundup.scene.length} 本。</p>
            </div>
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

export default NewFeatureIndexPage;
