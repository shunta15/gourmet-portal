/**
 * ニュースレター購読 API
 *
 * POST /api/newsletter/subscribe
 * body: { email }
 *
 * 現状: Supabase の newsletter_subscribers テーブルに保存。
 * テーブルが無い場合は console.warn にフォールバック（フォーム自体は成功扱い）。
 *
 * 配信は別途設定（Resend など）。
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  let email: string;
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim();
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "メールアドレスの形式が正しくありません" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Supabase に upsert（テーブル未作成でも握る）
  try {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, subscribed_at: new Date().toISOString() }, { onConflict: "email" });
    if (error) {
      console.warn("[newsletter] DB write skipped:", error.message);
      console.warn("[newsletter] email:", email);
    }
  } catch (e: any) {
    console.warn("[newsletter] failed:", e?.message);
  }

  return NextResponse.json({ ok: true });
}
