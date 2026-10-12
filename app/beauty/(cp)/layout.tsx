import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";
import CpFrame from "@/components/portal/colorplay/Frame";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { isColorplay } from "@/lib/portal/verticalDesign";

// ビューティーの「さがす」(/beauty/search)と店のページ(/beauty/shop/{id})の枠。
// COLOR PLAY（VERTICAL_DESIGN.beauty）のときは COLOR PLAY の外枠。"legacy" のときは、これまでの共通の枠（共通ヘッダーあり。/beauty/search は 404）。
export default function Layout({ children }: { children: React.ReactNode }) {
  if (isColorplay("beauty")) return <CpFrame site={BEAUTY_SITE}>{children}</CpFrame>;
  return <PortalLayout>{children}</PortalLayout>;
}
