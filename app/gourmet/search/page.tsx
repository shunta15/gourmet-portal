import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Shell from "@/components/portal/gnoren/common/Shell";
import { GN_LIVE_LINKS } from "@/components/portal/gnoren/common/nav";
import SearchTop from "@/components/portal/gnoren/real/search/SearchTop";
import SearchFinder from "@/components/portal/gnoren/real/search/SearchFinder";
import { assertPortalLive } from "@/lib/portal/launch";
import { NOREN_SEARCH_REWRITE } from "@/lib/portal/noren/rewrites";
import { getSearchData } from "@/lib/portal/gnoren/search";

// 店をさがす（/search）の暖簾 2 版の実体（内部のパス）。公開スイッチ ON のとき、/search が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical は /search のまま。この内部のパス /gourmet/search は外に出さない）。枠（ヘッダー・フッター）はこのページが Shell で付ける。
// 中身: 上（ヒーロー・統計の帯。サーバー描画）→ 絞り込み（料理 7・エリア 8 + ほかの地域・シーン 7・言葉・地図）→ 検索結果（1 ページ 24 店・?page=）。
// 絞り込みは URL の ?q= ?region= ?town= ?cuisine= ?scene= ?tag= ?page= ?sort= を読む（components/portal/gnoren/real/search/SearchFinder.tsx。今の NorenSearch と同じ意味）。
// metadata（noindex を含む）は今までどおり。OFF のあいだ・NOREN_SEARCH_REWRITE=false のあいだは 404。
// export const revalidate は書かない（ISR は管理画面の保存で作り直す）。
export const metadata: Metadata = {
  title: "店舗を探す — マチノワ",
  description:
    "全国の飲食店を、地域・業種・キーワードで探す。",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default async function Page() {
  assertPortalLive();
  if (!NOREN_SEARCH_REWRITE) notFound();
  const data = await getSearchData();
  return (
    <Shell page="search" links={GN_LIVE_LINKS}>
      <main className="gn-search">
        <SearchTop total={data.total} regionCount={data.regionCount} cuisineCount={data.cuisines.length} />
        {/* 結果の一覧は、URL の引数を読むクライアント(Suspense の中)が描く。描かれる前も高さを取っておく */}
        <Suspense fallback={<div className="gn-search-r-skel" aria-hidden="true" />}>
          <SearchFinder data={data} />
        </Suspense>
      </main>
    </Shell>
  );
}
