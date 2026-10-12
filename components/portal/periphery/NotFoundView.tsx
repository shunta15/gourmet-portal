/**
 * 見つからないページ（app/not-found.tsx）の新しい見た目。字・リンク先は app/not-found.tsx の今の版と同じ。
 * ただし、地域・シーンのページを「さがす」へ統合したあと（areaIndexHref・sceneIndexHref が /search）は、行き先が同じボタンが並ぶので、
 * 「地域から探す」「シーンから探す」「検索する」をやめて「さがす」（/search）の 1 つにする（ホームへ・特集から探す・さがす の 3 つ）。統合していないときは今までの 5 つ。
 */
import Link from "next/link";
import { areaIndexHref } from "@/lib/portal/noren/areaLinks";
import { sceneIndexHref } from "@/lib/portal/noren/sceneLinks";
import PeripheryFrame from "./PeripheryFrame";
import { Hero } from "./parts";

const AREA_SCENE_TO_SEARCH = areaIndexHref() === "/search" && sceneIndexHref() === "/search";

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
            {/* 地域・シーンのページを「さがす」へ統合したあと（areaIndexHref・sceneIndexHref が /search）は、行き先が同じボタンが並ぶので「さがす」の 1 つにまとめる */}
            {AREA_SCENE_TO_SEARCH ? (
              <>
                <Link href="/feature" className="pf-btn pf-btn--ghost pf-btn--sm">特集から探す</Link>
                <Link href="/search" className="pf-btn pf-btn--ghost pf-btn--sm">さがす</Link>
              </>
            ) : (
              <>
                <Link href={areaIndexHref()} className="pf-btn pf-btn--ghost pf-btn--sm">地域から探す</Link>
                <Link href={sceneIndexHref()} className="pf-btn pf-btn--ghost pf-btn--sm">シーンから探す</Link>
                <Link href="/feature" className="pf-btn pf-btn--ghost pf-btn--sm">特集から探す</Link>
                <Link href="/search" className="pf-btn pf-btn--ghost pf-btn--sm">検索する</Link>
              </>
            )}
          </div>
        }
      />
    </PeripheryFrame>
  );
}
