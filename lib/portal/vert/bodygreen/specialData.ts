/**
 * 業種の特集記事に出す、店のデータからの件数・一覧(サーバー専用)。数えるのはビルド時。件数を本文に直書きしない。
 * 読む物: 店 = loadGreenShops()(本番の loadShops)、営業時間の全行・定休日・電話・予約 URL・公式サイト・地図 URL・情報の出どころ・確認日 = lib/places/generated/bodycare.json(getGeneratedPlaces)。
 */
import "server-only";
import { cache } from "react";
import { getGeneratedPlaces } from "@/lib/places/newVerticals";
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

/** 営業時間の文字列(「月-金 08:00 - 11:30, 15:00 - 20:30 / 土日 08:00 - 12:00」)から、曜日ごとの時間を取り出す */
export function hoursByDay(hours: string): Map<string, string> {
  const m = new Map<string, string>();
  for (const seg of hours.split(" / ")) {
    const sp = seg.trim().indexOf(" ");
    if (sp < 0) continue;
    const days = expandDays(seg.trim().slice(0, sp));
    const times = seg.trim().slice(sp + 1).trim();
    for (const d of days) m.set(d, times);
  }
  return m;
}

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
  /** 「土日営業」のこだわりが付いた店(並びは都道府県順 → ID 順。順位ではない) */
  weekend: WeekendShop[];
  /** 「土日営業」の店のうち、土・日のどちらかの営業時間を読み取れなかった数(0 が正常。0 でなければ元の文字列を出す) */
  weekendUnparsed: number;
};

export const loadSpecialStats = cache(async (): Promise<SpecialStats> => {
  const [shops, places] = await Promise.all([loadGreenShops(), getGeneratedPlaces("bodycare")]);
  const byId = new Map(places.map((p) => [p.id, p]));
  const facets = greenFacets(shops);
  const count = (f: (p: (typeof places)[number]) => boolean) => places.filter(f).length;
  const checked = places.map((p) => p.article?.checkedAt ?? "").filter(Boolean).sort();
  const tag: Record<string, number> = {};
  for (const t of facets.tags) tag[t.name] = t.count;

  const weekend: WeekendShop[] = shops
    .filter((s) => s.tags.includes("土日営業"))
    .map((s) => {
      const raw = byId.get(s.id)?.hours ?? "";
      const day = hoursByDay(raw);
      return { shop: s, sat: day.get("土") ?? "", sun: day.get("日") ?? "", raw, holidays: s.holidays };
    });

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
    withSources: count((p) => (p.article?.sources?.length ?? 0) > 0),
    withCheckedAt: count((p) => !!p.article?.checkedAt),
    tag,
    checkedAtMin: checked[0] ?? "",
    weekend,
    weekendUnparsed: weekend.filter((w) => !w.sat || !w.sun).length,
  };
});

/** 2026-10-09 → 2026.10.09 */
export const dotDate = (iso: string): string => iso.replace(/-/g, ".");
