import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shell from "@/components/portal/gnoren/common/Shell";
import { GN_LIVE_LINKS } from "@/components/portal/gnoren/common/nav";
import FeatureListReal from "@/components/portal/gnoren/real/featurelist/FeatureListReal";
import { getFeatureListVM, type GnFlSP } from "@/lib/portal/gnoren/featurelist";
import { FEATURE_KIND_ROUNDUP, FEATURE_ROUNDUP_WALK } from "@/lib/portal/noren/featureKinds";
import { assertPortalLive } from "@/lib/portal/launch";
import { NOREN_FEATURE_INDEX_REWRITE } from "@/lib/portal/noren/rewrites";

// 特集のトップ（一覧）の暖簾版の実体（内部のパス）。公開スイッチ ON のとき、/feature が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical は /feature のまま。この内部のパス /gourmet/feature は外に出さない）。
// 【2026-11-02 暖簾 2 本番化】見た目は暖簾 2 の見本 5（components/portal/gnoren/real/featurelist/FeatureListReal.tsx）。設計は同フォルダの README.md。
// 枠（ヘッダー・フッター）は各 page.tsx で付ける（Shell page="feature"）。layout は assertPortalLive とフォントだけ。
// 絞り込み（?region=・?theme=・?tag=・?q=・?all=1）の意味は今までどおり（lib/portal/gnoren/featurelist.ts）。結果は、上の部分（布札・注目）のすぐ下の節に出す。
// 並べる記事は、シーン別まとめ記事と街歩き・コースの 178 本（FEATURES）。店 1 軒の記事は並べない（店は「店舗紹介」 /restaurant）。
// 旧 /feature/search（特集を探す）は一覧の中の検索欄（?q=）へ、旧 /feature/region/<キー> は地域の絞り込み（?region=<キー>）へ、それぞれ 308（next.config.ts の redirects）。
// 公開スイッチ OFF のあいだは 404（レイアウトとここで assertPortalLive）。NOREN_FEATURE_INDEX_REWRITE=false のあいだも 404。
type SP = GnFlSP;

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

export default async function NewFeatureIndexPage({ searchParams }: { searchParams: Promise<SP> }) {
  assertPortalLive();
  if (!NOREN_FEATURE_INDEX_REWRITE) notFound();
  const vm = getFeatureListVM(await searchParams);
  return (
    <Shell page="feature" links={GN_LIVE_LINKS}>
      <FeatureListReal vm={vm} />
    </Shell>
  );
}
