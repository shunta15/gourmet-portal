import Link from "next/link";
import type { CSSProperties } from "react";
import type { GreenShop } from "@/lib/portal/vert/bodygreen/types";
import { shopHref } from "./site";
import "./shopcard.css";

/**
 * 店の写真(0〜1 枚)。写真が無い店(7 店)は「種類の色の面+店名」にする。
 * ShopCard のほか、探すの横長カード・店ページの「あわせて読む」でも使える。大きさは親が決める(width:100% で親の枠を埋める)。
 */
export function ShopPhoto({ shop, eager = false, sizes }: { shop: GreenShop; eager?: boolean; sizes?: string }) {
  const p = shop.photo;
  if (p) {
    return (
      <span className="gr-sph gr-zoom">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} decoding="async" sizes={sizes} />
      </span>
    );
  }
  return (
    <span className={`gr-sph gr-sph-no${shop.kindDark ? " is-dark" : ""}`} style={{ ["--kc" as string]: shop.kindColor } as CSSProperties} role="img" aria-label={`${shop.name}(写真なし)`}>
      <span className="gr-sph-n">{shop.name}</span>
      <span className="gr-sph-k">{shop.kindName}</span>
    </span>
  );
}

/**
 * 店のカード(縦組み)。写真(0〜1 枚)・店名(2 行まで)・県と市区町村・種類・こだわりタグ(0〜3)・営業時間の 1 行目。
 * 星・点数・口コミ・料金・「おすすめ」は出さない(データに無い)。カード全体が店ページ(/bodycare/shop/<id>)へのリンク。
 * 見出しの階層は as で決める(既定 h3)。
 */
export default function ShopCard({ shop, eager = false, hours = true, as: H = "h3" }: { shop: GreenShop; eager?: boolean; hours?: boolean; as?: "h2" | "h3" | "h4" }) {
  return (
    <article className="gr-sc gr-lift gr-hov">
      <ShopPhoto shop={shop} eager={eager} sizes="(min-width: 900px) 260px, 50vw" />
      <div className="gr-sc-b">
        <H className="gr-sc-n">
          <Link href={shopHref(shop.id)} className="gr-sc-a">
            {shop.name}
          </Link>
        </H>
        <p className="gr-sc-ar">
          <svg viewBox="4 1 16 22" width="10" height="14" aria-hidden="true">
            <path d="M12 22.5s-7.2-6.3-7.2-12A7.2 7.2 0 0 1 19.2 10.5c0 5.7-7.2 12-7.2 12z" fill="#2f7a4d" />
            <circle cx="12" cy="10.2" r="2.7" fill="#fff" />
          </svg>
          <span>{shop.area}</span>
        </p>
        <ul className="gr-sc-tg">
          <li className="gr-sc-kind">{shop.kindName}</li>
          {shop.tags.slice(0, 3).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {hours && shop.hours && (
          <p className="gr-sc-hr">
            <b>営業時間</b>
            <span>
              {shop.hours}
              {shop.hoursMore ? " ほか" : ""}
            </span>
          </p>
        )}
      </div>
    </article>
  );
}
