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
 * - 新業種（/beauty /bodycare /pet /leisure /stay）とその配下
 * グルメ（/gourmet を含む既存の全ルート）は false。
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
  if (pathname === '/proto-hub' || pathname.startsWith('/proto-hub/')) return true; // 総合トップ「にぎわいの輪」の色を固定して見るルート（プレビュー・ローカル専用）
  if (pathname === '/proto-noren' || pathname.startsWith('/proto-noren/')) return true; // グルメの暖簾デザインの見本（店ページ・特集記事。プレビュー・ローカル専用）。グルメの共通ヘッダーは出さない
  return NEW_VERTICAL_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
