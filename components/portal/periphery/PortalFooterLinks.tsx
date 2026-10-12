/**
 * 業種をまたぐページ（動画）のフッターに足す入口（サーバー）。今の総合サイトのフッター（components/portal/PortalFooter.tsx）の「業種から」「探し方」と同じ行き先・同じ字。
 * （都道府県・店の多い駅エリアの長い一覧は、総合サイトの各ページ・フッターにそのまま残る。ここには持たない。）
 */
import Link from "next/link";
import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";

const ORDER: VerticalKey[] = ["gourmet", "beauty", "bodycare", "pet", "leisure", "stay"];

export default function PortalFooterLinks() {
  return (
    <>
      <nav aria-label="業種から">
        <h2>業種から</h2>
        <ul>
          {ORDER.map((k) => (
            <li key={k}>
              <Link href={VERTICALS[k].path}>{VERTICALS[k].brand}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-label="探し方">
        <h2>探し方</h2>
        <ul>
          <li><Link href="/map" prefetch={false}>地図で探す</Link></li>
          <li><Link href="/station" prefetch={false}>駅から探す</Link></li>
          <li><Link href="/videos" prefetch={false}>動画で探す</Link></li>
        </ul>
      </nav>
    </>
  );
}
