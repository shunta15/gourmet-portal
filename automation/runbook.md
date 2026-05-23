# マチノワ記事自動生成 Runbook

**最終更新: 2026-05-24**

このドキュメントは **schedule skill（CronCreate / cowork）によるリモートエージェント** が起動時に従う手順書。
記事の中身の書き方は [`agent-teams/decisions/machinowa-article-spec.md`](../agent-teams/decisions/machinowa-article-spec.md) を必ず参照する。

---

## 全体フロー

```
1. 環境準備
   - サービスアカウント鍵を /automation/secrets/sa.json に配置（routine prompt の base64 を decode）
   - 必要なら npm install

2. 候補抽出（軽量）
   - node scripts/sheets-candidates.mjs
   - 出力: feature / restaurant の未処理候補と件数

3. 候補がなければ通知だけして終了

4. 候補がある場合、上限 MAX=3 件まで処理（暴走防止）
   各候補で以下を順に実行:

   a. GBP（一次情報）確認
   b. 画像取得
   c. 記事生成（machinowa-article-spec.md に従う）
   d. ビルド検証
   e. commit & push
   f. スプシ書き戻し

5. 完了通知（メール）
   - 処理件数・URL一覧・残候補数を linkateinc315@link8.info へ
```

---

## a. GBP 確認（一次情報）

**店舗名から場所・業種・住所を推測することは絶対禁止。** スプシに貼られた Maps URL のみが事実ソース。

```bash
curl -L --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" "<Maps URL>" -o /tmp/gbp.html
```

抽出する項目:
- `og:title` → 店舗名
- `og:description` → 業種・営業時間ヒント
- `〒###-####` パターン → 住所
- `/maps/place/NAME/@LAT,LNG/` パターン → 緯度経度
- `grass-cs/` プレフィックス → 店舗写真 URL

### GBP が取れなかった場合
- **記事を書かない。スキップして次の候補へ**
- 「住所不明だから抽象的に書く」は禁止（過去のハルシネ事故の原因）

---

## b. 画像取得

画像ソース許容範囲: GBP / 公式HP / 公式Instagram / オーナー提供（その店舗の実物のみ。Unsplash 等の汎用画像は絶対禁止）

詳細規約は [`agent-teams/decisions/machinowa-article-spec.md`](../agent-teams/decisions/machinowa-article-spec.md) §16 を参照。

### GBP 画像の取得手順
1. Maps HTML から `https://lh3.googleusercontent.com/...=grass-cs/...` を抽出
2. URL 末尾を `=w1400-h800-p-k-no` に書き換えてサイズ拡張
3. `curl` でダウンロード:

```bash
mkdir -p public/restaurants/teleapo-<slug>
curl -o public/restaurants/teleapo-<slug>/hero.jpg "<image url>"
curl -o public/restaurants/teleapo-<slug>/point2.jpg "<image url>"
```

### 画像配置先
- `public/restaurants/teleapo-<slug>/hero.jpg` （= POINT 01 用にも流用）
- `public/restaurants/teleapo-<slug>/point2.jpg`
- POINT 03〜05 は不要（spec.md §16 で `[]` 指定）

### 必須・任意
- 必須: hero / POINT 01 / POINT 02
- 1枚も揃わない場合は **記事生成スキップ**

---

## c. 記事生成

**spec.md を必ず開いて、構成・字数・トーン・禁止表現に従う。**

参照: [`agent-teams/decisions/machinowa-article-spec.md`](../agent-teams/decisions/machinowa-article-spec.md)
- §1〜13: 目的・構成・タイトル・summary・導入文・5 POINT・編集部のひとこと・歩き方・SEO・文体・字数
- §14: 禁止事項
- §15: 事実ソース／割愛ルール
- §17: ID/URL 命名規約
- §18: ファイル出力形式（TypeScript object）

### 出力先
- 特集記事: [`lib/teleapo-features.ts`](../lib/teleapo-features.ts) の末尾 `};` 直前に追記
- 店舗紹介: [`lib/teleapo-restaurants.ts`](../lib/teleapo-restaurants.ts)

### ID
- 店舗名のみ（日本語OK・プレフィックス禁止・注釈除外）
- 詳細は spec.md §17

---

## d. ビルド検証

```bash
npm run build
```

- 型エラー・コンパイルエラーがないことを確認
- エラーなら `git checkout` で revert、次の候補へスキップ
- TypeScript で詰まりやすい点:
  - 文中で `"` を使うと構文エラー → 日本語の `「」` を使う（spec.md §19）

---

## e. commit & push

```bash
git add lib/teleapo-features.ts public/restaurants/teleapo-<slug>/
git commit -m "feat(teleapo): 特集記事を自動生成 – <店舗名>"
git push origin main
```

---

## f. スプシ書き戻し

```bash
node scripts/sheets-mark-done.mjs --type=feature --row=<行> --url=<生成URL>
# または
node scripts/sheets-mark-done.mjs --type=restaurant --row=<行> --url=<生成URL>
```

書き戻し列:
- feature → W/X 列（処理状態 / URL）
- restaurant → Y/Z 列

---

## 完了通知

routine 完了時に以下を stdout に出力（routine 経由でメール送信される）:
- 処理した件数
- 各記事の URL
- エラー件数（あれば原因）
- 残候補数

---

## 重要ルール（過去の事故から学習・絶対遵守）

0. **🚨 監視シートは「詰めOKリスト」のみ**（絶対忘れない・2026-05-24 ユーザー明言）
   - スプシ ID: `1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk`
   - シート名: `詰めOKリスト`（QUERY 絞り込み済み）
   - **トスアップ元シートは見ない**（全店舗が入っていて対象外案件も含む）
   - 列: A〜V QUERY結果（読み取り） / W〜Z 自動化書き込み
     - W feature済 / X feature URL / Y restaurant済 / Z restaurant URL
1. **自動化対象は スプシ row 146 以降のみ**（row 145 以下は永久スキップ）
   - フィルタは `scripts/sheets-candidates.mjs` の `MIN_SOURCE_ROW = 146` で実装済
   - 旧案件は「時すでに遅し」で対象外（2026-05-24 ユーザー明言）
2. **GBP の住所が確認できない時は記事を作らない**（場所推測禁止）
3. **店舗名から場所・業種・客層を推測することは絶対禁止**
4. **画像は実店舗のもののみ**（Unsplash 等の汎用画像 NG）
5. **失礼な表現禁止**: spec.md §14 の禁止表現リスト遵守
6. **noindex のまま**: FEATURES 一覧に載せない、URL だけ存在
7. **1 回の実行で最大 3 件まで**（暴走防止）
8. **各処理の間は最低 5 秒空ける**

---

## スケジュール（cron 表現）

| 時刻（JST） | UTC | cron |
|---|---|---|
| 10:00 | 01:00 | `0 1 * * *` |
| 15:00 | 06:00 | `0 6 * * *` |
| 20:00 | 11:00 | `0 11 * * *` |

`schedule` skill は 1 cron / routine なので、**3 routine 別々に登録** が必要。

routine prompt の雛形は [`automation/routine-prompt.md`](./routine-prompt.md) を参照。

---

## ファイル参照

- 記事スペック: [`agent-teams/decisions/machinowa-article-spec.md`](../agent-teams/decisions/machinowa-article-spec.md)
- routine prompt 雛形: [`automation/routine-prompt.md`](./routine-prompt.md)
- 既存特集記事サンプル（高品質3本）: [`lib/newGuideFeatures6.ts`](../lib/newGuideFeatures6.ts)
  - `feature-qualia-meinohama`
  - `feature-kinosha-nachikatsuura`
  - `feature-nishida-yao`
