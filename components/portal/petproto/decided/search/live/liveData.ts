import "server-only";
import { getPlaces, type Place } from "@/lib/places";
import { getGeneratedFeatures } from "@/lib/places/features";
import { PREFECTURES, type Prefecture } from "@/lib/areas/prefectures";
import { getVertical } from "@/lib/verticals";
import { isUsableImage } from "@/lib/portal/photoRules";
import { cleanLine, firstSentence, lineOk } from "@/lib/portal/colorplay/text";
import { LIVE_BASE, ptLinks } from "../../common/site";

/**
 * ペットの「探す」(本番 /pet/search)と「店舗紹介」(本番 /pet/shop/{id})が使うデータの読み込みと絞り込み(サーバー専用)。
 * 実在の店(getPlaces('pet') = lib/places/generated/pet.json)だけを使う。店が 0 件でも壊れない(空の欄は出さない)。
 * 文は出す前に点検する(効き目・料金・星・口コミ・「おすすめ」「人気」など。lib/portal/colorplay/text.ts と同じ点検 + ペットの禁止語)。データそのものは変えない。
 * 探すの URL の引数は ptLinks("live") と同じ名前: kind=種類のスラッグ・pref=都道府県のスラッグ・q=文字。ほかに tag(こだわり)・animal(対応動物)・sort・page。
 */

export const PAGE_SIZE = 9;

export type PetPhoto = { src: string; alt: string; w?: number; h?: number };

export type PetShop = {
  id: string;
  name: string;
  /** データの category(trimming など) */
  kind: string;
  kindName: string;
  pref: string;
  prefName: string;
  city: string;
  /** 「東京都世田谷区」のような所在 */
  place: string;
  address: string;
  /** 紹介文の最初の 1 文(無ければ空) */
  blurb: string;
  /** カードの写真(その店の実物。無ければ null) */
  photo: PetPhoto | null;
  /** 店のタグ(点検に通ったものだけ) */
  tags: string[];
  /** 対応動物(犬・猫 など) */
  animals: string[];
  /** カードに出す小さな札(最大 3) */
  chips: string[];
};

// ------------------------------------------------------------------ 文の点検
/** ペットの設定(lib/verticals/pet.ts の copyRules)の禁止語 + 動物病院の医療広告の語 */
const PET_BAN = /最高|絶品|必ず|日本一|No\.?\s?1|ナンバーワン|ナンバー1|TOP|トップ|[0-9０-９]+選/i;
const VET_BAN = /治療成績|比較優良|絶対安全|治る|治す|治し|治療|効く|効き|効果|症状|改善|予防|回復|完治|名医/;

export function petLineOk(t: string, vet = false): boolean {
  return lineOk(t, false) && !PET_BAN.test(t) && !(vet && VET_BAN.test(t));
}

const isVet = (kind: string) => kind === "vet";

/** 紹介文の最初の 1 文(点検済み。長ければ切る) */
export function petBlurb(text: string | undefined, kind: string, max = 70): string {
  const s = firstSentence(text, isVet(kind), max);
  return s && petLineOk(s, isVet(kind)) ? s : "";
}

/** 段落の並び(点検に通らない文は落とす) */
export function petParagraphs(body: string | undefined, kind: string): string[] {
  const vet = isVet(kind);
  return (body ?? "")
    .split(/\n+/)
    .map((x) => (x.trim().match(/[^。]+。?/g) ?? []).filter((s) => petLineOk(s, vet)).join("").trim())
    .filter(Boolean);
}

export const petLine = (t: string | undefined, kind: string): string => {
  const x = cleanLine(t, isVet(kind));
  return x && petLineOk(x, isVet(kind)) ? x : "";
};

// ------------------------------------------------------------------ 店
const PREF_BY_SLUG = new Map(PREFECTURES.map((p) => [p.slug, p]));
const PREF_ORDER = new Map(PREFECTURES.map((p, i) => [p.slug, i]));

/** 「東京都世田谷区」「神奈川県鎌倉市」。市区町村名が市区町村らしくなければ、都道府県の短い名前で続ける */
export function areaText(p: { pref: string; cityName?: string }): string {
  const pref = PREF_BY_SLUG.get(p.pref);
  if (pref && p.cityName && /[市区町村]$/.test(p.cityName)) return `${pref.name}${p.cityName}`;
  return `${pref?.short ?? ""}${p.cityName ?? ""}`;
}

/** 人の顔・人物が主役らしい写真の説明(その写真は選ばない。最初・記事の一覧の common/live.ts と同じ決まり) */
const HUMAN_LED_RE = /(顔|人物|スタッフ|従業員|女性|男性|店主|オーナー|トリマー|獣医師|院長|お客|客)/;
/** 「客席」「客室」は席・部屋の名前なので人物とは見ない */
export const HUMAN_LED = { test: (t: string) => HUMAN_LED_RE.test(t.replace(/客席|客室|客間/g, "")) };

/** 店の写真(使えるものだけ。元の並び)。人の顔が主役らしい説明の写真は選ばない(説明の無い古い形の写真は、上流で選別済みの前提) */
export function petPhotos(p: Place): PetPhoto[] {
  const list = p.photos?.length ? p.photos : (p.images?.length ? p.images : p.image ? [p.image] : []).map((path) => ({ path, what: undefined as string | undefined, width: undefined as number | undefined, height: undefined as number | undefined }));
  return list
    .filter((x) => isUsableImage(x.path) && !(x.what && HUMAN_LED.test(x.what)))
    .map((x) => ({ src: x.path, alt: `${p.name} — ${x.what ?? "店の写真"}`, w: x.width, h: x.height }));
}

export function petAnimals(p: Place): string[] {
  const a = (p.attributes as { animals?: string[] } | undefined)?.animals ?? [];
  return a.map((x) => x.trim()).filter((x) => x && petLineOk(x));
}

export function petTags(p: Place): string[] {
  return (p.tags ?? []).map((x) => x.trim()).filter((x) => x && petLineOk(x));
}

export function categoryName(kind: string): string {
  return getVertical("pet").categories.find((c) => c.slug === kind)?.name ?? "";
}

/**
 * カードの札(最大 3)。カードの幅(見本の 188 の単位)に収まる分だけ入れる(1 字 ≈ 9.1・札の余白 ≈ 18・札の間 ≈ 6.2)。入らない札は出さない。
 */
function fitChips(all: string[], width = 186): string[] {
  const out: string[] = [];
  let used = 0;
  for (const t of all) {
    const w = t.length * 9.1 + 18.2 + (out.length ? 6.2 : 0);
    if (used + w > width) continue;
    out.push(t);
    used += w;
    if (out.length === 3) break;
  }
  return out;
}

export function toPetShop(p: Place): PetShop {
  const photos = petPhotos(p);
  const tags = petTags(p);
  const animals = petAnimals(p);
  const chips = fitChips([...(animals.length ? [`${animals.join("・")}に対応`] : []), ...tags]);
  return {
    id: p.id,
    name: p.name,
    kind: p.category,
    kindName: categoryName(p.category) || p.category,
    pref: p.pref,
    prefName: PREF_BY_SLUG.get(p.pref)?.name ?? p.pref,
    city: p.cityName ?? "",
    place: areaText(p),
    address: p.address,
    blurb: petBlurb(p.article?.lede ?? p.intro, p.category),
    photo: photos[0] ?? null,
    tags,
    animals,
    chips,
  };
}

/** 全店(エリア順 = 都道府県の並び → ID)。写真のある店を先に */
export async function loadPetShops(): Promise<PetShop[]> {
  const places = await getPlaces("pet");
  return places
    .map(toPetShop)
    .sort((a, b) => (PREF_ORDER.get(a.pref) ?? 99) - (PREF_ORDER.get(b.pref) ?? 99) || a.id.localeCompare(b.id));
}

export async function petFeatureCount(): Promise<number> {
  return (await getGeneratedFeatures("pet")).length;
}

// ------------------------------------------------------------------ 絞り込み
export type PetFilters = { kind: string; pref: string; tag: string; animal: string; q: string; sort: "area" | "name"; page: number };

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const norm = (s: string) => s.toLowerCase().normalize("NFKC");

export type PetFacets = {
  kinds: Array<{ slug: string; name: string; count: number }>;
  prefs: Array<{ pref: Prefecture; count: number }>;
  tags: Array<{ name: string; count: number }>;
  animals: Array<{ name: string; count: number }>;
};

/** データにある種類・都道府県・こだわり・対応動物と、それぞれの件数(0 件のものは入れない) */
export function facetsOf(shops: PetShop[]): PetFacets {
  const vertical = getVertical("pet");
  const kc = new Map<string, number>();
  const pc = new Map<string, number>();
  const tc = new Map<string, number>();
  const ac = new Map<string, number>();
  for (const s of shops) {
    kc.set(s.kind, (kc.get(s.kind) ?? 0) + 1);
    pc.set(s.pref, (pc.get(s.pref) ?? 0) + 1);
    for (const t of s.tags) tc.set(t, (tc.get(t) ?? 0) + 1);
    for (const a of s.animals) ac.set(a, (ac.get(a) ?? 0) + 1);
  }
  const byCount = <T extends { count: number; name: string }>(a: T, b: T) => b.count - a.count || a.name.localeCompare(b.name, "ja");
  return {
    kinds: vertical.categories.filter((c) => kc.has(c.slug)).map((c) => ({ slug: c.slug, name: c.name, count: kc.get(c.slug)! })),
    prefs: [...pc.entries()]
      .map(([slug, count]) => ({ pref: PREF_BY_SLUG.get(slug)!, count }))
      .filter((x) => x.pref)
      .sort((a, b) => b.count - a.count || a.pref.code.localeCompare(b.pref.code)),
    tags: [...tc.entries()].map(([name, count]) => ({ name, count })).sort(byCount),
    animals: [...ac.entries()].map(([name, count]) => ({ name, count })).sort(byCount),
  };
}

/** URL の引数 → 正しい値だけの PetFilters(データにない種類・県・こだわり・動物は捨てる) */
export function parseFilters(sp: SP, f: PetFacets): PetFilters {
  const k = one(sp.kind);
  const p = one(sp.pref);
  const t = one(sp.tag);
  const a = one(sp.animal);
  const page = Math.min(Math.max(parseInt(one(sp.page)) || 1, 1), 500);
  return {
    kind: f.kinds.some((x) => x.slug === k) ? k : "",
    pref: f.prefs.some((x) => x.pref.slug === p) ? p : "",
    tag: f.tags.some((x) => x.name === t) ? t : "",
    animal: f.animals.some((x) => x.name === a) ? a : "",
    q: one(sp.q).replace(/\s+/g, " ").trim().slice(0, 40),
    sort: one(sp.sort) === "name" ? "name" : "area",
    page,
  };
}

/** 絞り込む。q は空白で区切った語をすべて含む(AND。店名・住所・所在・種類)。写真のある店を先に(それぞれの中の並びは元のまま) */
export function filterShops(shops: PetShop[], f: PetFilters): PetShop[] {
  const words = norm(f.q).split(" ").filter(Boolean);
  let list = shops.filter(
    (s) =>
      (!f.kind || s.kind === f.kind) &&
      (!f.pref || s.pref === f.pref) &&
      (!f.tag || s.tags.includes(f.tag)) &&
      (!f.animal || s.animals.includes(f.animal)) &&
      (words.length === 0 || words.every((w) => norm(`${s.name} ${s.address} ${s.place} ${s.kindName}`).includes(w))),
  );
  if (f.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ja"));
  return [...list.filter((s) => s.photo), ...list.filter((s) => !s.photo)];
}

/** 探すの URL(空の項目は付けない) */
export function searchHref(f: Partial<PetFilters>, hash = ""): string {
  const L = ptLinks("live");
  const p = new URLSearchParams();
  if (f.kind) p.set("kind", f.kind);
  if (f.pref) p.set("pref", f.pref);
  if (f.tag) p.set("tag", f.tag);
  if (f.animal) p.set("animal", f.animal);
  if (f.q) p.set("q", f.q);
  if (f.sort && f.sort !== "area") p.set("sort", f.sort);
  if (f.page && f.page > 1) p.set("page", String(f.page));
  const s = p.toString();
  return `${L.search}${s ? `?${s}` : ""}${hash}`;
}

export const shopHref = (id: string) => ptLinks("live").shop(id);

export { LIVE_BASE };
