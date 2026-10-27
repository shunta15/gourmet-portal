import "server-only";
import { getPlaces } from "@/lib/places";
import { findFeatureForPlace, type PlaceFeature } from "@/lib/places/features";
import type { Place } from "@/lib/places/types";
import { interleave, loadArticles, vkLineOk, vkLine, toShop, type LiveArticle, type LivePhoto, type LiveShop } from "../common/live";
import { kindFromField, kindFromWhat, plain, shortLabel, tokensOf, twoLines, type PKind } from "../shop/data";
import type { VkConfig } from "../config";

/**
 * 記事ページ(/{業種}/article/{id})の中身を、実在の店の Place から作る(サーバー専用)。ステイの article/live/articleData.ts を、業種に合わせて一般にしたもの。
 * 組み立て = 最初の画面(大きな写真・見出し 2 行・副題 1 行・リード 4 行)/ 01 帯 / 02 右に写真 / 03 左に写真 / 04 基本情報の横並び / 掲載している店 / あわせて読みたい。
 * 文は Place.article の事実だけ。足さない・言い換えない(落とすだけ)。体験した言い回し・モデルプラン・おすすめ・料金・評価は出さない。点検に通らない文は、その 1 文だけ落とす(vkLineOk)。
 * ステイの宿ごとの編集表(articleEdit.ts)は持たない。節は 記事の節のうち場所・時間・アクセスの節を除いた先頭の 3 つ(各節の先頭の文から 140 字まで)。
 *
 * 店の特集記事(lib/places/generated/features-{activity,sports,life}.json。1 本 3000 字以上)がある店は、このページが特集の本文の置き場所になる
 * (1 店 1 本の記事ページ。/{業種}/feature/{id} はここへ恒久の転送。特集の本文が 2 つの URL に出ない = canonical はこのページ)。
 * その店は、ヒーローのリード = 特集の導入 / 節 = 特集の 5 つのポイント(見出し・本文・事実の表・写真)+ 編集部のひとこと + 最後に確かめたいこと / 出どころ = 特集の出どころ。
 * 文は 1 文ずつ vkLineOk で点検し、通らない文はその 1 文だけ落とす(言い換えない)。特集が無い店は、これまでどおり店のデータの紹介記事(Place.article)から作る。
 */

export type ArtSection = {
  no: string;
  id: string;
  kicker: string;
  heading: string[];
  paras: string[];
  photo: LivePhoto | null;
  /** band = 01(横長の写真に暗い文字箱)/ right = 02(左に文・右に写真)/ left = 03(左に写真・中央に文・右に一言) */
  layout: "band" | "right" | "left";
  /** 写真の形(wide = 横長 / sq = 正方形に近い / tall = 縦長)。縦長は枠を少し高くする */
  shape: "wide" | "sq" | "tall";
  /** 03 の右の一言(使わない。null) */
  quote: string | null;
  /** 特集のポイントの事実の表(体験時間・服装など。無ければ省略) */
  specs?: Array<{ k: string; v: string }>;
  /** 特集のポイントの 2 枚目以降の写真(本文の下に並べる。無ければ省略) */
  extra?: LivePhoto[];
  /** 見出しが長い(20 字より長い)。見出しの字を少し小さくする */
  longHeading?: boolean;
};

/** 04 の 1 点(a = 上の語 / b = 次の見出し / c = 補足) */
export type Row4Item = { a: string; b: string; c?: string };
export type Row4 = {
  mode: "basics";
  no: string;
  id: string;
  kicker: string;
  heading: string[];
  note: string;
  items: Row4Item[];
};

export type ArticleView = {
  shop: LiveShop;
  /** 店名(読みの括弧を除いたもの)と、括弧の中の読み */
  nameMain: string;
  nameReading: string;
  /** 見出し 2 行(「京都市伏見区の」「藤森神社」) */
  h1: string[];
  /** 事実だけの 1 行(記事の見出し。点検済み。通らなければ「京都府の神社・寺」のような所在地+種類)。metadata の description 用 */
  headline: string;
  /** 副題 1 行(headline の 2 つめの文節) */
  sub: string;
  /** リード(導入の文から 4 行ぶん。点検済み) */
  lede: string;
  sections: ArtSection[];
  row4: Row4;
  hero: LivePhoto | null;
  infoPhoto: LivePhoto | null;
  /** 「掲載している〇〇」の説明(導入の最初の 1 文) */
  blurb: string;
  info: Array<{ k: string; v: string }>;
  index: Array<{ id: string; label: string }>;
  sources: Array<{ label: string; url: string }>;
  checkedAt?: string;
  related: LiveArticle[];
  /** 店の特集記事があるとき、その題名・ページの説明・日付(metadata・構造化データ用)。無ければ null */
  feature: { title: string; summary: string; date: string } | null;
  /** リードが長い(特集の導入。160 字より長い)。ヒーローのリードの幅を広げる */
  ledeLong: boolean;
};

/** 文(「。」で終わる単位)に分ける。「。」の直後に閉じ括弧が続くときは切らない */
export function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=。)(?![」』）)])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---- 写真の振り分け ----
type KPhoto = LivePhoto & { kind: PKind; what: string };

function withKinds(shop: LiveShop, place: Place): KPhoto[] {
  const raw = new Map((place.photos ?? []).map((ph) => [ph.path, ph as unknown as { kind?: unknown }]));
  return shop.photos.map((p) => {
    const i = p.alt.indexOf(" — ");
    const what = i >= 0 ? p.alt.slice(i + 3) : "";
    return { ...p, what, kind: kindFromField(raw.get(p.src)?.kind) ?? kindFromWhat(what) };
  });
}

const aspect = (p: LivePhoto) => p.w / Math.max(1, p.h);
const shapeOf = (p: LivePhoto): "wide" | "sq" | "tall" => (aspect(p) >= 1.2 ? "wide" : aspect(p) >= 0.95 ? "sq" : "tall");
/** 横長 > 正方形 > 縦長 の順で、同じ形なら大きい方 */
function score(p: KPhoto): number {
  const cls = shapeOf(p) === "wide" ? 2 : shapeOf(p) === "sq" ? 1 : 0;
  return (plain(p) ? 0 : -1e9) + cls * 1e7 + p.w * p.h;
}

/** 種類を順に見て、まだ使っていない写真のうち、その種類でいちばん良い 1 枚。どの種類にも無ければ null(説明の無い使い回しはしない) */
function pick(photos: KPhoto[], used: Set<string>, kinds: PKind[], opts: { wideOnly?: boolean; notText?: boolean; minW?: number } = {}): KPhoto | null {
  for (const k of kinds) {
    const pool = photos
      .filter((p) => !used.has(p.src) && p.kind === k && (!opts.wideOnly || shapeOf(p) === "wide") && (!opts.notText || plain(p)) && p.w >= (opts.minW ?? 0))
      .sort((a, b) => score(b) - score(a));
    if (pool[0]) {
      used.add(pool[0].src);
      return pool[0];
    }
  }
  return null;
}

/**
 * 節の写真。候補 = まだ使っていない写真。順位 = 説明(what)が見出しの語に当たる数 × 2 + 本文の語に当たる数 + 形(横長 0.4・正方形 0.2)。
 * 文字入りの看板・ポスターは大きく下げる。候補が 1 枚も無ければ null。
 */
function pickSection(photos: KPhoto[], used: Set<string>, head: string, body: string): KPhoto | null {
  const ht = tokensOf(head);
  const bt = tokensOf(body).filter((t) => !ht.includes(t));
  const rank = (p: KPhoto): number => {
    const w = p.what.toLowerCase();
    const rel = 2 * ht.filter((t) => w.includes(t)).length + bt.filter((t) => w.includes(t)).length;
    const shape = shapeOf(p) === "wide" ? 0.4 : shapeOf(p) === "sq" ? 0.2 : 0;
    return rel + shape - (plain(p) ? 0 : 5);
  };
  const free = photos.filter((p) => !used.has(p.src));
  const best = free.slice().sort((a, b) => rank(b) - rank(a) || b.w * b.h - a.w * a.h)[0] ?? null;
  if (best) used.add(best.src);
  return best;
}

/**
 * ヒーロー(画面いっぱいに広がる): 景色・外観のうち、幅 1000px 以上 → 700px 以上 → 幅の指定なしの順に、それぞれ「横長 → 正方形に近いもの」。
 * それも無ければ、中の様子・もの・その他の横長 → 縦長。文字入り(看板・ポスター)は選ばない。幅の足りない写真を広げてぼやけさせないため
 */
function pickHero(photos: KPhoto[], used: Set<string>): KPhoto | null {
  const nearSquare = photos.filter((p) => aspect(p) >= 0.95);
  for (const minW of [1000, 700, 0]) {
    const hit = pick(photos, used, ["view", "exterior"], { wideOnly: true, notText: true, minW }) ?? pick(nearSquare, used, ["view", "exterior"], { notText: true, minW });
    if (hit) return hit;
  }
  return (
    pick(photos, used, ["inside", "item", "other"], { wideOnly: true, notText: true }) ??
    pick(photos, used, ["view", "exterior"], { notText: true }) ??
    pick(photos, used, ["inside", "item", "other"], { notText: true })
  );
}

/** 記事のカード用の写真(外観・景色の横長)。used は呼び出しごとに新しく */
function cardPhoto(photos: KPhoto[]): LivePhoto | null {
  const used = new Set<string>();
  const p = pick(photos, used, ["exterior", "view"], { wideOnly: true, notText: true }) ?? pick(photos, used, ["inside", "other"], { wideOnly: true, notText: true }) ?? pick(photos, used, ["exterior", "view", "inside", "item", "other"], { notText: true });
  return p ? { src: p.src, w: p.w, h: p.h, alt: p.alt } : null;
}

// ---- 文の選び方 ----
/** 自動の組み立てで本文に出さない文(住所・電話・届出など) */
const SKIP_SENT = /住所は|電話は|〒|届出|指令|ふるさと納税/;

const httpHost = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

/** 「Wonderful Garden(ワンダフルガーデン柏)」→ 店名 + 括弧の中の読み */
function splitName(name: string): { main: string; reading: string } {
  const m = /^(.*?)\s*[（(]([ァ-ヶー・\s一-龠]+)[）)]$/.exec(name.trim());
  return m && m[1] ? { main: m[1].trim(), reading: m[2].trim() } : { main: name, reading: "" };
}

/** 文を、1 つのまとまりが max 字ほどになるように段落に分ける(長い 1 段落を読みやすくする。文は切らない) */
function chunkSentences(sents: string[], max = 150): string[] {
  const out: string[] = [];
  let cur = "";
  for (const t of sents) {
    if (cur && cur.length + t.length > max) {
      out.push(cur);
      cur = "";
    }
    cur += t;
  }
  if (cur) out.push(cur);
  return out;
}

/** 節の大きな写真に使う写真の幅(px)の下限。これより小さい写真は、節の大きな枠ではなく本文の下の小さな並びに出す(広げてぼやけさせない) */
const SECTION_PHOTO_MIN_W = 600;

/**
 * 店の特集(features-*.json)から、記事の節を作る。
 *   5 つのポイント = 見出し(ポイントの名前そのまま)・小さな札(ポイントの分類)・本文(150 字ほどずつの段落)・事実の表・写真(店の写真として使えるもの。1 枚目は節の写真、2 枚目以降は本文の下)
 *   + 編集部のひとこと + 最後に確かめたいこと。どれも文は 1 文ずつ vkLineOk に通し、通らない文だけ落とす(言い換えない)。本文が 1 文も残らない節は出さない。
 * 写真は店の写真(photos = 人物が主役でない・使えるもの)にあるものだけ。同じ写真を同じページで 2 回は使わない(used)。
 * 写真のある節は 帯 → 右に写真 → 左に写真 の順に 3 つの組みを回し、写真の無い節は文だけの組み(右)にする。
 * 節の大きな写真は幅 SECTION_PHOTO_MIN_W 以上のものだけ。それより小さい写真は本文の下の小さな並び(extra)に出す。
 */
function featureSections(f: PlaceFeature, photos: KPhoto[], used: Set<string>): ArtSection[] {
  const A = f.article;
  const take = (src: string): LivePhoto | null => {
    const p = photos.find((x) => x.src === src);
    if (!p || used.has(src)) return null;
    used.add(src);
    return { src, w: p.w, h: p.h, alt: f.photos[src]?.alt ?? p.alt };
  };
  const LAYOUTS = ["band", "right", "left"] as const;
  const out: ArtSection[] = [];
  let withPhoto = 0;
  const push = (v: { kicker: string; heading: string; paras: string[]; specs?: Array<{ k: string; v: string }>; images?: string[] }) => {
    if (v.paras.length === 0) return;
    const imgs = (v.images ?? []).map(take).filter((x): x is LivePhoto => !!x);
    // 節の大きな写真 = 幅が足りる(SECTION_PHOTO_MIN_W 以上)写真のうち、特集で先に挙がっているもの。幅の足りない写真(公式サイトの 300px の縮小画像など)は、
    // 大きな枠に広げてぼやけるので、本文の下の小さな並び(extra)に回す(元の並びは保つ)。足りる写真が 1 枚も無い節は、文だけの組みになる
    const photo = imgs.find((x) => x.w >= SECTION_PHOTO_MIN_W) ?? null;
    const rest = imgs.filter((x) => x !== photo);
    const k = out.length;
    out.push({
      no: String(k + 1).padStart(2, "0"),
      id: `vk-a-s${k + 1}`,
      kicker: v.kicker,
      heading: [v.heading],
      paras: v.paras,
      photo,
      layout: photo ? LAYOUTS[withPhoto++ % 3] : "right",
      shape: photo ? (photo.w / Math.max(1, photo.h) >= 1.2 ? "wide" : photo.w / Math.max(1, photo.h) >= 0.95 ? "sq" : "tall") : "wide",
      quote: null,
      ...(v.specs && v.specs.length > 0 ? { specs: v.specs } : {}),
      ...(rest.length > 0 ? { extra: rest } : {}),
      ...(v.heading.length > 20 ? { longHeading: true } : {}),
    });
  };
  const body = (t: string) => chunkSentences(sentences(t).filter((x) => vkLineOk(x)));
  for (const r of A.ranking) {
    if (!r.name || !vkLineOk(r.name)) continue;
    push({
      kicker: vkLine(r.cuisine),
      heading: r.name,
      paras: body(r.desc),
      specs: (r.specs ?? []).filter((x) => x.k && x.v && vkLineOk(`${x.k}${x.v}`)),
      images: r.images,
    });
  }
  if (A.quote) push({ kicker: "ひとこと", heading: "編集部のひとこと", paras: body(A.quote) });
  if (A.closing) push({ kicker: "最後に", heading: "訪ねる前に確かめたいこと", paras: body(A.closing) });
  return out;
}

/** 店の ID から記事の表示用データを作る。店が無い・紹介記事が無い・使える文が 1 つも無ければ null(404)。places を渡すと、その店の集まりで作る(確認用) */
export async function loadArticle(cfg: VkConfig, id: string, given?: Place[]): Promise<ArticleView | null> {
  const places = given ?? (await getPlaces(cfg.key));
  const place = places.find((p) => p.id === id);
  // 特集(店 ID = 特集の placeId)があれば、それが記事の本文。無ければ店のデータの紹介記事(Place.article)
  const feature = place ? ((await findFeatureForPlace(cfg.key, place.id)) ?? null) : null;
  if (!place || (!place.article && !feature)) return null;
  const shop = toShop(cfg, place);
  const a: Partial<Place["article"] & object> = place.article ?? {};
  const photos = withKinds(shop, place);
  const used = new Set<string>();

  // ---- ヒーロー・見出し・副題・リード ----
  // ヒーローの写真: 特集があれば特集のヒーロー(店の写真として使える・文字が主役でないもの)。無ければ、これまでどおりの選び方
  const featHero = feature ? photos.find((p) => p.src === feature.article.heroImage && plain(p)) : undefined;
  if (featHero) used.add(featHero.src);
  const hero = featHero ?? pickHero(photos, used);
  const { main: nameMain, reading: nameReading } = splitName(shop.name);
  const h1 = shop.area ? [`${shop.area}の`, nameMain] : [nameMain];

  // 副題 = 記事の見出し(headline)の 2 つめの文節(無ければ 1 つめ)。末尾の「。」は付けない
  const headline = vkLine(a.headline);
  const clauses = headline.split("。").map((s) => s.trim()).filter(Boolean);
  const sub = (clauses.length > 1 ? clauses[1] : (clauses[0] ?? [shop.area, shop.kindName].filter(Boolean).join("の"))).replace(/。$/, "");

  // リード = 導入の文のうち、最初の「〜にある「店名」です」を除いた文を、130 字までの範囲で(1 文は必ず)。特集があるときは、特集の導入を全部(点検に通った文)
  const ledeSents = sentences(feature ? feature.article.lede : (a.lede ?? "")).filter((s) => vkLineOk(s));
  const intro = sentences(a.lede ?? "").filter((s) => vkLineOk(s))[0] ?? ledeSents[0] ?? "";
  const rest = feature ? ledeSents : ledeSents.slice(/」(\(.+\))?です。$/.test(intro) ? 1 : 0);
  const ledeOut: string[] = [];
  let ledeLen = 0;
  for (const s of rest.length > 0 ? rest : ledeSents) {
    if (!feature && ledeOut.length > 0 && ledeLen + s.length > 118) break;
    ledeOut.push(s);
    ledeLen += s.length;
  }

  // ---- 3 つの節(場所・時間・アクセスの節を除いた先頭の 3 つ。各節は先頭の文から 140 字まで) ----
  const placeRe = new RegExp(cfg.placeHeading);
  const secs = (a.sections ?? []).filter((s) => s.heading && vkLineOk(s.heading));
  const use = (secs.filter((s) => !placeRe.test(s.heading)).length > 0 ? secs.filter((s) => !placeRe.test(s.heading)) : secs).slice(0, 3);
  const LAYOUTS = ["band", "right", "left"] as const;
  const sections: ArtSection[] = feature ? featureSections(feature, photos, used) : [];
  for (const s of feature ? [] : use) {
    const picked: string[] = [];
    let n = 0;
    for (const t of sentences(s.body ?? "")) {
      if (SKIP_SENT.test(t) || !vkLineOk(t)) continue;
      if (picked.length > 0 && n + t.length > 140) break;
      picked.push(t);
      n += t.length;
    }
    if (picked.length === 0) continue;
    const k = sections.length;
    const ph = pickSection(photos, used, s.heading, picked.join(""));
    sections.push({
      no: String(k + 1).padStart(2, "0"),
      id: `vk-a-s${k + 1}`,
      kicker: shortLabel(s.heading),
      heading: s.heading.length > 12 ? twoLines(s.heading).filter(Boolean) : [s.heading],
      paras: [picked.join("")],
      photo: ph ? { src: ph.src, w: ph.w, h: ph.h, alt: ph.alt } : null,
      layout: LAYOUTS[k % 3],
      shape: ph ? shapeOf(ph) : "wide",
      quote: null,
    });
  }
  if (ledeOut.length === 0 && sections.length === 0) return null;

  // ---- 04: 基本情報の横並び ----
  const row4No = String(sections.length + 1).padStart(2, "0");
  const items: Row4Item[] = [];
  if (shop.address) items.push({ a: "所在地", b: shop.area || shop.prefName, c: shop.address });
  if (shop.station) items.push({ a: "最寄り駅", b: shop.station });
  if (shop.hours && vkLineOk(shop.hours)) items.push({ a: "営業時間", b: shop.hours.length <= 16 ? shop.hours : "下記のとおり", ...(shop.hours.length > 16 ? { c: shop.hours } : {}) });
  if (shop.holidays && vkLineOk(shop.holidays)) items.push({ a: "定休日", b: shop.holidays.length <= 16 ? shop.holidays : "あり", ...(shop.holidays.length > 16 ? { c: shop.holidays } : {}) });
  if (shop.phone) items.push({ a: "電話", b: shop.phone });
  if (shop.officialUrl) items.push({ a: "公式サイト", b: httpHost(shop.officialUrl) });
  const row4: Row4 = { mode: "basics", no: row4No, id: "vk-a-row4", kicker: "基本", heading: ["基本", "情報"], note: "基本の情報のまとめです。", items: items.slice(0, 5) };

  // ---- 掲載している店 ----
  const infoPh =
    pick(photos, used, ["exterior", "view", "inside", "other"], { notText: true, wideOnly: true }) ??
    pick(photos, used, ["exterior", "view", "inside", "other"], { notText: true }) ??
    pick(photos, used, ["item"], { notText: true, wideOnly: true }) ??
    pick(photos, used, ["item"], { notText: true });
  const info: Array<{ k: string; v: string }> = [];
  if (shop.kindName) info.push({ k: "種類", v: shop.kindName });
  if (shop.address) info.push({ k: "所在地", v: shop.address });
  if (shop.phone) info.push({ k: "電話", v: shop.phone });
  if (shop.officialUrl) info.push({ k: "公式サイト", v: httpHost(shop.officialUrl) });

  const index = [
    ...(ledeOut.length > 0 ? [{ id: "vk-a-lead", label: "はじめに" }] : []),
    ...sections.map((s) => ({ id: s.id, label: s.kicker || s.heading.join("") })),
    ...(row4.items.length > 0 ? [{ id: row4.id, label: "基本情報" }] : []),
    { id: "vk-a-info", label: `${cfg.noun}の情報` },
  ];

  // あわせて読みたい: 同じ都道府県 → 同じ種類 → ほか(写真と記事のある店。種類を順に回した並び)。写真は外観・景色の横長に差し替える
  const shops = places.map((p) => toShop(cfg, p));
  const others = loadArticles(cfg, shops).filter((x) => x.id !== id);
  const same = (x: LiveArticle) => (x.shop.pref === shop.pref ? 0 : x.shop.kind === shop.kind ? 1 : 2);
  const related = interleave(cfg, others.map((x) => x.shop))
    .map((s) => others.find((x) => x.id === s.id)!)
    .sort((x, y) => same(x) - same(y))
    .slice(0, 3)
    .map((x) => {
      const pl = places.find((p) => p.id === x.id);
      const ph = pl ? cardPhoto(withKinds(x.shop, pl)) : null;
      return ph ? { ...x, photo: ph } : x;
    });

  return {
    shop,
    nameMain,
    nameReading,
    h1,
    headline: headline || [shop.area, shop.kindName].filter(Boolean).join("の"),
    sub,
    lede: ledeOut.join(""),
    sections,
    row4,
    hero: hero ? { src: hero.src, w: hero.w, h: hero.h, alt: hero.alt } : null,
    infoPhoto: infoPh ? { src: infoPh.src, w: infoPh.w, h: infoPh.h, alt: infoPh.alt } : null,
    blurb: intro && vkLineOk(intro) ? intro : "",
    info,
    index,
    sources: (feature ? feature.sources : (a.sources ?? [])).filter((s) => /^https?:\/\//.test(s.url) && s.label),
    checkedAt: feature?.checkedAt ?? a.checkedAt,
    related,
    feature: feature ? { title: feature.article.title, summary: vkLine(feature.summary), date: feature.article.date } : null,
    ledeLong: feature ? ledeLen > 160 : false,
  };
}
