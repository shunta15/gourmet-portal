#!/usr/bin/env node
// 生成成功した記事を台帳に追記する（pipeline から呼ぶ）
// 使い方:
//   node scripts/ledger-add.mjs --mapsurl="<J列Maps URL>" --name="<正式店名>" --articleId="<記事ID>" --url="<公開URL>"
// cid は --mapsurl から自動抽出。--cid で直接渡してもよい。

import { loadLedger, saveLedger, addEntry, cidFromUrl } from './ledger.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...rest] = a.replace(/^--/, '').split('=');
    return [k, rest.join('=')];
  }),
);

const cid = args.cid || cidFromUrl(args.mapsurl || '');
const name = args.name || args.articleId || '';
const articleId = args.articleId || '';
const url = args.url || (articleId ? `https://machinowa.tokyo/feature/${articleId}` : '');

if (!cid && !name) {
  console.error('❌ ledger-add: --cid か --name のどちらかは必須');
  process.exit(1);
}

const led = loadLedger();
addEntry(led, { cid, name, articleId, url });
saveLedger(led);
console.log(`📚 台帳に追記: cid=${cid || '-'} name="${name}" id="${articleId}"`);
