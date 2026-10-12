/**
 * 地域別の特集記事 /feature/region/<key> の新しい見た目（サーバー）。metadata・並び・件数は app/gourmet/feature/region/[key]/page.tsx のまま。
 * 字は今の見出しと同じ（パンくず・地域の英名 FEATURES・題・小見出し・本数・「一覧へ戻る」・他の地域）。見出しの背景に敷いていた地域の写真は、この世界では敷かない（札の写真が主役）。
 */
import Link from "next/link";
import PeripheryFrame from "./PeripheryFrame";
import { Hero, Sec } from "./parts";
import { FeatureCrumbs, FeatureGridP, type FeatureItemP } from "./FeatureCardP";

export default function FeatureRegionView({
  name,
  nameEn,
  subtitle,
  items,
  others,
  topHref,
}: {
  name: string;
  nameEn: string;
  subtitle: string;
  items: FeatureItemP[];
  others: { key: string; name: string }[];
  topHref: string;
}) {
  return (
    <PeripheryFrame>
      <Hero
        before={<FeatureCrumbs items={[{ label: "トップ", href: topHref }, { label: "特集", href: "/feature" }, { label: name }]} />}
        eyebrow={`${nameEn.toUpperCase()} FEATURES`}
        title={
          <>
            {name}の<em>特集記事</em>。
          </>
        }
        lead={
          <>
            {subtitle}
            <br />
            編集部が選んだ {name} の街・食・カルチャー特集 {items.length} 本。
          </>
        }
        compact
        after={
          <p>
            <Link href="/feature" className="rp-back">← 特集記事 一覧へ戻る</Link>
          </p>
        }
      />
      <section className="rp-shelf pp-fsec" aria-label={`${name}の特集記事`}>
        <FeatureGridP items={items} label={`${name}の特集記事`} />
      </section>
      <Sec id="pp-fr-others" mark="他の地域" title={null} label="他の地域" k={2}>
        <nav className="pp-others" aria-label="他の地域">
          <span className="pp-others__l">他の地域:</span>
          <ul className="pp-chips">
            {others.map((o) => (
              <li key={o.key}>
                <Link href={`/feature/region/${o.key}`}>{o.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </Sec>
    </PeripheryFrame>
  );
}
