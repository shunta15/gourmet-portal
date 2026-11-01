/**
 * 候補リスト（/list）が使う、店 1 軒ぶんの小さな JSON。ビルド時に店ごとに静的に作る（lib/portal/listData.ts）。
 * クライアントは、リストに入っている店の分だけ取る（全店のデータは渡さない）。実行時に DB は叩かない。
 * generateStaticParams にない ID は 404（dynamicParams = false。実行時に集計しない）。
 * 公開スイッチ OFF のあいだは、ID を 1 つも作らず（liveStaticParams）、404 になる（next.config.ts の PORTAL_OFF_SOURCES でも 404）。
 */
import { getListShop, getListShopIds } from "@/lib/portal/listData";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";

export const dynamic = "force-static";
export const dynamicParams = false;
// 店の編集には、管理画面の保存時に /api/revalidate が /list-data/<店 ID> を作り直して追従する(時間での作り直しは付けない。lib/revalidatePlan.ts)。
// 店の追加・削除は再デプロイ(generateStaticParams)で反映される。

export const generateStaticParams = liveStaticParams(async () => (await getListShopIds()).map((id) => ({ id })));

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  assertPortalLive();
  const { id } = await ctx.params;
  const shop = await getListShop(id);
  if (!shop) return new Response(null, { status: 404 });
  return Response.json(shop);
}
