import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import { min, minb, hand } from "@/components/portal/hproto/p3/fonts";
import "@/components/portal/hproto/p3/p3.css";

// 総合トップの試作「p3」(写真コラージュの見本の再現)。ほかの試作と同じく、プレビュー・ローカル専用(本番は 404)。検索エンジンに載せない。
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <div className={`${min.variable} ${minb.variable} ${hand.variable}`}>{children}</div>;
}
