import "server-only";
import { notFound } from "next/navigation";
import { getPlaces } from "@/lib/places";
import { findFeatureForPlace } from "@/lib/places/features";
import type { Place } from "@/lib/places/types";
import { VERTICALS } from "@/lib/verticals";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { articleIds } from "@/components/portal/vkit/article/ids";
import { lifeCfg } from "@/components/portal/vkit/configs";
import { vkLineOk } from "@/components/portal/vkit/common/live";
import { LFL } from "../../links";
import { SHOP_COPY, type ShopCopy } from "./copy";

export type Photo = { src: string; alt: string; pos: string };
export type Source = { label: string; url: string };
export type OtherShop = { id: string; name: string; kindName: string; area: string; href: string; photo: Photo | null };
export type ShopView = {
  place: Place;
  copy: ShopCopy;
  kindName: string;
  /** 「東京都港区白金」(見本の所在地) */
  loc: string;
  hero: Photo | null;
  side: Photo | null;
  side2: Photo | null;
  feats: Array<{ h: string; p: string; photo: Photo | null }>;
  official: string | null;
  mapUrl: string | null;
  /** その店の特集記事(なければ紹介記事)へのリンク。記事のページがある店だけ */
  article: { href: string; title: string } | null;
  others: OtherShop[];
  /** 情報の出どころ(公式サイト・Google マップ。http(s) のリンクだけ) */
  sources: Source[];
};

export const prefName = (slug: string) => PREFECTURES.find((p) => p.slug === slug)?.name ?? "";

/** 所在地(都道府県+市区町村。東京の区は住所の町名まで) */
export function locOf(p: Place): string {
  if (p.pref === "tokyo") return p.address.match(/^[^0-9０-９]+/)?.[0] ?? `${prefName(p.pref)}${p.cityName ?? ""}`;
  return `${prefName(p.pref)}${p.cityName ?? ""}`;
}

/** 「月-金 08:00 - 22:00 / 土 08:00 - 19:00」→ ["月〜金 8:00〜22:00", "土 8:00〜19:00"](値は変えず、書き方だけそろえる) */
export function fmtHours(s: string): string[] {
  return s
    .split(/\s\/\s/)
    .map((x) =>
      x
        .replace(/([月火水木金土日祝])-([月火水木金土日祝])/g, "$1〜$2")
        .replace(/\s-\s/g, "〜")
        .replace(/\b0(\d:\d\d)/g, "$1")
        .trim(),
    )
    .filter(Boolean);
}

/**
 * 営業日・休みの案内が、店の案内と Google マップ(または店の案内どうし)で食い違っている店(店の特集記事に同じ内容)。
 * 食い違う方を選ばず、営業時間の欄の最後に「電話で確認」の一言を足す。
 */
const HOURS_NOTE: Record<string, string> = {
  li0002: "※休みは電話で確認",
  li0004: "※休みは電話で確認",
};

export function shopHours(id: string, raw: string): string[] {
  const lines = fmtHours(raw);
  const note = HOURS_NOTE[id];
  return note && lines.length ? [...lines, note] : lines;
}

/** 文(「。」で終わる単位)のうち点検を通るものを、max 字を超えない範囲で先頭から集める(1 文は必ず入れる) */
function take(text: string, max: number): string {
  const sents = text.split(/(?<=。)/).map((s) => s.trim()).filter((s) => s && vkLineOk(s));
  let out = "";
  for (const s of sents) {
    if (out && out.length + s.length > max) break;
    out += s;
  }
  return out;
}

/** 手書きの札(copy.ts)が無い店(店が増えたとき)の札。店の紹介記事(Place.article)の導入・節の先頭の文だけを使う(足さない・言い換えない) */
function fallbackCopy(p: Place, kindName: string): ShopCopy {
  const a = p.article;
  const secs = (a?.sections ?? []).filter((s) => s.heading && !/場所|営業時間|アクセス/.test(s.heading));
  const pick = (i: number) => secs[i] ?? secs[0];
  const f = (i: number) => ({ h: (pick(i)?.heading ?? kindName).slice(0, 14), p: take(pick(i)?.body ?? "", 110), photo: [i + 1, 50, 50] as [number, number, number] });
  return {
    catch: [p.cityName ? `${p.cityName}の` : "", `${kindName}。`],
    blurb: take(a?.lede ?? "", 60),
    introH: [p.cityName ? `${p.cityName}の` : "", `${kindName}。`],
    introP: take(a?.lede ?? "", 120) || take(a?.headline ?? "", 120),
    f: [f(0), f(1), f(2)],
    hero: [0, 50, 50],
    side: [1, 50, 50],
    side2: [2, 50, 50],
  };
}

export async function loadShopView(id: string): Promise<ShopView> {
  const places = await getPlaces("life");
  const place = places.find((p) => p.id === id);
  if (!place) notFound();
  const cats = VERTICALS.life.categories;
  const kindName = place.kindName || (cats.find((c) => c.slug === place.category)?.name ?? "");
  const copy = SHOP_COPY[id] ?? fallbackCopy(place, kindName);
  const list = place.photos?.length ? place.photos : place.images.map((p) => ({ path: p, what: "" }));
  const ph = (slot: [number, number?, number?]): Photo | null => {
    const f = list[slot[0]] ?? list[0];
    if (!f) return null;
    return { src: f.path, alt: `${place.name}${f.what ? ` — ${f.what}` : ""}`, pos: `${slot[1] ?? 50}% ${slot[2] ?? 50}%` };
  };
  const feature = await findFeatureForPlace("life", place.id);
  const hasArticle = (await articleIds(lifeCfg)).includes(place.id);
  const web = place.website || place.url || "";
  const sources = (feature?.sources ?? place.article?.sources ?? []).filter((s) => /^https?:\/\//.test(s.url) && s.label);
  const others: OtherShop[] = places
    .filter((p) => p.id !== id)
    .slice(0, 3)
    .map((p) => {
      const f = p.photos?.[0];
      return {
        id: p.id,
        name: p.name,
        kindName: p.kindName || (cats.find((c) => c.slug === p.category)?.name ?? ""),
        area: locOf(p),
        href: LFL.shop(p.id),
        photo: f ? { src: f.path, alt: `${p.name} — ${f.what}`, pos: "50% 50%" } : null,
      };
    });
  return {
    place,
    copy,
    kindName,
    loc: locOf(place),
    hero: ph(copy.hero),
    side: ph(copy.side),
    side2: ph(copy.side2),
    feats: copy.f.map((x) => ({ h: x.h, p: x.p, photo: ph(x.photo) })),
    official: /^https?:\/\//.test(web) ? web : null,
    mapUrl: /^https?:\/\//.test(place.mapUrl ?? "") ? (place.mapUrl as string) : null,
    article: hasArticle ? { href: LFL.article(place.id), title: feature?.article.title ?? place.article?.headline ?? `${place.name}の紹介記事` } : null,
    others,
    sources,
  };
}
