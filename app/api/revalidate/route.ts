/**
 * On-demand ISR revalidation API
 *
 * 認証ユーザーからのリクエストのみ受け付ける。
 * admin での店舗/特集編集後にこのエンドポイントを呼ぶと、
 * 該当ページの ISR キャッシュが即時クリアされ次回アクセスで再生成される。
 *
 * 使い方:
 *   POST /api/revalidate
 *   body: { paths: ["/restaurant/r01", "/feature/feature-xxx"] }
 *   header: Authorization: Bearer <supabase user JWT>
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // Supabase Auth で認証ユーザーか確認
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let paths: string[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body?.paths)) {
      paths = body.paths.filter(
        (p: any) => typeof p === "string" && p.startsWith("/")
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (paths.length === 0) {
    return NextResponse.json({ error: "No paths provided" }, { status: 400 });
  }

  const revalidated: string[] = [];
  for (const p of paths) {
    try {
      revalidatePath(p);
      revalidated.push(p);
    } catch (e) {
      console.warn(`revalidate failed for ${p}:`, e);
    }
  }

  return NextResponse.json({ revalidated, count: revalidated.length });
}
