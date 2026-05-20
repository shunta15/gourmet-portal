/**
 * 0002 拡張スキーマが適用されているか検出
 * - restaurants.status カラムの存在チェック
 * - 失敗したら未適用扱い
 *
 * キャッシュ: 5 分（無駄なクエリを減らす）
 */
import { createClient } from "@supabase/supabase-js";

let cache: { applied: boolean; checkedAt: number } | null = null;
const TTL_MS = 5 * 60 * 1000;

export async function isExtSchemaApplied(): Promise<boolean> {
  const now = Date.now();
  if (cache && now - cache.checkedAt < TTL_MS) return cache.applied;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  try {
    const { error } = await supabase
      .from("restaurants")
      .select("status, publish_at")
      .limit(1);
    const applied = !error;
    cache = { applied, checkedAt: now };
    return applied;
  } catch {
    cache = { applied: false, checkedAt: now };
    return false;
  }
}
