import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import { jp, min, logo, lab } from "@/components/portal/sproto2/a/fonts";
import "@/components/portal/sproto2/a/a.css";

// スポーツの試作 2-A(オーナーの見本 2 回目・最初のページと探すページ)。プレビュー・ローカル専用(本番は 404)。検索エンジンに載せない。
// 見本の文言・写真は仮(置き換えは案が決まってから)。店と特集は実データ。
export const metadata: Metadata = {
  title: "マチノワ スポーツ — 試作 2-A(見本)",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <div className={`s2-root ${jp.variable} ${min.variable} ${logo.variable} ${lab.variable}`}>{children}</div>;
}
