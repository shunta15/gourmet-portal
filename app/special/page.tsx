import type { Metadata } from "next";
import P4Special from "@/components/portal/hproto/p4/P4Special";
import { buildMetadata } from "@/lib/seo/meta";
import { P1_ONE } from "@/components/portal/hproto/machi2/copy";

// 総合の特集一覧。題は見出しと同じ「特集」。説明は決まった言葉(コンセプト 1 段落目)を、改行を取ってつないだもの。
export const metadata: Metadata = {
  ...buildMetadata({ vertical: "portal", title: "特集", description: P1_ONE, path: "/special", count: 8 }),
  alternates: { canonical: "/special" },
  robots: { index: true, follow: true },
};


export default function Page() {
  return <P4Special />;
}
