/**
 * 総合サイトのサイト内検索の候補データ（JSON）。ビルド時に静的に作る（lib/portal/searchIndex.ts）。
 * クライアント（components/portal/SearchBox.tsx）が、検索欄に初めてフォーカスしたときに取得する。
 * 店・駅の増減には、管理画面の保存時に /api/revalidate が作り直して追従する(時間での作り直しは付けない。lib/revalidatePlan.ts)。
 */
import { getSearchIndex } from "@/lib/portal/searchIndex";
import { assertPortalLive } from "@/lib/portal/launch";

export const dynamic = "force-static";

export async function GET() {
  assertPortalLive(); // 公開スイッチ OFF のあいだは 404（lib/portal/launch.ts）
  const { json } = await getSearchIndex();
  return Response.json(json);
}
