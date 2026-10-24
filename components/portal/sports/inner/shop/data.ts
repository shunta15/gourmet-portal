import "server-only";
import { notFound } from "next/navigation";
import { getPlaces } from "@/lib/places";
import { findFeatureForPlace } from "@/lib/places/features";
import type { Place } from "@/lib/places/types";
import { VERTICALS } from "@/lib/verticals";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { loadSpecials } from "@/components/portal/vkit/special/data";
import { articleIds } from "@/components/portal/vkit/article/ids";
import { sportsCfg } from "@/components/portal/vkit/configs";
import { vkLineOk } from "@/components/portal/vkit/common/live";
import { SPL } from "../../links";
import { SHOP_COPY, type ShopCopy } from "./copy";

export type Photo = { src: string; alt: string };
export type RelCard = { href: string; title: string; tag: string };
export type Source = { label: string; url: string };
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
  /** 情報の出どころ(公式サイト・Google マップ。http(s) のリンクだけ) */
  sources: Source[];
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

const KICKER: Record<string, string> = { gym: "GYM & FITNESS", "yoga-pilates": "YOGA & PILATES", "martial-arts": "MARTIAL ARTS", dance: "DANCE", golf: "GOLF", "facility-goods": "FACILITY & GOODS" };

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

/**
 * 手書きの札(copy.ts)が無い店(店が増えたとき)の札。店の紹介記事(Place.article)の導入・節の先頭の文だけを使う(足さない・言い換えない)。
 * 場所・営業時間の節は使わない。枠の数・位置は見本のまま。
 */
function fallbackCopy(p: Place, kindName: string): ShopCopy {
  const a = p.article;
  const secs = (a?.sections ?? []).filter((s) => s.heading && !/場所|営業時間|アクセス/.test(s.heading));
  const pick = (i: number) => secs[i] ?? secs[0];
  const city = p.cityName ?? "";
  return {
    kicker: KICKER[p.category] ?? "SPORTS",
    about: { h: [city ? `${city}の` : "", `${kindName}。`], p: take(a?.lede ?? "", 120) || take(a?.headline ?? "", 120) },
    f1: { h: (pick(0)?.heading ?? kindName).slice(0, 14), p: take(pick(0)?.body ?? "", 110) },
    f2: { h: (pick(1)?.heading ?? kindName).slice(0, 14), p: take(pick(1)?.body ?? "", 110) },
    slots: { heroMain: [0, 50, 55], heroTop: [1, 50, 50], heroBottom: [2, 50, 50], f1: [3, 50, 50], f2: [4, 50, 50], rel: [[0, 50, 50], [1, 50, 50], [2, 50, 50]] },
  };
}

export async function loadShopView(id: string): Promise<ShopView> {
  const places = await getPlaces("sports");
  const place = places.find((p) => p.id === id);
  if (!place) notFound();
  const kindName = VERTICALS.sports.categories.find((c) => c.slug === place.category)?.name ?? "";
  const copy = SHOP_COPY[id] ?? fallbackCopy(place, kindName);
  const photos: Photo[] = (place.photos?.length ? place.photos : place.images.map((p) => ({ path: p, what: "" }))).map((p) => ({
    src: p.path,
    alt: `${place.name}${p.what ? ` — ${p.what}` : ""}`,
  }));
  const feature = await findFeatureForPlace("sports", place.id);
  const specials = loadSpecials({ key: "sports" });
  // 関連記事 3 枚 = その店の特集記事(なければ紹介記事。記事のページがある店だけ)+ スポーツの特集記事(JSON の並びの先頭から)
  const rel: RelCard[] = [];
  const hasArticle = (await articleIds(sportsCfg)).includes(place.id);
  if (hasArticle) rel.push({ href: SPL.article(place.id), title: feature?.article.title ?? place.article?.headline ?? `${place.name}の紹介記事`, tag: "店の特集" });
  for (const s of specials) rel.push({ href: SPL.specialArticle(s.slug), title: s.title, tag: "特集" });
  const web = place.website || place.url || "";
  // 情報の出どころ: 特集があれば特集の出どころ、なければ紹介記事の出どころ
  const sources = (feature?.sources ?? place.article?.sources ?? []).filter((s) => /^https?:\/\//.test(s.url) && s.label);
  return {
    place,
    copy,
    kindName,
    area: `${prefName(place.pref)}${place.cityName ?? ""}`,
    hours: fmtHours(place.hours ?? ""),
    photos,
    official: /^https?:\/\//.test(web) ? web : null,
    rel: rel.slice(0, 3),
    sources,
  };
}
