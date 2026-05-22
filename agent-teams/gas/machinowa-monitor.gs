/**
 * machinowa-monitor.gs
 *
 * マチノワ記事自動生成モニター
 * 毎日 9:00 / 18:00 (JST) に実行。記事生成完了時はメールで通知。
 *
 * 初回セットアップ: setupAll() を一度だけ実行する
 */

const SHEET_ID     = '1d4A0-2kbVBACSsC2F-7KiUJTlu1k6ryn3sRvXlYq3R4';
const API_URL      = 'https://machinowa.tokyo/api/machinowa/generate';
const NOTIFY_EMAIL = 'linkateinc315@link8.info';
const START_ROW    = 140;

const COL = {
  STORE:     4,   // D 店舗名
  URL:       10,  // J Google Maps URL
  P_STATUS:  16,  // P 詰めステータス
  U_STATUS:  21,  // U ステータス
  FEAT_DONE: 23,  // W 特集記事_済
  FEAT_URL:  24,  // X 特集記事_URL
  REST_DONE: 25,  // Y 店舗紹介_済
  REST_URL:  26,  // Z 店舗紹介_URL
};

// ─────────────────────────────────────────────────────────
// setupAll: 初回1回だけ実行
//   - 列ヘッダー追加
//   - APIシークレット設定
//   - 毎日9:00 / 18:00 のトリガー作成
// ─────────────────────────────────────────────────────────
function setupAll() {
  _setupColumns();
  _setupSecret();
  _setupTriggers();
  Logger.log('✅ セットアップ完了');
}

function _setupColumns() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  sheet.getRange(1, COL.FEAT_DONE, 1, 4).setValues([[
    '特集記事_済', '特集記事_URL', '店舗紹介_済', '店舗紹介_URL'
  ]]);
  SpreadsheetApp.flush();
  Logger.log('列ヘッダー追加: W・X・Y・Z');
}

function _setupSecret() {
  PropertiesService.getScriptProperties()
    .setProperty('MACHINOWA_SECRET', '06b316c1321116d85b15639e9792239f0b7675f128654ba7');
  Logger.log('APIシークレット設定完了');
}

function _setupTriggers() {
  // 既存トリガーをすべて削除してから再作成
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // 毎日 9:00 JST
  ScriptApp.newTrigger('checkAndGenerate')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .inTimezone('Asia/Tokyo')
    .create();

  // 毎日 18:00 JST
  ScriptApp.newTrigger('checkAndGenerate')
    .timeBased()
    .atHour(18)
    .everyDays(1)
    .inTimezone('Asia/Tokyo')
    .create();

  Logger.log('トリガー設定: 毎日 9:00 / 18:00 (JST)');
}

// ─────────────────────────────────────────────────────────
// checkAndGenerate: トリガーから呼ばれるメイン処理
// ─────────────────────────────────────────────────────────
function checkAndGenerate() {
  const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  const lastRow = sheet.getLastRow();
  const secret  = PropertiesService.getScriptProperties().getProperty('MACHINOWA_SECRET');
  const results = [];

  Logger.log(`🔍 チェック開始: ${START_ROW}行〜${lastRow}行`);

  for (let row = START_ROW; row <= lastRow; row++) {
    const storeName = sheet.getRange(row, COL.STORE).getValue();
    if (!storeName) continue;

    const pStatus  = sheet.getRange(row, COL.P_STATUS).getValue();
    const uStatus  = sheet.getRange(row, COL.U_STATUS).getValue();
    const mapsUrl  = sheet.getRange(row, COL.URL).getValue();
    const featDone = sheet.getRange(row, COL.FEAT_DONE).getValue();
    const restDone = sheet.getRange(row, COL.REST_DONE).getValue();

    // P列=詰めOK かつ W列=空 → 特集記事
    if (pStatus === '詰めOK' && !featDone) {
      Logger.log(`📝 特集記事生成: row=${row} / ${storeName}`);
      sheet.getRange(row, COL.FEAT_DONE).setValue('生成中...');
      SpreadsheetApp.flush();

      const result = _callApi({ storeName, mapsUrl, type: 'feature', rowNum: row, secret });
      if (result && result.url) {
        sheet.getRange(row, COL.FEAT_DONE).setValue('済');
        sheet.getRange(row, COL.FEAT_URL).setValue(result.url);
        results.push({ type: '特集記事', storeName, url: result.url, status: '✅ 完了' });
      } else {
        sheet.getRange(row, COL.FEAT_DONE).setValue('エラー');
        results.push({ type: '特集記事', storeName, url: '', status: '❌ エラー' });
      }
      SpreadsheetApp.flush();
      Utilities.sleep(5000);
    }

    // U列=商談完了 かつ Y列=空 → 店舗紹介
    if (uStatus === '商談完了' && !restDone) {
      Logger.log(`🏪 店舗紹介生成: row=${row} / ${storeName}`);
      sheet.getRange(row, COL.REST_DONE).setValue('生成中...');
      SpreadsheetApp.flush();

      const result = _callApi({ storeName, mapsUrl, type: 'restaurant', rowNum: row, secret });
      if (result && result.url) {
        sheet.getRange(row, COL.REST_DONE).setValue('済');
        sheet.getRange(row, COL.REST_URL).setValue(result.url);
        results.push({ type: '店舗紹介', storeName, url: result.url, status: '✅ 完了' });
      } else {
        sheet.getRange(row, COL.REST_DONE).setValue('エラー');
        results.push({ type: '店舗紹介', storeName, url: '', status: '❌ エラー' });
      }
      SpreadsheetApp.flush();
      Utilities.sleep(5000);
    }
  }

  // 結果通知
  if (results.length > 0) {
    _sendNotification(results);
    Logger.log(`✅ ${results.length}件処理完了 → 通知送信`);
  } else {
    Logger.log('📭 新規処理対象なし');
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
