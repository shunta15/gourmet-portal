# マチノワ記事生成プロンプト（v2 / 2026-05-24 確定）

このプロンプトは **cowork（Claude Code 自律実行）で teleapo 自動生成記事を書く時の規約** をまとめたもの。
自動化スケジュール（CronCreate）から呼び出される routine の本文は、このドキュメントを参照する。

**手動で記事を書く時も、このプロンプトに従う。teleapo 用と既存マチノワ特集は同じトーンで書く（派生禁止）。**

---

## 0. 絶対遵守の前提

1. **トーンは「マチノワ編集部」単一**。teleapo 用・自動生成用の派生トーンは作らない。
2. **author は固定**: `"マチノワ編集部"`
3. **品質目標**: 既存の `lib/newGuideFeatures6.ts` の以下 3 本と区別がつかない品質を出す。
   - `feature-qualia-meinohama`
   - `feature-kinosha-nachikatsuura`
   - `feature-nishida-yao`
4. **noindex 公開**: `FEATURES`（公開一覧）には載せない。URL だけ有効。

---

## 1. 事実ソース（一次情報）

**唯一の一次情報源は、スプレッドシートに貼られた Google Maps（GBP）URL。**

### 取得手順
1. スプシから Google Maps URL を取り出す
2. `curl -L --user-agent "Mozilla/5.0..."` で HTML 取得
3. 以下を抽出:
   - `og:title` → 店舗名
   - `og:description` → 業種・営業時間ヒント
   - `〒###-####` パターン → 住所
   - `/maps/place/NAME/@LAT,LNG/` パターン → 緯度経度
   - `grass-cs/` プレフィックス → 店舗写真 URL（最低 2 枚）

### GBP が取れなかった場合
- **記事を書かない。スキップして次の候補へ進む。**
- 「住所不明だから抽象的に書く」は禁止（過去のハルシネ事故の原因）

---

## 2. 推測禁止 / 割愛ルール

### 「GBP から取れる」情報のみ書ける
- 店舗名・住所・都道府県・市区町村・町丁目
- 緯度経度（最寄り駅・周辺観光の推定に使う）
- 業種カテゴリ
- 営業時間・定休日（GBP に明記あれば）
- 電話番号
- 公式店舗写真

### 「GBP から取れない」情報は割愛
**「公式情報をご確認ください」と書くのではなく、そもそも書かない。** その POINT を別の軸で組み立てる。

| 割愛対象 | 理由 |
|---|---|
| メニュー名・料理内容 | GBP に出ない（過去：晩餐-Bansun- で「白身魚のカルパッチョ風」と勝手に書いた） |
| 席数・席種・カウンター有無 | GBP に出ない |
| 客層・客単価・予算帯 | GBP に出ない |
| 雰囲気・内装の具体描写 | GBP に出ない |
| ペアリング・酒の品揃え | GBP に出ない |
| 「〜だろう」「〜と思う」の憶測 | これも推測 |

### 推測 OK の範囲
- 編集部の地理知識（その町がどういう街か、駅からの距離感、周辺観光）
- カテゴリから推定可能な利用シーン（「居酒屋カテゴリ → 夜利用が中心」程度）
- 黄金動線（時刻＋周辺スポット組み合わせ。具体スポットは編集部の地理知識で組む）

**迷ったら割愛。** ハルシネ事故より割愛のほうが圧倒的にマシ。

---

## 3. 構成テンプレ

既存特集記事（`feature-qualia-meinohama` 等）の構造を踏襲する。

### TypeScript 型（lib/data.ts の FeatureArticle）

```ts
{
  id: "<店舗名>",                 // 店舗名のみ（日本語OK）。teleapo-feat- 等のプレフィックス禁止
                                  // 注釈（営業時間・移転・閉店等）は ID に入れない（例: OWL ○ / owl営業時間状況で変わります ✗）
                                  // URL: /feature/<id>
  no: "",
  articleType: "guide" as const,
  kicker: "<英大文字キャッチ>",     // 例: "QUALIA MEINOHAMA"
  title: "<エリア + シーン + 店舗名 + 短いキャッチ>",  // 30〜60字
  titleHTML: "<店舗名>、<br><エリア>の<em><シーン>。</em>",  // 2行構成
  subtitle: "<業態 + エリア + シーン>",  // 20〜35字厳守
  lede: "<周辺アクセス → エリア文脈 → 店ポジショニング → 5点案内>",  // 250〜400字
  date: "<YYYY-MM-DD>",
  reading: "",
  author: "マチノワ編集部",
  heroImage: "/restaurants/teleapo-<slug>/hero.jpg",  // 画像ディレクトリ名は teleapo-<英数slug> でOK（URLとは別物）
  ogImage: "/restaurants/teleapo-<slug>/hero.jpg",
  ranking: [POINT 01〜05],
  sideArticles: [],
  quote: "<編集部視点の総括>",       // 80〜140字厳守
  quoteCite: "マチノワ編集部",
  closing: "<時刻付きの黄金動線>",   // 400〜600字
}
```

### POINT 5 個の構成（割愛ルール下でも書ける軸）

GBP から取れる情報が少ない自動生成では、各 POINT の論点をエリア・立地・周辺・カテゴリに寄せる。

| POINT | 論点 | desc 字数 | 必要画像 |
|---|---|---|---|
| POINT 01 | **立地とエリア論**（このエリアにこの業態があることの意味） | 350〜500字 | hero.jpg を `images` に必須 |
| POINT 02 | **業態カテゴリの位置づけ**（GBP カテゴリから推測できる範囲で） | 350〜500字 | point2.jpg があれば設定、無ければ `[]` |
| POINT 03 | **アクセス・最寄り駅**（緯度経度から導出） | 350〜500字 | `[]` |
| POINT 04 | **周辺観光・組み合わせスポット**（編集部の地理知識） | 350〜500字 | `[]` |
| POINT 05 | **利用シーンと一日の黄金動線**（固定） | 350〜500字 | `[]` |

各 POINT には以下を含める:
```ts
{
  rank: "POINT 0X",
  rankNum: X,
  name: "<35字以内の見出し>",
  cuisine: "<業態またはトピック>",
  area: "<市区町村>",
  purpose: "<その POINT の狙い・誰向けか>",
  desc: "<本文>",
  images: [...],
  specs: [{ k: "<項目>", v: "<値>" }, ...]   // 各 POINT 2 項目程度、GBP から取れる事実のみ
}
```

---

## 4. 文体ルール

### マチノワ編集部トーン

- 主語: 「編集部」「私」「私たち」を適宜混ぜる
- 文末: 「〜だ。」「〜です。」「〜と思う。」を混ぜて柔らかい口語に
- 「〜あるある」「〜って」のような少しくだけた表現も OK
- AI 優等生文体（「〜することができます」「〜なのです」連発）禁止
- 体温のある一文を入れる（「これ、地味に効く」「正直、外れない」など）

### 禁止表現（過去事故からの学習・必ず守る）

- ❌ 否定起点の褒め: 「素朴」「派手さはない」「奇をてらった〜ではない」「観光客向けの派手な店ではなく」
- ❌ 根拠なし最上級: 「日本一」「絶品」「最高の」（出典あれば可）
- ❌ 客引き追従: 「呼び込みについていけば」等
- ❌ 年号付き料金: 「○○円（2026年現在）」→「公式情報をご確認ください」に置換
- ❌ 俗称・ネットスラング
- ❌ 噂・推測・「〜らしい」

---

## 5. 画像規約（2026-05-24 確定）

### 画像ソースの許容範囲（その店舗のものであれば何でも可）
- Google Maps（GBP）の `grass-cs/` プレフィックス画像
- 公式ホームページの画像
- 公式 Instagram の投稿画像
- オーナーから提供された画像

**唯一の制約は「その店舗の実物画像であること」。** 架空店舗の画像・他店の画像・汎用ストックフォト（Unsplash 等）は絶対禁止。

### 必須画像（取れるまで頑張る）
- `heroImage`: `/restaurants/teleapo-<slug>/hero.jpg`
- `ogImage`: hero と同一パスで OK
- `POINT 01` の `images`: 実画像必須（`["/restaurants/teleapo-<slug>/hero.jpg"]` or 別カット）
- `POINT 02` の `images`: 実画像必須（`["/restaurants/teleapo-<slug>/point2.jpg"]`）

### 任意画像
- `POINT 03〜05` の `images`: `[]`（空配列）
- 空配列の場合、CSS が「画像イメージ」ラベル＋暗色背景を表示する（現状のまま）

### 画像取得手順
1. **まず GBP** から `https://lh3.googleusercontent.com/...=grass-cs/...` を抽出
   - URL 末尾を `=w1400-h800-p-k-no` に書き換えてサイズ拡張
2. GBP に 2 枚以上なければ **公式 HP / 公式 Instagram** から取得
3. `curl -o public/restaurants/teleapo-<slug>/hero.jpg "<url>"`
4. 同じく `point2.jpg` も配置
5. ファイル形式は jpg を基本とする（webp 取得時は jpg に変換、または webp のままパス指定）

### POINT 01, 02 の実画像が **絶対に2枚揃わない場合**
- 1枚しか取れなければ hero と POINT 01 のみ実画像、POINT 02 を `[]` でも可
- 0枚しか取れなければ **記事生成自体をスキップ**（画像なしの記事は作らない）

---

## 6. ファイル出力・ID 命名

### 特集記事（feature）
- 追記先: `lib/teleapo-features.ts`
- 末尾の `};` の直前に1ブロック追記
- **key と id は店舗名のみ（日本語OK・プレフィックス禁止）**
  - 例: `"ルーラル"` / `"あんばい食楽厨房"` / `"OWL"` / `"晩餐-Bansun"`
  - 注釈（「（営業時間状況で変わります）」「（移転）」「※閉店」等）は除外
  - URL に入れて不安な記号は除外: `。` `/` `(` `)` `?` `&` `#` `%` 等
  - 残してOK: 英数・ひらがな・カタカナ・漢字・`-`

### 店舗紹介（restaurant）
- 追記先: `lib/teleapo-restaurants.ts`
- key/id 規約は feature と同じ（店舗名のみ）
- URL は `/restaurant/<店舗名>`

### URL 形式（2026-05-24 確定）
- 特集: `machinowa.tokyo/feature/<店舗名>`
- 店舗: `machinowa.tokyo/restaurant/<店舗名>`
- 日本語IDは Next.js が自動で percent-encode して配信する（SSG 検証済み）
- 旧 `/feature/teleapo-feat-*` は middleware.ts で 301 → 新URLへ救済（既存6記事のみ）

---

## 7. 検証 → コミット → スプシ書き戻し

1. `npm run build` で型エラー・コンパイルエラーがないことを確認
2. エラーなら `git checkout` で revert、次の候補へ
3. 成功したら:
   - `git add lib/teleapo-features.ts public/restaurants/teleapo-<slug>/`
   - `git commit -m "feat(teleapo): 特集記事を自動生成 – <店舗名>"`
   - `git push`
4. `node scripts/sheets-mark-done.mjs --type=feature --row=<行> --url=<生成URL>` でスプシ書き戻し

---

## 8. 既存記事の構成サンプル（参照必須）

以下を**毎回開いて参考にする**こと:

| ファイル | 記事 ID | 用途 |
|---|---|---|
| `lib/newGuideFeatures6.ts:93` | `feature-qualia-meinohama` | 都市部・夜デート系の参考 |
| `lib/newGuideFeatures6.ts:134` | `feature-kinosha-nachikatsuura` | 郊外・観光地起点の参考 |
| `lib/newGuideFeatures6.ts:180` | `feature-nishida-yao` | 住宅地・地元密着系の参考 |

---

## 9. 過去事故リスト（同じミスを繰り返さない）

| 事故 | 教訓 |
|---|---|
| ルーラル → 福岡・志免と書いた（実：大阪府岸和田市） | 店舗名連想禁止・GBP 必須 |
| 炭や。よつ葉 → 博多と書いた（実：大阪府寝屋川市） | 同上 |
| OWL → 博多と書いた（実：北九州市門司区） | 同上 |
| あんばい食楽厨房 → 名古屋と書いた（実：北九州市小倉北区） | 同上 |
| 晩餐-Bansun- → 「白身魚のカルパッチョ風」と勝手にメニュー描写 | メニュー推測禁止・割愛 |
| 晩餐-Bansun- → POINT 03 に「派手さはない」 | 禁止表現リスト遵守 |

---

## 10. 関連ドキュメント

- スタイル基本: `agent-teams/decisions/machinowa-feature-style.md`
- 自動化 runbook: `automation/runbook.md`
- routine プロンプト雛形: `automation/routine-prompt.md`
- memory: `~/.claude/projects/-Users-shunta-claude/memory/feedback_machinowa_tone_unified.md`
- memory: `~/.claude/projects/-Users-shunta-claude/memory/feedback_machinowa_automation_v2.md`
