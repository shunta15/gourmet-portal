/**
 * 動画の一覧 /videos の新しい見た目（サーバー）。データ・絞り込み・メタ情報・構造化データは components/portal/pages/videos.tsx のまま。
 * 字・リンク先は今のページと同じ（絞り込みの行・件数・札・「ほかの探し方」）。
 */
import Link from "next/link";
import type { Video } from "@/lib/videos/types";
import type { VideoStore } from "@/lib/videos/stores";
import Breadcrumbs from "../Breadcrumbs";
import PeripheryFrame from "./PeripheryFrame";
import { Hero, Sec } from "./parts";
import { VideoCardP } from "./VideoParts";

export type VideoFilterLink = { key: string; name: string; count: number | undefined; href: string; current: boolean };

export default function VideosView({
  shown,
  verticalLinks,
  verticalAllHref,
  verticalAllCurrent,
  prefLinks,
  prefAllHref,
  prefAllCurrent,
  filtered,
  curLabel,
  curPrefShort,
  curRegionHref,
}: {
  shown: { video: Video; stores: VideoStore[] }[];
  verticalLinks: VideoFilterLink[];
  verticalAllHref: string;
  verticalAllCurrent: boolean;
  prefLinks: VideoFilterLink[];
  prefAllHref: string;
  prefAllCurrent: boolean;
  filtered: boolean;
  curLabel: string;
  curPrefShort: string | null;
  /** 絞り込み中の県の店を探す行き先（グルメの「さがす」。/search?region=…）。県が無い・対応が無いときは null */
  curRegionHref: string | null;
}) {
  const hasFilters = verticalLinks.length > 0 || prefLinks.length > 0;
  return (
    <PeripheryFrame>
      <Hero
        before={
          <Breadcrumbs
            className="pp-crumbs"
            items={[
              { name: "マチノワ", href: "/" },
              { name: "動画で探す", href: "/videos" },
            ]}
          />
        }
        eyebrow="Machinowa — Video"
        title="動画で探す"
        lead="店を紹介する縦型のショート動画です。タップで再生して、気になった店のページや、最寄りの駅の周辺へ進めます。"
        after={
          <>
            <p className="pp-state">
              <span className="pp-state__s">{shown.length > 0 ? "掲載中" : "掲載準備中"}</span>
              <span className="pp-state__c">
                <b>{shown.length}</b>本
              </span>
            </p>
            {hasFilters && (
              <nav className="pp-filters" aria-label="動画の絞り込み">
                {verticalLinks.length > 0 && (
                  <div className="rp-fl">
                    <h2>業種</h2>
                    <ul className="rp-tiles">
                      <li>
                        <Link href={verticalAllHref} prefetch={false} className="pp-chip" aria-current={verticalAllCurrent ? "true" : undefined}>
                          すべて
                        </Link>
                      </li>
                      {verticalLinks.map((l) => (
                        <li key={l.key}>
                          <Link href={l.href} prefetch={false} className="pp-chip" aria-current={l.current ? "true" : undefined}>
                            {l.name}
                            <small>{l.count}</small>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {prefLinks.length > 0 && (
                  <div className="rp-fl">
                    <h2>都道府県</h2>
                    <ul className="rp-tiles">
                      <li>
                        <Link href={prefAllHref} prefetch={false} className="pp-chip" aria-current={prefAllCurrent ? "true" : undefined}>
                          すべて
                        </Link>
                      </li>
                      {prefLinks.map((l) => (
                        <li key={l.key}>
                          <Link href={l.href} prefetch={false} className="pp-chip" aria-current={l.current ? "true" : undefined}>
                            {l.name}
                            <small>{l.count}</small>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </nav>
            )}
          </>
        }
      />

      {shown.length > 0 ? (
        <section className="rp-shelf" aria-label="動画の一覧" style={{ paddingTop: "clamp(24px, 3vw, 44px)" }}>
          <ul className="pp-vd">
            {shown.map((r, i) => (
              <li key={r.video.id}>
                <VideoCardP video={r.video} stores={r.stores} eager={i < 2} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <Sec id="pp-vd-empty-h" mark={filtered ? "動画" : "掲載準備"} title={filtered ? "該当する動画がありません" : "掲載準備中です"} k={0}>
          <div className="pp-empty">
            <p className="pp-lead2">
              {filtered
                ? `${curLabel}の動画はまだありません。条件を外すと、ほかの動画が見つかります。`
                : "動画は準備ができ次第、ここに掲載します。"}
            </p>
            <p className="pp-chips">
              {filtered && <Link href="/videos">すべての動画を見る</Link>}
              <Link href="/search">さがす</Link>
              <Link href="/gourmet">グルメを探す</Link>
            </p>
          </div>
        </Sec>
      )}

      {shown.length > 0 && (
        <Sec id="pp-vd-more-h" mark="探し方" title="ほかの探し方" k={1}>
          <ul className="pp-chips">
            <li>
              <Link href="/search" prefetch={false}>さがす</Link>
            </li>
            {curRegionHref && (
              <li>
                <Link href={curRegionHref} prefetch={false}>
                  {curPrefShort}の店を探す
                </Link>
              </li>
            )}
            <li>
              <Link href="/gourmet" prefetch={false} data-cursor="GOURMET">グルメを探す</Link>
            </li>
          </ul>
        </Sec>
      )}
    </PeripheryFrame>
  );
}
