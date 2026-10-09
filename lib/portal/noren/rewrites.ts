/**
 * 暖簾の店ページ・特集記事ページを、本物の URL（/restaurant/<id>・/feature/<id>）で出すための切り替え。
 * 公開スイッチ ON のときだけ効く（OFF では next.config.ts が使わない＝今のグルメのまま）。
 * 軽い定数だけ（next.config.ts と、クライアントの components/portal/isPortalPath.ts の両方が読む。サーバー専用の import を足さない）。
 *
 * - 仕組み: next.config.ts の rewrites（beforeFiles）で /restaurant/:id → /gourmet/restaurant/:id、/feature/:id → /gourmet/feature/:id に差し替える
 *   （ブラウザの URL は /restaurant/<id>・/feature/<id> のまま）。内部のパス /gourmet/** は直接開くと本物の URL へ恒久リダイレクト（canonical も本物の URL）。
 * - 枠: /gourmet の暖簾の枠（app/gourmet/layout.tsx）。isPortalPath が本物の URL と内部のパスの両方を総合サイト扱いにして、グルメの共通の枠（SiteShell）を出さない。
 */

/** 店ページ（/restaurant/<id>）を暖簾にする。app/gourmet/restaurant/[id] */
export const NOREN_SHOP_REWRITE = true;

/**
 * 特集記事ページ（/feature/<id>）を暖簾にする。app/gourmet/feature/[id] は合流済みで、書き換え・復号（decodeRewrittenId）・検査は true で通っている。
 * 公開②（2026-10-09）は false で出した（特集 536 本のうち 359 本が写真の無いスポットで「店名だけの暗い布」になるため）。
 * 公開③（2026-10-09）で true: 写真の無いポイントに Google マップのその店の写真を当てた（lib/featureSpotPhotos.ts）ので。
 * true のあいだ、/gourmet/feature/<id>（内部のパス）は /feature/<id> へ恒久リダイレクトされ、/feature/<id> が暖簾の特集ページで出る。
 * 元に戻すなら false（/feature/<id> は今のグルメの特集ページ、/gourmet/feature/<id> は 404）。
 */
export const NOREN_FEATURE_REWRITE = true;

/**
 * 書き換え（rewrites）を通ってきた動的ルートの `params.id` を、元の ID に戻す。
 * 実測（2026-10-09、next dev）: `/feature/<日本語の ID>` を `/gourmet/feature/:id` に書き換えると、`params.id` が百分率エンコードのまま
 * （`%E3%81%82…`）で届く（直接開いたときは復号済みで届く）。ID に `%XX` が入っていれば 1 回復号する（本物の ID に `%` は含まれない）。
 * 日本語の ID を持つ特集記事の内部ルート（app/gourmet/feature/[id]）は、`params.id` をこれに通してから使う。店の ID（r01…）は ASCII なので何も変わらない。
 */
export function decodeRewrittenId(id: string): string {
  if (!/%[0-9A-Fa-f]{2}/.test(id)) return id;
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}
