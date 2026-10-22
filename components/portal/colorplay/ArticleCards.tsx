import Link from "next/link";
import type { CpSite } from "@/lib/portal/colorplay/site";
import { articleHref, type CpArticleItem } from "@/lib/portal/colorplay/articles";
import { sized } from "@/lib/imageUrl";
import { IconArrow, IconPin } from "@/components/portal/bproto/colorplay/Icons";
import { HERO_TONE } from "./pages/shopModel";
import "./article.css";

/** 種類ごとの色面(店のページの入口の色と同じ。pages/shopModel.tsx の HERO_TONE) */
const toneOf = (kind: string) => HERO_TONE[kind] ?? "red";

/** 記事の一覧の札: 上に写真(無ければ種類の色面)、下に種類の色面で 種類の札・記事の題・店名・所在地・導入の 1 文。札ぜんたいが記事へのリンク */
export function ArticleCard({ site, a, i = 0 }: { site: CpSite; a: CpArticleItem; i?: number }) {
  const s = a.shop;
  return (
    <article className={`art-card t-${toneOf(s.kind)}`} data-sp="e" style={{ ["--i" as string]: i }}>
      <div className="art-card-ph" aria-hidden="true">
        {a.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sized(a.photo.src, 640)} alt="" loading="lazy" decoding="async" width={a.photo.w} height={a.photo.h} />
        ) : (
          <span className={`cp-ph k-${s.kind}`}>{s.kindName}</span>
        )}
      </div>
      <div className="art-card-body">
        <p className="cp-tags">
          <span className={`cp-tag k-${s.kind}`}>{s.kindName}</span>
          {a.featured && <span className="cp-tag art-feat">特集</span>}
        </p>
        <h3><Link href={articleHref(site, a.id)} prefetch={false}>{a.title}</Link></h3>
        <p className="art-shop">{s.name}</p>
        <p className="art-where"><IconPin size={14} /><span>{s.prefName}{s.city ? ` ${s.city}` : ""}</span></p>
        {a.lede && <p className="art-lede">{a.lede}</p>}
        <span className="art-go" aria-hidden="true"><IconArrow size={18} /></span>
      </div>
    </article>
  );
}

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
