/**
 * 動画1本のカード（サーバー）。ファサード（サムネイル＋再生ボタン）と、タイトル・店・最寄り駅へのリンク。
 * 店に紐づかない動画は店の行を出さない（店名や駅を作らない）。
 */
import Link from "next/link";
import type { CSSProperties } from "react";
import { VERTICALS } from "@/lib/verticals";
import type { Video } from "@/lib/videos/types";
import type { VideoStore } from "@/lib/videos/stores";
import { displayTitle, videoHref } from "@/lib/videos/display";
import VideoFacade from "./VideoFacade";
import { toFacade } from "./facade";

/** 動画の色と業種名。店があれば店の業種、無ければ動画の業種 */
export function videoTone(v: Video, stores: VideoStore[]): { style: CSSProperties; label: string | null } {
  const vert = stores[0]?.vertical ?? (v.industry ? VERTICALS[v.industry] : null);
  if (!vert) return { style: {}, label: null };
  return { style: { ["--ac" as string]: vert.accent.color, ["--acl" as string]: vert.accent.lightColor }, label: vert.name };
}

export default function VideoCard({ video, stores, eager = false }: { video: Video; stores: VideoStore[]; eager?: boolean }) {
  const tone = videoTone(video, stores);
  const title = displayTitle(video);
  return (
    <article className="mp-vd-item" style={tone.style}>
      <VideoFacade video={toFacade(video)} eager={eager} />
      <div className="mp-vd-meta">
        {tone.label && <small className="mp-vd-tag">{tone.label}</small>}
        <h3 className="mp-vd-title">
          <Link href={videoHref(video)} prefetch={false} data-cursor="WATCH">
            {title}
          </Link>
        </h3>
        {stores.map((s) => (
          <p className="mp-vd-store" key={s.id}>
            <Link href={s.href} prefetch={false} className="nm" data-cursor="SHOP">
              {s.name}
            </Link>
            <span className="sub">{[s.categoryName, s.prefShort, s.area].filter(Boolean).join("・")}</span>
            {s.station && (
              <Link href={s.station.href} prefetch={false} className="st" data-cursor="STATION">
                最寄り: {s.station.heading}
              </Link>
            )}
          </p>
        ))}
      </div>
    </article>
  );
}
