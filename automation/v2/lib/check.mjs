/**
 * automation/v2/lib/check.mjs — 書けた結果(result.json)を機械で調べる(claude の自己申告は信じない)
 *  1. 文の検査: scripts/check-article-sentences.mjs の classifySentence(R 他サイトの評価・口コミ・賞 / A〜E / Q 出どころの言い回し / P 料金 / W 使わない言葉)
 *  2. オーナーが決めた禁止の語・言い回しを足して調べる(改善・〇選・掲げる・名乗る・表記が分かれる など)
 *  3. 形の検査(必須の項目・個数・写真の割り当て・種類・札)
 *  4. 事実の裏取り: facts の quote が、出どころのページ(公式サイトの文字・Google マップの情報)に本当にあるか
 */
import { classifySentence, splitSentences } from "../../../scripts/check-article-sentences.mjs";
import { fetchText } from "./http.mjs";
import { htmlToText } from "./site.mjs";
import { nfc, squash } from "./util.mjs";
import { ALLOWED_TAGS, HAS_FEATURE, categoriesOf } from "./prompt.mjs";

/** オーナー決定(2026-10-25)の禁止語。classifySentence に無い分を足す(「効く」は料理の味の言い方も拾うので、ここでは禁止として扱う=オーナーの指定どおり) */
const BANNED = [
  [/おすすめ|オススメ|お勧め|お薦め/, "おすすめ"],
  [/人気/, "人気"],
  [/(?:[0-9０-９〇○一二三四五六七八九十]+選|選[0-9０-９]+)(?![びべばぶんぼぶ])/, "〇選"],
  [/No\.?\s*[1１]|ナンバー(?:ワン|1)/i, "No.1"],
  [/その他/, "その他"],
  [/癒し|癒や|癒さ|癒え|癒|いやし/, "癒し"],
  [/リフレッシュ/, "リフレッシュ"],
  [/整える|整え(?:て|た|られ)|整う|整っ/, "整える"],
  [/効く|効き(?!目)|効い(?:て|た)|効かせ/, "効く"],
  [/改善/, "改善"],
  // 料金・評価・賞(classifySentence の P・R に加えて)
  [/★|☆|星[0-9０-９一二三四五]|星の数|口コミ|クチコミ|レビュー|評価|受賞|入賞|賞(?!味|与)|ミシュラン|百名店|ランキング/, "評価・賞"],
  [/[0-9０-９][0-9０-９,，.]*\s*円|[¥￥]\s*[0-9０-９]|税込|税抜|料金|価格|値段|予算|無料|割引|格安|お得/, "料金"],
  // 出どころを語る言い回し(オーナーの例)
  [/と(?:書かれ|案内し|紹介され|記載され|載って|明記され)|によると|によれば|とのこと|表記が分かれ|掲げ(?:る|て|た|ら)|名乗(?:る|っ|り)|引用/, "出どころの言い回し"],
  // 行ったふり
  [/と感じ(?:た|る|ます)|足を運(?:ぶ|ん)でみ|実際に(?:行|訪|食べ|入)/, "行ったふり"],
];

/** 検査の対象にする文章欄を { path, text } で集める。確認用の欄(facts・photos・notes・category.evidence・sources)は含めない */
export function textFields(result) {
  const out = [];
  const push = (p, t) => {
    if (typeof t === "string" && t.trim()) out.push({ path: p, text: t.replace(/<[^>]+>/g, "") });
  };
  const art = result.article || {};
  for (const k of ["title", "titleHTML", "subtitle", "lede", "quote", "closing", "headline"]) push(`article.${k}`, art[k]);
  (art.ranking || []).forEach((r, i) => {
    for (const k of ["name", "cuisine", "area", "desc"]) push(`article.ranking[${i}].${k}`, r[k]);
    (r.specs || []).forEach((s, j) => {
      push(`article.ranking[${i}].specs[${j}].k`, s.k);
      push(`article.ranking[${i}].specs[${j}].v`, s.v);
    });
  });
  (art.sections || []).forEach((s, i) => {
    push(`article.sections[${i}].heading`, s.heading);
    push(`article.sections[${i}].body`, s.body);
  });
  (art.menus || []).forEach((m, i) => push(`article.menus[${i}].name`, m.name));
  (art.rooms || []).forEach((m, i) => push(`article.rooms[${i}].name`, m.name));
  const f = result.feature;
  if (f) {
    for (const k of ["title", "titleHTML", "subtitle", "lede", "summary", "quote", "closing"]) push(`feature.${k}`, f[k]);
    (f.ranking || []).forEach((r, i) => {
      for (const k of ["name", "cuisine", "area", "purpose", "desc"]) push(`feature.ranking[${i}].${k}`, r[k]);
      (r.specs || []).forEach((s, j) => {
        push(`feature.ranking[${i}].specs[${j}].k`, s.k);
        push(`feature.ranking[${i}].specs[${j}].v`, s.v);
      });
    });
  }
  (result.photos || []).filter((p) => p.use).forEach((p, i) => push(`photos[${i}].what`, p.what));
  return out;
}

/** 文の検査。問題の一覧 [{ path, sentence, type, word }] */
export function checkSentences(result) {
  const problems = [];
  for (const f of textFields(result)) {
    if (/"/.test(f.text)) problems.push({ path: f.path, sentence: f.text.slice(0, 60), type: "形", word: "半角のダブルクォート(\")" });
    const sents = splitSentences(f.text);
    for (const s of sents.length ? sents : [f.text]) {
      const c = classifySentence(s);
      if (c) problems.push({ path: f.path, sentence: s.trim(), type: c.type, word: c.word });
      for (const [re, label] of BANNED) {
        const m = s.match(re);
        if (m && !(c && c.word === m[0])) problems.push({ path: f.path, sentence: s.trim(), type: "禁止", word: `${label}(${m[0]})` });
      }
    }
  }
  // 同じ文・同じ語での重複を 1 件にまとめる
  const seen = new Set();
  return problems.filter((p) => {
    const k = `${p.path}|${p.sentence}|${p.word}`;
    return seen.has(k) ? false : (seen.add(k), true);
  });
}

const isStr = (x) => typeof x === "string" && x.trim().length > 0;

/** 形の検査。問題の一覧(文字列) */
export function checkShape(result, { vEn, manifestIds }) {
  const errs = [];
  if (result.status === "failed") return errs; // 失敗の出口は呼び出し側で扱う
  if (result.status !== "ok") errs.push(`status が ok でも failed でもない(${JSON.stringify(result.status)})`);
  const a = result.article;
  if (!a || typeof a !== "object") return [...errs, "article が無い"];
  const ids = new Set(manifestIds);
  const photos = Array.isArray(result.photos) ? result.photos : [];
  if (!Array.isArray(result.photos)) errs.push("photos が配列でない");
  for (const p of photos) if (!ids.has(p?.id)) errs.push(`photos に cand に無い ID: ${p?.id}`);
  const useIds = new Set(photos.filter((p) => p.use).map((p) => p.id));
  for (const p of photos.filter((x) => x.use)) if (!isStr(p.what)) errs.push(`写真 ${p.id} の what(見えるものの説明)が無い`);
  const missingJudge = [...ids].filter((id) => !photos.some((p) => p.id === id));
  if (missingJudge.length) errs.push(`photos に判断が書かれていない候補: ${missingJudge.join(",")}`);
  const checkPlan = (plan, n, label) => {
    if (!plan || typeof plan !== "object") return errs.push(`${label} が無い`);
    const used = new Set();
    const one = (id, w) => {
      if (id == null) return;
      if (!useIds.has(id)) errs.push(`${label} の ${w} が use=true の写真でない(${id})`);
      if (used.has(id)) errs.push(`${label} で同じ写真を 2 回使っている(${id})`);
      used.add(id);
    };
    one(plan.hero, "hero");
    if (!Array.isArray(plan.points) || plan.points.length !== n) errs.push(`${label}.points の長さが POINT の数(${n})と違う`);
    else plan.points.forEach((id, i) => one(id, `points[${i}]`));
  };
  if (vEn === "gourmet") {
    for (const k of ["kicker", "title", "titleHTML", "subtitle", "lede", "quote", "closing"]) if (!isStr(a[k])) errs.push(`article.${k} が空`);
    const rk = Array.isArray(a.ranking) ? a.ranking : [];
    if (rk.length < 3 || rk.length > 5) errs.push(`ranking が 3〜5 個でない(${rk.length})`);
    rk.forEach((r, i) => {
      for (const k of ["name", "cuisine", "area", "desc"]) if (!isStr(r[k])) errs.push(`ranking[${i}].${k} が空`);
      if (!Array.isArray(r.specs)) errs.push(`ranking[${i}].specs が配列でない`);
    });
    checkPlan(result.photoPlan, rk.length, "photoPlan");
  } else {
    if (!isStr(a.headline)) errs.push("article.headline が空");
    if (!isStr(a.lede)) errs.push("article.lede が空");
    if (!Array.isArray(a.sections) || a.sections.length < 1) errs.push("article.sections が無い");
    (a.sections || []).forEach((s, i) => {
      if (!isStr(s.heading) || !isStr(s.body)) errs.push(`sections[${i}] の heading / body が空`);
    });
    const slugs = new Set(categoriesOf(vEn).map((c) => c.slug));
    if (!result.category || !slugs.has(result.category.slug)) errs.push(`category.slug が ${vEn} の種類にない(${result.category?.slug})`);
    for (const t of a.tags || []) {
      if (!ALLOWED_TAGS[vEn].includes(t.tag)) errs.push(`使えない札「${t.tag}」`);
      if (!Number.isInteger(t.factIndex) || t.factIndex < 0 || t.factIndex >= (result.facts || []).length) errs.push(`札「${t.tag}」の factIndex が範囲外`);
    }
    if (HAS_FEATURE.has(vEn) && result.feature) {
      const f = result.feature;
      for (const k of ["kicker", "title", "titleHTML", "subtitle", "lede", "summary", "quote", "closing"]) if (!isStr(f[k])) errs.push(`feature.${k} が空`);
      const rk = Array.isArray(f.ranking) ? f.ranking : [];
      if (rk.length < 3 || rk.length > 5) errs.push(`feature.ranking が 3〜5 個でない(${rk.length})`);
      rk.forEach((r, i) => {
        for (const k of ["name", "cuisine", "desc"]) if (!isStr(r[k])) errs.push(`feature.ranking[${i}].${k} が空`);
      });
      checkPlan(result.featurePlan, rk.length, "featurePlan");
    }
  }
  if (!Array.isArray(result.facts) || result.facts.length < 4) errs.push(`facts が少なすぎる(${result.facts?.length ?? 0} 件・4 件以上)`);
  return errs;
}

/**
 * 事実の裏取り。facts[].quote が出どころの文字にあるか。
 * ctx: { info(Google マップの情報), storeText, sitePages: [{url, text}], cacheDir? }
 * 返り値: { total, verified, unverified: [{index, claim, source, quote, reason}] }
 */
export async function verifyFacts(facts, { info, storeText, sitePages }) {
  const mapsHay = squash(storeText + JSON.stringify(info ?? {}));
  const pageCache = new Map(sitePages.map((p) => [normUrl(p.url), squash(p.text)]));
  const unverified = [];
  let verified = 0;
  for (const [i, f] of (facts || []).entries()) {
    const quote = squash(f?.quote);
    const src = String(f?.source ?? "");
    if (quote.length < 3) {
      unverified.push({ index: i, ...pick(f), reason: "quote が短すぎる・無い" });
      continue;
    }
    let hay = null;
    if (/^maps$/i.test(src) || /(^|\.)google\.[a-z.]+\/maps|maps\.google\./.test(src.replace(/^https?:\/\//, ""))) hay = mapsHay;
    else if (/^https?:\/\//.test(src)) {
      const k = normUrl(src);
      if (!pageCache.has(k)) {
        const r = await fetchText(src, { timeoutMs: 20_000 });
        pageCache.set(k, r.ok ? squash(htmlToText(r.body)) : null);
      }
      hay = pageCache.get(k);
      if (hay == null) {
        unverified.push({ index: i, ...pick(f), reason: "出どころの URL を取れなかった" });
        continue;
      }
    } else {
      unverified.push({ index: i, ...pick(f), reason: "source が URL でも maps でもない" });
      continue;
    }
    if (hay.includes(quote)) verified++;
    else unverified.push({ index: i, ...pick(f), reason: "quote が出どころに無い" });
  }
  return { total: (facts || []).length, verified, unverified };
}
const pick = (f) => ({ claim: f?.claim, source: f?.source, quote: f?.quote });
const normUrl = (u) => nfc(String(u)).replace(/#.*$/, "").replace(/\/$/, "");
