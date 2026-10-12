import Link from "next/link";
import type { CpSite } from "@/lib/portal/colorplay/site";
import type { CpShop } from "@/lib/portal/colorplay/types";
import { shopHref } from "@/lib/portal/colorplay/search";
import { sized } from "@/lib/imageUrl";
import Heart from "@/components/portal/bproto/colorplay/Heart";
import { IconArrow } from "@/components/portal/bproto/colorplay/Icons";

/** 一覧の店のカード: 左に大きな写真(無ければ種類の色面)、右に店名・種類の札・住所・一言・小さな写真 */
export function ShopCard({ site, s, i = 0 }: { site: CpSite; s: CpShop; i?: number }) {
  const href = shopHref(site, s.id);
  return (
    <article className="cp-card" data-sp="e p" style={{ ["--i" as string]: i }}>
      <Link href={href} className="cp-card-photo" aria-label={`${s.name}のページへ`}>
        {s.main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sized(s.main.src, 640)} alt={s.main.alt} loading="lazy" decoding="async" width={s.main.w} height={s.main.h} />
        ) : (
          <span className={`cp-ph k-${s.kind}`} aria-hidden="true">{s.kindName}</span>
        )}
      </Link>
      <div className="cp-card-body">
        <div className="cp-card-top">
          <h3><Link href={href}>{s.name}</Link></h3>
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
                <img src={sized(p.src, 320)} alt={p.alt} loading="lazy" decoding="async" width={p.w} height={p.h} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

/** 店のページ下の小さなカード */
export function MiniCard({ site, s, i = 0 }: { site: CpSite; s: CpShop; i?: number }) {
  return (
    <Link href={shopHref(site, s.id)} className="cp-mini" data-sp="e" style={{ ["--i" as string]: i }}>
      <span className="cp-mini-ph">
        {s.main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sized(s.main.src, 480)} alt={s.main.alt} loading="lazy" decoding="async" width={s.main.w} height={s.main.h} />
        ) : (
          <span className={`cp-ph k-${s.kind}`} aria-hidden="true">{s.kindName}</span>
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
