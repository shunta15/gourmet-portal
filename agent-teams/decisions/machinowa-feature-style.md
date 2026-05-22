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

## 画像ポリシー

**画像は必ず固定 placeholder を使う**（Claude が独自に画像URLを選ぶことは絶対禁止）:
- `heroImage`: `/restaurants/_placeholder/feature-hero.jpg`
- `ogImage`: `/restaurants/_placeholder/feature-og.jpg`
- 各 POINT `images`: `["/restaurants/_placeholder/feature-point.jpg"]`

→ 後で人間が公式店舗写真／エリア写真に差し替える前提。Unsplash 等の汎用画像が業態と合わないトラブルを防ぐため固定化。

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

## 絶対やってはいけないこと

- ❌ プロンプトで画像URLを Claude に自由に選ばせる
- ❌ subtitle / quote の字数制限を緩める（読みづらくなる）
- ❌ 単店舗自己紹介スタイルに戻す（エリア・シーン文脈なしの記事は NG）
- ❌ AI っぽい優等生文体（編集者の体温が乗った文章にする）
