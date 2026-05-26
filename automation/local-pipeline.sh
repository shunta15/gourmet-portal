#!/bin/bash
# マチノワ自動化 ローカルパイプライン v2
#
# 設計：
# - bash で候補抽出・ロック取得・ビルド検証・git push・スプシ書き戻し
# - claude CLI で「店舗特定・画像取得・記事生成」（=AI が得意な部分）
# - Google Maps cid URL は curl で取れないので、claude に WebSearch / WebFetch で公式情報を探させる

set -u
trap 'echo "[ERROR] line $LINENO" | tee -a "$LOG_FILE"' ERR

REPO="/Users/shunta/claude/gourmet-portal"
LOG_DIR="$HOME/Library/Logs/machinowa-auto"
mkdir -p "$LOG_DIR"

HOUR_LABEL=${1:-"manual"}
NOW=$(date '+%Y%m%d-%H%M%S')
LOG_FILE="$LOG_DIR/$NOW.$HOUR_LABEL.log"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="$HOME/.nvm/versions/node/v22.22.0/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

cd "$REPO"

log() { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG_FILE"; }
notify() { /usr/bin/osascript -e "display notification \"$2\" with title \"$1\""; }

log "============================================================"
log "マチノワ自動化 v2 開始 (label=$HOUR_LABEL)"
log "============================================================"

# === Step 1: 候補抽出 ===
log ""
log "▼ Step 1: 候補抽出"
CANDIDATES_JSON=$(node scripts/sheets-candidates-json.mjs 2>&1) || {
  log "ERROR: 候補抽出失敗: $CANDIDATES_JSON"
  notify "🚨 マチノワ自動化 $HOUR_LABEL" "候補抽出失敗"
  exit 1
}
FEAT_COUNT=$(echo "$CANDIDATES_JSON" | jq -r '.feature | length')
log "feature 未処理: $FEAT_COUNT 件"

if [ "$FEAT_COUNT" -eq 0 ]; then
  log "✅ 候補0件、終了"
  notify "✅ マチノワ自動化 $HOUR_LABEL" "候補0件で正常終了"
  exit 0
fi

# === Step 2: 各候補を claude に丸投げ ===
SUCCESS=0
ERROR=0
SUCCESS_URLS=""
ERROR_LIST=""

MAX=3
PROCESS_LIST=$(echo "$CANDIDATES_JSON" | jq -c ".feature[:$MAX][]")

while IFS= read -r CANDIDATE; do
  [ -z "$CANDIDATE" ] && continue
  ROW=$(echo "$CANDIDATE" | jq -r '.sourceRow')
  NAME=$(echo "$CANDIDATE" | jq -r '.name')
  MAPS_URL=$(echo "$CANDIDATE" | jq -r '.url')

  log ""
  log "──────────────────────────────────────────"
  log "🍽  row $ROW: $NAME"
  log "   Maps: $MAPS_URL"
  log "──────────────────────────────────────────"

  # ロック取得
  log "  ロック取得"
  node scripts/sheets-mark-done.mjs --type=feature --row="$ROW" --status=processing >> "$LOG_FILE" 2>&1 || {
    log "  ⚠️ ロック取得失敗、スキップ"
    continue
  }

  # claude に丸投げするプロンプト
  # heredoc はシングルクォートで bash のパースを無効化
  # 変数は __ROW__ / __NAME__ / __MAPS_URL__ のプレースホルダで埋め、後で置換
  CLAUDE_PROMPT=$(cat <<'PROMPT_EOF'
あなたはマチノワ編集部のライターです。以下の店舗の特集記事を作成して本番に公開してください。

# 店舗情報
- 店舗名: __NAME__
- Google Maps URL: __MAPS_URL__
- スプシ行番号: __ROW__

# 🚨 絶対遵守ルール（ユーザー明言 2026-05-26 / 2026-05-27）
- **スプシ J列の Maps URL が示す店舗が絶対的に正しい**
- **店舗名検索で別店舗を拾うのは絶対禁止**（同名店が複数あっても、Maps URL の店舗だけが正解）
- **手順1の前に必ず Maps URL を WebFetch / Chrome MCP navigate で開いて、リダイレクト先の正式な店舗名・住所・座標を取得すること**
- D列の店舗名は手入力で誤字・別表記の可能性あり。Maps URL が機械的に正しい
- 座標から逆引きして「データ不整合」と判断するのは禁止（過去事故あり：点心厨房 桃花を川崎の店と誤判定）

# 手順（必ず順番に実行・タスク完了まで止まらない）

1. agent-teams/decisions/machinowa-article-spec.md を Read で必ず読む
2. 店舗特定（最重要）:
   - **まず Maps URL を WebFetch で開く**（__MAPS_URL__）。リダイレクト後の URL に `/maps/place/<店舗名>/@<lat>,<lng>/` が含まれているはずなので、そこから正式な店舗名・座標を確定
   - リダイレクトが取れない場合は Chrome MCP の navigate で開いて get_page_text で店舗名・住所を取得
   - **Maps URL から取れた店舗名と D列店舗名が違っても、Maps URL の店舗を採用する**
   - その後、確定した店舗名 + 住所で公式サイト / 食べログ / ホットペッパー等を WebSearch して詳細情報を取得（推測禁止、必ず公式情報から）
3. 画像取得（重要）: 以下の優先順で画像URL2枚を見つける
   - 公式ホームページ（WebSearch で店舗名+公式 → WebFetch で HTML → img タグ抽出）
   - 公式 Instagram
   - 食べログ・ホットペッパー・ぐるなび等の店舗ページ
   見つけた画像URLを Bash の curl で download:
     mkdir -p public/restaurants/teleapo-__NAME__
     curl --max-time 30 -o public/restaurants/teleapo-__NAME__/hero.jpg URL1
     curl --max-time 30 -o public/restaurants/teleapo-__NAME__/point2.jpg URL2
   各画像が 20KB 以上 + JPEG/PNG であることを file コマンドと wc -c で確認
   失敗したら:
     rm -rf public/restaurants/teleapo-__NAME__
     node scripts/sheets-mark-done.mjs --type=feature --row=__ROW__ --status=error --reason=画像取得失敗
4. 記事生成: spec.md §1〜13 厳守で本文 3000字以上、文中で半角ダブルクォート禁止（日本語の「」を使う）、id は __NAME__ のみ
   lib/teleapo-features.ts の末尾 }; 直前に TypeScript object として Edit ツールで追記
5. ビルド: npm run build を Bash で実行。失敗したら:
     git checkout -- lib/teleapo-features.ts
     rm -rf public/restaurants/teleapo-__NAME__
     node scripts/sheets-mark-done.mjs --type=feature --row=__ROW__ --status=error --reason=ビルド失敗
6. 禁止語 grep: パターン（素朴|派手さはない|奇をてらった.*ではない|日本一|絶品|最高の|呼び込み）を lib/teleapo-features.ts に grep。ヒットしたら:
     git checkout -- lib/teleapo-features.ts
     rm -rf public/restaurants/teleapo-__NAME__
     node scripts/sheets-mark-done.mjs --type=feature --row=__ROW__ --status=permanent_error --reason=禁止語含む
7. commit & push:
     git add lib/teleapo-features.ts public/restaurants/teleapo-__NAME__/
     git commit -m feat(teleapo)記事を自動生成
     git pull --rebase origin main
     git push origin main
   push 失敗時:
     git reset --hard HEAD~1
     rm -rf public/restaurants/teleapo-__NAME__
     node scripts/sheets-mark-done.mjs --type=feature --row=__ROW__ --status=error --reason=git push失敗
8. スプシ書き戻し:
     node scripts/sheets-mark-done.mjs --type=feature --row=__ROW__ --url=https://machinowa.tokyo/feature/__NAME__

# 絶対厳守
- 場所推測禁止（必ず公式情報から）
- 画像は実店舗のもののみ（Unsplash 等の汎用画像 NG）
- 文中で半角ダブルクォートを使わない（日本語の「」を使う）
- author 固定 マチノワ編集部
- id は __NAME__ のみ（注釈や接頭辞禁止）

# 完了
全ステップ完了したら「COMPLETED row __ROW__ URL: <生成URL or 失敗理由>」と1行出力して終了。
タスクが完了するまで停止しない。複数の Bash ツール呼び出しが必要。
PROMPT_EOF
)

  # プレースホルダ → 実値 置換
  CLAUDE_PROMPT="${CLAUDE_PROMPT//__ROW__/$ROW}"
  CLAUDE_PROMPT="${CLAUDE_PROMPT//__NAME__/$NAME}"
  CLAUDE_PROMPT="${CLAUDE_PROMPT//__MAPS_URL__/$MAPS_URL}"

  log "  claude CLI 起動..."
  CLAUDE_LOG="$LOG_DIR/$NOW.row$ROW.claude.log"
  echo "$CLAUDE_PROMPT" | claude -p --output-format=text --permission-mode=bypassPermissions --effort high > "$CLAUDE_LOG" 2>&1
  CLAUDE_EXIT=$?
  log "  claude 終了 exit=$CLAUDE_EXIT"
  log "  詳細ログ: $CLAUDE_LOG"

  # claude の最終出力から結果判定
  FINAL_LINE=$(grep -oE '✅ COMPLETED [^\\]+' "$CLAUDE_LOG" | tail -1)
  if [ -n "$FINAL_LINE" ]; then
    log "  $FINAL_LINE"
    if echo "$FINAL_LINE" | grep -q "https://"; then
      SUCCESS=$((SUCCESS+1))
      URL=$(echo "$FINAL_LINE" | grep -oE 'https://[^ ]+' | head -1)
      SUCCESS_URLS="$SUCCESS_URLS\n  - $NAME: $URL"
    else
      ERROR=$((ERROR+1))
      ERROR_LIST="$ERROR_LIST\n  - $NAME: $FINAL_LINE"
    fi
  else
    log "  ⚠️ claude が完了マーカー出さずに終了"
    log "  claude 出力末尾:"
    tail -20 "$CLAUDE_LOG" | sed 's/^/    /' | tee -a "$LOG_FILE"
    ERROR=$((ERROR+1))
    ERROR_LIST="$ERROR_LIST\n  - $NAME: claude 早期終了"
  fi

  sleep 5
done <<< "$PROCESS_LIST"

log ""
log "============================================================"
log "完了サマリ: 成功 $SUCCESS / エラー $ERROR"
[ -n "$SUCCESS_URLS" ] && log "成功URL:$SUCCESS_URLS"
[ -n "$ERROR_LIST" ] && log "エラー:$ERROR_LIST"
log "============================================================"

if [ $SUCCESS -gt 0 ]; then
  notify "✅ マチノワ自動化 $HOUR_LABEL" "成功 $SUCCESS件 / エラー $ERROR件"
else
  notify "⚠️ マチノワ自動化 $HOUR_LABEL" "全件エラー $ERROR件"
fi

find "$LOG_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null
exit 0
