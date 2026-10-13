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

# ロケールを UTF-8 に固定（変数直後の日本語でbashが変数名を誤認する事故の保険）
export LANG="ja_JP.UTF-8"
export LC_ALL="ja_JP.UTF-8"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="$HOME/.nvm/versions/node/v22.22.0/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

cd "$REPO"

log() { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG_FILE"; }
notify() { /usr/bin/osascript -e "display notification \"$2\" with title \"$1\""; }

# Unicode 正規化(NFC)。記事ID・店名・URL を「作る所」と「比べる所」で必ず通す。
# Google マップ由来の店名は「e + 結合文字(U+0302)」のような NFD で届くことがあり、そのまま
# 記事ID(SAFE_NAME)にすると、claude が書く NFC の記事ID・台帳・反映確認のURLと別物になる。
# 実害(2026-10-09〜13): French Restaurant rêve が毎回「偽エントリ」判定で候補に戻り、
# claude を約7分動かし何も変えずに vercel --prod → 反映確認が NFD の URL で404 → 「反映失敗」。
# stdin 経由にしているのは、先頭が - の店名を node がオプションと誤認しないため。
to_nfc() {
  local out
  out=$(printf '%s' "$1" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>process.stdout.write(d.normalize("NFC")))' 2>/dev/null) || out=""
  if [ -n "$out" ]; then printf '%s' "$out"; else printf '%s' "$1"; fi
}

# 生成した記事の文を、型 R/A/B/C/D/E（spec.md §14-0）で機械的に調べる。読むだけ（何も書き換えない・commit しない）。
# 直す役は claude（プロンプトの手順 4b。--fix で落としてよい文を取る）。ここは「直したはず」を成果物で確かめる後検査で、
# 当たりが残っていればログと通知に出す。公開済みの記事は触らない（人の手直し待ち）。
SENTENCE_LEFT=""
check_sentences() {
  local id="$1"
  if node scripts/check-article-sentences.mjs "$id" >> "$LOG_FILE" 2>&1; then
    log "  ✅ 文の検査: 型R/A/B/C/D/Eに当たる文なし ($id)"
  else
    SENTENCE_LEFT="$SENTENCE_LEFT $id"
    log "  ⚠️ 文の検査: 型R/A/B/C/D/Eの文が残っている ($id) — 上のログ参照。要手直し"
  fi
}

log "============================================================"
log "マチノワ自動化 v2 開始 (label=$HOUR_LABEL)"
log "============================================================"

ALERT_FILE="$REPO/automation/HEALTH-ALERT.md"

# === Step -1: 実行前ヘルスチェック（環境が壊れていたら1行も触らずに撤退） ===
# 過去エラー197件のうち153件=認証切れ / 32件=ネットワーク断。
# これらを店舗ごとの「エラー」としてスプシに書くと24hクールダウンで滞留が見えなくなる。
log ""
log "▼ Step -1: 実行前ヘルスチェック"
bash "$REPO/automation/preflight.sh" 2>&1 | tee -a "$LOG_FILE"
PREFLIGHT_EXIT=${PIPESTATUS[0]}

if [ "$PREFLIGHT_EXIT" = "11" ]; then
  log "❌ claude CLI の認証が切れている。スプシには一切書かずに終了する。"
  cat > "$ALERT_FILE" <<ALERT_EOF
# 🚨 マチノワ自動化が止まっています

**検知時刻**: $(date '+%Y-%m-%d %H:%M') JST（$HOUR_LABEL の実行）

**原因**: claude CLI の認証トークンが期限切れです。

**復旧手順**（ターミナルで1回だけ実行すれば以後切れません）:

    claude setup-token

表示された長期トークンをコピーして、続けて次を実行してください:

    bash automation/setup-oauth-token.sh <コピーしたトークン>

これで定期実行（launchd の com.machinowa.auto.* 全ジョブ）に長期トークンが渡り、認証切れは起きなくなります。

※ このファイルは認証が回復すると自動で削除されます。
ALERT_EOF
  notify "🚨 マチノワ自動化 停止中" "claude認証切れ。ターミナルで claude setup-token を実行してください"
  exit 11
fi

if [ "$PREFLIGHT_EXIT" = "10" ]; then
  log "❌ ネットワークに到達できない。スプシには一切書かずに終了する（次回の定期実行で再挑戦）。"
  notify "⚠️ マチノワ自動化 スキップ" "ネットワーク未到達のため今回はスキップしました"
  exit 10
fi

# ヘルスチェックを通ったのでアラートは解除
[ -f "$ALERT_FILE" ] && rm -f "$ALERT_FILE" && log "  ✅ 過去のヘルスアラートを解除"

# === Step 0: 処理済み台帳を再構築（IMPORTRANGE 行ズレ対策の自己修復） ===
# teleapo-features.ts（生成済みの確定記録）+ スプシの cid から台帳を作り直す。
# 以降の候補抽出は行番号でなく cid・店名で重複判定するため、行がズレても破綻しない。
log ""
log "▼ Step 0: 処理済み台帳 再構築"
node scripts/reconcile-ledger.mjs >> "$LOG_FILE" 2>&1 || log "  ⚠️ 台帳再構築に失敗（既存台帳で続行）"

# 台帳の偽エントリ（記事が実在しないのに「生成済み」判定される行）を除去。
# これを放置すると、その店舗は候補一覧から永久に消えて誰も気づけない。
node automation/ledger-audit.mjs 2>&1 | tee -a "$LOG_FILE" || log "  ⚠️ 台帳監査に失敗（続行）"

# === Step 0.5: スプシ表示の再同期（行ズレで剥がれた 済/URL を貼り直す） ===
# IMPORTRANGE で行がズレると生成済みの店から W=済/X=URL が剥がれ、
# シート上「記事できてない」ように見える。台帳に合わせて毎回貼り直す。
log "▼ Step 0.5: スプシ 済/URL 再同期"
node scripts/sheets-sync-status.mjs >> "$LOG_FILE" 2>&1 || log "  ⚠️ 済/URL 再同期に失敗（続行）"

# === Step 0.6: 記事台帳の同期（詰めOKリストのS/T/U列の供給源） ===
# 詰めOKリストの S(済) / T(表示用URL) / U(コピー用URL) は、各行が自分のA列(顧客管理ID)で
# 「記事台帳」を引く数式。ここを最新化しておけば行がどう並び替わってもズレない。
log "▼ Step 0.6: 記事台帳 同期"
node automation/sync-article-ledger.mjs --apply >> "$LOG_FILE" 2>&1 || log "  ⚠️ 記事台帳の同期に失敗（続行）"

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
  # 「候補0件」は「全部作り終えた」の証拠にならない（クールダウン・ロック・台帳偽エントリで
  # 隠れることがある）。必ず全数照合して、本当に未処理ゼロかを確かめる。
  log "候補0件 — 全数照合で裏を取る"
  if node scripts/health-report.mjs 2>&1 | tee -a "$LOG_FILE"; then
    log "✅ 未処理0件を全数照合で確認。正常終了"
    notify "✅ マチノワ自動化 $HOUR_LABEL" "未処理0件（全数照合で確認）"
    exit 0
  fi
  log "🚨 候補は0件だが、詰めOKなのに記事が無い行が残っている（上の一覧を参照）"
  notify "🚨 マチノワ自動化 $HOUR_LABEL" "候補0件だが未処理の店舗が残っています。ログを確認してください"
  exit 3
fi

# === Step 2: 各候補を claude に丸投げ ===
SUCCESS=0
ERROR=0
ENV_FAILURE=0
SUCCESS_URLS=""
SUCCESS_URL_LIST=""  # 検証用: URLのみ改行区切り
ERROR_LIST=""

MAX=${MAX_CANDIDATES:-10}
# 環境変数 TARGET_ROW=N で特定行のみ処理（手動修復用、URL欠落の救出に使う）
# ※ set -u 下では未設定参照でスクリプトが落ちるため、必ずデフォルト空で展開すること。
#    （これが無く、定期実行が Step2 直前で毎回クラッシュしていた）
TARGET_ROW="${TARGET_ROW:-}"
if [ -n "$TARGET_ROW" ]; then
  log "🎯 TARGET_ROW=$TARGET_ROW 指定 → その行のみ処理"
  PROCESS_LIST=$(echo "$CANDIDATES_JSON" | jq -c ".feature[] | select(.sourceRow == $TARGET_ROW)")
  if [ -z "$PROCESS_LIST" ]; then
    log "❌ TARGET_ROW=$TARGET_ROW が候補に含まれない（P=詰めOK & W=空 でないか、MIN_SOURCE_ROW未満）"
    exit 1
  fi
else
  PROCESS_LIST=$(echo "$CANDIDATES_JSON" | jq -c ".feature[:$MAX][]")
fi

while IFS= read -r CANDIDATE; do
  [ -z "$CANDIDATE" ] && continue
  ROW=$(echo "$CANDIDATE" | jq -r '.sourceRow')
  NAME=$(to_nfc "$(echo "$CANDIDATE" | jq -r '.name')")
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

  # === 店舗特定（bash 側で完結。claude には検索させない） ===
  # スプシの Maps URL 列に電話番号が入っている行がある（実例: row283 天ぷら わかやま = "tel:0425250222"）。
  # この列は IMPORTRANGE で参照元 Linkate② から来ているため、こちら側では直せない。
  # 「Maps URL が絶対正解」は “URL が存在する場合” のルールなので、
  # URL 自体が存在しないこのケースに限り、店舗名＋スプシの住所で Maps を検索して代替する。
  # ただし解決結果の都道府県・市区町村がスプシの住所と一致しなければ必ず捨てる（別店舗混入の防止）。
  SHEET_ADDR=$(echo "$CANDIDATE" | jq -r '.addr // ""')
  RESOLVE_TARGET="$MAPS_URL"
  ADDR_VERIFY=""
  case "$MAPS_URL" in
    http://*|https://*) ;;
    *)
      if [ -n "$SHEET_ADDR" ]; then
        log "  ⚠️ Maps URL が不正（${MAPS_URL}）→ 住所で代替検索し、住所一致を検証する"
        RESOLVE_TARGET="https://www.google.com/maps/search/$(node -e 'process.stdout.write(encodeURIComponent(process.argv[1]+" "+process.argv[2]))' "$NAME" "$SHEET_ADDR")"
        ADDR_VERIFY="$SHEET_ADDR"
      fi
      ;;
  esac

  log "  Maps URL 解決中..."
  RESOLVED_JSON=$(node scripts/resolve-maps-url.mjs "$RESOLVE_TARGET" 2>>"$LOG_FILE") || {
    log "  ❌ Maps URL 解決失敗。スキップ"
    node scripts/sheets-mark-done.mjs --type=feature --row="$ROW" --status=error --reason="Maps URL解決失敗" >> "$LOG_FILE" 2>&1
    ERROR=$((ERROR+1))
    ERROR_LIST="$ERROR_LIST\n  - $NAME: Maps URL解決失敗"
    continue
  }
  RESOLVED_NAME=$(to_nfc "$(echo "$RESOLVED_JSON" | jq -r '.name')")
  RESOLVED_LAT=$(echo "$RESOLVED_JSON" | jq -r '.lat')
  RESOLVED_LNG=$(echo "$RESOLVED_JSON" | jq -r '.lng')
  RESOLVED_PREF=$(echo "$RESOLVED_JSON" | jq -r '.prefecture // "不明"')
  RESOLVED_CITY=$(echo "$RESOLVED_JSON" | jq -r '.city // "不明"')
  RESOLVED_ADDR=$(echo "$RESOLVED_JSON" | jq -r '.address // "不明"')
  # URL/ファイルパス用に正式店舗名からスペースを除去
  # （URL にスペースを含むとクリック時に切れる事故が発生したため・2026-05-27）
  # tr -d は UTF-8 マルチバイト文字を壊すので bash パラメータ展開で除去
  # 「すし笑魚亭 / ティーサロン笑魚亭」のように " / " で区切られた併記名は、先頭の店名だけを採用する。
  # 一方「【CAFE】i/HUB」のようにスラッシュが店名の一部のときは切り捨てず、記号だけ落とす。
  SAFE_NAME="${RESOLVED_NAME%% / *}"
  SAFE_NAME="${SAFE_NAME// /}"
  SAFE_NAME="${SAFE_NAME//　/}"
  # spec.md「URL危険記号は除外」の実装。従来はスペースしか消しておらず素通りしていたため、
  # id にスラッシュが残って /feature/A/B という別ルート扱いになり記事が 500 になった
  # うえ、画像フォルダも public/restaurants/teleapo-A/B/ と入れ子に割れた（2026-09-08 発生）。
  # tr -d はバイト単位で動くため UTF-8 の日本語を壊す（このファイル既出の事故）。
  # 必ず bash のパラメータ展開で1文字ずつ落とすこと。
  for CH in '/' '。' '(' ')' '（' '）' '?' '？' '&' '#' '%' '|' ':' '*' '<' '>'; do
    SAFE_NAME="${SAFE_NAME//"$CH"/}"
  done
  # 記事ID は NFC に統一（claude が書く id・台帳・URL・反映確認を同じ文字列にする）
  SAFE_NAME=$(to_nfc "$SAFE_NAME")
  if [ -z "$SAFE_NAME" ]; then
    log "  ❌ 店舗名から安全なID を作れない（元: $RESOLVED_NAME）。スキップ"
    node scripts/sheets-mark-done.mjs --type=feature --row="$ROW" --status=error --reason="記事IDを生成できない" >> "$LOG_FILE" 2>&1
    ERROR=$((ERROR+1))
    continue
  fi
  log "  ✅ 解決: $RESOLVED_NAME / $RESOLVED_PREF $RESOLVED_CITY"
  log "     座標: $RESOLVED_LAT, $RESOLVED_LNG"
  log "     ID用: $SAFE_NAME"

  # === 既に同じ記事IDの記事が実在するなら claude を起動しない（重複生成・空回り防止） ===
  # 候補に上がったのに記事がある＝台帳の食い違い、または別の店と記事IDが衝突している。
  # claude を約7分動かしても新しい記事は作れず（重複キーでビルドが落ちるか、claude が
  # 「既に完了」と言って何も変えずに終わる）、成功扱いになると vercel --prod まで空振りする。
  # 判定は NFC 正規化したうえでの完全一致（scripts/article-exists.mjs）。
  if node scripts/article-exists.mjs "$SAFE_NAME"; then
    log "  ⚠️ 記事ID「$SAFE_NAME」は既に lib/teleapo-features.ts に実在する → claude を起動しない"
    # この行がすでに「済」で、X列の URL がこの記事そのもの（NFC 完全一致）なら、同じ店の記事が
    # 台帳から抜けているだけ。台帳に登録し直して次へ進む（claude もデプロイも不要）。
    CAND_W=$(echo "$CANDIDATE" | jq -r '.w // ""')
    CAND_X=$(to_nfc "$(echo "$CANDIDATE" | jq -r '.x // ""')")
    if [ "$CAND_W" = "済" ] && [ "$CAND_X" = "https://machinowa.tokyo/feature/$SAFE_NAME" ]; then
      log "     この行は既に 済 + X列が同じ記事のURL → 台帳だけ登録し直す（生成もデプロイもしない）"
      node scripts/ledger-add.mjs --mapsurl="$MAPS_URL" --name="$RESOLVED_NAME" --sheetName="$NAME" --articleId="$SAFE_NAME" --url="https://machinowa.tokyo/feature/$SAFE_NAME" >> "$LOG_FILE" 2>&1 || log "  ⚠️ 台帳追記失敗"
      continue
    fi
    log "     （台帳の食い違い、または別の店と記事IDが衝突。人の確認が必要。row $ROW）"
    node scripts/sheets-mark-done.mjs --type=feature --row="$ROW" --status=error --reason="記事ID既存(台帳食い違い or ID衝突)" >> "$LOG_FILE" 2>&1 || log "  ⚠️ エラー書き込みに失敗"
    ERROR=$((ERROR+1))
    ERROR_LIST="$ERROR_LIST\n  - $NAME: 記事ID既存のため claude を起動せず(要確認)"
    continue
  fi

  # === GBP 写真の取得（画像ソースの最優先） ===
  # runbook.md は「GBP の写真を最優先」と定めているのに、
  # 稼働中のこのプロンプトには GBP 手順が無く 公式HP/IG/食べログ しか探させていなかった。
  # そのため公式サイトも Instagram も持たない店（よりみち・酒菜ちゃんちゃんこ）が
  # 「画像取得失敗」で毎日スキップされ続けていた（2026-09-07 原因特定）。
  # なお curl で cid URL を叩いても Google マップの汎用シェルが返るだけで写真は取れない。
  # 必ず Playwright で place ページを描画する必要がある（実測済み）。
  log "  GBP写真 取得中..."
  GBP_SOURCE=$(echo "$RESOLVED_JSON" | jq -r '.finalUrl // empty')
  [ -z "$GBP_SOURCE" ] && GBP_SOURCE="$RESOLVE_TARGET"
  GBP_PHOTOS=$(node scripts/fetch-gbp-photos.mjs "$GBP_SOURCE" 2>>"$LOG_FILE" | jq -r '.photos[]?' | head -3)
  if [ -n "$GBP_PHOTOS" ]; then
    log "     GBP写真 $(echo "$GBP_PHOTOS" | wc -l | tr -d ' ')枚"
    GBP_PHOTO_BLOCK=$(echo "$GBP_PHOTOS" | sed 's/^/     - /')
  else
    log "     GBP写真 0枚（公式HP・Instagram等にフォールバック）"
    GBP_PHOTO_BLOCK="     （取得できず。公式HP・公式Instagram から探すこと）"
  fi

  # claude に丸投げするプロンプト
  # heredoc はシングルクォートで bash のパースを無効化
  # プレースホルダ方式で安全に値を埋め込む
  CLAUDE_PROMPT=$(cat <<'PROMPT_EOF'
あなたはマチノワ編集部のライターです。以下の店舗の特集記事を作成して本番に公開してください。

# 🚨🚨 最優先: これは無人ワンショット実行である（他のどのルールよりも優先）
このプロセスは `claude -p` で起動された無人実行。**画面の前に人間はいない。**
過去41回の失敗のうち約6割が、この前提を忘れて「待つ」「聞く」で停止したことによるもの。
- **サブエージェントへの委譲禁止。** グローバル CLAUDE.md の「実行は必ず haiku に投げる」は
  対話セッション用のルールであり、**このセッションでは適用しない**。記事は自分で最後まで書く。
  （委譲した15回はすべて記事が生まれないまま終了した）
- **バックグラウンド実行の「完了通知待ち」禁止。** このプロセスに通知は絶対に届かない。
  待つ必要があるもの（デプロイ等）は、その場で sleep + 判定コマンドを繰り返して自分で確認しきる。
- **ユーザーへの質問・承認要求・方針確認は禁止。** 誰も答えないので永久に停止する。
  判断に迷ったら、質問せず下記「詰まったときの出口」のいずれかで必ず終了する。
- **本パイプライン内の commit / push / vercel --prod は承認済みの標準工程。** 都度の承認は不要。

## 詰まったときの出口（必ずこのどれかで終わる。黙って止まるのが最悪）
情報・画像・判断材料が足りず記事を作れないと分かった時点で、
  node scripts/sheets-mark-done.mjs --type=feature --row=__ROW__ --status=error --reason=<理由>
を実行し、「COMPLETED row __ROW__ URL: 失敗(<理由>)」と出力して終了する。
失敗で終わること自体は正常な結果。次回リトライされる。**出力せずに沈黙して終わることだけが事故。**


# 🚨 店舗特定は完了済（bash 側で Maps URL から機械的に取得済み）
- **正式店舗名（記事本文・タイトル用）**: __RESOLVED_NAME__
- **🔑 ID / フォルダ名（スペース除去済・絶対これを使う）**: __SAFE_NAME__
- **都道府県**: __RESOLVED_PREF__
- **市区町村**: __RESOLVED_CITY__
- **住所（OpenStreetMap逆ジオコーディング結果）**: __RESOLVED_ADDR__
- **座標**: __RESOLVED_LAT__, __RESOLVED_LNG__
- **元 Maps URL**: __MAPS_URL__
- **スプシ行番号**: __ROW__
- **スプシ D列の店舗名（参考・手入力なので誤字あり得る）**: __NAME__

# 🚨 絶対遵守ルール（ユーザー明言 2026-05-27）
- **上記の「正式店舗名」「都道府県」「市区町村」が絶対正解。これを使え**
- **店舗名で WebSearch して別店舗を探すのは絶対禁止**（同名店舗を拾うリスク）
- **WebSearch を使うときは必ず「正式店舗名 + 都道府県 + 市区町村」をクエリに含めて、別店舗が混入しないようにする**
- 公式サイト・食べログ・ホットペッパー等で取得した情報の住所が、上記都道府県と一致しなければ「別店舗」と判断して採用しない

# 手順（必ず順番に実行・タスク完了まで止まらない）

1. agent-teams/decisions/machinowa-article-spec.md を Read で必ず読む
2. 詳細情報収集:
   - WebSearch クエリは必ず「__RESOLVED_NAME__ __RESOLVED_PREF__ __RESOLVED_CITY__」の形で実行
   - ヒットした店舗の住所が __RESOLVED_PREF__ __RESOLVED_CITY__ と一致するもののみ採用
   - 一致しないページは完全に無視（同名別店舗の可能性）
3. 画像取得（重要）
   ★最優先: この店舗の Google ビジネスプロフィール（GBP）写真は取得済み。まずこれを使う。
__GBP_PHOTO_BLOCK__
   GBP写真が無い/足りない場合のみ、次の順で追加を探す:
   - 公式ホームページ（WebSearch で店舗名+公式 → WebFetch で HTML → img タグ抽出）
   - 公式 Instagram
   - 食べログ・ホットペッパー・ぐるなび等の店舗ページ
   見つけた画像URLを Bash の curl で download:
     mkdir -p public/restaurants/teleapo-__SAFE_NAME__
     curl --max-time 30 -o public/restaurants/teleapo-__SAFE_NAME__/hero.jpg URL1
     curl --max-time 30 -o public/restaurants/teleapo-__SAFE_NAME__/point2.jpg URL2
   各画像が 20KB 以上 + JPEG/PNG であることを file コマンドと wc -c で確認
   ★hero.jpg が1枚あれば記事は成立する（既存記事の多くが hero のみ）。
     2枚目が見つからないことを理由に記事生成を中止してはいけない。point2 は省略してよい。
   hero.jpg すら1枚も確保できなかった場合のみ:
     rm -rf public/restaurants/teleapo-__SAFE_NAME__
     node scripts/sheets-mark-done.mjs --type=feature --row=__ROW__ --status=error --reason=画像取得失敗
4. 記事生成: spec.md §1〜13 と §14-0（文章の6つの型）を厳守。文中で半角ダブルクォート禁止（日本語の「」を使う）、id は __SAFE_NAME__ のみ（スペース絶対禁止）
   本文の目安は3000字前後。ただし事実が足りないときは水増しせず短くしてよい（短いのは失敗ではない。型A〜Eの文で埋めるのが失敗）
   lib/teleapo-features.ts の末尾 }; 直前に TypeScript object として Edit ツールで追記
   ★脱テンプレ必須（spec.md §14「脱テンプレ規約」厳守）:
     - closing を「編集部が考える」で始めるのは絶対禁止。店の固有要素・時間軸・客層・立地・問いのいずれかから書き出す
     - 「初めてなら、まずは」「初訪問なら、まずは」を使わない
     - lede 末尾に「今回は、〜5つのポイントに分けて紹介していく」を書かない
     - 「訪問前に公式情報での確認を」の固定形は1記事1回まで。POINT 内では言い換える
     - 既存記事と書き出し・締めが被らないよう、店ごとにゼロから組む
4b. 文の検査（機械・ビルドの前に必ず実行）: node scripts/check-article-sentences.mjs __SAFE_NAME__
   - 「✅ …当たる文なし」(終了コード0)なら次へ。
   - 当たったとき(終了コード1)は、表示された文を、言い換えず・書き足さず「その文を取る」か、確かな事実だけの短い文に置き換える。事実が足りなければ取るだけにして短くする。直したら同じコマンドをもう一度実行し、当たりが無くなるまで繰り返す（最大3回）。
   - 3回やっても残るときだけ: node scripts/check-article-sentences.mjs __SAFE_NAME__ --fix を実行（落としてよい文だけ機械で取る）。それでも「要書き直し」が残る文は、手で取るか、事実の短い文に置き換える。
   - 「語だけでは事実と区別がつかない」と出た文（店が公式に出しているメニュー名・コース名、実用の注意の中の語）は、評価として書いていなければそのままでよい。
   - 型は R=他サイトの評価・口コミ / A=分からなかったことを書く文 / B=調べ方の舞台裏 / C=決まり文句・締めの定型・記事の案内文 / D=行ったふり / E=裏付けの無い評価・人気（詳細と実例は spec.md §14-0）。
5. ビルド: npm run build を Bash で実行。失敗したら:
     git checkout -- lib/teleapo-features.ts
     rm -rf public/restaurants/teleapo-__SAFE_NAME__
     node scripts/sheets-mark-done.mjs --type=feature --row=__ROW__ --status=error --reason=ビルド失敗
6. 禁止語 grep: パターン（素朴|派手さはない|奇をてらった.*ではない|日本一|絶品|最高の|呼び込み）を lib/teleapo-features.ts に grep。ヒットしたら:
     git checkout -- lib/teleapo-features.ts
     rm -rf public/restaurants/teleapo-__SAFE_NAME__
     node scripts/sheets-mark-done.mjs --type=feature --row=__ROW__ --status=permanent_error --reason=禁止語含む
6b. 脱テンプレ自己チェック: 今回追記した記事ブロックに対し、closing が「編集部が考える」で始まる/「初めてなら、まずは」「初訪問なら、まずは」「5つのポイントに分けて紹介」を含む、のいずれかに当てはまらないか確認。当てはまったら closing/lede を書き直してから次へ進む（公開前に必ず潰す）
6c. 他サイト評価の自己チェック: 今回追記した記事ブロックに、ほかのサイト・サービスの点数・星・評価の高さ・口コミやレビューの件数（例: 食べログ3.5・Google4.3・口コミ200件・食べログで高評価）が入っていないか確認。入っていたら、その文／句を取り除いてから次へ進む（公開前に必ず潰す）
7. commit & push:
     git add lib/teleapo-features.ts public/restaurants/teleapo-__SAFE_NAME__/
     git commit -m feat(teleapo)記事を自動生成
     git pull --rebase origin main
     git push origin main
   push 失敗時:
     git reset --hard HEAD~1
     rm -rf public/restaurants/teleapo-__SAFE_NAME__
     node scripts/sheets-mark-done.mjs --type=feature --row=__ROW__ --status=error --reason=git push失敗
8. スプシ書き戻し:
     node scripts/sheets-mark-done.mjs --type=feature --row=__ROW__ --url=https://machinowa.tokyo/feature/__SAFE_NAME__

# 絶対厳守
- 場所推測禁止（必ず公式情報から）
- 画像は実店舗のもののみ（Unsplash 等の汎用画像 NG）
- 文中で半角ダブルクォートを使わない（日本語の「」を使う）
- ほかのサイト・サービス（食べログ・Google・Retty・ホットペッパーなど）の点数・星・評価の高さ・口コミやレビューの件数を、文章（紹介文・本文・見どころ・特集記事）に書かない。（2026-10-11 オーナー指示）
- 🚨 次の5つの型の文は書かない（2026-10-13・サイトは画面に出す直前にこれらの文を文ごと取り除いている。実例は spec.md §14-0）。事実が足りないときは、文を作って埋めずに、その分だけ短くする:
  A 分からなかった・確認できなかったことを書く文（例: 「一次情報は見当たらない」「公開情報からは確認できない」「詳細情報は非公開」）。分かったことだけ書き、分からないことには触れない
  B 調べ方の舞台裏（例: 「ここでは確認できた事実だけを書く」「先に正直なところを書いておく」「公開している写真から読み取れるのは」）
  C どの店にも言える決まり文句・締めの定型・記事の案内文（例: 「〜と聞いたら、まず思い出したい店だ」「覚えておきたい一軒だ」「これ、地味に効く。」「まさに編集部イチオシのお店です」「〜を5つの視点から紹介していく」「〜を見ていきたい」）。その店だけの事実で終える。事実で締められないなら書かずに終える
  D 行ったふり（例: 「ひとくち食べると〜がわかる気がする」「〜と感じた」「実際に足を運んでみないと伝わりにくい」）。来店したかのような体験・感想は書かない
  E 裏付けの無い評価・人気（例: 「地元の食好きに支持されている」「評判の店」「人気のメニュー」「地域に親しまれている」「おすすめ」「知る人ぞ知る」）。出典つきの賞・選出や、店が公式に出す数字・名称があるときだけ書く
- author 固定 マチノワ編集部
- **id は __SAFE_NAME__ のみ（スペース絶対禁止・URL がスペースで切れて 500 になるため）**
- フォルダ名・画像パス・スプシ書き戻し URL もすべて __SAFE_NAME__ を使う

# 完了
全ステップ完了したら「COMPLETED row __ROW__ URL: <生成URL or 失敗理由>」と1行出力して終了。
タスクが完了するまで停止しない。複数の Bash ツール呼び出しが必要。
PROMPT_EOF
)

  # プレースホルダ → 実値 置換
  CLAUDE_PROMPT="${CLAUDE_PROMPT//__ROW__/$ROW}"
  CLAUDE_PROMPT="${CLAUDE_PROMPT//__NAME__/$NAME}"
  CLAUDE_PROMPT="${CLAUDE_PROMPT//__MAPS_URL__/$MAPS_URL}"
  CLAUDE_PROMPT="${CLAUDE_PROMPT//__RESOLVED_NAME__/$RESOLVED_NAME}"
  CLAUDE_PROMPT="${CLAUDE_PROMPT//__RESOLVED_PREF__/$RESOLVED_PREF}"
  CLAUDE_PROMPT="${CLAUDE_PROMPT//__RESOLVED_CITY__/$RESOLVED_CITY}"
  CLAUDE_PROMPT="${CLAUDE_PROMPT//__RESOLVED_ADDR__/$RESOLVED_ADDR}"
  CLAUDE_PROMPT="${CLAUDE_PROMPT//__RESOLVED_LAT__/$RESOLVED_LAT}"
  CLAUDE_PROMPT="${CLAUDE_PROMPT//__RESOLVED_LNG__/$RESOLVED_LNG}"
  CLAUDE_PROMPT="${CLAUDE_PROMPT//__GBP_PHOTO_BLOCK__/$GBP_PHOTO_BLOCK}"
  CLAUDE_PROMPT="${CLAUDE_PROMPT//__SAFE_NAME__/$SAFE_NAME}"

  log "  claude CLI 起動..."
  CLAUDE_LOG="$LOG_DIR/$NOW.row$ROW.claude.log"
  echo "$CLAUDE_PROMPT" | claude -p --output-format=text --permission-mode=bypassPermissions --effort high > "$CLAUDE_LOG" 2>&1
  CLAUDE_EXIT=$?
  log "  claude 終了 exit=$CLAUDE_EXIT"
  log "  詳細ログ: $CLAUDE_LOG"

  # claude の最終出力から結果判定（絵文字 ✅ あり/なし両対応）
  FINAL_LINE=$(grep -oE '(✅ )?COMPLETED row [^\\]+' "$CLAUDE_LOG" | tail -1)
  if [ -n "$FINAL_LINE" ]; then
    log "  $FINAL_LINE"
    if echo "$FINAL_LINE" | grep -q "https://" && ! node scripts/article-exists.mjs "$SAFE_NAME"; then
      # claude が「完了」と言っても、記事が実在しなければ成功ではない（成否はログでなく成果物で判定）。
      log "  ❌ claude は完了と報告したが、記事ID「$SAFE_NAME」が lib/teleapo-features.ts に無い → 失敗扱い"
      ERROR=$((ERROR+1))
      ERROR_LIST="$ERROR_LIST\n  - $NAME: 完了報告だが記事が実在しない"
      node scripts/sheets-mark-done.mjs --type=feature --row="$ROW" --status=error --reason="生成未完了(記事が実在しない)" >> "$LOG_FILE" 2>&1 || log "  ⚠️ ロック解除に失敗"
    elif echo "$FINAL_LINE" | grep -q "https://"; then
      SUCCESS=$((SUCCESS+1))
      # claude の出力文からURLを正規表現で拾うと、末尾のマークダウン(**)や
      # 句読点まで取り込んで壊れたURLになる事故が発生した(2026-08-26 かじゅある割烹頼みち)。
      # パイプライン自身が組み立てた SAFE_NAME を正とし、出力文は成功判定にのみ使う。
      URL="https://machinowa.tokyo/feature/$SAFE_NAME"
      SUCCESS_URLS="$SUCCESS_URLS\n  - $NAME: $URL"
      SUCCESS_URL_LIST="$SUCCESS_URL_LIST $URL"
      # 台帳に追記（行番号ではなく cid・店名で処理済み管理。IMPORTRANGE 行ズレ対策）
      node scripts/ledger-add.mjs --mapsurl="$MAPS_URL" --name="$RESOLVED_NAME" --sheetName="$NAME" --articleId="$SAFE_NAME" --url="https://machinowa.tokyo/feature/$SAFE_NAME" >> "$LOG_FILE" 2>&1 || log "  ⚠️ 台帳追記失敗（次回 reconcile で回収）"
      check_sentences "$SAFE_NAME"
    else
      ERROR=$((ERROR+1))
      ERROR_LIST="$ERROR_LIST\n  - $NAME: $FINAL_LINE"
      # 「処理中」ロックを残すとその行が永久に候補から外れる。必ずエラー状態に落とす。
      node scripts/sheets-mark-done.mjs --type=feature --row="$ROW" --status=error --reason="生成未完了" >> "$LOG_FILE" 2>&1 || log "  ⚠️ ロック解除に失敗"
    fi
  else
    log "  ⚠️ claude が完了マーカー出さずに終了"
    log "  claude 出力末尾:"
    tail -20 "$CLAUDE_LOG" | sed 's/^/    /' | tee -a "$LOG_FILE"
    # 完了マーカーが無くても、記事が実在すれば成功。成否はログではなく成果物で判定する。
    # 2026-09-14 22:00 の回で、生成に成功した row 401（カフェレガーロ）が
    # マーカーを出さずに終了 → 下の環境起因判定が claude 出力中の「row 401」の
    # "401" を HTTP 401 と読み違え → ループごと中断し、残り10件が未処理で残った。
    if node scripts/article-exists.mjs "$SAFE_NAME"; then
      log "  ✅ 完了マーカーは無いが記事の実在を確認 — 成功として扱う"
      SUCCESS=$((SUCCESS+1))
      URL="https://machinowa.tokyo/feature/$SAFE_NAME"
      SUCCESS_URLS="$SUCCESS_URLS\n  - $NAME: $URL"
      SUCCESS_URL_LIST="$SUCCESS_URL_LIST $URL"
      node scripts/ledger-add.mjs --mapsurl="$MAPS_URL" --name="$RESOLVED_NAME" --sheetName="$NAME" --articleId="$SAFE_NAME" --url="$URL" >> "$LOG_FILE" 2>&1 || log "  ⚠️ 台帳追記失敗（次回 reconcile で回収）"
      check_sentences "$SAFE_NAME"
    # 認証切れ(HTTP 401)などで claude が即死した場合、ここを通る。
    # 「処理中」のまま放置するとその行が二度と処理されないので、必ずエラーに落として再試行可能にする。
    # 認証切れ・ネットワーク断は「この店舗の問題」ではない。
    # エラーとして書くと24hクールダウンに入り滞留が候補一覧から消えるので、
    # ロックだけ外して（W列を空に戻して）即座にループを抜ける。残りの行も必ず同じ理由で失敗するため。
    # ※ 裸の "401" は行番号・価格・電話番号にも出るので必ず文脈付きで照合する（上記事故）。
    elif grep -qiE "401 Unauthorized|HTTP 401|status(Code)?[\"': ]+401|OAuth access token has expired|Failed to authenticate|Invalid authentication|Not logged in|EADDRNOTAVAIL|getaddrinfo|ENOTFOUND" "$CLAUDE_LOG" 2>/dev/null; then
      ERROR=$((ERROR+1))
      log "  🔑 環境起因の失敗を検出（認証切れ or ネットワーク断）。W列は書かずに中断する"
      node scripts/sheets-mark-done.mjs --type=feature --row="$ROW" --status=clear >> "$LOG_FILE" 2>&1 || log "  ⚠️ ロック解除に失敗"
      ERROR_LIST="$ERROR_LIST\n  - $NAME: 環境起因(認証/ネットワーク)のため中断"
      ENV_FAILURE=1
      break
    else
      ERROR=$((ERROR+1))
      ERROR_LIST="$ERROR_LIST\n  - $NAME: claude早期終了"
      node scripts/sheets-mark-done.mjs --type=feature --row="$ROW" --status=error --reason="claude早期終了" >> "$LOG_FILE" 2>&1 || log "  ⚠️ ロック解除に失敗"
    fi
  fi

  sleep 5
done <<< "$PROCESS_LIST"

log ""
log "============================================================"
log "完了サマリ: 成功 $SUCCESS / エラー $ERROR"
[ -n "$SUCCESS_URLS" ] && log "成功URL:$SUCCESS_URLS"
[ -n "$ERROR_LIST" ] && log "エラー:$ERROR_LIST"
if [ -n "$SENTENCE_LEFT" ]; then
  log "⚠️ 文の検査で型R/A/B/C/D/Eの文が残った記事:$SENTENCE_LEFT"
  notify "⚠️ マチノワ 文の検査" "型A〜Eの文が残った記事があります:$SENTENCE_LEFT"
fi
log "============================================================"

# === Vercel 本番デプロイ（成功が1件以上あれば実行） ===
# 重要: pushだけでは反映されないケースが過去に複数回発生。失敗時は最大3回リトライ、
#       完了後は実際の本番URLを叩いて200を確認。500なら必ず通知する。
if [ $SUCCESS -gt 0 ]; then
  log ""
  log "▼ Vercel 本番デプロイ"
  DEPLOY_OK=0
  for ATTEMPT in 1 2 3; do
    log "  デプロイ試行 $ATTEMPT/3"
    if vercel --prod --yes >> "$LOG_FILE" 2>&1; then
      DEPLOY_OK=1
      log "  ✅ vercel --prod 成功"
      break
    fi
    log "  ⚠️ vercel --prod 失敗 (試行 $ATTEMPT) — 30秒後リトライ"
    sleep 30
  done

  if [ "$DEPLOY_OK" = "1" ]; then
    # 反映確認: 生成した記事のURLが本番で200を返すか実測（最大90秒待つ）
    VERIFY_OK=1
    for URL in $SUCCESS_URL_LIST; do
      [ -z "$URL" ] && continue
      # URL は NFC で確かめる（NFD の URL は本番で404になる。curl で実測済み）。
      URL=$(to_nfc "$URL")
      log "  反映確認: $URL"
      for WAIT in 0 15 30 45 60 75 90; do
        [ "$WAIT" -gt 0 ] && sleep 15
        # -L: 1店1ページ化により /feature/<記事ID> は /restaurant/<店ID> へ 308 で転送されることがある
        # （転送の表は lib/portal/noren/onePage.ts。新しい記事はまだ表に無く、200 で直接届く）。
        # 転送をたどった先が 200 なら成功。最終URLもログに残す。
        CHECK=$(curl -s -L --max-redirs 5 -o /dev/null -w "%{http_code} %{url_effective}" -m 15 -A "Mozilla/5.0" "$URL")
        CODE=${CHECK%% *}
        FINAL_URL=${CHECK#* }
        if [ "$CODE" = "200" ]; then
          if [ "$FINAL_URL" != "$URL" ]; then
            log "    ✅ HTTP 200 — 反映OK（転送先: $FINAL_URL）"
          else
            log "    ✅ HTTP 200 ($CODE) — 反映OK"
          fi
          break
        fi
        log "    待機中: HTTP $CODE (経過 ${WAIT}s)"
      done
      if [ "$CODE" != "200" ]; then
        VERIFY_OK=0
        log "    ❌ 90秒待っても HTTP $CODE のまま — 反映失敗"
      fi
    done
    if [ "$VERIFY_OK" = "1" ]; then
      log "✅ Vercel デプロイ＋本番反映 確認済み"
    else
      log "❌ Vercel デプロイ完了表示だが本番未反映を検出"
      notify "❌ マチノワ デプロイ未反映" "vercel --prod は完了したが本番URLが200を返さない。手動で vercel --prod を実行してください。"
    fi
  else
    log "❌ Vercel デプロイ 3回失敗"
    notify "❌ マチノワ デプロイ失敗" "vercel --prod が 3回失敗。手動デプロイが必要です。"
  fi
fi

if [ "$ENV_FAILURE" = "1" ]; then
  # 実行中に認証が切れた等。スプシは汚していないので、次回そのまま再挑戦できる。
  cat > "$ALERT_FILE" <<ALERT_EOF
# 🚨 マチノワ自動化が途中で止まりました

**検知時刻**: $(date '+%Y-%m-%d %H:%M') JST（$HOUR_LABEL の実行）

**原因**: 実行中に claude の認証切れ／ネットワーク断が発生しました。
スプレッドシートには「エラー」を書いていないので、原因が直れば次回そのまま再開されます。

**認証切れの場合の復旧手順**（1回だけでOK）:

    claude setup-token
    bash automation/setup-oauth-token.sh <表示されたトークン>

※ このファイルは次に正常実行できた時点で自動削除されます。
ALERT_EOF
  notify "🚨 マチノワ自動化 中断" "認証切れ/ネットワーク断で中断。スプシは汚していません"
elif [ $SUCCESS -gt 0 ]; then
  notify "✅ マチノワ自動化 $HOUR_LABEL" "成功 ${SUCCESS}件 / エラー ${ERROR}件"
else
  notify "⚠️ マチノワ自動化 $HOUR_LABEL" "全件エラー ${ERROR}件"
fi

# 最後に必ず全数照合してログに残す（「候補0件だから完了」を根拠にしないため）
log ""
log "▼ 抜け検知（成果物ベース）"
# === 記事台帳の最終同期 ＋ D列のリンク化 ===
# 生成後に増えた行を台帳へ反映し、D列を「日本語表示＋クリックできるリンク」にする。
# ここを通さないと D列がただの黒い文字列になり、渡した先で押せない（2026-08-28 指摘）。
log "▼ 記事台帳の最終同期とURLリンク化"
node automation/sync-article-ledger.mjs --apply >> "$LOG_FILE" 2>&1 || log "  ⚠️ 記事台帳の同期に失敗（続行）"
node automation/link-ledger-urls.mjs >> "$LOG_FILE" 2>&1 || log "  ⚠️ D列のリンク化に失敗（要手動: node automation/link-ledger-urls.mjs）"

node scripts/check-gaps.mjs >> "$LOG_FILE" 2>&1 || log "  ⚠️ 記事の抜けを検知（上のログ参照・デスクトップ通知済み）"

log "▼ 最終確認: 詰めOK行の全数照合"
node scripts/health-report.mjs 2>&1 | tee -a "$LOG_FILE" || true

find "$LOG_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null

# === 残未処理あれば 5 分後に自己再発火（取りこぼし防止） ===
REMAINING=$(node scripts/sheets-candidates-json.mjs 2>/dev/null | tail -1 | jq -r '.feature | length' 2>/dev/null || echo 0)
if [ "${REMAINING:-0}" -gt 0 ] && [ "$HOUR_LABEL" != "self-restart" ] && [[ "$HOUR_LABEL" != manual* ]] && [[ "$HOUR_LABEL" != retry* ]]; then
  log ""
  log "⏰ 残り未処理 $REMAINING 件あり。5 分後に自己再発火 (caffeinate)"
  (
    sleep 300
    /usr/bin/caffeinate -i "$REPO/automation/local-pipeline.sh" "self-restart" > "$LOG_DIR/$(date '+%Y%m%d-%H%M%S').self-restart.log" 2>&1
  ) > /dev/null 2>&1 &
  disown
fi

exit 0
