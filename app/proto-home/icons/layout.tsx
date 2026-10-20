import type { Metadata } from "next";
import "@/components/portal/portal.css";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import MachiShell from "@/components/portal/hproto/machi2/MachiShell";
import "@/components/portal/hproto/machi2/airy.css";
import "@/components/portal/hproto/machi2/simple.css";
import "@/components/portal/hproto/machi2/icons.css";

// 総合トップの試作「業種の札を写真からアイコンに変えた版」(本番の総合トップ = machi2 の部品をそのまま使い、simple.css(文字色)の上に icons.css を重ねる)。
// プレビュー・ローカル専用(本番は 404)。検索エンジンに載せない。
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <MachiShell prod airy icons>{children}</MachiShell>;
}
