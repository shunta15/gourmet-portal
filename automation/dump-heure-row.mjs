import { google } from 'googleapis';
import { readFileSync } from 'fs';
const sa = JSON.parse(readFileSync('automation/secrets/sa.json', 'utf-8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
// row 473 全列(A-Z) と セル背景・コメント含むメタ情報
const r = await sheets.spreadsheets.values.get({
  spreadsheetId: '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk',
  range: 'トスアップ元シート!A473:Z473',
  valueRenderOption: 'FORMATTED_VALUE',
});
const rf = await sheets.spreadsheets.values.get({
  spreadsheetId: '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk',
  range: 'トスアップ元シート!A473:Z473',
  valueRenderOption: 'FORMULA',
});
const v = r.data.values?.[0] || [];
const vf = rf.data.values?.[0] || [];
const headers = ['列1', 'アポインター名', '稼働手法', '店舗名', '店舗電話番号', '携帯電話番号', '決裁者名(フリガナ)', '性別', '希望連絡先', 'URL(Maps想定)', '業種', '連絡希望日', '連絡希望時間', 'メールアドレス', '備考', '詰めステータス', '詰め担当者', '備考', '最終架電日', '商談者', 'ステータス', '備考', '済', 'URL', '?', '?'];
console.log('=== row 473 L\'HEURE BLEUE 全列ダンプ ===');
for (let i = 0; i < Math.max(v.length, vf.length, headers.length); i++) {
  const col = String.fromCharCode(65 + i);
  const val = (v[i] || '').toString();
  const formula = (vf[i] || '').toString();
  const eq = val === formula;
  console.log(`  ${col}(${i + 1}) [${headers[i] || '?'}]: VAL="${val.slice(0, 60)}"${eq ? '' : '  FML="' + formula.slice(0, 60) + '"'}`);
}
