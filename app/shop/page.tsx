import type { Metadata } from "next";
import P4Shop from "@/components/portal/hproto/p4/P4Shop";
import { buildMetadata } from "@/lib/seo/meta";

// 総合の店舗紹介。題は見出しと同じ「店舗紹介」。説明はページの説明文と同じ。
// 試作のあいだは検索エンジンに載せない(公開を決めたら index: true にして、app/sitemap.ts の総合ページの並びへ足す)。
const DESCRIPTION = "マチノワで紹介しているお店をまとめています。";
export const metadata: Metadata = {
  ...buildMetadata({ vertical: "portal", title: "店舗紹介", description: DESCRIPTION, path: "/shop", count: 8 }),
  alternates: { canonical: "/shop" },
  robots: { index: false, follow: false },
};

export const revalidate = 3600;

export default function Page() {
  return <P4Shop />;
}
