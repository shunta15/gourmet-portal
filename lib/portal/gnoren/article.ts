/**
 * 暖簾 2 本番化: 特集記事(店 1 軒・シーン別まとめ・街歩き/コース)を、見本 4 の描画部品(real/article の ArticleView)へ渡す形(GnArticleVM)に変える。
 * サーバー専用(lib/data・lib/db を読む)。'use client' の部品からは import しない。
 *
 * 決まり(REAL_PLAN.md「特集記事」):
 *  - 本文の文章は変えない(段落に割るだけ)。ranking[i].purpose は内部の指示文なので出さない。
 *  - 値段(予算・料金・入館料など)の行は出さない。人の名前・発言は作らない。
 *  - 写真は実物だけ(食べログ・仮の画像・表示禁止・真っ黒な仮画像は除く)。無ければ 0 枚(写真無しの章)。
 *  - 振り分けは onePage.ts / onePageUnlisted.ts の表に依存しない(isSingleShopFeature・isSceneShopFeature で判定)。
 */
import type { FeatureArticle, Restaurant } from "@/lib/regions";
import { FEATURE_ARTICLES, UNLISTED_FEATURE_ARTICLES } from "@/lib/data";
import { ARTICLE_STORE_ID_BY_FEATURE } from "@/lib/articleStores";
import { getRestaurantById } from "@/lib/db/restaurants";
import { isHiddenFeature } from "@/lib/hiddenStores";
import { mapsUrlForRestaurant } from "@/lib/maps";
import { isUsableFeatureImage } from "@/lib/portal/noren/usableImage";
import { isDummyFeatureImage, isSingleShopFeature } from "@/lib/portal/noren/featureSingle";
import { isSceneShopFeature } from "@/lib/portal/noren/featureScene";
import { FEATURE_KIND_ROUNDUP, FEATURE_ROUNDUP_WALK } from "@/lib/portal/noren/featureKinds";
import { featuresOfShop } from "@/lib/portal/noren/shopFeatures";
import { stripTabelogScore } from "@/lib/portal/noren/tabelogScore";
import { uniquePhotos, type Photo } from "@/lib/portal/photoFeature/collect";
import { fmtDate, paragraphs } from "@/components/portal/gnoren/real/common/text";
import { shopHref } from "@/components/portal/gnoren/real/common/links";
import type { GnArticleVM } from "@/components/portal/gnoren/real/common/types";

type Chapter = GnArticleVM["chapters"][number];
type Info = Array<[string, string]>;

/** 店 1 軒の記事の kicker(オーナーの 4 ページ構成の「店舗紹介」) */
export const GN_KICKER_SINGLE = "店舗紹介";

/** 1 記事の章の写真の合計の上限(buildPhotoFeature の PHOTO_BUDGET=12 から主役 1 枚を引いた数) */
const CHAPTER_PHOTO_BUDGET = 11;
const PER_CHAPTER_MAX = 3;
const RELATED_MAX = 4;
const NOTE_MAX = 44;

/** 値段の項目名か。isPriceSpec(予算・料金・価格・¥・円)に、入館料・入場料などの「〜料」類を足したもの */
const PRICE_KEY = /予算|料金|価格|[¥￥円]|入館料|入場料|拝観料|観覧料|参拝料|見学料|利用料|体験料|チケット|運賃|相場/;
export const isPriceKey = (k: string): boolean => PRICE_KEY.test(k ?? "");
/** 値段の値か。項目名が値段でなくても、値に金額・無料・税込などがあれば出さない(REAL_PLAN「値段を新しく出さない」)。real/common/text.ts は土台なので、ここに置く */
const PRICE_VALUE = /[0-9０-９,，.～〜]+\s*円|[¥￥]|税込|税別|無料|予算|料金|入館料|入場料|拝観料/;
export const isPriceValue = (v: string): boolean => PRICE_VALUE.test(v ?? "");
/** specs の 1 行が金額を含むか(項目名か値のどちらかに出ていれば true) */
const isPriceRow = (s: { k: string; v: string }): boolean => isPriceKey(s.k) || isPriceValue(s.v) || isPriceValue(s.k);

const clean = (s: string | undefined): string => (s ? stripTabelogScore(s).trim() : "");

const infoOf = (specs: { k: string; v: string }[]): Info =>
  specs.filter((s) => s.k && s.v && !isPriceRow(s)).map((s) => [s.k.trim(), clean(s.v)] as [string, string]).filter(([, v]) => v);

const usableImage = (u: string | undefined | null): u is string => !!u && isUsableFeatureImage(u) && !isDummyFeatureImage(u);

const nfc = (s: string) => s.normalize("NFC");

function labelOf(r: { cuisine?: string; area?: string }): string {
  return (r.cuisine ?? "").trim() || (r.area ?? "").trim();
}

/** メモ紙の一文: specs のうち、値段でなく、短い 1 行 */
function noteOf(specs: { k: string; v: string }[]): string | undefined {
  for (const s of specs) {
    if (!s.k || !s.v || isPriceRow(s)) continue;
    const t = `${s.k.trim()}：${clean(s.v)}`;
    if (t.length <= NOTE_MAX) return t;
  }
  return undefined;
}

/** 店の案内の行(あるものだけ。予算は出さない) */
function shopInfoOf(r: Restaurant): Info {
  const rows: Array<[string, string | undefined]> = [
    ["住所", r.address],
    ["営業時間", r.hours],
    ["定休日", r.closed],
    ["電話", r.phone],
    ["席数", r.seats],
    ["アクセス", r.nearest],
  ];
  return rows.filter(([, v]) => v && v.trim()).map(([k, v]) => [k, clean(v)] as [string, string]).filter(([, v]) => v && !isPriceValue(v));
}

/** 店 1 軒の記事の写真: 主役 → 視点ごとの写真 → 店の写真の順に重複なしで集め、章へ 0〜3 枚ずつ配る(buildPhotoFeature の collectPhotos と同じ出どころ・同じ重複除去) */
function singlePhotos(a: FeatureArticle, shop: Restaurant | null): { hero: Photo | null; perChapter: Photo[][] } {
  const used: Photo[] = [];
  const take = (srcs: (string | undefined | null)[]) => {
    const got = uniquePhotos(srcs, used);
    used.push(...got);
    return got;
  };
  let hero: Photo | null = take([a.heroImage])[0] ?? null;
  const views = a.ranking.map((r) => take(r.images ?? []));
  const shopPhotos = shop ? take([shop.image, ...(shop.heroImages ?? []), ...(shop.gallery ?? [])]) : [];
  // 主役の写真が使えない記事(真っ黒な仮画像など)は、集めた写真の先頭を主役にする(視点の写真 → 店の写真の順。buildPhotoFeature と同じ考え方)。1 枚も無い記事だけ主役無し
  if (!hero) {
    const i = views.findIndex((l) => l.length > 0);
    hero = (i >= 0 ? views[i].shift() : shopPhotos.shift()) ?? null;
  }
  const perChapter: Photo[][] = views.map((l) => l.slice(0, PER_CHAPTER_MAX));
  const pool: Photo[] = [...views.flatMap((l) => l.slice(PER_CHAPTER_MAX)), ...shopPhotos];
  let total = perChapter.reduce((n, l) => n + l.length, 0);
  const budget = CHAPTER_PHOTO_BUDGET;
  for (const p of pool) {
    if (total >= budget) break;
    // 写真がいちばん少ない章(同数なら前の章)へ
    let at = -1;
    for (let i = 0; i < perChapter.length; i++) {
      if (perChapter[i].length >= PER_CHAPTER_MAX) continue;
      if (at < 0 || perChapter[i].length < perChapter[at].length) at = i;
    }
    if (at < 0) break;
    perChapter[at].push(p);
    total++;
  }
  return { hero, perChapter };
}

/** まとめ・街歩きの写真: 項目の images をそのまま(外部 URL も可)。使えない写真・章どうしで重複する写真は除く(主役と同じ写真は、その項目の写真なので残す) */
function plainPhotos(a: FeatureArticle): string[][] {
  const seen = new Set<string>();
  return a.ranking.map((r) => {
    const out: string[] = [];
    for (const u of r.images ?? []) {
      if (!usableImage(u)) continue;
      const k = nfc(u);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(u);
      if (out.length >= PER_CHAPTER_MAX) break;
    }
    return out;
  });
}

async function relatedOf(a: FeatureArticle, shopId?: string): Promise<GnArticleVM["related"]> {
  const out: GnArticleVM["related"] = [];
  const seen = new Set<string>([nfc(a.id)]);
  for (const s of a.sideArticles ?? []) {
    const m = /^\/feature\/(.+)$/.exec(s.h ?? "");
    if (!m) continue; // /scene/…・/region/… など、記事でないリンクは出さない
    let id = m[1];
    try {
      id = decodeURIComponent(id);
    } catch {
      /* そのまま */
    }
    if (seen.has(nfc(id)) || isHiddenFeature(id)) continue;
    const target = FEATURE_ARTICLES[id] ?? UNLISTED_FEATURE_ARTICLES[id];
    if (!target) continue; // 実在しない記事へはリンクしない
    seen.add(nfc(id));
    const img = usableImage(target.heroImage) ? target.heroImage : usableImage(s.img) ? s.img : undefined;
    out.push({ id, title: clean(s.t) || clean(target.title), href: `/feature/${id}`, img, date: target.date ? fmtDate(target.date) : undefined });
    if (out.length >= RELATED_MAX) break;
  }
  // 店 1 軒の記事は sideArticles を持たない(580 本)ので、対の店が載っている別の記事(シーン別まとめなど。featuresOfShop)で補う。設計書に無い補い
  if (shopId && out.length < RELATED_MAX) {
    for (const f of await featuresOfShop(shopId, undefined, RELATED_MAX + 1)) {
      if (seen.has(nfc(f.id)) || isHiddenFeature(f.id)) continue;
      const target = FEATURE_ARTICLES[f.id] ?? UNLISTED_FEATURE_ARTICLES[f.id];
      seen.add(nfc(f.id));
      out.push({ id: f.id, title: clean(f.title), href: `/feature/${f.id}`, img: usableImage(f.image) ? f.image : undefined, date: target?.date ? fmtDate(target.date) : undefined });
      if (out.length >= RELATED_MAX) break;
    }
  }
  return out;
}

export async function buildArticleVM(article: FeatureArticle): Promise<GnArticleVM> {
  const a = article;
  const single = isSingleShopFeature(a);
  const roundup = !single && isSceneShopFeature(a.id, a);
  const kind: GnArticleVM["kind"] = single ? "single" : roundup ? "roundup" : "walk";
  const kicker = single ? GN_KICKER_SINGLE : roundup ? FEATURE_KIND_ROUNDUP : FEATURE_ROUNDUP_WALK;

  const storeId = single ? ARTICLE_STORE_ID_BY_FEATURE[a.id] ?? ARTICLE_STORE_ID_BY_FEATURE[nfc(a.id)] : undefined;
  const store = storeId ? await getRestaurantById(storeId) : null;
  const pageShop = store && store.id === storeId ? store : null;

  let hero: GnArticleVM["hero"];
  let chapters: Chapter[];

  if (single) {
    const { hero: h, perChapter } = singlePhotos(a, pageShop);
    if (h) hero = { src: h.src, alt: clean(a.title) };
    const shopName = pageShop?.name ?? "";
    chapters = a.ranking.map((r, i) => ({
      no: String(i + 1).padStart(2, "0"),
      label: labelOf(r),
      heading: clean(r.name),
      body: paragraphs(clean(r.desc)),
      photos: perChapter[i].map((p) => ({ src: p.src, alt: shopName ? `${shopName}（${clean(r.name)}）` : clean(r.name) })),
      note: noteOf(r.specs ?? []),
    }));
  } else {
    if (usableImage(a.heroImage)) hero = { src: a.heroImage, alt: clean(a.title) };
    const photos = plainPhotos(a);
    chapters = a.ranking.map((r, i) => {
      const name = clean(r.name);
      const heading = roundup ? clean(r.heading) || name : name;
      const href = roundup && r.href && r.href.startsWith("/restaurant/") ? r.href : undefined;
      return {
        no: String(i + 1).padStart(2, "0"),
        label: labelOf(r),
        heading,
        body: paragraphs(clean(r.desc)),
        photos: photos[i].map((src) => ({ src, alt: name })),
        shop: { name, ...(href ? { href } : {}), info: infoOf(r.specs ?? []) },
      };
    });
  }

  const vm: GnArticleVM = {
    id: a.id,
    kind,
    kicker,
    title: clean(a.title),
    lede: paragraphs(clean(a.lede)),
    date: a.date ? fmtDate(a.date) : "",
    chapters,
    related: await relatedOf(a, pageShop?.id),
  };
  const subtitle = clean(a.subtitle);
  if (subtitle) vm.subtitle = subtitle;
  if (hero) vm.hero = hero;
  const quote = clean(a.quote);
  if (quote) vm.quote = { text: quote, cite: (a.quoteCite ?? "").trim() || "マチノワ編集部" };
  const closing = paragraphs(clean(a.closing));
  if (closing.length) vm.closing = closing;
  if (pageShop) {
    vm.shop = { id: pageShop.id, name: pageShop.name, href: shopHref(pageShop.id), info: shopInfoOf(pageShop), mapsUrl: mapsUrlForRestaurant(pageShop) };
  }
  return vm;
}
