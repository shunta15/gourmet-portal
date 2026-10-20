/**
 * 業種の特集記事に出す、店のデータからの件数・一覧(サーバー専用)。数えるのはビルド時。件数を本文に直書きしない。
 * 読む物: 店 = loadGreenShops()(本番の loadShops)、営業時間の全行・定休日・電話・予約 URL・公式サイト・地図 URL・情報の出どころ・確認日 = lib/places/generated/bodycare.json(getGeneratedPlaces)。
 */
import "server-only";
import { cache } from "react";
import { getGeneratedPlaces } from "@/lib/places/newVerticals";
import { getGeneratedFeatures } from "@/lib/places/features";
import { greenFacets, loadGreenShops } from "./shops";
import type { GreenFacets, GreenShop } from "./types";

const DAYS = "月火水木金土日";

/** 「月水-金」「毎日」「月-水金-日」のような曜日の書き方 → 曜日の集合 */
function expandDays(token: string): Set<string> {
  const out = new Set<string>();
  if (token === "毎日") {
    for (const d of DAYS) out.add(d);
    return out;
  }
  const chars = [...token];
  let i = 0;
  while (i < chars.length) {
    const c = chars[i];
    if (!DAYS.includes(c)) return new Set(); // 読めない書き方は空(呼ぶ側が元の文字列を出す)
    if (chars[i + 1] === "-" && chars[i + 2] && DAYS.includes(chars[i + 2])) {
      const a = DAYS.indexOf(c);
      const b = DAYS.indexOf(chars[i + 2]);
      if (b < a) return new Set();
      for (let k = a; k <= b; k++) out.add(DAYS[k]);
      i += 3;
    } else {
      out.add(c);
      i += 1;
    }
  }
  return out;
}

/** 営業時間の文字列(「月-金 08:00 - 11:30, 15:00 - 20:30 / 土日 08:00 - 12:00」)から、曜日ごとの時間を取り出す。
 * 読めない書き方・同じ曜日が 2 回出る書き方・時刻の書き方でない値があるときは null(あいまいなので呼ぶ側は店を入れない) */
export function hoursByDayStrict(hours: string): Map<string, string> | null {
  const m = new Map<string, string>();
  for (const raw of hours.split(" / ")) {
    const seg = raw.trim();
    if (!seg) continue;
    const sp = seg.indexOf(" ");
    if (sp < 0) return null;
    const days = expandDays(seg.slice(0, sp));
    const times = seg.slice(sp + 1).trim();
    if (days.size === 0 || !TIMES.test(times)) return null;
    for (const d of days) {
      if (m.has(d)) return null;
      m.set(d, times);
    }
  }
  return m;
}

/** 「09:00 - 12:00」「09:00 - 12:00, 15:00 - 19:00」の形(HH:MM - HH:MM をコンマで並べた物)だけを時刻の書き方とみなす */
const TIMES = /^\d{1,2}:\d{2} - \d{1,2}:\d{2}(, \d{1,2}:\d{2} - \d{1,2}:\d{2})*$/;

export type WeekendShop = {
  shop: GreenShop;
  /** 土曜の営業時間(読み取れなければ "") */
  sat: string;
  /** 日曜の営業時間(読み取れなければ "") */
  sun: string;
  /** 営業時間の元の文字列(読み取れなかったときに出す) */
  raw: string;
  holidays: string;
};

export type SpecialStats = {
  total: number;
  facets: GreenFacets;
  /** 件数(店のデータにある項目の数) */
  withHours: number;
  withHolidays: number;
  withPhone: number;
  withReservation: number;
  withWebsite: number;
  withMap: number;
  withAddress: number;
  withSources: number;
  withCheckedAt: number;
  /** こだわり(タグ)ごとの店の数 */
  tag: Record<string, number>;
  /** 確認日の一番古い物(YYYY-MM-DD。無ければ "") */
  checkedAtMin: string;
  /** 営業時間の行に土曜と日曜の両方の営業時間がある店(定休日に土・日が入る店と、営業時間の書き方があいまいな店は入れない)。並びは都道府県順 → ID 順で、順位ではない */
  weekend: WeekendShop[];
};

export const loadSpecialStats = cache(async (): Promise<SpecialStats> => {
  const [shops, places, features] = await Promise.all([loadGreenShops(), getGeneratedPlaces("bodycare"), getGeneratedFeatures("bodycare")]);
  const byId = new Map(places.map((p) => [p.id, p]));
  // 店ページに出る「情報の出どころ・確認日」は、紹介記事の物。紹介記事の無い店(特集だけの店)は特集ファイルの物(lib/portal/vert/bodyshop/model.ts と同じ決め方)
  const featById = new Map(features.map((f) => [f.placeId, f]));
  const srcOf = (p: (typeof places)[number]) => (p.article?.sources?.length ? p.article.sources : featById.get(p.id)?.sources) ?? [];
  const checkedOf = (p: (typeof places)[number]) => p.article?.checkedAt ?? featById.get(p.id)?.checkedAt ?? "";
  const facets = greenFacets(shops);
  const count = (f: (p: (typeof places)[number]) => boolean) => places.filter(f).length;
  const checked = places.map(checkedOf).filter(Boolean).sort();
  const tag: Record<string, number> = {};
  for (const t of facets.tags) tag[t.name] = t.count;

  const weekend: WeekendShop[] = [];
  for (const s of shops) {
    const raw = byId.get(s.id)?.hours ?? "";
    const day = hoursByDayStrict(raw);
    if (!day) continue;
    const sat = day.get("土") ?? "";
    const sun = day.get("日") ?? "";
    if (!sat || !sun) continue;
    if (/[土日]/.test(s.holidays)) continue; // 定休日に土・日が入る店は入れない
    weekend.push({ shop: s, sat, sun, raw, holidays: s.holidays });
  }

  return {
    total: shops.length,
    facets,
    withHours: count((p) => !!p.hours),
    withHolidays: count((p) => !!p.holidays),
    withPhone: count((p) => !!p.phone),
    withReservation: count((p) => !!p.reservationUrl),
    withWebsite: count((p) => !!p.website),
    withMap: count((p) => !!p.mapUrl),
    withAddress: count((p) => !!p.address),
    withSources: count((p) => srcOf(p).length > 0),
    withCheckedAt: count((p) => !!checkedOf(p)),
    tag,
    checkedAtMin: checked[0] ?? "",
    weekend,
  };
});

/** 2026-10-09 → 2026.10.09 */
export const dotDate = (iso: string): string => iso.replace(/-/g, ".");
