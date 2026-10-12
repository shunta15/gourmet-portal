import Link from "next/link";
import type { ReactNode } from "react";
import { sized } from "@/lib/imageUrl";
import { tateCols } from "@/lib/portal/photoFeature/build";
import type { RpCard } from "@/lib/portal/photoFeature/roundupList";
import {
  FEATURE_KIND_ROUNDUP,
  FEATURE_KIND_ROUNDUP_ALL,
  FEATURE_KIND_SINGLE,
  FEATURE_ROUNDUP_NOTE,
  FEATURE_ROUNDUP_WALK,
  FEATURE_SHELF_ROUNDUP_ID,
  FEATURE_SHELF_SINGLE_ID,
  FEATURE_SHELF_WALK_ID,
  FEATURE_SINGLE_NOTE,
  FEATURE_WALK_NOTE,
} from "@/lib/portal/noren/featureKinds";
import { GOURMET_TOP } from "@/lib/portal/noren/nav";
import Motion from "../Motion";
import { Brush, Seal, Tate } from "../parts";
import { FooterBar, HeaderBar, Nr, RodAndHud, nrKind } from "./rparts";
import "./roundup.css";

// 特集の一覧（/feature）の中身（サーバーコンポーネント）。見た目は店舗特集記事・シーン別まとめ記事と同じ世界: 和紙の地・筆の線・朱の印・小さな暖簾の見出し。記事の札は写真が主役（写真・題・地域）。
// 入口の大きな暖簾（WebGL）は一覧には掛けない。外枠（.pf-root）は呼び出し側の PhotoFeatureShell。
// 棚の並び・各棚の中の並び・札のリンク先は、呼び出し側（app/gourmet/feature/page.tsx）が渡すデータのまま。ここでは並べ替えない。

const LIST_HREF = "/feature";
const SEARCH_HREF = "/search";

/** 小さな暖簾に染める字: 棚の名前の頭の語（棚の名前の中にある語だけ）。特集記事=特集記事、シーン別まとめ記事=「シーン別」、街歩き・コース=「街歩き」 */
const markOf = (label: string, n: number) => Array.from(label).slice(0, n).map((t) => ({ t, w: 1 }));

function Card({ c, eager = false }: { c: RpCard; eager?: boolean }) {
  return (
    <li>
      <Link href={c.href} className="rp-card">
        <span className={`pf-rel__ph${c.img ? "" : " rp-nophoto"}`} aria-hidden="true">
          {c.img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="pf-rel__img" src={sized(c.img, 640)} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
          ) : (
            <Tate cols={tateCols(c.title, 8, 3)} className="rp-nophoto__t" label={false} />
          )}
        </span>
        <span className="pf-rel__b">
          <b>{c.title}</b>
          {c.sub && <span className="rp-card__s">{c.sub}</span>}
          {c.line && <small>{c.line}</small>}
        </span>
      </Link>
    </li>
  );
}

function Grid({ items, label }: { items: RpCard[]; label: string }) {
  return (
    <ul className="rp-grid" aria-label={label}>
      {items.map((c, i) => (
        <Card key={c.id} c={c} eager={i < 4} />
      ))}
    </ul>
  );
}

function ShelfHead({ id, label, note, count, mark, k, extra }: { id: string; label: string; note: string; count: number; mark: { t: string; w: number }[]; k: number; extra?: ReactNode }) {
  return (
    <div className="rp-shelf__sh pf-rv">
      <Nr units={mark} k={nrKind(k)} side="l" />
      <h2 id={id} className="rp-shelf__t">{label}</h2>
      <p className="rp-shelf__n">
        {note}
        <b>{count}</b> 本。
      </p>
      {extra}
    </div>
  );
}

export type RoundupListProps =
  | {
      kind: "shelves";
      singles: RpCard[];
      scene: RpCard[];
      walk: RpCard[];
      /** 地域で絞る・テーマ・シーンで絞る の札 */
      regions: { key: string; name: string; nameEn: string; count: number }[];
      themes: { label: string; labelEn: string; count: number }[];
      /** 「一覧で見る」の件数（シーン別まとめ記事 + 街歩き・コースの全部） */
      allCount: number;
    }
  | {
      kind: "filtered";
      /** 絞り込みの名前（「地域: 大阪」など） */
      activeLabel: string;
      items: RpCard[];
    };

export default function RoundupListPage(props: RoundupListProps) {
  return (
    <>
      <HeaderBar topHref={GOURMET_TOP} listHref={LIST_HREF} searchHref={SEARCH_HREF} current="list" />
      <div id="main" className="rp-main">
        {props.kind === "shelves" ? <Shelves {...props} /> : <Filtered {...props} />}
      </div>
      <FooterBar />
      <RodAndHud topHref={GOURMET_TOP} listHref={LIST_HREF} searchHref={SEARCH_HREF} />
      <Motion />
    </>
  );
}

function Shelves({ singles, scene, walk, regions, themes, allCount }: Extract<RoundupListProps, { kind: "shelves" }>) {
  return (
    <>
      <section className="rp-hero" aria-labelledby="rp-h1">
        <Seal className="rp-hero__seal" delay={0.5} />
        <p className="rp-eyebrow"><b>特集</b></p>
        <h1 id="rp-h1" className="rp-h1">
          特集を、<em>読む。</em>
        </h1>
        <Brush kind="wave" className="rp-hero__br" delay={0.3} />
        <p className="rp-lead">
          {FEATURE_KIND_SINGLE}は店を 1 軒ずつ、{FEATURE_KIND_ROUNDUP}は利用シーンに合わせて複数の店を、{FEATURE_ROUNDUP_WALK}は街の歩き方を紹介します。
        </p>
        <ul className="rp-jump" aria-label="棚へ移動">
          <li><a href={`#${FEATURE_SHELF_SINGLE_ID}`}>{FEATURE_KIND_SINGLE}<small>{singles.length} 本</small></a></li>
          <li><a href={`#${FEATURE_SHELF_ROUNDUP_ID}`}>{FEATURE_KIND_ROUNDUP}<small>{scene.length} 本</small></a></li>
          <li><a href={`#${FEATURE_SHELF_WALK_ID}`}>{FEATURE_ROUNDUP_WALK}<small>{walk.length} 本</small></a></li>
        </ul>
      </section>

      {/* 地域・テーマ・シーンで絞る（シーン別まとめ記事と街歩き・コースの両方を絞る）。キーワードで探す */}
      <section className="rp-filter" aria-labelledby="rp-filter-h">
        <div className="rp-shelf__sh pf-rv">
          <Nr units={markOf("絞り込み", 4)} k={nrKind(3)} side="l" />
          <h2 id="rp-filter-h" className="rp-shelf__t">絞り込む</h2>
          <Link href="/feature/search" className="rp-shelf__link" data-cursor="SEARCH">キーワードで探す →</Link>
        </div>
        <div className="rp-fl pf-rv">
          <h3>地域で絞る（{regions.length} 地域）</h3>
          <ul className="rp-tiles">
            {regions.map((r) => (
              <li key={r.key}>
                <Link href={`/feature?region=${r.key}`} className="rp-tile">
                  <span className="en">{r.nameEn}</span>
                  <span className="nm">{r.name}</span>
                  <span className="ct">{r.count} 記事</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="rp-fl pf-rv">
          <h3>テーマ・シーンで絞る</h3>
          <ul className="rp-tiles">
            {themes.map((g) => (
              <li key={g.label}>
                <Link href={`/feature?theme=${encodeURIComponent(g.label)}`} className="rp-tile">
                  <span className="en">{g.labelEn}</span>
                  <span className="nm">{g.label}</span>
                  <span className="ct">{g.count} 記事</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 棚 1: 特集記事（店 1 軒の記事） */}
      <section id={FEATURE_SHELF_SINGLE_ID} className="rp-shelf" aria-labelledby="rp-single">
        <ShelfHead id="rp-single" label={FEATURE_KIND_SINGLE} note={FEATURE_SINGLE_NOTE} count={singles.length} mark={markOf(FEATURE_KIND_SINGLE, 4)} k={0} />
        <Brush kind="dash" className="rp-shelf__br" delay={0.1} reveal />
        <Grid items={singles} label={FEATURE_KIND_SINGLE} />
      </section>

      {/* 棚 2: シーン別まとめ記事（利用シーン + 複数の店） */}
      <section id={FEATURE_SHELF_ROUNDUP_ID} className="rp-shelf" aria-labelledby="rp-scene">
        <ShelfHead id="rp-scene" label={FEATURE_KIND_ROUNDUP} note={FEATURE_ROUNDUP_NOTE} count={scene.length} mark={markOf(FEATURE_KIND_ROUNDUP, 4)} k={1} />
        <Brush kind="dash" className="rp-shelf__br" delay={0.1} reveal />
        <Grid items={scene} label={FEATURE_KIND_ROUNDUP} />
      </section>

      {/* 棚 3: 街歩き・コース */}
      <section id={FEATURE_SHELF_WALK_ID} className="rp-shelf" aria-labelledby="rp-walk">
        <ShelfHead id="rp-walk" label={FEATURE_ROUNDUP_WALK} note={FEATURE_WALK_NOTE} count={walk.length} mark={markOf(FEATURE_ROUNDUP_WALK, 3)} k={2} />
        <Brush kind="dash" className="rp-shelf__br" delay={0.1} reveal />
        <Grid items={walk} label={FEATURE_ROUNDUP_WALK} />
      </section>

      <p className="rp-end pf-rv">
        <Link href="/feature?all=1" className="pf-btn pf-btn--ghost" data-cursor="ALL">
          {FEATURE_KIND_ROUNDUP_ALL}を一覧で見る（{allCount}件）
        </Link>
      </p>
    </>
  );
}

function Filtered({ activeLabel, items }: Extract<RoundupListProps, { kind: "filtered" }>) {
  return (
    <>
      <section className="rp-hero rp-hero--compact" aria-labelledby="rp-h1">
        <Seal className="rp-hero__seal" delay={0.5} />
        <p className="rp-eyebrow">
          <Link href={LIST_HREF}>特集</Link>
          <em>{activeLabel}</em>
        </p>
        <h1 id="rp-h1" className="rp-h1">
          {FEATURE_KIND_ROUNDUP_ALL}
          <span className="n">{items.length}</span>件
        </h1>
        <Brush kind="wave" className="rp-hero__br" delay={0.3} />
        <p>
          <Link href={LIST_HREF} className="rp-back" data-cursor="BACK">← フィルタを変える</Link>
        </p>
      </section>
      <section className="rp-shelf" aria-label={`${FEATURE_KIND_ROUNDUP_ALL}の一覧`}>
        {items.length === 0 ? (
          <p className="rp-shelf__n">
            該当する記事がありません。
            <Link href={LIST_HREF} className="rp-back">他のフィルタを選ぶ →</Link>
          </p>
        ) : (
          <Grid items={items} label={activeLabel} />
        )}
      </section>
    </>
  );
}
