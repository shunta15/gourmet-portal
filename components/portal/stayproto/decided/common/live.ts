/**
 * ステイ決定デザインの本番ページ(最初 /stay・探す /stay/search・宿 /stay/shop/{id}・記事 /stay/article)が使う、実在の宿のデータの取り出し方(サーバー専用)。
 * 元は getPlaces("stay")(lib/places。宿のデータ lib/places/generated/stay.json はまだ無く、今は空の配列)。クライアントの部品から import しない。
 * ペットの common/live.ts と同じ作り。宿が 0 件でも壊れないように、取り出す関数はどれも空の配列を返せる(呼ぶ側が空の欄を出さない)。
 *
 * 決まり(共通部品の係が決めた。報告に書く):
 *  - 宿のカード・記事のカードに出すのは「写真のある宿」だけ。写真が無い宿は最初・記事の一覧のカードには出さない(探す・宿のページには出る)。
 *  - 写真は宿の実物の写真(Place.photos)だけ。人の顔・人物が主役らしい説明(what)の写真は選ばない。ストック写真・AI 画像は使わない。
 *  - 並べる順は「ランキングに見えない」ように、種類を 1 つずつ順番に回して(ラウンドロビン)、種類の中は宿 ID の順。探すの並べ替えは 新着順・エリア順 だけ(sortShops)。
 *  - 料金・金額・星・評価・口コミは持たない(Place.priceRange・attributes.priceFrom・reservationUrl は読まない)。外へ出るリンクは公式サイト(officialUrl)だけ。
 *  - 文の点検(stayLineOk): 料金・評価・「おすすめ」「人気」・〇選・最上級・効き目や癒しをうたう語・泊まった体験の言い回しを含む文は画面に出さない(宿は残す)。
 */
import { getPlaces } from "@/lib/places";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { VERTICALS } from "@/lib/verticals";
import { isUsableImage } from "@/lib/portal/photoRules";
import { firstSentence, lineOk } from "@/lib/portal/colorplay/text";
import type { Place, StayAttributes } from "@/lib/places/types";

export type LivePhoto = { src: string; w: number; h: number; alt: string };

export type LiveShop = {
  id: string;
  name: string;
  /** 種類のスラッグ(hotel・ryokan・pension・glamping・guesthouse) */
  kind: string;
  kindName: string;
  /** 都道府県のスラッグ・名前・市区町村・「長野県諏訪市」形式の所在地 */
  pref: string;
  prefName: string;
  city: string;
  area: string;
  /** 地方(REGIONS の slug・名前)。都道府県が表に無ければ空 */
  region: string;
  regionName: string;
  /** 住所(そのまま)・最寄り駅・電話・チェックイン/アウト(あるものだけ。無ければ空) */
  address: string;
  station: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  /** 公式サイト(Place.website → Place.url の順。http(s) だけ。無ければ null)。「公式サイトで空室・料金を確認」の行き先 */
  officialUrl: string | null;
  /** 地図のリンク(Google マップの実 URL が分かる宿だけ。無ければ null) */
  mapUrl: string | null;
  lat: number | null;
  lng: number | null;
  tags: string[];
  /** 実物の写真(無ければ null)と、使える写真すべて(最大 24 枚) */
  photo: LivePhoto | null;
  photos: LivePhoto[];
  /** 紹介記事(無ければ null)。headline は事実だけの 1 行・lede は導入の最初の 1 文(どちらも点検済み。空のことがある) */
  article: { headline: string; lede: string; checkedAt?: string } | null;
  /** 並べ替え(新着順)の材料。Place.updatedAt → 記事の確認日 の順。無ければ空 */
  stamp: string;
};

/** 記事の一覧に出す 1 本(実在の宿の紹介記事。リンク先はその宿の記事ページ。写真のある宿だけ) */
export type LiveArticle = {
  /** 宿の ID(= リンク先 /stay/article/{id} と /stay/shop/{id}) */
  id: string;
  shop: LiveShop;
  /** "feature" = 特集記事のある宿(特集のデータは未整備なので今は出ない)/ "intro" = 宿の紹介記事 */
  kind: "feature" | "intro";
  title: string;
  lede: string;
  /** 確認日(ISO) */
  date?: string;
  photo: LivePhoto;
};

/** 見本の宿の種類の並び(ホテル・旅館・民宿・ペンション・グランピング・キャンプ・ゲストハウス)。最初のページの種類の札・ラウンドロビンの順 */
export const KIND_ORDER = ["hotel", "ryokan", "pension", "glamping", "guesthouse"] as const;

const KIND_NAME: Record<string, string> = Object.fromEntries(VERTICALS.stay.categories.map((c) => [c.slug, c.name]));
const PREF_NAME: Record<string, string> = Object.fromEntries(PREFECTURES.map((p) => [p.slug, p.name]));

/**
 * 地方(探すの見本の「エリアから探す」の 11 の札 = 北海道・東北・関東・甲信越・北陸・東海・関西・中国・四国・九州・沖縄)。
 * 最初のページの見本は「中国・四国」を 1 つにしているので、そこは中国と四国の prefs をまとめて使う。
 */
export const REGIONS: Array<{ slug: string; name: string; prefs: string[] }> = [
  { slug: "hokkaido", name: "北海道", prefs: ["hokkaido"] },
  { slug: "tohoku", name: "東北", prefs: ["aomori", "iwate", "miyagi", "akita", "yamagata", "fukushima"] },
  { slug: "kanto", name: "関東", prefs: ["ibaraki", "tochigi", "gunma", "saitama", "chiba", "tokyo", "kanagawa"] },
  { slug: "koshinetsu", name: "甲信越", prefs: ["yamanashi", "nagano", "niigata"] },
  { slug: "hokuriku", name: "北陸", prefs: ["toyama", "ishikawa", "fukui"] },
  { slug: "tokai", name: "東海", prefs: ["gifu", "shizuoka", "aichi", "mie"] },
  { slug: "kansai", name: "関西", prefs: ["shiga", "kyoto", "osaka", "hyogo", "nara", "wakayama"] },
  { slug: "chugoku", name: "中国", prefs: ["tottori", "shimane", "okayama", "hiroshima", "yamaguchi"] },
  { slug: "shikoku", name: "四国", prefs: ["tokushima", "kagawa", "ehime", "kochi"] },
  { slug: "kyushu", name: "九州", prefs: ["fukuoka", "saga", "nagasaki", "kumamoto", "oita", "miyazaki", "kagoshima"] },
  { slug: "okinawa", name: "沖縄", prefs: ["okinawa"] },
];
const REGION_OF_PREF: Record<string, { slug: string; name: string }> = Object.fromEntries(
  REGIONS.flatMap((r) => r.prefs.map((p) => [p, { slug: r.slug, name: r.name }] as const)),
);

/** 都道府県のスラッグ → 地方(表に無ければ null) */
export function regionOfPref(pref: string): { slug: string; name: string } | null {
  return REGION_OF_PREF[pref] ?? null;
}

/** 人の顔・人物が主役らしい写真の説明(その写真は選ばない。「客室」「客席」を巻き込まないよう「客」だけの語は入れない) */
const HUMAN_LED = /(顔|人物|スタッフ|従業員|女性|男性|女将|主人|オーナー|料理人|シェフ|宿泊客|お客さま|お客様|来客|人々|ポートレート|ポートレイト)/;

// ---- 文の点検(lib/portal/colorplay/text.ts の点検 + ステイの禁止語) ----
// 最上級・順位・〇選 / 料金 / 星・評価・口コミ / 効き目・癒し / 泊まった体験の言い回し(「泊まりました」「過ごしました」など。「お過ごしいただけます」は通る)
const STAY_BAN =
  /最高|最上|極上|絶品|必ず|日本一|[Nn][Oo]\.?\s?[1１]|ナンバーワン|ナンバー1|TOP|(?<!ルーフ)トップ|[0-9０-９]+選|料金|宿泊料|価格|最安|格安|安い|お得|割引|クーポン|ベストレート|星[0-9０-９]|[0-9０-９]つ星|評価|レビュー|レーティング|クチコミ|点数|癒|整え|整う|ととの|疲れ|疲労|回復|リラックス|リフレッシュ|美肌|効能|デトックス|健康|心と体|心身|泊まっ[てた]|泊まりました|宿泊しました|過ごしました|滞在しました|訪れました|訪問しました|伺いました|行ってきま|感じました|味わいました|体験しました|宿泊記|体験記/;

export function stayLineOk(t: string): boolean {
  return lineOk(t, false) && !STAY_BAN.test(t);
}
/** 1 行の説明(点検に通らなければ空) */
export function stayLine(t: string | undefined): string {
  const x = (t ?? "").trim();
  return x && stayLineOk(x) ? x : "";
}
/** 紹介文の最初の 1 文(点検に通ったもの。長ければ切る。通る文が無ければ空) */
export function stayFirst(t: string | undefined, max = 64): string {
  const x = firstSentence(t, false, max);
  return x && stayLineOk(x) ? x : "";
}

/** 「長野県諏訪市」。市区町村名が市区町村らしくなければ、都道府県の短い名前で続ける */
function areaText(p: { pref: string; cityName?: string }): string {
  const pref = PREFECTURES.find((x) => x.slug === p.pref);
  if (pref && p.cityName && /[市区町村]$/.test(p.cityName)) return `${pref.name}${p.cityName}`;
  return `${pref?.short ?? ""}${p.cityName ?? ""}`;
}

function photosOf(p: Place): LivePhoto[] {
  const out: LivePhoto[] = [];
  const list = p.photos ?? [];
  for (const ph of list) {
    if (!isUsableImage(ph.path)) continue;
    if (ph.what && HUMAN_LED.test(ph.what)) continue;
    out.push({ src: ph.path, w: ph.width ?? 1200, h: ph.height ?? 800, alt: ph.what ? `${p.name} — ${ph.what}` : p.name });
    if (out.length >= 24) break;
  }
  // photos が無い宿(古い形)は image だけ。説明が無いので人物かどうかは見分けられない(上流で選別済みの前提)
  if (list.length === 0) {
    const src = p.image ?? p.images?.[0];
    if (isUsableImage(src)) out.push({ src, w: 1200, h: 800, alt: p.name });
  }
  return out;
}

function httpUrl(u: string | undefined): string | null {
  const x = (u ?? "").trim();
  return /^https?:\/\//i.test(x) ? x : null;
}

/** Place → LiveShop(loadStayShops が使う。確認用に fixture の Place から作るときにも使えるよう export) */
export function toShop(p: Place): LiveShop {
  const attrs = ((p as { attributes?: StayAttributes }).attributes ?? {}) as StayAttributes;
  const photos = photosOf(p);
  const head = stayLine(p.article?.headline);
  const lede = stayFirst(p.article?.lede ?? p.intro);
  const reg = regionOfPref(p.pref);
  return {
    id: p.id,
    name: p.name,
    kind: p.category,
    kindName: KIND_NAME[p.category] ?? "",
    pref: p.pref,
    prefName: PREF_NAME[p.pref] ?? "",
    city: p.cityName ?? "",
    area: areaText(p),
    region: reg?.slug ?? "",
    regionName: reg?.name ?? "",
    address: (p.address ?? "").trim(),
    station: (p.station ?? "").trim(),
    phone: (p.phone ?? "").trim(),
    checkIn: (attrs.checkIn ?? "").trim(),
    checkOut: (attrs.checkOut ?? "").trim(),
    officialUrl: httpUrl(p.website) ?? httpUrl(p.url),
    mapUrl: httpUrl(p.mapUrl),
    lat: typeof p.lat === "number" ? p.lat : null,
    lng: typeof p.lng === "number" ? p.lng : null,
    tags: (p.tags ?? []).map((t) => t.trim()).filter((t) => t && stayLineOk(t)),
    photo: photos[0] ?? null,
    photos,
    // 見出しも導入の 1 文も点検に通らなければ、紹介記事なしとして扱う
    article: head || lede ? { headline: head, lede, checkedAt: p.article?.checkedAt } : null,
    stamp: (p.updatedAt ?? p.article?.checkedAt ?? "").slice(0, 10),
  };
}

/** ステイの実在の宿すべて(宿 ID の順)。stay.json がまだ無いあいだは空 */
export async function loadStayShops(): Promise<LiveShop[]> {
  const places = await getPlaces("stay");
  return places.map(toShop).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/**
 * 記事の一覧に出す本(写真のある宿だけ)。今は宿の紹介記事(Place.article)だけ(特集のデータ features-stay.json は未整備)。
 * 種類を順に回して並べる(ランキングに見せない)。見出しは点検済み(通らなければその本は出さない)。
 */
export async function loadStayArticles(shops: LiveShop[]): Promise<LiveArticle[]> {
  const intro = shops.filter((s) => s.photo && s.article?.headline);
  return interleave(intro).map((s) => ({
    id: s.id,
    shop: s,
    kind: "intro" as const,
    title: s.article!.headline,
    lede: s.article!.lede,
    date: s.article!.checkedAt,
    photo: s.photo!,
  }));
}

/** 種類を 1 つずつ順番に回して並べる(種類の中は渡された順)。ランキングに見せないための並べ方 */
export function interleave(shops: LiveShop[]): LiveShop[] {
  const order: string[] = [...KIND_ORDER, ...Array.from(new Set(shops.map((s) => s.kind))).filter((k) => !(KIND_ORDER as readonly string[]).includes(k))];
  const groups = order.map((k) => shops.filter((s) => s.kind === k)).filter((g) => g.length > 0);
  const out: LiveShop[] = [];
  for (let i = 0; out.length < shops.length; i++) {
    let added = false;
    for (const g of groups) {
      if (i < g.length) {
        out.push(g[i]);
        added = true;
      }
    }
    if (!added) break;
  }
  return out;
}

/** 探すの並べ替え(中立の 2 つだけ)。"area" = 都道府県の並び → 市区町村 → 宿 ID / "new" = 新しい順(stamp の降順 → 宿 ID) */
export function sortShops(shops: LiveShop[], by: "area" | "new" = "area"): LiveShop[] {
  const idx = new Map(PREFECTURES.map((p, i) => [p.slug, i]));
  const byId = (a: LiveShop, b: LiveShop) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const arr = [...shops];
  if (by === "new") return arr.sort((a, b) => (a.stamp === b.stamp ? byId(a, b) : a.stamp < b.stamp ? 1 : -1));
  return arr.sort((a, b) => (idx.get(a.pref) ?? 99) - (idx.get(b.pref) ?? 99) || a.city.localeCompare(b.city, "ja") || byId(a, b));
}

/** 宿の数が 1 つ以上ある種類(見本の並び → ほかの種類)。{slug, name, count}。「その他」は作らない */
export function kindsWithShops(shops: LiveShop[]): Array<{ slug: string; name: string; count: number }> {
  const count = new Map<string, number>();
  for (const s of shops) count.set(s.kind, (count.get(s.kind) ?? 0) + 1);
  const slugs = [...KIND_ORDER.filter((k) => count.has(k)), ...Array.from(count.keys()).filter((k) => !(KIND_ORDER as readonly string[]).includes(k))];
  return slugs.map((slug) => ({ slug, name: KIND_NAME[slug] ?? slug, count: count.get(slug) ?? 0 }));
}

/** 利用シーン(lib/verticals/stay.ts の scenes = 温泉・ペット同伴・一人旅・記念日・素泊まり)のうち、宿が 1 つ以上あるもの。写真は該当の宿のうち写真のある最初の 1 枚(無ければ null) */
export function scenesWithShops(shops: LiveShop[]): Array<{ slug: string; name: string; count: number; shop: LiveShop | null }> {
  return VERTICALS.stay.scenes
    .map((sc) => {
      const hit = shops.filter((s) => sc.matchTags.some((t) => s.tags.includes(t)));
      return { slug: sc.slug, name: sc.name, count: hit.length, shop: hit.find((s) => s.photo) ?? null };
    })
    .filter((s) => s.count > 0);
}

/** 宿のある都道府県(宿の多い順 → 都道府県の並び順) */
export function prefsWithShops(shops: LiveShop[]): Array<{ slug: string; name: string; short: string; count: number }> {
  const count = new Map<string, number>();
  for (const s of shops) if (s.pref) count.set(s.pref, (count.get(s.pref) ?? 0) + 1);
  const idx = new Map(PREFECTURES.map((p, i) => [p.slug, i]));
  return Array.from(count.entries())
    .map(([slug, n]) => {
      const p = PREFECTURES.find((x) => x.slug === slug);
      return { slug, name: p?.name ?? slug, short: p?.short ?? slug, count: n };
    })
    .sort((a, b) => b.count - a.count || (idx.get(a.slug) ?? 99) - (idx.get(b.slug) ?? 99));
}

/** 宿のある地方(REGIONS の並び順。見本の「エリアから探す」の札)。{slug, name, count, prefs(その地方で宿のある都道府県。宿の多い順), shop(写真のある最初の宿。無ければ null)} */
export function regionsWithShops(shops: LiveShop[]): Array<{ slug: string; name: string; count: number; prefs: Array<{ slug: string; name: string; short: string; count: number }>; shop: LiveShop | null }> {
  const prefs = prefsWithShops(shops);
  return REGIONS.map((r) => {
    const hit = shops.filter((s) => s.region === r.slug);
    return { slug: r.slug, name: r.name, count: hit.length, prefs: prefs.filter((p) => r.prefs.includes(p.slug)), shop: hit.find((s) => s.photo) ?? null };
  }).filter((r) => r.count > 0);
}

/** "2026-10-09" → "2026.10.09"(形式が違えばそのまま) */
export function dotDate(iso?: string): string {
  const m = iso ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso) : null;
  return m ? `${m[1]}.${m[2]}.${m[3]}` : (iso ?? "");
}

/** 日本語の字数で幅を見積もる(全角 1・半角 0.55) */
export function visualLen(s: string): number {
  let n = 0;
  for (const ch of s) n += ch.charCodeAt(0) > 0xff ? 1 : 0.55;
  return n;
}
