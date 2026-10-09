import { NOREN_FEATURE_INDEX_REWRITE, NOREN_FEATURE_REWRITE, NOREN_SHOP_REWRITE } from "@/lib/portal/noren/rewrites";

/**
 * 総合サイト用のヘッダー・フッターを出すパスかどうか。
 * - /（総合トップ）と /portal-home（総合トップの実体ルート。公開スイッチ ON のとき `/` は next.config.ts の rewrites でここに来る。
 *   プリレンダー済みの HTML は /portal-home のパスで作られるので、サーバー側の判定にも含める）
 * - /area/**（業種横断の街）
 * - /station/**（駅から探す。業種横断）
 * - /videos/**（動画で探す。業種横断）
 * - /map（地図で探す。業種横断）
 * - /find（サイト内検索の結果。業種横断）
 * - /list（候補リスト。店を保存して、URL で共有する。業種横断）
 * - /photos（写真から探す。業種横断）
 * - /omakase（おまかせ提案。4つの質問で店を出す）
 * - /gourmet と /gourmet/**（グルメのトップと、その配下の内部ルート。公開スイッチ ON のとき暖簾のデザイン。枠は app/gourmet/layout.tsx）
 * - /restaurant/<id>（NOREN_SHOP_REWRITE）・/feature/<id>（NOREN_FEATURE_REWRITE。/feature/search は除く）: 公開スイッチ ON のとき next.config.ts の rewrites で
 *   /gourmet/restaurant/<id>・/gourmet/feature/<id> に差し替わる。ブラウザ（クライアント）のパスは /restaurant/<id> のまま、プリレンダー済みの HTML は内部のパスで作られるので、両方を含める。
 *   暖簾の枠だけを出し、グルメの共通の枠（SiteShell）は出さない。
 * - /feature（一覧）・/feature/search・/feature/region/<key>（NOREN_FEATURE_INDEX_REWRITE）: 同じ仕組みで /gourmet/feature・/gourmet/feature/search・/gourmet/feature/region/<key> に差し替わる。
 * - 新業種（/beauty /bodycare /pet /leisure /stay）とその配下
 * グルメの既存のそれ以外のルート（/region・/scene・/search など）は false（従来の SiteShell）。
 */
const NEW_VERTICAL_PATHS = ['/beauty', '/bodycare', '/pet', '/leisure', '/stay'];

export function isPortalPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (pathname === '/' || pathname === '/portal-home') return true;
  if (pathname === '/area' || pathname.startsWith('/area/')) return true;
  if (pathname === '/station' || pathname.startsWith('/station/')) return true;
  if (pathname === '/videos' || pathname.startsWith('/videos/')) return true;
  if (pathname === '/map') return true;
  if (pathname === '/find') return true;
  if (pathname === '/list') return true;
  if (pathname === '/photos') return true;
  if (pathname === '/omakase') return true;
  if (pathname === '/gourmet' || pathname.startsWith('/gourmet/')) return true; // グルメのトップと内部ルート（ON のとき暖簾の枠。グルメの共通ヘッダー（SiteShell）は出さない）
  if (NOREN_SHOP_REWRITE && pathname.startsWith('/restaurant/')) return true; // 暖簾の店ページ（本物の URL）
  if (NOREN_FEATURE_REWRITE && /^\/feature\/[^/]+$/.test(pathname) && pathname !== '/feature/search') return true; // 暖簾の特集記事ページ（本物の URL）
  if (NOREN_FEATURE_INDEX_REWRITE && (pathname === '/feature' || pathname === '/feature/search' || /^\/feature\/region\/[^/]+$/.test(pathname))) return true; // 暖簾の特集記事のトップ（一覧・特集を探す・地域別。本物の URL）
  if (pathname === '/proto-hub' || pathname.startsWith('/proto-hub/')) return true; // 総合トップ「にぎわいの輪」の色を固定して見るルート（プレビュー・ローカル専用）
  if (pathname === '/proto-noren' || pathname.startsWith('/proto-noren/')) return true; // グルメの暖簾デザインの見本（店ページ・特集記事。プレビュー・ローカル専用）。グルメの共通ヘッダーは出さない
  return NEW_VERTICAL_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
