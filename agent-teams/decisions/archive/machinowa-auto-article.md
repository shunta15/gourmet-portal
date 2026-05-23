# マチノワ 自動記事生成パイプライン 決定事項

最終更新: 2026-05-22

## スプレッドシート
- ID: `1d4A0-2kbVBACSsC2F-7KiUJTlu1k6ryn3sRvXlYq3R4`
- 名前: マチノワ自動記事制作
- 読み取りシート: `詰めOKリスト`（IMPORTRANGE + QUERY で生データから抽出）
- URL: https://docs.google.com/spreadsheets/d/1d4A0-2kbVBACSsC2F-7KiUJTlu1k6ryn3sRvXlYq3R4/edit

## 列定義（`詰めOKリスト` シート）
| 列 | 番号 | 用途 |
|---|---|---|
| D | 4 | 店舗名 |
| J | 10 | Google Maps URL |
| P | 16 | 詰めステータス |
| U | 21 | ステータス |

## 記事生成条件（2026-05-22 ユーザー確認済み・固定）
| 記事種別 | 条件 | 出力先ファイル |
|---|---|---|
| **特集記事**（feature） | P列「詰めOK」かつ未生成 | `lib/teleapo-features.ts` |
| **店舗紹介**（restaurant） | U列「商談完了」かつ未生成 | `lib/teleapo-restaurants.ts` |

**この条件以外には何もチェックしない。**（業種フィルタ・必須項目チェック等は不要）

## URL ポリシー（2026-05-22 ユーザー確認済み）
- **公開（publish/promote）はしない**: FEATURES 一覧・サイトマップ・検索結果に出さない
- **noindex 必須**: `<meta name="robots" content="noindex, follow">`
- **URL は存在する**: `/feature/{id}` で直接アクセス可能（レビュー用）
- 「公開するな」= 「promote しない」の意。URL自体は無効化しない。

## URL のスプレッドシート書き戻し（実装予定）
- 生成された記事URLを、対応する店舗の行に書き戻す
- 書き戻し先列: **未確定**（V列以降の空き列 or 別シート）
- ※ `詰めOKリスト` は QUERY 駆動のため、QUERY 範囲外の列に書く必要あり

## 実行スケジュール
- GAS トリガー: 毎日 **10:00 / 15:00 / 20:00 (JST)**（2026-05-22 ユーザー合意）
- 詰めOK→URL記載までの最大遅延: 約5時間（夜20:00以降は翌朝10:00まで）
- Project ID: `1OxqhY0BDZ-...` （詳細は GAS プロジェクトを参照）

## 関連ファイル
- GAS: `agent-teams/gas/machinowa-monitor.gs`
- API: `app/api/machinowa/generate/route.ts`
- 出力: `lib/teleapo-features.ts` / `lib/teleapo-restaurants.ts`
- 通知先: `linkateinc315@link8.info`

## やってはいけないこと
- ❌ 自動生成記事を FEATURES（公開一覧）に追加する
- ❌ noindex を外す
- ❌ 条件チェックに余計なフィルタを追加する
- ❌ ユーザー確認なしに本番デプロイ後の挙動を「OK」と判断する（公開状態の最終確認はユーザー）
- ❌ **デバッグ用の `TEMP_TARGETS` / `setupAllHack` などの一時フィルタをコミット／保存したまま帰らない**（無音失敗の元凶）

## 2026-05-22 21:11 障害と再発防止策

### 障害
- 20:00 cron 実行（20:03:04）が 2.861秒 で完了 → 「新規処理対象なし」をログに出して終了
- 実際には W列空 の 詰めOK が2件（row 144, 145）存在
- 原因: GASコードにデバッグ用の `TEMP_TARGETS`（4店舗だけ処理する一時フィルタ）が残ったまま 20:00 を迎えた。4店舗は既に W=済 なので何もすることがなくスキップされた。
- 21:11 にフィルタ削除して保存。

### 再発防止策（実装済み）
`agent-teams/gas/machinowa-monitor.gs` の `checkAndGenerate()` に以下を追加：

1. **stats カウンタ** で各種件数を追跡
   - `totalRows` / `featOkRows` / `featDoneRows` / `featPendingRows`
   - `restOkRows` / `restDoneRows` / `restPendingRows`
   - `featProcessed` / `restProcessed` / `featError` / `restError`
   - `pendingStores`: 未処理候補の店舗名リスト

2. **無音失敗の自動検知**
   - `expectedWork = featPending + restPending`
   - `actualWork   = processed + error の合計`
   - `expectedWork > 0 && actualWork === 0` のとき `stats.silentFailure = true`

3. **常に通知メールを送る**（処理0件でもサマリーを送信）
   - 件名に `🚨 無音失敗` プレフィックスが付くので即発見できる
   - 本文に `取得行数 / 全/済/未/処理/エラー` の数字、未処理店舗リスト、致命エラーを記載

4. **Sheets API 致命エラーも通知する**
   - 以前は Logger.log のみで通知メールが飛ばなかった
   - 今は `fatalError` を stats に積んで `_sendNotification` を呼ぶ

### 監視運用
- 10:00 / 15:00 / 20:00 のたびに `linkateinc315@link8.info` にメール 1通
- 件名で 0件処理 / 異常 / 正常 を判別可
- 「件数 0 / 未 0」なら問題なし、「未 ≧ 1」なら処理されてない
