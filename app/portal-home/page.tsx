import type { Metadata } from "next";
import PortalHome from "@/components/portal/pages/home";
import { buildMetadata } from "@/lib/seo/meta";

// 総合トップ。公開スイッチ ON のとき `/` として出る（next.config.ts の rewrites）。検索エンジンに載せる（index）。
// canonical は `/`（/portal-home は `/` に redirect され、URL として公開しない）。
// openGraph / twitter の共有画像は総合サイト用（/og/home）を明示指定する（lib/seo/meta.ts の buildMetadata）。
export const metadata: Metadata = {
  ...buildMetadata({
    vertical: "portal",
    // 言葉は proto-portal/hub-concepts/COPY-FINAL.md（キャッチコピーそのまま。前後に足さない）。description はコンセプトの第 2・第 3 段落を、改行を取ってつないだもの
    title: "街と店、店と人。つながる輪を、マチノワから。",
    description:
      "ひとつの店との出会いが、次の出会いにつながり、その小さな輪が、街へと広がっていく。マチノワは、店と人をつなぎ、街の魅力を広げていく地域ポータルサイトです。",
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
