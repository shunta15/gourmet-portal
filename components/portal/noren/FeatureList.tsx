import Link from "next/link";
import type { ReactNode } from "react";
import "@/app/proto-noren/feature.css";
import "./featlist.css";
import { sized, sizedSrcSet, CARD_SIZES } from "@/lib/imageUrl";
import { GOURMET_TOP } from "@/lib/portal/noren/nav";
import { featureHrefOf } from "@/lib/portal/noren/onePage";
import { clothChars, clothFs, splitTitle, type FeatureCardItem } from "@/lib/portal/noren/featureCard";
import { nameCore } from "@/lib/portal/noren/shop";

// 暖簾の特集記事のトップ（/feature・/feature/region/<key>・/feature/search）の部品。サーバー・クライアントのどちらからも使える（データは読まない）。
// 見た目は暖簾の特集ページ・/gourmet と同じ文法（布・竿・紙・書体・カードの形）。CSS は featlist.css（vI-）と、特集ページの feature.css（布の変数・パンくず・見出し）。

/** 特集のカード 1 枚。特集ページの「関連」（vH-ac）と同じ、竿に掛かった暖簾が写真を隠し、触れると上がる。下に、題名・副題 */
export function FeatureCard({ f, eager = false }: { f: FeatureCardItem; eager?: boolean }) {
  const [main] = splitTitle(f.title);
  return (
    <Link href={featureHrefOf(f.id)} className="vI-card" data-cursor="READ">
      <span className={`vI-vis${f.img ? "" : " is-nophoto"}`}>
        <span className="vH-ac-ph">
          {f.img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sized(f.img, 640)} srcSet={sizedSrcSet(f.img)} sizes={CARD_SIZES} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
          )}
        </span>
        <span className="vH-ac-rod" aria-hidden="true" />
        <span className="vH-ac-cloth" aria-hidden="true">
          <b style={{ ["--fs" as string]: `${clothFs(main)}px` }}>{main}</b>
          <i className="vN-seal">輪</i>
        </span>
        <span className="vH-ac-go" aria-hidden="true">記事を読む →</span>
      </span>
      <span className="vI-cap">
        <span className="vI-meta">
          <span className="vI-no">{f.no}</span>
          <span className="vI-tag">{f.tag}</span>
        </span>
        {f.kicker && <span className="vI-kk">{f.kicker}</span>}
        <span className="vI-ti">{f.title}</span>
        {f.sub && <span className="vI-sb">{f.sub}</span>}
      </span>
    </Link>
  );
}

/** カードを並べる。500 本を超えても重くならないよう、写真は遅延読み込み（最初の数枚だけ即時） */
export function CardGrid({ items, label }: { items: FeatureCardItem[]; label: string }) {
  return (
    <ul className="vI-grid" aria-label={label}>
      {items.map((f, i) => (
        <li key={f.id}>
          <FeatureCard f={f} eager={i < 4} />
        </li>
      ))}
    </ul>
  );
}

/** 店 1 軒の記事（特集記事）の札のデータ。lib/portal/noren/featureList.ts の ShopFeatureCardItem と同じ形（こちらはクライアントからも読めるよう、型だけここに持つ） */
export type ShopFeatureCardData = { id: string; img: string; shopName: string; area: string; cuisine: string; title: string };

/** 特集記事（店 1 軒）の札 1 枚。写真の暖簾は店名（触れると上がる）。下に、地域・業種・店名・記事の題。行き先は /feature/<ID> */
export function ShopFeatureCard({ f, eager = false }: { f: ShopFeatureCardData; eager?: boolean }) {
  const main = Array.from(nameCore(f.shopName)).slice(0, 12).join("");
  return (
    <Link href={featureHrefOf(f.id)} className="vI-card" data-cursor="READ">
      <span className={`vI-vis${f.img ? "" : " is-nophoto"}`}>
        <span className="vH-ac-ph">
          {f.img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sized(f.img, 640)} srcSet={sizedSrcSet(f.img)} sizes={CARD_SIZES} alt={`${f.shopName} の写真`} loading={eager ? "eager" : "lazy"} decoding="async" />
          )}
        </span>
        <span className="vH-ac-rod" aria-hidden="true" />
        <span className="vH-ac-cloth" aria-hidden="true">
          <b style={{ ["--fs" as string]: `${clothFs(main)}px` }}>{main}</b>
          <i className="vN-seal">輪</i>
        </span>
        <span className="vH-ac-go" aria-hidden="true">記事を読む →</span>
      </span>
      <span className="vI-cap">
        <span className="vI-meta">
          {f.area && <span className="vI-no">{f.area}</span>}
          {f.cuisine && <span className="vI-tag">{f.cuisine}</span>}
        </span>
        <span className="vI-sn">{f.shopName}</span>
        <span className="vI-sb vI-sb--3">{f.title}</span>
      </span>
    </Link>
  );
}

/** 特集記事の札を並べる（渡された並びのまま） */
export function ShopFeatureGrid({ items, label }: { items: ShopFeatureCardData[]; label: string }) {
  return (
    <ul className="vI-grid" aria-label={label}>
      {items.map((f, i) => (
        <li key={f.id}>
          <ShopFeatureCard f={f} eager={i < 4} />
        </li>
      ))}
    </ul>
  );
}

export type Crumb = { label: string; href?: string };

/**
 * 見出しの区画（暖簾の見出し）。竿の下に、題と書き出し。右に、竿に掛かった暖簾（cloth の字を 1 字ずつ染める）。
 * photo があれば（地域別）、背景に暗く敷く。cloth が空なら暖簾は出さない。
 */
export function ListHero({
  crumbs,
  eyebrow,
  eyebrowEn,
  cloth,
  photo,
  compact = false,
  children,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  eyebrowEn?: string;
  cloth: string;
  photo?: string;
  compact?: boolean;
  children: ReactNode;
}) {
  const chars = clothChars(cloth);
  return (
    <section className={`vI-hero${compact ? " is-compact" : ""}${photo ? " has-photo" : ""}`} aria-labelledby="vI-h1">
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
        {chars.length > 0 && (
          <ol className="vI-noren" aria-hidden="true" style={{ ["--n" as string]: chars.length }}>
            {chars.map((c, i) => (
              <li key={i} style={{ ["--d" as string]: i }}>
                <b>{c}</b>
                {i === chars.length - 1 && <i className="vN-seal">輪</i>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

export const TOP_CRUMB: Crumb = { label: "トップ", href: GOURMET_TOP };
