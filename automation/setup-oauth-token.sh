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
#   2) bash automation/setup-oauth-token.sh   ← 実行後にプロンプトへ貼り付ける
#
# トークンは引数では受け取らない。引数にするとシェル履歴と `ps` の出力に残るため。
# プロンプト入力なら画面にも履歴にも残らない。

set -eu

if [ "${1:-}" != "" ]; then
  echo "⚠️  トークンは引数で渡さないでください（シェル履歴と ps に残ります）。"
  echo "    引数なしで実行し、プロンプトに貼り付けてください:"
  echo "        bash automation/setup-oauth-token.sh"
  exit 1
fi

echo "claude setup-token で表示された長期トークンを貼り付けて Enter を押してください。"
echo "（入力内容は画面に表示されません）"
printf "トークン: "
IFS= read -rs TOKEN
echo ""

# 前後の空白・改行を落とす（コピペ時に紛れ込みやすい）
TOKEN="${TOKEN#"${TOKEN%%[![:space:]]*}"}"
TOKEN="${TOKEN%"${TOKEN##*[![:space:]]}"}"

if [ -z "$TOKEN" ]; then
  echo "❌ 何も入力されませんでした。中止します。"
  exit 1
fi
echo "✅ トークンを受け取りました（${#TOKEN}文字）"

LABELS="00jst 08jst 12jst 16jst 20jst"
UID_NUM=$(id -u)
UPDATED=0

for L in $LABELS; do
  PLIST="$HOME/Library/LaunchAgents/com.machinowa.auto.$L.plist"
  [ -f "$PLIST" ] || { echo "⏭️  $PLIST が無いのでスキップ"; continue; }

  # 既存キーがあれば消してから追加（Add は既存キーに失敗するため）
  /usr/libexec/PlistBuddy -c "Delete :EnvironmentVariables:CLAUDE_CODE_OAUTH_TOKEN" "$PLIST" >/dev/null 2>&1 || true
  /usr/libexec/PlistBuddy -c "Add :EnvironmentVariables:CLAUDE_CODE_OAUTH_TOKEN string $TOKEN" "$PLIST"

  # plist に平文のトークンが入るので、本人以外が読めないよう権限を締める（既定は644）
  chmod 600 "$PLIST"

  launchctl bootout "gui/$UID_NUM/com.machinowa.auto.$L" >/dev/null 2>&1 || true
  launchctl bootstrap "gui/$UID_NUM" "$PLIST"
  echo "✅ com.machinowa.auto.$L に長期トークンを設定して再読み込みしました"
  UPDATED=$((UPDATED + 1))
done

echo ""
echo "設定済み: ${UPDATED}件"
echo "確認: bash automation/preflight.sh   （✅ claude CLI 認証OK と出れば完了）"
