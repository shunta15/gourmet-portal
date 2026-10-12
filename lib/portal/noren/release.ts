/**
 * 公開の範囲スイッチ（軽い定数だけ。サーバー専用の import を足さない）。
 *
 * 【2026-10-12 方針】オーナー:「確定したところはどんどん公開していいよ。確定してないところは僕に指示を仰いでください」。
 * そこで、公開の範囲を 2 つに分けた。確定した部分は RELEASE_SEARCH（true）、まだ確定していない・作り替え中の部分は RELEASE_REST（false。今の本番と同じ見た目・同じ文言）。
 * 「全部出る見本」に戻すときは RELEASE_REST を true にする（このブランチ release/gourmet-search の元の見本 proto/search-cleanup は両方 true の状態）。
 *
 * - RELEASE_SEARCH（確定。true）: 次をまとめて束ねる。
 *   - 入口（/gourmet）の「店を、さがす。」の節（暖簾の色の版 OpenSearchBlock。検索の箱は /search へのリンク・日本全体の地図に地域のピン）と、見本用の URL の切り替え（?open ?tiles ?band ?box ?look）が
 *     本番では読まれない仕組み（looks.ts。VERCEL_ENV が production では URL を読まない）。章の前置き（七つの章）は、このスイッチに関係なく外してある
 *   - さがす専用ページ /search（白と橙の block。いつも見える検索の箱・タブ・条件の札・地図は手描き風でピン。rewrites.ts の NOREN_SEARCH_REWRITE）
 *   - 「いま営業中」の概念を出さない（OPEN_NOW_ON を false にする）
 *   - 地域・街・利用シーンのページを /search へ統合（rewrites.ts の NOREN_REGION_TO_SEARCH・NOREN_SCENE_TO_SEARCH と、サイト内リンクの付け替え areaLinks.ts・sceneLinks.ts）。
 *     さがすで利用シーンを選んだとき、そのシーンのまとめ記事を結果の上に見せる（このスイッチに関係なく、/search 側に入っている）
 *   - ヘッダー・フッターのメニュー（nav.ts の HEADER_NAV・FOOT_NAV）。統合した地域・シーンのページへの項目を持たない形
 *   （4 店の非表示 lib/hiddenStores.ts は、もともとスイッチなし。常に効く）
 * - RELEASE_FEATURE（確定。第 2 弾。true）: 特集まわり。
 *   - 1 店 1 ページ: 店 1 軒の特集記事のうち対象 50 本（onePage.ts の表）は、店のページ /restaurant/<店 ID> で「写真が主役の特集記事 + 記事の終わりの店舗情報」を 1 ページで出す
 *     （NOREN_FEATURE_PHOTO・NOREN_ONE_PAGE）。/feature/<記事 ID> は next.config.ts の redirects で /restaurant/<店 ID> へ 308。サイト内リンク（featureHrefOf）・sitemap もそれに合わせる
 *   - シーン別まとめ記事 24 本の新しい枠（NOREN_FEATURE_ROUNDUP_PHOTO）
 *   - 特集の一覧 /feature の 3 棚（特集記事・シーン別まとめ記事・街歩き・コース）と新しい見た目、棚の呼び方（featureKinds.ts）、街歩き・コースの記事のパンくず、入口の特集の節の見出し
 *   false のあいだは、これらはすべて止まり、今の本番（RELEASE_SEARCH までの版）と同じ見た目・同じ文言で出る（redirects の行も出ない）。
 * - RELEASE_REST（未確定。false）: false のあいだ、これらはすべて止まり、main と同じ見た目・同じ文言で出る。true にして再デプロイすると、止めていた部分が一度に出る。止めているもの:
 *   - 店ページ・特集記事ページの本物の布と提灯（realTop.ts の NOREN_REAL_INNER）
 *   - 店 1 軒の記事の新しい型（featureSingle.ts の NOREN_FEATURE_SINGLE）・利用シーン+店舗紹介の型（featureScene.ts の NOREN_FEATURE_SCENE）
 *   - 店ページ ⇔ 特集記事の切り替えの帯（PairSwitch。店ページ側は pair、記事側は NOREN_FEATURE_SINGLE が条件）
 *   - 店ページの評価まわり（「Google の評価」だけにした変更・DB の行に Google の評価を借りる変更）
 *   - 特集の一覧の 2 棚化と「特集記事」「まとめ記事」の言い方（記事ページの眉書き・パンくず・一覧の見出し）、特集の絞り込みのタグの表記ゆれの追加
 *   - 店ページの布の漢字の対応（shop.ts）、フッターの暖簾の並び・地域の言い方・「ショート動画」の行き先（nav.ts）
 *   - 号の名前（「2026年 春号」を日付から作る変更）、地域の数の表記（「16 地域」を数から作る変更）、店舗登録ページの文言、サイトマップの更新日
 *   - 地の色（灰墨）は入口だけ。入口以外のページの色は変えない（NorenFrame と ground.css。入口は :has(.vR-hero) で見分ける）
 * - NOREN_STRIP_OTHER_RATINGS: ほかのサイト・サービスの点数・星・評価の高さ・件数に触れた文／句を、表示するデータから取り除く処理（lib/otherSiteRatings.ts）を、
 *   データ層（lib/db/restaurants.ts・lib/db/features.ts）と暖簾の表示（店ページ・記事ページ）に掛けるか。他の 2 つとは別のスイッチ。2026-10-12 から本番でも true。
 */
export const RELEASE_SEARCH = true; // 確定した部分（さがす・統合・営業中なし・メニュー）。true: 出す
export const RELEASE_FEATURE = true; // 確定した部分（特集まわり: 1 店 1 ページ・シーン別まとめ記事の新しい枠・特集の一覧の 3 棚）。true: 出す
export const RELEASE_REST = false; // 未確定の部分。true: 見本が基準（全部出る）／false: 今の本番と同じ見た目・同じ文言
export const NOREN_STRIP_OTHER_RATINGS = true; // 2026-10-12 本番でも有効（オーナー指示「他サイトの評価を文章に入れるのやめて」「確定したところはどんどん公開」）
/**
 * 「いま営業中」の概念（営業中・まもなく閉店・営業時間外の表示、「いま営業中」「今開いている店だけ」の絞り込み、?open=1 / f=open、現在時刻を読むタイマー）を出すか。
 * 2026-10-12 オーナー決定「今営業中の概念無くしていい」: RELEASE_SEARCH が true のあいだは false＝どこにも出さない。RELEASE_SEARCH を false に戻せば今までどおり出る。
 * 営業時間の表記や「深夜まで」「昼に開いている」「日曜に開いている」など時刻で変わらない事実の札は、このスイッチに関係なく出る。
 */
export const OPEN_NOW_ON = !RELEASE_SEARCH;
