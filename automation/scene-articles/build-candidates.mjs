#!/usr/bin/env node
/**
 * build-candidates.mjs
 *
 * 利用シーン別特集（シーン × 街/地域）の記事候補を、店データから機械的に抽出する。何度でも再実行できる。
 *
 * 規則
 *   - シーン = lib/scenes.ts の12シーン。店が当たるかは「tags が scene.matchTags のどれかに一致」
 *     （/scene/<slug> ページの判定と同じ）。
 *   - 地域の単位は「街（市区町村。lib/towns.ts）」と「地域（region）」の両方。該当店が MIN_STORES（4）店以上の組み合わせを列挙。
 *   - 各店に、そのタグの根拠となる事実を添える。
 *       lib/articleStores.ts の店（r299〜） → automation/stores500/tag-evidence.json の根拠（basis: "tag-evidence"）
 *       それ以外の店                       → seats / hours から導ける事実（basis: "fields"）。導けなければ "tag-only"
 *     "tag-only" = 根拠が tags の付与だけで、事実による裏づけが無い。ライターはこの店のタグを本文で根拠づけられない
 *     ので、別の事実（立地・業態・営業時間など data にあるもの）で書くか、記事から外すこと。
 *   - 店の画像が実写か（プレースホルダでないか）・店舗ページが index 対象かも店ごとに出す。
 *
 * 出力: automation/scene-articles/candidates.json
 *   { generatedAt, params, summary, stores: {<id>: {...}}, candidates: [{...}] }
 *   candidates は店数の多い順。greedyOrder は「同じ店ばかりに偏らない」ための選び順
 *   （前に選んだ候補でまだ使われていない実写画像つきの店が最も多い候補から順に番号を振る。newStores がその数）。
 *
 * 使い方: node automation/scene-articles/build-candidates.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadData, loadLib, ROOT } from "../lib/load-data.mjs";
import { hasRealImage, known, matchesScene } from "./common.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MIN_STORES = 4;

const { RESTAURANTS } = await loadData();
const { SCENES } = await loadLib("scenes");
const { REGIONS } = await loadLib("regions");
const T = await loadLib("towns");
const IDX = await loadLib("restaurantIndexable");
const { ARTICLE_STORES } = await loadLib("articleStores");

const tagEvidence = JSON.parse(readFileSync(path.join(ROOT, "automation/stores500/tag-evidence.json"), "utf8"));
const ARTICLE_IDS = new Set(ARTICLE_STORES.map((r) => r.id));
const SCENE_TAGS = new Set(SCENES.flatMap((s) => s.matchTags));

// ---------------------------------------------------------------- 事実の取り出し

/** 営業時間の文字列から「HH:MM–HH:MM」の窓を取り出す（翌0:00 / 24:00 / 閉店が開店より前 = 日またぎ） */
function windows(hours) {
  const out = [];
  const re = /(\d{1,2}):(\d{2})\s*[–\-〜~－―]\s*(翌)?\s*(\d{1,2}):(\d{2})/g;
  let m;
  while ((m = re.exec(hours))) {
    const open = Number(m[1]) * 60 + Number(m[2]);
    let close = Number(m[4]) * 60 + Number(m[5]);
    if (m[3] || close <= open) close += 24 * 60;
    out.push({ open, close, text: m[0].replace(/\s+/g, "") });
  }
  return out;
}

const NEG = {
  個室: /(?<!半)個室[^。／/、,]{0,3}(なし|無し|ない|なく|不可|ありません|できません)/,
  貸切: /(貸切|貸し切り)[^。／/、,]{0,6}(不可|できません|なし|無し|ない|不可能)/,
  宴会: /宴会[^。／/、,]{0,4}(不可|できません|なし|無し|ない)/,
};

/** コード側の店（tag-evidence.json が無い店）の、タグごとの事実の裏づけ。導けなければ null */
function fieldSupport(r, tag) {
  const seats = known(r.seats);
  const hours = known(r.hours);
  const cuisine = known(r.cuisine) || "";
  switch (tag) {
    case "個室":
      if (seats && /(?<!半)個室/.test(seats) && !NEG.個室.test(seats)) return [{ field: "seats", value: seats }];
      return null;
    case "貸切可":
      if (seats && /貸切|貸し切り/.test(seats) && !NEG.貸切.test(seats)) return [{ field: "seats", value: seats }];
      return null;
    case "宴会":
      if (seats && /座敷|宴会/.test(seats) && !NEG.宴会.test(seats)) return [{ field: "seats", value: seats }];
      return null;
    case "一人飲み":
      if (seats && /カウンター/.test(seats)) return [{ field: "seats", value: seats }];
      return null;
    case "ランチ": {
      if (!hours) return null;
      const w = windows(hours).find((x) => x.open <= 14 * 60 && x.close > 11 * 60);
      return w ? [{ field: "hours", value: w.text }] : null;
    }
    case "深夜営業":
    case "深夜": {
      if (!hours) return null;
      const w = windows(hours).find((x) => x.close >= 24 * 60);
      return w ? [{ field: "hours", value: w.text }] : null;
    }
    case "パン":
    case "ベーカリー":
      return /パン|ベーカリー/.test(cuisine) ? [{ field: "cuisine", value: cuisine }] : null;
    case "そば・うどん":
    case "そば":
    case "うどん":
    case "手打ちそば":
      return /そば|蕎麦|うどん/.test(cuisine) ? [{ field: "cuisine", value: cuisine }] : null;
    default:
      return null; // デート・女子会・接待・ペット可・日本酒系 などは席/営業時間から導けない
  }
}

/** 店 × タグ → { basis: "tag-evidence"|"fields"|"tag-only", facts: [...] } */
function tagBasis(r, tag) {
  if (ARTICLE_IDS.has(r.id)) {
    const ev = (tagEvidence[r.id]?.tags || []).filter((t) => t.tag === tag);
    if (ev.length) return { basis: "tag-evidence", facts: ev.map((e) => ({ rule: e.rule, evidence: e.evidence })) };
    return { basis: "tag-only", facts: [] };
  }
  const f = fieldSupport(r, tag);
  return f ? { basis: "fields", facts: f } : { basis: "tag-only", facts: [] };
}

// ---------------------------------------------------------------- 店ごとの情報

const stores = {};
for (const r of RESTAURANTS) {
  const sceneTags = [...new Set((r.tags || []).filter((t) => SCENE_TAGS.has(t)))];
  const p = T.parseTown(r.address, r.region);
  stores[r.id] = {
    id: r.id,
    name: r.name,
    cuisine: r.cuisine,
    region: r.region,
    town: p?.town ?? null,
    address: known(r.address),
    nearest: known(r.nearest),
    hours: known(r.hours),
    closed: known(r.closed),
    seats: known(r.seats),
    budget: known(r.budget),
    source: ARTICLE_IDS.has(r.id) ? "articleStores" : "code",
    hasRealImage: hasRealImage(r),
    indexable: IDX.isRestaurantIndexable(r.id),
    sceneTags: Object.fromEntries(sceneTags.map((t) => [t, tagBasis(r, t)])),
  };
}

// ---------------------------------------------------------------- 候補

const candidates = [];
for (const scene of SCENES) {
  const matched = RESTAURANTS.filter((r) => matchesScene(r, scene));

  const areas = new Map(); // area key → {kind, region, town?, ids[]}
  const add = (key, init, id) => {
    if (!areas.has(key)) areas.set(key, { ...init, ids: [] });
    areas.get(key).ids.push(id);
  };
  for (const r of matched) {
    add(r.region, { kind: "region", region: r.region }, r.id);
    const p = T.parseTown(r.address, r.region);
    if (p) add(T.townKey(r.region, p.town), { kind: "town", region: r.region, town: p.town, pref: p.pref }, r.id);
  }

  for (const [areaKey, a] of areas) {
    if (a.ids.length < MIN_STORES) continue;
    const ids = a.ids.slice().sort((x, y) => Number(x.replace(/\D/g, "")) - Number(y.replace(/\D/g, "")));
    // 店ごとの、このシーンでの根拠（当たったタグのうち、事実の裏づけがあるものを優先）
    const storeBasis = {};
    for (const id of ids) {
      const hit = scene.matchTags.filter((t) => stores[id].sceneTags[t]);
      const supported = hit.filter((t) => stores[id].sceneTags[t].basis !== "tag-only");
      storeBasis[id] = supported.length
        ? { basis: stores[id].sceneTags[supported[0]].basis, tags: supported }
        : { basis: "tag-only", tags: hit };
    }
    const tagOnly = ids.filter((id) => storeBasis[id].basis === "tag-only").length;
    const usable = ids.filter((id) => stores[id].hasRealImage).length;
    const regionName = REGIONS[a.region]?.name ?? a.region;
    const areaLabel = a.kind === "town" ? a.town : regionName;
    candidates.push({
      candidateId: `${scene.slug}:${areaKey}`,
      suggestedArticleId: `scene-${scene.slug}-${areaKey.replace("/", "-")}`,
      kind: a.kind,
      scene: scene.slug,
      sceneName: scene.name,
      area: areaKey,
      areaLabel,
      region: a.region,
      regionName,
      ...(a.kind === "town"
        ? { town: a.town, pref: a.pref }
        : {
            // 地域名（REGIONS の name）と都道府県が一致しない地域がある（nagoya = 愛知県全域・hyogo = 兵庫県全域 など）。
            // 記事の地名は prefs と店の街（stores[id].town）に合わせること。
            prefs: [...new Set(ids.map((id) => T.parseTown(stores[id].address ?? "", a.region)?.pref ?? T.PREF_BY_REGION[a.region]))],
          }),
      count: ids.length,
      usableCount: usable, // 実写画像のある店（プレースホルダ画像の店は記事から外れる）
      indexableCount: ids.filter((id) => stores[id].indexable).length,
      tagOnlyCount: tagOnly,
      tagOnlyShare: Math.round((tagOnly / ids.length) * 1000) / 1000,
      storeIds: ids,
      storeBasis,
    });
  }
}

// 店数の多い順（同数なら 実写画像つき → 根拠つきが多い順 → シーン順）
const sceneIdx = Object.fromEntries(SCENES.map((s, i) => [s.slug, i]));
candidates.sort(
  (a, b) =>
    b.count - a.count ||
    b.usableCount - a.usableCount ||
    a.tagOnlyShare - b.tagOnlyShare ||
    sceneIdx[a.scene] - sceneIdx[b.scene] ||
    a.area.localeCompare(b.area),
);

// 同じ店ばかりに偏らない選び順（貪欲法）
{
  const covered = new Set();
  const left = new Set(candidates.map((c) => c.candidateId));
  const byId = Object.fromEntries(candidates.map((c) => [c.candidateId, c]));
  let order = 1;
  while (left.size) {
    let best = null;
    let bestNew = -1;
    for (const id of left) {
      const c = byId[id];
      const fresh = c.storeIds.filter((s) => stores[s].hasRealImage && !covered.has(s)).length;
      if (fresh > bestNew) {
        best = c;
        bestNew = fresh;
      }
    }
    best.greedyOrder = order++;
    best.newStores = bestNew;
    for (const s of best.storeIds) if (stores[s].hasRealImage) covered.add(s);
    left.delete(best.candidateId);
  }
}

// ---------------------------------------------------------------- 出力

const usedStoreIds = new Set(candidates.flatMap((c) => c.storeIds));
const outStores = Object.fromEntries([...usedStoreIds].sort().map((id) => [id, stores[id]]));
const perScene = SCENES.map((s) => {
  const cs = candidates.filter((c) => c.scene === s.slug);
  return {
    scene: s.slug,
    matchedStores: RESTAURANTS.filter((r) => matchesScene(r, s)).length,
    candidates: cs.length,
    town: cs.filter((c) => c.kind === "town").length,
    region: cs.filter((c) => c.kind === "region").length,
  };
});
const summary = {
  candidates: candidates.length,
  town: candidates.filter((c) => c.kind === "town").length,
  region: candidates.filter((c) => c.kind === "region").length,
  usableUnder3: candidates.filter((c) => c.usableCount < 3).length,
  storesUsed: usedStoreIds.size,
  storesTotal: RESTAURANTS.length,
  tagOnlyStoreShareOverall:
    Math.round(
      (candidates.reduce((s, c) => s + c.tagOnlyCount, 0) / candidates.reduce((s, c) => s + c.count, 0)) * 1000,
    ) / 1000,
  perScene,
};

writeFileSync(
  path.join(HERE, "candidates.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), params: { minStores: MIN_STORES }, summary, stores: outStores, candidates }, null, 1) + "\n",
);

console.log(
  `候補 ${summary.candidates}（街 ${summary.town} / 地域 ${summary.region}）・使う店 ${summary.storesUsed}/${summary.storesTotal}・実写3店未満 ${summary.usableUnder3}・tag-only 全体 ${(summary.tagOnlyStoreShareOverall * 100).toFixed(1)}%`,
);
console.log("上位30（店数 / 実写 / tag-only割合 / greedy）:");
for (const c of candidates.slice(0, 30)) {
  console.log(
    `  ${String(c.count).padStart(3)}店 実写${String(c.usableCount).padStart(3)} tag-only ${String(Math.round(c.tagOnlyShare * 100)).padStart(3)}%  #${String(c.greedyOrder).padStart(3)}  ${c.sceneName} × ${c.areaLabel}（${c.kind === "town" ? "街" : "地域"}・${c.region}）`,
  );
}
