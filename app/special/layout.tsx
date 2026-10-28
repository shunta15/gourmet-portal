import "@/components/portal/portal.css";
import { HomeShell } from "@/components/portal/hproto/p4/entry";
import { assertPortalLive } from "@/lib/portal/launch";

// 総合の特集一覧(/special)。総合トップ(見本4)と同じ枠(書体と CSS)・同じヘッダー・フッター(components/portal/hproto/p4/P4Chrome.tsx)。
// 公開スイッチ OFF のあいだは 404(next.config.ts の PORTAL_OFF_SOURCES と assertPortalLive)。
export default function Layout({ children }: { children: React.ReactNode }) {
  assertPortalLive();
  return <HomeShell>{children}</HomeShell>;
}
