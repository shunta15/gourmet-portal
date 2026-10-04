import type { Metadata } from "next";
import PortalHome from "@/components/portal/pages/home";
import { buildMetadata } from "@/lib/seo/meta";

// 総合トップ。公開スイッチ ON のとき `/` として出る（next.config.ts の rewrites）。検索エンジンに載せる（index）。
// canonical は `/`（/portal-home は `/` に redirect され、URL として公開しない）。
// openGraph / twitter の共有画像は総合サイト用（/og/home）を明示指定する（lib/seo/meta.ts の buildMetadata）。
export const metadata: Metadata = {
  ...buildMetadata({
    vertical: "portal",
    title: "マチノワ — 街の店を、業種をまたいで探す",
    description:
      "グルメ・ビューティー・ボディケア・ペット・おでかけ・ステイ。街の店を、業種をまたいで探せるポータル「マチノワ」。",
    path: "/",
    count: 0,
  }),
  alternates: { canonical: "/" },
  // 総合トップは index（新業種の各ページは件数ゲート lib/seo/gate.ts のまま）
  robots: { index: true, follow: true },
};

export default function Page() {
  return <PortalHome />;
}
