import "server-only";
import { notFound } from "next/navigation";
import { getPlaces } from "@/lib/places";
import { findFeatureForPlace } from "@/lib/places/features";
import type { Place } from "@/lib/places/types";
import { VERTICALS } from "@/lib/verticals";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { loadSpecials } from "@/components/portal/vkit/special/data";
import { SHOP_COPY, type ShopCopy } from "./copy";

export type Photo = { src: string; alt: string };
export type RelCard = { href: string; title: string; tag: string };
export type ShopView = {
  place: Place;
  copy: ShopCopy;
  kindName: string;
  area: string;
  /** 営業時間(「月〜金 8:00〜22:00」の行ごと) */
  hours: string[];
  photos: Photo[];
  official: string | null;
  rel: RelCard[];
};

export const prefName = (slug: string) => PREFECTURES.find((p) => p.slug === slug)?.name ?? "";

/** 「月-金 08:00 - 22:00 / 土 08:00 - 19:00」→ ["月〜金 8:00〜22:00", "土 8:00〜19:00"](値は変えず、書き方だけ見本にそろえる) */
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

export async function loadShopView(id: string): Promise<ShopView> {
  const places = await getPlaces("sports");
  const place = places.find((p) => p.id === id);
  const copy = SHOP_COPY[id];
  if (!place || !copy) notFound();
  const kindName = VERTICALS.sports.categories.find((c) => c.slug === place.category)?.name ?? "";
  const photos: Photo[] = (place.photos?.length ? place.photos : place.images.map((p) => ({ path: p, what: "" }))).map((p) => ({
    src: p.path,
    alt: `${place.name}${p.what ? ` — ${p.what}` : ""}`,
  }));
  const feature = await findFeatureForPlace("sports", place.id);
  const specials = loadSpecials({ key: "sports" });
  // 関連記事 3 枚 = その店の特集記事 + スポーツの特集記事(JSON の並びの先頭から)
  const rel: RelCard[] = [];
  if (feature) rel.push({ href: `/sports/article/${place.id}`, title: feature.article.title, tag: "店の特集" });
  for (const s of specials) rel.push({ href: `/sports/special/${s.slug}`, title: s.title, tag: "特集" });
  const web = place.website || place.url || "";
  return {
    place,
    copy,
    kindName,
    area: `${prefName(place.pref)}${place.cityName ?? ""}`,
    hours: fmtHours(place.hours ?? ""),
    photos,
    official: /^https?:\/\//.test(web) ? web : null,
    rel: rel.slice(0, 3),
  };
}
