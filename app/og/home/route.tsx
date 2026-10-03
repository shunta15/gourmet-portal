import { HomeCard, renderOg } from "@/components/portal/og/cards";

// 総合トップの共有画像（/og/home）。総合サイトの共有画像は buildMetadata から明示指定する（lib/seo/og.ts）
export async function GET() {
  return renderOg(<HomeCard />);
}
