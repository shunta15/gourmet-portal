import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import NorenFrame from "@/components/portal/noren/NorenFrame";
import { NOREN_TOP } from "@/lib/portal/noren/nav";

// 暖簾のデザインの見本（トップ・店ページ・特集記事ページ）。プレビュー・ローカル専用。
// 404 になる条件: 公開スイッチ OFF（next.config.ts の PORTAL_OFF_SOURCES と、ここ）、または プレビュー・ローカルでない（本番は ON でも 404）。
// 枠（紙・提灯・ヘッダー・フッター）は components/portal/noren/NorenFrame.tsx。本番の /gourmet（app/gourmet/layout.tsx）と共通。
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <NorenFrame top={NOREN_TOP}>{children}</NorenFrame>;
}
