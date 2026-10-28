import type { Metadata } from "next";
import P4Home from "@/components/portal/hproto/p4/P4Home";

// 総合トップの試作「見本4(丸い切り抜き)」(本番の / と同じ部品 P4Home)。写真と線画は見本から切り出した仮の素材。
export const metadata: Metadata = {
  title: "マチノワ | この街の好きが、みつかる。",
  robots: { index: false, follow: false },
};

export default function Route() {
  return <P4Home />;
}
