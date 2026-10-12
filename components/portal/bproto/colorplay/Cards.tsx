import Link from "next/link";
import { BASE, type CpShop } from "@/lib/portal/bproto/colorplay/types";
import Heart from "./Heart";
import { IconArrow } from "./Icons";

export const shopHref = (id: string) => `${BASE}/shop?id=${id}`;

/** 一覧の店のカード: 左に大きな写真、右に店名・種類の札・住所・一言・小さな写真 */
export function ShopCard({ s, i = 0 }: { s: CpShop; i?: number }) {
  return (
    <article className="cp-card" data-sp="e p" style={{ ["--i" as string]: i }}>
      <Link href={shopHref(s.id)} className="cp-card-photo" aria-label={`${s.name}のページへ`}>
        {s.main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.main.src} alt={s.main.alt} loading="lazy" decoding="async" />
        ) : (
          <span className={`cp-ph k-${s.kind}`}>{s.kindName}</span>
        )}
      </Link>
      <div className="cp-card-body">
        <div className="cp-card-top">
          <h3><Link href={shopHref(s.id)}>{s.name}</Link></h3>
          <Heart id={s.id} name={s.name} />
        </div>
        <p className="cp-tags"><span className={`cp-tag k-${s.kind}`}>{s.kindName}</span></p>
        <p className="cp-addr"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.500-6.100-6.500-11a6.500 6.500 0 0113 0c0 4.900-6.500 11-6.500 11z" fill="currentColor" /></svg>{s.address}</p>
        {s.blurb && <p className="cp-blurb">{s.blurb}</p>}
        {s.subs.length > 0 && (
          <ul className="cp-subs">
            {s.subs.map((p) => (
              <li key={p.src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

/** 店のページ下の小さなカード */
export function MiniCard({ s, i = 0 }: { s: CpShop; i?: number }) {
  return (
    <Link href={shopHref(s.id)} className="cp-mini" data-sp="e" style={{ ["--i" as string]: i }}>
      <span className="cp-mini-ph">
        {s.main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.main.src} alt={s.main.alt} loading="lazy" decoding="async" />
        ) : (
          <span className={`cp-ph k-${s.kind}`}>{s.kindName}</span>
        )}
      </span>
      <span className="cp-mini-t">
        <span className={`cp-tag k-${s.kind}`}>{s.kindName}</span>
        <strong>{s.name}</strong>
        <small>{s.prefName}{s.city ? ` ${s.city}` : ""}</small>
      </span>
      <span className="cp-mini-go" aria-hidden="true"><IconArrow size={16} /></span>
    </Link>
  );
}
