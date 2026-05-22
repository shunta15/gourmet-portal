/**
 * machinowa-monitor.gs
 *
 * マチノワ記事自動生成モニター
 * スプレッドシートのP列・U列を監視し、記事生成APIを呼ぶ。
 *
 * セットアップ手順:
 *   1. スクリプトプロパティに MACHINOWA_SECRET を設定（setApiSecret()を実行）
 *   2. setupColumns() を実行（W・X・Y・Z列のヘッダーを追加）
 *   3. ウェブアプリとしてデプロイ（「次のユーザーとして実行: 自分」「全員」アクセス）
 *   4. デプロイURLを Vercel 環境変数 GAS_MACHINOWA_URL に設定
 *   5. 時間トリガーを設定: checkAndGenerate() を 30分ごとに実行
 */

const SHEET_ID = '1d4A0-2kbVBACSsC2F-7KiUJTlu1k6ryn3sRvXlYq3R4';
const API_URL  = 'https://machinowa.tokyo/api/machinowa/generate';
const START_ROW = 140;

const COL = {
  DATE:       1,   // A
  APPOINTER:  2,   // B アポインター名
  METHOD:     3,   // C 稼働手法
  STORE:      4,   // D 店舗名
  TEL:        5,   // E 店舗電話番号
  MOBILE:     6,   // F 携帯電話番号
  OWNER:      7,   // G 決裁者名
  GENDER:     8,   // H 性別
  CONTACT:    9,   // I 希望連絡先
  URL:        10,  // J Google Maps URL
  GENRE:      11,  // K 業種
  NOTES:      15,  // O 備考
  P_STATUS:   16,  // P 詰めステータス
  U_STATUS:   21,  // U ステータス
  FEAT_DONE:  23,  // W 特集記事_済
  FEAT_URL:   24,  // X 特集記事_URL
  REST_DONE:  25,  // Y 店舗紹介_済
  REST_URL:   26,  // Z 店舗紹介_URL
};

// ─────────────────────────────────────────────
// 1. 初回セットアップ: ヘッダー追加
// ─────────────────────────────────────────────
function setupColumns() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  sheet.getRange(1, COL.FEAT_DONE, 1, 4).setValues([[
    '特集記事_済', '特集記事_URL', '店舗紹介_済', '店舗紹介_URL'
  ]]);
  SpreadsheetApp.flush();
  Logger.log('列ヘッダーを設定しました（W・X・Y・Z）');
}

// ─────────────────────────────────────────────
// 2. 時間トリガー: 30分ごとに実行
// ─────────────────────────────────────────────
function checkAndGenerate() {
  const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  const lastRow = sheet.getLastRow();
  const secret  = PropertiesService.getScriptProperties().getProperty('MACHINOWA_SECRET');

  Logger.log(`チェック開始: ${START_ROW}行〜${lastRow}行`);

  for (let row = START_ROW; row <= lastRow; row++) {
    const storeName = sheet.getRange(row, COL.STORE).getValue();
    if (!storeName) continue;

    const pStatus  = sheet.getRange(row, COL.P_STATUS).getValue();
    const uStatus  = sheet.getRange(row, COL.U_STATUS).getValue();
    const mapsUrl  = sheet.getRange(row, COL.URL).getValue();
    const notes    = sheet.getRange(row, COL.NOTES).getValue();
    const featDone = sheet.getRange(row, COL.FEAT_DONE).getValue();
    const restDone = sheet.getRange(row, COL.REST_DONE).getValue();

    // 特集記事: P=詰めOK かつ W=空
    if (pStatus === '詰めOK' && !featDone) {
      Logger.log(`特集記事生成: row=${row} store=${storeName}`);
      sheet.getRange(row, COL.FEAT_DONE).setValue('生成中...');
      SpreadsheetApp.flush();

      const result = callApi({ storeName, mapsUrl, notes, type: 'feature', rowNum: row, secret });
      if (result?.url) {
        sheet.getRange(row, COL.FEAT_DONE).setValue('済');
        sheet.getRange(row, COL.FEAT_URL).setValue(result.url);
      } else {
        sheet.getRange(row, COL.FEAT_DONE).setValue('エラー');
      }
      SpreadsheetApp.flush();
      Utilities.sleep(3000);
    }

    // 店舗紹介: U=商談完了 かつ Y=空
    if (uStatus === '商談完了' && !restDone) {
      Logger.log(`店舗紹介生成: row=${row} store=${storeName}`);
      sheet.getRange(row, COL.REST_DONE).setValue('生成中...');
      SpreadsheetApp.flush();

      const result = callApi({ storeName, mapsUrl, notes, type: 'restaurant', rowNum: row, secret });
      if (result?.url) {
        sheet.getRange(row, COL.REST_DONE).setValue('済');
        sheet.getRange(row, COL.REST_URL).setValue(result.url);
      } else {
        sheet.getRange(row, COL.REST_DONE).setValue('エラー');
      }
      SpreadsheetApp.flush();
      Utilities.sleep(3000);
    }
  }
}

// ─────────────────────────────────────────────
// 3. 記事生成 API 呼び出し
// ─────────────────────────────────────────────
function callApi(payload) {
  try {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
      followRedirects: true,
    };
    const res = UrlFetchApp.fetch(API_URL, options);
    if (res.getResponseCode() === 200) {
      return JSON.parse(res.getContentText());
    }
    Logger.log(`API error ${res.getResponseCode()}: ${res.getContentText()}`);
  } catch (e) {
    Logger.log(`API call failed: ${e.message}`);
  }
  return null;
}

// ─────────────────────────────────────────────
// 4. スクリプトプロパティ設定（初回のみ実行）
// ─────────────────────────────────────────────
function setApiSecret() {
  // ← この値を変更してから実行すること
  PropertiesService.getScriptProperties().setProperty('MACHINOWA_SECRET', 'CHANGE_ME_TO_RANDOM_SECRET');
  Logger.log('MACHINOWA_SECRET を設定しました');
}
