/**
 * machinowa-monitor.gs
 *
 * マチノワ記事自動生成モニター
 * 毎日 9:00 / 18:00 (JST) に実行。記事生成完了時はメールで通知。
 *
 * 事前準備:
 *   - サービスから「Google Sheets API」を追加すること
 *   - 詰めOKリスト!A1 の QUERY を A:V に制限（W列以降は GAS 書き込み用）
 *   - 初回 setupAll() を実行
 *
 * 【書き戻し設計】
 * - 読み込み元: 「詰めOKリスト」(QUERYで詰めOKに絞り込み済み)
 * - 書き込み先: 「詰めOKリスト」の W〜Z 列 (QUERY範囲外なので直接書ける)
 * - トスアップ元シートには一切書き込まない
 */

const SHEET_ID    = '1d4A0-2kbVBACSsC2F-7KiUJTlu1k6ryn3sRvXlYq3R4';
const SHEET_NAME  = '詰めOKリスト'; // 読み込み & 書き込み先（QUERYで詰めOKに絞り込み済み）
const API_URL     = 'https://machinowa.tokyo/api/machinowa/generate';
const NOTIFY_EMAIL = 'linkateinc315@link8.info';

// 1回の cron で処理する最大件数（暴走・タイムアウト・課金急増を防ぐ）
// Claude API ~60秒/件、GAS は6分制限のため 3-5 件が安全
const MAX_PROCESS_PER_RUN = 3;

// 列インデックス（1始まり）
// A〜V は QUERY 結果。W〜Z は GAS が書き込む管理列。
const COL = {
  STORE:        4,   // D 店舗名
  URL:         10,   // J Google Maps URL
  P_STATUS:    16,   // P 詰めステータス
  U_STATUS:    21,   // U ステータス
  FEAT_DONE:   23,   // W 特集記事_済
  FEAT_URL:    24,   // X 特集記事_URL
  REST_DONE:   25,   // Y 店舗紹介_済
  REST_URL:    26,   // Z 店舗紹介_URL
};

// ─────────────────────────────────────────────────────────
// setupAll: 初回1回だけ実行
// ─────────────────────────────────────────────────────────
function setupAll() {
  _setupSecret();
  _setupTriggers();
  _ensureHeaders();
  Logger.log('✅ セットアップ完了');
}

function _setupSecret() {
  PropertiesService.getScriptProperties()
    .setProperty('MACHINOWA_SECRET', '06b316c1321116d85b15639e9792239f0b7675f128654ba7');
  Logger.log('APIシークレット設定完了');
}

function _setupTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  [10, 15, 20].forEach(hour => {
    ScriptApp.newTrigger('checkAndGenerate')
      .timeBased().atHour(hour).everyDays(1).inTimezone('Asia/Tokyo').create();
  });

  Logger.log('トリガー設定: 毎日 10:00 / 15:00 / 20:00 (JST)');
}

function _ensureHeaders() {
  const headers = ['特集記事_済', '特集記事_URL', '店舗紹介_済', '店舗紹介_URL'];
  const res = Sheets.Spreadsheets.Values.get(
    SHEET_ID, `${SHEET_NAME}!W1:Z1`, { valueRenderOption: 'FORMATTED_VALUE' }
  );
  const current = (res.values && res.values[0]) || [];
  if (headers.every((h, i) => (current[i] || '').toString().trim() === h)) {
    Logger.log('ヘッダー設定済み');
    return;
  }
  Sheets.Spreadsheets.Values.update(
    { values: [headers] },
    SHEET_ID, `${SHEET_NAME}!W1:Z1`,
    { valueInputOption: 'USER_ENTERED' }
  );
  Logger.log('ヘッダー設定: W1〜Z1');
}

// ─────────────────────────────────────────────────────────
// checkAndGenerate: トリガーから呼ばれるメイン処理
// 詰めOKリストを読み、未生成の行で記事生成 → 同じ行のW〜Zに書き戻し
// ─────────────────────────────────────────────────────────
function checkAndGenerate() {
  const props  = PropertiesService.getScriptProperties();
  const secret = props.getProperty('MACHINOWA_SECRET');
  const results = [];
  // 監視用カウンタ（無音失敗検知のため）
  const stats = {
    totalRows: 0,
    featOkRows: 0,        // 詰めOK 行数
    featDoneRows: 0,      // 詰めOK かつ W=済
    featPendingRows: 0,   // 詰めOK かつ W=空 → 処理対象
    restOkRows: 0,        // 商談完了 行数
    restDoneRows: 0,
    restPendingRows: 0,
    featProcessed: 0,
    restProcessed: 0,
    featError: 0,
    restError: 0,
    pendingStores: [],    // 未処理対象の店舗名
  };

  // ─── Step 1: ステータス列のみ batchGet で取得（軽量スキャン） ───
  // D(店舗名) / J(URL) / P(P_STATUS) / U(U_STATUS) / W(FEAT_DONE) / Y(REST_DONE)
  // フル A:Z (26列) ではなく必要な6列のみ → 転送量 ~75% カット
  let statusRows = []; // {rowNum, storeName, mapsUrl, pStatus, uStatus, featDone, restDone}
  try {
    const ranges = [
      `${SHEET_NAME}!D2:D`,
      `${SHEET_NAME}!J2:J`,
      `${SHEET_NAME}!P2:P`,
      `${SHEET_NAME}!U2:U`,
      `${SHEET_NAME}!W2:W`,
      `${SHEET_NAME}!Y2:Y`,
    ];
    const res = Sheets.Spreadsheets.Values.batchGet(
      SHEET_ID, { ranges: ranges, valueRenderOption: 'FORMATTED_VALUE' }
    );
    const cols = res.valueRanges.map(vr => (vr.values || []).map(r => (r[0] || '').toString().trim()));
    const maxLen = Math.max(...cols.map(c => c.length));
    stats.totalRows = maxLen + 1; // ヘッダー含めて
    Logger.log(`🔍 取得行数: ${maxLen}行（軽量スキャン: ${ranges.length}列のみ）`);

    for (let i = 0; i < maxLen; i++) {
      const storeName = cols[0][i] || '';
      if (!storeName) continue;
      statusRows.push({
        rowNum:    i + 2, // ヘッダー分 +1, さらに 0-indexed→1-indexed
        storeName: storeName,
        mapsUrl:   cols[1][i] || '',
        pStatus:   cols[2][i] || '',
        uStatus:   cols[3][i] || '',
        featDone:  cols[4][i] || '',
        restDone:  cols[5][i] || '',
      });
    }
  } catch (e) {
    Logger.log('❌ Sheets API エラー: ' + e.message);
    _sendNotification([], { ...stats, fatalError: 'Sheets API: ' + e.message });
    return;
  }

  // ─── Step 2: 未処理候補を抽出（カウンタ更新も同時に） ───
  const featCandidates = [];
  const restCandidates = [];
  for (const r of statusRows) {
    if (r.pStatus === '詰めOK') {
      stats.featOkRows++;
      if (r.featDone) {
        stats.featDoneRows++;
      } else {
        stats.featPendingRows++;
        stats.pendingStores.push(`feat:${r.storeName}(${r.rowNum})`);
        featCandidates.push(r);
      }
    }
    if (r.uStatus === '商談完了') {
      stats.restOkRows++;
      if (r.restDone) {
        stats.restDoneRows++;
      } else {
        stats.restPendingRows++;
        stats.pendingStores.push(`rest:${r.storeName}(${r.rowNum})`);
        restCandidates.push(r);
      }
    }
  }

  Logger.log(`📋 候補数: 特集${featCandidates.length}件 / 店舗紹介${restCandidates.length}件 / 上限${MAX_PROCESS_PER_RUN}件/回`);

  // ─── Step 3: 上限まで処理 ───
  let budget = MAX_PROCESS_PER_RUN;

  for (const r of featCandidates) {
    if (budget <= 0) break;
    Logger.log(`📝 特集記事生成: ${r.storeName} (row ${r.rowNum})`);
    const result = _callApi({ storeName: r.storeName, mapsUrl: r.mapsUrl, type: 'feature', rowNum: r.rowNum, secret });
    if (result && result.url) {
      _writeBack(r.rowNum, COL.FEAT_DONE, COL.FEAT_URL, result.url);
      results.push({ type: '特集記事', storeName: r.storeName, url: result.url, status: '✅ 完了' });
      stats.featProcessed++;
    } else {
      results.push({ type: '特集記事', storeName: r.storeName, url: '', status: '❌ エラー' });
      stats.featError++;
    }
    budget--;
    Utilities.sleep(5000);
  }

  for (const r of restCandidates) {
    if (budget <= 0) break;
    Logger.log(`🏪 店舗紹介生成: ${r.storeName} (row ${r.rowNum})`);
    const result = _callApi({ storeName: r.storeName, mapsUrl: r.mapsUrl, type: 'restaurant', rowNum: r.rowNum, secret });
    if (result && result.url) {
      _writeBack(r.rowNum, COL.REST_DONE, COL.REST_URL, result.url);
      results.push({ type: '店舗紹介', storeName: r.storeName, url: result.url, status: '✅ 完了' });
      stats.restProcessed++;
    } else {
      results.push({ type: '店舗紹介', storeName: r.storeName, url: '', status: '❌ エラー' });
      stats.restError++;
    }
    budget--;
    Utilities.sleep(5000);
  }

  // 上限到達で残った候補があれば記録
  const totalCandidates = featCandidates.length + restCandidates.length;
  const totalProcessed  = stats.featProcessed + stats.restProcessed + stats.featError + stats.restError;
  if (totalCandidates > totalProcessed) {
    stats.deferred = totalCandidates - totalProcessed;
    Logger.log(`⏭ 次回繰越: ${stats.deferred}件（MAX_PROCESS_PER_RUN=${MAX_PROCESS_PER_RUN} に到達）`);
  }

  Logger.log(`📊 詰めOK: 全${stats.featOkRows} / 済${stats.featDoneRows} / 未${stats.featPendingRows} → 処理${stats.featProcessed} / エラー${stats.featError}`);
  Logger.log(`📊 商談完了: 全${stats.restOkRows} / 済${stats.restDoneRows} / 未${stats.restPendingRows} → 処理${stats.restProcessed} / エラー${stats.restError}`);

  // 無音失敗検知: 候補があるのに処理0件なら異常（上限到達は別カウント）
  const expectedThisRun = Math.min(stats.featPendingRows + stats.restPendingRows, MAX_PROCESS_PER_RUN);
  const actualWork      = stats.featProcessed + stats.restProcessed + stats.featError + stats.restError;
  if (expectedThisRun > 0 && actualWork === 0) {
    Logger.log(`🚨 異常: 未処理${expectedThisRun}件あるのに処理0件。スキップロジックを疑え。pending=${JSON.stringify(stats.pendingStores)}`);
    stats.silentFailure = true;
  }

  // 常に通知（0件処理でもサマリーを送る）
  _sendNotification(results, stats);
  Logger.log(`✅ 通知送信完了 (処理${results.length}件, 期待${expectedThisRun}件)`);
}

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
      { values: [[`=HYPERLINK("${url}","${url}")`]] },
      SHEET_ID, urlRange,
      { valueInputOption: 'USER_ENTERED' }
    );
    Logger.log(`📝 書き戻し: ${doneRange}=済, ${urlRange}=${url}`);
  } catch (e) {
    Logger.log(`❌ 書き戻し失敗 (row ${rowNum}): ${e.message}`);
  }
}

// 既存4本のURLを詰めOKリストに書き戻す（一度きり実行用）
function backfillExistingFeatures() {
  _ensureHeaders();

  const generated = {
    'ルーラル':         'https://machinowa.tokyo/feature/teleapo-feat-ルラル',
    '炭や。よつ葉':     'https://machinowa.tokyo/feature/teleapo-feat-炭やよつ葉',
    'OWL(営業時間状況で変わります)': 'https://machinowa.tokyo/feature/teleapo-feat-owl営業時間状況で変わります',
    'あんばい 食楽厨房': 'https://machinowa.tokyo/feature/teleapo-feat-あんばい-食楽厨房',
  };

  const res = Sheets.Spreadsheets.Values.get(
    SHEET_ID, `${SHEET_NAME}!A1:Z`, { valueRenderOption: 'FORMATTED_VALUE' }
  );
  const rows = res.values || [];

  let count = 0;
  for (let i = 1; i < rows.length; i++) {
    const storeName = (rows[i][COL.STORE - 1] || '').toString().trim();
    if (!generated[storeName]) continue;
    _writeBack(i + 1, COL.FEAT_DONE, COL.FEAT_URL, generated[storeName]);
    Logger.log(`✅ ${storeName} (row ${i + 1}) → ${generated[storeName]}`);
    count++;
  }
  Logger.log(`完了 (${count}件)`);
}

function testRun() {
  const res = Sheets.Spreadsheets.Values.get(
    SHEET_ID, `${SHEET_NAME}!A1:Z`, { valueRenderOption: 'FORMATTED_VALUE' }
  );
  const rows = res.values || [];
  Logger.log(`取得行数: ${rows.length}`);
  for (let i = 0; i < Math.min(6, rows.length); i++) {
    const row = rows[i];
    Logger.log(`row${i}: D=${row[COL.STORE-1]} P=${row[COL.P_STATUS-1]} U=${row[COL.U_STATUS-1]} W=${row[COL.FEAT_DONE-1]} X=${row[COL.FEAT_URL-1]}`);
  }
}

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

function _sendNotification(results, stats) {
  const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
  stats = stats || {};

  // 件名: 異常時は🚨、通常は✅
  const silent = stats.silentFailure ? '🚨 無音失敗 ' : '';
  const subject = `【マチノワ】${silent}記事生成 処理${results.length}件 / 未${(stats.featPendingRows||0) + (stats.restPendingRows||0)}件 (${now})`;

  const lines = results.length > 0
    ? results.map(r => `${r.status} [${r.type}] ${r.storeName}\n${r.url ? '   → ' + r.url : '   → 生成失敗'}`)
    : ['(処理件数 0件)'];

  const body = [
    `マチノワ記事自動生成レポート`,
    `実行日時: ${now}`,
    ``,
    `■ 処理結果`,
    ...lines,
    ``,
    `■ サマリー`,
    `取得行数: ${stats.totalRows || '?'}`,
    `詰めOK: 全${stats.featOkRows||0} / 済${stats.featDoneRows||0} / 未${stats.featPendingRows||0} → 処理${stats.featProcessed||0} エラー${stats.featError||0}`,
    `商談完了: 全${stats.restOkRows||0} / 済${stats.restDoneRows||0} / 未${stats.restPendingRows||0} → 処理${stats.restProcessed||0} エラー${stats.restError||0}`,
    stats.fatalError ? `❌ 致命エラー: ${stats.fatalError}` : '',
    stats.silentFailure ? `🚨 異常: 未処理あるのに何も処理されなかった。コードのスキップ条件を確認すべし。` : '',
    stats.deferred ? `⏭ 上限到達で次回繰越: ${stats.deferred}件（MAX_PROCESS_PER_RUN）` : '',
    stats.pendingStores && stats.pendingStores.length ? `未処理候補: ${stats.pendingStores.join(', ')}` : '',
    ``,
    `─────────────────`,
    `スプレッドシート:`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`,
  ].filter(Boolean).join('\n');

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

// 一度きり実行: rows 2-143 で P=詰めOK / W=空 を W=スキップ で埋める（手動指定運用に戻すため）
function bulkSkipPending() {
  const res = Sheets.Spreadsheets.Values.get(
    SHEET_ID, `${SHEET_NAME}!A1:Z`, { valueRenderOption: 'FORMATTED_VALUE' }
  );
  const rows = res.values || [];
  let skipped = 0;
  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const rowNum = i + 1;
    if (rowNum < 2 || rowNum > 143) continue;
    const pStatus  = (rows[i][COL.P_STATUS - 1]  || '').toString().trim();
    const featDone = (rows[i][COL.FEAT_DONE - 1] || '').toString().trim();
    if (pStatus !== '詰めOK' || featDone) continue;
    data.push({ range: `${SHEET_NAME}!W${rowNum}`, values: [['スキップ']] });
    skipped++;
  }
  if (data.length) {
    Sheets.Spreadsheets.Values.batchUpdate(
      { valueInputOption: 'USER_ENTERED', data: data }, SHEET_ID
    );
  }
  Logger.log(`✅ スキップマーク完了: ${skipped}行`);
}

// 一度きり実行: 社交酒場イムの W2/X2 をクリア
function clearShakaisakabaImu() {
  const res = Sheets.Spreadsheets.Values.get(
    SHEET_ID, `${SHEET_NAME}!A2:Z2`, { valueRenderOption: 'FORMATTED_VALUE' }
  );
  const row = res.values && res.values[0] || [];
  const storeName = (row[COL.STORE - 1] || '').toString().trim();
  if (storeName !== '社交酒場イム') {
    Logger.log(`❌ row 2 が 社交酒場イム ではない: ${storeName}`);
    return;
  }
  Sheets.Spreadsheets.Values.update(
    { values: [['スキップ', '']] }, SHEET_ID, `${SHEET_NAME}!W2:X2`,
    { valueInputOption: 'USER_ENTERED' }
  );
  Logger.log(`✅ row 2 (社交酒場イム): W2=スキップ, X2=空`);
}
