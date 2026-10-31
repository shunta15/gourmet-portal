import type { Metadata } from "next";
import P4Shop from "@/components/portal/hproto/p4/P4Shop";
import { buildMetadata } from "@/lib/seo/meta";

// 総合の店舗紹介。題は見出しと同じ「店舗紹介」。説明はページの説明文と同じ。
// 2026-10-29 公開。検索エンジンに載せる(app/sitemap.ts の総合ページの並びにも足してある)。
const DESCRIPTION = "マチノワで紹介しているお店をまとめています。";
export const metadata: Metadata = {
  ...buildMetadata({ vertical: "portal", title: "店舗紹介", description: DESCRIPTION, path: "/shop", count: 8 }),
  alternates: { canonical: "/shop" },
  robots: { index: true, follow: true },
};


export default function Page() {
  return <P4Shop />;
}
