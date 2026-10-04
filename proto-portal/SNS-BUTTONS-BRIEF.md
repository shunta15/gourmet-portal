# グルメ店ページ「行動ボタン」デザイン 3案 — ブリーフ（2026-10-04）

## 依頼（オーナーの言葉）
「単純なリンクはダサい。ボタンみたいにしてデザイン案を3つ。賞を取れるレベルのデザインで。」
対象は、**いまのグルメ版の店ページ**（`/restaurant/[id]`、`components/RestaurantDetail.tsx`）の「店舗、詳細。」の表の下にある
リンクの列（`.detail-actions`。予約・電話・Google マップ・地図・Instagram・ほかの店…が文字リンクで並んでいる所）。
ここを、SNS への連携ボタンを含めて、**ボタンとして**作り直す。3つの違う方向の案を作り、オーナーが見比べて選ぶ。
品質基準は Awwwards / FWA / Webby で受賞できる水準（細部の状態・動き・組版まで）。

## 絶対に守ること
1. **公開しない**。`vercel` コマンド・`git push`・main への操作は禁止。この worktree（`/Users/shunta/claude/gp-portal`、ブランチ `proto/portal`）にコミットするだけ。
2. **公開スイッチ OFF のとき、グルメの出力を1バイトも変えない**（`lib/portal/launch.ts`、`proto-portal/LAUNCH.md` を読む）。
   新しい見た目・部品・CSS・JS は、すべて `portalLive` が true のときだけ読み込まれること（既存の ShopLinks / ShareButtons と同じく lazy で）。
   OFF のときは、今の `.detail-actions` の中身がそのまま出る。`app/globals.css` は変更しない（新しい CSS は自分のファイルに、固有の接頭辞 `.sa-` で）。
3. **事実だけ**。ボタンに出すのは店データにある値だけ（電話番号・予約URL・住所・SNSのURL）。SNS の「@アカウント名」は URL から取り出す（無ければ出さない）。
   フォロワー数・評価・星・口コミ数は出さない。値の無い項目のボタンは出さない。
4. Supabase・スプレッドシートに書き込まない。`.env*` の中身を表示しない。npm install しない（外部ライブラリ追加なし）。外部からのダウンロードなし。
5. **サブエージェントを起動しない**。開発サーバーはポート **3242** だけ（`PORTAL_LAUNCHED=1 npx next dev -p 3242`）。止めるのは `lsof -ti tcp:3242 | xargs kill` のみ。`pkill` 禁止。
6. `lib/data.ts` など巨大ファイルは全文 Read しない。`"use client"` から `@/lib/data` `@/lib/db/*` を import しない。実行時に `fs` で `public/` を読まない。
7. `AGENTS.md` を先に読む（この Next.js は学習時の知識と違う）。`next dev` が `AGENTS.md` を書き換えたら `git checkout AGENTS.md` で戻し、コミットしない。

## 作るもの
### A. 部品 `components/portal/ShopActions.tsx`（＋ `components/portal/shop-actions.css`、必要なら分割）
- props: 店の行動リンク一式（下の表）、`variant: 1 | 2 | 3`、`storeId`、`page`。
- 既存の `lib/portal/sns.ts`（`ShopLink`、SNS の判定）、`lib/portal/share.ts`（共有URL）、`lib/portal/track.ts`（`trackTap`）を使う。
  既存の `ShopLinks.tsx` / `ShareButtons.tsx` は総合サイトの他ページでも使っているので**消さない・挙動を変えない**。
- `RestaurantDetail.tsx`: `portalLive` のときは `.detail-actions` の中身を `<ShopActions>` に置き換える（Instagram が二重に出ている今の状態を解消）。
  OFF のときは今のまま。

| 順 | 行動 | 出す条件 | 補足の文字 |
|---|---|---|---|
| 1 | 予約する | `reservationUrl` がある | 予約サイトのドメイン名 |
| 2 | 電話する | `phone` がある | 電話番号 |
| 3 | Google マップで開く | `address` がある | 住所の先頭（市区町村まで） |
| 4 | 地図を見る（ページ内 #map） | 座標がある | — |
| 5 | SNS（Instagram / TikTok / X / Facebook / LINE / 公式サイト） | 値がある項目だけ | @アカウント名（URL から） |
| 6 | Googleで詳細を調べる | 電話も予約URLも無いとき（今と同じ条件） | — |
| 7 | 出典リンク・この店の特集記事・街の他の店・地域の他の店 | 今と同じ条件 | 件数など今と同じ |
| 8 | 共有（LINE / X / Facebook / リンクをコピー） | 常に | — |

- 主役は 1〜5（外へ送り出すボタン）。6〜7 は脇役（小さく）、8 は末尾。
- すべてのタップで `trackTap({ storeId, kind, page })`（既存どおり）。外部リンクは `target="_blank" rel="noopener noreferrer"`、
  読み上げ用に「外部サイトが新しいタブで開きます」。
- アイコンは自分で描くインライン SVG（単色・`currentColor`）。各 SNS は一目で分かる単純な形に（Instagram＝角丸四角＋円＋点、X＝交差する2本、
  Facebook＝f、LINE＝吹き出し、TikTok＝音符、公式サイト＝地球、電話・ピン・カレンダー・リンク）。4倍に拡大して形を確認する。

### B. 3つの案（方向をはっきり変える。どれも今のグルメ版の世界観＝生成りの紙・墨・朱・明朝の見出し・細い罫 に合わせる。色と書体は `app/globals.css` の変数を使い、新しい書体は足さない）

**案1「罫 KEI」— 大きな行のボタン**
- 上の「店舗、詳細。」の表と同じ細い罫で区切った、幅いっぱいの行。1行が1つのボタン。
- 行の中: 左に小さな分類（予約／電話／地図／SNS…）、中央に大きな明朝のラベル（例「Instagram」）、その横に補足（@アカウント名・電話番号）、右端に丸で囲んだ矢印。
- 最初の行（予約または電話）は朱で塗った主役。
- hover: 墨が左から右へ行を塗りつぶし、文字が紙色に反転、矢印が ↗ から → へ回って進む。押した瞬間は少し沈む。行の下に朱の細線が引かれる。
- モバイル: 同じ行（高さ 64px 以上）。共有は最後の行に小さなボタンを横並び。

**案2「印 IN」— 丸い印のボタン**
- 円形のボタン（PC 直径 120px 前後、モバイル 96px 前後で3列）。中央にアイコン、下に短いラベル。
- 円の外周に沿って小さな文字が回る（SVG の textPath。例「INSTAGRAM · @hotaru_koubou · 」の繰り返し）。表示されたとき1回、hover で回り続ける。
- 主役（予約または電話）は朱で塗った印（朱印のように）、ほかは細い罫の円 → hover で墨に塗られる。
- ポインタに少し吸い寄せられる（最大 8px。`pointer: fine` のときだけ、rAF で）。押すと判子を押すように縮んで、離すとインクの輪が広がる。
- 共有は小さい円（56px）を横に。

**案3「箱 HAKO」— タイルの盤面＋スマホ下の固定バー**
- 見出し「この店へ。」のついた盤面。大小のタイルを格子に組む（主役は大きいタイルに特大のラベル「電話する」と番号、地図・SNS は小さいタイル）。
- タイル: 左上にアイコン、下に補足（@アカウント名など）、右上の角に ↗。hover で背景が墨に塗り替わり、↗ が斜めに滑って入れ替わる。
- 地図のタイルには、座標があれば緯度・経度（実データ）を小さく添える。架空の地図は描かない。
- 共有はタイル1枚の中に小さなボタン4つ。
- **モバイル: 画面下に固定の行動バー**（主な行動を最大3つ: 予約または電話／地図／SNS の1つ目）。ヒーローを過ぎたら現れ、盤面やフッターが見えているあいだは隠れる。
  セーフエリアの余白、本文を隠さない下余白、`prefers-reduced-motion` 対応。

### C. 見比べの仕組み（プレビューとローカルだけ）
- 店ページの隅に小さな切替「ボタン案 1 / 2 / 3」。サーバーから `previewTools`（`process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV !== "production"`）を渡し、true のときだけ出す。
  選択は localStorage（try/catch）と URL の `?sns=1|2|3`（**クライアントで読む**。サーバーで searchParams を読むとページが動的になるので読まない）。既定は案1。
- 見比べページ `app/proto-sns/page.tsx`（`assertPortalLive()` で OFF は 404、`robots: noindex,nofollow`）:
  3案を縦に並べ、それぞれ (a) 実在の店 3店の実データ（Instagram と電話がある店／予約URLがある店／どちらも無い店）、
  (b) **見本**: 6種の SNS が全部そろった場合の見え方。見本は「見本（リンク先は未登録）」と明記し、実在の店名を使わず、リンクにしない（押せない状態）。
- `proto-portal/compare-off.mjs` の `PORTAL_404` に `/proto-sns` を足す。

## 受賞水準として見るところ
- 状態が全部作ってあるか: 通常／hover／キーボードの focus（はっきり見える輪）／押した瞬間／訪問済み／読み込み直後の現れ方。
- 動きに意味と手応えがあるか（速すぎず遅すぎず 200〜500ms、緩急）。`prefers-reduced-motion` では動きを止めても成立。
- タップ領域 48px 以上、文字のコントラスト 4.5:1 以上、本文 12px 以上。
- ボタンが1個の店・8個の店、長い店名・長いアカウント名でも崩れないか。
- 上の「店舗、詳細。」の表、下の地図、周りの余白と**ひと続きの紙面**に見えるか（部品だけ浮いていないか）。
- モバイルが主戦場。親指で押しやすいか。

## セルフチェック（最低3周・最大5周）
1. `PORTAL_LAUNCHED=1 npx next dev -p 3242`（ログはファイルへ）。スクショ用スクリプトは scratchpad の `sns-buttons/` に置く。
   Playwright は `/Users/shunta/claude/gp-portal/node_modules/playwright/index.mjs`。
2. 各案を、デスクトップ 1440×900 とモバイル 390×844 で撮る: 通常、hover（実際にマウスを載せる）、focus（Tab で移動）、押した瞬間、
   案2の回転途中、案3の固定バー。JPEG quality 70。**1周に Read する画像は最大10枚**（並べた画像は1枚と数える）。
3. 実測: コンソールエラー 0、横スクロール量 0、Tab だけで全ボタンに届く、コントラスト、タップ領域の最小寸法。
4. Awwwards 基準で採点（Design 40 / Usability 30 / Creativity 20 / Content 10）。**3案それぞれ**が加重 8.0 以上・全項目 7.5 以上になるまで。
   毎周、案ごとに弱点を3つ以上書いてから直す。甘い採点は不可。
5. 完了条件: `.next` を消して `npx tsc --noEmit` エラー0。OFF の確認として、`env -u PORTAL_LAUNCHED -u VERCEL_ENV npx next dev -p 3242` で
   店ページ（例 `/restaurant/r16`）を開き、`.detail-actions` の HTML が変更前（`git stash` は使わず、`git show HEAD:components/RestaurantDetail.tsx` と見比べる）と同じ並び・同じクラスで、
   `.sa-` のクラスも新しい CSS も読み込まれていないこと、`/proto-sns` が 404 であることを実測。
   （main との全ページ比較 `compare-off.mjs static/live` は、あとでこちらで実行するので不要。）
   開発サーバーを止め、コミット（末尾に `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`）。push しない。

## 最終報告（戻り値。日本語、短く）
- 3案それぞれ: 一言の説明、各周の採点と直した点、最終スクショのパス（PC・モバイル）
- 作った／変えたファイル一覧
- 実測値（コンソールエラー、横スクロール量、タップ領域の最小、コントラストの最小、tsc、OFF の確認結果）
- 見比べに使った実在の3店の ID と、その店を選んだ理由
- 残る弱点（正直に）。確認していないことは「未確認」と書く
