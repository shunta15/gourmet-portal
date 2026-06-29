// バッチ1の5店舗を teleapo-restaurants.ts に追記
import { readFileSync, writeFileSync } from 'fs';
const raw = readFileSync(process.argv[2], 'utf-8');
// HTMLエンティティ混入を除去（agent返却時の &amp; → & 等）
const decoded = raw.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
const SHOPS = JSON.parse(decoded).result?.shops || JSON.parse(decoded).shops;

const ph = ['/restaurants/_placeholder/feature-hero.jpg', '/restaurants/_placeholder/feature-point.jpg', '/restaurants/_placeholder/feature-og.jpg'];

const tsBlock = SHOPS.map((s) => {
  const opt = (k, v) => v ? `    ${k}: ${JSON.stringify(v)},\n` : '';
  return `  {
    id: ${JSON.stringify(s.id)},
    name: ${JSON.stringify(s.name)},
    cuisine: ${JSON.stringify(s.cuisine)},
    area: ${JSON.stringify(s.area)},
    region: ${JSON.stringify(s.region)},
    shape: "square",
    image: ${JSON.stringify(ph[0])},
    heroImages: ${JSON.stringify([ph[0]])},
    gallery: ${JSON.stringify(ph)},
    desc: ${JSON.stringify(s.desc)},
    address: ${JSON.stringify(s.address)},
    hours: ${JSON.stringify(s.hours)},
    closed: ${JSON.stringify(s.closed)},
    seats: ${JSON.stringify(s.seats)},
    nearest: ${JSON.stringify(s.nearest)},
${opt('phone', s.phone)}${opt('budget', s.budget)}${opt('reservationUrl', s.reservationUrl)}${opt('instagram', s.instagram)}    tags: ${JSON.stringify(s.tags)},
    body: ${JSON.stringify(s.body, null, 6).replace(/\n/g, '\n    ')},
    source: { label: "Google ビジネスプロフィール", url: ${JSON.stringify(s.googleMapsRedirectUrl)} },
  },`;
}).join('\n');

const target = 'lib/teleapo-restaurants.ts';
const cur = readFileSync(target, 'utf-8');
const next = cur.replace(/(\/\/ ↓ エージェントが自動追記 ↓\n)/, `$1${tsBlock}\n`);
writeFileSync(target, next);
console.log(`✅ ${target} に ${SHOPS.length}店舗を追記`);
console.log('追記店舗:', SHOPS.map((s) => `${s.id}(${s.name})`).join(', '));
