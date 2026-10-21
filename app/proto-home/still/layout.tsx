import type { Metadata } from "next";
import "@/components/portal/portal.css";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import MachiShell from "@/components/portal/hproto/machi2/MachiShell";
import "@/components/portal/hproto/machi2/airy.css";
import "@/components/portal/hproto/machi2/simple.css";

// 総合トップの試作「最初の画面を 1 枚の絵にして、季節の切り替えを止めた版」(本番の総合トップ = machi2 + airy + simple の部品をそのまま使う)。
// 季節の舞う物(桜・紅葉・雪・光の粒)も出さない。鳥・気球・雲などの季節に関係ない動きは残す。
// プレビュー・ローカル専用(本番は 404)。検索エンジンに載せない。
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <MachiShell prod airy simple still>{children}</MachiShell>;
}
