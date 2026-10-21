import "@/components/portal/portal.css";
import CpFrame from "@/components/portal/colorplay/Frame";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";

// ビューティーの「さがす」(/beauty/search)と店のページ(/beauty/shop/{id})の枠。COLOR PLAY の外枠。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <CpFrame site={BEAUTY_SITE}>{children}</CpFrame>;
}
