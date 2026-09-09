/**
 * CV イベント記録 API
 * POST /api/track
 * body: { event_type, entity_type, entity_id, metadata? }
 *
 * 公開ページから anon キーで叩ける（RLS 公開 insert ポリシーが必要）
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type, entity_type, entity_id, metadata } = body;
    if (!event_type || !entity_type || !entity_id) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }
    const { error } = await supabase.from("cv_events").insert({
      event_type,
      entity_type,
      entity_id,
      metadata: metadata ?? null,
      session_id: req.headers.get("x-session-id") ?? null,
    });
    if (error) {
      // RLS エラーは 403、それ以外は 500
      console.error("[track] DB error:", error);
      return NextResponse.json({ skipped: true }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[track] exception:", e);
    return NextResponse.json({ error: "記録に失敗しました" }, { status: 500 });
  }
}
