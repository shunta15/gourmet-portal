# GAS Web App セットアップ手順（メール通知用）

routine からメール送信できるようにする。所要時間：5〜10分。

## なぜ必要か

Anthropic 公式の Gmail MCP は **draft（下書き）作成しかできない仕様**。
送信は人間が claude.ai 上で承認する必要があるため、cron で完全自動送信できない。
→ GAS Web App で迂回する。

## 手順

### 1. GAS プロジェクト作成
1. https://script.google.com/ にアクセス
2. 「**新しいプロジェクト**」をクリック
3. 左上の「無題のプロジェクト」を「**machinowa-notify**」に変更

### 2. コード貼り付け
1. デフォルトの `function myFunction() {}` を全部削除
2. [`notify-mailer.gs`](./notify-mailer.gs) の中身を全部コピー
3. GAS エディタに貼り付け
4. **保存**（Cmd+S）

### 3. デプロイ
1. 右上「**デプロイ**」→「**新しいデプロイ**」
2. 「**種類の選択**」（歯車アイコン）→「**ウェブアプリ**」
3. 設定:
   - **説明**: 「マチノワ自動化メール通知」
   - **実行ユーザー**: 「**自分**」
   - **アクセスできるユーザー**: 「**全員**」 ← ここ重要
4. 「**デプロイ**」をクリック

### 4. アクセス権限を承認
1. 「**アクセスを承認**」をクリック
2. **linkateinc315@link8.info の Google アカウント**を選択
3. 警告画面が出たら「**詳細**」→「**machinowa-notify（安全ではないページ）に移動**」
4. 「**許可**」をクリック

### 5. URL コピー
表示された「**ウェブアプリの URL**」をコピー。
形式: `https://script.google.com/macros/s/AKfycb...../exec`

### 6. URL を私に伝える
チャットで URL を貼り付けてください。

私が即座に：
- routine prompt の Step 8 を「GAS Web App に curl POST」に修正
- 3 routine を update
- 手動 run でテスト
- メール届くか実機確認

までやります。

## テスト方法（GAS 側で確認したい場合）

GAS エディタ上部の「関数を選択」プルダウンで `testSend` を選び、「**実行**」ボタンを押すと、
linkateinc315@link8.info にテストメールが送信されます（手動確認用）。

## トラブル

- 「許可されていません」エラー → アクセスできるユーザーが「自分のみ」になっている可能性。再デプロイで「全員」を指定し直す
- URL が `https://script.googleusercontent.com/...` 形式 → デプロイ URL ではなく直接実行 URL。正しくは `https://script.google.com/macros/s/.../exec`
