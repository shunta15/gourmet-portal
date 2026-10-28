import Link from "next/link";
import { VERTICALS, VERTICAL_ORDER } from "@/lib/verticals";
import { AREA_TO_SEARCH, areaIndexHref } from "@/lib/portal/noren/areaLinks";
import { SCENE_TO_SEARCH, sceneIndexHref } from "@/lib/portal/noren/sceneLinks";
import type { VerticalKey } from "@/lib/verticals/types";

const ORDER: VerticalKey[] = VERTICAL_ORDER; // 業種の表示順は lib/verticals/index.ts の VERTICAL_ORDER の 1 か所

/**
 * 総合サイト用フッター（サーバー）。グルメの既存フッター（components/Footer.tsx）とは別物。
 * 総合サイトの各レイアウト（app/{videos,beauty,…}/layout.tsx）と総合トップから出す。
 * リンクは業種・探し方（動画）・グルメを読む。
 * （2026-10-28 旧サイトの 地図・駅・都道府県の街 /map /station /area を消したので、そのリンク・都道府県・駅エリアのブロックも外した）
 */
export default function PortalFooter() {
  return (
    <footer className="mp-ft">
      <div className="mp-wrap">
        <div className="mp-ft-top">
          <div className="mp-ft-col">
            <h2>業種から</h2>
            <ul>
              {ORDER.map((k) => (
                <li key={k} style={{ ["--ac" as string]: VERTICALS[k].accent.color }}>
                  <Link href={VERTICALS[k].path}>
                    <i aria-hidden="true" />
                    {VERTICALS[k].brand}
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="sub">探し方</h2>
            <ul>
              <li><Link href="/videos" prefetch={false}>動画で探す</Link></li>
            </ul>
          </div>
          <div className="mp-ft-col">
            <h2>グルメを読む</h2>
            <ul>
              <li><Link href="/feature">特集</Link></li>
              {/* 地域・シーンのページを「さがす」へ統合したあとは、行き先が「店舗を探す」と同じになるので項目を置かない */}
              {!AREA_TO_SEARCH && <li><Link href={areaIndexHref()}>地域から探す</Link></li>}
              {!SCENE_TO_SEARCH && <li><Link href={sceneIndexHref()}>利用シーンから探す</Link></li>}
              <li><Link href="/search">店舗を探す</Link></li>
            </ul>
          </div>
        </div>

        <p className="mp-ft-mark" aria-hidden="true">
          マチノワ<em>Machinowa</em>
        </p>
        <div className="mp-ft-bot">
          <span>© マチノワ</span>
        </div>
      </div>
    </footer>
  );
}
