@AGENTS.md

# マチノワ運用チーム（11名構成）

## チーム構成

### 基幹チーム（実装・運用）
| エージェント | 責務 |
|---|---|
| **machinowa-manager** | 統括・タスク振り分け・ユーザー窓口・最終承認 |
| **machinowa-researcher** | 店舗情報・口コミ・画像URL収集 |
| **machinowa-writer** | 1店舗単位の紹介文・本文執筆 |
| **machinowa-photo-curator** | 画像取得・選定・heroImages/gallery編成 |
| **machinowa-designer** | UI/CSS/タイポ/レスポンシブ |
| **machinowa-builder** | data.ts更新・実装・ビルド・デプロイ |
| **machinowa-auditor** | 事実監査（事実誤認・誇張・リンク切れ・画像URL疎通・出典）|
| **machinowa-visual-auditor** | **視覚監査専任。本番デプロイ後に各主要ページを実機相当幅でscreenshot撮影し、レイアウト崩れ・サイズ不一致・タイポ崩れ・画像表示・余白・カラー逸脱・モバイル崩れを検知する** |

### 戦略チーム（企画・SEO・分析）
| エージェント | 責務 |
|---|---|
| **machinowa-editorial** | 特集記事の企画・構成・シーン別LP・連載管理 |
| **machinowa-seo** | ローカルSEO/構造化データ/メタ/サイトマップ/シーン別ハブ |
| **machinowa-analyst** | Search Console/Vercel Analytics/GA4分析・改善仮説 |

## ユーザー窓口
**ユーザーは manager とのみ会話**。manager が各エージェントに振り分ける。

## 標準ワークフロー

### 新店舗追加
```
researcher → writer + photo-curator（並列）
           → builder → auditor + seo（並列）
           → builder（最終デプロイ）→ visual-auditor（実機screenshot確認）
           → manager 報告
```

### 特集記事の作成
```
editorial（企画立案・構成）
  → researcher（追加情報）
  → writer（各店の文章）
  → photo-curator（特集ヒーロー）
  → seo（タイトル/メタ/JSON-LD）
  → builder（FEATURE_ARTICLES 追加・実装）
  → auditor（事実+リンク監査）
  → builder（デプロイ）→ visual-auditor（screenshot確認）
  → manager 報告
```

### UI/UX改善
```
designer → builder → auditor（コード規約） → visual-auditor（実機確認）→ manager
```

### SEO改善
```
seo（戦略） → builder（実装） → auditor（検証） → analyst（効果測定） → manager
```

### 流入分析・改善ループ
```
analyst（データ取得） → analyst（仮説立案）
  → editorial / writer / seo / designer に改善依頼
  → builder（実装）
  → analyst（効果測定）
```

## lib/data.ts アクセス規則（クレジット節約・必須）

**`lib/data.ts` を全体 Read することを禁止する。** ファイルは 3,500 行超あり、全体読み込みはトークンを大量消費する。

### 許可されている操作
```bash
# ✅ 最終IDの確認（grep のみ）
grep 'id: "r' lib/data.ts | tail -3

# ✅ 挿入点の確認（末尾だけ Read）
# Read offset=3450 limit=30  ← 行数は grep で事前確認

# ✅ 型定義の確認（先頭だけ Read）
# Read limit=80

# ✅ 特定IDの存在確認
grep 'id: "r67"' lib/data.ts
```

### 禁止されている操作
```bash
# ❌ 全体 Read（絶対禁止）
# Read file_path="lib/data.ts"  ← offset/limit 未指定は禁止

# ❌ cat / head -n 1000 など大量出力コマンド
```

### 現在の状態（更新すること）
- **最終ID: r240**（和心イタリアン Hitotsu / 大阪府堺市中区）
- **次のID: r241**
- **挿入点: `];` 直前（約11,100 行付近）**
- **掲載店舗数: 229店舗**（欠番: r11・r26・r29・r98・r102・r109・r114・r119・r122・r136・r139）
- **Region: 16種**（tokyo / osaka / nagoya / fukuoka / shizuoka / kanagawa / saitama / kyoto / nara / hyogo / hiroshima / gunma / shiga / kagoshima / **wakayama** / **hokkaido**）
- **特集記事数: 180本**（No.1〜No.180、No.161〜180はコース特集、feature-value-lunch-129 はIDに注意）

---

## 重要な運用ルール
1. **店舗追加はユーザーから明示指示があった時のみ**実施。勝手に増やさない
2. 事実情報のみを掲載（誇張・推測・虚偽禁止）
3. 評価値（★）は出典明記、または非掲載
4. 食べログの文章直接コピペは ToS 違反のため禁止
5. 画像の出典を必ず把握
6. **コード変更→commit→push→deploy→本番確認**まで完了させる
7. 全エージェントは作業ログを `agent-teams/logs/` に保存
8. **画像URL/パスは必ず疎通確認**: `lib/data.ts` を変更したら `npm run check:images` を通す（pre-commitフックで自動実行されるが、コミット前に手動でも回す）。404 や missing が出たら commit 禁止。Unsplash 暫定でも 200 必須
9. **本番デプロイ後、視覚崩れがありうる変更（CSS/レイアウト/データ追加/画像差し替え/コンポーネント修正）は必ず visual-auditor を通す**。実機相当幅（375 / 768 / 1280px）で本番URLを screenshot し、レイアウト崩れ・サイズ不一致・タイポ崩れ・画像表示・余白・カラー逸脱・モバイル崩れを目視確認。ヒトの「目」抜きの完了報告は禁止
10. **「class が HTML に出ている」「200 が返る」「TypeScript が通った」のいずれも、視覚確認の代替にはならない**。CSS minifier の最適化バグ等で実画面が壊れる事故が実際に発生済み

## 街ガイド記事の品質基準（2026-05-14 制定）

### スポット記載の必須確認事項
各スポットを追加・更新する際は以下を公開前に確認すること：
- **現在の正式名称**（改名・閉業・移転がないか）
- **営業継続中か**（閉店・一時休業・移転先の確認）
- **正しいエリア**（隣接エリアのスポットを混入しない）
- **最寄り駅と徒歩分数**（公式または Google Maps 実測）
- **現行料金または料金確認先**（変動しやすい施設は「訪問前に公式確認」と明記）

### エリア厳格分離ルール
以下のような近接エリアは**厳密に分ける**こと。混入禁止：
- お台場 / 有明 / 豊洲 / 青海（施設・最寄り駅が異なる）
- 中目黒 / 代官山（駅が異なる・ブランドが異なる）
- 自由が丘 / 日本橋兜町 など（名所でも住所を確認）
- 麻布台 / 六本木 / 赤坂（丁目レベルで確認）

### 記事の最低品質基準
- **公開ラインの本文密度**: 各スポット説明は「その場所ならではの理由」を1文以上含む。汎用的な説明のみの記事は公開しない
- **記事の必須構成**: 導入（lede）・5スポット具体説明・回り方（closing）・向いている人（quote）・注意点（料金・予約要否など specs）
- **薄い「スポットメモ」記事は量産しない**。公開基準を満たさない記事は FEATURES から外して noindex 扱いとする（FEATURE_ARTICLES には残して URL は維持）

### 禁止表現
- 俗称・ネットスラング（例：「うんこビル」「東京一凶」）
- 断定的な料金・営業時間（変動する可能性があるもの）
- 「人気」「おすすめ」の根拠なし使用
- 噂・推測・誇張（「日本一」等は出典なしに使わない）
- 客引き・呼び込みへの追従を促す表現
- 年号付き料金表記（例：「○○円（2024年現在）」→「訪問前に公式確認」に置き換える）

### 固有名詞の精査
- ホテル・施設名は公式プレスリリース・公式サイトで確認（例：麻布台ヒルズは Janu Tokyo と Aman Residences が入居）
- 開業・移転情報は公式発表ベースで記載
- teamLab 施設は場所（豊洲/有明/お台場等）と正式名称を混同しない

## 作業ディレクトリ
- リサーチ: `agent-teams/research/<store_id>.md`
- 企画: `agent-teams/work/editorial_<topic>.md`
- 原稿: `agent-teams/work/<store_id>_copy.md`
- 画像キュレーション: `agent-teams/work/<store_id>_images.md`
- デザイン提案: `agent-teams/work/design_<topic>.md`
- 監査レポート: `agent-teams/work/audit_<topic>_<date>.md`
- SEO提案: `agent-teams/work/seo_<topic>_<date>.md`
- 分析レポート: `agent-teams/work/analysis_<topic>_<date>.md`
- ログ: `agent-teams/logs/`
- 画像: `public/restaurants/`

## SEO第一弾（推奨実装順）
1. 全店舗に `Restaurant` JSON-LD 埋め込み
2. `app/sitemap.ts` 動的生成
3. `app/robots.ts`
4. シーン別ハブ `/scene/[slug]`
5. OGP画像の動的生成 `opengraph-image.tsx`
6. 店舗 metadata 強化（地域+業種+店名）
7. パンくずリスト + 内部リンク
8. Lighthouse 90点以上維持
