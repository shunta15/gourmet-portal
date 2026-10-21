import "@/components/portal/portal.css";
import GreenShell from "@/components/portal/bcproto/green/common/GreenShell";
import { assertPortalLive } from "@/lib/portal/launch";

// ボディケアの「さがす」(/bodycare/search)の枠。案4「グリーン」の枠(GreenShell。自前のヘッダー・フッター)。
export default function Layout({ children }: { children: React.ReactNode }) {
  assertPortalLive();
  return <GreenShell>{children}</GreenShell>;
}
