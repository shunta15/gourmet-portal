import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import { jp, min, en, lab } from "@/components/portal/stayproto/decided/common/fonts";
import "@/components/portal/stayproto/decided/common/base.css";

// ステイの試作「決定案」(オーナーの見本 4 枚の再現)。プレビュー・ローカル専用(本番は 404)。ペットの app/proto-pet/decided/layout.tsx と同じ作り。
export const metadata: Metadata = {
  title: "マチノワ ステイ — 決定案(見本)",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return (
    <div className={`sy-root ${jp.variable} ${min.variable} ${en.variable} ${lab.variable}`}>
      <p className="sy-demo-bar">見本(デザイン確認用。宿名・文章は仮の内容です)</p>
      {children}
    </div>
  );
}
