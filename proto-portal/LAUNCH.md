# マチノワ総合サイト 公開手順書

総合サイト（`/` 総合トップ・新業種・`/area`・`/station`・`/map`・`/videos`・`/find` ほか）を本番に出すための手順。
**マージ（main への取り込み）と公開（本番で見えるようにすること）は別の作業**。この手順書もそう分けてある。

- マージしても、**公開スイッチが OFF のあいだは本番が今のグルメサイトのまま変わらない**（HTML・CSS は同一、JS は gzip で平均 +0.4KB・最大 +0.6KB）。
- 公開は、Vercel の環境変数 `PORTAL_LAUNCHED=1`（Production）を入れて再デプロイするだけ。戻すのは環境変数を消して再デプロイ。
- 仕組みの詳細は `proto-portal/SPEC.md` 末尾の「公開スイッチ」、コードは `lib/portal/launch.ts`。

| | OFF（本番の既定） | ON（`PORTAL_LAUNCHED=1`、または Vercel のプレビュー） |
|---|---|---|
| `/` | 今のグルメのトップ（metadata・canonical・JSON-LD も同一） | 総合トップ（index） |
| `/gourmet` | 404 | グルメのトップ（canonical は `/gourmet`） |
| 総合サイトの全 URL（新業種・`/area`・`/station`・`/map`・`/videos`・`/find`・`/list`・`/list-data/**`・`/photos`・`/og/**`・`/search-index.json`・各 `sitemap.xml`・`/_portal/**`） | 404（`/zzz` と同じ標準の 404） | 試作どおり |
| `robots.txt` | 今と同一 | 総合サイトのサイトマップ 7 本を追記 |
| `/sitemap.xml` | 今と同一 | `/gourmet` が増える |
| グルメ店ページの SNS・共有ボタン・計測 | 出ない | 出る |
| グルメ店ページの「候補に入れる」ボタンと、画面隅の「候補リスト ◯店」 | 出ない | 出る（保存先はブラウザの localStorage。`/list` で一覧・共有） |

ON になる条件は `PORTAL_LAUNCHED` が `"1"`、または `VERCEL_ENV` が `"preview"`（プレビューのデプロイは常に ON）。
**ビルド時（静的ページ）に評価するので、値を変えたら必ず再デプロイ**。

---

## 1. 事前チェック（公開前・マージ前に毎回）

リポジトリのルートで実行する（コマンドはどのディレクトリのチェックアウトでも動く）。**zsh で貼るときは 1 行ずつ**。
ポートは例として 3242。別のポートなら `--base` と `-p` を揃える。サーバーを止めるときは自分のポートのプロセスだけ
（`lsof -iTCP:3242 -sTCP:LISTEN` で PID を見て `kill <PID>`。広い `pkill` は使わない）。

| # | 内容 | コマンド | 合格基準 |
|---|---|---|---|
| 1 | 型 | `npx tsc --noEmit -p .` | 出力なし・終了コード 0 |
| 2 | OFF のビルド | `rm -rf .next && env -u PORTAL_LAUNCHED -u VERCEL_ENV npm run build` | 終了コード 0、最後に `OK: client bundle clean` |
| 3 | **グルメ不変**（OFF が main と同一）| 1-A（下） | `PROBLEMS 0` が 2 回（static と live） |
| 4 | ON のビルド | `rm -rf .next && PORTAL_LAUNCHED=1 npm run build` | 終了コード 0、最後に `OK: client bundle clean` |
| 5 | ON を起動 | `PORTAL_LAUNCHED=1 npx next start -p 3242`（別ターミナル。**実行時にも環境変数が要る**）| `Ready` |
| 6 | 巡回 | `node proto-portal/crawl.mjs --base http://localhost:3242` | 最後の行が `PROBLEMS 0` |
| 7 | 構造化データ | `node proto-portal/check-jsonld.mjs --base http://localhost:3242` | `違反: 0` |
| 8 | 土台 | `node proto-portal/check-foundation.mjs` | `不合格: 0` |
| 9 | 駅データ | `node automation/stations/check.mjs` | `QA検査完了`、「0が正常」の項目が 0、slug 衝突 0、pref null 0 |
| 10 | 営業時間の判定 | `node proto-portal/test-openNow.mjs` | `0 failed` |
| 11 | 写真の生成物 | `node automation/portal/build-images.mjs --check` | `OK 生成物は最新`（※ 1-B 参照）|
| 12 | キーボード操作（任意）| `node proto-portal/check-keyboard.mjs --base http://localhost:3242` | `違反: 0` |
| 13 | コントラスト（任意）| `node proto-portal/check-contrast.mjs --base http://localhost:3242` | 違反 0 |
| 14 | 表示速度（任意）| `node proto-portal/measure-speed.mjs` | LCP・CLS・TBT が前回から悪化していない |
| 15 | 関数に public/ が入っていない | `find .next/server/app -name '*.nft.json' -print0 \| xargs -0 grep -l 'public/'` | **何も出ない**（ビルドは 4 のあと）|
| 16 | 日本語 URL | 下の 1-C | 20 回とも 200 |

（`crawl.mjs` は約 30 秒・1,800 リンクと共有画像 80 枚を取る。本番に向けて打つときは空いている時間に）

### 1-A. グルメ不変の検査（OFF のビルドが main と1バイトも変わらない）

`compare-off.mjs` が main と比べる。main は別ディレクトリに worktree で取り出して、**同じ条件（環境変数なし）で、続けてビルドする**
（記事の自動生成が間に入ると店・特集の内容が変わって差が出る）。

```
git fetch origin
git worktree add --detach ../gp-main-cmp origin/main
cp -cR node_modules ../gp-main-cmp/node_modules      # macOS の APFS のクローン。npm install はしない（Turbopack は node_modules のシンボリックリンクを嫌う）
cp .env.local ../gp-main-cmp/.env.local              # 中身は表示しない
(cd ../gp-main-cmp && env -u PORTAL_LAUNCHED -u VERCEL_ENV npm run build)
rm -rf .next && env -u PORTAL_LAUNCHED -u VERCEL_ENV npm run build
```

1. **ビルド出力の比較**（サーバーを起動する前に。`next start` で ISR が走ると `.next` が書き換わって、main 側の比較がずれる）:

   ```
   node proto-portal/compare-off.mjs static --main ../gp-main-cmp
   ```

   合格: `PROBLEMS 0`。出力の読み方:
   - `html（main）: 1350 ページ → 差 0 のページ 1350`（件数は日によって変わる。**差ありのページが 0**）。比べるのは title・meta（robots・canonical・og・twitter・description）・canonical・JSON-LD（パースして比較）・head のその他のタグ・stylesheet の**中身**・`<script>` を除いた body・`.meta` の status と headers。
   - 「head の並び順だけが違うページ」は違反ではない。DB を読むページで head の要素の並びがビルドのたびに入れ替わる（main を2回ビルドしても同じ揺れが出る）。
   - 「stylesheet だけ違う管理画面 4 ページ」も違反ではない。Tailwind はリポジトリの全ソースを走査するので、新しいファイルの語（`ring`・`static` など）で `/admin`・`/owner` の CSS に数百バイトが増える。公開ページの CSS は同一。
   - `.body`（robots.txt・sitemap.xml・アイコン・共有画像）は全てバイト一致。
   - 「ブランチにだけある html/.body」は総合サイトのルートで、全て 404 であること（`beauty.html` など。配信されない）。
   - JS: gzip 後の合計の差が 1 ページあたり最大 2KB 以内（実測は最大 +0.6KB・平均 +0.4KB。ルートレイアウトの `PortalShell` と店ページの `React.lazy` の分）。

2. **起動したサーバーの応答の比較**（動的なページ・404 の中身。本番の URL でも使える）:

   ```
   # main を起動して（別ターミナル）
   (cd ../gp-main-cmp && env -u PORTAL_LAUNCHED -u VERCEL_ENV npx next start -p 3242)
   node proto-portal/compare-off.mjs snapshot --base http://localhost:3242 --out /tmp/main-snapshot.json
   # main を止めて、このブランチの OFF を起動
   env -u PORTAL_LAUNCHED -u VERCEL_ENV npx next start -p 3242
   node proto-portal/compare-off.mjs live --base http://localhost:3242 --against /tmp/main-snapshot.json
   ```

   合格: `一致 66 / 差あり 0`、`PROBLEMS 0`。グルメの既存ページと、OFF では 404 のはずの総合サイトの URL（`/gourmet`・`/beauty`・`/map`・`/videos`・`/find`・`/og/**`・`/search-index.json`・各 sitemap・`/_portal/**` ほか）の、ステータス・title・meta・JSON-LD・body が main と一致する。
   一覧は `compare-off.mjs` の `GOURMET` / `PORTAL_404`。

3. **片付け**（必ず）: サーバーを止めてから

   ```
   git worktree remove --force ../gp-main-cmp
   git worktree prune
   ```

### 1-B. `build-images.mjs --check` が「最新でない」と出たとき

記事の自動生成で店が増えると、`lib/portal/shopPhotos.json` と `public/_portal/` が古くなる（参照されない・足りない WebP が出る）。
`node automation/portal/build-images.mjs` を実行して生成し直し、`lib/portal/shopPhotos.json` と `public/_portal/` をコミットする
（`--check` が `OK` になること）。足りないままでも壊れはしない（その店は元の画像のまま出る）が、揃えてから出す。
同じく駅と店の対応（`lib/stations/storeStations.json`）は店が増えても自動では増えない（`automation/stations/build-stations.mjs` は国土数値情報の
GeoJSON を別途用意して実行する）。増えた店は駅ページに載らないだけで壊れはしない。

### 1-C. 日本語 URL（断続的な 500 の確認）

Next.js のバグで、日本語を含む URL が断続的に 500 になったことがある（16.3.5 で解消。`npm ls next` が 16.3.5 以上であること）。

```
for i in $(seq 1 20); do curl -s -o /dev/null -w "%{http_code} " "http://localhost:3242/station/kyoto/%E7%A5%87%E5%9C%92%E5%9B%9B%E6%9D%A1"; done; echo
for i in $(seq 1 20); do curl -s -o /dev/null -w "%{http_code} " "http://localhost:3242/region/osaka/%E5%A4%A7%E9%98%AA%E5%B8%82%E5%8C%97%E5%8C%BA"; done; echo
```

全て 200 であること。サイトマップや canonical に出る日本語 URL は、パスセグメントを percent-encode して書く（`encodeURIComponent`）。

---

## 2. main への取り込み（スイッチ OFF のまま）

### 2-1. 時間帯と自動生成の確認

記事の自動生成（`automation/local-pipeline.sh`）は launchd が**毎日 08:00 と 22:00（JST）**に動かし、`/Users/shunta/claude/gourmet-portal`（main のチェックアウト）で
コミット・push・Vercel 本番デプロイまで行う。ぶつけない。

- 避ける時間帯: **07:50〜08:40、21:50〜22:40**
- 取り込む前に確認する（どれも出力が空、または PID が `-` なら停止中）:

  ```
  date
  pgrep -fl local-pipeline.sh          # 何も出ないこと（出たら終わるまで待つ）
  launchctl list | grep machinowa      # com.machinowa.auto.08jst / 22jst。先頭の列が - なら今は動いていない
  ```

### 2-2. proto/portal に origin/main を先に取り込む（衝突はここで解消）

```
cd /Users/shunta/claude/gp-portal
git status --short                   # 追跡ファイルの変更が無いこと
git fetch origin
git diff --stat HEAD...origin/main -- app components lib next.config.ts middleware.ts package.json   # main 側の変更の当たりを付ける
git merge origin/main                # 衝突したら解消して git commit
```

衝突しやすい場所: `components/RestaurantDetail.tsx`・`app/restaurant/[id]/page.tsx`・`app/layout.tsx`・`lib/regions.ts`・`lib/jsonld.ts`・`app/sitemap.ts`・`next.config.ts`・`middleware.ts`。
**衝突の解消で守ること**:
- `app/page.tsx` は「グルメのトップ（`GourmetHome`）＋ `metadata = { alternates: { canonical: "/" } }`」だけ。main 側でトップの中身が変わっていたら、
  `components/portal/pages/gourmet-home.tsx` に反映する（`app/page.tsx` に直接書かない。`/gourmet` と同じ中身になるように）。
- `components/SiteShell.tsx` は main のまま（総合サイト用の分岐を足さない）。
- グルメの全ページから総合サイトのクライアント部品（`PortalHeader` など）を import しない（JS が混ざる。1 の 3 で検出される）。
- 生成物（`lib/articleStores.ts` など自動生成のファイル）は main 側を採る。

取り込んだら、**1 の事前チェックを全部やり直す**（main が動いているので）。特に 3（グルメ不変）と 11（写真の生成物）。

### 2-3. main へ fast-forward

```
cd /Users/shunta/claude/gourmet-portal
git status --short                   # 追跡ファイルの変更が無いこと（未追跡の agent-teams/screenshots などは無視してよい）
git pull --ff-only origin main       # 直前に main が進んでいないか
git merge --ff-only proto/portal
```

`--ff-only` が失敗したら（main が進んだ）、2-2 に戻って取り込み直す。**マージコミットを作って押し込まない**。
問題なければ `git push origin main`。

### 2-4. OFF のままデプロイして、本番が変わっていないことを確認

**デプロイの前に**、今の本番の応答を保存する（本番は main の旧コードなので、総合サイトの URL は 404 で保存される）:

```
node proto-portal/compare-off.mjs snapshot --base https://machinowa.tokyo --out /tmp/prod-before.json
```

デプロイ（`git push` だけでは反映されないことがあるので、毎回これも）:

```
cd /Users/shunta/claude/gourmet-portal
vercel --prod --force                # --force: ビルドキャッシュを使わない（5 の「既知の注意」の fetch-cache の件）
vercel ls --prod                     # 最新が Ready / Production であること
```

デプロイが終わってから、**同じ URL の一覧を取り直して比べる**:

```
node proto-portal/compare-off.mjs live --base https://machinowa.tokyo --against /tmp/prod-before.json
```

合格: `差あり 0`。もし差が出たら、まず「間に記事の自動生成が走って店・特集の中身が変わった」かを疑う（差のある URL が `/`・`/region/**`・`/sitemap.xml` など店や特集の一覧を含むページだけなら、その可能性が高い。もう一度 snapshot → 差を見直す）。
総合サイトの URL（`/gourmet`・`/beauty`・`/map`・`/og/home` ほか）が 404 のままであること、`/robots.txt` が従来どおりであることを `curl -sI` でも確認する。
さらに、グルメの店ページ（例 `/restaurant/r01`）に SNS・共有ボタンが出ていないこと（`curl -s https://machinowa.tokyo/restaurant/r21 | grep -c 'data-share\|data-shop-link'` が `0`）。

---

## 3. 公開（スイッチ ON）

前提: 2 まで済んでいて、本番が OFF で正常に動いている。時間帯は 2-1 と同じく自動生成を避ける。

1. **環境変数を入れる**（Production だけ。Preview は条件 `VERCEL_ENV=preview` で常に ON なので不要）:
   - Vercel のダッシュボード → プロジェクト → Settings → Environment Variables → `PORTAL_LAUNCHED` = `1`、Environment は **Production のみ**
   - または CLI: `vercel env add PORTAL_LAUNCHED production`（値に `1`）
   - メインのチェックアウトの `.env.local` には入れない（ローカルのビルドが ON になる）。
2. **再デプロイ**（環境変数はビルド時に評価されるので、必ず作り直す）:

   ```
   cd /Users/shunta/claude/gourmet-portal
   vercel --prod --force
   vercel ls --prod                  # Ready / Production
   ```
3. **公開後チェック**（4）。
4. **Search Console**（4-2）。

## 4. 公開後チェック

### 4-1. 主要 URL とクローラー向けの出力

```
node proto-portal/crawl.mjs --base https://machinowa.tokyo        # PROBLEMS 0（本番に約 1,900 リクエスト。空いている時間に）
curl -s https://machinowa.tokyo/ | grep -o '<title>[^<]*</title>\|name="robots" content="[^"]*"\|rel="canonical" href="[^"]*"'
curl -s https://machinowa.tokyo/gourmet | grep -o '<title>[^<]*</title>\|rel="canonical" href="[^"]*"'
curl -s https://machinowa.tokyo/robots.txt
curl -s https://machinowa.tokyo/sitemap.xml | grep -c '<loc>https://machinowa.tokyo/gourmet</loc>'
for p in station videos beauty bodycare pet leisure stay; do curl -s -o /dev/null -w "$p/sitemap.xml %{http_code}\n" https://machinowa.tokyo/$p/sitemap.xml; done
curl -sI https://machinowa.tokyo/og/home | head -3                 # 200 / image/png
curl -sI https://machinowa.tokyo/portal-home | head -3             # 307 → /
```

見るもの:
- `/` の title が「マチノワ — 街の店を、業種をまたいで探す」、robots が `index, follow`、canonical が `https://machinowa.tokyo`。
- `/gourmet` の title が「グルメの店をエリア・特集・シーンから探す｜マチノワグルメ」、canonical が `https://machinowa.tokyo/gourmet`。
- `robots.txt` の `Sitemap:` が 8 行（`/sitemap.xml`・`/station/sitemap.xml`・業種 5 本・`/videos/sitemap.xml`）。`Disallow` は従来どおり（`/admin/` `/api/` `/agent-teams/`）。
- 新業種（`/beauty` など）は掲載 0 件なので **noindex**（件数ゲート。3 件以上で index になる）。`/area/**`・`/map`・`/find`・`/videos` も noindex のまま。駅ページは店 3 件以上のものだけ index。
- 共有画像: `https://machinowa.tokyo/og/home` が 200 で画像。X・LINE のカードデバッガーで `/` と `/station/kyoto/祇園四条` を確かめる。
- 日本語 URL を 20 回ずつ（1-C のコマンドの `localhost:3242` を `machinowa.tokyo` に）。

目で見る（スマホ幅 375 と PC 1280）: `/`・`/beauty`・`/area/tokyo`・`/station/kyoto/祇園四条`・`/map`・`/videos`・`/find?q=三宮`・グルメの店ページ（`/restaurant/r21` の SNS・共有ボタン）・グルメのトップ `/gourmet`。

### 4-2. Search Console

1. **サイトマップを送信**（「サイトマップ」→ URL を入力 → 送信）:
   - `https://machinowa.tokyo/station/sitemap.xml`（駅エリア。index 対象のページが入っている）
   - `https://machinowa.tokyo/videos/sitemap.xml`（今は空。動画に投稿日が付くと入る）
   - 既存の `https://machinowa.tokyo/sitemap.xml` は送信済みのはず。再取得させる（`/gourmet` が増えた）。
   - 新業種のサイトマップ（`/beauty/sitemap.xml` など 5 本）は今は空（掲載 0 件）。**掲載ができて index 対象が出てから**送る。
2. **URL 検査 →「インデックス登録をリクエスト」**する対象（index のページだけ。noindex のページには要らない）:
   - `https://machinowa.tokyo/`（総合トップ。これまでのグルメのトップから中身が変わる）
   - `https://machinowa.tokyo/gourmet`
   - `https://machinowa.tokyo/station`
   - `https://machinowa.tokyo/station/kyoto`
   - 店の多い駅エリアのページ数点（例 `/station/kyoto/祇園四条`・`/station/hyogo/神戸三宮`。`/station/sitemap.xml` から選ぶ）
   - 検査結果で「Google が選択した canonical」が自分自身（`/` は `https://machinowa.tokyo/`、`/gourmet` は `https://machinowa.tokyo/gourmet`）になっていること。
3. 数日〜数週間は、カバレッジ（ページ）で「noindex タグによって除外」が新業種・`/area`・`/map`・`/find` に出るのは**想定どおり**。「見つかりません (404)」が増えていたら要確認。
4. `/` はこれまでグルメのトップだったので、公開直後は検索順位とクリックが動く可能性がある（グルメの店・特集・地域ページ自体は URL も中身も変わらない）。1〜2 週間は「検索パフォーマンス」を見る。

---

## 5. 戻し方（スイッチ OFF）

1. **環境変数 `PORTAL_LAUNCHED` を削除する**（または `0` にする）。Vercel のダッシュボードか `vercel env rm PORTAL_LAUNCHED production`。
2. **再デプロイ**: `vercel --prod --force` → `vercel ls --prod` で Ready / Production。
3. 戻ったことを `node proto-portal/compare-off.mjs live --base https://machinowa.tokyo --against /tmp/prod-before.json`（2-4 で保存したもの）で確認。`差あり 0` で、総合サイトの URL が全て 404、`/robots.txt` が従来どおり。

注意:
- **Instant Rollback（ダッシュボードで前のデプロイを本番に戻す）だけでは戻らない**。環境変数が残っていると、次の自動生成のデプロイ（08:00 / 22:00）で ON に戻る。恒久的に戻すなら必ず環境変数を消す。
- 戻すと `/gourmet`・総合サイトの各サイトマップは 404 になる。Search Console に出ている総合サイトのサイトマップは、長く戻すなら削除する。`/gourmet` は 308 にしていない（再度 ON にしたとき、ブラウザや Google に古いリダイレクトが残らないため）。
- 短時間の切り戻しなら、Google への影響はほぼ出ない。

---

## 6. 既知の注意

- **`.next/cache/fetch-cache` の壊れたエントリ**: 壊れたエントリが残っていると、Supabase から取れず、**コード側のデータに黙ってフォールバック**する（ビルドは成功し、記事の中身が古い・少ないまま出る）。
  検証ビルドは必ず `rm -rf .next` から。公開のデプロイも `vercel --prod --force`（ビルドキャッシュを使わない）。ビルド後に、DB にあってコードに無い店・特集（例: 自動生成した最新の記事）が出ているか 1 件確認する。
- **Vercel の関数に `public/` を同梱させない**: Next.js のファイルトレースは、実行時に `process.cwd()` と `public` を組み合わせて `fs` で読むコードがあると `public/` 全体（`public/restaurants/` と `public/_portal/` で数百 MB）を関数に入れる。
  サーバーのコードから `public/` を `fs` で読まない（写真の対応表は `lib/portal/shopPhotos.json` に事前生成してある）。1 の 15 で `public/` が出ないこと。いまの関数のサイズは最大 約 41MB。
- **日本語 URL**: 1-C。サイトマップの駅・特集の URL は `encodeURIComponent`。`curl` で叩くときは percent-encode する。
- **OFF の 404 の仕組み**: `next.config.ts` の `rewrites`（OFF のとき、総合サイトの URL を存在しない内部パス `/__portal-off` に書き換える）。
  総合サイトに新しい最上位のパス（例 `/foo`）を足したら、`next.config.ts` の `PORTAL_OFF_SOURCES` と `components/portal/isPortalPath.ts` にも足す
  （足し忘れると、OFF の本番で 404 にならず見えてしまう。`compare-off.mjs` の `PORTAL_404` にも足すと検査で落ちる）。
  `public/` に置いたファイルでも、`rewrites`（`beforeFiles`）は先に効く。グルメの既存ファイル（`public/videos/nazatu/**` など）を巻き込まないパターンにすること。
- **グルメのページに総合サイトのクライアント部品を足さない**: ルートレイアウト・グルメの店ページ・グルメのトップから総合サイトのクライアント部品（`components/portal/*` の `"use client"`）を import すると、
  OFF でも JS がグルメの全ページに混ざる（Next.js は描画しなくても入口から辿れる JS を読み込ませる）。`compare-off.mjs static` の JS の差で検出できる。
- **`/` は rewrites で総合トップに差し替わる**ので、ON のとき `app/page.tsx`（グルメのトップ）はビルドされるが配信されない。グルメのトップは `/gourmet`。
- **IndexNow の cron（`/api/cron/ping-search`）は `/sitemap.xml` の URL だけ通知する**。総合サイトのサイトマップ（駅など）は通知されない（Search Console の送信で足りる）。
- **駅と店の対応・写真の生成物は自動では増えない**（1-B）。
- **新業種は掲載 0 件**。総合トップから「掲載準備中」の 5 業種のページへリンクがある（noindex）。掲載が 3 件になると自動で index・サイトマップに入る（`lib/seo/gate.ts`）。

## 付録: ファイル

| ファイル | 役割 |
|---|---|
| `lib/portal/launch.ts`・`launchEnv.ts` | 公開スイッチの判定（`isPortalLive()`、`assertPortalLive()`、`liveStaticParams()`）|
| `next.config.ts` | OFF: 総合サイトの URL を 404 に書き換え。ON: `/` → `/portal-home`、`/portal-home` → `/` の 307 |
| `app/page.tsx`・`components/portal/pages/gourmet-home.tsx` | グルメのトップ（OFF の `/`、ON の `/gourmet` と共通）|
| `app/portal-home/**`・`components/portal/pages/home.tsx` | 総合トップ（ON の `/`）|
| `components/portal/PortalShell.tsx`・`PortalLayout.tsx` | ON のシェル／総合サイトのヘッダー・フッター |
| `app/robots.ts`・`app/sitemap.ts` | ON のときだけ追記 |
| `proto-portal/compare-off.mjs` | OFF が main と同一かの検査 |
| `proto-portal/crawl.mjs` | ON の巡回検査 |

---

## 付録: プレビューの作り方（本番に出さない）と、2026-10-04 に起きた失敗

```
vercel pull --yes --environment=production
cp .vercel/.env.production.local .vercel/.env.preview.local
# ↓ これを忘れると、プレビューなのに公開スイッチが OFF でビルドされる（必須）
sed -i '' -e 's/^VERCEL_ENV=.*/VERCEL_ENV="preview"/' -e 's/^VERCEL_TARGET_ENV=.*/VERCEL_TARGET_ENV="preview"/' .vercel/.env.preview.local
chmod 600 .vercel/.env.*.local
rm -rf .vercel/output && vercel build          # builds.json の "target": "preview"
grep -c '__portal-off' .vercel/output/config.json   # 0 であること（1以上なら OFF でビルドされている）
vercel deploy --prebuilt --archive=tgz --yes   # --prod は付けない
rm -f .vercel/.env.preview.local .vercel/.env.production.local
```

- **失敗の記録**: 本番用に pull した env には `VERCEL_ENV="production"` が入っている。それをそのまま preview 用に写してビルドしたため、
  公開スイッチ導入後のプレビュー（9o6pl27ju・5g1tool5w）は OFF でビルドされ、`/` はグルメのトップ、総合サイトの全ルートが 404 だった。
  店ページだけは実行時（Vercel 上は `VERCEL_ENV=preview`）に作り直されて ON になるため、「最初の1回だけ古い表示」という紛らわしい症状になった。
- **デプロイ後に必ず確認する**: `/` のタイトルが総合トップ（「マチノワ — 街の店を、業種をまたいで探す」）、`/gourmet` `/find` `/beauty` `/station/tokyo` が 200、
  店ページが初回から新しい部品で出ること。本番 `https://machinowa.tokyo/find` は 404 のまま。
- ビルドログの `fetch failed` / `fallback to data.ts` が 0 であること（Supabase のタイムアウトで予備データのページが混ざる）。

## 付録: 店ページの行動ボタン 6案（2026-10-04）
- 仕様 `proto-portal/SNS-BUTTONS-BRIEF.md`（案1 罫・案2 印・案3 箱）と `SNS-BUTTONS-BRIEF-2.md`（案4 玉・案5 駒・案6 帯。アイコンと短いラベルだけの簡潔版）。
  部品 `components/portal/ShopActions*.tsx`（案4〜6 は `ShopActionsTama/Koma/Obi.tsx`、共通部品 `ShopActionsSlim.tsx`、CSS は `shopActionsCss2.ts`）、`lib/portal/shopActions.ts`。見比べ `/proto-sns`（OFF は 404）。
- 店ページの隅の切替「ボタン案 1〜6」は、プレビューとローカルだけ（`previewTools`。スマホでは「案 N」に畳む）。URL の `?sns=1〜6` でも切り替わる。既定は案1。
- 案を採用したら: 残り5案の部品と `app/proto-sns`、`next.config.ts` の `/proto-sns` の行、`compare-off.mjs` の同じ行を消す。
- **未実施**: main との全ページ比較（1-A の `compare-off.mjs static / live`）。取り込み前に必ず実行する。

## 付録: こだわり条件で絞る（2026-10-05・試作）
- 仕様 `proto-portal/FILTERS-BRIEF.md`、数えた結果と検査の記録 `proto-portal/FILTERS-COVERAGE.md`。公開スイッチ ON のときだけ。OFF の `/search`・`/`（グルメのトップ）は出力が変わらない（検査済み）。
- **どこに何があるか**: `/search` に「こだわり条件」のパネル（予算の帯・営業時間・駅徒歩・予約リンク・席数・設備・特徴・いま営業中）。URL は `?budget=3000&f=late,walk5`（既存の `q` `region` `cuisine` `tag` と併用。canonical `/search`・noindex のまま）。
  グルメのトップ `/gourmet`（ON）の「さがす」の下に入口「こだわり条件」→ `/search`。
  - 判定: `lib/portal/facetParse.ts`（文字列 → 条件）・`facetRow.ts`（店1軒ぶん）・`facetDefs.ts`（条件の定義・URL）・`facets.ts`（サーバーで表を作り、出す条件を基準で決める）。
  - 画面: `components/portal/SearchFacets.tsx`（React.lazy。`components/SearchClient.tsx` が ON のときだけ読み込む）・`searchFacetsCss.ts`（CSS は `.fc-`。`<style href precedence>` で出す。`app/globals.css` は変えていない）・`FacetEntrance.tsx`（グルメのトップの入口）。
  - クライアントへ渡すのは、店ID＋判定ビットの小さな表（約 60KB。全店分）だけ。文字列の解析はサーバー側。
- **出す条件の基準**（`lib/portal/facets.ts` が毎回数えて決める）: 予算・営業時間帯・駅徒歩・予約・席数は「判定できた店 100 以上かつはい 10 以上」。設備・特徴は「記載あり 10 以上」かつ、無作為 30 件の検査（誤り 0）を通して `VERIFIED_FEATURES` に入れたもの。
  判定は「はい」と「不明」が基本（設備・特徴に「いいえ」は無い）。店の案内に書かれていないことは条件に含めない。星・点数・口コミ数は使わない・出さない。
- **数え直し方**: `node --env-file=.env.local proto-portal/count-facets.mjs --md 出力.md [--detail]`（全店・条件ごとの 判定できた店／はい／不明、元の文字列の例、設備・特徴の無作為30件の検査表）。
  判定の単体テストは `node proto-portal/test-facets.mjs`。データが増えたら、数え直して基準を確かめ、設備・特徴は拾い方（`facetParse.ts` の `RULES`・`NEG`・`HEDGE`）を変えたら検査をやり直してから `VERIFIED_FEATURES` に足す。
- 設備・特徴の文章は tags・desc・body。highlights（特集記事の見出し）は店ページに出ない文なので使わない（使うと店ページで確かめられない「記載あり」が出る）。
