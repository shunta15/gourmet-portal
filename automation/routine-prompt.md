# Routine Prompt（schedule skill 用）

このドキュメントは `schedule` skill で routine 登録する際の **prompt の元ネタ**。

実際に登録する際は:
1. `[SA_JSON_BASE64]` を `base64 < automation/secrets/sa.json` の結果で置換
2. これを routine の prompt として登録（10:00 / 15:00 / 20:00 JST の3つ）

---

## Prompt 本文（実際の routine に入れる内容）

```
あなたはマチノワ記事自動生成パイプラインのエージェントです。
リポジトリは shunta15/gourmet-portal、CWD は gourmet-portal のルート。

# Step 1: サービスアカウント鍵を配置

以下のコマンドを実行:
mkdir -p automation/secrets
cat > /tmp/sa_b64.txt <<'EOF'
[SA_JSON_BASE64]
EOF
base64 -d /tmp/sa_b64.txt > automation/secrets/sa.json
rm /tmp/sa_b64.txt
chmod 600 automation/secrets/sa.json

# Step 2: 規約を読み込む

以下のファイルを必ず開いて、書き方ルールを確認:
- agent-teams/decisions/machinowa-article-spec.md（記事の中身・構成・字数・トーン・画像・ID・割愛ルール・禁止表現の正本）
- automation/runbook.md（自動化フロー手順）

絶対忘れない:
- 監視シートは「詰めOKリスト」のみ（トスアップ元シートではない）
- 対象は row 146 以降のみ（145以下は永久スキップ）
- author 固定「マチノワ編集部」
- GBP（Google Maps）が一次情報。店舗名から場所推測は絶対禁止
- 画像は実店舗のもののみ（POINT 01/02 必須、03-05 は空配列）
- ID は店舗名のみ（teleapo-feat- などのプレフィックス禁止）

# Step 3: 候補抽出

node scripts/sheets-candidates.mjs を実行。

# Step 4: 候補が0件なら終了

「✅ 未処理候補なし」が出たら、即終了して以下を報告:
- 種別ごとの候補数（feature/restaurant）
- 処理0件で終了したこと

# Step 5: 候補があれば最大3件処理

candidates の上位3件まで、以下を順に実行（runbook.md §a〜f 参照）:

a. GBP確認:
   - curl -L --user-agent "Mozilla/5.0..." "<Maps URL>" でHTML取得
   - og:title, 〒住所、緯度経度を抽出
   - GBP の住所・座標が取れなければスキップ（過去のハルシネ事故防止）

b. 画像取得:
   - Google Maps の grass-cs/ プレフィックス画像URLを抽出
   - =w1400-h800-p-k-no サイズに変換して curl ダウンロード
   - public/restaurants/teleapo-{slug}/hero.jpg, point2.jpg に保存
   - POINT 01・02 で実画像 0 枚なら記事生成スキップ

c. 記事生成:
   - spec.md §1〜13 の構成（タイトル / summary / 導入文 / 5 POINT / 編集部のひとこと / 最後に歩き方）
   - 字数 3000 以上（水増し禁止）
   - 文中で半角 " を使わない（TypeScript 構文エラー）→「」を使う
   - feature: lib/teleapo-features.ts に追記
   - restaurant: lib/teleapo-restaurants.ts に追記
   - id/key は店舗名のみ（日本語OK・注釈除外・URL危険記号除外）

d. ビルド検証:
   - npm run build でエラーないか確認
   - エラーなら git checkout して該当ファイルをrevert、次の候補へ

e. commit & push:
   - git add lib/teleapo-features.ts (or teleapo-restaurants.ts) public/restaurants/
   - git commit -m "feat(teleapo): 特集記事を自動生成 – <店舗名>"
   - git push origin main

f. スプシ書き戻し:
   - node scripts/sheets-mark-done.mjs --type=feature --row=<行> --url=<生成URL>
   - または --type=restaurant

# Step 6: 完了報告

以下を出力:
- 処理した件数
- 各記事のURL（machinowa.tokyo/feature/<店舗名>）
- エラー件数（あれば原因）
- 残候補数

# 絶対厳守ルール

1. 監視シートは「詰めOKリスト」のみ
2. row 146 以降のみ対象
3. GBPの住所・座標が確認できない時は記事を作らない
4. 店舗名から場所を推測することは絶対禁止
5. 画像は実店舗のもののみ（Unsplash等NG）
6. 失礼な表現禁止（「素朴」「派手さはない」等／spec.md §14 参照）
7. 1回の実行で最大3件まで（暴走防止）
8. 各処理の間は最低5秒空ける
9. author は必ず「マチノワ編集部」
10. ID/URL に teleapo-feat- 等のプレフィックスを付けない
```

---

## スケジュール（cron 表現）

| 時刻（JST） | UTC | cron |
|---|---|---|
| 10:00 | 01:00 | `0 1 * * *` |
| 15:00 | 06:00 | `0 6 * * *` |
| 20:00 | 11:00 | `0 11 * * *` |

`schedule` skill は 1 cron / routine なので **3 routine 別々に登録** する。

---

## 登録手順（このセッションで実行）

1. `base64 < automation/secrets/sa.json | tr -d '\n'` で base64 を取得
2. 上記 prompt の `[SA_JSON_BASE64]` を置換
3. schedule skill で routine 作成 × 3
4. 手動発火で「未処理候補なし」が出ることを確認
