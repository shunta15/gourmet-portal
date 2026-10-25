/**
 * automation/v2/lib/integrate-vertical.mjs — グルメ以外の店を、今のデータの作り方に入れる
 *
 * 材料を automation/vertical-stores/ の同じ形で置き(キーは tri-<業種>-<トリニティアポの行>)、
 * build-places.mjs --listed / build-features.mjs で生成データ(lib/places/generated/*.json)を作り直す:
 *   gbp/<key>.json               Google マップで確かめた店(verdict は「一致」)
 *   category-overrides/<key>.json 種類(claude が選び、根拠つき)
 *   articles/<key>.json          店の紹介記事(Place.article)
 *   photos/<key>.json            店の写真(public/_portal/vshops/<key>/ に実在するものだけ)
 *   features/<key>.json          店の特集記事(体験・スポーツだけ)
 *   pilot.json                   出す店のキー(追記)
 * 写真は店の実写だけ。足りない枠は空のまま(仮の画像・使い回しで埋めない)。
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { HAS_FEATURE, categoriesOf } from "./prompt.mjs";
import { REPO, abs, nfc, nowIso, readJson, today, writeJson } from "./util.mjs";

const VS = abs("automation/vertical-stores");
const rel = (...p) => path.join(VS, ...p);
const publicDir = (key) => abs("public/_portal/vshops", key);
const webPath = (key, file) => `/_portal/vshops/${key}/${file}`;

/** URL に使えない文字を落とした店名(特集の ID。日本語のまま) */
const featureIdOf = (name) => nfc(name).replace(/[\s　/?#%\\]+/g, "");

export function runBuilders(log = () => {}) {
  const out = [];
  for (const [script, args] of [
    ["automation/vertical-stores/build-places.mjs", ["--listed"]],
    ["automation/vertical-stores/build-features.mjs", []],
  ]) {
    const r = spawnSync("node", [script, ...args], { cwd: REPO, encoding: "utf8", timeout: 300_000 });
    out.push({ script, status: r.status, stdout: r.stdout, stderr: r.stderr });
    if (r.status !== 0) throw new Error(`${script} が失敗(exit ${r.status}): ${(r.stderr || r.stdout).slice(-400)}`);
    log(`${path.basename(script)}: ${(r.stdout || "").split("\n")[0].slice(0, 160)}`);
  }
  return out;
}

export async function integrateVertical({ store, result, manifest, work, verified, log = () => {} }) {
  const vEn = store.verticalEn;
  const key = store.key;
  const info = store.info;
  const date = today();
  const byId = new Map(manifest.map((m) => [m.id, m]));
  const judged = new Map((result.photos || []).map((p) => [p.id, p]));
  const used = (result.photos || []).filter((p) => p.use && byId.has(p.id));

  // ---- 写真(使うと決まった写真を全部。public/_portal/vshops/<key>/<id>.jpg)
  mkdirSync(publicDir(key), { recursive: true });
  const images = [];
  for (const p of used) {
    const m = byId.get(p.id);
    copyFileSync(path.join(work, m.full), path.join(publicDir(key), `${p.id}.jpg`));
    images.push({
      path: webPath(key, `${p.id}.jpg`),
      imageUrl: m.srcUrl,
      pageUrl: m.pageUrl || info.gbpUrl,
      what: String(p.what).trim(),
      ...(p.kind ? { kind: p.kind } : {}),
      width: m.width,
      height: m.height,
      source: m.source === "maps" ? "Google マップ" : "公式サイト",
    });
  }
  writeJson(rel("photos", `${key}.json`), { key, images, note: `automation/v2/write.mjs が ${nowIso()} に取得。店の実写だけ(AI 画像・汎用画像・地図・ロゴ・顔が大きい画像は除外)。` });

  // ---- gbp(Google マップで確かめた店)
  writeJson(rel("gbp", `${key}.json`), {
    tab: "トリニティアポ",
    tabEn: `tri-${vEn}`,
    row: store.row,
    sheet: { name: store.name, address: "", url: store.sheetUrl || "", type: store.industryRaw || "", d1: "", d2: "" },
    urlKind: store.urlKind || "place",
    route: "第1段(verify-gbp.mjs)で確認済み",
    verdict: "一致",
    verdictReason: store.reason || "第1段で電話・店名・住所の照合に通った",
    place: {
      name: info.name,
      address: info.address,
      category: info.category,
      lat: info.lat,
      lng: info.lng,
      gbpUrl: info.gbpUrl,
      phone: info.phone,
      website: info.website,
      hours: info.hours,
      reserveLinks: [],
      statusSignals: info.status ? [info.status] : [],
      closedSignal: false,
    },
    fetchedAt: info.fetchedAt,
  });

  // ---- 種類
  writeJson(rel("category-overrides", `${key}.json`), { key, category: result.category.slug, evidence: result.category.evidence || "" });

  // ---- 事実(裏取りに通ったものだけを残す。札の factIndex は、残した facts の位置に付け替える)
  const okIdx = new Set((result.facts || []).map((_, i) => i).filter((i) => !verified.unverified.some((u) => u.index === i)));
  const facts = [];
  const newIndex = new Map();
  (result.facts || []).forEach((f, i) => {
    if (!okIdx.has(i)) return;
    newIndex.set(i, facts.length);
    facts.push({ claim: f.claim, source: /^maps$/i.test(String(f.source)) ? info.gbpUrl : f.source, quote: f.quote, checkedAt: date });
  });
  const tags = (result.article.tags || []).filter((t) => newIndex.has(t.factIndex)).map((t) => ({ tag: t.tag, factIndex: newIndex.get(t.factIndex) }));
  const sources = [...(result.sources || [])];
  if (!sources.some((s) => /maps\.google|google\.[a-z.]+\/maps/.test(s.url))) sources.push({ label: "Google マップ", url: info.gbpUrl });

  const a = result.article;
  writeJson(rel("articles", `${key}.json`), {
    key,
    headline: a.headline,
    lede: a.lede,
    sections: a.sections,
    ...(vEn === "stay" && a.rooms?.length ? { rooms: a.rooms } : {}),
    menus: a.menus || [],
    tags,
    facts,
    sources,
    notes: `automation/v2/write.mjs が ${date} に claude -p --model sonnet で作成。事実の裏取り: ${verified.verified}/${verified.total} 件(quote が出どころにあるもの)。裏取りに通らなかった facts は載せていない。`,
  });

  // ---- 特集記事(体験・スポーツ)
  const empty = { points: 0, featureSkipped: null };
  if (HAS_FEATURE.has(vEn) && result.feature) {
    const f = result.feature;
    const plan = result.featurePlan || {};
    const pathOf = (id) => (id && used.some((p) => p.id === id) ? webPath(key, `${id}.jpg`) : null);
    const hero = pathOf(plan.hero);
    if (!hero) {
      empty.featureSkipped = "特集記事の主役の写真が無い(使える写真なし)ため、特集記事は作らず店の紹介記事だけにした";
    } else {
      const ranking = f.ranking.map((r, i) => {
        const img = pathOf((plan.points || [])[i]);
        if (!img) empty.points++;
        return {
          rank: `POINT ${String(i + 1).padStart(2, "0")}`,
          rankNum: i + 1,
          name: r.name,
          cuisine: r.cuisine,
          area: r.area || store.cityName || "",
          purpose: r.purpose || "",
          desc: r.desc,
          images: img ? [img] : [],
          specs: r.specs || [],
        };
      });
      const article = {
        id: featureIdOf(info.name),
        no: "",
        articleType: "guide",
        kicker: f.kicker,
        title: f.title,
        titleHTML: f.titleHTML,
        subtitle: f.subtitle,
        lede: f.lede,
        date,
        reading: "",
        author: "マチノワ編集部",
        heroImage: hero,
        ogImage: hero,
        ranking,
        sideArticles: [],
        quote: f.quote,
        quoteCite: "マチノワ編集部",
        closing: f.closing,
      };
      const cat = categoriesOf(vEn).find((c) => c.slug === result.category.slug);
      writeJson(rel("features", `${key}.json`), {
        key,
        vertical: vEn,
        storeName: info.name,
        article,
        summary: f.summary,
        tags: [cat?.name, store.cityName].filter(Boolean),
        charCount: [article.lede, ...ranking.map((r) => r.desc), article.quote, article.closing].join("").replace(/\s/g, "").length,
        facts,
        images: images.map((i) => ({ path: i.path, imageUrl: i.imageUrl, pageUrl: i.pageUrl, what: i.what })),
        sources,
        notes: `automation/v2/write.mjs が ${date} に作成。`,
      });
    }
  }

  // ---- 出す店のキー(pilot.json に追記。重複は足さない)
  const pilotFile = rel("pilot.json");
  const pilot = readJson(pilotFile);
  if (!pilot.includes(key)) {
    pilot.push(key);
    writeFileSync(pilotFile, JSON.stringify(pilot) + "\n");
  }

  // ---- 生成データを作り直す
  runBuilders(log);

  // ---- 結果の確認(生成データに本当に入ったか。成果物の実在で判断する)
  const places = readJson(abs(`lib/places/generated/${vEn}.json`)).places;
  const place = places.find((p) => /[?&]cid=(\d+)/.exec(p.mapUrl || "")?.[1] === String(store.cid));
  if (!place) {
    const unm = readJson(rel("unmapped.json"), { items: [] }).items.find((x) => x.key === key);
    throw new Error(`生成データ(${vEn}.json)に店が入らなかった${unm ? `(除外の理由: ${unm.reason})` : ""}`);
  }
  let hasFeature = false;
  if (HAS_FEATURE.has(vEn) && result.feature && !empty.featureSkipped) {
    const feats = readJson(abs(`lib/places/generated/features-${vEn}.json`)).features;
    hasFeature = feats.some((x) => x.key === key);
  }
  return {
    placeId: place.id,
    placeName: place.name,
    photosPlaced: place.images?.length ?? 0,
    articleInPlace: !!place.article,
    featureInGenerated: hasFeature,
    emptyPointFrames: empty.points,
    featureSkipped: empty.featureSkipped,
    urls: {
      shop: `/${vEn}/shop/${place.id}`,
      // 店の特集記事のページがあるのはアクティビティ・スポーツ・ステイ・くらしだけ(ビューティー・ボディケア・ペットは店のページ 1 枚)
      article: hasFeature && ["activity", "sports", "stay", "life"].includes(vEn) ? `/${vEn}/article/${place.id}` : null,
    },
  };
}
