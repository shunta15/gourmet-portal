/**
 * 総合サイトの公開スイッチの判定（環境変数だけを見る純関数）。
 * next.config.ts は server-only の import ができない（Node がそのまま読む）ので、判定の本体はここに置いて、
 * lib/portal/launch.ts（サーバー専用）と next.config.ts の両方から使う。判定を1か所に保つため。
 */
export function portalLiveFromEnv(env: Record<string, string | undefined> = process.env): boolean {
  return env.PORTAL_LAUNCHED === "1" || env.VERCEL_ENV === "preview";
}
