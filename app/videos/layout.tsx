import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";

// 動画で探す（/videos 以下）。全業種共通の動画ページなので、どの業種にも寄らない総合サイトの共通の枠（PortalLayout＝業種の切り替えと検索のあるヘッダー・総合フッター。駅・エリア・地図と同じ）を出す。
// 2026-10-24 オーナー指示「動画は共通ページ作成してまとめて」。以前はグルメの枠（上端の竿の帯＝グルメ・特集・さがす。RELEASE_PERIPHERY）で出していたが、グルメの枠をやめた。
// 公開スイッチ（lib/portal/launch.ts）が OFF のあいだは、PortalLayout が 404 にする。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
