import { HomeCard, renderOg } from "@/components/portal/og/cards";
import { assertPortalLive } from "@/lib/portal/launch";

// 総合トップの共有画像（/og/home）。総合サイトの共有画像は buildMetadata から明示指定する（lib/seo/og.ts）
export async function GET() {
  assertPortalLive(); // 公開スイッチ OFF のあいだは 404（lib/portal/launch.ts）
  return renderOg(<HomeCard />);
}
