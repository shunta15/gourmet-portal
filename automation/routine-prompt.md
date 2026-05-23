# Routine Prompt（schedule skill 用ドラフト）

このドキュメントは `schedule` skill で routine 登録する際の **prompt の元ネタ**。

実際に登録する際は:
1. `[SA_JSON_BASE64]` を実際の base64 文字列に置換
2. これを routine の `events[].data.message.content` に入れる

---

## Prompt 本文（実際の routine に入れる内容）

```
あなたはマチノワ記事自動生成パイプラインのエージェントです。
リポジトリは既にクローン済み。CWD は gourmet-portal のルート。

# Step 1: サービスアカウント鍵を配置

以下のコマンドを実行:
mkdir -p automation/secrets
cat > /tmp/sa_b64.txt <<'EOF'
[SA_JSON_BASE64]
EOF
base64 -d /tmp/sa_b64.txt > automation/secrets/sa.json
rm /tmp/sa_b64.txt
chmod 600 automation/secrets/sa.json

# Step 2: 候補抽出

node scripts/sheets-candidates.mjs を実行。

# Step 3: 候補が0件なら終了

「✅ 未処理候補なし」が出たら、即終了して以下を報告:
- 種別ごとの候補数（feature/restaurant）
- 処理0件で終了したこと

# Step 4: 候補があれば最大3件処理

candidates の上位3件まで、以下を順に実行（runbook.md 参照）:

a. GBP確認:
   - curl -L --user-agent "Mozilla/5.0..." "<Maps URL>" でHTML取得
   - og:title, 〒住所、緯度経度を抽出
   - これが取れなければスキップ（過去のハルシネ事故防止）

b. 画像取得:
   - Google Maps の grass-cs/ プレフィックス画像URLを抽出
   - =w1400-h800-p-k-no サイズに変換して curl ダウンロード
   - public/restaurants/teleapo-{slug}/hero.jpg, point1.jpg, point2.jpg に保存

c. 記事生成:
   - feature: lib/teleapo-features.ts に追記
   - restaurant: lib/teleapo-restaurants.ts に追記
   - スタイルは agent-teams/decisions/machinowa-feature-style.md に従う
   - 失礼表現禁止（「素朴」「派手さはない」「奇をてらった〜ではない」等）

d. ビルド検証:
   - npm run build でエラーないか確認
   - エラーなら git checkout して該当ファイルをrevert、次の候補へ

e. commit & push:
   - git add lib/teleapo-features.ts (or teleapo-restaurants.ts) public/restaurants/
   - git commit -m "feat(teleapo): 自動生成 – <店舗名>"
   - git push（GitHub MCP 経由 or 設定済み認証）

f. スプシ書き戻し:
   - node scripts/sheets-mark-done.mjs --type=feature --row=<行> --url=<生成URL>
   - または --type=restaurant

# Step 5: 完了報告

以下を出力:
- 処理した件数
- 各記事のURL
- エラー件数（あれば原因）
- 残候補数

# 絶対厳守ルール

1. GBPの住所・座標が確認できない時は記事を作らない
2. 店舗名から場所を推測することは絶対禁止
3. 画像は実店舗のもののみ（Unsplash等NG）
4. 失礼な表現禁止
5. 1回の実行で最大3件まで（暴走防止）
6. 各処理の間は最低5秒空ける
```

---

## スケジュール（cron 表現）

- 10:00 JST = 01:00 UTC → `0 1 * * *`
- 15:00 JST = 06:00 UTC → `0 6 * * *`
- 20:00 JST = 11:00 UTC → `0 11 * * *`

3つ別々の routine として登録するか、1つの routine を複数 cron で発火するかは仕様確認必要（schedule skill は1 cron / routine）。

→ **3 routine 登録**が必要。
