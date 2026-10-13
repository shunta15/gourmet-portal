/**
 * 動画のページ /videos/<id> の新しい見た目（サーバー）。データ・メタ情報・VideoObject は components/portal/pages/video-watch.tsx のまま。
 * 字・リンク先は今のページと同じ（題・店・最寄りの駅・店のリンク・投稿日・長さ・出典・共有・同じ店／同じ駅の他の動画・ほかの探し方）。
 */
import Link from "next/link";
import type { Video } from "@/lib/videos/types";
import type { VideoStore } from "@/lib/videos/stores";
import { formatUploadDate } from "@/lib/videos/display";
import { shareTarget } from "@/lib/portal/share";
import Breadcrumbs, { type Crumb } from "../Breadcrumbs";
import JsonLd from "../JsonLd";
import ShareButtons from "../ShareButtons";
import ShopLinks from "../ShopLinks";
import VideoFacade from "@/components/portal/video/VideoFacade";
import { toFacade } from "@/components/portal/video/facade";
import PeripheryFrame from "./PeripheryFrame";
import { Hero, Sec } from "./parts";
import { VideoTilesP } from "./VideoParts";

export default function VideoWatchView({
  video,
  stores,
  title,
  lead,
  crumbs,
  duration,
  shareText,
  sameStore,
  sameStation,
  ld,
}: {
  video: Video;
  stores: VideoStore[];
  title: string;
  lead: string;
  crumbs: Crumb[];
  /** "0:34" のような長さ（無ければ null） */
  duration: string | null;
  shareText: string;
  sameStore: Video[];
  sameStation: Video[];
  ld: Record<string, unknown> | null;
}) {
  const store = stores[0];
  const path = `/videos/${video.id}`;
  return (
    <PeripheryFrame>
      <Hero
        before={<Breadcrumbs className="pp-crumbs" items={crumbs} />}
        eyebrow="Machinowa — Video"
        title={title}
        h1Class={title.length > 18 ? "pp-hero-h1--long" : ""}
        lead={lead}
        compact
      />

      <section className="rp-shelf" aria-label="動画" style={{ paddingTop: "clamp(20px, 2.6vw, 36px)" }}>
        <div className="pp-watch">
          <div className="pp-player">
            <VideoFacade video={toFacade(video)} eager />
          </div>
          <div className="pp-info">
            {stores.map((s) => (
              <div className="pp-shop" key={s.id}>
                <p className="pp-shop__k">Shop</p>
                <h2>
                  <Link href={s.href} prefetch={false} data-cursor="SHOP">
                    {s.name}
                  </Link>
                </h2>
                <p className="pp-shop__sub">{[s.vertical.name, s.categoryName, s.prefShort, s.area].filter(Boolean).join("・")}</p>
                <p className="pp-links">
                  <Link href={s.href} prefetch={false} data-cursor="SHOP">店のページを見る</Link>
                  {/* 駅のページ（/station）は総合サイトの前の見た目のページなので、リンクにしない（駅名だけ出す） */}
                  {s.station && <span>最寄りの駅: {s.station.heading}</span>}
                </p>
                <div className="pp-shoplinks">
                  <ShopLinks links={s.links} storeId={s.id} page={path} variant="gourmet" />
                </div>
              </div>
            ))}
            {stores.length === 0 && <p className="pp-nostore">映っている店の情報は、まだ登録されていません。</p>}
            <dl className="pp-facts">
              {video.uploadDate && (
                <div>
                  <dt>投稿日</dt>
                  <dd>{formatUploadDate(video.uploadDate)}</dd>
                </div>
              )}
              {duration && (
                <div>
                  <dt>長さ</dt>
                  <dd>{duration}</dd>
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

      <section className="rp-shelf pp-share" aria-label="共有" style={{ paddingTop: "clamp(8px, 2vw, 24px)" }}>
        <ShareButtons url={shareTarget(path)} text={shareText} page={path} storeId={store?.id} label="この動画を共有" variant="gourmet" />
      </section>

      {sameStore.length > 0 && store && (
        <Sec id="pp-vd-store-h" mark="他の動画" title={`${store.name}の他の動画`} k={0}>
          <VideoTilesP videos={sameStore} />
        </Sec>
      )}
      {sameStation.length > 0 && store?.station && (
        <Sec id="pp-vd-station-h" mark="他の動画" title={`${store.station.heading}の他の動画`} k={2}>
          <VideoTilesP videos={sameStation} />
        </Sec>
      )}

      <Sec id="pp-vd-more-h" mark="探し方" title="ほかの探し方" k={1}>
        <ul className="pp-chips">
          <li>
            <Link href="/videos" prefetch={false} data-cursor="VIDEO">動画の一覧へ</Link>
          </li>
          <li>
            <Link href="/search" prefetch={false}>さがす</Link>
          </li>
        </ul>
      </Sec>

      {ld && <JsonLd data={ld} />}
    </PeripheryFrame>
  );
}
