> 未処理タスクと申し送りは [`automation/申し送り.md`](./申し送り.md) を参照。

> **⚠️ スプレッドシート・記事URL周りを触る前に、必ず
> [`automation/記事URL運用ルール.md`](./記事URL運用ルール.md) を読むこと。**
> 列構成・行ズレの原因・禁止スクリプト・抜け検知の手順が全部そこにある。
> 憶測で触ると同じ事故を繰り返す（実際に3回繰り返した）。

# マチノワ記事自動生成 Runbook

**最終更新: 2026-08-02（エラー恒久対策を反映）**

---

## 🚨 エラー恒久対策（2026-08-02）

実測: 定期実行の全エラー197件のうち **153件=claude認証切れ / 32件=ネットワーク断**。
93%が店舗と無関係な**環境起因**だった。それらを店舗ごとの「エラー」としてスプシに書くと
24時間クールダウンに入り、滞留が候補一覧から消えて「正常」に見えてしまう。

対策として以下を導入した。

| 対策 | 実体 | 効果 |
|---|---|---|
| 実行前ヘルスチェック | `automation/preflight.sh` | ネットワークは最大8分バックオフ待ち。認証NGならスプシを1行も触らず撤退（exit 11） |
| 環境起因はW列に書かない | `--status=clear` (`scripts/sheets-mark-done.mjs`) | ロックだけ外して次回そのまま再挑戦。クールダウンで滞留が隠れない |
| 環境起因なら即中断 | `local-pipeline.sh` の `ENV_FAILURE` | 残りの行も必ず同じ理由で失敗するので、無駄な連打をしない |
| 全数照合 | `scripts/health-report.mjs` | 「候補0件」を完了の根拠にしない。詰めOK行×W/X列で毎回数える |
| 台帳の偽エントリ検査 | `automation/ledger-audit.mjs` | 記事が実在しないのに「生成済み」になった行を自動復活 |
| 認証切れの通知 | `automation/HEALTH-ALERT.md` + macOS通知 | 見逃してもリポジトリを開けば必ず気づく。回復時に自動削除 |

### 認証切れを根絶する（1回だけ）

```bash
claude setup-token
bash automation/setup-oauth-token.sh <表示されたトークン>
```

長期トークンが launchd の 5ジョブ全部に環境変数として渡るため、以後 401 は起きない。

### ⚠️ 部分一致で店舗を照合してはいけない

記事ID `OWL`（門司の居酒屋）が `SEAFOODB(OWL) SHOP IN TANASHI` に中間一致し、
西東京市の別店舗が「生成済み」として台帳登録され、**その行は永久に記事化されなかった**。
`scripts/reconcile-ledger.mjs` と `automation/writeback-batch.mjs` の照合は
**前方一致のみ・4文字以上・候補が複数なら登録しない**に変更済み。中間一致（`includes`）は使わない。

このドキュメントは **schedule skill（CronCreate / cowork）によるリモートエージェント** が起動時に従う手順書。
記事の中身の書き方は [`agent-teams/decisions/machinowa-article-spec.md`](../agent-teams/decisions/machinowa-article-spec.md) を必ず参照する。

---

## 全体フロー

```
0. 環境準備（鍵配置・npm install）
1. 規約読み込み（spec.md / runbook.md を必ず開く）
2. 候補抽出（node scripts/sheets-candidates.mjs）
3. 候補が0件なら結果を stdout に出して終了（メール・Gmail下書きは作らない）
4. 候補がある場合、上限 MAX=3 件まで処理
   各候補で以下を順に実行:
   a. ロック取得（処理中マーク）
   b. GBP（一次情報）確認
   c. 画像取得（POINT 01/02 用 + 検証）
   d. 記事生成（machinowa-article-spec.md に従う）
   e. ビルド検証
   f. 禁止語grep検査（commit前ガード）
   g. commit & push（rebase + リトライ）
   h. スプシ書き戻し（成功 or エラー）
   i. 5秒スリープ
5. 完了処理（結果は stdout のみ・メール/Gmail下書きは作らない）
```

---

## a. ロック取得（race防止）

各候補処理の **最初** にスプシ W/Y 列へ「処理中: ...」を書き込み、他 routine が同じ行を掴まないようにする。

```bash
node scripts/sheets-mark-done.mjs --type=feature --row=<行> --status=processing
# または
node scripts/sheets-mark-done.mjs --type=restaurant --row=<行> --status=processing
```

- これにより W/Y に「処理中: YYYY-MM-DD HH:MM JST」が入り、次回 candidates 抽出で **処理済扱い** となりスキップされる
- 万一処理中に CCR がクラッシュしても、人間がスプシで「処理中:」をクリアすれば再試行対象に戻る

## b. GBP 確認（一次情報）

**🚨 ユーザー明言（2026-05-26）: Maps URL が示す店舗が絶対的に正しい。**
- 店舗名（D列）と Maps URL（J列）が食い違って見えても、Maps URL の店舗が事実
- **必ず Maps URL に直接アクセス**して Google Maps の店舗ページから住所・業態・写真を取得する
- 座標逆引き・店舗名再検索で「データ不整合」判断するのは禁止（過去の事故あり）

**店舗名から場所・業種・住所を推測することは絶対禁止。** スプシに貼られた Maps URL のみが事実ソース。

```bash
curl -L --max-time 30 --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" "<Maps URL>" -o /tmp/gbp.html
```

抽出する項目:
- `og:title` → 店舗名
- `og:description` → 業種・営業時間ヒント
- `〒###-####` パターン → 住所
- `/maps/place/NAME/@LAT,LNG/` パターン → 緯度経度
- `grass-cs/` プレフィックス → 店舗写真 URL

### GBP が取れなかった場合
- スプシに `--status=error --reason="GBP取得失敗"` を書いて次の候補へ
- 「住所不明だから抽象的に書く」は絶対禁止（過去のハルシネ事故の原因）

---

## c. 画像取得

画像ソース許容範囲: GBP / 公式HP / 公式Instagram / オーナー提供（その店舗の実物のみ。Unsplash 等の汎用画像は絶対禁止）

### 取得手順（優先順）
1. **GBP の grass-cs/ 画像**を抽出（最優先）
   - URL 末尾を `=w1400-h800-p-k-no` に書き換えてサイズ拡張
2. GBP に 2 枚以上ない場合は **公式ホームページ**から取得
3. それでも揃わない場合は **公式 Instagram**から取得

```bash
mkdir -p public/restaurants/teleapo-<slug>
curl --max-time 30 -o public/restaurants/teleapo-<slug>/hero.jpg "<image url>"
curl --max-time 30 -o public/restaurants/teleapo-<slug>/point2.jpg "<image url>"
```

### 画像検証（必須）
1枚ごとに以下を確認:
- **ファイルサイズ ≥ 20KB**（小さすぎる = エラーページや透明 PNG の可能性）
- `file public/restaurants/teleapo-<slug>/hero.jpg` で `JPEG image data` または `PNG image data` を確認
- 失敗したら別の URL を試す、それでも揃わなければスキップ

### 画像配置先
- `public/restaurants/teleapo-<slug>/hero.jpg`（POINT 01 用にも流用）
- `public/restaurants/teleapo-<slug>/point2.jpg`
- POINT 03〜05 は不要（spec.md §16 で `[]` 指定）

### 必須・任意
- 必須: hero / POINT 01 / POINT 02 の実画像 2枚
- POINT 01・02 で実画像が 0 枚しか揃わない場合: **記事生成スキップ**（`--status=error --reason="画像取得失敗"`）

---

## d. 記事生成

**spec.md を必ず開いて、構成・字数・トーン・禁止表現に従う。**

参照: [`agent-teams/decisions/machinowa-article-spec.md`](../agent-teams/decisions/machinowa-article-spec.md)
- §1〜13: 目的・構成・タイトル・summary・導入文・5 POINT・編集部のひとこと・歩き方・SEO・文体・字数
- §14: 禁止事項
- §15: 事実ソース／割愛ルール
- §17: ID/URL 命名規約
- §18: ファイル出力形式（TypeScript object）

### ID 衝突回避
ID は店舗名のみだが、既存記事と衝突する場合（同名チェーン等）は `<店舗名>-<市区町村>` で suffix を付ける。
例: `スターバックス` 既存 → 新規は `スターバックス-渋谷` のように。

### 出力先
- 特集記事: [`lib/teleapo-features.ts`](../lib/teleapo-features.ts) の末尾 `};` 直前に追記
- 店舗紹介: [`lib/teleapo-restaurants.ts`](../lib/teleapo-restaurants.ts)

---

## e. ビルド検証

```bash
npm run build
```

- 型エラー・コンパイルエラーがないことを確認
- エラーなら以下を実行して次の候補へスキップ:
  - `git checkout -- lib/teleapo-features.ts`（ファイル revert）
  - `rm -rf public/restaurants/teleapo-<slug>/`（**画像ディレクトリも削除**、ゴミ防止）
  - `node scripts/sheets-mark-done.mjs --type=feature --row=<行> --status=error --reason="ビルド失敗: <要約>"`
- TypeScript で詰まりやすい点:
  - 文中で `"` を使うと構文エラー → 日本語の `「」` を使う（spec.md §19）

---

## f. 禁止語 grep 検査（commit前ガード）

spec.md §14 の禁止表現を含む記事はコミットしない。**commit直前に必ず実行**:

```bash
PATTERNS='(素朴|派手さはない|奇をてらった.*ではない|日本一|絶品|最高の|呼び込みについて)'
if grep -E "$PATTERNS" lib/teleapo-features.ts; then
  echo "禁止語検出 → revert"
  git checkout -- lib/teleapo-features.ts
  rm -rf public/restaurants/teleapo-<slug>/
  # 禁止語は永久エラー扱い（人手で記事品質判断が必要）
  node scripts/sheets-mark-done.mjs --type=feature --row=<行> --status=permanent_error --reason="禁止語含む"
  # 次の候補へ
fi
```

---

## g. commit & push

```bash
git add lib/teleapo-features.ts public/restaurants/teleapo-<slug>/

# commit 前に差分が本当に存在するか確認（空コミット防止）
if git diff --cached --quiet; then
  echo "差分なし → 別 routine が先に書いた可能性"
  rm -rf public/restaurants/teleapo-<slug>/
  node scripts/sheets-mark-done.mjs --type=feature --row=<行> --status=error --reason="差分なし(競合)"
  # 次の候補へ
fi

git commit -m "feat(teleapo): 特集記事を自動生成 – <店舗名>"

# push（リモート最新を取り込んでから）
git pull --rebase origin main
if ! git push origin main; then
  # 1度だけリトライ（rebase conflict 等への耐性）
  git pull --rebase origin main
  if ! git push origin main; then
    git reset --hard HEAD~1
    rm -rf public/restaurants/teleapo-<slug>/
    node scripts/sheets-mark-done.mjs --type=feature --row=<行> --status=error --reason="git push失敗: <要約>"
    # 次の候補へ
  fi
fi
```

---

## h. スプシ書き戻し

成功時（ロック「処理中:」を「済」+URL に上書き）:
```bash
node scripts/sheets-mark-done.mjs --type=feature --row=<行> --url=<生成URL>
# または
node scripts/sheets-mark-done.mjs --type=restaurant --row=<行> --url=<生成URL>
```

エラー時はそれぞれの Step で個別に書き戻し済み（§e / §f / §g 参照）。

書き戻し列:
- feature → W=ステータス / X=URL（成功時のみ）
- restaurant → Y=ステータス / Z=URL（成功時のみ）

エラー状態は次回以降スキップされる。
人間がスプシでエラー店舗を確認し、原因解消後にW列をクリアすれば再試行対象になる。

---

## i. 5秒スリープ（強制実行）

```bash
sleep 5
```

連続実行による Maps / Sheets API レート制限・bot 検知回避。
**prompt の文字列指示ではなく、必ず bash の `sleep 5` を実行すること**（モデル任せにしない）。

---

## 5. 完了処理（結果は stdout のみ）

🚫 **メール送信・Gmail 下書き作成は一切行わない**（ユーザー指示により 2026-06-18 廃止）。
Gmail MCP（create_draft 等）は絶対に呼ばない。実行結果は標準出力(stdout)にのみ出力する:

- stdout:
  - 実行時刻
  - 処理件数（今回成功 / 今回エラー / スキップ）
  - 各記事の URL（`machinowa.tokyo/feature/<店舗名>`）
  - 今回のエラー詳細（店舗名 + 失敗理由）
  - 累計エラー件数 / 残候補数

### エラーステータスの種類
- `エラー: 理由 (YYYY-MM-DD)` → 24時間経過後に **自動リトライ対象**
- `永久エラー: 理由` → 二度と試行しない（禁止語含むなど。人手解除待ち）

---

## 重要ルール（過去の事故から学習・絶対遵守）

0. **🚨 監視シートは「詰めOKリスト」のみ**（絶対忘れない・2026-05-24 ユーザー明言）
   - スプシ ID: `1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk`
   - シート名: `詰めOKリスト`（QUERY 絞り込み済み）
   - **トスアップ元シートは見ない**
   - 列: A〜V QUERY結果 / W〜Z 自動化書き込み（W feature済 / X feature URL / Y restaurant済 / Z restaurant URL）
1. **自動化対象は スプシ row 146 以降のみ**（row 145 以下は永久スキップ）
2. **GBP の住所が確認できない時は記事を作らない**（場所推測禁止）
3. **店舗名から場所・業種・客層を推測することは絶対禁止**
4. **画像は実店舗のもののみ + 20KB以上検証**（Unsplash 等 NG、プレースホルダ NG）
5. **失礼な表現禁止**: spec.md §14 + 禁止語 grep でガード
6. **noindex のまま**: FEATURES 一覧に載せない、URL だけ存在
7. **1 回の実行で最大 3 件まで**（暴走防止）
8. **各処理の間は最低 5 秒空ける**
9. **必ずロック取得 → 必ずスプシ書き戻し → 結果は stdout 出力**（メール送信・Gmail下書き作成は禁止）

---

## 過去事故テーブル（同じ失敗をしない）

| 事故 | 教訓 | 防止策 |
|---|---|---|
| ルーラル → 福岡・志免と書いた（実：岸和田） | 店舗名連想禁止 | GBP 必須 |
| 炭や。よつ葉 → 博多と書いた（実：寝屋川） | 同上 | 同上 |
| OWL → 博多と書いた（実：門司） | 同上 | 同上 |
| 晩餐-Bansun- が「白身魚のカルパッチョ風」と勝手にメニュー描写 | メニュー推測禁止 | spec §15 割愛ルール |
| 晩餐-Bansun- POINT 03 に「派手さはない」 | 禁止表現 | spec §14 + grep ガード（§f） |
| OWL の本文に「（営業時間状況で変わります）」が残った | ID/本文ともに注釈除外 | spec §17 + lede/desc にも注釈入れない |

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
