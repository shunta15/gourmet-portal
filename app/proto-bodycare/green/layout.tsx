import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import { jp, min, hand } from "@/components/portal/bcproto/green/common/fonts";
import Header from "@/components/portal/bcproto/green/common/Header";
import Footer from "@/components/portal/bcproto/green/common/Footer";
import GreenFx from "@/components/portal/bcproto/green/common/GreenFx";
import "@/components/portal/bcproto/green/common/base.css";

// ボディケアの試作「グリーン案」(オーナーの見本 3 枚の完全再現)。プレビュー・ローカル専用(本番は 404)。
export const metadata: Metadata = { title: "マチノワ Body Care — グリーン案(見本)", robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return (
    <div className={`gr-root ${jp.variable} ${min.variable} ${hand.variable}`}>
      <p className="gr-demo-bar">見本(デザイン確認用。店名・評価・料金・文章は仮の内容です)</p>
      <div className="gr-progress" aria-hidden="true" />
      <div className="gr-edge gr-edge-l" aria-hidden="true">
        <i className="far" />
        <i className="near" />
      </div>
      <div className="gr-edge gr-edge-r" aria-hidden="true">
        <i className="far" />
        <i className="near" />
      </div>
      <Header />
      <main className="gr-main">{children}</main>
      <Footer />
      <GreenFx />
    </div>
  );
}
