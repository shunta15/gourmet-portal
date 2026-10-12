import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Brush, Seal } from "../photoFeature/parts";
import PeripheryNewsletter from "./PeripheryNewsletter";
import { FOOT_INFO, FOOT_NAV, FOOT_NAV_LIVE_EXTRA, FOOT_REGIONS, GOURMET_TOP, NOREN_TOP } from "@/lib/portal/noren/nav";

/**
 * 周りのページ（動画・店舗登録・お問い合わせ・編集部・掲載基準・見つからない・エラー）の共通の部品（サーバー・クライアントのどちらからも使える。fs・process・データは読まない）。
 * 見た目は特集の一覧 /feature（components/portal/photoFeature/roundup/）と同じ世界。同じ class（.pf-*・.rp-*）を使い、足りない所だけ .pp-*（periphery.css）。
 * 入口の大きな暖簾（WebGL）は掛けない。
 */
type Fx = CSSProperties & Record<`--${string}`, string | number>;

/** 小さな暖簾に染める字（1 字ずつ）。字は、見出し・ページにある語の中から渡す */
export const markOf = (label: string, n = 4) => Array.from(label).slice(0, n).map((t) => ({ t, w: 1 }));

/** 小さな暖簾の種類（0〜4）: 番号で決める（揺れ方・上がり方が変わる） */
export const nrKind = (i: number) => ((i % 5) + 5) % 5;

/** 見出しの頭に掛ける小さな暖簾（竿 + 短い藍の布。字を 1 字ずつ染め抜く）。飾りなので読み上げない。roundup/rparts.tsx の Nr と同じ組み（あちらは他の担当が編集するので、ここに持つ） */
export function Nr({ units, k, side = "l" }: { units: { t: string; w: number }[]; k: number; side?: "l" | "r" }) {
  const sway = [1.6, 2.4, 1.9, 3.0, 2.1][k % 5];
  const dur = [3.6, 4.6, 4.0, 5.2, 3.2][k % 5];
  const total = units.reduce((n, u) => n + u.w, 0);
  return (
    <span className={`pf-nr pf-nr--k${k % 5} pf-nr--${side}`} aria-hidden="true" style={{ "--sa": `${sway}deg`, "--sd": `${dur}s`, "--np": total } as Fx}>
      <i className="pf-nr__rod" />
      <span className="pf-nr__cl">
        {units.map((u, i) => (
          <b key={i} className="pf-nr__p" style={{ "--i": i, "--n": units.length, flexGrow: u.w } as Fx}>
            <em className={u.w > 1 ? "rp-lat" : undefined}>{u.t}</em>
          </b>
        ))}
      </span>
    </span>
  );
}

/**
 * ページの頭（朱の印・眉書き・題・筆の線・導入）。/feature の .rp-hero と同じ組み。
 * eyebrow: 眉書き（朱）。title: 題（<em> で藍にする語を含められる）。lead: 導入の文（無ければ出さない）。
 */
export function Hero({
  eyebrow,
  title,
  lead,
  compact = false,
  h1Class = "",
  before,
  after,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  compact?: boolean;
  h1Class?: string;
  /** 眉書きの前（パンくずなど） */
  before?: ReactNode;
  /** 導入のあと（件数・絞り込みなど） */
  after?: ReactNode;
}) {
  return (
    <section className={`rp-hero${compact ? " rp-hero--compact" : ""}`} aria-labelledby="pp-h1">
      <Seal className="rp-hero__seal" delay={0.5} />
      {before}
      {eyebrow && <p className="rp-eyebrow"><b>{eyebrow}</b></p>}
      <h1 id="pp-h1" className={`rp-h1 pp-hero-h1${h1Class ? ` ${h1Class}` : ""}`}>{title}</h1>
      <Brush kind="wave" className="rp-hero__br" delay={0.3} />
      {lead && <p className="rp-lead">{lead}</p>}
      {after}
    </section>
  );
}

/** 節の見出し（小さな暖簾 + 見出し + 筆の線）。children は節の中身。mark は暖簾に染める字（見出しの中にある語） */
export function Sec({
  id,
  mark,
  title,
  note,
  k = 0,
  children,
  brush = true,
  className = "",
  label,
}: {
  id: string;
  mark: string;
  /** 見出し。null のときは暖簾だけを掛け、見出しは出さない（label で節の名前を付ける） */
  title: ReactNode | null;
  note?: ReactNode;
  k?: number;
  children?: ReactNode;
  brush?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <section className={`rp-shelf pp-sec${className ? ` ${className}` : ""}`} {...(title === null ? { "aria-label": label } : { "aria-labelledby": id })}>
      <div className="rp-shelf__sh pf-rv">
        <Nr units={markOf(mark, 6)} k={nrKind(k)} side="l" />
        {title !== null && <h2 id={id} className="rp-shelf__t">{title}</h2>}
        {note && <p className="rp-shelf__n">{note}</p>}
      </div>
      {brush && <Brush kind="dash" className="rp-shelf__br" delay={0.1} reveal />}
      {children}
    </section>
  );
}

/** 朱の点の並び */
export function Dash({ items, label }: { items: ReactNode[]; label?: string }) {
  return (
    <ul className="pp-dash" aria-label={label}>
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  );
}

// ───────── 上端の帯・竿・フッター ─────────

/** 上端の帯（ロゴ + 主なリンク）。gourmet: 「マチノワ グルメ」→ グルメのトップ。portal: 「マチノワ」→ 総合トップ（動画のページなど、業種をまたぐページ） */
export function Header({ scope = "gourmet" }: { scope?: "gourmet" | "portal" }) {
  return (
    <header className="pf-hd-bar">
      {scope === "portal" ? (
        <Link href="/" className="pf-logo" aria-label="マチノワ トップへ">
          マチノワ
        </Link>
      ) : (
        <Link href={GOURMET_TOP} className="pf-logo" aria-label="マチノワ グルメのトップへ">
          マチノワ<small>グルメ</small>
        </Link>
      )}
      <nav aria-label="主なリンク">
        <Link href="/feature">特集の一覧</Link>
        <Link href="/search">さがす</Link>
      </nav>
    </header>
  );
}

/** ページの上端の竿（グルメ・特集・さがす）と、読み進みの布・読み進みの印（どれも JS が動いたときだけ動く。Motion が動かす） */
export function Rod() {
  return (
    <>
      <div className="pf-rod">
        <nav className="pf-rod__nav" aria-label="サイト内の主なリンク">
          <Link href={GOURMET_TOP}>グルメ</Link>
          <Link href="/feature">特集</Link>
          <Link href="/search">さがす</Link>
        </nav>
        <span className="pf-rod__tr" aria-hidden="true"><span className="pf-rod__cl"><b /></span></span>
        <i className="pf-rod__bar" aria-hidden="true" />
        <span className="pf-hud__no" aria-hidden="true"><b className="pf-hud__cur" /><b className="pf-hud__prev" /></span>
      </div>
      <div className="pf-hud" aria-hidden="true">
        <span className="pf-hud__line"><i /></span>
      </div>
    </>
  );
}

/**
 * ページの下端。グルメの暖簾のフッター（NorenFooter）と同じ行き先（ナビゲーション・地域・サイト情報）と、ニュースレター（newsletter が true のとき。今まで付いていたページだけ）。
 * リンクは lib/portal/noren/nav.ts の定数（暖簾のフッターと同じ）。地域の行き先は areaLinks 経由（/search?region=）。
 */
export function Footer({ newsletter = false, extra }: { newsletter?: boolean; extra?: ReactNode }) {
  const nav = [...FOOT_NAV.map((n) => (n.href === NOREN_TOP ? { ...n, href: GOURMET_TOP } : n)), ...FOOT_NAV_LIVE_EXTRA];
  return (
    <footer className="pf-ft pp-ft">
      <div className="pp-ft__in">
        <div className="pp-ft__top">
          <div className="pp-ft__brand">
            <p className="pf-ft__l">マチノワ</p>
            {newsletter && (
              <>
                <p className="pp-ft__nlk">ニュースレター</p>
                <p className="pp-ft__nlh">
                  マチノワで繋がる、<em>まだ見ぬ出会い</em>。
                </p>
                <p className="pp-ft__nls">知らない街と一軒との出会いを、編集部が毎週金曜にお届け。</p>
                <PeripheryNewsletter />
              </>
            )}
          </div>
          <div className="pp-ft__cols">
            <nav aria-label="ナビゲーション">
              <h2>ナビゲーション</h2>
              <ul>
                {nav.map((n) => (
                  <li key={n.href + n.ja}>
                    <Link href={n.href}>{n.ja}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="地域">
              <h2>地域</h2>
              <ul>
                {FOOT_REGIONS.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href}>{n.ja}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="サイト情報">
              <h2>サイト情報</h2>
              <ul>
                {FOOT_INFO.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href}>{n.ja}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            {extra}
          </div>
        </div>
        <p className="pp-ft__bot">
          <span>© 2026 マチノワ / 街の輪 · 無断転載禁止</span>
          <span>日本 全国 — 2026年</span>
        </p>
      </div>
    </footer>
  );
}
