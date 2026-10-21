import type { Metadata } from "next";
import "@/components/portal/portal.css";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import MachiShell from "@/components/portal/hproto/machi2/MachiShell";
import "@/components/portal/hproto/machi2/airy.css";
import "@/components/portal/hproto/machi2/simple.css";

// 総合トップの試作「業種の節 案D 写真なし・大きな色の丸アイコン」(本番の総合トップ = machi2 の部品をそのまま使い、業種の節だけ CatsD に差し替える)。
// プレビュー・ローカル専用(本番は 404)。検索エンジンに載せない。
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <MachiShell prod airy simple>{children}</MachiShell>;
}
