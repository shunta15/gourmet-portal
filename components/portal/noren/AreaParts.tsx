import Link from "next/link";
import type { ReactNode } from "react";
import "@/app/proto-noren/feature.css";
import "./featlist.css";
import "./area.css";
import LeafletMap from "@/components/LeafletMap";
import { sized } from "@/lib/imageUrl";
import { flagFs, type AreaShop } from "@/lib/portal/noren/area";
import { nameLayout } from "@/lib/portal/noren/shop";
import type { Crumb } from "./FeatureList";

// 暖簾のエリアのページ（/region・/region/<key>・/region/<key>/<街>）の部品。サーバーコンポーネント（データは読まない。各ページから渡す）。
// 見た目は暖簾の文法（竿・布・生成りの紙・朱の印・明朝）。CSS は area.css（vR-）と、特集のトップの featlist.css（vI-）・特集ページの feature.css（布の変数・パンくず・見出し）。

/** のぼり（見出しの右）。トップの「街から」ののぼりと同じ作り: 朱の帯・布に透ける写真・縦書きの名前・軒数。幅と長さは軒数の平方根に比例（呼ぶ側が決める） */
export type FlagSpec = { name: string; count: number; w: number; h: number; img?: string };

export function Flag({ f }: { f: FlagSpec }) {
  return (
    <div
      className={`vR-flag${f.img ? "" : " is-nophoto"}`}
      aria-hidden="true"
      style={{ ["--w" as string]: `${f.w}px`, ["--h" as string]: `${f.h}px`, ["--fs" as string]: `${flagFs(f.name)}px` }}
    >
      <i className="bar" />
      {f.img && (
        <span className="ph">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sized(f.img, 640)} alt="" decoding="async" />
        </span>
      )}
      <span className="wv" />
      <b>{f.name}</b>
      <span className="c">
        <em>{f.count}</em>軒
      </span>
    </div>
  );
}

/**
 * 見出しの区画（暖簾の見出し）。竿の下に、パンくず・題・書き出し。右に、のぼり。
 * photo があれば、背景に暗く敷く（ListHero と同じ）。children に h1（id="vI-h1"）と書き出しを入れる。
 */
export function AreaHero({
  crumbs,
  eyebrow,
  eyebrowEn,
  photo,
  flag,
  children,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  eyebrowEn?: string;
  photo?: string;
  flag?: FlagSpec;
  children: ReactNode;
}) {
  return (
    <section className={`vI-hero is-compact vR-hero${photo ? " has-photo" : ""}`} aria-labelledby="vI-h1">
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="vI-hero-img" src={sized(photo, 1600)} alt="" decoding="async" />
      )}
      <div className="vI-hero-sh" aria-hidden="true" />
      <div className="vI-hero-rod" aria-hidden="true" />
      <div className="vI-hero-in">
        <div className="vI-hero-tx">
          <nav className="vF-crumbs" aria-label="パンくず">
            <ol>
              {crumbs.map((c, i) => (
                <li key={i}>
                  {c.href ? (
                    <Link href={c.href} data-cursor="BACK">{c.label}</Link>
                  ) : (
                    <span aria-current="page">{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <p className="vN-eyebrow vI-eye">
            <b>{eyebrow}</b>
            {eyebrowEn && <em>{eyebrowEn}</em>}
          </p>
          {children}
        </div>
        {flag && <Flag f={flag} />}
      </div>
    </section>
  );
}

/** 区画の見出し。題（最後の語を朱に）・書き出し・右の添え物（件数や「すべて見る」） */
export function SecHead({ id, title, em, sub, aside }: { id: string; title: ReactNode; em: string; sub?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="vI-sh vN-rv">
      <div>
        <h2 id={id} className="vF-h2d">
          {title}
          <em>{em}</em>
        </h2>
        {sub && <p>{sub}</p>}
      </div>
      {aside}
    </div>
  );
}

/** 店のカード 1 枚。店ページの「同じ地域の他の店」と同じ形（縦書きの店名・上端の朱の帯・3:4）。写真が無い・使えないときは、布だけ（空の枠・壊れた画像は出さない） */
export function ShopCard({ s, eager = false }: { s: AreaShop; eager?: boolean }) {
  // 長い店名は、縦書きが何列にも割れて写真を覆わないよう、列数に応じて字を小さくする（店ページの nameLayout と同じ見積もり）
  const cols = nameLayout(s.name).cols;
  const k = cols === 1 ? 1 : cols === 2 ? 0.84 : 0.72;
  return (
    <Link href={`/restaurant/${s.id}`} className="vR-mc" data-cursor="VIEW">
      <span className={`vR-mc-im${s.img ? "" : " is-nophoto"}`}>
        {s.img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sized(s.img, 640)} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
        )}
        <span className="vR-mc-nm" style={k === 1 ? undefined : { ["--k" as string]: k }}>{s.name}</span>
        {!s.img && <i className="vN-seal" aria-hidden="true">輪</i>}
      </span>
      <span className="vR-mc-ms">
        <span>
          {s.no} · {s.area}
        </span>
        <em>{s.cuisine}</em>
      </span>
    </Link>
  );
}

/** 店のカードを並べる。数が多くても重くならないよう、写真は遅延読み込み（最初の数枚だけ即時） */
export function ShopGrid({ items, label }: { items: AreaShop[]; label: string }) {
  return (
    <ul className="vR-grid" aria-label={label}>
      {items.map((s, i) => (
        <li key={s.id} className="vN-rv">
          <ShopCard s={s} eager={i < 4} />
        </li>
      ))}
    </ul>
  );
}

/** 地図（今の LeafletMap をそのまま使う）。店ページと同じ、紙の枠の中に置く */
export function MapFrame({ points, height = 460 }: { points: { id: string; name: string; lat: number; lng: number; href?: string; sub?: string }[]; height?: number }) {
  return (
    <div className="vR-mapfr vN-rv">
      <LeafletMap points={points} height={height} />
    </div>
  );
}

/** 地域の札（エリア一覧・他の地域）。英名・名前・軒数・ひとこと */
export function AreaTile({
  href,
  en,
  name,
  count,
  tagline,
  tone,
}: {
  href: string;
  en: string;
  name: string;
  count?: number;
  tagline?: string;
  tone: "paper" | "cloth";
}) {
  return (
    <Link href={href} className={`vI-tile vI-tile--${tone}`} data-cursor="READ">
      <span className="en">{en}</span>
      <span className="nm">{name}</span>
      {count !== undefined && <span className="ct">{count}軒</span>}
      {tagline && <span className="tg">{tagline}</span>}
    </Link>
  );
}
