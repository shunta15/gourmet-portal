import type { Metadata } from "next";
import "@/components/portal/hubs/nigiwai/nigiwai.css";
import Nigiwai from "@/components/portal/hubs/nigiwai/Nigiwai";
import NigiwaiFonts from "@/components/portal/hubs/nigiwai/NigiwaiFonts";
import Statement from "@/components/portal/hubs/nigiwai/Statement";
import { getHubData } from "@/lib/portal/hub";
import { getNigiwaiPhotos } from "@/lib/portal/hubs/nigiwai/photos";

// 総合トップ 案「にぎわいの輪」（試作・非公開）。コンセプト 3。/proto-hub/nigiwai
// 公開スイッチ OFF のあいだは、枠（app/proto-hub/layout.tsx）が 404 にする。検索エンジンには載せない。
export const metadata: Metadata = {
  title: "にぎわいの輪 — 総合トップ案（試作）",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const [data, photos] = await Promise.all([getHubData(), getNigiwaiPhotos()]);
  return (
    <>
      <NigiwaiFonts />
      <Nigiwai items={data.items} gourmetTotal={data.gourmetTotal} featureTotal={data.featureTotal} open={data.open} photos={photos.ring} />
      <Statement side={photos.side} />
    </>
  );
}
