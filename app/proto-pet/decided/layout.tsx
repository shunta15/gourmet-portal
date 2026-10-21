import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import { jp, min, hand, en } from "@/components/portal/petproto/decided/common/fonts";
import "@/components/portal/petproto/decided/common/base.css";

// ペットの試作「決定案」(オーナーの見本 4 枚の完全再現)。プレビュー・ローカル専用(本番は 404)。
export const metadata: Metadata = {
  title: "マチノワ Pet — 決定案(見本)",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return (
    <div className={`pt-root ${jp.variable} ${min.variable} ${hand.variable} ${en.variable}`}>
      <p className="pt-demo-bar">見本(デザイン確認用。店名・評価・料金・文章は仮の内容です)</p>
      {children}
    </div>
  );
}
