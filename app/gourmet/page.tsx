import type { Metadata } from "next";
import GourmetNorenHome from "@/components/portal/pages/gourmet-noren-home";
import { assertPortalLive } from "@/lib/portal/launch";
import { LIVE_LINKS } from "@/lib/portal/noren/nav";

// グルメのトップ（公開スイッチ ON のときだけ。2026-10-09 から暖簾のデザイン。枠は app/gourmet/layout.tsx）。
// 中身は components/portal/pages/gourmet-noren-home.tsx（見本 /proto-noren と共通。行き先だけ本物のページ）。
// 旧トップ（components/portal/pages/gourmet-home.tsx）は OFF のときの `/` がそのまま使う。
// 公開スイッチ OFF のあいだは 404（本番は今のまま `/` がグルメのトップ。lib/portal/launch.ts）。
// ON のあいだだけの URL なので、canonical は自分自身の /gourmet。title・description は旧 /gourmet と同じ。
export const metadata: Metadata = {
  title: "グルメの店をエリア・特集・シーンから探す｜マチノワグルメ",
  description:
    "全国の街のいいお店を、エリア・業態・特集・利用シーンから巡れるグルメのポータル「マチノワグルメ」。",
  alternates: { canonical: "/gourmet" },
};

export default async function Page() {
  assertPortalLive();
  return <GourmetNorenHome links={LIVE_LINKS} />;
}
