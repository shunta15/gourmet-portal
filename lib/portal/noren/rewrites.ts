/**
 * 暖簾の店ページ・特集記事ページを、本物の URL（/restaurant/<id>・/feature/<id>）で出すための切り替え。
 * 公開スイッチ ON のときだけ効く（OFF では next.config.ts が使わない＝今のグルメのまま）。
 * 軽い定数だけ（next.config.ts と、クライアントの components/portal/isPortalPath.ts の両方が読む。サーバー専用の import を足さない）。
 *
 * - 仕組み: next.config.ts の rewrites（beforeFiles）で /restaurant/:id → /gourmet/restaurant/:id、/feature/:id → /gourmet/feature/:id に差し替える
 *   （ブラウザの URL は /restaurant/<id>・/feature/<id> のまま）。内部のパス /gourmet/** は直接開くと本物の URL へ恒久リダイレクト（canonical も本物の URL）。
 * - 枠: /gourmet の暖簾の枠（app/gourmet/layout.tsx）。isPortalPath が本物の URL と内部のパスの両方を総合サイト扱いにして、グルメの共通の枠（SiteShell）を出さない。
 */

import { RELEASE_REST } from "./release";

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
 * 特集記事のトップ（/feature・地域別 /feature/region/<key>・特集を探す /feature/search）を暖簾にする。
 * 内部のパスは app/gourmet/feature/page.tsx・app/gourmet/feature/region/[key]/page.tsx・app/gourmet/feature/search/page.tsx。
 * true のあいだ、公開スイッチ ON では /feature → /gourmet/feature、/feature/region/:key → /gourmet/feature/region/:key、/feature/search → /gourmet/feature/search に差し替わり
 * （ブラウザの URL・canonical は本物の URL のまま）、内部のパスを直接開くと本物の URL へ恒久リダイレクトされる。
 * 元に戻すなら false（/feature・/feature/region/<key>・/feature/search は今のグルメのページ、内部のパスは 404）。公開スイッチ OFF ではこの定数に関係なく今のグルメのまま。
 */
export const NOREN_FEATURE_INDEX_REWRITE = true;

// ── scene ここから（シーンのページ・店をさがす。統括が合流するときはこの 1 かたまりをそのまま取り込む）
/**
 * シーンのページ（/scene/<slug> の 12 種類と、一覧 /scene）を暖簾にする。内部のパスは app/gourmet/scene/[slug]/page.tsx・app/gourmet/scene/page.tsx。
 * true のあいだ、公開スイッチ ON では /scene/:slug → /gourmet/scene/:slug、/scene → /gourmet/scene に差し替わり（ブラウザの URL・canonical は本物のまま）、
 * 内部のパスを直接開くと本物の URL へ恒久リダイレクトされる。公開スイッチ ON の判定は他の暖簾と同じ（OFF ではこの定数に関係なく今のグルメのまま）。
 * 元に戻すなら false（/scene・/scene/<slug> は今のグルメのページ、内部のパスは 404）。
 */
export const NOREN_SCENE_REWRITE = RELEASE_REST;

/**
 * 店をさがす（/search。noindex。?q= ?region= ?cuisine= ?tag= ?budget= ?f= の絞り込みも同じページ）を暖簾にする。内部のパスは app/gourmet/search/page.tsx。
 * true のあいだ、公開スイッチ ON では /search → /gourmet/search に差し替わり（ブラウザの URL・canonical は /search のまま）、内部のパスを直接開くと /search へ恒久リダイレクトされる。
 * 元に戻すなら false（/search は今のグルメのページ、内部のパスは 404）。シーンのスイッチ（NOREN_SCENE_REWRITE）とは別々に戻せる。
 */
export const NOREN_SEARCH_REWRITE = RELEASE_REST;
// ── scene ここまで
// ── area ここから
/**
 * 【2026-10-12 オーナー決定「地域と街のページは『さがす』のページへ統合」】エリアのページ（/region・/region/<key>・/region/<key>/<街>）は、暖簾版（下の NOREN_REGION_REWRITE）を出さず、
 * RELEASE_REST が true のあいだは /search へ恒久転送する（NOREN_REGION_TO_SEARCH。仕組みは next.config.ts の redirects）:
 *   /region → /search、/region/<key> → /search?region=<key>、/region/<key>/<街> → /search?region=<key>&town=<街>（街は lib/towns.ts の取り出し方・完全一致）。
 * サイト内のリンクは転送を踏まないよう、リンクを作る所（lib/portal/noren/areaLinks.ts）からはじめから /search の URL にしてある。
 * RELEASE_REST が false のときは転送せず、今の本番のページ（app/region/**）が出る。
 */
export const NOREN_REGION_TO_SEARCH = RELEASE_REST;

/**
 * エリアのページ（エリア一覧 /region・エリアごと /region/<key>・街ごと /region/<key>/<街>）を暖簾にする（担当名: area）。
 * 【2026-10-12 から false 固定】上の NOREN_REGION_TO_SEARCH のとおり「さがす」へ統合したので、暖簾版（app/gourmet/region/**）は出さない。
 * 暖簾版を復活させるなら、この定数を RELEASE_REST に戻し、NOREN_REGION_TO_SEARCH を false にする（両方 true にすると転送が先に効く）。
 * 内部のパスは app/gourmet/region/page.tsx・app/gourmet/region/[key]/page.tsx・app/gourmet/region/[key]/[town]/page.tsx。
 * true のあいだ、公開スイッチ ON では /region → /gourmet/region、/region/:key → /gourmet/region/:key、/region/:key/:town → /gourmet/region/:key/:town に差し替わり
 * （ブラウザの URL・canonical は本物の URL のまま）、内部のパスを直接開くと本物の URL へ恒久リダイレクトされる。
 * 元に戻すなら false（/region・/region/<key>・/region/<key>/<街> は今のグルメのページ、内部のパスは 404）。公開スイッチ OFF ではこの定数に関係なく今のグルメのまま。
 */
export const NOREN_REGION_REWRITE = false;
// ── area ここまで

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
