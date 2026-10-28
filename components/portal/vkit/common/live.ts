/**
 * 新業種(体験・アクティビティ / スポーツ・フィットネス / くらし・ライフスタイル)の本番ページ(最初・探す・店・記事)が使う、実在の店のデータの取り出し方(サーバー専用)。
 * 元は getPlaces(業種 key)(lib/places。店のデータ lib/places/generated/{activity,sports,life}.json)。クライアントの部品から import しない。
 * ステイの common/live.ts を、業種の設定(vkit/config.ts の VkConfig)で切り替えられるようにしたもの。店が 0 件でも壊れない(取り出す関数はどれも空の配列を返せる)。
 *
 * 決まり(ステイと同じ):
 *  - 店のカード・記事のカードに出すのは「写真のある店」だけ。写真が無い店は最初・記事の一覧のカードには出さない(探す・店のページには出る)。
 *  - 写真は店の実物の写真(Place.photos)だけ。人の顔・人物が主役らしい説明(what)の写真は選ばない。ストック写真・AI 画像は使わない。
 *  - 並べる順は「ランキングに見えない」ように、種類を 1 つずつ順番に回して(ラウンドロビン)、種類の中は店 ID の順。探すの並べ替えは エリア順・新着順 だけ(sortShops)。
 *  - 料金・金額・星・評価・口コミは持たない(Place.priceRange・reservationUrl は読まない)。外へ出るリンクは公式サイト(officialUrl)だけ。
 *  - 文の点検(vkLineOk): 料金・評価・「おすすめ」「人気」・〇選・最上級・効き目をうたう語・体験した言い回しを含む文は画面に出さない(店は残す)。
 */
import { getPlaces } from "@/lib/places";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { VERTICALS } from "@/lib/verticals";
import { isUsableImage } from "@/lib/portal/photoRules";
import { firstSentence, lineOk } from "@/lib/portal/colorplay/text";
import type { Place } from "@/lib/places/types";
import type { VkConfig } from "../config";

export type LivePhoto = { src: string; w: number; h: number; alt: string };

export type LiveShop = {
  id: string;
  name: string;
  /** 種類のスラッグ(lib/verticals の categories の slug) */
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
  /** 住所(そのまま)・最寄り駅・電話・営業時間・定休日(あるものだけ。無ければ空) */
  address: string;
  station: string;
  phone: string;
  hours: string;
  holidays: string;
  /** 公式サイト(Place.website → Place.url の順。http(s) だけ。無ければ null) */
  officialUrl: string | null;
  /** 地図のリンク(Google マップの実 URL が分かる店だけ。無ければ null) */
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

/** 記事の一覧に出す 1 本(実在の店の紹介記事。リンク先はその店の記事ページ。写真のある店だけ) */
export type LiveArticle = {
  /** 店の ID(= リンク先 /{業種}/article/{id} と /{業種}/shop/{id}) */
  id: string;
  shop: LiveShop;
  title: string;
  lede: string;
  /** 確認日(ISO) */
  date?: string;
  photo: LivePhoto;
};

/**
 * 地方(探すの「エリアから探す」の 11 の札 = 北海道・東北・関東・甲信越・北陸・東海・関西・中国・四国・九州・沖縄)。
 * 最初のページの札は「中国・四国」を 1 つにしているので、そこは中国と四国の prefs をまとめて使う。
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
const PREF_NAME: Record<string, string> = Object.fromEntries(PREFECTURES.map((p) => [p.slug, p.name]));

/** 都道府県のスラッグ → 地方(表に無ければ null) */
export function regionOfPref(pref: string): { slug: string; name: string } | null {
  return REGION_OF_PREF[pref] ?? null;
}

/** 種類のスラッグ → 名前(lib/verticals の categories) */
export function kindNameOf(cfg: VkConfig, slug: string): string {
  return VERTICALS[cfg.key].categories.find((c) => c.slug === slug)?.name ?? "";
}

/** 種類のスラッグ → 英字のラベル(最初の札・探す・記事の一覧のカードの小さな英字。3 か所で同じ物を使う) */
export function kindEn(cfg: VkConfig, slug: string): string {
  return cfg.kinds.find((k) => k.slug === slug)?.en ?? "";
}

/** 人の顔・人物が主役らしい写真の説明(その写真は選ばない) */
const HUMAN_LED =
  /(顔|人物|スタッフ|従業員|女性|男性|女将|主人|オーナー|店主|料理人|シェフ|お客さま|お客様|来客|人々|ポートレート|ポートレイト|講師|インストラクター|トレーナー|先生|生徒|参加者|利用者|選手|子ども|子供|親子|カップル|新郎|新婦|巫女|職人が)/;

// ---- 文の点検(lib/portal/colorplay/text.ts の点検 + 業種の禁止語) ----
// 最上級・順位・〇選 / 料金 / 星・評価・口コミ / 効き目・体型の変化・占いの的中 / 体験した言い回し(「行ってきました」など)
// lib/verticals の copyRules(スポーツ: 痩せる・効果を保証・短期間で / くらし・占い: 当たる・運気が上がる・願いが叶う・開運を保証 / 体験: 絶景・安全を保証)を含む
const VK_BAN =
  /最高|最上|極上|絶品|絶景|必ず|日本一|[Nn][Oo]\.?\s?[1１]|ナンバーワン|ナンバー1|トップクラス|業界トップ|[0-9０-９]+選|料金|価格|最安|格安|安い|お得|割引|クーポン|ベストレート|星[0-9０-９]|[0-9０-９]つ星|評価|レビュー|レーティング|クチコミ|点数|癒|整え|整う|ととの|疲れ|疲労|回復|リラックス|リフレッシュ|美肌|効能|デトックス|健康|心と体|心身|ストレス解消|ダイエット|脂肪|引き締|体質|短期間|当たる|的中|運気|開運|願いが叶|安全を保証|安心して楽しめ|行ってきま|訪れました|訪問しました|伺いました|体験しました|参加しました|楽しみました|感じました|味わいました|体験記|訪問記|レポ/;

export function vkLineOk(t: string): boolean {
  return lineOk(t, false) && !VK_BAN.test(t);
}
/** 1 行の説明(点検に通らなければ空) */
export function vkLine(t: string | undefined): string {
  const x = (t ?? "").trim();
  return x && vkLineOk(x) ? x : "";
}
/** 紹介文の最初の 1 文(点検に通ったもの。長ければ切る。通る文が無ければ空) */
export function vkFirst(t: string | undefined, max = 64): string {
  const x = firstSentence(t, false, max);
  return x && vkLineOk(x) ? x : "";
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
  // photos が無い店(古い形)は image だけ。説明が無いので人物かどうかは見分けられない(上流で選別済みの前提)
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

/** Place → LiveShop(loadShops が使う) */
export function toShop(cfg: VkConfig, p: Place): LiveShop {
  const photos = photosOf(p);
  const head = vkLine(p.article?.headline);
  const lede = vkFirst(p.article?.lede ?? p.intro);
  const reg = regionOfPref(p.pref);
  return {
    id: p.id,
    name: p.name,
    kind: p.category,
    kindName: p.kindName || kindNameOf(cfg, p.category),
    pref: p.pref,
    prefName: PREF_NAME[p.pref] ?? "",
    city: p.cityName ?? "",
    area: areaText(p),
    region: reg?.slug ?? "",
    regionName: reg?.name ?? "",
    address: (p.address ?? "").trim(),
    station: (p.station ?? "").trim(),
    phone: (p.phone ?? "").trim(),
    hours: (p.hours ?? "").trim(),
    holidays: (p.holidays ?? "").trim(),
    officialUrl: httpUrl(p.website) ?? httpUrl(p.url),
    mapUrl: httpUrl(p.mapUrl),
    lat: typeof p.lat === "number" ? p.lat : null,
    lng: typeof p.lng === "number" ? p.lng : null,
    tags: (p.tags ?? []).map((t) => t.trim()).filter((t) => t && vkLineOk(t)),
    photo: photos[0] ?? null,
    photos,
    // 見出しも導入の 1 文も点検に通らなければ、紹介記事なしとして扱う
    article: head || lede ? { headline: head, lede, checkedAt: p.article?.checkedAt } : null,
    stamp: (p.updatedAt ?? p.article?.checkedAt ?? "").slice(0, 10),
  };
}

/** 業種の実在の店すべて(店 ID の順)。データがまだ無いあいだは空 */
export async function loadShops(cfg: VkConfig): Promise<LiveShop[]> {
  const places = await getPlaces(cfg.key);
  return places.map((p) => toShop(cfg, p)).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/**
 * 記事の一覧に出す本(写真のある店だけ)。店の紹介記事(Place.article)だけ。
 * 種類を順に回して並べる(ランキングに見せない)。見出しは点検済み(通らなければその本は出さない)。
 */
export function loadArticles(cfg: VkConfig, shops: LiveShop[]): LiveArticle[] {
  const intro = shops.filter((s) => s.photo && s.article?.headline);
  return interleave(cfg, intro).map((s) => ({
    id: s.id,
    shop: s,
    title: s.article!.headline,
    lede: s.article!.lede,
    date: s.article!.checkedAt,
    photo: s.photo!,
  }));
}

/** 種類を 1 つずつ順番に回して並べる(種類の中は渡された順)。ランキングに見せないための並べ方 */
export function interleave(cfg: VkConfig, shops: LiveShop[]): LiveShop[] {
  const known = cfg.kinds.map((k) => k.slug);
  const order: string[] = [...known, ...Array.from(new Set(shops.map((s) => s.kind))).filter((k) => !known.includes(k))];
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

/** 探すの並べ替え(中立の 2 つだけ)。"area" = 都道府県の並び → 市区町村 → 店 ID / "new" = 新しい順(stamp の降順 → 店 ID) */
export function sortShops(shops: LiveShop[], by: "area" | "new" = "area"): LiveShop[] {
  const idx = new Map(PREFECTURES.map((p, i) => [p.slug, i]));
  const byId = (a: LiveShop, b: LiveShop) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const arr = [...shops];
  if (by === "new") return arr.sort((a, b) => (a.stamp === b.stamp ? byId(a, b) : a.stamp < b.stamp ? 1 : -1));
  return arr.sort((a, b) => (idx.get(a.pref) ?? 99) - (idx.get(b.pref) ?? 99) || a.city.localeCompare(b.city, "ja") || byId(a, b));
}

/** 店の数が 1 つ以上ある種類(設定の並び → ほかの種類)。{slug, name, count}。「その他」は作らない */
export function kindsWithShops(cfg: VkConfig, shops: LiveShop[]): Array<{ slug: string; name: string; count: number }> {
  const count = new Map<string, number>();
  for (const s of shops) count.set(s.kind, (count.get(s.kind) ?? 0) + 1);
  const known = cfg.kinds.map((k) => k.slug);
  const slugs = [...known.filter((k) => count.has(k)), ...Array.from(count.keys()).filter((k) => !known.includes(k))];
  return slugs.map((slug) => ({ slug, name: kindNameOf(cfg, slug) || slug, count: count.get(slug) ?? 0 }));
}

/** 利用シーン(lib/verticals の scenes)のうち、店が 1 つ以上あるもの。写真は該当の店のうち写真のある最初の 1 枚(無ければ null) */
export function scenesWithShops(cfg: VkConfig, shops: LiveShop[]): Array<{ slug: string; name: string; count: number; shop: LiveShop | null }> {
  return VERTICALS[cfg.key].scenes
    .map((sc) => {
      const hit = shops.filter((s) => sc.matchTags.some((t) => s.tags.includes(t)));
      return { slug: sc.slug, name: sc.name, count: hit.length, shop: hit.find((s) => s.photo) ?? null };
    })
    .filter((s) => s.count > 0);
}

/** 店のある都道府県(店の多い順 → 都道府県の並び順) */
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

/** 店のある地方(REGIONS の並び順。「エリアから探す」の札)。{slug, name, count, prefs(その地方で店のある都道府県。店の多い順), shop(写真のある最初の店。無ければ null)} */
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
