import type { Metadata } from "next";
import PortalHome from "@/components/portal/pages/home";
import Machi2Page from "@/components/portal/hproto/machi2/Page";
import { cardPhotos } from "@/components/portal/hproto/machi2/cards";
import { latestNews } from "@/components/portal/hproto/machi2/news";
import { seasonNowJst } from "@/components/portal/hproto/machi2/season";
import { HOME_AIRY, HOME_DESIGN } from "@/lib/portal/homeDesign";
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

// 見た目は lib/portal/homeDesign.ts の HOME_DESIGN で選ぶ（"machi2" = 「まち」改・"nigiwai" = 従来の輪）。
// machi2 は最初の季節を日本時間の今日の月で決めるので、1 時間ごとに作り直す（revalidate）。
export const revalidate = 3600;

export default async function Page() {
  // 「読みもの」カードの 2 枚(まちのストーリー・家族でおでかけ)は、リンク先の記事の実際の写真(記事ページと同じ取り方)
  if (HOME_DESIGN === "machi2") return <Machi2Page mihon={false} season={seasonNowJst()} prod news={latestNews(4)} cards={await cardPhotos()} airy={HOME_AIRY} />;
  return <PortalHome />;
}
