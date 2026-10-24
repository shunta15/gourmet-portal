import dynamic from "next/dynamic";
import { isPortalLive } from "@/lib/portal/launch";

// お問い合わせ（/contact）。公開スイッチ ON のときだけ、業種に寄らない総合サイトの共通の枠（/videos と同じ PortalLayout）で包む（components/portal/pages/CommonShell）。
// OFF のあいだは従来のまま（子をそのまま出す。CSS・ヘッダーの JS も読み込まない）。
const CommonShell = dynamic(() => import("@/components/portal/pages/CommonShell"));

export default function Layout({ children }: { children: React.ReactNode }) {
  return isPortalLive() ? <CommonShell>{children}</CommonShell> : <>{children}</>;
}
