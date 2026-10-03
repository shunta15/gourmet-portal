/**
 * 総合サイト用のヘッダー・フッターを出すパスかどうか。
 * - /（総合トップ）
 * - /area/**（業種横断の街）
 * - /station/**（駅から探す。業種横断）
 * - /videos/**（動画で探す。業種横断）
 * - 新業種（/beauty /bodycare /pet /leisure /stay）とその配下
 * グルメ（/gourmet を含む既存の全ルート）は false。
 */
const NEW_VERTICAL_PATHS = ['/beauty', '/bodycare', '/pet', '/leisure', '/stay'];

export function isPortalPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (pathname === '/') return true;
  if (pathname === '/area' || pathname.startsWith('/area/')) return true;
  if (pathname === '/station' || pathname.startsWith('/station/')) return true;
  if (pathname === '/videos' || pathname.startsWith('/videos/')) return true;
  return NEW_VERTICAL_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
