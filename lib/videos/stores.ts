/**
 * 動画に映る店の情報（名前・種類・所在県・最寄りの駅ページ）。サーバー専用。
 * 店のデータは lib/places（グルメは既存の Restaurant から変換）。店 ID は業種をまたいで一意として扱う。
 * 店に紐づく動画が無いときは呼ばれない（店データを読まない）。
 */
import { getPlaces, type Place } from "@/lib/places";
import { VERTICALS } from "@/lib/verticals";
import type { Vertical } from "@/lib/verticals/types";
import { GOURMET_REGION_BY_PREF, getPrefBySlug } from "@/lib/areas/prefectures";
import { getStationsForStore } from "@/lib/stations";
import {
  NEARBY_MAX_METERS,
  getStationIndex,
  placeCategoryName,
  placeHref,
  stationHeading,
  stationHref,
} from "@/lib/stations/query";

export interface VideoStore {
  id: string;
  name: string;
  vertical: Vertical;
  /** 種類の表示名（グルメは業態の文字列、新業種は種類名） */
  categoryName: string;
  /** 市区町村・エリア名（無ければ空） */
  area: string;
  /** 都道府県 slug（分からなければ null） */
  pref: string | null;
  prefShort: string | null;
  /** 店ページ。グルメは /restaurant/{id}、新業種は /{v}/shop/{id} */
  href: string;
  /** 最寄りの駅エリア（駅ページが実在するものだけ） */
  station: { clusterId: string; heading: string; href: string } | null;
}

type Entry = { place: Place; vertical: Vertical };

// ビルド中は大量のページが同じ読み込みを使うので、短い時間だけ使い回す
let memo: { at: number; p: Promise<Map<string, Entry>> } | null = null;

function directory(): Promise<Map<string, Entry>> {
  const now = Date.now();
  if (!memo || now - memo.at > 60_000) {
    const p = (async () => {
      const found = new Map<string, Entry>();
      for (const v of Object.values(VERTICALS)) {
        for (const place of await getPlaces(v.key)) {
          if (!found.has(place.id)) found.set(place.id, { place, vertical: v });
        }
      }
      return found;
    })();
    memo = { at: now, p };
    p.catch(() => {
      if (memo?.p === p) memo = null;
    });
  }
  return memo.p;
}

/** グルメの region キー → 都道府県 slug（lib/areas の対応表の逆引き。愛知＝nagoya など） */
const PREF_BY_REGION: Record<string, string> = Object.fromEntries(
  Object.entries(GOURMET_REGION_BY_PREF).map(([pref, region]) => [region, pref]),
);

/** 店の都道府県 slug。グルメは Place.pref が region キーなので県に直す */
export function prefOfPlace(place: Place): string | null {
  if (place.vertical === "gourmet") return PREF_BY_REGION[place.pref] ?? null;
  return place.pref || null;
}

/** 店 ID → 都道府県 slug（分かる店だけ） */
export async function storePrefs(): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (const [id, { place }] of await directory()) {
    const pref = prefOfPlace(place);
    if (pref) out.set(id, pref);
  }
  return out;
}

/** 指定した店 ID の情報。店のデータに無い ID は結果に入らない */
export async function getVideoStores(ids: string[]): Promise<Map<string, VideoStore>> {
  const out = new Map<string, VideoStore>();
  if (ids.length === 0) return out;
  const dir = await directory();
  const idx = await getStationIndex();
  for (const id of new Set(ids)) {
    const hit = dir.get(id);
    if (!hit) continue;
    const { place, vertical } = hit;
    const pref = prefOfPlace(place);

    // 最寄りの駅: 店の案内に書かれた駅（stated）を先に、無ければ駅から近い順（nearby）。駅ページが実在するものだけ
    const sts = getStationsForStore(id).filter((s) => s.pref && idx.bySlug.has(s.slug));
    const stated = sts.find((s) => s.type === "stated");
    const nearby = sts
      .filter((s) => s.type === "nearby" && (s.meters ?? Infinity) <= NEARBY_MAX_METERS)
      .sort((a, b) => (a.meters ?? 0) - (b.meters ?? 0))[0];
    const st = stated ?? nearby;

    out.set(id, {
      id,
      name: place.name,
      vertical,
      categoryName: placeCategoryName(vertical, place),
      area: place.cityName ?? "",
      pref,
      prefShort: pref ? (getPrefBySlug(pref)?.short ?? null) : null,
      href: placeHref(vertical, place),
      station: st ? { clusterId: st.id, heading: stationHeading(st), href: stationHref(st) } : null,
    });
  }
  return out;
}
