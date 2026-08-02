#!/bin/bash
# マチノワ自動化 実行前ヘルスチェック
#
# 目的: 「環境が壊れているのに1店舗ずつ試して、全部エラーとしてスプシに書き込む」事故を無くす。
#   過去の全エラー197件のうち 153件=claude認証切れ / 32件=ネットワーク断 と、
#   93%が店舗と無関係な環境起因だった。それらをスプシのW列に「エラー」として書くと
#   24時間クールダウンに入り、滞留が候補一覧から消えて「正常」に見えてしまう。
#
# 終了コード:
#   0  = 正常
#   10 = ネットワーク到達不可
#   11 = claude CLI 認証切れ
#
# 使い方: automation/preflight.sh   （local-pipeline.sh から呼ばれる）

set -u

pf_log() { echo "[preflight] $*"; }

# ── 1) ネットワーク疎通 ───────────────────────────────
# スリープ復帰直後は経路が上がりきっておらず EADDRNOTAVAIL が出る（実測32件）。
# 即エラーにせず、合計最大約8分バックオフして待つ。
NET_OK=0
for WAIT in 0 15 30 60 120 240; do
  [ "$WAIT" -gt 0 ] && sleep "$WAIT"
  if curl -sS -o /dev/null -m 15 https://sheets.googleapis.com/ 2>/dev/null \
     || curl -sS -o /dev/null -m 15 https://www.google.com/ 2>/dev/null; then
    NET_OK=1
    [ "$WAIT" -gt 0 ] && pf_log "ネットワーク復帰（${WAIT}秒待機後）"
    break
  fi
  pf_log "ネットワーク未到達 — ${WAIT}秒待って再試行"
done
if [ "$NET_OK" != "1" ]; then
  pf_log "❌ ネットワークに到達できない"
  exit 10
fi
pf_log "✅ ネットワーク疎通OK"

# ── 2) claude CLI 認証 ───────────────────────────────
# 重要: 認証切れでも claude の終了コードは 0 になる（実測）。
#       必ず標準出力の文字列で判定すること。
AUTH_OUT=$(echo 'Reply with exactly: PREFLIGHT_OK' | claude -p --output-format=text 2>&1 | tail -5)
if echo "$AUTH_OUT" | grep -qiE '401|OAuth access token has expired|Failed to authenticate|Not logged in|Invalid authentication'; then
  pf_log "❌ claude CLI の認証が切れている: $(echo "$AUTH_OUT" | head -1)"
  exit 11
fi
if ! echo "$AUTH_OUT" | grep -q 'PREFLIGHT_OK'; then
  pf_log "⚠️  claude CLI の応答が想定外（続行はする）: $(echo "$AUTH_OUT" | head -1)"
fi
pf_log "✅ claude CLI 認証OK"

exit 0
