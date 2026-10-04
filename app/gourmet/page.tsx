import type { Metadata } from "next";
import GourmetHome from "@/components/portal/pages/gourmet-home";
import { assertPortalLive } from "@/lib/portal/launch";

// 旧トップ（/）の中身を移設したページ（中身は components/portal/pages/gourmet-home.tsx）。
// 公開スイッチ OFF のあいだは 404（本番は今のまま `/` がグルメのトップ。lib/portal/launch.ts）。
// ON のあいだだけの URL なので、canonical は自分自身の /gourmet。
export const metadata: Metadata = {
  title: "グルメの店をエリア・特集・シーンから探す｜マチノワグルメ",
  description:
    "全国の街のいいお店を、エリア・業態・特集・利用シーンから巡れるグルメのポータル「マチノワグルメ」。",
  alternates: { canonical: "/gourmet" },
};

export default async function Page() {
  assertPortalLive();
  return <GourmetHome />;
}
