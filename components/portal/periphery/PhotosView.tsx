/**
 * 写真から探す /photos の新しい見た目（サーバー）。metadata・絞り込み（?genre= ?pref=）・壁・大きな表示は components/portal/pages/photos.tsx・components/portal/photos/* のまま。
 * 枠は周りのページと同じ（PeripheryFrame）。壁と大きな表示（今の部品）は、総合サイトの色の変数をまとった枠（.mp.pp-ph）の中に置き、周りのページの和紙の地の上に出す。
 * 写真の店は /restaurant/<店 ID>。字は今のページと同じ。
 */
import "../photos.css";
import Breadcrumbs from "../Breadcrumbs";
import PortalFonts from "../PortalFonts";
import PhotoWall from "../photos/PhotoWall";
import type { WallData } from "@/lib/portal/photoWallShared";
import PeripheryFrame from "./PeripheryFrame";
import { Hero } from "./parts";

export default function PhotosView({ data, initial }: { data: WallData; initial: { genre: string; pref: string } }) {
  return (
    <PeripheryFrame>
      <PortalFonts />
      <Hero
        before={
          <Breadcrumbs
            className="pp-crumbs"
            items={[
              { name: "マチノワ", href: "/" },
              { name: "写真から探す", href: "/photos" },
            ]}
          />
        }
        eyebrow="Machinowa — Photos"
        title="写真から探す"
        lead="全国の掲載店の料理写真を、壁のように並べました。気になる一枚を押すと、店の名前と街、店のページへの入口が開きます。"
        compact
      />
      <section className="rp-shelf pp-ph-sec" aria-label="料理の写真の壁">
        <div className="mp pp-ph">
          <PhotoWall key={`${initial.genre}|${initial.pref}`} data={data} initial={initial} />
        </div>
      </section>
    </PeripheryFrame>
  );
}
