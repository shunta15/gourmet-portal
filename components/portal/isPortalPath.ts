import { NOREN_FEATURE_INDEX_REWRITE, NOREN_FEATURE_REWRITE, NOREN_SHOP_REWRITE } from "@/lib/portal/noren/rewrites";
import { NOREN_SEARCH_REWRITE } from "@/lib/portal/noren/rewrites";

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
 * - /restaurant（店舗紹介の一覧。2026-10-24 新設。NOREN_SHOP_REWRITE）・/feature（特集の一覧。NOREN_FEATURE_INDEX_REWRITE）: 同じ仕組みで /gourmet/restaurant・/gourmet/feature に差し替わる。
 *   （旧 /feature/search・/feature/region/<key> は、next.config.ts の redirects で /feature へ 308 するので、ここには持たない）
 * - 新業種（/beauty /bodycare /pet /stay /activity /sports /life）とその配下
 * グルメの既存のそれ以外のルート（/region・/scene・/search など）は false（従来の SiteShell）。
 */
const NEW_VERTICAL_PATHS = ['/proto-sports', '/beauty', '/bodycare', '/pet', '/stay', '/activity', '/sports', '/life'];

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
  if (NOREN_SHOP_REWRITE && (pathname === '/restaurant' || pathname.startsWith('/restaurant/'))) return true; // 暖簾の店舗紹介の一覧（/restaurant）と店ページ（本物の URL）
  if (NOREN_FEATURE_REWRITE && /^\/feature\/[^/]+$/.test(pathname) && pathname !== '/feature/search') return true; // 暖簾の特集記事ページ（本物の URL）
  if (NOREN_FEATURE_INDEX_REWRITE && pathname === '/feature') return true; // 暖簾の特集のトップ（一覧。本物の URL）
  if (NOREN_SEARCH_REWRITE && pathname === '/search') return true; // 暖簾の店をさがす（本物の URL）
  return NEW_VERTICAL_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
