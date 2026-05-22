/**
 * machinowa-monitor.gs
 *
 * マチノワ記事自動生成モニター
 * 毎日 9:00 / 18:00 (JST) に実行。記事生成完了時はメールで通知。
 *
 * 事前準備: サービスから「Google Sheets API」を追加すること
 * 初回セットアップ: setupAll() を一度だけ実行する
 */

// 「詰めOKリスト」が入っているスプレッドシート（マチノワ自動記事制作）
const SHEET_ID     = '1d4A0-2kbVBACSsC2F-7KiUJTlu1k6ryn3sRvXlYq3R4';
const SHEET_NAME   = '詰めOKリスト'; // QUERYで詰めOKのみ抽出済みシート
const API_URL      = 'https://machinowa.tokyo/api/machinowa/generate';
const NOTIFY_EMAIL = 'linkateinc315@link8.info';

// 「詰めOKリスト」シートの列インデックス（1始まり）
// ※ A〜V は IMPORTRANGE+QUERY 範囲。W〜Z はユーザーが手動追加した管理列。
const COL = {
  STORE:        4,   // D 店舗名
  URL:         10,   // J Google Maps URL
  P_STATUS:    16,   // P 詰めステータス
  U_STATUS:    21,   // U ステータス
  FEAT_DONE:   23,   // W 特集記事_済（書き戻し用）
  FEAT_URL:    24,   // X 特集記事_URL（書き戻し用）
  REST_DONE:   25,   // Y 店舗紹介_済（書き戻し用）
  REST_URL:    26,   // Z 店舗紹介_URL（書き戻し用）
};

// ─────────────────────────────────────────────────────────
// setupAll: 初回1回だけ実行
// ─────────────────────────────────────────────────────────
function setupAll() {
  _setupSecret();
  _setupTriggers();
  Logger.log('✅ セットアップ完了');
}

function _setupSecret() {
  PropertiesService.getScriptProperties()
    .setProperty('MACHINOWA_SECRET', '06b316c1321116d85b15639e9792239f0b7675f128654ba7');
  Logger.log('APIシークレット設定完了');
}

function _setupTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('checkAndGenerate')
    .timeBased().atHour(9).everyDays(1).inTimezone('Asia/Tokyo').create();

  ScriptApp.newTrigger('checkAndGenerate')
    .timeBased().atHour(18).everyDays(1).inTimezone('Asia/Tokyo').create();

  Logger.log('トリガー設定: 毎日 9:00 / 18:00 (JST)');
}

// ─────────────────────────────────────────────────────────
// checkAndGenerate: トリガーから呼ばれるメイン処理
// Sheets API v4 で計算済み値を取得（IMPORTRANGE/QUERY対応）
// 生成後は W/X（特集）または Y/Z（店舗紹介）に書き戻す
// ─────────────────────────────────────────────────────────
function checkAndGenerate() {
  const props  = PropertiesService.getScriptProperties();
  const secret = props.getProperty('MACHINOWA_SECRET');
  const results  = [];

  // Sheets API v4 で「詰めOKリスト」の計算済み値を取得（A〜Z までまとめて）
  let rows;
  try {
    const res = Sheets.Spreadsheets.Values.get(
      SHEET_ID,
      `${SHEET_NAME}!A1:Z`,
      { valueRenderOption: 'FORMATTED_VALUE' }
    );
    rows = res.values || [];
  } catch (e) {
    Logger.log('❌ Sheets API エラー: ' + e.message);
    return;
  }

  Logger.log(`🔍 取得行数: ${rows.length}行`);

  // 1行目はヘッダー → 2行目以降がデータ
  for (let i = 1; i < rows.length; i++) {
    const row       = rows[i];
    const storeName = (row[COL.STORE - 1] || '').toString().trim();
    if (!storeName) continue;

    const mapsUrl  = (row[COL.URL - 1]       || '').toString().trim();
    const pStatus  = (row[COL.P_STATUS - 1]  || '').toString().trim();
    const uStatus  = (row[COL.U_STATUS - 1]  || '').toString().trim();
    const featDone = (row[COL.FEAT_DONE - 1] || '').toString().trim();
    const restDone = (row[COL.REST_DONE - 1] || '').toString().trim();

    const rowNum = i + 1; // 1始まりの行番号

    // 詰めOK かつ 特集記事未生成（W列が空）
    if (pStatus === '詰めOK' && !featDone) {
      Logger.log(`📝 特集記事生成: ${storeName} (row ${rowNum})`);
      const result = _callApi({ storeName, mapsUrl, type: 'feature', rowNum, secret });
      if (result && result.url) {
        _writeBack(rowNum, COL.FEAT_DONE, COL.FEAT_URL, result.url);
        results.push({ type: '特集記事', storeName, url: result.url, status: '✅ 完了' });
      } else {
        results.push({ type: '特集記事', storeName, url: '', status: '❌ エラー' });
      }
      Utilities.sleep(5000);
    }

    // 商談完了 かつ 店舗紹介未生成（Y列が空）
    if (uStatus === '商談完了' && !restDone) {
      Logger.log(`🏪 店舗紹介生成: ${storeName} (row ${rowNum})`);
      const result = _callApi({ storeName, mapsUrl, type: 'restaurant', rowNum, secret });
      if (result && result.url) {
        _writeBack(rowNum, COL.REST_DONE, COL.REST_URL, result.url);
        results.push({ type: '店舗紹介', storeName, url: result.url, status: '✅ 完了' });
      } else {
        results.push({ type: '店舗紹介', storeName, url: '', status: '❌ エラー' });
      }
      Utilities.sleep(5000);
    }
  }

  if (results.length > 0) {
    _sendNotification(results);
    Logger.log(`✅ ${results.length}件処理完了 → 通知送信`);
  } else {
    Logger.log('📭 新規処理対象なし');
  }
}

// ─────────────────────────────────────────────────────────
// スプレッドシートへ書き戻し（「済」マーク + URL）
// ─────────────────────────────────────────────────────────
function _writeBack(rowNum, doneCol, urlCol, url) {
  const colLetter = (n) => {
    let s = '';
    while (n > 0) {
      const m = (n - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  };
  const doneRange = `${SHEET_NAME}!${colLetter(doneCol)}${rowNum}`;
  const urlRange  = `${SHEET_NAME}!${colLetter(urlCol)}${rowNum}`;
  try {
    Sheets.Spreadsheets.Values.update(
      { values: [['済']] },
      SHEET_ID, doneRange,
      { valueInputOption: 'USER_ENTERED' }
    );
    Sheets.Spreadsheets.Values.update(
      { values: [[url]] },
      SHEET_ID, urlRange,
      { valueInputOption: 'USER_ENTERED' }
    );
    Logger.log(`📝 書き戻し: ${doneRange}=済, ${urlRange}=${url}`);
  } catch (e) {
    Logger.log(`❌ 書き戻し失敗 (row ${rowNum}): ${e.message}`);
  }
}

// ─────────────────────────────────────────────────────────
// テスト実行（「詰めOKリスト」の最初の5件だけ確認）
// ─────────────────────────────────────────────────────────
function testRun() {
  let rows;
  try {
    const res = Sheets.Spreadsheets.Values.get(
      SHEET_ID,
      `${SHEET_NAME}!A1:Z`,
      { valueRenderOption: 'FORMATTED_VALUE' }
    );
    rows = res.values || [];
  } catch (e) {
    Logger.log('❌ Sheets API エラー: ' + e.message);
    return;
  }

  Logger.log(`取得行数: ${rows.length}`);
  for (let i = 0; i < Math.min(6, rows.length); i++) {
    const row = rows[i];
    Logger.log(`row${i}: D=${row[COL.STORE-1]} P=${row[COL.P_STATUS-1]} U=${row[COL.U_STATUS-1]} W=${row[COL.FEAT_DONE-1]} X=${row[COL.FEAT_URL-1]} Y=${row[COL.REST_DONE-1]} Z=${row[COL.REST_URL-1]}`);
  }
}

// ─────────────────────────────────────────────────────────
// API 呼び出し
// ─────────────────────────────────────────────────────────
function _callApi(payload) {
  try {
    const options = {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };
    const res = UrlFetchApp.fetch(API_URL, options);
    if (res.getResponseCode() === 200) {
      return JSON.parse(res.getContentText());
    }
    Logger.log(`API error ${res.getResponseCode()}: ${res.getContentText()}`);
  } catch (e) {
    Logger.log(`API failed: ${e.message}`);
  }
  return null;
}

// ─────────────────────────────────────────────────────────
// メール通知
// ─────────────────────────────────────────────────────────
function _sendNotification(results) {
  const now     = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
  const subject = `【マチノワ】記事自動生成 ${results.length}件完了 (${now})`;

  const lines = results.map(r =>
    `${r.status} [${r.type}] ${r.storeName}\n${r.url ? '   → ' + r.url : '   → 生成失敗'}`
  );

  const body = [
    `マチノワ記事自動生成レポート`,
    `実行日時: ${now}`,
    ``,
    ...lines,
    ``,
    `─────────────────`,
    `スプレッドシート:`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`,
  ].join('\n');

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}
