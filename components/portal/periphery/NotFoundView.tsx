/**
 * 見つからないページ（app/not-found.tsx）の新しい見た目（サーバー）。字・リンク先は app/not-found.tsx の今の版と同じ。
 * 地域・シーンへの行き先は areaLinks.ts・sceneLinks.ts（/search?region= / ?scene= を指す形）を通す。
 */
import Link from "next/link";
import { areaIndexHref } from "@/lib/portal/noren/areaLinks";
import { sceneIndexHref } from "@/lib/portal/noren/sceneLinks";
import PeripheryFrame from "./PeripheryFrame";
import { Hero } from "./parts";

export default function NotFoundView() {
  return (
    <PeripheryFrame>
      <Hero
        eyebrow="◎ エラー"
        title="ページが見つかりません。"
        lead={
          <>
            申し訳ございません。お探しのページは削除されたか、
            URLが間違っている可能性があります。
          </>
        }
        compact
        h1Class="pp-hero-h1--msg"
        after={
          <div className="pp-acts">
            <Link href="/" className="pf-btn">ホームへ</Link>
            <Link href={areaIndexHref()} className="pf-btn pf-btn--ghost pf-btn--sm">地域から探す</Link>
            <Link href={sceneIndexHref()} className="pf-btn pf-btn--ghost pf-btn--sm">シーンから探す</Link>
            <Link href="/feature" className="pf-btn pf-btn--ghost pf-btn--sm">特集から探す</Link>
            <Link href="/search" className="pf-btn pf-btn--ghost pf-btn--sm">検索する</Link>
          </div>
        }
      />
    </PeripheryFrame>
  );
}
