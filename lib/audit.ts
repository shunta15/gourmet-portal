/**
 * 監査ログ（admin 編集トレース）
 *
 * 0002 schema 適用後: audit_log テーブルに INSERT
 * 適用前: console.warn にフォールバック（破壊しない）
 */
import { createClient } from "@/lib/supabase/server";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "login"
  | "logout"
  | "import"
  | "export";

export async function audit(opts: {
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      actor_id: user?.id ?? null,
      actor_email: user?.email ?? null,
      action: opts.action,
      entity_type: opts.entityType ?? null,
      entity_id: opts.entityId ?? null,
      metadata: opts.metadata ?? null,
    };
    const { error } = await supabase.from("audit_log").insert(payload);
    if (error) {
      // 0002 未適用 or RLS 拒否などは握って console に出す
      console.warn("[audit] DB insert skipped:", error.message);
      console.warn("[audit] payload:", JSON.stringify(payload));
    }
  } catch (e: any) {
    console.warn("[audit] failed:", e?.message);
  }
}
