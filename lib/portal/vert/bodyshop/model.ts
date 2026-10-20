/**
 * ボディケアの店のページ(1 店 1 ページ)の見本 3 案が共通で使う、店のデータの組み立て。サーバー専用(クライアントから import しない)。
 * 店の紹介文・事実は既存のデータ(lib/places/generated)をそのまま使う。新しい事実・数字を足さない。
 * 店と特集記事の対応は ID の完全一致(placeId === 店の ID)。店と写真の対応は Place.photos(ID の完全一致)と、特集に載る同じ店の写真だけ。
 *
 * 文の点検: ビューティーの公開版の点検(lib/portal/colorplay/text.ts の lineOk。strict=ボディケア)に、ボディケア用の語を足して、
 * 通らない「文」は表示から落とす(店は残す)。落とした結果、段落・見出しが空になれば、その見どころは出さない。
 * メニューは名前だけ(料金・時間の金額なし)。星・点数・順位・口コミ・「営業中」は出さない。
 */
import { getGeneratedPlaces } from "@/lib/places/newVerticals";
import { getGeneratedFeatures } from "@/lib/places/features";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { isUsableImage } from "@/lib/portal/photoRules";
import { cleanLine as baseCleanLine, lineOk as baseLineOk } from "@/lib/portal/colorplay/text";
import { shopLinks, type ShopLink } from "@/lib/portal/sns";
import { mapsSearchUrl } from "@/lib/maps";
import { getVertical } from "@/lib/verticals";
import { POLE_COLORS } from "@/lib/portal/vert/korogashi/colors";
import type { Place } from "@/lib/places/types";

/** ボディケアで足す語(症状・楽になる・点数・順位など)。ビューティーの点検(COMMON・STRICT・PRICE)の上に重ねる */
const EXTRA = /楽に|楽な|痛|スッキリ|すっきり|健康|癒|不調|悩み|軽く|効[くきけ]|効果|効能|体質|[0-9０-９]+\s*点|点数|満点|[0-9０-９一二三四五六七八九十]+\s*位|第[0-9０-９一二三四五六七八九十]+|NO\.?1|ナンバー|話題|絶品/i;
const sentences = (t: string): string[] => t.match(/[^。]+。?/g) ?? [];
export const lineOk = (t: string): boolean => baseLineOk(t, true) && !EXTRA.test(t);
export const cleanLine = (t: string | undefined): string => {
  const x = baseCleanLine(t, true);
  return x && !EXTRA.test(x) ? x : "";
};
export function cleanParagraphs(body: string | undefined): string[] {
  return (body ?? "")
    .split(/\n+/)
    .map((x) => sentences(x.trim()).filter(lineOk).join("").trim())
    .filter(Boolean);
}

export type BsPhoto = { src: string; alt: string; w: number; h: number };
export type BsPanel = {
  /** 01, 02 … */
  no: string;
  /** 短い名前(ドラムの面・見出しの飾りに使う。14 字まで) */
  label: string;
  heading: string;
  sub?: string;
  /** 見える段落 */
  open: string[];
  /** 「続きを読む」の中 */
  rest: string[];
  specs: { k: string; v: string }[];
};
export type BsMini = { id: string; name: string; kindName: string; area: string; color: string; photo: BsPhoto | null };
export type BsFact = { k: string; v: string[] };
export type BsShop = {
  id: string;
  name: string;
  kana?: string;
  kindSlug: string;
  kindName: string;
  color: string;
  prefSlug: string;
  prefName: string;
  prefShort: string;
  city: string;
  address: string;
  headline: string;
  photos: BsPhoto[];
  panels: BsPanel[];
  /** 特集記事(story)の引用と結び */
  quote: string;
  quoteCite: string;
  closing: string[];
  hasStory: boolean;
  menus: string[];
  facts: BsFact[];
  links: ShopLink[];
  sources: { label: string; url: string }[];
  checkedAt?: string;
  sameArea: BsMini[];
  sameKind: BsMini[];
  total: number;
};

const PREF = new Map(PREFECTURES.map((p) => [p.slug, p]));

/** 写真の説明(alt)は、点検(lineOk)に通るものだけ使う。通らなければ「店の写真」 */
const altOf = (p: Place, what?: string) => `${p.name} — ${what && lineOk(what) ? what : "店の写真"}`;
const toPhoto = (p: Place, x: { path: string; what?: string; width?: number; height?: number }): BsPhoto => ({ src: x.path, alt: altOf(p, x.what), w: x.width ?? 1200, h: x.height ?? 800 });

/** 本文を「見える所」と「続きを読むの中」に分ける。短ければ全部見せる */
export function fold(body: string[]): { open: string[]; rest: string[] } {
  const total = body.reduce((n, x) => n + x.length, 0);
  if (total <= 170) return { open: body, rest: [] };
  const sents = body[0].match(/[^。]+。?/g) ?? [body[0]];
  let head = "";
  let i = 0;
  while (i < sents.length && head.length < 100) head += sents[i++];
  const tail = sents.slice(i).join("");
  return { open: [head], rest: [...(tail ? [tail] : []), ...body.slice(1)] };
}

const clip = (t: string, n: number) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);

function colorOf(kind: string): string {
  const v = getVertical("bodycare");
  const i = Math.max(0, v.categories.findIndex((c) => c.slug === kind));
  return POLE_COLORS[i] ?? POLE_COLORS[0];
}

export async function loadBsShop(id: string): Promise<BsShop | null> {
  const places = await getGeneratedPlaces("bodycare");
  const p = places.find((x) => x.id === id);
  if (!p) return null;
  const v = getVertical("bodycare");
  const kindName = v.categories.find((c) => c.slug === p.category)?.name ?? p.category;
  const pref = PREF.get(p.pref);
  const feat = (await getGeneratedFeatures("bodycare")).find((f) => f.placeId === p.id);

  // 写真: 店のデータの写真(使えるもの)。特集のある店は、その特集の写真(同じ店の写真)も足す。同じ写真は 1 回だけ
  const photos: BsPhoto[] = (p.photos ?? []).filter((x) => isUsableImage(x.path)).map((x) => toPhoto(p, x));
  if (feat) {
    const have = new Set(photos.map((x) => x.src));
    const extra = [feat.article.heroImage, ...feat.article.ranking.flatMap((r) => r.images)].filter((s, i, a) => !!s && a.indexOf(s) === i && isUsableImage(s) && !have.has(s));
    for (const src of extra) photos.push({ src, alt: feat.photos[src]?.alt && lineOk(feat.photos[src].alt) ? feat.photos[src].alt : `${p.name} — 店の写真`, w: feat.photos[src]?.w ?? 1200, h: feat.photos[src]?.h ?? 800 });
    const hero = photos.find((x) => x.src === feat.article.heroImage);
    if (hero) photos.splice(0, photos.length, hero, ...photos.filter((x) => x !== hero));
  }

  // 紹介の見どころ(特集があれば特集の本文。無ければ短い紹介文と見出しつきの文)
  const panels: BsPanel[] = [];
  let quote = "";
  let quoteCite = "";
  let closing: string[] = [];
  const push = (label: string, heading: string, body: string[], sub?: string, specs: { k: string; v: string }[] = []) => {
    if (body.length === 0 || !heading) return;
    const f = fold(body);
    panels.push({ no: String(panels.length + 1).padStart(2, "0"), label: clip(label || heading, 14), heading, sub, open: f.open, rest: f.rest, specs });
  };
  if (feat) {
    const a = feat.article;
    push("紹介", cleanLine(a.title) || `${p.name}について`, cleanParagraphs(a.lede), cleanLine(a.subtitle) || undefined);
    for (const r of a.ranking) {
      const name = cleanLine(r.name);
      const body = cleanParagraphs(r.desc);
      if (!name || body.length === 0) continue;
      push(cleanLine(r.cuisine) || name, name, body, cleanLine(r.purpose) || undefined, r.specs.filter((sp) => lineOk(`${sp.k}${sp.v}`)));
    }
    quote = cleanLine(a.quote);
    quoteCite = a.quoteCite ?? "";
    closing = cleanParagraphs(a.closing);
  } else {
    const lede = cleanParagraphs(p.article?.lede ?? p.intro);
    push("紹介", "紹介", lede);
    for (const s of p.article?.sections ?? []) push(s.heading, cleanLine(s.heading), cleanParagraphs(s.body));
  }

  const menus = (p.article?.menus ?? []).map((m) => m.name).filter((n) => lineOk(n));
  const facts: BsFact[] = [{ k: "住所", v: [p.address] }];
  if (p.station) facts.push({ k: "最寄り駅", v: [p.station] });
  if (p.hours) facts.push({ k: "営業時間", v: p.hours.split(" / ") });
  if (p.holidays) facts.push({ k: "定休日", v: [p.holidays] });
  if (p.phone) facts.push({ k: "電話", v: [p.phone] });

  const links = shopLinks({
    phone: p.phone,
    mapUrl: p.mapUrl ?? mapsSearchUrl(p.name, p.address),
    reservationUrl: p.reservationUrl,
    instagram: p.instagram,
    tiktok: p.tiktok,
    x: p.x,
    facebook: p.facebook,
    line: p.line,
    website: p.website ?? p.url,
  });

  const mini = (x: Place): BsMini => {
    const ph = (x.photos ?? []).find((y) => isUsableImage(y.path));
    return {
      id: x.id,
      name: x.name,
      kindName: v.categories.find((c) => c.slug === x.category)?.name ?? x.category,
      area: `${PREF.get(x.pref)?.short ?? ""}${x.cityName ? ` ${x.cityName}` : ""}`.trim(),
      color: colorOf(x.category),
      photo: ph ? toPhoto(x, ph) : null,
    };
  };
  const others = places.filter((x) => x.id !== p.id);
  const sameArea = others
    .filter((x) => x.pref === p.pref)
    .sort((a, b) => Number(b.cityName === p.cityName) - Number(a.cityName === p.cityName) || a.id.localeCompare(b.id))
    .slice(0, 4);
  const sameKind = others
    .filter((x) => x.category === p.category && !sameArea.some((y) => y.id === x.id))
    .sort((a, b) => Number(b.pref === p.pref) - Number(a.pref === p.pref) || a.id.localeCompare(b.id))
    .slice(0, 4);

  return {
    id: p.id,
    name: p.name,
    kana: p.nameKana,
    kindSlug: p.category,
    kindName,
    color: colorOf(p.category),
    prefSlug: p.pref,
    prefName: pref?.name ?? p.pref,
    prefShort: pref?.short ?? p.pref,
    city: p.cityName ?? "",
    address: p.address,
    headline: cleanLine(p.article?.headline),
    photos,
    panels,
    quote,
    quoteCite,
    closing,
    hasStory: !!feat,
    menus,
    facts,
    links,
    // 紹介記事の無い店(特集だけの店)は、特集ファイルの出どころ・確認日を出す
    sources: (p.article?.sources?.length ? p.article.sources : feat?.sources) ?? [],
    checkedAt: p.article?.checkedAt ?? feat?.checkedAt,
    sameArea: sameArea.map(mini),
    sameKind: sameKind.map(mini),
    total: places.length,
  };
}
