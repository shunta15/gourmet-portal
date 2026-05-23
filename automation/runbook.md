# マチノワ記事自動生成 リモートエージェント Runbook

このドキュメントは **schedule skill によるリモートエージェント** が起動時に従う手順書。  
routine prompt の指示でリモートエージェントがこれを読みに行く前提。

## 全体フロー

```
1. 環境準備
   - sa.json を /automation/secrets/sa.json に書き出す（routine promptから渡された内容）
   - npm install（必要なら）

2. 候補抽出（軽量）
   - node scripts/sheets-candidates.mjs
   - 出力: feature/restaurant の未処理候補と件数

3. 候補がなければ通知だけして終了

4. 候補がある場合、上限 MAX=3 件まで処理:
   各候補で以下を実行:

   a. GBP確認
      - Maps URL を curl で取得し HTML パース
      - og:title, og:description, 住所、緯度経度を抽出
      - 不明な場合は「公式情報をご確認ください」と書く方針
      - 店舗名から場所推測は絶対禁止

   b. 画像取得
      - Google Maps の grass-cs/ プレフィックスから店舗写真 URL を抽出
      - =w1400-h800-p-k-no サイズで curl ダウンロード
      - public/restaurants/teleapo-{slug}/hero.jpg, point1.jpg, point2.jpg に保存
      - POINT 3,4,5 は画像なしで OK（CSS placeholder 表示）

   c. 記事生成
      - feature: lib/teleapo-features.ts に追記
      - restaurant: lib/teleapo-restaurants.ts に追記
      - スタイルは agent-teams/decisions/machinowa-feature-style.md に従う
      - 失礼表現禁止（「素朴」「派手さはない」など）

   d. ビルド検証
      - npm run build で型エラー・コンパイルエラーがないことを確認
      - エラーなら revert してスキップ、次の候補へ

   e. commit & push
      - git add lib/teleapo-features.ts public/restaurants/...
      - git commit -m "feat(teleapo): 特集記事を自動生成 – {店舗名}"
      - git push（GitHub MCP 経由 or PAT）

   f. スプシ書き戻し
      - node scripts/sheets-mark-done.mjs --type=feature --row={row} --url={url}
      - 詰めOKリスト の W/X 列（feature）または Y/Z 列（restaurant）に「済」と URL を書き込む

5. 完了通知
   - 処理件数とURLリストを stdout に出力（routine 経由でメール）
```

## 重要ルール（過去の事故から学習）

1. **GBPの住所が確認できない時は記事を作らない**（場所推測禁止）
2. **店舗名から場所を推測することは絶対禁止**
   - 過去の事故: 社交酒場イム→名古屋誤認、ルーラル→志免誤認 等
3. **画像は実店舗のもののみ**（Unsplash 等の汎用画像 NG）
4. **失礼な表現禁止**: 「素朴」「派手さはない」「奇をてらった〜ではない」等
5. **noindex のまま**: FEATURES 一覧に載せない、URLだけ存在

## ファイル参照

- スタイルガイド: `agent-teams/decisions/machinowa-feature-style.md`
- 自動化パイプライン仕様: `agent-teams/decisions/machinowa-auto-article.md`
- 既存特集記事サンプル:
  - `lib/teleapo-features.ts` の "teleapo-feat-久留米-和洋創作酒場-晩餐-bansun-" を参考
