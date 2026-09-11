# マチノワ記事自動生成 ローカル実行（launchd）

## いま動いている構成（2026-09-11 時点）

| 項目 | 内容 |
|---|---|
| 実行時刻 | 毎日 **08:00** と **22:00**（JST） |
| 設定の実体 | `~/Library/LaunchAgents/com.machinowa.auto.08jst.plist` / `com.machinowa.auto.22jst.plist` |
| 起動されるもの | `caffeinate -i automation/local-pipeline.sh <ラベル>` |
| 1回の処理上限 | 10件（`MAX_CANDIDATES` のデフォルト） |
| ログ | `~/Library/Logs/machinowa-auto/` |

- **クラウド側の routine（machinowa-auto-10jst / 15jst / 20jst）は実行セッション0件の空振り。** 実働はこのローカル実行だけ（経緯は `申し送り.md`）。
- **Mac が起動していない時刻の回は走らない。** `caffeinate -i` は実行中のスリープを防ぐだけで、スリープから起こしはしない。
- 旧構成（`local-run.sh` + `local-prompt.md`、10/15/20時・1回3件）は 2026-09-11 に削除した。

## ファイル構成

```
automation/
├── local-pipeline.sh      本体。候補抽出 → 記事生成 → デプロイ → 全数照合までを1回で行う
├── preflight.sh           実行前ヘルスチェック（ネットワーク・claude 認証）
├── setup-oauth-token.sh   定期実行の plist に claude の長期トークンを配る
├── secrets/sa.json        Google サービスアカウント鍵（.gitignore 済み）
└── launchd/               ⚠️ 旧テンプレート（00/08/12/16/20時）。いま稼働中の設定とは一致しない
```

## 1回の実行でやること

1. **Step -1 実行前ヘルスチェック**（`preflight.sh`）
   - ネットワーク不通（終了コード10）→ スプシに何も書かずにスキップ
   - claude 認証切れ（終了コード11）→ `automation/HEALTH-ALERT.md` を作成して停止
2. **Step 0〜0.6 台帳とスプシの同期**（処理済み台帳の再構築、W/X列の再同期）
3. **Step 1 候補抽出**（P列＝詰めOK かつ W列が空の行）
4. **Step 2 候補ごとの記事生成**
   - W列に「処理中」ロック → Maps URL 解決 → GBP 写真取得
   - `claude -p` が記事を生成し、コミット・push・スプシへの URL 書き戻しまで行う
   - 最終行の `COMPLETED row N URL: …` で成否を判定（失敗時はロックを外してエラーに落とす）
5. **Vercel 本番デプロイ**（最大3回試行）→ 本番 URL の HTTP 200 を確認
6. **抜け検知・記事台帳の最終同期・詰めOK行の全数照合**
   - 残り未処理があれば「5分後に自己再発火」する処理があるが、launchd から起動した回ではジョブ終了と同時に待機プロセスも終了するため、**実際には再発火しない**（2026-09-11 確認）。取りこぼしは次の定期実行（08:00 / 22:00）で処理される。

## 手動実行

```bash
# 候補を上から処理（上限はデフォルト10件）
bash automation/local-pipeline.sh manual

# 特定の行だけ処理
TARGET_ROW=323 bash automation/local-pipeline.sh manual323

# 件数を絞って処理
MAX_CANDIDATES=3 bash automation/local-pipeline.sh manual3

# launchd 経由で今すぐ起動
launchctl kickstart gui/$(id -u)/com.machinowa.auto.08jst
```

> ⚠️ **実行中はリポジトリの作業ツリーを触らないこと。**
> パイプラインは各記事のあとに `git pull --rebase` を行い、失敗すると `git reset --hard HEAD~1` で巻き戻す。
> 未コミットの変更があると pull が失敗し、**生成中の記事ごと消える。**
> 定期実行の時刻に手動実行を重ねるのも避ける。

## 状態の確認

```bash
# 登録されているジョブ（PID が数字なら実行中）
launchctl list | grep machinowa

# 最新のログ
ls -t ~/Library/Logs/machinowa-auto/ | head -5
```

| ログファイル | 中身 |
|---|---|
| `<日時>.<ラベル>.log` | 1回の実行全体 |
| `<日時>.row<行>.claude.log` | 記事ごとの claude の出力 |
| `launchd-<ラベル>.stdout.log` / `.stderr.log` | launchd が拾った標準出力 |

**完了の判断はログの「成功N件」ではなく成果物で行う。**

```bash
node scripts/check-gaps.mjs   # 詰めOK行 × 記事の実在を全数照合
```

## 実行時刻の追加・変更

plist には claude の長期トークン・PATH・作業ディレクトリが入っているため、**既存の plist を複製して時刻とラベルだけ差し替える。** 手で新規作成するとトークンが入らず、その回だけ認証切れになる。

```bash
cd ~/Library/LaunchAgents
python3 - <<'PY'
import plistlib, os
SRC, HOUR = 'com.machinowa.auto.08jst.plist', 12   # ← 追加したい時刻
L = f'{HOUR:02d}jst'
d = plistlib.load(open(SRC, 'rb'))
d['Label'] = f'com.machinowa.auto.{L}'
d['ProgramArguments'] = [a.replace('08jst', L) for a in d['ProgramArguments']]
d['StandardOutPath'] = d['StandardOutPath'].replace('08jst', L)
d['StandardErrorPath'] = d['StandardErrorPath'].replace('08jst', L)
d['StartCalendarInterval'] = {'Hour': HOUR, 'Minute': 0}
dst = f'com.machinowa.auto.{L}.plist'
plistlib.dump(d, open(dst, 'wb')); os.chmod(dst, 0o600)
print('作成:', dst)
PY
launchctl load -w ~/Library/LaunchAgents/com.machinowa.auto.12jst.plist
```

止める場合:

```bash
launchctl bootout gui/$(id -u)/com.machinowa.auto.12jst
rm ~/Library/LaunchAgents/com.machinowa.auto.12jst.plist
```

- **実行中のジョブを bootout / unload しないこと。** 生成中の記事が途中で止まる。
- `setup-oauth-token.sh` は `~/Library/LaunchAgents/com.machinowa.auto.<NN>jst.plist` を自動で検出するので、時刻を増やしてもトークン配布の対象から漏れない。

## 認証切れのとき

症状: macOS 通知「マチノワ自動化 停止中」、または `automation/HEALTH-ALERT.md` ができている。

```bash
bash automation/setup-oauth-token.sh --new   # ブラウザで承認 → 全ジョブの plist に配布
bash automation/preflight.sh                 # 「claude CLI 認証OK」と出れば復旧
```

## トラブルシューティング

- **記事が1本も生成されない**: `HEALTH-ALERT.md` の有無 → 最新ログ → `check-gaps.mjs` の順に確認
- **全件エラーになる**: 認証切れかネットワーク断。`preflight.sh` を実行する
- **特定の行だけ失敗する**: `<日時>.row<行>.claude.log` を見る（写真URLが無効、店舗特定の失敗など）
- **生成後の品質確認**: 推測表現（「だろう」「はずだ」等）が混入することがある。確認手順は `申し送り.md`
