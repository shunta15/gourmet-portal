import type { Metadata } from "next";
import P4LowerHome from "@/components/portal/hproto/p4lower/P4LowerHome";

// 総合トップの試作: 上半分は今の見本4(本番の / と同じ)・下半分だけ見本1(紙のコラージュ)の作り。仮の素材の一覧は components/portal/hproto/p4lower/Lower.tsx の冒頭。
export const metadata: Metadata = {
  title: "街と店、店と人。つながる輪を、マチノワから。",
  robots: { index: false, follow: false },
};

export default function Route() {
  return <P4LowerHome />;
}
