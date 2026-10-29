import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import { min, minb, yomo, scr } from "@/components/portal/hproto/p4/fonts";
import "@/components/portal/hproto/p4/p4.css";

// 総合トップ「見本4(丸い切り抜き)」にスクロールの動き(モーション)を足した試作。プレビュー・ローカル専用(本番は 404)。検索エンジンに載せない。
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <div className={`${min.variable} ${minb.variable} ${yomo.variable} ${scr.variable}`}>{children}</div>;
}
