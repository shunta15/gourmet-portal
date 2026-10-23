/**
 * ペット決定デザインの本番ページ(最初 /pet・店舗紹介の一覧 /pet/shop・特集 /pet/special)が使う、実在の店のデータの取り出し方(サーバー専用)。
 * 元は getPlaces("pet")(lib/places。最終的に lib/places/generated/pet.json)。クライアントの部品から import しない。
 *
 * 決まり(2026-10-21 ページ係 A が決めた。報告に書く):
 *  - 店のカード・記事のカードに出すのは「写真のある店」だけ。写真が無い店は最初・記事の一覧のカードには出さない(探す・店のページには出る)。
 *  - 写真は店の実物の写真(Place.photos)だけ。人の顔が主役らしい説明(what)の写真は選ばない。ストック写真・AI 画像は使わない。
 *  - 並べる順は「ランキングに見えない」ように、種類を 1 つずつ順番に回して(ラウンドロビン)、種類の中は店 ID の順。
 *  - 件数が 0 でも壊れないように、取り出す関数はどれも空の配列を返せる(呼ぶ側が空の欄を出さない)。
 */
import { getPlaces } from "@/lib/places";
import { getGeneratedFeatures } from "@/lib/places/features";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { VERTICALS } from "@/lib/verticals";
import { isUsableImage } from "@/lib/portal/photoRules";
import { firstSentence, lineOk } from "@/lib/portal/colorplay/text";
import type { Place } from "@/lib/places/types";

export type LivePhoto = { src: string; w: number; h: number; alt: string };

export type LiveShop = {
  id: string;
  name: string;
  /** 種類のスラッグ(trimming・pet-hotel・vet・dog-cafe・dog-run・pet-shop)。dog-cafe は表示名「カフェ・飲食店」(犬カフェ・猫カフェなどの動物カフェと、ペットと入れるカフェ・飲食店。URL・データの値は dog-cafe のまま) */
  kind: string;
  kindName: string;
  /** 都道府県のスラッグ・名前・市区町村・「東京都世田谷区」形式の所在地 */
  pref: string;
  prefName: string;
  city: string;
  area: string;
  tags: string[];
  /** 実物の写真(無ければ null) */
  photo: LivePhoto | null;
  /** 紹介記事(無ければ null)。headline は事実だけの 1 行・lede は導入の最初の 1 文(どちらも点検済み。空のことがある) */
  article: { headline: string; lede: string; checkedAt?: string } | null;
};

/** 記事の一覧に出す 1 本(実在の店の特集記事・紹介記事。リンク先はその店のページ。写真のある店だけ) */
export type LiveArticle = {
  /** 店の ID(= リンク先 /pet/shop/{id}) */
  id: string;
  shop: LiveShop;
  /** "feature" = features-pet.json の特集記事のある店 / "intro" = 店の紹介記事 */
  kind: "feature" | "intro";
  title: string;
  lede: string;
  /** 確認日(ISO) */
  date?: string;
  photo: LivePhoto;
};

/** 見本のカテゴリの並び(カフェ・トリミング・ドッグラン・ホテル・病院・ショップ)。最初のページのカテゴリの札・ラウンドロビンの順 */
export const KIND_ORDER = ["dog-cafe", "trimming", "dog-run", "pet-hotel", "vet", "pet-shop"] as const;

const KIND_NAME: Record<string, string> = Object.fromEntries(VERTICALS.pet.categories.map((c) => [c.slug, c.name]));
const PREF_NAME: Record<string, string> = Object.fromEntries(PREFECTURES.map((p) => [p.slug, p.name]));

/** 人の顔・人物が主役らしい写真の説明(その写真は選ばない) */
const HUMAN_LED = /(顔|人物|スタッフ|従業員|女性|男性|店主|オーナー|トリマー|獣医師|院長|お客|客)/;

// ---- 文の点検(探す・店のページの係と同じ考え方。lib/portal/colorplay/text.ts の点検 + ペットの禁止語 + 動物病院の医療広告の語) ----
/** lib/verticals/pet.ts の copyRules の禁止語 */
const PET_BAN = /最高|絶品|必ず|日本一|No\.?\s?1|ナンバーワン|ナンバー1|TOP|トップ|[0-9０-９]+選/i;
const VET_BAN = /治療成績|比較優良|絶対安全|治る|治す|治し|治療|効く|効き|効果|症状|改善|予防|回復|完治|名医/;

export function petLineOk(t: string, kind = ""): boolean {
  const vet = kind === "vet";
  return lineOk(t, false) && !PET_BAN.test(t) && !(vet && VET_BAN.test(t));
}
/** 1 行の説明(点検に通らなければ空) */
export function petLine(t: string | undefined, kind = ""): string {
  const x = (t ?? "").trim();
  return x && petLineOk(x, kind) ? x : "";
}
/** 紹介文の最初の 1 文(点検に通ったもの。長ければ切る。通る文が無ければ空) */
export function petFirst(t: string | undefined, kind = "", max = 64): string {
  const x = firstSentence(t, kind === "vet", max);
  return x && petLineOk(x, kind) ? x : "";
}

/** 「東京都世田谷区」。市区町村名が市区町村らしくなければ、都道府県の短い名前で続ける */
function areaText(p: { pref: string; cityName?: string }): string {
  const pref = PREFECTURES.find((x) => x.slug === p.pref);
  if (pref && p.cityName && /[市区町村]$/.test(p.cityName)) return `${pref.name}${p.cityName}`;
  return `${pref?.short ?? ""}${p.cityName ?? ""}`;
}

function photoOf(p: Place): LivePhoto | null {
  const list = p.photos ?? [];
  for (const ph of list) {
    if (!isUsableImage(ph.path)) continue;
    if (ph.what && HUMAN_LED.test(ph.what)) continue;
    return { src: ph.path, w: ph.width ?? 1200, h: ph.height ?? 800, alt: ph.what ? `${p.name} — ${ph.what}` : p.name };
  }
  // photos が無い店(古い形)は image だけ。説明が無いので人物かどうかは見分けられない(上流で選別済みの前提)
  if (list.length === 0) {
    const src = p.image ?? p.images?.[0];
    if (isUsableImage(src)) return { src, w: 1200, h: 800, alt: p.name };
  }
  return null;
}

function toShop(p: Place): LiveShop {
  const prefName = PREF_NAME[p.pref] ?? "";
  const city = p.cityName ?? "";
  const head = petLine(p.article?.headline, p.category);
  const lede = petFirst(p.article?.lede ?? p.intro, p.category);
  return {
    id: p.id,
    name: p.name,
    kind: p.category,
    kindName: KIND_NAME[p.category] ?? "",
    pref: p.pref,
    prefName,
    city,
    area: areaText(p),
    tags: (p.tags ?? []).map((t) => t.trim()).filter((t) => t && petLineOk(t, p.category)),
    photo: photoOf(p),
    // 見出しも導入の 1 文も点検に通らなければ、紹介記事なしとして扱う
    article: head || lede ? { headline: head, lede, checkedAt: p.article?.checkedAt } : null,
  };
}

/** ペットの実在の店すべて(店 ID の順)。pet.json がまだ無いあいだは空 */
export async function loadPetShops(): Promise<LiveShop[]> {
  const places = await getPlaces("pet");
  return places.map(toShop).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/**
 * 記事の一覧に出す本(写真のある店だけ)。特集記事(features-pet.json。店 ID が placeId と完全に一致するもの)のある店を先に、そのあとに紹介記事だけの店。
 * どちらも種類を順に回して並べる(ランキングに見せない)。見出し・導入は点検済み(通らなければその本は出さない)。
 */
export async function loadPetArticles(shops: LiveShop[]): Promise<LiveArticle[]> {
  const feats = await getGeneratedFeatures("pet");
  const featOf = new Map(feats.filter((f) => f.placeId).map((f) => [f.placeId as string, f]));
  const feature: LiveShop[] = [];
  const intro: LiveShop[] = [];
  for (const s of shops) {
    if (!s.photo) continue;
    if (featOf.has(s.id)) feature.push(s);
    else if (s.article?.headline) intro.push(s);
  }
  const make = (s: LiveShop): LiveArticle | null => {
    const f = featOf.get(s.id);
    if (f) {
      const title = petLine(f.article.title, s.kind);
      if (!title) return null;
      const hero = f.article.heroImage && isUsableImage(f.article.heroImage) && f.photos[f.article.heroImage] ? f.article.heroImage : "";
      const hp = hero ? f.photos[hero] : null;
      const photo: LivePhoto = hero && hp ? { src: hero, w: hp.w ?? 1200, h: hp.h ?? 800, alt: hp.alt || s.name } : s.photo!;
      return { id: s.id, shop: s, kind: "feature", title, lede: petFirst(f.article.lede || f.summary, s.kind), date: f.checkedAt ?? f.article.date, photo };
    }
    return { id: s.id, shop: s, kind: "intro", title: s.article!.headline, lede: s.article!.lede, date: s.article!.checkedAt, photo: s.photo! };
  };
  return [...interleave(feature), ...interleave(intro)].map(make).filter((a): a is LiveArticle => !!a);
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

/** 店の数が 1 つ以上ある種類(見本の並び → その他の種類)。{slug, name, count} */
export function kindsWithShops(shops: LiveShop[]): Array<{ slug: string; name: string; count: number }> {
  const count = new Map<string, number>();
  for (const s of shops) count.set(s.kind, (count.get(s.kind) ?? 0) + 1);
  const slugs = [...KIND_ORDER.filter((k) => count.has(k)), ...Array.from(count.keys()).filter((k) => !(KIND_ORDER as readonly string[]).includes(k))];
  return slugs.map((slug) => ({ slug, name: KIND_NAME[slug] ?? slug, count: count.get(slug) ?? 0 }));
}

/** 利用シーン(lib/verticals/pet.ts の scenes)のうち、店が 1 つ以上あるもの。写真は該当の店のうち写真のある最初の 1 枚(無ければ null) */
export function scenesWithShops(shops: LiveShop[]): Array<{ slug: string; name: string; count: number; shop: LiveShop | null }> {
  return VERTICALS.pet.scenes
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
