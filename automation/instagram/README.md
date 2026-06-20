# 店舗紹介Instagram 投稿文 自動生成

マチノワの店舗データ等から、Instagram投稿のキャプション（本文＋ハッシュタグ）を生成し、ゆくゆくは自動投稿まで行うための仕組み。

## 全体像

```
[入力3パターン]                    [生成エンジン]              [出力]
① マチノワ data.ts の店舗  ┐
② 店名 / Google Maps URL   ┼→  Claude API（caption-prompt.md  →  キャプション＋#タグ
③ 手元の写真・メモ         ┘    をsystemに固定したトーン）      →  Instagram Graph APIで投稿
```

現状は **①が稼働可能**。②③はデータの入口を足せば同じ生成エンジンに載る（下記ロードマップ）。

## ファイル構成
| ファイル | 役割 | 課金 |
|---|---|---|
| `extract.mjs` | `lib/data.ts` → `output/restaurants.json`（r系店舗を抽出） | なし |
| `caption-prompt.md` | 生成トーン仕様（Bパターン）。generate.mjs の system に渡す | なし |
| `generate.mjs` | Claude API でキャプションをバッチ生成 | **あり（要承認）** |
| `output/restaurants.json` | 抽出済み店舗データ | なし |
| `output/captions-batch-001.md` | 手動生成サンプル5件（コピペ可） | なし |

## 使い方
```bash
# 1. 店舗データ抽出（課金なし・何度でも）
node automation/instagram/extract.mjs

# 2. 投稿文をバッチ生成（⚠️ API課金。事前承認のうえ実行。まず数件で実測）
ANTHROPIC_API_KEY=sk-... node automation/instagram/generate.mjs r234 r235 r236
```

## 🚦 承認ゲート（無断実行しない）
1. **Claude APIバッチ生成** … API課金が発生。初回は10件程度で**実測コストを出してから**本格運用（推定値で語らない）。
2. **Instagram自動投稿** … 実際の公開は本番アクションのため、毎回**事前承認**を取ってから実行（テスト投稿含む）。

## 自動投稿（Instagram Graph API）に必要な準備（ユーザー作業）
1. Instagramを**プロアカウント**（ビジネス/クリエイター）に切替
2. **Facebookページ**に連携
3. **Meta開発者登録 → アプリ作成 → アクセストークン取得**
4. 画像は**公開URL**が必要（マチノワの `public/restaurants/<id>/` をデプロイ済みURLで参照可）

投稿フロー: 画像コンテナ作成 → キャプション添付 → publish（予約 or 即時）。トークンが揃えば `publish.mjs` を追加して接続する。

## ロードマップ
- [x] ① data.ts 抽出 + Bトーン仕様 + サンプル5件
- [ ] generate.mjs を承認のうえ実行 → 実測コスト報告
- [ ] ② 店名/Maps URL 入力（resolve-maps-url.mjs + WebSearch を流用）
- [ ] ③ 写真・メモ入力（画像/テキストを生成エンジンに渡す）
- [ ] Instagram Graph API 接続（publish.mjs）・投稿予約
