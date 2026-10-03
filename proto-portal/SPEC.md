# マチノワ総合サイト 外枠 仕様（試作・非公開）

2026-10-03 ユーザー指示: 「マチノワ」総合サイトの中にグルメ・美容・整体・ペット・レジャー・宿泊を同じ作りで。
公開はまだ。外枠だけ。SEO 対策済みの設計で。今のグルメサイトは何も変えない。トップの画像などは任せる。
整体は整骨院・鍼灸・マッサージ・リラクまで含める。名前は仮。

作業場所: worktree `/Users/shunta/claude/gp-portal`（ブランチ `proto/portal`、ローカル専用）。
**main・git push・vercel（--prod も通常 deploy も）は禁止。** 見せるときはメインループがプレビューを出す。

## 絶対ルール
1. 既存グルメのページ・URL・見た目を変えない（/restaurant, /feature, /region, /scene, /search, /about, /editorial, /contact, /sitemap.xml, /robots.txt ほか既存の全ルート）。
   例外は1つだけ: 現トップ `app/page.tsx` の中身を `/gourmet` に移す（見た目はそのまま）。`/` は総合トップにする（Phase 2）。
2. 架空の店・架空の数字・口コミ・星評価を出さない。新業種は掲載0件 →「掲載準備中」。件数は必ず実データから計算。サンプル店名も作らない。
3. 新業種のページは掲載3件未満なら noindex（robots index:false）でサイトマップにも出さない。判定は `lib/seo/gate.ts` の1か所。今は全部 noindex になる。
4. Supabase・スプレッドシートに書き込まない。`.env.local` を表示しない。npm install しない（外部ライブラリ追加禁止）。
5. クライアントコンポーネント（"use client"）から `@/lib/data` を import しない（データはサーバーの page.tsx から props）。
6. 既存の `app/sitemap.ts` の出力（/sitemap.xml の中身）を変えない。新業種のサイトマップは別ファイル（例 `app/beauty/sitemap.ts` → /beauty/sitemap.xml）。
7. ルート直下に動的セグメント（`app/[vertical]`）を作らない。業種ごとに静的フォルダ（app/beauty, app/bodycare, app/pet, app/leisure, app/stay）を置き、中身は共通部品を呼ぶ薄いファイルにする。

## 業種（名前は仮）
| key | URL | 名前 | ブランド表記 | 色（アクセント） |
|---|---|---|---|---|
| gourmet | /gourmet（店・記事は既存URLのまま） | グルメ | マチノワグルメ | 既存の朱 |
| beauty | /beauty | ビューティー | マチノワビューティー | ローズ |
| bodycare | /bodycare | ボディケア | マチノワボディケア | セージグリーン |
| pet | /pet | ペット | マチノワペット | アンバー |
| leisure | /leisure | おでかけ | マチノワおでかけ | スカイブルー |
| stay | /stay | ステイ | マチノワステイ | インディゴ |

### 種類（category。slug は英小文字とハイフン。予約語 area/shop/feature/scene/search/sitemap は使わない）
- beauty: hair 美容室・ヘアサロン / nail ネイル / eyelash まつげ・眉 / esthetic エステ / hair-removal 脱毛 / headspa ヘッドスパ
- bodycare: seitai 整体 / sekkotsu 整骨院・接骨院 / shinkyu 鍼灸院 / massage マッサージ / relaxation リラクゼーション / stretch ストレッチ
- pet: trimming トリミング / pet-hotel ペットホテル / vet 動物病院 / dog-cafe ドッグカフェ / dog-run ドッグラン / pet-shop ペットショップ
- leisure: sightseeing 観光スポット / experience 体験・アクティビティ / onsen 日帰り温泉・スパ / park テーマパーク・公園 / outdoor アウトドア / museum 美術館・博物館
- stay: hotel ホテル / ryokan 旅館 / pension 民宿・ペンション / glamping グランピング・キャンプ / guesthouse ゲストハウス
- gourmet: 既存の業態分類（lib/cuisineGroups.ts 等）をそのまま参照する。新しく作らない。

### schema.org の型（店ページの JSON-LD）
- gourmet: 既存の lib/jsonld.ts をそのまま使う（変えない）
- beauty: hair→HairSalon, nail→NailSalon, esthetic/eyelash/hair-removal→BeautySalon, headspa→DaySpa
- bodycare: すべて HealthAndBeautyBusiness（整骨院・鍼灸も医療系の型は使わない。効果効能を主張しないため）
- pet: vet→VeterinaryCare, pet-shop→PetStore, それ以外→LocalBusiness
- leisure: museum→Museum, park→AmusementPark（公園は Park）, それ以外→TouristAttraction
- stay: hotel→Hotel, guesthouse→Hostel, glamping→Campground, ryokan/pension→LodgingBusiness

### 店の項目（共通＋業種ごと）
共通 Place: id, vertical, category, name, nameKana?, pref(slug), city(slug)?, cityName?, address, lat?, lng?, station?, hours?, holidays?, phone?, url?, image?, images[], tags[], priceRange?, intro?, updatedAt?
業種ごと attributes（すべて任意。取れない値は入れない）:
- beauty: menus[{name, price?}], seats?, staffCount?, reservation?（予約制など）, payment?
- bodycare: menus[{name, minutes?, price?}], reservation?, walkIn?（予約なし可）, insurance?（保険の取り扱いの有無を「表記」として。効果は書かない）
- pet: animals[]（対応動物）, services[], sizeLimit?, pickup?（送迎）
- leisure: fee?, duration?, ageTarget?, indoor?, parking?
- stay: roomTypes[], checkIn?, checkOut?, onsen?, petsAllowed?, priceFrom?

### 利用シーン（タグ一致。事実の根拠があるものだけ付ける前提）
- beauty: 当日予約 / 夜遅くまで / 個室あり / メンズ歓迎 / 子連れ可 / 駅近
- bodycare: 夜遅くまで / 土日営業 / 予約なしOK / 女性スタッフ在籍 / 駅近
- pet: 大型犬OK / 猫OK / 送迎あり / 夜間対応
- leisure: 雨の日 / 子連れ / デート / 無料 / 駐車場あり
- stay: 温泉 / ペット同伴 / 一人旅 / 記念日 / 素泊まり
- gourmet: 既存 lib/scenes.ts のまま

## URL 設計
- `/` 総合トップ（Phase 2）
- `/gourmet` グルメのトップ（現トップを移設）。グルメの店・記事・地域は既存URLのまま。
- 新業種（v = beauty|bodycare|pet|leisure|stay）:
  - `/{v}` 業種トップ
  - `/{v}/area/{pref}`、`/{v}/area/{pref}/{city}` 地域
  - `/{v}/{category}`、`/{v}/{category}/{pref}`、`/{v}/{category}/{pref}/{city}` 種類×地域
  - `/{v}/shop/{id}` 店、`/{v}/feature/{id}` 特集、`/{v}/scene/{slug}` 利用シーン
- 業種横断の街: `/area/{pref}`、`/area/{pref}/{city}`（グルメ分は既存 /region/{key} へリンク）
- pref slug は都道府県のローマ字（hokkaido, aomori, …, tokyo, kanagawa, …, okinawa）。
  **グルメの既存 region key は都道府県と一致しないものがある**（例: 愛知＝`nagoya`）。対応表を lib/areas に持つ。
- city slug（ローマ字）は後で日本郵便の公開データから作る。外枠の段階では市区町村ページは生成しない（ルートだけ用意し、データが無ければ 404）。

## SEO
- タイトルの型: 業種トップ「{業種名}の店をエリア・種類から探す｜マチノワ{ブランド}」、地域「{地域}の{種類}{N}選｜マチノワ{ブランド}」（N は実件数。0件なら件数を出さない）
- canonical は常に自分自身の正規URL。末尾スラッシュなし。
- JSON-LD: 総合トップ=Organization+WebSite(SearchAction)、全ページ=BreadcrumbList、一覧=ItemList、店=上の型、特集=Article
- 薄いページ対策: gate（3件以上で index）。外枠の段階では新業種は全部 noindex。
- サイトマップ: 既存 /sitemap.xml は不変。新業種は /{v}/sitemap.xml（index 対象のURLだけ。今は空）。robots.txt に追記するのは公開時（今は触らない）。
- 業種横断の内部リンク: 街ページ「この街のグルメ・美容・宿」、特集で業種をまたぐ（記念日＝ディナー＋美容＋宿 など）。
- 表現の規制: 美容・ボディケア・動物病院は効果効能をうたわない（薬機法・あはき法・柔道整復師法・獣医療広告）。文言ルールを lib/verticals の各設定に `copyRules` として持つ。

## フェーズ
1. 土台（haiku）: lib/verticals, lib/areas, lib/places, lib/seo。画面は作らない。
2. 総合トップ・/gourmet 移設・新業種トップ・共通ヘッダー（sonnet: 動きのある画面は haiku で品質が出なかった実績）
3. ページの型（地域・種類×地域・店・特集・シーン・業種横断の街）
4. 検証（tsc・build・JSON-LD 検査・noindex/canonical/リンク切れ・既存グルメの出力が不変であること）→ プレビュー

## ショート動画（2026-10-04 試作）
動画は今後どんどん増える前提。(a) TikTok に投稿した動画のリンク、(b) サイトに置いた動画ファイル（`public/videos/nazatu/*.mp4`、`lib/regions.ts` の SHORT_VIDEOS）の2種類。
- **データ** `lib/videos/`: 型 `Video`（types.ts）、動画ファイルのアダプタ（file.ts。SHORT_VIDEOS 自体は変えない。likes/comments/saves と "0:30" の長さは引き継がない。長さは ffprobe の実測値）、TikTok の取り込み済み置き場 `tiktok.json`（今は空）、取得関数（index.ts: getAllVideos / getVideo / getVideosByStore / getVideosByStation / getVideosByPref）、店情報（stores.ts: 名前・所在県・最寄りの駅ページ）。**再生数・いいね等の数字は使わない・表示しない。**
- **取り込み** `automation/videos/`: input.csv（url, storeId, memo）→ `node automation/videos/ingest.mjs`（dry-run）→ `--apply`。TikTok の oEmbed でタイトル・投稿者・サムネイル、動画 ID から uploadDate（ID >> 32 が Unix 秒。2016〜現在の範囲外なら入れない）、サムネイルは `public/videos/thumbs/` に保存。storeId が店データに無ければエラー。`--fixture` は見本の oEmbed 応答での動作確認（--apply 不可）。手順は README.md。
- **画面**: `/videos`（動画で探す。スマホは縦スワイプの scroll-snap、PC はグリッド。`?v=業種&pref=県` で絞り込み。サーバーで描画）、`/videos/{id}`（視聴ページ）、`/videos/sitemap.xml`。ファサード（サムネイル＋再生ボタン）→ タップで TikTok は `https://www.tiktok.com/player/v1/{id}` の iframe、動画ファイルは `<video controls playsInline preload="none">`。入口: 総合トップ（動画がある時だけ）・駅ページ「この駅の周辺の動画」・`/area/{pref}` の県の動画（どちらも 0 本なら出さない）。グルメの既存ページには何も足さない。
- **SEO**: index 判定は「VideoObject を出せる＝uploadDate がある視聴ページだけ index、他は noindex」（`isVideoIndexable`）。VideoObject（name, description, thumbnailUrl, uploadDate, embedUrl または contentUrl, 長さが分かれば duration）は uploadDate がある動画だけ。全視聴ページに BreadcrumbList。一覧 `/videos` は index 対象の動画が 3 本以上あるときだけ index（絞り込み表示は常に noindex・canonical は /videos）。sitemap は index 対象の視聴ページだけ（sitemap の `videos` 項目付き。今は空）。今は uploadDate が分かる動画が無いので、全ページ noindex・sitemap は空。robots.txt への追記は公開時。

## 地図・今開いている店（2026-10-04 試作）
- **地図で探す `/map`**: 全業種の店をピンで表示（色＝`lib/verticals` の accent。いまは実データのあるグルメだけ）。業種チップで絞り込み、ピンのポップアップに店名・業態・最寄り駅（店の案内に最寄り駅として書かれている駅）・営業中の表示・店ページへのリンク。初期表示は日本全体。`?station={pref}/{name}` はその駅の位置、`?pref={pref}` はその県に合わせ、一覧もその範囲の店。**常に noindex（canonical は /map）**。地図の下に店の一覧（テキストのリンク）を初期 HTML から出す（JS なしでも中身がある）。
- **座標**: `lib/places` の Place に lat/lng があればそれ、無ければ `lib/geo.ts` の GEO（店ID→緯度経度）。座標の無い店は地図に出さず、画面に「位置が取れていない N店」と実数で出す。座標は推測・生成しない。
- **データの渡し方**: `lib/portal/mapData.ts`（サーバー専用）が、id・name・lat・lng・vertical・category・stationName・href・pref だけに絞って、クライアントの地図（`components/portal/PortalMap.tsx` / `MapExplorer.tsx`）へ props で渡す。`@/lib/data` はクライアントに入れない（postbuild の check-client-bundle で検査）。
- **地図の実装**: 素の Leaflet＋国土地理院の淡色タイル。追加ライブラリなし。ズーム13以下では近い店を件数つきの丸にまとめる（格子まとめ。丸を押すと拡大）。map は 1 回だけ作り、店の集合が変わるたびに作り直さない（既存 LeafletMap で過去に起きた「地図が初期化されない」不具合の再発防止。注意点は PortalMap.tsx の冒頭に書いてある）。
- **小さな地図**: 駅ページ（店のピン＋駅の位置）と `/area/{pref}`（その県の店のピン）。「地図で見る」→ `/map?station=…` / `/map?pref=…`。
- **今開いている店 `lib/portal/openNow.ts`（純関数）**: 営業時間・定休日の文字列 → 週の営業予定（Week）→ 現在時刻（日本時間）で 営業中 / まもなく閉店（60分以内）/ 営業時間外 / 不明。曜日・日またぎ（翌2:00 等）・定休日・第N◯曜に対応。**読めないものは推測せず「不明」**（parseOpeningHours の取り違え 毎日/平日/祝日の「日」・日曜をまたぐ範囲・括弧や※の中の曜日・曜日なし区切りの混在 を点検してから渡す。不定休は、営業時間内なら営業中と言い切らず不明）。祝日・臨時休業は反映できない。単体テストは `node proto-portal/test-openNow.mjs`。
- **表示**: 判定はクライアントで現在時刻を見て行う（サーバーで判定するとキャッシュで古くなる・ハイドレーションがずれる）。サーバーは営業予定の表（重複排除）だけ渡し、バッジは判定前は空。店カードのバッジ（駅ページ・地図の一覧・種類×地域の一覧）、一覧の上の「今開いている店だけ」切替（URL `?open=1` で共有。静的ページのまま `location.search` を読む）、ポップアップは開くたびに判定し直す。文言は「営業中（店の案内の営業時間による）」、小さく「臨時休業・祝日は店にご確認ください」。
