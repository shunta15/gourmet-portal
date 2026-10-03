# ショート動画の取り込み（TikTok）

TikTok に投稿した動画を、マチノワの「動画で探す」（`/videos`）に載せる手順です。
動画ファイル（`public/videos/nazatu/*.mp4`）は `lib/regions.ts` の `SHORT_VIDEOS` から自動で入ります（ここでの作業は不要）。

## 手順

1. TikTok アプリで動画を開き、「シェア」→「リンクをコピー」で URL を取る
   （`https://vm.tiktok.com/XXXX/` のような短縮 URL のままで構いません）
2. `automation/videos/input.csv` に 1 行ずつ足す（列は `url,storeId,memo`）

   ```csv
   url,storeId,memo
   https://vm.tiktok.com/ZSxxxxxxx/,r01,店の入口から撮った動画
   https://www.tiktok.com/@アカウント/video/7123456789012345678,r02|r03,2店まとめて紹介（店IDは | でつなぐ）
   ```

   - `storeId` は店ページの ID（`/restaurant/r01` なら `r01`）。複数の店が映る動画は `r01|r02`
   - `memo` は自分用のメモ（サイトには出ません）
   - 行頭が `#` の行は無視されます
3. 確認: `node automation/videos/ingest.mjs`（何も書かずに、何を取り込むかを表示するだけ）
4. 反映: `node automation/videos/ingest.mjs --apply`
   - `lib/videos/tiktok.json` に動画が追記され、サムネイルが `public/videos/thumbs/` に保存されます
5. サイトのビルド・確認のあと、コミットする（この試作ブランチでは push しない）

取り込み済みの動画は、同じ URL を残したまま再実行してもスキップされます（`input.csv` は消さなくて構いません）。

## 何をしているか

| 項目 | 取り方 |
|---|---|
| タイトル・投稿者・サムネイル | TikTok の oEmbed（`https://www.tiktok.com/oembed?url=…`。無料・キー不要） |
| 動画 ID・正規 URL | URL から。短縮 URL はリダイレクトを追って正規 URL にする |
| 投稿日（`uploadDate`） | 動画 ID の上位 32 ビット（`ID >> 32` が Unix 秒）から算出。2016 年〜現在の範囲外なら入れない |
| サムネイル | TikTok 側のものは期限切れになるので、`public/videos/thumbs/{動画ID}.jpg` に保存して使う |

- 投稿日が入った動画だけ、視聴ページに `VideoObject`（構造化データ）が出て index 対象になります。投稿日が分からない動画は noindex です。
- 再生数・いいね・コメント・保存の数字は取りません（いつの値か確かめられないため、サイトにも出しません）。
- 投稿日は動画 ID から計算した値です（TikTok が公表している値ではありません）。

## 止まるとき

- `storeId` が店データに無い、または URL が TikTok でない → 何も取り込まずに止まります（終了コード 2）。`input.csv` を直して再実行してください。
  - 店データはコード側（`lib/data.ts`・`lib/teleapo-restaurants.ts`・`lib/articleStores.ts`）と `lib/stations/storeStations.json` の店 ID と照合します。管理画面だけで足した店は、ここでは見つからないことがあります。
- oEmbed やサムネイルの取得に失敗した行 → その行だけ飛ばして続け、最後に失敗件数を出します（終了コード 1）。非公開・削除済みの動画、URL の間違いが主な原因です。

## 動作確認（ネットに出ない）

`node automation/videos/ingest.mjs --fixture`

`automation/videos/fixtures/` の見本（oEmbed 応答の形に合わせた架空のデータ）で、dry-run の出力を確認できます。
見本の内容はサイトには出ません。`--fixture` と `--apply` は一緒に使えません。

- `fixtures/input.csv` … 正規 URL（追跡パラメータ付き）・短縮 URL・重複行・投稿日の範囲外（過去／未来）の例
- `fixtures/input-bad-store.csv` … 存在しない店 ID でエラーになる例（`--input` で指定）
- `fixtures/oembed/{動画ID}.json` … oEmbed 応答の見本 / `fixtures/redirects.json` … 短縮 URL の飛び先の見本

## 注意

- **自分たちが投稿した動画の URL だけ**を入れてください。ネットに出ている他人の動画を取り込まないこと。
- 取り込み後にタイトル（キャプション）を直したいときは `lib/videos/tiktok.json` を直接編集して構いません（再実行では上書きされません）。
