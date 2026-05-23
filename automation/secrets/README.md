# automation/secrets/

このディレクトリは **マチノワ記事自動生成パイプライン** で使うシークレット置き場。

## 重要

- **このディレクトリの `*.json` `*.txt` は `.gitignore` 対象**（git には入らない）
- リモートエージェント（`schedule` skill）は routine prompt に埋め込まれた内容から起動時にここへ書き出す
- ローカル実行（scripts/）はここから直接読む

## ローカル設置

| ファイル | 用途 |
|---|---|
| `sa.json` | Google Sheets API（GCP `machinowa-automation` プロジェクトのサービスアカウント） |

## リモート（schedule skill）の動作

routine prompt の先頭で `automation/secrets/sa.json` を base64 → 復元 → 配置する手順を入れる。
git には入らないので、リポジトリが将来 public 化しても影響なし。

## 漏洩時の対応

GCP コンソールで service account のキーを revoke → 新規発行。  
routine prompt の埋め込み内容も新規キーで差し替え。
