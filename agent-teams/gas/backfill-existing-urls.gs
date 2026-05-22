/**
 * backfill-existing-urls.gs
 *
 * 既に生成済みの4本のURLをスプレッドシートW〜X列に書き戻す
 * （machinowa-monitor.gs の書き戻し機能を追加する前に作った記事の補填用）
 *
 * 使い方:
 *   1. machinowa-monitor.gs と同じ GAS プロジェクトに貼る
 *   2. backfillExistingFeatures() を一度だけ実行
 *   3. 終わったらこのファイルは削除して OK
 */

function backfillExistingFeatures() {
  const SHEET_ID   = '1d4A0-2kbVBACSsC2F-7KiUJTlu1k6ryn3sRvXlYq3R4';
  const SHEET_NAME = '詰めOKリスト';

  // 既に生成済みの4本（店舗名 → 特集記事URL）
  const generated = {
    'ルーラル':         'https://machinowa.tokyo/feature/teleapo-feat-ルラル',
    '炭や。よつ葉':     'https://machinowa.tokyo/feature/teleapo-feat-炭やよつ葉',
    'OWL(営業時間状況で変わります)': 'https://machinowa.tokyo/feature/teleapo-feat-owl営業時間状況で変わります',
    'あんばい 食楽厨房': 'https://machinowa.tokyo/feature/teleapo-feat-あんばい-食楽厨房',
  };

  // 詰めOKリストを全件取得
  const res = Sheets.Spreadsheets.Values.get(
    SHEET_ID,
    `${SHEET_NAME}!A1:Z`,
    { valueRenderOption: 'FORMATTED_VALUE' }
  );
  const rows = res.values || [];

  // 店舗名（D列=index 3）で行を引き当てて W,X に書く
  for (let i = 1; i < rows.length; i++) {
    const storeName = (rows[i][3] || '').toString().trim();
    if (!generated[storeName]) continue;

    const rowNum = i + 1;
    const url    = generated[storeName];

    Sheets.Spreadsheets.Values.update(
      { values: [['済']] },
      SHEET_ID,
      `${SHEET_NAME}!W${rowNum}`,
      { valueInputOption: 'USER_ENTERED' }
    );
    Sheets.Spreadsheets.Values.update(
      { values: [[url]] },
      SHEET_ID,
      `${SHEET_NAME}!X${rowNum}`,
      { valueInputOption: 'USER_ENTERED' }
    );
    Logger.log(`✅ 書き戻し: row ${rowNum} (${storeName}) → ${url}`);
  }

  Logger.log('完了');
}
