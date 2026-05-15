#!/usr/bin/env bash
# 全ての画像参照（外部URLとローカルパス）が 200 / 実在するかを検査する。
# 1つでも 404 があれば exit 1。pre-commit / CI から呼ばれる。
# macOS の bash 3.2 でも動くように mapfile/連想配列を使わない。
set -eo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LIB_DIR="$ROOT/lib"
PUBLIC_DIR="$ROOT/public"

if [[ ! -d "$LIB_DIR" ]]; then
  echo "ERROR: $LIB_DIR not found"
  exit 1
fi

fail=0

# 1) 外部画像URL（拡張子付き or images.unsplash.com）の疎通確認
# data.ts 単独ではなく lib/ 配下を全部 scan する。import 元の
# newGuideFeatures*.ts や curatedFeatures.ts の URL も対象にする。
remote_urls=$( {
  grep -rEho 'https?://[a-zA-Z0-9./?&=_:%~+\-]+\.(jpg|jpeg|png|webp|gif|avif|svg)(\?[^"]*)?' "$LIB_DIR" 2>/dev/null || true
  grep -rEho 'https://images\.unsplash\.com/photo-[a-z0-9-]+(\?[^"]*)?' "$LIB_DIR" 2>/dev/null || true
} | sort -u )

if [[ -n "$remote_urls" ]]; then
  echo "[1/2] checking remote image URLs..."
  while IFS= read -r url; do
    [[ -z "$url" ]] && continue
    # 1回目で 429/503 (Wikimedia rate-limit) なら待ってから 2回目を試す
    code=$(curl -s -o /dev/null -w "%{http_code}" -A "Mozilla/5.0 (compatible; MachinowaBot/1.0)" --max-time 10 "$url" 2>/dev/null || echo "000")
    if [[ "$code" == "429" || "$code" == "503" ]]; then
      sleep 4
      code=$(curl -s -o /dev/null -w "%{http_code}" -A "Mozilla/5.0 (compatible; MachinowaBot/1.0)" --max-time 10 "$url" 2>/dev/null || echo "000")
    fi
    if [[ "$code" == "429" || "$code" == "503" ]]; then
      sleep 8
      code=$(curl -s -o /dev/null -w "%{http_code}" -A "Mozilla/5.0 (compatible; MachinowaBot/1.0)" --max-time 10 "$url" 2>/dev/null || echo "000")
    fi
    if [[ "$code" != "200" ]]; then
      echo "  NG  $code  $url"
      fail=1
    fi
  done <<< "$remote_urls"
fi

# 2) ローカル画像パス（"/xxx/...拡張子"）が public 配下に実在するか
local_paths=$(grep -rEho '"/[a-zA-Z0-9_\-]+/[a-zA-Z0-9_./\-]+\.(jpg|jpeg|png|webp|gif|avif|svg)"' "$LIB_DIR" 2>/dev/null | tr -d '"' | sort -u || true)

if [[ -n "$local_paths" ]]; then
  echo "[2/2] checking local image paths..."
  while IFS= read -r p; do
    [[ -z "$p" ]] && continue
    if [[ ! -f "$PUBLIC_DIR$p" ]]; then
      echo "  NG  missing  $p (expected at public$p)"
      fail=1
    fi
  done <<< "$local_paths"
fi

if [[ $fail -ne 0 ]]; then
  echo ""
  echo "ERROR: 1つ以上の画像URL/パスが無効です。data.ts のコミットを中止します。"
  echo "  - 外部URL: 該当URLを差し替え（curl -I で200確認）"
  echo "  - ローカル: public 配下にファイルを置くか、パスを修正"
  exit 1
fi

echo "OK: all image URLs/paths reachable."
