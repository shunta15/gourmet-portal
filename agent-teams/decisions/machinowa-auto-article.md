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
