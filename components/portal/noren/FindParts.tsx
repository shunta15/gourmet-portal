import Link from "next/link";
import type { CuisineCount, RegionCount, SceneCount } from "@/lib/portal/noren/openSearch";

/**
 * 「さがす」の札の部品（サーバー・クライアントのどちらからも使える。データは持たず、渡された件数をそのまま出す）。
 * 入口の「店を、さがす。」（components/portal/noren/OpenSearch.tsx）と、検索のトップ（components/portal/noren/NorenSearch.tsx）が使う。CSS は opensearch.css。
 * 星・点数・口コミの件数・順位は出さない。
 */

/** 業種からさがす: 7 つの大分類の大きな札（漢字 1 字・名称・件数）。押すと /search?cuisine=… */
export function GenreCards({ cuisines, className = "" }: { cuisines: CuisineCount[]; className?: string }) {
  return (
    <ul className={`vOs-genre ${className}`.trim()} aria-label="業種の分類">
      {cuisines.map((c) => (
        <li key={c.key}>
          <Link href={`/search?cuisine=${encodeURIComponent(c.label)}`} className="vOs-g" data-cursor="GO">
            <b className="vOs-g-k" aria-hidden="true">
              {c.kanji}
            </b>
            <span className="vOs-g-t">
              <span className="vOs-g-n">{c.label}</span>
              <i className="vOs-g-c">
                {c.count}
                <small>軒</small>
              </i>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** エリアからさがす: 地域の札（名称・件数）。押すとその地域のページ /region/<key> */
export function RegionChips({ regions, more }: { regions: RegionCount[]; more?: { href: string; label: string } }) {
  return (
    <ul className="vOs-chips" aria-label="エリア">
      {regions.map((r) => (
        <li key={r.key}>
          <Link href={`/region/${r.key}`} className="vOs-chip" data-cursor="GO">
            <span>{r.name}</span>
            <i>
              {r.count}
              <small>軒</small>
            </i>
          </Link>
        </li>
      ))}
      {more && (
        <li>
          <Link href={more.href} className="vOs-chip vOs-chip--more" data-cursor="GO">
            <span>{more.label}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </li>
      )}
    </ul>
  );
}

/** 利用シーンからさがす: 12 のシーンの札（名称・件数）。押すとそのシーンのページ /scene/<slug> */
export function SceneChips({ scenes }: { scenes: SceneCount[] }) {
  return (
    <ul className="vOs-chips" aria-label="利用シーン">
      {scenes.map((s) => (
        <li key={s.slug}>
          <Link href={`/scene/${s.slug}`} className="vOs-chip" data-cursor="GO">
            <span>{s.name}</span>
            <i>
              {s.count}
              <small>軒</small>
            </i>
          </Link>
        </li>
      ))}
    </ul>
  );
}
