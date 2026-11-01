import type { Metadata } from "next";
import Shell from "@/components/portal/gnoren/common/Shell";
import { GN_LIVE_LINKS } from "@/components/portal/gnoren/common/nav";
import TopPageReal from "@/components/portal/gnoren/real/top/TopPageReal";
import { assertPortalLive } from "@/lib/portal/launch";
import { buildTopData } from "@/lib/portal/gnoren/top";

// グルメのトップ（公開スイッチ ON のときだけ。2026-11-02 から暖簾 2 のデザイン。枠は各 page.tsx の Shell）。
// 中身は components/portal/gnoren/real/top/TopPageReal.tsx（見本 1 の実データ版。データ整形は lib/portal/gnoren/top.ts）。
// 公開スイッチ OFF のあいだは 404（lib/portal/launch.ts）。
// ON のあいだだけの URL なので、canonical は自分自身の /gourmet。title・description は旧 /gourmet と同じ。
export const metadata: Metadata = {
  title: "グルメの店をエリア・特集・シーンから探す｜マチノワグルメ",
  description:
    "全国の街のいいお店を、エリア・業態・特集・利用シーンから巡れるグルメのポータル「マチノワグルメ」。",
  alternates: { canonical: "/gourmet" },
};

export default async function Page() {
  assertPortalLive();
  const data = await buildTopData();
  return (
    <Shell page="top" links={GN_LIVE_LINKS}>
      <TopPageReal data={data} links={GN_LIVE_LINKS} />
    </Shell>
  );
}
