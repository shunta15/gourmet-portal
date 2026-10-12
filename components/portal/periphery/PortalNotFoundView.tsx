/**
 * 総合サイトのセグメント内の 404（app/videos/not-found.tsx）の新しい見た目（サーバー）。字・リンク先は components/portal/pages/not-found.tsx と同じ。
 */
import Link from "next/link";
import { VERTICALS } from "@/lib/verticals";
import PeripheryFrame from "./PeripheryFrame";
import { Hero, Sec } from "./parts";

export default function PortalNotFoundView() {
  return (
    <PeripheryFrame scope="portal">
      <Hero
        eyebrow="Machinowa — 404"
        title="ページが見つかりません"
        lead="お探しのページは見つかりませんでした。掲載のない地域・種類や、まだ公開していないページかもしれません。下の入口から探してみてください。"
        compact
      />
      <Sec id="pp-nf-h" mark="業種" title="業種から探す" k={0}>
        <ul className="pp-chips">
          {Object.values(VERTICALS).map((v) => (
            <li key={v.key}>
              <Link href={v.path} prefetch={false}>{v.name}</Link>
            </li>
          ))}
        </ul>
        <div className="pp-acts">
          <Link href="/" prefetch={false} className="pf-btn">総合トップへ</Link>
          <Link href="/station" prefetch={false} className="pf-btn pf-btn--ghost pf-btn--sm">駅から探す</Link>
          <Link href="/map" prefetch={false} className="pf-btn pf-btn--ghost pf-btn--sm">地図で探す</Link>
          <Link href="/search" prefetch={false} className="pf-btn pf-btn--ghost pf-btn--sm">店舗を探す</Link>
        </div>
      </Sec>
    </PeripheryFrame>
  );
}
