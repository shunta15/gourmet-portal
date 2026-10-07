import "./nigiwai.css";
import "./themes.css";
import Nigiwai from "./Nigiwai";
import NigiwaiFonts from "./NigiwaiFonts";
import Statement from "./Statement";
import ThemeSwatch from "./ThemeSwatch";
import { getHubData } from "@/lib/portal/hub";
import { getNigiwaiPhotos } from "@/lib/portal/hubs/nigiwai/photos";
import type { ThemeKey } from "@/lib/portal/hubs/nigiwai/themes";

/**
 * 案「にぎわいの輪」の 1 ページぶん（サーバー）。色の組（theme）だけが違う。
 * .ngp[data-theme] を最初から付けて描くので、朱が一瞬見えてから変わることはない。
 */
export default async function NigiwaiPage({ theme }: { theme: ThemeKey }) {
  const [data, photos] = await Promise.all([getHubData(), getNigiwaiPhotos()]);
  return (
    <div className="ngp" data-theme={theme}>
      <NigiwaiFonts />
      <Nigiwai items={data.items} gourmetTotal={data.gourmetTotal} featureTotal={data.featureTotal} open={data.open} photos={photos.ring} />
      <ThemeSwatch current={theme} />
      <Statement side={photos.side} />
    </div>
  );
}
