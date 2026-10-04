/**
 * 動画の視聴ページ。/videos/{id}
 * 動画・タイトル・店（名前・地域・最寄り駅）・同じ店/同じ駅の他の動画。
 * JSON-LD は BreadcrumbList（パンくず）と、投稿日が分かる動画だけ VideoObject。
 * 投稿日が無い動画（動画ファイルなど）は VideoObject を出さず noindex。
 */
import { liveStaticParams } from "@/lib/portal/launch";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "../JsonLd";
import { MIN_INDEXABLE } from "@/lib/seo/gate";
import { buildMetadata } from "@/lib/seo/meta";
import { videoObject } from "@/lib/seo/videoLd";
import { getAllVideos, getVideo, getVideosByStation, getVideosByStore } from "@/lib/videos";
import type { Video } from "@/lib/videos/types";
import { getVideoStores, type VideoStore } from "@/lib/videos/stores";
import {
  displayTitle,
  formatDuration,
  formatUploadDate,
  isVideoIndexable,
  shortTitle,
  videoDescription,
} from "@/lib/videos/display";
import { safeDecode } from "@/lib/stations/query";
import ShopLinks from "@/components/portal/ShopLinks";
import VideoFacade from "@/components/portal/video/VideoFacade";
import VideoTiles from "@/components/portal/video/VideoTiles";
import { toFacade } from "@/components/portal/video/facade";
import { videoTone } from "@/components/portal/video/VideoCard";
import { notFoundMetadata } from "./data";
import { Block, PageFrame, ShareSection, type Tone } from "./frame";

type Props = { params: Promise<{ id: string }> };

const TONE: Tone = { color: "#15110e", lightColor: "#e7dfd0", glyph: "動" };

export const generateStaticParams = liveStaticParams(() => {
  return getAllVideos().map((v) => ({ id: v.id }));
});

async function find(params: Props["params"]): Promise<{ video: Video; stores: VideoStore[] } | null> {
  const { id } = await params;
  const video = getVideo(safeDecode(id));
  if (!video) return null;
  const map = await getVideoStores(video.storeIds);
  const stores = video.storeIds.map((s) => map.get(s)).filter((s): s is VideoStore => !!s);
  return { video, stores };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hit = await find(params);
  if (!hit) return notFoundMetadata();
  const { video, stores } = hit;
  const store = stores[0];
  const indexable = isVideoIndexable(video);
  const md = buildMetadata({
    vertical: "portal",
    title: `${shortTitle(video)}｜${store ? `${store.name}の動画` : "動画"}｜マチノワ`,
    description: videoDescription(video, store?.name),
    path: `/videos/${video.id}`,
    count: indexable ? MIN_INDEXABLE : 0,
  });
  // 投稿日が分かる動画だけ index（VideoObject を出せる動画）。判定は isVideoIndexable の1か所
  return { ...md, robots: { index: indexable, follow: true } };
}

/** 他の動画（現在の動画と、すでに出した動画は除く） */
function others(list: Video[], current: Video, shown: Set<string>): Video[] {
  return list.filter((v) => v.id !== current.id && !shown.has(v.id)).slice(0, 8);
}

export default async function Page({ params }: Props) {
  const hit = await find(params);
  if (!hit) notFound();
  const { video, stores } = hit;
  const store = stores[0];
  const tone = videoTone(video, stores);
  const title = displayTitle(video);
  const du = formatDuration(video.duration);

  // 同じ店 → 同じ駅の順に、重複しないように他の動画を集める
  const shown = new Set<string>();
  const sameStore = others(
    stores.flatMap((s) => getVideosByStore(s.id)),
    video,
    shown,
  );
  sameStore.forEach((v) => shown.add(v.id));
  const stationId = store?.station?.clusterId;
  const sameStation = stationId ? others(getVideosByStation(stationId), video, shown) : [];

  const ld = videoObject(video, { name: title, description: videoDescription(video, store?.name) });

  return (
    <PageFrame
      className="mp-vd-page mp-vd-watchpage"
      tone={{ ...TONE, ...(store ? { color: store.vertical.accent.color, lightColor: store.vertical.accent.lightColor } : {}) }}
      crumbs={[
        { name: "マチノワ", href: "/" },
        { name: "動画で探す", href: "/videos" },
        { name: shortTitle(video, 28), href: `/videos/${video.id}` },
      ]}
      kicker="Machinowa — Video"
      heading={title}
      lead={store ? `${store.name}を紹介するショート動画です。` : "マチノワに掲載しているショート動画です。"}
    >
      <section className="mp-pg-sec mp-vd-watch-sec" aria-label="動画">
        <div className="mp-wrap mp-vd-watch" style={tone.style}>
          <div className="mp-vd-player">
            <VideoFacade video={toFacade(video)} eager />
          </div>
          <div className="mp-vd-info">
            {stores.map((s) => (
              <div className="mp-vd-shop" key={s.id}>
                <p className="mp-kicker">Shop</p>
                <h2>
                  <Link href={s.href} prefetch={false} data-cursor="SHOP">
                    {s.name}
                  </Link>
                </h2>
                <p className="sub">{[s.vertical.name, s.categoryName, s.prefShort, s.area].filter(Boolean).join("・")}</p>
                <p className="mp-note-links">
                  <Link href={s.href} prefetch={false} data-cursor="SHOP">店のページを見る</Link>
                  {s.station && (
                    <Link href={s.station.href} prefetch={false} data-cursor="STATION">
                      最寄りの駅: {s.station.heading}
                    </Link>
                  )}
                </p>
                <ShopLinks links={s.links} storeId={s.id} page={`/videos/${video.id}`} />
              </div>
            ))}
            {stores.length === 0 && <p className="mp-vd-nostore">映っている店の情報は、まだ登録されていません。</p>}
            <dl className="mp-vd-facts">
              {video.uploadDate && (
                <div>
                  <dt>投稿日</dt>
                  <dd>{formatUploadDate(video.uploadDate)}</dd>
                </div>
              )}
              {du && (
                <div>
                  <dt>長さ</dt>
                  <dd>{du}</dd>
                </div>
              )}
              {video.source === "tiktok" && video.tiktokUrl && (
                <div>
                  <dt>出典</dt>
                  <dd>
                    <a href={video.tiktokUrl} target="_blank" rel="noopener noreferrer">
                      TikTok{video.author ? `（${video.author}）` : ""}で見る
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>

      <ShareSection
        path={`/videos/${video.id}`}
        text={`${shortTitle(video, 40)}｜マチノワ`}
        label="この動画を共有"
        storeId={store?.id}
      />

      {sameStore.length > 0 && store && (
        <Block id="mp-vd-store-h" kicker="Same shop" title={`${store.name}の他の動画`}>
          <VideoTiles videos={sameStore} />
        </Block>
      )}
      {sameStation.length > 0 && store?.station && (
        <Block id="mp-vd-station-h" kicker="Same station" title={`${store.station.heading}の他の動画`}>
          <VideoTiles videos={sameStation} />
        </Block>
      )}

      <Block id="mp-vd-more-h" kicker="More" title="ほかの探し方">
        <ul className="mp-chips">
          <li>
            <Link href="/videos" prefetch={false} data-cursor="VIDEO">動画の一覧へ</Link>
          </li>
          {store?.station && (
            <li>
              <Link href={store.station.href} prefetch={false} data-cursor="STATION">
                {store.station.heading}の店を見る
              </Link>
            </li>
          )}
          <li>
            <Link href="/station" prefetch={false} data-cursor="STATION">駅から店を探す</Link>
          </li>
        </ul>
      </Block>

      {ld && <JsonLd data={ld} />}
    </PageFrame>
  );
}
