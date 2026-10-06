/**
 * 特集記事 → 「店を地図でまとめて見る」（巡り図）のデータ。サーバー専用。
 * 公開スイッチ ON のときだけ app/feature/[id]/page.tsx が動的 import で呼ぶ（OFF では読み込まれない）。
 *
 * 記事の項目と店をつなぐのは、項目の href（/restaurant/<店ID>）と、記事と対になる店（ARTICLE_STORE_ID_BY_FEATURE）だけ。
 * 店名の部分一致・座標の逆引きはしない。座標は lib/geo.ts の GEO にあるものだけ。無い店は「図に出せない店」に回す。
 * 駅は、店の案内に最寄り駅として書かれている駅（lib/stations の stated）だけ。位置は国土数値情報の駅位置。
 */
import "server-only";
import type { FeatureArticle } from "@/lib/regions";
import { getRestaurantById } from "@/lib/db/restaurants";
import { GEO } from "@/lib/geo";
import { ARTICLE_STORE_ID_BY_FEATURE } from "@/lib/articleStores";
import { getStationsForStore } from "@/lib/stations";
import { isBlockedImage } from "@/lib/imageBlocklist";
import { distM, fmapMode, spanOf, type FmapAside, type FmapData, type FmapStation, type FmapStop } from "./fmap";

const STORE_HREF = /^\/restaurant\/([A-Za-z0-9][A-Za-z0-9_-]{0,31})$/;

function usableImage(u: string | undefined): boolean {
  if (!u) return false;
  if (u.includes("tabelog") || u.includes("tblg") || u.includes("_placeholder")) return false;
  return !isBlockedImage(u);
}

/** 駅の位置が店から離れすぎているものは、データの取り違えを疑って使わない */
const STATION_MAX_M = 3000;

export type FmapReason = "no-store" | "one-store" | "geo-lt2" | "too-far";

export interface FmapResult {
  data: FmapData | null;
  /** 出さないときの理由（集計用） */
  reason: FmapReason | null;
  storeCount: number;
  geoCount: number;
  spanM: number;
}

export async function resolveFmap(article: FeatureArticle): Promise<FmapResult> {
  type Item = { sid: string | null; name: string; cuisine: string; area: string; rank: string; image?: string };
  const items: Item[] = article.ranking.map((r) => {
    const m = r.href?.match(STORE_HREF);
    return {
      sid: m ? m[1] : null,
      name: r.name,
      cuisine: r.cuisine,
      area: r.area,
      rank: r.rank,
      image: r.images.find(usableImage),
    };
  });
  // 記事と対になる店（記事由来の店）。項目に出てこなければ足す
  const pair = ARTICLE_STORE_ID_BY_FEATURE[article.id];
  if (pair && !items.some((i) => i.sid === pair)) {
    items.push({ sid: pair, name: "", cuisine: "", area: "", rank: "" });
  }

  const seen = new Set<string>();
  const stops: FmapStop[] = [];
  const aside: FmapAside[] = [];
  const stations: FmapStation[] = [];
  const stationSeen = new Set<string>();
  let storeCount = 0;

  for (const it of items) {
    if (!it.sid) {
      aside.push({ name: it.name, reason: "nostore" });
      continue;
    }
    if (seen.has(it.sid)) continue;
    seen.add(it.sid);
    storeCount++;
    const r = await getRestaurantById(it.sid);
    const name = r?.name || it.name;
    const g = GEO[it.sid];
    if (!g) {
      aside.push({ name, href: `/restaurant/${it.sid}`, reason: "nogeo" });
      continue;
    }
    let station: string | undefined;
    const st = getStationsForStore(it.sid).find((s) => s.type === "stated");
    if (st && distM(g, st) <= STATION_MAX_M) {
      station = st.name.endsWith("駅") ? st.name : `${st.name}駅`;
      if (!stationSeen.has(st.id)) {
        stationSeen.add(st.id);
        stations.push({ name: station, lat: st.lat, lng: st.lng });
      }
    }
    stops.push({
      id: it.sid,
      name,
      href: `/restaurant/${it.sid}`,
      lat: g.lat,
      lng: g.lng,
      cuisine: it.cuisine || r?.cuisine || "",
      area: it.area || r?.area || "",
      rank: it.rank,
      ...(station ? { station } : {}),
      ...(it.image ? { image: it.image } : {}),
      approx: g.precision !== "exact",
    });
  }

  const span = spanOf(stops);
  const base = { storeCount, geoCount: stops.length, spanM: span };
  if (storeCount === 0) return { data: null, reason: "no-store", ...base };
  if (storeCount === 1) return { data: null, reason: "one-store", ...base };
  if (stops.length < 2) return { data: null, reason: "geo-lt2", ...base };
  const mode = fmapMode(span, stops.length);
  if (!mode) return { data: null, reason: "too-far", ...base };
  return { data: { mode, spanM: Math.round(span), stops, aside, stations }, reason: null, ...base };
}

export async function buildFmap(article: FeatureArticle): Promise<FmapData | null> {
  return (await resolveFmap(article)).data;
}
