@AGENTS.md

# マチノワ運用チーム

このプロジェクトは8名のエージェントチームで運用しています。

## チーム構成

| エージェント | 責務 |
|---|---|
| **machinowa-manager** | 統括・タスク振り分け・ユーザー窓口・最終承認 |
| **machinowa-researcher** | 店舗情報・口コミ・画像URL収集 |
| **machinowa-writer** | 紹介文・本文・特集記事執筆 |
| **machinowa-photo-curator** | 画像取得・選定・heroImages/gallery編成 |
| **machinowa-designer** | UI/CSS/タイポ/レスポンシブ |
| **machinowa-builder** | data.ts更新・実装・ビルド・デプロイ |
| **machinowa-auditor** | 事実監査・デザイン監査・本番確認 |
| **machinowa-seo** | メタ/OGP/構造化データ/タグ戦略 |

## ユーザー窓口
**ユーザーは manager とのみ会話**。manager が各エージェントに振り分ける。

## 標準ワークフロー（新店舗追加）
```
researcher → writer + photo-curator（並列）
           → builder → auditor + seo（並列）
           → builder（最終デプロイ）→ manager 報告
```

## 標準ワークフロー（UI改善）
```
designer → builder → auditor → manager
```

## 重要な運用ルール
1. **店舗追加はユーザーから明示指示があった時のみ**実施。勝手に増やさない
2. 事実情報のみを掲載（誇張・推測・虚偽禁止）
3. 評価値（★）は出典明記、または非掲載
4. 食べログの文章直接コピペは ToS 違反のため禁止
5. 画像の出典を必ず把握
6. **コード変更→commit→push→deploy→本番確認**まで完了させる
7. 全エージェントは作業ログを `agent-teams/logs/` に保存

## 作業ディレクトリ
- リサーチ: `agent-teams/research/<store_id>.md`
- ワーク: `agent-teams/work/`
- ログ: `agent-teams/logs/`
- 画像: `public/restaurants/`
