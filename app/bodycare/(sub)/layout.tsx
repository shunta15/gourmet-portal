import "@/components/portal/portal.css";
import GreenShell from "@/components/portal/bcproto/green/common/GreenShell";
import { assertPortalLive } from "@/lib/portal/launch";

// ボディケアの下の階層(特集記事 /bodycare/special など。種類・都道府県・利用シーン・旧特集は 308 転送で、ここまで来ない)。案4「グリーン」の枠(GreenShell)。
export default function Layout({ children }: { children: React.ReactNode }) {
  assertPortalLive();
  return <GreenShell>{children}</GreenShell>;
}
