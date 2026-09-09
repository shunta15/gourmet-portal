#!/usr/bin/env bash
# クライアントバンドルに data.ts（店舗・特集記事の全データ）が混入していないかを検査する。
# 2026-09-10: 'use client' でないコンポーネントが client component から import され、
# @/lib/data を経由して 4.6MB のチャンクがブラウザに配信されていた事故の再発防止。
# `npm run build` の postbuild として実行される（Vercel のビルドでも走る）。
set -eo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATIC="$ROOT/.next/static"
[[ -d "$STATIC" ]] || { echo "skip: $STATIC not found"; exit 0; }

fail=0
# 1) データセット固有の文字列（r01 の店名）がクライアントチャンクに存在しないこと
leak=$(grep -rl "鶏居酒屋pao福" "$STATIC" --include='*.js' 2>/dev/null || true)
if [[ -n "$leak" ]]; then
  echo "ERROR: data.ts がクライアントバンドルに混入しています:"; echo "$leak"
  echo "  → 'use client' の（または client から import される）コンポーネントが @/lib/data を import していないか確認。軽い定数・型は @/lib/regions から、データは server page から props で渡す。"
  fail=1
fi
# 2) 1.5MB を超えるクライアントチャンクが無いこと
big=$(find "$STATIC" -name '*.js' -size +1500k 2>/dev/null || true)
if [[ -n "$big" ]]; then
  echo "ERROR: 1.5MB 超のクライアントチャンク:"; ls -la $big
  fail=1
fi
[[ $fail -ne 0 ]] && exit 1
echo "OK: client bundle clean (no dataset leak, no chunk > 1.5MB)"
