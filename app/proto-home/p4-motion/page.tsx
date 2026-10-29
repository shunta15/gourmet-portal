import type { Metadata } from "next";
import P4MotionHome from "@/components/portal/hproto/p4motion/P4MotionHome";

// 総合トップ(本番の / = 見本4)と止まったときの見た目は同じで、動き(登場・スクロール・ホバー)だけ足した試作。
export const metadata: Metadata = {
  title: "街と店、店と人。つながる輪を、マチノワから。",
  robots: { index: false, follow: false },
};

export default function Route() {
  return <P4MotionHome />;
}
