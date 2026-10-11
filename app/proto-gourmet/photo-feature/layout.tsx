import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import "@/components/portal/photoFeature/photofeature.css";
import Motion from "@/components/portal/photoFeature/Motion";
import { Defs } from "@/components/portal/photoFeature/parts";

// 写真が主役の特集記事の試作（プレビュー・ローカル専用）。
// 404 になる条件: 公開スイッチが OFF、またはプレビュー・ローカルでない（本番は 404）。
// グルメの共通の枠（SiteShell の旧ヘッダーなど）は、photofeature.css で隠す（isPortalPath は変えない約束のため）。
export const metadata: Metadata = {
  title: "マチノワグルメ（試作・写真の特集）",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return (
    <div className="pf-root">
      {/* 太い明朝（ルートの読み込みは 500・700 だけなので、800 もここで読む。読めない環境では、手元の明朝に落ちる） */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;500;700;800&display=swap" precedence="default" />
      <Defs />
      <a className="pf-skip" href="#main">本文へ移動</a>
      {children}
      <Motion />
    </div>
  );
}
