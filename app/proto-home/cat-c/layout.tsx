import type { Metadata } from "next";
import "@/components/portal/portal.css";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import MachiShell from "@/components/portal/hproto/machi2/MachiShell";
import "@/components/portal/hproto/machi2/airy.css";
import "@/components/portal/hproto/machi2/simple.css";

// 総合トップの試作 案 C「実写タイル」(本番の総合トップ = machi2 + airy + simple の上で、業種の節だけ cats で差し替える)。
// プレビュー・ローカル専用(本番は 404)。検索エンジンに載せない。
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <MachiShell prod airy simple>{children}</MachiShell>;
}
