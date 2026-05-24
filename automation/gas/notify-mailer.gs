/**
 * マチノワ自動化 メール通知 Web App
 *
 * 用途:
 *   - Anthropic Gmail MCP は「draft 作成」しかできないため、別経路で送信する必要がある
 *   - GAS の MailApp.sendEmail で実送信を実装
 *   - routine から curl で POST するだけでメール送信される
 *
 * セットアップ手順:
 *   1. https://script.google.com/ で「新しいプロジェクト」
 *   2. プロジェクト名を「machinowa-notify」に変更
 *   3. デフォルトの function myFunction() {} を消して、このファイル全体をコピペ
 *   4. 保存（Cmd+S）
 *   5. 右上「デプロイ」→「新しいデプロイ」
 *      - 種類: ウェブアプリ
 *      - 説明: 「マチノワ自動化メール通知」
 *      - 実行ユーザー: 「自分」
 *      - アクセスできるユーザー: 「全員」
 *      - 「デプロイ」をクリック
 *   6. アクセス権限の確認画面で「アクセスを承認」→ 自分の Google アカウント選択
 *      → 「詳細を表示」→「machinowa-notify（安全ではないページ）に移動」→「許可」
 *   7. 表示された Web App URL をコピー（https://script.google.com/macros/s/AKfycb.../exec の形）
 *
 * 使い方（curl）:
 *   curl -X POST <Web App URL> \
 *     -H "Content-Type: application/json" \
 *     -d '{
 *       "to": "linkateinc315@link8.info",
 *       "subject": "[マチノワ自動化] 10:00JST 結果",
 *       "body": "実行時刻: ...\n処理件数: ..."
 *     }'
 *
 * 制限:
 *   - MailApp.sendEmail は1日100通まで（個人 Gmail / 個人 GAS の制限）
 *   - 1日3回 × routine 3個 = 9通/日 なので余裕
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const to = (data.to || 'linkateinc315@link8.info').toString();
    const subject = (data.subject || '[マチノワ自動化] 通知').toString();
    const body = (data.body || '(本文なし)').toString();

    MailApp.sendEmail({
      to: to,
      subject: subject,
      body: body
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      to: to,
      subject: subject,
      sentAt: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString(),
      stack: err.stack || ''
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GET でアクセスされた場合の動作確認用ハンドラ
 * デプロイ後に Web App URL をブラウザで開くと "OK" が表示される
 */
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'OK',
    service: 'machinowa-notify',
    deployedAt: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 手動テスト用（GAS エディタから直接実行）
 * これを実行すると linkateinc315@link8.info にテストメールが届く
 */
function testSend() {
  MailApp.sendEmail({
    to: 'linkateinc315@link8.info',
    subject: '[マチノワ自動化] GAS テスト送信',
    body: '正常に送信されました。' + new Date().toISOString()
  });
  Logger.log('テストメール送信完了');
}
