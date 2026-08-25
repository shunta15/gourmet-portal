// 「詰めOKリスト」の行ズレ恒久修復
//   原因: QUERY が A:V までで、W(済)/X(URL) が手動値 → 行追加のたびにズレる
//   対策: 本体の W/X を QUERY 出力に含める（A:V → A:X）。手動値は消す
//   ※ Y/Z（店舗紹介）は現在パイプライン無効のため触らない
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { SHEET_ID } from '../scripts/sheets-config.mjs';

const APPLY = process.argv.includes('--apply');
const sa = JSON.parse(readFileSync(new URL('./secrets/sa.json', import.meta.url), 'utf8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

const get = async (range, opt) =>
  (await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range, valueRenderOption: opt || 'FORMATTED_VALUE' })).data.values || [];

// 1. 本体の W1/X1 見出しを確認（QUERY で見出しごと引くため）
const bodyHead = await get('トスアップ元シート!W1:X1');
const needHeader = !(bodyHead[0]?.[0] && bodyHead[0]?.[1]);
console.log(`本体 W1/X1 見出し: ${needHeader ? '未設定 → 設定する' : JSON.stringify(bodyHead[0])}`);

// 2. ビューの手動 W/X の現状範囲
const viewWX = await get('詰めOKリスト!W2:X');
console.log(`ビュー 手動W/X: ${viewWX.length} 行 → クリア対象`);
console.log(`A1 の式を A:V → A:X に変更（フィルタは Col17='詰めOK' を維持）`);

if (!APPLY) {
  console.log('\n--- dry-run。--apply で実行 ---');
  process.exit(0);
}

if (needHeader) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'トスアップ元シート!W1:X1',
    valueInputOption: 'RAW',
    requestBody: { values: [['特集記事_済', '特集記事_URL']] },
  });
  console.log('✅ 本体 W1/X1 に見出しを設定');
}

if (viewWX.length) {
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `詰めOKリスト!W2:X${viewWX.length + 1}`,
  });
  console.log(`✅ ビュー W2:X${viewWX.length + 1} の手動値をクリア`);
}

await sheets.spreadsheets.values.update({
  spreadsheetId: SHEET_ID,
  range: '詰めOKリスト!A1',
  valueInputOption: 'USER_ENTERED',
  requestBody: { values: [[`=QUERY('トスアップ元シート'!A:X,"SELECT * WHERE Col17='詰めOK'",1)`]] },
});
console.log('✅ A1 の QUERY を A:X に拡張（W/X は本体から自動反映）');
console.log('\n=== 修復完了 ===');
