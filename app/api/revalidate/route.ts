/**
 * On-demand ISR revalidation API
 *
 * 認証ユーザーからのリクエストのみ受け付ける。
 * admin での店舗/特集編集後にこのエンドポイントを呼ぶと、
 * 該当ページの ISR キャッシュが即時クリアされ次回アクセスで再生成される。
 *
 * 使い方:
 *   POST /api/revalidate
 *   body: { paths: ["/restaurant/r01", "/feature/feature-xxx"], scope?: "gourmet" | "all" }
 *   公開 URL のパスを渡すと、rewrites 後の実体のパス(/gourmet/restaurant/<id> など)・トップ・一覧・sitemap なども
 *   まとめて作り直す(lib/revalidatePlan.ts)。scope: "all" はサイト全体(店の追加・削除・住所や公開の変更のとき)。
 *   header: Authorization: Bearer <supabase user JWT>
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { planRevalidation, type RevalidateScope } from "@/lib/revalidatePlan";

export async function POST(req: NextRequest) {
  // Supabase Auth で認証ユーザーか確認
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let paths: string[] = [];
  let scope: RevalidateScope = "gourmet";
  try {
    const body = await req.json();
    if (Array.isArray(body?.paths)) {
      paths = body.paths.filter(
        (p: any) => typeof p === "string" && p.startsWith("/")
      );
    }
    if (body?.scope === "all") scope = "all";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (paths.length === 0) {
    return NextResponse.json({ error: "No paths provided" }, { status: 400 });
  }

  const plan = planRevalidation(paths, scope);
  const revalidated: string[] = [];
  const failed: string[] = [];
  for (const p of plan.pages) {
    try {
      revalidatePath(p);
      revalidated.push(p);
    } catch (e) {
      console.warn(`revalidate failed for ${p}:`, e);
      failed.push(p);
    }
  }
  for (const p of plan.layouts) {
    try {
      revalidatePath(p, "layout");
      revalidated.push(`${p} (layout)`);
    } catch (e) {
      console.warn(`revalidate (layout) failed for ${p}:`, e);
      failed.push(`${p} (layout)`);
    }
  }

  // If all paths failed, return 500. Otherwise, return 200 with both lists.
  const status = revalidated.length === 0 && failed.length > 0 ? 500 : 200;
  return NextResponse.json(
    { revalidated, failed, count: revalidated.length },
    { status }
  );
}
