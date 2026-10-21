import type { Metadata } from "next";
import PhotoCreditsView from "@/components/portal/periphery/PhotoCreditsView";

/**
 * 写真の出典 /photo-credits。総合トップ（/）で使っている Wikimedia Commons の写真の出典（題・作者・許諾）を 1 枚ずつ表で出す。
 * 中身は components/portal/hproto/machi2/credits.json を import（fs・process.cwd は使わない。本番でもそのまま出せる静的ページ）。
 * 見た目は周りのページ（/about・/editorial/guidelines）と同じ枠（components/portal/periphery/）。
 * 総合トップのフッターの「写真の出典」（components/portal/hproto/machi2/prodData.ts の PROD_FOOT.credits）から来る。
 */
export const metadata: Metadata = {
  title: "写真の出典 | マチノワ",
  description: "マチノワの総合トップで使っている写真（Wikimedia Commons）の出典。題・作者・許諾の一覧。",
  alternates: { canonical: "/photo-credits" },
};

export default function PhotoCreditsPage() {
  return <PhotoCreditsView />;
}
