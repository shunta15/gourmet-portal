import type { ReactNode } from "react";
import Link from "next/link";
import { MaskLines, Write, ScrollSpyTabs } from "../common/Motion";
import { BASE, SEARCH_HREF, SHOP_HREF } from "../common/site";
import TocLinks from "./TocLinks";
import { Arrow, Leaf } from "./parts";
import "./article.css";

export type Kind = "feature" | "scene" | "guide";

export type ArticleProps = {
  kind: Kind;
  crumbs: Array<{ label: string; href?: string }>;
  chip: ReactNode;
  title: string[]; // 大見出し(1 行ずつ)
  sub?: string; // 見出しの下の一言
  note: string[]; // 手書きの添え書き
  date?: string;
  read?: string;
  lead: string;
  vis: ReactNode; // ヒーロー右の写真の組
  badge: string[]; // 丸い札の文
  pointsTitle: string;
  points: Array<{ id: string; no: string; title: string; tab: string }>;
  aside: ReactNode;
  children: ReactNode;
  after?: ReactNode; // 本文の下(店の導線の帯など)
  related: ReactNode; // 関連記事の札
  back: Array<{ label: string; href: string; primary?: boolean }>;
};

/**
 * 記事 3 本(店の特集・季節の特集・お役立ちコラム)で共通の型。
 * ヒーロー(見出しは 1 行ずつマスク・手書き・写真がゆっくり寄る・丸札ポップ)→ 追従タブ → 本体(目次の箱+節)と右の追従カード → 関連記事 → 戻る導線。
 */
export default function ArticleShell(p: ArticleProps) {
  return (
    <div className="ar-page" data-gr-page="article" data-kind={p.kind}>
      <div className="ar-wrap">
        <nav className="ar-crumb" aria-label="パンくず">
          {p.crumbs.map((c, i) => (
            <span key={c.label} style={{ display: "contents" }}>
              {i > 0 && <i>&gt;</i>}
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
            </span>
          ))}
        </nav>

        <header className="ar-hero">
          <div>
            <span className="ar-chip" data-rv="fade">
              {p.chip}
            </span>
            <MaskLines as="h1" className="ar-h1" lines={p.title} delay={120} />
            {p.sub && (
              <p className="ar-sub" data-rv="fade" style={{ ["--d" as string]: "520ms" } as React.CSSProperties}>
                {p.sub}
              </p>
            )}
            <div className="ar-meta" data-rv="fade" style={{ ["--d" as string]: "640ms" } as React.CSSProperties}>
              {p.date && (
                <span>
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <rect x="4" y="5.5" width="16" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M4 10h16M8.5 3.8v3M15.5 3.8v3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <b>{p.date}</b>
                </span>
              )}
              {p.read && <span>{p.read}</span>}
            </div>
            <p className="ar-lead" data-rv="fade" style={{ ["--d" as string]: "760ms" } as React.CSSProperties}>
              {p.lead}
            </p>
          </div>
          <div className={`ar-vis ar-vis--${p.kind}`}>
            {p.vis}
            <div className="ar-note gr-hand">
              <Write lines={p.note} delay={900} />
            </div>
            <div className="ar-badge gr-pop gr-float" aria-hidden="true">
              <Leaf size={28} />
              <span>
                {p.badge.map((b, i) => (
                  <span key={i} style={{ display: "block" }}>
                    {b}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </header>

        <ScrollSpyTabs variant="line" className="ar-tabs" offset={110} items={p.points.map((x) => ({ id: x.id, label: x.tab }))} />

        <div className="ar-body">
          <article className="ar-main">
            <div className="ar-toc" data-rv>
              <div className="ar-toc-h">
                <Leaf size={30} />
                {p.pointsTitle}
              </div>
              <TocLinks
                items={p.points.map((x) => ({ id: x.id, no: x.no, title: x.title }))}
                arrow={<Arrow />}
              />
            </div>
            {p.children}
            {p.after}
          </article>
          <aside className="ar-aside">{p.aside}</aside>
        </div>

        <section className="ar-rel" aria-label="あわせて読む">
          <h2 className="ar-rel-h gr-vbar" data-rv>
            あわせて読む
          </h2>
          <div className="ar-rel-g" data-rv-group>
            {p.related}
          </div>
        </section>

        <div className="ar-back" data-rv>
          <span>ほかのページへ</span>
          {p.back.map((b) => (
            <Link key={b.label} href={b.href} className={`gr-btn gr-press ${b.primary ? "" : "gr-btn--line"}`}>
              {b.label}
              <Arrow />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export const COMMON_BACK = [
  { label: "最初のページへ", href: BASE },
  { label: "探すページへ", href: SEARCH_HREF },
  { label: "店のページへ", href: SHOP_HREF },
];
