# マチノワ CMS 引き継ぎドキュメント

最終更新: 2026-05-20
完成度: Day 1〜26 / 28 = **93%**

---

## 1. 何ができる CMS か

`/admin/*` にログインすると、マチノワの全コンテンツ（店舗 / 特集記事 / 画像）を
ブラウザから直接編集できる。保存すると数秒で本番に反映される（ISR + on-demand revalidate）。

公開サイトは `lib/data.ts` ベースの SSG ではなく **Supabase DB を真実の源** とし、
DB の編集が即サイトに反映される構成。`data.ts` はフォールバック専用。

---

## 2. 主要 URL

| URL | 役割 |
|---|---|
| `/admin/login` | ログイン（Supabase Auth・パスワード） |
| `/admin` | ダッシュボード（件数 / 最近編集 / クイックアクション） |
| `/admin/setup` | **セットアップ案内** — SQL 適用ステータスと コピー機能 |
| `/admin/restaurants` | 店舗一覧（検索・絞込・ソート・バルク操作・CSV in/out） |
| `/admin/restaurants/[id]` | 店舗編集（5タブ + ⌘+S 保存 + 削除確認 + 複製） |
| `/admin/restaurants/new` | 新規追加（AI 下書き / 重複検出 / CloneFrom 対応） |
| `/admin/restaurants/import` | CSV 一括取込（検証 → 実行） |
| `/admin/features` | 特集記事一覧（フィルタ / 並び順 / バルク） |
| `/admin/features/[id]` | 特集編集（基本/本文/ヒーロー画像 3タブ） |
| `/admin/storage` | 画像ライブラリ（restaurants/features バケット閲覧） |
| `/owner` | 店舗オーナーポータル（基礎フレーム） |

⌘+K でグローバル検索コマンドパレットがどこからでも開く。

---

## 3. 利用できる機能一覧

### 店舗管理
- ✅ 一覧（検索・region 絞込・ID/名前/最近編集順）
- ✅ 編集（5 タブ: 基本/営業/画像/本文/メタ）
- ✅ 新規追加 + **AI 下書き生成**（URL → Claude 抽出）
- ✅ **複製**（既存店をテンプレに新規追加）
- ✅ 重複検出（名前部分一致 + 同 region で警告）
- ✅ 削除（確認ダイアログ）
- ✅ **CSV 一括取込 / 出力**
- ✅ **バルク操作**（複数選択 → 一括公開/非公開/削除）
- ✅ **編集トーン校閲補助**（「日本一」等 NG ワード検出）
- 🔒 status / publish_at（0002 適用後）
- 🔒 リビジョン履歴（0002 適用後）

### 特集記事管理
- ✅ 一覧（実稼働/公開/下書き/legacy フィルタ）
- ✅ 編集（基本/本文/ヒーロー 3 タブ）
- ✅ 新規追加・複製・削除・バルク操作
- ✅ 編集トーン校閲補助
- ✅ noindex フラグ（既存）
- 🔒 POINT/SPOT/COURSE 構造化編集 UI（Day 8-9 で未着手）

### 画像
- ✅ D&D アップロード（Sharp 無し、Supabase Storage 直接）
- ✅ 複数画像アップロード + 並べ替え
- ✅ 画像ライブラリ（バケット容量表示・サブフォルダ階層）
- ✅ URL 直入力もサポート

### 公開ページ（DB 駆動）
- ✅ `/restaurant/[id]` DB 駆動（ISR 60 秒）
- ✅ `/feature/[id]` DB 駆動（ISR 60 秒）
- ✅ `/region/[key]` DB 駆動
- ✅ 保存時 on-demand revalidate で即反映
- ✅ Google マップ CTA（住所ベース）追加
- ✅ `/sitemap.xml` DB 駆動（全 316 URL）
- ✅ `/robots.txt`（/admin /api を Disallow）
- ✅ Restaurant / Article JSON-LD 強化（priceRange / openingHours / addressRegion / aggregateRating）

### 自動化 / SEO / 分析
- ✅ Vercel Cron で **毎日 03:00 UTC に Google / Bing に sitemap ping**
- ✅ Vercel Analytics（全公開ページ計測中）
- ✅ ⌘+K グローバル検索
- ✅ POST `/api/track`（公開ページから CV イベント送信用）
- 🔒 GA4 / Search Console 統合（プラン書済み、OAuth 設定後）

### セキュリティ / 認証
- ✅ Supabase Auth で admin 全画面を保護（未認証 → /admin/login にリダイレクト）
- ✅ RLS で公開読み取り / 認証ユーザーフル権限
- ✅ API エンドポイントは認証必須（401 / 403 で正しく弾く）

---

## 4. ユーザー作業（解禁ブロッカー）

| 対応必要 | 解禁機能 |
|---|---|
| **0002 + 0003 SQL を Supabase Studio で適用** | status / publish_at / 予約公開 / リビジョン / 監査ログ / 画像 RLS / 予約リンク / クーポン |
| Vercel に `ANTHROPIC_API_KEY` 設定 | AI 下書き生成 |
| GA4 / Search Console OAuth | 店舗別 PV / 検索キーワード分析 |

**最速ルート: `/admin/setup` ページで「0002 をコピー」「0003 をコピー」を順に押し、
Supabase SQL Editor に貼って Run（所要 2 分）。**

---

## 5. 技術スタック

| レイヤ | 採用 |
|---|---|
| Frontend | Next.js 16 + shadcn/ui v4 + Tailwind v4 |
| DB | Supabase Postgres (project: `kffbwercoywjaayvjmbt`) |
| Auth | Supabase Auth (パスワード) |
| Storage | Supabase Storage (`restaurants` / `features` バケット) |
| AI | Anthropic Claude API (`claude-sonnet-4-7` via tool use) |
| Analytics | Vercel Analytics |
| Cron | Vercel Cron (毎日 03:00 UTC) |
| Deploy | Vercel (auto-deploy on push to main) |

---

## 6. ファイル構成（admin 関連）

```
app/
  admin/
    layout.tsx              # サイドバー + ⌘+K + Toaster
    page.tsx                # ダッシュボード
    login/page.tsx          # ログイン
    setup/page.tsx          # セットアップ案内
    restaurants/
      page.tsx              # 一覧
      new/page.tsx          # 新規 (cloneFrom 対応)
      [id]/page.tsx         # 編集
      import/page.tsx       # CSV 取込
    features/
      page.tsx              # 一覧
      new/page.tsx          # 新規
      [id]/page.tsx         # 編集
    storage/page.tsx        # 画像ライブラリ
  api/
    revalidate/route.ts     # ISR on-demand
    track/route.ts          # CV イベント
    ai/draft-restaurant/route.ts  # AI 下書き
    admin/
      export-restaurants/route.ts # CSV 出力
      import-restaurants/route.ts # CSV 取込
    cron/
      ping-search/route.ts  # 毎日 ping

components/
  admin/
    AIDraftButton.tsx
    ArrayInput.tsx
    BulkActionsBar.tsx
    CommandPalette.tsx
    ContentLintWarning.tsx
    DuplicateWarning.tsx
    FeatureEditForm.tsx
    ImageArrayUploader.tsx
    ImageUploader.tsx
    RestaurantEditForm.tsx
    SelectableTable.tsx
    SetupClient.tsx
  ui/                       # shadcn 17 コンポーネント

lib/
  db/
    restaurants.ts          # 公開ページ用 DB アクセス
    features.ts
    schema-check.ts         # 0002 適用検出
  audit.ts                  # 監査ログラッパー
  supabase/
    client.ts / server.ts / middleware.ts

supabase/
  schema.sql                # 初期スキーマ
  migrations/
    0002_cms_extensions.sql # 12 テーブル拡張（要適用）
    0003_storage_policies.sql # Storage RLS（要適用）

scripts/
  sync-restaurants-to-supabase.ts  # data.ts → DB 同期
  sync-features-to-supabase.ts
```

---

## 7. デイリー運用フロー

### 新店舗を追加するとき
1. `/admin/restaurants/new`
2. （任意）AI 下書きボタンで食べログ URL から自動入力
3. 重複警告を確認
4. 5 タブを埋めて保存（⌘+S）
5. 数秒で公開ページに反映

### 既存店舗を更新するとき
1. ⌘+K で店舗検索
2. 編集 → 保存
3. on-demand revalidate で即反映

### CSV で一括更新するとき
1. 店舗一覧で「CSV 出力」
2. Excel / スプレッドシートで編集
3. 「CSV 取込」→ 検証 → 実行

### 特集記事を書くとき
1. `/admin/features/new`
2. titleHTML / lede / 各 POINT は引き続き `lib/newGuideFeatures*.ts` を直接編集
3. （DB の feature_articles / feature_ranking_items を後で同期）

---

## 8. 既知の制約・残課題

- POINT / SPOT / COURSE の構造化編集 UI は未実装（Day 8-9 範囲）。当面は `lib/newGuideFeatures*.ts` 直編集 + `npx tsx scripts/sync-features-to-supabase.ts` で同期
- 0002 SQL 適用後にしか動かない機能多数（status / リビジョン / 監査ログ viewer / 予約リンク / クーポン）
- GA4 / Search Console は OAuth 設定後に Day 18 で実装
- オーナーポータルは基礎フレームのみ、本実装は Day 22-23（0002 適用後）

---

## 9. デプロイ・運用 Tips

- main へ push すると Vercel が自動デプロイ
- 緊急時は `vercel rollback` で前回デプロイに戻せる
- DB バックアップ: Supabase Dashboard → Database → Backups
- `npm run check:images` で画像 URL の死活確認（pre-commit でも自動実行）
- 編集トーンガイド: `agent-teams/editorial_tone_guide.md`
