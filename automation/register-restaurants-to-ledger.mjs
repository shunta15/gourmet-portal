// teleapo-restaurants.ts の店舗(r241-r298)を ledger.names に登録する。
// これで sheets-candidates-json.mjs の isGenerated が true を返し、
// 自動生成パイプラインの候補から除外される(重複生成防止)。
import { readFileSync } from 'fs';
import { loadLedger, saveLedger, addEntry, nameKey } from '../scripts/ledger.mjs';

const src = readFileSync('lib/teleapo-restaurants.ts', 'utf-8');
// Restaurant の name フィールドを抽出
const names = [...src.matchAll(/^\s*name:\s*"([^"]+)"/gm)].map((m) => m[1]);
const ids = [...src.matchAll(/^\s*id:\s*"(r\d+)"/gm)].map((m) => m[1]);
console.log(`teleapo-restaurants.ts: ${ids.length} 店舗, name数: ${names.length}`);

const led = loadLedger();
const beforeNames = Object.keys(led.names).length;
let added = 0;
for (let i = 0; i < ids.length && i < names.length; i++) {
  const id = ids[i];
  const name = names[i];
  const k = nameKey(name);
  if (!led.names[k]) {
    addEntry(led, { name, articleId: id, url: `https://machinowa.tokyo/restaurant/${id}` });
    added++;
  }
}
saveLedger(led);
const afterNames = Object.keys(led.names).length;
console.log(`ledger.names: ${beforeNames} → ${afterNames} (新規追加 ${added})`);
