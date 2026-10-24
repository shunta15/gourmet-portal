import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import S2bFrame from "@/components/portal/sproto2/b/S2bFrame";

// スポーツの試作 B 案(見本2)「特集」。オーナーの見本の再現。プレビュー・ローカル専用(本番は 404)・noindex。
export const metadata: Metadata = {
  title: "マチノワ スポーツ — 特集(試作)",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <S2bFrame>{children}</S2bFrame>;
}
