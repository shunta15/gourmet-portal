import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import MachiShell from "@/components/portal/hproto/machi2/MachiShell";

// 総合トップの試作「まち」改(オーナーが仕上げた見本の再現)。プレビュー・ローカル専用(本番は 404)。
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <MachiShell>{children}</MachiShell>;
}
