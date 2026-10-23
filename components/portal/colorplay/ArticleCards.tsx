import Link from "next/link";
import type { CpSite } from "@/lib/portal/colorplay/site";
import { articleHref, type CpArticleItem } from "@/lib/portal/colorplay/articles";
import { sized } from "@/lib/imageUrl";
import { IconArrow } from "@/components/portal/bproto/colorplay/Icons";
import "./article.css";

/** 記事のページの下の小さな札(店のページ下の MiniCard と同じ作り。リンク先は記事) */
export function ArticleMini({ site, a, i = 0 }: { site: CpSite; a: CpArticleItem; i?: number }) {
  const s = a.shop;
  return (
    <Link href={articleHref(site, a.id)} prefetch={false} className="cp-mini" data-sp="e" style={{ ["--i" as string]: i }}>
      <span className="cp-mini-ph">
        {a.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sized(a.photo.src, 480)} alt="" loading="lazy" decoding="async" width={a.photo.w} height={a.photo.h} />
        ) : (
          <span className={`cp-ph k-${s.kind}`} aria-hidden="true">{s.kindName}</span>
        )}
      </span>
      <span className="cp-mini-t art-mini-t">
        <span className={`cp-tag k-${s.kind}`}>{s.kindName}</span>
        <strong>{a.title}</strong>
        <small>{s.name}</small>
      </span>
      <span className="cp-mini-go" aria-hidden="true"><IconArrow size={16} /></span>
    </Link>
  );
}
