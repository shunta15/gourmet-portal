import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import Shell from "@/components/portal/gnoren/common/Shell";
import { GN_PROTO_LINKS } from "@/components/portal/gnoren/common/nav";
import ArticleView from "@/components/portal/gnoren/real/article/ArticleView";
import { GN_ARTICLE_FIXTURES } from "@/components/portal/gnoren/real/article/fixture";

// 特集記事の部品(real/article/ArticleView)の確認用。?k=single|long|roundup|walk(実在の記事の文で組んだ GnArticleVM 3 種)。
// プレビュー・ローカル専用(試作 /proto-gourmet/n の中)。検索エンジンに載せない。
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  assertPreviewOrLocal();
  const { k } = await searchParams;
  const key = k === "roundup" || k === "walk" || k === "long" ? k : "single";
  return (
    <Shell page="feature" links={GN_PROTO_LINKS}>
      <ArticleView vm={GN_ARTICLE_FIXTURES[key]} links={GN_PROTO_LINKS} />
    </Shell>
  );
}
