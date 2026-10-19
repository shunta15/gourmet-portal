import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import MachiShell from "@/components/portal/hproto/machi/MachiShell";

// 総合トップの試作「まち」(見本の完全再現)。プレビュー・ローカル専用(本番は 404)。
export const metadata: Metadata = { title: "マチノワ — 総合トップ 案「まち」(見本)", robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <MachiShell>{children}</MachiShell>;
}
