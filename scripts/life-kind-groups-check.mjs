// くらしの種類の組(lib/verticals/lifeKinds.ts)の突き合わせ。読むだけ(何も書かない)。
//   node scripts/life-kind-groups-check.mjs
// 1) life.json の category が、必ずどれか 1 つの組に入る(漏れ 0・二重 0)
// 2) 限定公開(lib/unlisted.ts の life)を外した全店と、公開分(限定公開を除いた店)の、組ごとの件数
// 3) 旧い kind の値(category の slug)が対応する組になる
import { readFileSync } from "node:fs";
import { LIFE_KIND_GROUPS, LIFE_GROUP_OF_CATEGORY, resolveLifeKind } from "../lib/verticals/lifeKinds.ts";
import { UNLISTED_PLACE_IDS } from "../lib/unlisted.ts";

const places = JSON.parse(readFileSync(new URL("../lib/places/generated/life.json", import.meta.url), "utf8")).places;
const unlisted = new Set(UNLISTED_PLACE_IDS.life ?? []);

const owner = new Map();
let bad = 0;
for (const g of LIFE_KIND_GROUPS) for (const c of g.categories) {
  if (owner.has(c)) { console.log(`二重: ${c} が ${owner.get(c)} と ${g.slug} の両方`); bad++; }
  owner.set(c, g.slug);
}
const cats = [...new Set(places.map((p) => p.category))];
for (const c of cats) if (!LIFE_GROUP_OF_CATEGORY[c]) { console.log(`漏れ: category ${c} がどの組にも入らない`); bad++; }
const leaked = places.filter((p) => !LIFE_GROUP_OF_CATEGORY[p.category]);

const count = (list) => Object.fromEntries(LIFE_KIND_GROUPS.map((g) => [g.slug, list.filter((p) => LIFE_GROUP_OF_CATEGORY[p.category] === g.slug)]));
const all = count(places);
const pub = count(places.filter((p) => !unlisted.has(p.id)));
console.log(`life.json の店: ${places.length} / 限定公開 ${[...unlisted].filter((id) => places.some((p) => p.id === id)).length} / 公開分 ${places.filter((p) => !unlisted.has(p.id)).length}`);
console.log(`組に入った店(限定公開を外した全店): ${Object.values(all).reduce((n, l) => n + l.length, 0)} / 入らなかった店: ${leaked.length}`);
console.log("組\t全店\t公開分\tcategory内訳(全店)");
for (const g of LIFE_KIND_GROUPS) {
  const inner = g.categories.map((c) => `${c} ${places.filter((p) => p.category === c).length}`).join(" / ");
  console.log(`${g.slug} ${g.name}\t${all[g.slug].length}\t${pub[g.slug].length}\t${inner}`);
}
for (const [k, want] of [["lesson", "learn"], ["shrine-temple", "visit"], ["fashion-craft", "shop"], ["photo-marriage", "service"], ["car-repair", "service"], ["flower-farm", "visit"], ["fortune", "visit"], ["visit", "visit"], ["zzz", null]]) {
  if (resolveLifeKind(k) !== want) { console.log(`旧い値の読み替えが違う: ${k} → ${resolveLifeKind(k)} (期待 ${want})`); bad++; }
}
console.log(bad === 0 && leaked.length === 0 ? "OK: 漏れ 0・二重 0" : `NG: ${bad} 件`);
process.exit(bad === 0 && leaked.length === 0 ? 0 : 1);
