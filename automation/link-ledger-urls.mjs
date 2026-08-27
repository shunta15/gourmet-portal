// 記事台帳 D列を「日本語表記のまま・クリックできるリンク」にする
//   数式(HYPERLINK)は使わない → コピーしても数式が入らない
//   セルの中身はただの文字列で、そこにリンクを直接埋め込む(textFormatRuns)
//   表示 = 日本語URL / リンク先 = エンコード済URL(実際に開くため)
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { SHEET_ID } from '../scripts/sheets-config.mjs';

const sa = JSON.parse(readFileSync(new URL('./secrets/sa.json', import.meta.url), 'utf8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const s = google.sheets({ version: 'v4', auth: await auth.getClient() });

const meta = await s.spreadsheets.get({ spreadsheetId: SHEET_ID });
const sheet = meta.data.sheets.find(x => x.properties.title === '記事台帳');
if (!sheet) { console.error('記事台帳シートが無い'); process.exit(1); }
const sheetId = sheet.properties.sheetId;

const vals = (await s.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: '記事台帳!A1:D' })).data.values || [];
const rows = [];
for (let i = 1; i < vals.length; i++) {
  const id = (vals[i]?.[2] || '').trim();
  if (!id) { rows.push(null); continue; }
  const label = `https://machinowa.tokyo/feature/${id}`;                       // 表示は日本語のまま
  const href = `https://machinowa.tokyo/feature/${encodeURIComponent(id)}`;    // 実際に開ける先
  rows.push({ label, href });
}

const requests = rows.map((r, i) => ({
  updateCells: {
    range: { sheetId, startRowIndex: i + 1, endRowIndex: i + 2, startColumnIndex: 3, endColumnIndex: 4 },
    fields: 'userEnteredValue,textFormatRuns',
    rows: [{
      values: [r
        ? { userEnteredValue: { stringValue: r.label }, textFormatRuns: [{ startIndex: 0, format: { link: { uri: r.href } } }] }
        : { userEnteredValue: { stringValue: '' } }],
    }],
  },
}));

for (let i = 0; i < requests.length; i += 200) {
  await s.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests: requests.slice(i, i + 200) } });
}
console.log(`✅ 記事台帳 D列 ${rows.filter(Boolean).length}行を「日本語表示＋リンク付き文字列」に変換`);
