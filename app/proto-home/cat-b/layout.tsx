import type { Metadata } from "next";
import "@/components/portal/portal.css";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import MachiShell from "@/components/portal/hproto/machi2/MachiShell";
import "@/components/portal/hproto/machi2/airy.css";
import "@/components/portal/hproto/machi2/simple.css";

// 総合トップの試作 業種の節 案 B「線画(タイポ主体)」。本番(/)と同じ中身・文・リンクで、業種の節だけを CatsB に差し替える。
// プレビュー・ローカル専用(本番は 404)。検索エンジンに載せない。
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <MachiShell prod airy simple>{children}</MachiShell>;
}
