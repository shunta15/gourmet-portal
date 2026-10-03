/**
 * 総合サイトの 404 ページ（サーバー）。各セグメント（app/{beauty,bodycare,pet,leisure,stay,area,station,videos}/not-found.tsx）から出す。
 *
 * 総合サイトのページ（例: /beauty/nosuch・/area/nosuch）が notFound() を呼ぶと、ルートの app/not-found.tsx（グルメの見た目）が
 * セグメントのレイアウトの外側で出てしまい、総合サイトの CSS（portal.css）もフッターも付かなかった。
 * セグメントごとに not-found を置くと、レイアウト（CSS・フッター）の内側で出る。ステータスは 404 のまま。
 */
import Link from "next/link";
import { VERTICALS } from "@/lib/verticals";
import { VERTICAL_FACE } from "@/lib/portal/meta";
import { Block, PageFrame, type Tone } from "./frame";

const NEUTRAL: Tone = { color: "#15110e", lightColor: "#e7dfd0", glyph: "迷" };

export default function PortalNotFound() {
  return (
    <PageFrame
      tone={NEUTRAL}
      crumbs={[{ name: "マチノワ", href: "/" }]}
      kicker="Machinowa — 404"
      heading="ページが見つかりません"
      lead="お探しのページは見つかりませんでした。掲載のない地域・種類や、まだ公開していないページかもしれません。下の入口から探してみてください。"
    >
      <Block id="mp-nf-h" kicker="Entrances" title="業種から探す">
        <ul className="mp-chips">
          {Object.values(VERTICALS).map((v) => (
            <li key={v.key}>
              <Link href={v.path} prefetch={false} data-cursor={VERTICAL_FACE[v.key].en.toUpperCase()}>{v.name}</Link>
            </li>
          ))}
        </ul>
        <p className="mp-note-links">
          <Link href="/" prefetch={false}>総合トップへ</Link>
          <Link href="/station" prefetch={false}>駅から探す</Link>
          <Link href="/map" prefetch={false}>地図で探す</Link>
          <Link href="/search" prefetch={false}>店舗を探す</Link>
        </p>
      </Block>
    </PageFrame>
  );
}
