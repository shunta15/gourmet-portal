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
#   2) トークンをコピーした状態で:
#        bash automation/setup-oauth-token.sh --clipboard   ← 推奨。クリップボードから直接読む
#      うまくいかない場合:
#        bash automation/setup-oauth-token.sh               ← プロンプトに貼り付ける
#   取り消す場合:
#        bash automation/setup-oauth-token.sh --remove
#
# トークンは引数では受け取らない。引数にするとシェル履歴と `ps` の出力に残るため。

set -eu

LABELS="00jst 08jst 12jst 16jst 20jst"
UID_NUM=$(id -u)
MODE="${1:-prompt}"

reload_job() {
  local L="$1" PLIST="$2"
  launchctl bootout "gui/$UID_NUM/com.machinowa.auto.$L" >/dev/null 2>&1 || true
  launchctl bootstrap "gui/$UID_NUM" "$PLIST"
}

# ── 取り消し ─────────────────────────────────────────
if [ "$MODE" = "--remove" ]; then
  for L in $LABELS; do
    PLIST="$HOME/Library/LaunchAgents/com.machinowa.auto.$L.plist"
    [ -f "$PLIST" ] || continue
    /usr/libexec/PlistBuddy -c "Delete :EnvironmentVariables:CLAUDE_CODE_OAUTH_TOKEN" "$PLIST" >/dev/null 2>&1 || true
    reload_job "$L" "$PLIST"
    echo "🧹 com.machinowa.auto.$L から長期トークンを削除しました（キーチェーン認証に戻ります）"
  done
  exit 0
fi

# ── トークン取得 ─────────────────────────────────────
case "$MODE" in
  --clipboard)
    command -v pbpaste >/dev/null 2>&1 || { echo "❌ pbpaste が見つかりません"; exit 1; }
    TOKEN=$(pbpaste)
    echo "📋 クリップボードから読み取りました"
    ;;
  prompt)
    echo "claude setup-token で表示された長期トークンを貼り付けて Enter を押してください。"
    echo "（入力内容は画面に表示されません）"
    printf "トークン: "
    IFS= read -rs TOKEN
    echo ""
    ;;
  *)
    echo "⚠️  トークンは引数で渡さないでください（シェル履歴と ps に残ります）。"
    echo "    トークンをコピーした状態で、次のどちらかを実行してください:"
    echo "        bash automation/setup-oauth-token.sh --clipboard"
    echo "        bash automation/setup-oauth-token.sh"
    exit 1
    ;;
esac

# 前後の空白・改行を落とす（コピペ時に紛れ込みやすい）
TOKEN="${TOKEN#"${TOKEN%%[![:space:]]*}"}"
TOKEN="${TOKEN%"${TOKEN##*[![:space:]]}"}"

# ── 妥当性チェック ───────────────────────────────────
# 壊れた値を書き込むと、キーチェーンの正常な認証まで上書きして全滅するので必ず弾く。
# （実際に2文字だけ入って5ジョブ全部に書かれた事故があった）
if [ -z "$TOKEN" ]; then
  echo "❌ 何も取得できませんでした。書き込みは行いません。"
  exit 1
fi
if [ "${#TOKEN}" -lt 20 ]; then
  echo "❌ ${#TOKEN}文字しかありません。貼り付けが効いていない可能性が高いです。書き込みは行いません。"
  echo "   もう一度トークンをコピーしてから、--clipboard で実行してください。"
  exit 1
fi
case "$TOKEN" in
  *[[:space:]]*)
    echo "❌ 空白や改行が含まれています。トークンだけをコピーし直してください。書き込みは行いません。"
    exit 1
    ;;
esac
echo "✅ トークンを受け取りました（${#TOKEN}文字 / 先頭: $(printf '%.8s' "$TOKEN")…）"

# ── 書き込み ─────────────────────────────────────────
UPDATED=0
for L in $LABELS; do
  PLIST="$HOME/Library/LaunchAgents/com.machinowa.auto.$L.plist"
  [ -f "$PLIST" ] || { echo "⏭️  $PLIST が無いのでスキップ"; continue; }

  # 既存キーがあれば消してから追加（Add は既存キーに失敗するため）
  /usr/libexec/PlistBuddy -c "Delete :EnvironmentVariables:CLAUDE_CODE_OAUTH_TOKEN" "$PLIST" >/dev/null 2>&1 || true
  /usr/libexec/PlistBuddy -c "Add :EnvironmentVariables:CLAUDE_CODE_OAUTH_TOKEN string $TOKEN" "$PLIST"

  # plist に平文のトークンが入るので、本人以外が読めないよう権限を締める（既定は644）
  chmod 600 "$PLIST"

  reload_job "$L" "$PLIST"
  echo "✅ com.machinowa.auto.$L に長期トークンを設定して再読み込みしました"
  UPDATED=$((UPDATED + 1))
done

echo ""
echo "設定済み: ${UPDATED}件"
echo "確認: bash automation/preflight.sh   （✅ claude CLI 認証OK と出れば完了）"
