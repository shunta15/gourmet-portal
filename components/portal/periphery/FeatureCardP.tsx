/**
 * 特集のキーワード検索 /feature/search・地域別 /feature/region/<key> の札（周りのページの新しい見た目。サーバー・クライアントのどちらからも使える。データは読まない）。
 * 見た目は特集の一覧 /feature（roundup/RoundupListPage.tsx の Card と同じ class）: 写真が主役で、題・副題・地域と札（テーマ）。
 * 字は今の札（components/portal/noren/FeatureList.tsx の FeatureCard）と同じ（番号・テーマ・小見出し・題・副題）に、一覧と同じ「地域」を足した。リンク先は呼び出し側が渡す（featureHrefOf と同じ関数で作った href）。
 */
import Link from "next/link";
import { sized } from "@/lib/imageUrl";
import { Tate } from "../photoFeature/parts";

export type FeatureItemP = {
  id: string;
  href: string;
  /** 使える写真（無ければ空文字。題を縦書きにした札で出る） */
  img: string;
  title: string;
  sub: string;
  /** 地域・テーマ（一覧 /feature の札と同じ作り方） */
  line: string;
  /** 番号・小見出し（今の札にある字） */
  meta: string;
  /** 写真が無いときの縦書きの題の列（サーバーで割ったもの） */
  cols: string[];
  /** 検索用（クライアントの検索がそのまま使う。表示はしない） */
  no: string;
  tag: string;
  kicker: string;
  regions: string[];
};

function Card({ c, eager = false }: { c: FeatureItemP; eager?: boolean }) {
  return (
    <li>
      <Link href={c.href} className="rp-card">
        <span className={`pf-rel__ph${c.img ? "" : " rp-nophoto"}`} aria-hidden="true">
          {c.img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="pf-rel__img" src={sized(c.img, 640)} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
          ) : (
            <Tate cols={c.cols} className="rp-nophoto__t" label={false} />
          )}
        </span>
        <span className="pf-rel__b">
          <b>{c.title}</b>
          {c.sub && <span className="rp-card__s">{c.sub}</span>}
          {c.line && <small>{c.line}</small>}
          {c.meta && <span className="pp-fmeta">{c.meta}</span>}
        </span>
      </Link>
    </li>
  );
}

/** 札を並べる（渡された並びのまま） */
export function FeatureGridP({ items, label }: { items: FeatureItemP[]; label: string }) {
  return (
    <ul className="rp-grid pp-fgrid" aria-label={label}>
      {items.map((c, i) => (
        <Card key={c.id} c={c} eager={i < 4} />
      ))}
    </ul>
  );
}

/** パンくず（見た目だけ。構造化データは出さない: 今の ListHero のパンくずと同じ） */
export function FeatureCrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="pp-crumbs" aria-label="パンくず">
      <ol>
        {items.map((c, i) => (
          <li key={i}>
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
