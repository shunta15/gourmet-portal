# マチノワ自動化 ローカル実行セットアップ

CCR (Anthropic クラウド routine) の sa.json JWT 認証失敗が再発する問題への対策として、
ローカル Mac の launchd で同じパイプラインを動かす。

## 構成

```
automation/
├── local-prompt.md          ← claude CLI に渡すプロンプト（sa.json はローカル直参照）
├── local-run.sh             ← bash wrapper（claude CLI 起動 + macOS 通知）
├── launchd/
│   ├── com.machinowa.auto.10jst.plist
│   ├── com.machinowa.auto.15jst.plist
│   └── com.machinowa.auto.20jst.plist
└── secrets/
    └── sa.json              ← Google サービスアカウント鍵（既にローカルに配置済）
```

## インストール（既に完了済の場合は不要）

```bash
# 1. plist をシステム location にコピー
cp automation/launchd/com.machinowa.auto.*.plist ~/Library/LaunchAgents/

# 2. launchd に登録
UID_NUM=$(id -u)
for hr in 10 15 20; do
  launchctl bootout gui/$UID_NUM ~/Library/LaunchAgents/com.machinowa.auto.${hr}jst.plist 2>/dev/null
  launchctl bootstrap gui/$UID_NUM ~/Library/LaunchAgents/com.machinowa.auto.${hr}jst.plist
done

# 3. 登録確認
launchctl list | grep machinowa
```

## 動作

- **10:00 / 15:00 / 20:00 JST** に launchd が `automation/local-run.sh` を起動
- `local-run.sh` が `claude CLI` を非対話モード (`-p`) で起動
- claude が `automation/local-prompt.md` の指示通り：
  1. spec.md / runbook.md を読む
  2. 詰めOKリスト row 146+ から候補抽出
  3. 最大3件処理（GBP取得 → 画像 → 記事生成 → ビルド → push → スプシ書き戻し）
- 完了後 macOS 通知（osascript）で結果表示
- ログは `~/Library/Logs/machinowa-auto/` に蓄積

## 重要な前提

- **Mac が起動している必要がある**（スリープでも launchd は wakeup する設定可能だが今は未対応）
- ログイン中ユーザーで動く（=ファイル権限 OK）
- `~/.nvm/versions/node/v22.22.0/bin` の node / claude を使う

## 手動実行（テスト）

```bash
# 即時実行（ログは ~/Library/Logs/machinowa-auto/<時刻>.log）
./automation/local-run.sh manual-test

# launchctl 経由で即時起動
launchctl kickstart gui/$(id -u)/com.machinowa.auto.10jst
```

## 停止 / 再有効化

```bash
# 停止（無効化）
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.machinowa.auto.10jst.plist

# 全部停止
for hr in 10 15 20; do
  launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.machinowa.auto.${hr}jst.plist
done

# 再有効化
for hr in 10 15 20; do
  launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.machinowa.auto.${hr}jst.plist
done
```

## CCR との関係

- CCR (claude.ai routine) も並行稼働している（10:00 / 15:00 / 20:00 JST）
- 両方が同時に動いても問題ない設計（mark-done が冪等保護あり、ロック方式で race 防止）
- どちらかが成功すれば OK
- CCR が sa.json JWT 認証で失敗していた場合でも、ローカルがバックアップとして動く

## ログ確認

```bash
# 最新ログ
ls -t ~/Library/Logs/machinowa-auto/ | head -5
tail -50 ~/Library/Logs/machinowa-auto/$(ls -t ~/Library/Logs/machinowa-auto/ | head -1)

# 直近 3 日分の実行履歴
ls -lt ~/Library/Logs/machinowa-auto/ | head -10
```

## トラブルシューティング

- **launchctl bootstrap でエラー**: 既に同名 plist がロード済 → `bootout` してから `bootstrap`
- **claude CLI not found**: PATH に nvm 配下 (`~/.nvm/versions/node/v22.22.0/bin`) が含まれていない → plist の `EnvironmentVariables` の PATH を確認
- **sa.json 認証失敗**: `automation/secrets/sa.json` が存在するか、新規発行が必要か確認
- **記事が生成されない**: ログ確認 → 詰めOKリスト row 146+ に候補があるか、claude CLI が完走したか
