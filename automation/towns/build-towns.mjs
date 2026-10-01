#!/usr/bin/env node
/**
 * build-towns.mjs
 *
 * 全掲載店（lib/data.ts の RESTAURANTS = data.ts 本体 + teleapo-restaurants + articleStores）の住所から
 * 都道府県・市区町村（街）を機械的に取り出し、街ページ（/region/<region>/<街>）の対象を一覧にする。
 * 街の判定は lib/towns.ts（サイトの街ページと同じ関数）。何度でも再実行できる。
 *
 * 出力
 *   automation/towns/towns.json          3店以上の街 [{region, town, pref, count, storeIds}]（店数の多い順）
 *                                        = index・sitemap の対象（lib/restaurantIndexable.ts の MIN_STORES_FOR_TOWN_INDEX）
 *   automation/towns/towns-summary.json  全街の店数・街を取り出せなかった店・疑わしい街名・政令市の「区単位/市単位」比較
 *
 * 街紹介文（lib/townIntros.ts）を書く担当は towns.json の上から順に取り組む。
 *
 * 使い方: node automation/towns/build-towns.mjs
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadData, loadLib } from "../lib/load-data.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { RESTAURANTS } = await loadData();
const T = await loadLib("towns");
const IDX = await loadLib("restaurantIndexable");
const MIN = IDX.MIN_STORES_FOR_TOWN_INDEX;

const { groups, unparsed } = T.groupByTown(RESTAURANTS);
const idNum = (id) => Number(String(id).replace(/\D/g, "")) || 0;
const byCount = (a, b) => b.count - a.count || a.region.localeCompare(b.region) || a.town.localeCompare(b.town, "ja");

const all = groups
  .map((g) => ({
    region: g.region,
    town: g.town,
    pref: g.pref,
    count: g.items.length,
    storeIds: g.items.map((r) => r.id).sort((a, b) => idNum(a) - idNum(b)),
  }))
  .sort(byCount);
const indexable = all.filter((t) => t.count >= MIN);

// 政令市を市単位にした場合の比較（区単位を採った理由の根拠）
const WARD = /^(.+?市)(.+区)$/;
const cityLevel = new Map();
for (const g of groups) {
  const m = g.town.match(WARD);
  const town = m ? m[1] : g.town;
  const k = `${g.region}/${town}`;
  cityLevel.set(k, (cityLevel.get(k) || 0) + g.items.length);
}
const cityIdx = [...cityLevel.values()].filter((n) => n >= MIN);
const designated = all.filter((t) => WARD.test(t.town));

const summary = {
  generatedFrom: "lib/data.ts RESTAURANTS",
  stores: RESTAURANTS.length,
  unparsed: unparsed.map((r) => ({ id: r.id, name: r.name, address: r.address, region: r.region })),
  prefInferred: RESTAURANTS.filter((r) => T.parseTown(r.address, r.region)?.prefInferred).map((r) => ({
    id: r.id,
    address: r.address,
    note: "住所に都道府県が無いので region から補った",
  })),
  prefMismatch: RESTAURANTS.filter((r) => {
    const p = T.parseTown(r.address, r.region);
    return p && T.PREF_BY_REGION[r.region] && T.PREF_BY_REGION[r.region] !== p.pref;
  }).map((r) => ({ id: r.id, region: r.region, address: r.address })),
  suspicious: all.filter((t) => T.suspiciousTown(t.town)).map((t) => ({ ...t, why: T.suspiciousTown(t.town) })),
  towns: {
    total: all.length,
    indexable: indexable.length,
    storesInIndexable: indexable.reduce((s, t) => s + t.count, 0),
    noindex: all.length - indexable.length,
  },
  designatedCityComparison: {
    wardLevel: {
      designatedCityTowns: designated.length,
      indexableTowns: designated.filter((t) => t.count >= MIN).length,
      storesInIndexable: designated.filter((t) => t.count >= MIN).reduce((s, t) => s + t.count, 0),
    },
    cityLevel: {
      towns: cityLevel.size,
      indexableTowns: cityIdx.length,
      largestTown: [...cityLevel.entries()].sort((a, b) => b[1] - a[1])[0],
    },
  },
  all: all.map(({ region, town, pref, count }) => ({ region, town, pref, count })),
};

writeFileSync(path.join(HERE, "towns.json"), JSON.stringify(indexable, null, 2) + "\n");
writeFileSync(path.join(HERE, "towns-summary.json"), JSON.stringify(summary, null, 2) + "\n");

console.log(`店 ${RESTAURANTS.length} / 街 ${all.length} / ${MIN}店以上 ${indexable.length}（掲載店 ${summary.towns.storesInIndexable}）`);
console.log(`街を取り出せない店 ${unparsed.length}:`, unparsed.map((r) => `${r.id}(${r.address})`).join(" "));
if (summary.suspicious.length) console.log("疑わしい街名:", summary.suspicious.map((t) => `${t.town}(${t.why})`).join(" "));
console.log(`政令市 区単位: ${designated.length}街 / ${MIN}店以上 ${summary.designatedCityComparison.wardLevel.indexableTowns}`);
console.log(`政令市 市単位にすると: 最大 ${summary.designatedCityComparison.cityLevel.largestTown?.join(" ")}店`);
console.log("上位15:");
for (const t of indexable.slice(0, 15)) console.log(`  ${String(t.count).padStart(3)}  ${t.region}/${t.town}`);
