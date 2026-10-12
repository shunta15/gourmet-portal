import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import PhotoFeatureShell from "@/components/portal/photoFeature/PhotoFeatureShell";

// 写真が主役の特集記事の試作（プレビュー・ローカル専用）。
// 404 になる条件: 公開スイッチが OFF、またはプレビュー・ローカルでない（本番は 404）。
// グルメの共通の枠（SiteShell の旧ヘッダーなど）は、photofeature.css で隠す（isPortalPath は変えない約束のため）。
export const metadata: Metadata = {
  title: "マチノワグルメ（試作・写真の特集）",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <PhotoFeatureShell>{children}</PhotoFeatureShell>;
}
