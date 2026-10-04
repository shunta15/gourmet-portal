/**
 * 総合サイトのサイト内検索の候補データ（JSON）。ビルド時に静的に作る（lib/portal/searchIndex.ts）。
 * クライアント（components/portal/SearchBox.tsx）が、検索欄に初めてフォーカスしたときに取得する。
 * 店・駅の増減に追従するよう 1 時間ごとに再生成する。
 */
import { getSearchIndex } from "@/lib/portal/searchIndex";
import { assertPortalLive } from "@/lib/portal/launch";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  assertPortalLive(); // 公開スイッチ OFF のあいだは 404（lib/portal/launch.ts）
  const { json } = await getSearchIndex();
  return Response.json(json);
}
