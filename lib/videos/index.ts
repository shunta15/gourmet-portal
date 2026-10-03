/**
 * ショート動画のデータ取得（サーバー専用。クライアントコンポーネントから import しない）。
 *  - 動画ファイル: lib/regions.ts の SHORT_VIDEOS を Video に変換（file.ts）
 *  - TikTok: lib/videos/tiktok.json（automation/videos/ingest.mjs --apply が書く）
 * 店 → 駅の対応は lib/stations（駅ページと同じ規則: 店の案内に書かれた駅、または駅から直線 800m 以内）。
 */
import type { Video } from "./types";
import { getFileVideos } from "./file";
import tiktokJson from "./tiktok.json";
import { STORE_STATIONS } from "@/lib/stations";
import { NEARBY_MAX_METERS } from "@/lib/stations/query";
import { storePrefs } from "./stores";

export type { Video, VideoSource } from "./types";

// JSON から型を推論させると空配列が never[] になるので明示する
const TIKTOK = tiktokJson as unknown as Video[];

let memo: Video[] | null = null;

/** 全動画。TikTok（投稿日が新しい順。投稿日が無いものは取り込み順で最後）→ 動画ファイル */
export function getAllVideos(): Video[] {
  if (memo) return memo;
  const tiktok = TIKTOK.map((v, i) => ({ v, i })).sort((a, b) => {
    const ta = a.v.uploadDate ? Date.parse(a.v.uploadDate) : -Infinity;
    const tb = b.v.uploadDate ? Date.parse(b.v.uploadDate) : -Infinity;
    if (ta !== tb) return tb - ta;
    return a.i - b.i;
  });
  memo = [...tiktok.map((x) => x.v), ...getFileVideos()];
  return memo;
}

export function getVideo(id: string): Video | undefined {
  return getAllVideos().find((v) => v.id === id);
}

export function getVideosByStore(storeId: string): Video[] {
  return getAllVideos().filter((v) => v.storeIds.includes(storeId));
}

/** 駅エリアの動画。店が stated（案内に最寄り駅として書かれている）または nearby（800m 以内）で駅エリアに入っている動画 */
export function getVideosByStation(clusterId: string): Video[] {
  const inStation = (storeId: string): boolean => {
    const e = STORE_STATIONS[storeId];
    if (!e) return false;
    return (
      !!e.stated?.some((s) => s.clusterId === clusterId) ||
      !!e.nearby?.some((n) => n.clusterId === clusterId && n.meters <= NEARBY_MAX_METERS)
    );
  };
  return getAllVideos().filter((v) => v.storeIds.some(inStation));
}

/**
 * 都道府県（slug）の動画。店の所在県で決める（グルメの region キーは lib/areas の対応表で県に直す）。
 * 店のデータ（DB）を読むので非同期。店に紐づく動画が1本も無いときは店データを読まない。
 */
export async function getVideosByPref(pref: string): Promise<Video[]> {
  const all = getAllVideos();
  if (!all.some((v) => v.storeIds.length > 0)) return [];
  const prefs = await storePrefs();
  return all.filter((v) => v.storeIds.some((id) => prefs.get(id) === pref));
}
