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
#   推奨: bash automation/setup-oauth-token.sh --new
#     → スクリプトが claude setup-token を直接実行してトークンを受け取る。
#       コピー＆ペーストが一切不要（コマンドをコピーした時点でクリップボードが
#       上書きされてトークンが消える、という詰みを回避するため）。
#   代替: bash automation/setup-oauth-token.sh --clipboard   ← クリップボードから読む
#         bash automation/setup-oauth-token.sh               ← プロンプトに貼り付ける
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
  --new)
    # claude setup-token を自分で起動して、その出力から直接トークンを取る。
    # 人間がトークンをコピーする工程が無いので、クリップボード事故が起きない。
    echo "🔐 claude setup-token を起動します。ブラウザで承認してください。"
    echo "────────────────────────────────────────────"
    if [ -t 1 ] && [ -e /dev/tty ]; then
      RAW=$(claude setup-token 2>&1 | tee /dev/tty)
    else
      RAW=$(claude setup-token 2>&1)
      printf '%s\n' "$RAW"
    fi
    echo "────────────────────────────────────────────"
    TOKEN="$RAW"
    if ! printf '%s' "$RAW" | tr -d '[:space:]' | grep -q 'sk-ant-'; then
      echo "❌ 出力からトークンを見つけられませんでした。"
      echo "   画面にトークンが表示されている場合は、その行をコピーしてから"
      echo "   もう一度このコマンドを --clipboard 付きで実行してください。"
      exit 1
    fi
    ;;
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
    echo "    次のいずれかを実行してください:"
    echo "        bash automation/setup-oauth-token.sh --new        ← 推奨（コピー不要）"
    echo "        bash automation/setup-oauth-token.sh --clipboard"
    echo "        bash automation/setup-oauth-token.sh"
    exit 1
    ;;
esac

# ── 候補生成 ─────────────────────────────────────────
# 抽出を1パターンに賭けると、外れた瞬間に失敗する（実際に外して130文字の
# 巻き込みが起きた）。切り出し方を複数用意し、後段で「実際に認証が通ったもの」
# を採用する。取りこぼしより取りすぎのほうが安全。
CAND_FILE=$(mktemp)
trap 'rm -f "$CAND_FILE"' EXIT

{
  # (1) 行そのものがトークン（パイプ取得なら折り返しが入らないので最有力）
  printf '%s\n' "$TOKEN" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//' \
    | grep -E '^sk-ant-[A-Za-z0-9_-]+$' || true
  # (2) 行内から切り出し（行頭に「Token:」等が付くケース）
  printf '%s\n' "$TOKEN" | grep -oE 'sk-ant-[A-Za-z0-9_-]+' || true
  # (3) 空白を全除去してから切り出し（ターミナル折り返しで改行が混入したケース）
  printf '%s' "$TOKEN" | tr -d '[:space:]' | grep -oE 'sk-ant-[A-Za-z0-9_-]+' || true
  # (4) 何も一致しない場合の最後の手段
  printf '%s' "$TOKEN" | tr -d '[:space:]'
} 2>/dev/null | awk 'length($0) >= 20' | awk '!seen[$0]++' > "$CAND_FILE"

CAND_COUNT=$(wc -l < "$CAND_FILE" | tr -d ' ')
if [ "${CAND_COUNT:-0}" -eq 0 ]; then
  echo "❌ トークンらしき文字列を取り出せませんでした。書き込みは行いません。"
  exit 1
fi
echo "🔎 候補を ${CAND_COUNT}通り の切り出し方で用意しました"

# ── 実際に認証が通る候補だけを採用する ────────────────
# launchd と同じ「クリーンな環境 + その候補だけ」で claude を1回呼ぶ。
# 通らない値は絶対に plist に書かない（壊れた値で全ジョブを潰さないため）。
verify_token() {
  local T="$1" OUT
  OUT=$(echo 'Reply with exactly: TOKEN_OK' | env -i \
    PATH="$PATH" HOME="$HOME" LANG="ja_JP.UTF-8" \
    CLAUDE_CODE_OAUTH_TOKEN="$T" \
    claude -p --output-format=text 2>&1 | tail -5)
  VERIFY_MSG=$(printf '%s' "$OUT" | head -1)
  if printf '%s' "$OUT" | grep -qiE '401|403|expired|Failed to authenticate|Not logged in|Invalid|Unauthorized'; then
    return 1
  fi
  return 0
}

TOKEN=""
N=0
while IFS= read -r C; do
  [ -z "$C" ] && continue
  N=$((N + 1))
  echo "🔍 候補 ${N}/${CAND_COUNT} を検証中（${#C}文字 / 先頭 $(printf '%.12s' "$C")… / 末尾 …$(printf '%s' "$C" | tail -c 6)）"
  if verify_token "$C"; then
    TOKEN="$C"
    echo "   ✅ この候補で認証できました"
    break
  fi
  echo "   ✗ 不可: $VERIFY_MSG"
done < "$CAND_FILE"

if [ -z "$TOKEN" ]; then
  echo ""
  echo "❌ どの候補でも認証できませんでした。plist には一切書き込んでいません。"
  echo "   考えられる原因: 発行したトークンが既に無効 / 取得した出力にトークンが含まれていない"
  echo "   claude setup-token で発行し直してから、もう一度 --new でお試しください。"
  exit 1
fi
echo "✅ 認証成功を確認しました。plist に書き込みます"

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
