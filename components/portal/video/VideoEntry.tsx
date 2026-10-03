import Link from "next/link";
import type { Video } from "@/lib/videos/types";
import VideoTiles from "./VideoTiles";

/**
 * 総合トップの「動画で探す」入口（サーバー）。動画があるときだけ呼ぶ。
 * 本数は実データ（lib/videos）の件数。
 */
export default function VideoEntry({ items, total }: { items: Video[]; total: number }) {
  if (items.length === 0) return null;
  return (
    <section id="video" className="mp-sec mp-vd-entry" aria-labelledby="mp-vd-h">
      <div className="mp-wrap">
        <header className="mp-sec-head row" data-reveal>
          <div>
            <p className="mp-kicker">Video</p>
            <h2 id="mp-vd-h" className="mp-h2">動画で探す</h2>
            <p className="mp-lead">
              店を紹介する縦型のショート動画。タップで再生して、気になった店のページへ進めます。いまは{total}本を掲載しています。
            </p>
          </div>
          <Link href="/videos" className="mp-more" data-cursor="VIDEO">
            動画の一覧を見る <span aria-hidden="true">→</span>
          </Link>
        </header>
        <VideoTiles videos={items} />
      </div>
    </section>
  );
}
