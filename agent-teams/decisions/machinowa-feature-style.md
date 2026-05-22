# マチノワ特集記事（teleapo自動生成）スタイル決定事項

最終更新: 2026-05-22

## 記事フォーマット（必須）

既存高品質記事 `feature-qualia-meinohama` / `feature-kinosha-nachikatsuura` / `feature-nishida-yao` のスタイルに準拠。

### 構造
1. **タイトル**: エリア + シーン + 店舗名 + 短いキャッチ（30〜60字）
2. **titleHTML**: 2行構成、`<em>` で店舗名強調（例: `Qualia、<br>姪浜の<em>夜。</em>`）
3. **subtitle**: 業態 + エリア + シーン示唆。**20〜35字に厳守**
4. **lede**: 周辺アクセス → エリア文脈 → 店ポジショニング → 5点案内（250〜400字）
5. **POINT 1-4**: 業態の核心 / 看板料理 / もう1つの強み / 内装空間。各 desc 350〜500字
6. **POINT 5 (固定)**: 「利用シーンと周辺との組み合わせ方」（周辺観光・1日プラン込み）
7. **quote**: 編集部視点の総括。**80〜140字に厳守**（長く語らない）
8. **closing**: 「編集部の考える黄金動線」を時刻付きで具体的に（400〜600字）

## 文体ルール

- 編集部目線の主観・人称（「編集部」「私」）
- 口語的なトーン（「〜だ。」「〜と思う。」）
- AI っぽい優等生文体は避ける
- 誇張・推測は禁止、不明な数値は「公式情報をご確認ください」

## 画像ポリシー（2026-05-22 確定）

**画像は固定 placeholder のみ使用**（Claude が独自に画像URLを選ぶことは絶対禁止）:
- `heroImage`: `/restaurants/_placeholder/feature-hero.jpg`（**必ず**）
- `ogImage`: `/restaurants/_placeholder/feature-og.jpg`（**必ず**）
- **POINT 1, 2** `images`: `["/restaurants/_placeholder/feature-point.jpg"]`（必ず placeholder 入れる）
- **POINT 3, 4, 5** `images`: `[]`（空配列。CSS で「画像イメージ」ラベル + 暗色背景が表示される）

placeholder 画像は無地の暗色グラデーション JPEG（PIL で生成）。
後で人間が公式店舗写真／エリア写真に差し替える前提。Unsplash 等の汎用画像が業態と合わないトラブルを防ぐため固定化。

## CSS 調整

- `.feat-hero .bot .dt p`: subtitle フォント 14px → **12px**
- `.quote-block blockquote`: フォント `clamp(28px,4vw,56px)` → **`clamp(20px,2.4vw,32px)`**、max-width 1200px → 900px
- mobile: quote font `clamp(20px,5vw,32px)` → **`clamp(18px,4vw,24px)`**

## 失敗事例（やり直し）

| 日付 | 内容 |
|---|---|
| 2026-05-22 1回目 | プロンプトが「単店舗自己紹介」になっていた。エリア・シーン文脈ゼロ、POINT 5 が「使い方」になってなかった、closing が汎用、画像が業態無関係（オフィス画像など）。**4本全削除して再生成** |
| 2026-05-22 2回目 | エリア・シーン文脈は入ったが、subtitle / quote が長すぎる & フォント大きすぎる。CSS縮小 + プロンプトで字数厳守化 + 画像固定化 |

## 関連ファイル

- API: `app/api/machinowa/generate/route.ts` (buildFeaturePrompt)
- 出力: `lib/teleapo-features.ts`
- CSS: `app/globals.css` (.feat-hero, .quote-block)
- 参考記事: `lib/newGuideFeatures6.ts` (feature-qualia-meinohama / feature-kinosha-nachikatsuura / feature-nishida-yao)

## 修正フロー（2026-05-22 確定）

**既存記事の修正は GAS/API を一切経由せず、エージェントが直接ファイル編集する**

ユーザーから「○○の記事のここを直して」と依頼されたら：
1. `lib/teleapo-features.ts` を直接編集
2. 必要に応じて画像を `public/restaurants/{店舗ID}/` に配置
3. ローカルビルドで構文確認 (`npm run build`)
4. commit → push → `vercel --prod`

**禁止事項**:
- ❌ 修正のためにスプシを編集してGASトリガーで再生成
- ❌ 修正のために API `/api/machinowa/generate` を叩く（テキストの大幅刷新は別、軽微修正には使わない）

**新規記事の生成のみ** GAS → API パイプラインを使う。

### 画像差し替え
1. Chrome MCP で Google Maps の店舗ページを開く
2. JS で `grass-cs/` プレフィックスの画像 URL を抽出
3. `=w1400-h800-p-k-no` 等にサイズ拡張して `curl` でダウンロード
4. `public/restaurants/teleapo-{slug}/hero.jpg` などに配置
5. `lib/teleapo-features.ts` の `heroImage` / `images` パスを書き換え

## 絶対やってはいけないこと

- ❌ プロンプトで画像URLを Claude に自由に選ばせる
- ❌ subtitle / quote の字数制限を緩める（読みづらくなる）
- ❌ 単店舗自己紹介スタイルに戻す（エリア・シーン文脈なしの記事は NG）
- ❌ AI っぽい優等生文体（編集者の体温が乗った文章にする）
- ❌ **GBP（Google Business Profile）情報を取得せずに記事を書く**（後述）

## 🚨 GBP（Google Business Profile）必須ルール（2026-05-22 確定）

**店舗名から場所・業種・住所を推測することは絶対禁止**。

過去の事故（2026-05-22）:
- ルーラル → Claude が「rural=郊外」と連想し「福岡・志免」と書いた。**実際は大阪府岸和田市**
- 炭や。よつ葉 → 「博多駅筑紫口」と書いた。**実際は大阪府寝屋川市**
- OWL → 「博多駅筑紫口」と書いた。**実際は福岡県北九州市門司区**
- あんばい食楽厨房 → 「名古屋・大曽根」と書いた。**実際は福岡県北九州市小倉北区**

→ **全部完全な虚偽記事**。マチノワの「実在店舗・誇張禁止」ルール違反。

### 必須実装（`app/api/machinowa/generate/route.ts` の `fetchPlaceInfo`）

1. Google Maps URL を follow-redirect で解決
2. 最終URL から `/maps/place/NAME/@LAT,LNG/` パターン抽出
3. HTML から og:title / og:description / 〒住所 を抽出
4. これらの GBP 一次情報を **必ず** プロンプトに含める
5. GBP 取得失敗時は「エリア固有の情報を入れない」抽象記事になるよう指示

プロンプトには「店舗名から場所を推測することは絶対禁止」「GBP の住所・緯度経度のみを根拠にする」を明示。

### GBP の使い方
- 住所 → 都道府県 / 市区町村 / エリア名
- 緯度経度 → 周辺観光・最寄り駅推定の根拠（Claude の地理知識を使う）
- カテゴリ → 業種ジャンル
- og:description → 平均価格・営業時間ヒント
