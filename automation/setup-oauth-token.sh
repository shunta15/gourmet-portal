#!/bin/bash
# 定期実行(launchd)に claude の長期トークンを渡し、認証切れを根絶する。
#
# 背景: 認証情報は macOS キーチェーンにあり、OAuth アクセストークンには期限がある。
#   期限が切れると無人実行は 401 になり（しかも claude の終了コードは 0）、
#   全店舗がエラーになる。実測で全エラー197件中153件がこれだった。
#   長期トークンを環境変数で渡せば、この失敗モードそのものが無くなる。
#
# 使い方:
#   1) claude setup-token          ← ブラウザで認証し、長期トークンが表示される
#   2) bash automation/setup-oauth-token.sh <表示されたトークン>

set -eu

TOKEN="${1:-}"
if [ -z "$TOKEN" ]; then
  echo "使い方: bash automation/setup-oauth-token.sh <トークン>"
  echo ""
  echo "トークンはこれで取得します:"
  echo "    claude setup-token"
  exit 1
fi

LABELS="00jst 08jst 12jst 16jst 20jst"
UID_NUM=$(id -u)
UPDATED=0

for L in $LABELS; do
  PLIST="$HOME/Library/LaunchAgents/com.machinowa.auto.$L.plist"
  [ -f "$PLIST" ] || { echo "⏭️  $PLIST が無いのでスキップ"; continue; }

  # 既存キーがあれば消してから追加（Add は既存キーに失敗するため）
  /usr/libexec/PlistBuddy -c "Delete :EnvironmentVariables:CLAUDE_CODE_OAUTH_TOKEN" "$PLIST" >/dev/null 2>&1 || true
  /usr/libexec/PlistBuddy -c "Add :EnvironmentVariables:CLAUDE_CODE_OAUTH_TOKEN string $TOKEN" "$PLIST"

  launchctl bootout "gui/$UID_NUM/com.machinowa.auto.$L" >/dev/null 2>&1 || true
  launchctl bootstrap "gui/$UID_NUM" "$PLIST"
  echo "✅ com.machinowa.auto.$L に長期トークンを設定して再読み込みしました"
  UPDATED=$((UPDATED + 1))
done

echo ""
echo "設定済み: ${UPDATED}件"
echo "確認: bash automation/preflight.sh   （✅ claude CLI 認証OK と出れば完了）"
