#!/bin/bash
# マチノワ自動化 ローカル実行スクリプト
# 用途: launchd から 10:00 / 15:00 / 20:00 JST に呼ばれて、claude CLI 経由で記事生成を回す
#
# CCR (Anthropic クラウド) で sa.json 認証が失敗する問題への対策として、
# ローカル PC で同じパイプラインを動かす。Mac が起動していれば確実に動く。

set -u
trap 'echo "[ERROR] line $LINENO: command failed"' ERR

REPO="/Users/shunta/claude/gourmet-portal"
PROMPT_FILE="$REPO/automation/local-prompt.md"
LOG_DIR="$HOME/Library/Logs/machinowa-auto"
mkdir -p "$LOG_DIR"

NOW=$(date '+%Y%m%d-%H%M%S')
LOG_FILE="$LOG_DIR/$NOW.log"
HOUR_LABEL=${1:-"manual"}  # 第1引数で時刻ラベル "10jst" "15jst" "20jst" "manual"

# nvm を読み込んで node / claude を使えるようにする
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# PATH に claude を含むディレクトリを追加
export PATH="$HOME/.nvm/versions/node/v22.22.0/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

cd "$REPO"

{
  echo "============================================================"
  echo "マチノワ自動化 開始: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "ラベル: $HOUR_LABEL"
  echo "CWD: $(pwd)"
  echo "claude: $(which claude) ($(claude --version 2>&1 | head -1))"
  echo "node: $(which node) ($(node --version 2>&1))"
  echo "============================================================"
} | tee -a "$LOG_FILE"

# claude CLI 非対話モードでプロンプト実行
# --output-format=text: 人間が読める形式
# --permission-mode=bypassPermissions: ツール許可ダイアログを出さない (launchd は対話不可)
PROMPT=$(cat "$PROMPT_FILE")
echo "" >> "$LOG_FILE"
echo "▼▼▼ claude CLI 実行開始 ▼▼▼" >> "$LOG_FILE"

set +e
echo "$PROMPT" | claude -p --output-format=text --permission-mode=bypassPermissions 2>&1 | tee -a "$LOG_FILE"
EXIT_CODE=${PIPESTATUS[0]}
set -e

echo "" >> "$LOG_FILE"
echo "▲▲▲ claude CLI 終了 (exit $EXIT_CODE) ▲▲▲" >> "$LOG_FILE"

{
  echo ""
  echo "============================================================"
  echo "マチノワ自動化 終了: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "exit code: $EXIT_CODE"
  echo "log: $LOG_FILE"
  echo "============================================================"
} | tee -a "$LOG_FILE"

# 結果から処理件数を抽出（ログ末尾の「処理: 成功X / エラーY」を探す）
SUMMARY=$(grep -oE "処理: 成功[0-9]+件? / エラー[0-9]+件?" "$LOG_FILE" | tail -1)
[ -z "$SUMMARY" ] && SUMMARY="（実行ログ要確認）"

# macOS 通知を表示
if [ $EXIT_CODE -eq 0 ]; then
  /usr/bin/osascript -e "display notification \"${SUMMARY}\" with title \"✅ マチノワ自動化 ${HOUR_LABEL}\""
else
  /usr/bin/osascript -e "display notification \"exit ${EXIT_CODE} ログ確認してください\" with title \"🚨 マチノワ自動化 ${HOUR_LABEL}\""
fi

# 過去30日より古いログを削除
find "$LOG_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null

exit $EXIT_CODE
