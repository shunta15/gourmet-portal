# マチノワ総合サイト 公開手順書

総合サイト（`/` 総合トップ・新業種・`/area`・`/station`・`/map`・`/videos`・`/find` ほか）を本番に出すための手順。
**マージ（main への取り込み）と公開（本番で見えるようにすること）は別の作業**。この手順書もそう分けてある。

- マージしても、**公開スイッチが OFF のあいだは本番が今のグルメサイトのまま変わらない**（HTML・CSS は同一、JS は gzip で平均 +0.6KB・最大 +0.86KB。2026-10-06 の 3機能取り込み後の実測）。
- 公開は、Vercel の環境変数 `PORTAL_LAUNCHED=1`（Production）を入れて再デプロイするだけ。戻すのは環境変数を消して再デプロイ。
- 仕組みの詳細は `proto-portal/SPEC.md` 末尾の「公開スイッチ」、コードは `lib/portal/launch.ts`。

| | OFF（本番の既定） | ON（`PORTAL_LAUNCHED=1`、または Vercel のプレビュー） |
|---|---|---|
| `/` | 今のグルメのトップ（metadata・canonical・JSON-LD も同一） | 総合トップ「にぎわいの輪」（index。配色は 2 色（白磁と藍／濃紺と銅）を開くたびにランダム。title は「街と店、店と人。つながる輪を、マチノワから。」） |
| `/gourmet` | 404 | グルメのトップ（canonical は `/gourmet`）。**デザインは暖簾**（2026-10-09 の発注者の決定。見本 `/proto-noren` のトップと同じ画面で、店・特集の行き先だけ本物のページ。店ページ・特集記事ページは今のグルメのまま。末尾「グルメのトップ（暖簾）」）|
| `/proto-hub/**`（総合トップの色を固定して見るルート） | 404 | プレビュー（`VERCEL_ENV=preview`）とローカルの `next dev` だけ。**公開スイッチ ON の本番でも 404** |
| 総合サイトの全 URL（新業種・`/area`・`/station`・`/map`・`/videos`・`/find`・`/list`・`/list-data/**`・`/photos`・`/omakase`・`/og/**`・`/search-index.json`・各 `sitemap.xml`・`/_portal/**`） | 404（`/zzz` と同じ標準の 404） | 試作どおり |
| `robots.txt` | 今と同一 | 総合サイトのサイトマップ 8 本を追記 |
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
| 6 | 巡回 | `node proto-portal/crawl.mjs --base http://localhost:3242` | 最後の行が `PROBLEMS 0`（新業種は、サイトマップに載るページ＝index・載らないページ＝noindex、店ページは JSON-LD に星・口コミなし・特集の切り替えどおりかも見る）|
| 7 | 構造化データ | `node proto-portal/check-jsonld.mjs --base http://localhost:3242` | `違反: 0`（星・口コミのプロパティが無いことも見る。新業種の店ページは --base のサーバーから取って検査）|
| 8 | 土台 | `node proto-portal/check-foundation.mjs` | `不合格: 0` |
| 9 | 駅データ | `node automation/stations/check.mjs` | `QA検査完了`、「0が正常」の項目が 0、slug 衝突 0、pref null 0 |
| 10 | 営業時間の判定 | `node proto-portal/test-openNow.mjs` | `0 failed` |
| 11 | 写真の生成物 | `node automation/portal/build-images.mjs --check` | `OK 生成物は最新`（※ 1-B 参照）|
| 12 | キーボード操作（任意）| `node proto-portal/check-keyboard.mjs --base http://localhost:3242`（総合トップは 2 色・PC とスマホ幅・動きを減らす設定で Tab の順番を見る）| `違反: 0` |
| 13 | コントラスト（任意）| `node proto-portal/check-contrast.mjs --base http://localhost:3242`（総合トップは `/` を 2 色それぞれ測る。最初の画面は `--motion`（動きを減らさない設定で、6 業種を順に選びながら 2 色とも）を付けて別に測る）| 違反 0 |
| 14 | 表示速度（任意）| `node proto-portal/measure-speed.mjs` | LCP・CLS・TBT が前回から悪化していない |
| 15 | 関数に public/ が入っていない | `find .next/server/app -name '*.nft.json' -print0 \| xargs -0 grep -l 'public/'` | **何も出ない**（ビルドは 4 のあと）|
| 16 | 日本語 URL | 下の 1-C | 20 回とも 200 |
| 17 | 総合トップ（にぎわいの輪）の動作 | `node proto-portal/check-hub.mjs --base http://localhost:3242` | `違反: 0`（title・言葉が COPY-FINAL.md と一致／2 色が出てちらつかない／業種の扱い（店の数が 1 以上＝掲載中・実数、0＝掲載準備中）／数字／輪を回す／動きを減らす設定／スクリプトなし／横スクロール 0・コンソールエラー 0・壊れた画像 0）|

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
   - JS: gzip 後の合計の差が 1 ページあたり最大 2KB 以内（実測は最大 +0.86KB・平均 +0.6KB。ルートレイアウトの `PortalShell` と店ページの `React.lazy` の分。2026-10-06: 店ページ +855B・特集ページ +350〜508B（`FeatureClient` の `React.lazy`）・地域/シーン +340B 前後）。

2. **起動したサーバーの応答の比較**（動的なページ・404 の中身。本番の URL でも使える）:

   ```
   # main を起動して（別ターミナル）
   (cd ../gp-main-cmp && env -u PORTAL_LAUNCHED -u VERCEL_ENV npx next start -p 3242)
   node proto-portal/compare-off.mjs snapshot --base http://localhost:3242 --out /tmp/main-snapshot.json
   # main を止めて、このブランチの OFF を起動
   env -u PORTAL_LAUNCHED -u VERCEL_ENV npx next start -p 3242
   node proto-portal/compare-off.mjs live --base http://localhost:3242 --against /tmp/main-snapshot.json
   ```

   合格: `差あり 0`、`PROBLEMS 0`（一致の件数は URL の一覧の長さ。2026-10-06 は 77）。グルメの既存ページと、OFF では 404 のはずの総合サイトの URL（`/gourmet`・`/beauty`・`/map`・`/videos`・`/find`・`/og/**`・`/search-index.json`・各 sitemap・`/_portal/**` ほか）の、ステータス・title・meta・JSON-LD・body が main と一致する。
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
- `/` の title が「街と店、店と人。つながる輪を、マチノワから。」（前後に何も付かない。`og:title`・`twitter:title` も同じ）、robots が `index, follow`、canonical が `https://machinowa.tokyo`、`description` が「ひとつの店との出会いが、…地域ポータルサイトです。」（`og:description`・`twitter:description` も同じ）。
  ```
  curl -s https://machinowa.tokyo/ | grep -o '<title>[^<]*</title>\|name="description" content="[^"]*"\|property="og:[a-z:]*" content="[^"]*"\|name="twitter:[a-z:]*" content="[^"]*"'
  ```
- `/gourmet` の title が「グルメの店をエリア・特集・シーンから探す｜マチノワグルメ」、canonical が `https://machinowa.tokyo/gourmet`。
- `robots.txt` の `Sitemap:` が 9 行（`/sitemap.xml`・`/station/sitemap.xml`・業種 5 本・`/videos/sitemap.xml`・`/photos/sitemap.xml`）。`Disallow` は従来どおり（`/admin/` `/api/` `/agent-teams/`）。
- 新業種は、**実在の店のデータが入っている**（ビューティー・ボディケア。`lib/places/generated/{beauty,bodycare}.json`。2026-10-09 時点でビューティー 5 店・ボディケア 3 店。公開までに増える）。index の決まりは件数ゲート（`lib/seo/gate.ts`、3 件以上）で、**ページごとの件数**で決まる: 業種のトップ（`/beauty`）と店ページ（`/beauty/shop/<id>`）はその業種の掲載数が 3 件以上で index、都道府県・種類・種類×都道府県・シーンのページは、絞り込んだあとの店が 3 件以上のものだけ index（店が 1〜2 件の絞り込みは noindex のまま。店が増えると自動で index になる）。ペット・おでかけ・ステイは掲載 0 件なので全ページ noindex。`/area/**`・`/map`・`/find`・`/videos` も noindex のまま。駅ページは店 3 件以上のものだけ index。
- 共有画像: `https://machinowa.tokyo/og/home?v=2` が 200 で画像（白磁の地・藍の文字・金の細い輪。キャッチコピーそのまま。`lib/seo/og.ts` の `OG_VERSION` が 2）。X・LINE のカードデバッガーで `/` と `/station/kyoto/祇園四条` を確かめる。
- 日本語 URL を 20 回ずつ（1-C のコマンドの `localhost:3242` を `machinowa.tokyo` に）。

目で見る（スマホ幅 375 と PC 1280）: `/`・`/beauty`・`/beauty/shop/be0001`・`/bodycare`・`/area/tokyo`・`/station/kyoto/祇園四条`・`/map`・`/videos`・`/find?q=三宮`・グルメの店ページ（`/restaurant/r21` の SNS・共有ボタン）・グルメのトップ `/gourmet`。

### 4-2. Search Console

1. **サイトマップを送信**（「サイトマップ」→ URL を入力 → 送信）:
   - `https://machinowa.tokyo/station/sitemap.xml`（駅エリア。index 対象のページが入っている）
   - `https://machinowa.tokyo/videos/sitemap.xml`（今は空。動画に投稿日が付くと入る）
   - `https://machinowa.tokyo/photos/sitemap.xml`（`/photos` の 1 ページだけ。写真が 3 枚以上あるときに載る）
   - 既存の `https://machinowa.tokyo/sitemap.xml` は送信済みのはず。再取得させる（`/gourmet` が増えた）。
   - 新業種のサイトマップ: **`/beauty/sitemap.xml`・`/bodycare/sitemap.xml` を送る**（index 対象のページが載っている。店ページ `/beauty/shop/<id>`・`/bodycare/shop/<id>` を含む。載せ方は `components/portal/pages/sitemap.ts`。`robots` が index になるページだけ。特集ページ `/{業種}/feature/<id>` は載せない）。`/pet`・`/leisure`・`/stay` のサイトマップは掲載 0 件で空なので、掲載ができて index 対象が出てから送る。
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
- **新業種（ビューティー・ボディケア）は実在の店のデータがある**（上の 4-1 のとおり。以前の「掲載 0 件・noindex・サイトマップは空」の前提は古い）。総合トップ（にぎわいの輪）の「掲載中」「掲載準備中」は、**業種ごとの掲載数（実データを数える。`lib/portal/hub.ts` の `HubItem.count`）で決まる**: 1 以上の業種は「掲載中」（グルメと同じ形。「◯◯に入る」。数字は、グルメが「店・特集・いま営業中」、ほかの掲載中の業種は実数の「N店」だけ）、0 の業種は「掲載準備中」。2026-10-09 の公開時点は、グルメ・ビューティー・ボディケアが掲載中、ペット・おでかけ・ステイが掲載準備中（`check-hub.mjs` は `lib/places/generated/*.json` の件数から期待値を決める）。掲載準備中でも、ビューティー・ボディケアは「ページを見る」でページへ入れる。ペット・おでかけ・ステイは「掲載準備中」と出るだけで、リンクにしない（`<button>`。押しても移動しない）。フッターの業種の一覧には 6 業種ともリンクが残る。ビューティー・ボディケアの輪は、掲載中でも準備中でも「その業種の色の空の丸」（料理の写真の輪はグルメだけ。`data-ring`）。index・サイトマップへの載り方は 4-1 の件数ゲート（`lib/seo/gate.ts`）。
- **新業種の特集（2026-10-09 公開②で有効化。監査済みの 9 本だけ）**: `lib/places/features.ts` の `VERTICAL_FEATURES_ENABLED = true`。出す 9 本は `beauty-7`・`beauty-16`・`beauty-48`・`beauty-92`・`bodycare-9`・`bodycare-33`・`bodycare-49`・`bodycare-68`・`bodycare-100`（`beauty-91` は出さない）。`automation/vertical-stores/features/` には 10 本あるので、データを作るときは 9 本だけを写した別フォルダを `--features` に渡す（`build-places.mjs` と `build-features.mjs` の両方に同じフォルダを渡す）。特集だけがある店（`beauty-48`・`beauty-92`・`bodycare-49`・`bodycare-68`・`bodycare-100`）にも店ページが出る。以下は false のときの挙動: false のあいだ、特集のデータを空として扱う（入口はこの 1 か所）ので、`/beauty/feature/<id>`・`/bodycare/feature/<id>` は 404、店ページの「特集記事を読む」リンクは出ず、サイトマップにも載らない。出すときは `true` にして再デプロイ（`crawl.mjs` はこの値を読んで期待を切り替える）。
- **グルメのトップとビューティーのトップの差し替え**: グルメのトップ（`/gourmet`）は「暖簾」、ビューティーのトップ（`/beauty`）は「曇り鏡」のデザインになる（別の担当が組み込み中。組み込みが済むまでは、それぞれ今のトップのまま）。組み込み後は、1 の事前チェックを全部やり直す。
- **新業種は掲載 0 件**。総合トップ（にぎわいの輪）では、グルメだけが「掲載中」（実数を出す）。ビューティー・ボディケアは「掲載準備中」で、「ページを見る」でページへ入れる（noindex）。ペット・おでかけ・ステイは「掲載準備中」と出るだけで、リンクにしない（`<button>`。押しても移動しない）。フッターの業種の一覧には 6 業種ともリンクが残る。掲載が 3 件になると自動で index・サイトマップに入る（`lib/seo/gate.ts`）。
- **ビューティーのトップ `/beauty` は「曇り鏡」（2026-10-09 オーナー決定）**: ON のとき `app/beauty/(top)/page.tsx` が `components/portal/vert/kumori/KumoriPage.tsx`（見本 `/proto-hub/beauty-kumori` と同じ部品）を出す。枠は共通ヘッダーなし・共通フッターあり（総合トップと同じ hub の枠）。`app/beauty` は route group で 2 つに分けた（URL は変わらない）: `(top)` = トップだけ（hub の枠）、`(sub)` = 種類・都道府県・利用シーン・店ページ・サイトマップ・not-found（従来の共通ヘッダーありの枠）。件数の取り方と 0 件／1 以上の出し分けは今の `VerticalHub` と同じ（`KumoriHero` の `total`、`KumoriBelow`。0 のあいだは「掲載準備中」、1 以上は「掲載中」「掲載状況」「現在の掲載は N 件です。」）。metadata（title・description・canonical・robots・OGP）は `verticalHubMetadata("beauty")`、構造化データの BreadcrumbList も従来と同じ。**写真（Unsplash）は `lib/portal/vert/kumori/data.ts` の `KUMORI_PHOTOS`（既定 true）1 か所で出す／出さないを切り替える**（false のときは写真・クレジットが出ず、色面と絵だけで成り立つ）。`check-contrast.mjs`・`check-keyboard.mjs` が `/beauty` を測るときは曇り鏡（共通ヘッダーなし）を測ることになる。
- **総合トップは「にぎわいの輪」（2 色ランダム）**: 配色は sometsuke（白磁と藍）・akagane（濃紺と銅）の 2 色で、開くたびにランダム（半々）。ページ自体はどちらの色でも同じ HTML（静的に配信される）。言葉は `proto-portal/hub-concepts/COPY-FINAL.md`（発注者の決定）で、`components/portal/hubs/nigiwai/copy.ts` に一字一句写してある。言葉を変えるときは、COPY-FINAL.md・`copy.ts`・`app/portal-home/page.tsx` の title/description・共有画像 `HomeCard`（`components/portal/og/cards.tsx`）を揃え、`check-hub.mjs` で突き合わせる。title はキャッチコピーそのまま（`buildMetadata` は接尾辞を足さない。ルートの `app/layout.tsx` の title は文字列で、template ではない）。
- **色を固定して見るルートは、プレビューとローカルだけ**: `/proto-hub/nigiwai`（`/` と同じもの）・`/proto-hub/nigiwai/sometsuke`・`/proto-hub/nigiwai/akagane`。判定は `lib/portal/launch.ts` の `isPreviewOrLocal()`（`VERCEL_ENV=preview` または `NODE_ENV!=="production"`）で、`app/proto-hub/layout.tsx` が 404 にする。**本番（`VERCEL_ENV=production`）は公開スイッチ ON でも 404**。ローカルでも `next build` → `next start`（`NODE_ENV=production`）では開けない（`next dev` では開ける）。`next.config.ts` の `PORTAL_OFF_SOURCES` の `/proto-hub/:path*`・`isPortalPath.ts`・`compare-off.mjs` の `PORTAL_404`（`/proto-hub/nigiwai`）は、OFF の 404 のために残してある。
- **総合トップの検査を自動化するときの注意**: 色は `Math.random` の差し替えで固定しない（値が固定されると、ページの React のイベントが動かなくなる。2026-10-07 に確認）。ページの抽選スクリプトが読む `history.state.ngTheme` を、ページのスクリプトより先に `addInitScript` で入れて固定する（`check-hub.mjs`・`check-keyboard.mjs`・`check-contrast.mjs` はそうしている）。

## 付録: ファイル

| ファイル | 役割 |
|---|---|
| `lib/portal/launch.ts`・`launchEnv.ts` | 公開スイッチの判定（`isPortalLive()`、`assertPortalLive()`、`liveStaticParams()`）|
| `next.config.ts` | OFF: 総合サイトの URL を 404 に書き換え。ON: `/` → `/portal-home`、`/portal-home` → `/` の 307 |
| `app/page.tsx`・`components/portal/pages/gourmet-home.tsx` | グルメのトップ（OFF の `/` だけ。ON の `/gourmet` は暖簾に替わった）|
| `app/gourmet/{layout,page}.tsx`・`components/portal/pages/gourmet-noren-home.tsx`・`components/portal/noren/NorenFrame.tsx` | ON の `/gourmet`（暖簾のトップ。見本 `app/proto-noren/{layout,page}.tsx` と同じ部品を使い回す）|
| `app/portal-home/**`・`components/portal/pages/home.tsx`・`components/portal/hubs/nigiwai/**`・`lib/portal/hubs/nigiwai/**`・`lib/portal/hub.ts` | 総合トップ「にぎわいの輪」（ON の `/`）|
| `app/proto-hub/**`・`lib/portal/launch.ts`（`isPreviewOrLocal`）| 色を固定して見るルート（プレビュー・ローカルだけ）|
| `components/portal/og/cards.tsx`（`HomeCard`）・`lib/seo/og.ts`（`OG_VERSION`）| `/og/home`（総合トップの共有画像）|
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
- **デプロイ後に必ず確認する**: `/` のタイトルが総合トップ（「街と店、店と人。つながる輪を、マチノワから。」）、`/gourmet` `/find` `/beauty` `/station/tokyo` が 200、
  店ページが初回から新しい部品で出ること。本番 `https://machinowa.tokyo/find` は 404 のまま。
- ビルドログの `fetch failed` / `fallback to data.ts` が 0 であること（Supabase のタイムアウトで予備データのページが混ざる）。

## 付録: 店ページの行動ボタン「玉」（2026-10-07 に 6 案から 1 案に決定）
- 公開スイッチ ON のときだけ。店ページ（`/restaurant/[id]`）の予約・電話・地図・SNS・街と地域の他の店・共有を、丸みのあるカプセル型のボタン（「玉」。左の丸にアイコン、右に短いラベル。主役の予約または電話だけ朱）で出す。発注者が 6 案（罫・印・箱・玉・駒・帯）の見比べから案4「玉」を選んだ。
- **どこに何があるか**: `components/portal/ShopActions.tsx`（入口。`RestaurantDetail` が `React.lazy` で読む。CSS を `<style href precedence>` で出す）→ `ShopActionsTama.tsx`（ボタンの並び・脇役リンク・共有）・`ShopActionsParts.tsx`（自作アイコン・リンク 1 つ分 `Act`・共有の動き `useShare`・現れ方 `useEnter`）・`shopActionsCss.ts`（CSS。`.sa-` 接頭辞）。店の事実 → ボタンの一覧に直す純関数は `lib/portal/shopActions.ts`（値がある項目だけ。補足の @アカウント名・電話番号・住所・座標は出さない）。仕様は `proto-portal/SNS-BUTTONS-BRIEF-2.md`（案4〜6）。
- **整理したもの（2026-10-07）**: 残り 5 案の部品（罫・印・箱・駒・帯）と、見比べページ `app/proto-sns`、`next.config.ts` の `/proto-sns` の行、`compare-off.mjs` の同じ行、店ページの隅の切替「ボタン案 1〜6」（`previewTools`）と URL の `?sns=` での切替、`.sa-pv`・`.sa-h-bar` の CSS（`saveListCss.ts` の逃げ）を消した。`/proto-sns` は ON でも OFF でも、ルートが無いので標準の 404。`SNS-BUTTONS-BRIEF.md`（案1〜3）と `SNS-BUTTONS-BRIEF-2.md` は、決める前の設計の記録として残してある（`SNS-BUTTONS-BRIEF.md` の案は採用されていない）。
- **整理のとき確かめたこと**: 整理の前後で、店ページ 5 軒（`r21`・`r06`・`r23`・`r01`・`r299`）×（PC 1280・スマホ 375）の `.sa` の HTML（属性の並びを除く）・各ボタンの位置と大きさが、すべて一致した。スマホ（幅 768px 以下）の上の余白 40px は、これまで案1 の CSS が先に読まれて効いていたものを `.sa` に書き写したもの（見た目はこれまでの案4 のまま）。
- **main との全ページ比較（1-A）**: 2026-10-08 に、main（8adce61）を取り込んだあとで実行し、`compare-off.mjs static`（html 1365 ページ差 0・JS は 1 ページあたり最大 +854B・平均 +603B）と `live`（77 件一致）の両方が `PROBLEMS 0`。公開の直前（2-2 の取り込みのあと）に、もう一度やり直す。

## 付録: こだわり条件で絞る（2026-10-05・試作）
- 仕様 `proto-portal/FILTERS-BRIEF.md`、数えた結果と検査の記録 `proto-portal/FILTERS-COVERAGE.md`。公開スイッチ ON のときだけ。OFF の `/search`・`/`（グルメのトップ）は出力が変わらない（検査済み）。
- **どこに何があるか**: `/search` に「こだわり条件」のパネル（予算の帯・営業時間・駅徒歩・予約リンク・席数・設備・特徴・いま営業中）。URL は `?budget=3000&f=late,walk5`（既存の `q` `region` `cuisine` `tag` と併用。canonical `/search`・noindex のまま）。
  グルメのトップ `/gourmet`（ON）に入口「こだわり条件」→ `/search`。写真から探す（`/photos`）の入口と同じスロット（`HomeClient` の `portalEntrances`）に並べて出す（統合後。下の「4機能の統合」参照）。
  - 判定: `lib/portal/facetParse.ts`（文字列 → 条件）・`facetRow.ts`（店1軒ぶん）・`facetDefs.ts`（条件の定義・URL）・`facets.ts`（サーバーで表を作り、出す条件を基準で決める）。
  - 画面: `components/portal/SearchFacets.tsx`（React.lazy。`components/SearchClient.tsx` が ON のときだけ読み込む）・`searchFacetsCss.ts`（CSS は `.fc-`。`<style href precedence>` で出す。`app/globals.css` は変えていない）・`FacetEntrance.tsx`（グルメのトップの入口）。
  - クライアントへ渡すのは、店ID＋判定ビットの小さな表（約 60KB。全店分）だけ。文字列の解析はサーバー側。
- **出す条件の基準**（`lib/portal/facets.ts` が毎回数えて決める）: 予算・営業時間帯・駅徒歩・予約・席数は「判定できた店 100 以上かつはい 10 以上」。設備・特徴は「記載あり 10 以上」かつ、無作為 30 件の検査（誤り 0）を通して `VERIFIED_FEATURES` に入れたもの。
  判定は「はい」と「不明」が基本（設備・特徴に「いいえ」は無い）。店の案内に書かれていないことは条件に含めない。星・点数・口コミ数は使わない・出さない。
- **数え直し方**: `node --env-file=.env.local proto-portal/count-facets.mjs --md 出力.md [--detail]`（全店・条件ごとの 判定できた店／はい／不明、元の文字列の例、設備・特徴の無作為30件の検査表）。
  判定の単体テストは `node proto-portal/test-facets.mjs`。データが増えたら、数え直して基準を確かめ、設備・特徴は拾い方（`facetParse.ts` の `RULES`・`NEG`・`HEDGE`）を変えたら検査をやり直してから `VERIFIED_FEATURES` に足す。
- 設備・特徴の文章は tags・desc・body。highlights（特集記事の見出し）は店ページに出ない文なので使わない（使うと店ページで確かめられない「記載あり」が出る）。

## 付録: 4機能の統合（2026-10-05・試作。こだわり条件・ジャンル×駅・候補リスト・写真から探す）
- 4つのブランチ（`proto/feat-genre`・`proto/feat-list`・`proto/feat-photos` と、こだわり条件）を `proto/portal` に統合した。OFF のグルメは main と同一（1-A の `compare-off.mjs` static / live とも `PROBLEMS 0`）。
- **入口のスロットは1つ**: グルメのトップ `/gourmet`（ON）に出す総合サイトの入口（「こだわり条件でさがす」「写真から探す」）は、`components/portal/pages/gourmet-home.tsx` が1つの `portalEntrances`（ReactNode）にまとめて `HomeClient` に渡す。OFF の `/` には prop ごと渡さない。入口を増やすときもスロットは増やさず、この ReactNode に足す。
- **候補リスト（`/list`）は、表示できない店を自動で外さない**: 店のデータ（`/list-data/{ID}`）は作成時に静的に作るので、プレビューの作成後に載った店は 404 になる。これを保存から消すと、保存したのに消えて見える。自分のリストでは「この店はいま表示できません」の行で残し、手で「外す」だけできる。共有URLの表示では、表示できない店は並べず、件数だけ知らせる。
- **保存ボタン（「候補に入れる」）の置き場所**: 店ページ・駅／ジャンル×駅／都道府県／業種ページの店カード・`/search` の結果カード（こだわり条件つき。カード全体のリンクの隅に重ねる）・`/photos` の大きな表示（`<dialog>` の中）・`/list` の共有リスト。
- **`/search` の結果カードの札**: 各店に当てはまる条件を最大4つ。選んでいる条件を先頭に（生成りのベタ＋左に朱の線）、続けて予算の帯・当てはまる店が少ない条件の順・いま営業中。設備・特徴は必ず「〜の記載あり」。
- **`crawl.mjs` の「SNS・共有ボタン」の検査**は、店ページの行動ボタン `ShopActions`（`role="group" aria-label="この店を共有"` と、行の `data-sa-id`）に合わせてある。旧部品（`ShopLinks`・`ShareButtons` の `data-shop-link`）は店ページには出ない（総合サイトのページの共有は今も `ShareButtons`）。

## 付録: おまかせ提案 /omakase（2026-10-06・試作）
- 仕様・結び付けの表・数えた結果 `proto-portal/OMAKASE-COVERAGE.md`。4 つの質問（どこで／誰と／予算／気分）に答えると、条件に合う店を 3 軒ほど出す（公開スイッチ ON のときだけ。OFF は `/omakase` が 404）。
- **どこに何があるか**: ルート `app/omakase/`（layout は `PortalLayout`・`omakase.css`）→ `components/portal/pages/omakase.tsx`（metadata・noindex の決め方）→ `components/portal/omakase/`（`OmakaseApp` 本体・`Results` 暖簾と結果・`Pool` 点のふるい・`CountRoll`・`useShops`）。
  判定は `lib/portal/omakaseDefs.ts`（質問・結び付け・URL）・`omakaseRows.ts`（店 1 軒ぶんの表。`/search` も同じ関数）・`omakase.ts`（サーバー。こだわり条件の `buildFacetPayload` から作る）。
  入口は `/gourmet` の `OmakaseEntrance.tsx`（`gourmet-home.tsx` の `portalEntrances`。こだわり条件・写真から探すと同じスロット）。`/search`（ON）は `?r= ?p= ?who= ?b= ?m=` があれば、その答えに合う店に先に絞る（`SearchFacets.tsx`）。
- **公開スイッチまわり**: `assertPortalLive()`（layout と page）・`next.config.ts` の `PORTAL_OFF_SOURCES`（`/omakase/:path*`）・`compare-off.mjs` の `PORTAL_404`・`components/portal/isPortalPath.ts`・この表。サイトマップには載せない。
- **SEO**: 答えのある URL は `noindex, follow`（canonical `/omakase`）。答えの無い `/omakase` だけ、掲載店 3 店以上で index。`crawl.mjs` にこの判定の検査を足した（`/omakase` は index、答えつきは noindex）。
- **データの前提**: 結果の店は `/list-data/{店ID}`（候補リストと同じ静的 JSON）から 3 軒ぶんだけ取る。全店データはクライアントに渡さない（店ID＋判定の小さな表 約 11KB。gzip で約 3KB）。
- **数え直し・テスト**: `node --env-file=.env.local proto-portal/count-omakase.mjs`、`node proto-portal/test-omakase.mjs`。


## 付録: 総合トップ「にぎわいの輪」— 2 色ランダム（2026-10-07・試作から差し替え）
- 公開スイッチ ON の `/` だけ（OFF の `/` はグルメのトップのまま。出力は変わらない）。発注者が決めた言葉は `proto-portal/hub-concepts/COPY-FINAL.md`。過去の案・設計書（`COPY.md`・`hikariwa.md`・`mitsuwa.md`・`hamon.md`・`nigiwai.md`・`HUB4-BRIEF.md`）は不採用の案を含む資料で、決定ではない（`HUB-BRIEF.md` は、差し替える前の古い「輪」の仕様）。
- **どこに何があるか**: `app/portal-home/layout.tsx`（`PortalLayout hub`＝共通ヘッダーを出さず、`#mp-footer` の中にフッター）・`page.tsx`（metadata）→ `components/portal/pages/home.tsx`（`<NigiwaiPage theme="sometsuke" random />`）→ `components/portal/hubs/nigiwai/`（`NigiwaiPage.tsx` サーバー・`Nigiwai.tsx` 最初の画面（クライアント）・`Statement.tsx` 下のブロック・`RandomTheme.tsx` 色の抽選・`copy.ts` 言葉・`nigiwai.css`・`themes.css` 色の値）。データは `lib/portal/hub.ts`（掲載店数・公開中の特集の本数・「いま営業中」を数えるための営業予定の表）と `lib/portal/hubs/nigiwai/photos.ts`（輪の写真）。
- **言葉**: h1＝キャッチコピー（「街と店、店と人。」「つながる輪を、」「マチノワから。」の 3 行に組む。textContent はキャッチコピーと同じ）、リード＝第 1 段落の 3 行、下のブロック＝第 1 段落（3 つの場面）・第 2 段落・第 3 段落（結び）。title＝キャッチコピー、description＝コンセプトの第 2・第 3 段落を改行を取ってつないだもの。共有画像 `/og/home`＝キャッチコピー（白磁の地・藍の文字・金の細い輪）。`Organization`・`WebSite` の JSON-LD（ルートレイアウト）に description は無い。
- **配色（2 色）**: sometsuke（白磁と藍）・akagane（濃紺と銅）。値は `themes.css` だけ。抽選は、最初の描画より前に動く短い処理（`NigiwaiPage` の `<script>` と `<img onload>`）が、履歴の項目に覚えた色（`history.state.ngTheme`）を使い、無ければ半々で決めて覚える。ブラウザの戻る・進むは同じ色。再読み込みは引き直す。ブラウザの中の移動（`<Link>`）は `RandomTheme` が決める。スクリプトなしは sometsuke。共通フッターの色は `nigiwai.css` の `body:has(.ngp[data-theme=…])` で輪の色に合わせる（`/` でも効く）。
- **動き**: 料理の写真の輪（PC 16 枚・スマホ 13 枚）がゆっくり回る（2.4°/秒）。つかんで回せる（マウスのドラッグ・指の横スワイプ。離すと慣性で元の回転に戻る）。矢印キー（← →）でも回る。6 つの丸いボタン（業種）を選ぶと輪の様子が変わる（グルメ＝写真の輪／ビューティー・ボディケア＝その業種の色の空の丸／ペット・おでかけ・ステイ＝線だけの空の丸）。マウスは乗せて選び、押すと入る。タッチは 1 回目で選び、選んでいるものをもう 1 回押すと入る。キーボードはフォーカスで選び、Enter で入る。入るときは輪が広がって地の色が画面を満たしてから移動する（約 0.8 秒）。
- **業種を替えても動かないもの**: 見出し・リード・6 つの入口の位置は、どの業種を選んでも 1px も動かない（PC。`.ng-facts` は、グルメ以外では `aria-hidden`・`visibility:hidden` のまま場所を取り、`.ng-act` は最小の高さを持つ）。スマホは、数字・入口が輪の真ん中に中央寄せなので、グルメ以外では数字を出さない（`display:none`）。
- **小さい画面（高さ 740px 未満のスマホ）**: 360×640・375×667・412×732 でも、6 業種の帯と「グルメに入る」が最初の画面の中に入る（`@media (max-width:760px) and (max-height:739px)`。見出し・リード・余白・写真の大きさを詰める）。390×844 など高さのある画面は、そのまま。回る写真と輪の中の表示の隙間は、全周（2°刻み）で測って 0 より大きいこと。
- **入る動き**: 満ちる円は `transform: scale` だけで広げる専用の層（`.ng-wipe`・`will-change`）。輪の拡大も `transform`（個別の `scale` プロパティだと、同じ条件で 2 倍以上かかった）。入るあいだは輪の回転を止める。
- **導入と、戻ったとき**: 見出し・リード・入口・数字は、スクリプトを待たずに文書が届いた瞬間から始まる（皿が集まる動きだけ、書体と最初の写真 6 枚（遅くても 0.6 秒）を待つ）。ブラウザの戻る・進む（`history.state` に覚えた色が残っている／文書の読み込み直しは navigation の type が `back_forward`）で帰ってきたときは、`.ngp` に `data-skip` を付けて導入を省き、輪の角度も引き継ぐ。
- **下のブロック**: 3 つの場面（店と出会う→人とつながる→輪が広がる）は、同じ 1 皿が育っていく筋。場面 3 は、スクロールに合わせて、小さな輪（場面 2 の 3 枚）から皿が増えて輪が外へ広がる（`StatementMotion` が `--p`（0〜1）を書く。動きを減らす設定・スクリプトなしでは、はじめから広がりきった姿）。結びを囲む輪は、文字より大きく、上の半分は第 2 段落までは伸びない（線が文字を横切らない）。
- **業種の扱い**: 「掲載準備中」と「掲載中」は、選んでいる業種のぶんだけ出る。どちらかは**業種の掲載数で決まる**（1 以上＝掲載中、0＝掲載準備中。6 の「新業種は実在の店のデータがある」）。行き先は 6 業種の表のとおり（グルメ＝`/gourmet`・ビューティー＝`/beauty`・ボディケア＝`/bodycare`・ほかの 3 つはリンクなし）。掲載中の業種の数字は、グルメが「店・特集・いま営業中」、ほかは実数の「N店」。「さがす」は `/find`（1 つだけ）。
- **「いま営業中」**: 営業時間が確かに読み取れた店だけ（`packWeeks` が `null` にしなかった店）を、現在時刻（日本時間・ブラウザ）で数える。営業中＝営業中＋まもなく閉店。不定休などで営業時間内でも言い切れない店は数に入らない。分母（営業時間が確かな店）は時刻によらず一定。表示は「掲載店 N 店・特集 M 本・いま営業中 K 軒（営業時間が確かな L 店のうち）」。
- **動きを減らす設定（`prefers-reduced-motion`）・スクリプトなし**: 輪は回さない（動きを減らす設定では、時間・矢印キー・ドラッグのどれでも回らない）。集まる演出もなく、言葉は、はじめから全部見える。入るときは演出なしで移動する。スクリプトなしでは色は sometsuke、入れる 3 業種・「さがす」はリンクで届く。
- **色を固定して見る（プレビュー・ローカルだけ）**: `/proto-hub/nigiwai`（`/` と同じ）・`/proto-hub/nigiwai/sometsuke`・`/proto-hub/nigiwai/akagane`。色見本は無い。本番では公開スイッチ ON でも 404（6 の「色を固定して見るルートは、プレビューとローカルだけ」）。
- **フォーカスの輪**: 入口・ロゴ・「さがす」・「入る」の輪は `nigiwai.css` で `--ng-focus`（sometsuke は金褐色 #6a501e、akagane は銅 #e8a37c）。丸い部品の輪は丸い（portal.css の `.mp a:focus-visible` が角を 2px に戻すので、`.ngp` 付きの規則で `border-radius` を指定している）。portal.css の `.mp a:focus-visible`（墨色の輪。特異度 0,2,1）に負けないよう `.ngp` を付けて書いてある（2026-10-07 に直した。以前は akagane で輪が墨色になり、濃紺の地でコントラスト約 1.1 で見えなかった）。「本文へ移動」の輪は、akagane のときだけ銅にしてある（`body:has(.ngp[data-theme="akagane"]) .mp-skip:focus-visible`）。
- **検査**: `node proto-portal/check-hub.mjs --base …`（事前チェック 17。`/` だけを見る。`--no-footer` でスクリプトなしのリンク検査からフッターを除く＝`next dev` で遅いとき）、`check-keyboard.mjs`（`/` の Tab の順番を 2 色・PC・スマホ・動きを減らす設定で）、`check-contrast.mjs --motion`（最初の画面を 6 業種 × 2 色 × 2 幅で）。

## 付録: グルメのトップ（暖簾）（2026-10-09）
- 発注者の決定「グルメのトップは『暖簾』のデザインにする」。公開スイッチ ON のとき `/gourmet` が暖簾のトップになる。OFF は今までどおり（`/` は旧グルメのトップ、`/gourmet` は 404）。店ページ（`/restaurant/**`）・特集記事ページ（`/feature/**`）・地域・シーン・検索は今のグルメのまま（暖簾にしていない）。
- **仕組み**: 枠（紙・提灯・ヘッダー・フッター・`<main>`）は `components/portal/noren/NorenFrame.tsx`（`noren.css`・`fonts.ts` もここ）、トップの中身は `components/portal/pages/gourmet-noren-home.tsx`。見本 `/proto-noren`（`app/proto-noren/{layout,page}.tsx`）と本番 `/gourmet`（`app/gourmet/{layout,page}.tsx`）が同じ部品を使う。違いは行き先だけ（`lib/portal/noren/nav.ts` の `SAMPLE_LINKS`＝見本の店・特集、`LIVE_LINKS`＝`/restaurant/<id>`・`/feature/<id>`・ロゴとフッターの「トップ」は `/gourmet`）。
- **シェル**: `components/portal/isPortalPath.ts` が `/gourmet`（ちょうどそのパスだけ）を総合サイト扱いにするので、`PortalShell` は `SiteShell`（グルメの共通ヘッダー）を出さず、暖簾の枠だけになる。`PortalShell` が読む `isPortalPath` に 1 行増えるだけで（gzip 後の JS の差は未実測。ビルドの検査で確認）、暖簾の部品は OFF のグルメのページの入口から辿れない（ルートレイアウト・`SiteShell`・グルメの店ページは暖簾の部品を import していない）。
- **メタ情報**: title・description・canonical（`/gourmet`）・OGP・構造化データ（ルートレイアウトの Organization・WebSite）は、暖簾に替える前の `/gourmet` と同じ。見本の `noindex` は `app/proto-noren/layout.tsx` だけにあり、`/gourmet` には無い。
- **入口**: 暖簾のトップに無かった行き先は、フッターのナビゲーションの末尾に足した（`FOOT_NAV_LIVE_EXTRA`。`/gourmet` のフッターだけ。見本には足さない）: おまかせ提案（`/omakase`）・写真から探す（`/photos`）・ショート動画（`/nazatu`。noindex の動画ページ）・総合トップ（`/`）。旧トップの「おまかせ／こだわり条件／写真から探す」の入口区画（`gourmet-home.tsx` の `portalEntrances`）は暖簾のトップには無い（こだわり条件は `/search` の中）。`gourmet-home.tsx` の ON 側の分岐は、`/gourmet` では使われなくなった（OFF の `/` は ON 分岐に入らない。消すかは別判断）。


## 付録: 店ページ（暖簾）と特集記事ページの切り替えの仕組み（2026-10-09）
- 発注者の決定「店舗紹介（店ページ）も特集記事も暖簾にする」。公開スイッチ ON のとき、**本物の URL `/restaurant/<id>` が暖簾の店ページ**で出る（URL は変わらない）。OFF は今までどおり（今のグルメの店ページ。HTML・CSS・JS とも変えていない）。
- **仕組み（ON のときだけ効く）**: `next.config.ts` の `rewrites`（`beforeFiles`。`/` → `/portal-home` と同じ場所）が `/restaurant/:id` → `/gourmet/restaurant/:id` に差し替える。内部のルート `app/gourmet/restaurant/[id]/page.tsx` が暖簾の店ページを出す（枠は `app/gourmet/layout.tsx` の `NorenFrame`）。今の店ページのファイル（`app/restaurant/**`・`components/RestaurantDetail.tsx`・`SiteShell.tsx`・`lib/data.ts` ほか）は 1 行も変えていない。
- **内部のパスは公開しない**: `/gourmet/restaurant/<id>` を直接開くと `/restaurant/<id>` へ恒久リダイレクト（`next.config.ts` の `redirects`。ON のときだけ）。canonical・og:url・サイトマップ・ページ内リンクはすべて `/restaurant/<id>`。OFF では `PORTAL_OFF_SOURCES` の `/gourmet/:path*` により `/gourmet` 配下は全部 `/zzz` と同じ標準の 404。
- **枠の出し分け**: `components/portal/isPortalPath.ts` が `/gourmet/**`（内部のパス。プリレンダー済み HTML のパス）と `/restaurant/<id>`（ブラウザのパス）の両方を総合サイト扱いにする。`PortalShell` が `SiteShell`（グルメの共通の枠）を出さず、暖簾の枠だけになる（サーバー描画でも、ページ内リンクで移ってきたときでも二重にならない）。`PortalShell` は ON のときだけ描画されるので、OFF には影響しない。
- **切り替えの定数**: `lib/portal/noren/rewrites.ts` の `NOREN_SHOP_REWRITE`（店ページ。true）・`NOREN_FEATURE_REWRITE`（特集記事ページ。**false**＝2026-10-09 公開②は保留。理由: 特集 536 本のうち 359 本・1,173 スポットは写真が無く、暖簾では「店名だけの暗い布」になる。写真がそろってから公開③で true。true での検査（特集 536 本全件 200・crawl `PROBLEMS 0`・jsonld/hub `違反: 0`）は 2026-10-09 に済み。`app/gourmet/feature/[id]/page.tsx` は `decodeRewrittenId` を通し、false のあいだは内部のパス `/gourmet/feature/<id>` を 404 にして静的に作らない）。`true` にすると、`/feature/:id`（`/feature/search` を除く）→ `/gourmet/feature/:id` の書き換え、`/gourmet/feature/:id` → `/feature/:id` のリダイレクト、`isPortalPath` の `/feature/<id>` が一度に効く（定数は `next.config.ts` と `isPortalPath.ts` が読む。値を変えたら再デプロイ）。
- **中身**: `components/portal/pages/gourmet-noren-shop.tsx`（見本 `/proto-noren/restaurant/[id]` と共通。行き先だけ `SAMPLE_LINKS`／`LIVE_LINKS`）。メタ情報（title・description・canonical・robots・OGP・keywords）と構造化データ（Restaurant・BreadcrumbList）は、今の店ページと同じ関数・同じ値（`app/gourmet/restaurant/[id]/page.tsx`）。描画の方式も同じ（`revalidate = 60`・`dynamicParams = true`・`generateStaticParams` は ON のとき全 ID、OFF は空）。ID が無いときは `not-found.tsx`（暖簾の枠の中の 404）。
- **注意**: ON のビルドでは、今の `/restaurant/[id]`（配信されない）と暖簾の `/gourmet/restaurant/[id]` の両方が全 ID ぶん作られる（ビルド時間が店ページぶん増える）。`crawl.mjs` の店ページの検査（共有ボタンの `role="group" aria-label="この店を共有"`、SNS の `data-sa-id`）は、暖簾の行動ボタンにも同じ属性を付けてある。
- **特集の内部ルートを合流するときの注意（実測 2026-10-09）**: 書き換え（`/feature/:id` → `/gourmet/feature/:id`）を通ると、動的ルートの `params.id` が百分率エンコードのまま届く（日本語の ID は `%E3%81%82…`、`A&B` は `A%26B`。直接開いたときは復号済み）。`app/gourmet/feature/[id]/page.tsx` は `lib/portal/noren/rewrites.ts` の `decodeRewrittenId(params.id)` を通してから使う（`generateMetadata`・ページ本体の両方）。店の ID（`r01`…）は ASCII なので影響なし。書き換えは `/feature/search`（検索）を除く 1 区間だけ（`/feature`・`/feature/region/<key>` も当たらない）。日本語・`&` を含む ID・`/feature/search`・`/feature/region/tokyo`・`/feature` の挙動は、仮のルートで ON のまま確かめた（`NOREN_FEATURE_REWRITE = true` にして `/feature/<id>` が暖簾の枠 1 つだけ・`/feature/search` などは今のグルメの枠・`/gourmet/feature/<id>` は 308 で `/feature/<id>` へ）。
- **店ページには「営業中」などの表示・時刻の表示を出さない**（2026-10-09 オーナー指示）。今の店ページにもこの表示は無く、暖簾の店ページも足していない。
