/**
 * 総合サイトの「公開スイッチ」。サーバー専用（クライアントから import するとビルドが落ちる）。
 *
 * マージと公開を切り離すための仕組み。main に取り込んでも、スイッチが OFF のあいだは本番が今のグルメサイトのまま変わらない。
 *
 * - ON になる条件（どちらか）
 *   1. 環境変数 PORTAL_LAUNCHED が "1"（Vercel の Production に設定して再デプロイ）
 *   2. VERCEL_ENV が "preview"（Vercel のプレビューでは常に総合サイトが見える）
 * - OFF（本番の既定）のとき
 *   - `/` は従来のグルメのトップ（metadata・canonical・JSON-LD も従来と同じ）。`/gourmet` と総合サイトの全ルートは 404。
 * - ON のとき
 *   - `/` は総合トップ。仕組みは next.config.ts の rewrites（`/` → `/portal-home`）。`app/page.tsx`（グルメのトップ）は
 *     OFF のときの `/` そのもので、総合トップの CSS・JS が混ざらないよう、総合トップは別ルート（app/portal-home）に分けてある。
 *   - sitemap（総合サイト分）は 404、robots.txt・/sitemap.xml は従来と同一。
 *   - グルメの店ページに SNS・共有ボタン・計測を足さない。
 * - 評価はビルド時（静的ページ）またはリクエスト時（動的ページ）にサーバーで行う。値を変えたら再デプロイが要る。
 *   ローカルで総合サイトを見るには `PORTAL_LAUNCHED=1 npm run dev`（または build）。
 *
 * 手順は proto-portal/LAUNCH.md。
 */
import "server-only";
import { notFound } from "next/navigation";
import { portalLiveFromEnv } from "./launchEnv";

export function isPortalLive(): boolean {
  return portalLiveFromEnv();
}

/** ページ・レイアウト・メタデータ用ルートから呼ぶ。OFF なら 404（notFound() を投げる）。 */
export function assertPortalLive(): void {
  if (!isPortalLive()) notFound();
}

/**
 * プレビュー（Vercel の VERCEL_ENV=preview）またはローカル開発（NODE_ENV が production でない）か。
 * 色を固定して見るルート（app/proto-hub/layout.tsx）の判定。公開スイッチ ON の本番（VERCEL_ENV=production）は false。
 * ローカルの `next build` → `next start` は NODE_ENV=production なので false（`next dev` では true）。ビルド時（静的ページ）またはリクエスト時にサーバーで評価する。
 */
export function isPreviewOrLocal(): boolean {
  return process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV !== "production";
}

/** プレビュー・ローカル専用のルート（試作の見比べ）から呼ぶ。公開スイッチが OFF、または本番なら 404。 */
export function assertPreviewOrLocal(): void {
  if (!isPortalLive() || !isPreviewOrLocal()) notFound();
}

/**
 * generateStaticParams を包む。OFF のあいだは空にして、404 になるページを大量にビルドしない
 * （dynamicParams は true のままなので、該当 URL は実行時に 404 になる）。
 */
export function liveStaticParams<T>(fn: () => T[] | Promise<T[]>): () => Promise<T[]> {
  return async () => (isPortalLive() ? fn() : []);
}
