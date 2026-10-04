/**
 * 新業種ページ（地域・種類・シーン）の見た目の共通部品（サーバー）。
 * 色・名前・文言は vertical から取る。業種ごとの分岐は持たない。
 * 件数は渡された実数だけを出す。0 件のあいだは「掲載準備中」と正直に出す。
 */
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import PortalFonts from "../PortalFonts";
import Breadcrumbs, { type Crumb } from "../Breadcrumbs";
import AreaBlocks from "../AreaBlocks";
import JsonLd from "../JsonLd";
import ShareButtons from "../ShareButtons";
import { OpenBadge, OpenBar, OpenScope } from "../OpenNow";
import { packWeeks } from "@/lib/portal/openNow";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { itemList } from "@/lib/seo/jsonld";
import { VERTICAL_FACE } from "@/lib/portal/meta";
import { shareTarget } from "@/lib/portal/share";
import type { Place } from "@/lib/places";
import type { Scene, Vertical } from "@/lib/verticals/types";
import { pick } from "./data";

export function accentStyle(v: Vertical): CSSProperties {
  return { ["--ac" as string]: v.accent.color, ["--acl" as string]: v.accent.lightColor };
}

/** ページの色と飾り文字。業種ページは業種の色、業種横断の街は中立（墨と生成り） */
export interface Tone {
  color: string;
  lightColor: string;
  glyph: string;
}

export function toneOf(v: Vertical): Tone {
  return { color: v.accent.color, lightColor: v.accent.lightColor, glyph: VERTICAL_FACE[v.key].glyph };
}

/** マチノワ ＞ 業種名 のパンくず（各ページはこの後ろに足す） */
export function baseCrumbs(v: Vertical): Crumb[] {
  return [
    { name: "マチノワ", href: "/" },
    { name: v.name, href: v.path },
  ];
}

/** ページ上部（パンくず・見出し・件数）と本文の枠 */
export function PageFrame({
  tone,
  crumbs,
  kicker,
  heading,
  lead,
  count,
  unit = "件",
  className,
  extra,
  children,
}: {
  tone: Tone;
  crumbs: Crumb[];
  kicker: string;
  heading: string;
  lead: string;
  /** 掲載数。渡さないとき（視聴ページなど）は「掲載中」と件数の行を出さない */
  count?: number;
  /** 件数の単位（既定は「件」） */
  unit?: string;
  /** ページ固有の見た目の調整用のクラス（既定は何も足さない） */
  className?: string;
  /** 見出しの下に足す内容（駅ページの路線など。無ければ何も出さない） */
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={className ? `mp-pg ${className}` : "mp-pg"} style={{ ["--ac" as string]: tone.color, ["--acl" as string]: tone.lightColor }}>
      <PortalFonts />
      <header className="mp-pg-head">
        <span className="g" aria-hidden="true">{tone.glyph}</span>
        <div className="mp-wrap">
          <Breadcrumbs items={crumbs} />
          <p className="mp-kicker">{kicker}</p>
          <h1 className="mp-pg-title">{heading}</h1>
          <p className="mp-pg-lead">{lead}</p>
          {count !== undefined && (
            <div className="mp-pg-state">
              <p className="mp-state"><i aria-hidden="true" />{count > 0 ? "掲載中" : "掲載準備中"}</p>
              <p className="mp-pg-count"><b>{count}</b>{unit}</p>
            </div>
          )}
          {extra}
        </div>
      </header>
      {children}
    </div>
  );
}

/** 掲載の店。0 件なら「掲載準備中」を出す（サンプル店は出さない） */
export function Listing({ v, places, emptyNote }: { v: Vertical; places: Place[]; emptyNote: string }) {
  if (places.length === 0) {
    return (
      <section className="mp-pg-sec mp-vh-note" aria-labelledby="mp-pg-empty-h">
        <div className="mp-wrap mp-note-grid">
          <div>
            <p className="mp-kicker">Status</p>
            <h2 id="mp-pg-empty-h" className="mp-h2 sm">掲載準備中です</h2>
          </div>
          <div>
            <p className="mp-note-p">{emptyNote}</p>
            <p className="mp-note-links">
              <Link href="/editorial/guidelines">掲載基準</Link>
              <Link href="/contact">掲載のご相談</Link>
            </p>
          </div>
        </div>
      </section>
    );
  }
  const catName = (slug: string) => v.categories.find((c) => c.slug === slug)?.name ?? "";
  // 営業中かどうかは現在時刻で変わるので、判定はクライアント（components/portal/OpenNow.tsx）。ここでは営業予定の表だけ渡す
  const weeks = packWeeks(places.map((p) => ({ id: p.id, hours: p.hours, closed: p.holidays })));
  return (
    <section className="mp-pg-sec" aria-labelledby="mp-pg-list-h">
      <div className="mp-wrap">
        <h2 id="mp-pg-list-h" className="mp-pg-h">掲載の店</h2>
        <OpenScope weeks={weeks}>
          <OpenBar ids={places.map((p) => p.id)} />
          <ul className="mp-pg-grid">
            {places.map((p) => (
              <li key={p.id}>
                <Link href={`${v.path}/shop/${p.id}`} prefetch={false} className="mp-place">
                  <small>{catName(p.category)}</small>
                  <b>{p.name}</b>
                  <span>{p.address}</span>
                  <OpenBadge id={p.id} />
                </Link>
              </li>
            ))}
          </ul>
        </OpenScope>
      </div>
      <JsonLd data={itemList(places, v)} />
    </section>
  );
}

/** ページの共有ボタン（LINE・X・Facebook・リンクをコピー）。path はこのページのパス（日本語のままでよい） */
export function ShareSection({
  path,
  text,
  label = "このページを共有",
  storeId,
}: {
  path: string;
  /** X・共有シートに渡す文言（ページ名など） */
  text: string;
  label?: string;
  storeId?: string;
}) {
  return (
    <section className="mp-pg-sec mp-share-sec" aria-label="共有">
      <div className="mp-wrap">
        <ShareButtons url={shareTarget(path)} text={text} page={path} storeId={storeId} label={label} />
      </div>
    </section>
  );
}

export function Block({
  id,
  kicker,
  title,
  className,
  children,
}: {
  id: string;
  kicker: string;
  title: ReactNode;
  /** 追加のクラス（「今開いている店だけ」で、営業中の店が無いブロックを隠すときは mp-og） */
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className ? `mp-sec mp-vh-sec ${className}` : "mp-sec mp-vh-sec"} aria-labelledby={id}>
      <div className="mp-wrap">
        <header className="mp-sec-head">
          <p className="mp-kicker">{kicker}</p>
          <h2 id={id} className="mp-h2 sm">{title}</h2>
        </header>
        {children}
      </div>
    </section>
  );
}

/** 種類へのリンク（件数つき） */
export function CategoryLinks({
  v,
  title,
  all,
  pref,
  hrefOf,
  exclude,
}: {
  v: Vertical;
  title: string;
  all: Place[];
  pref?: string;
  hrefOf: (slug: string) => string;
  exclude?: string;
}) {
  const items = v.categories.filter((c) => c.slug !== exclude);
  return (
    <Block id="mp-pg-cat-h" kicker="Category" title={title}>
      <ul className="mp-cats">
        {items.map((c, i) => {
          const n = pick(all, { category: c.slug, pref }).length;
          return (
            <li key={c.slug}>
              <Link href={hrefOf(c.slug)} prefetch={false} className="mp-cat" data-cursor="CATEGORY">
                <small>0{i + 1}</small>
                <b>{c.name}</b>
                <span className="st">{n > 0 ? `${n}件` : "掲載準備中"}</span>
                <span className="ar" aria-hidden="true">→</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Block>
  );
}

/** 利用シーンへのリンク。current を渡すとそのシーンは除く（「ほかのシーン」） */
export function SceneLinks({ v, title, current }: { v: Vertical; title: string; current?: Scene }) {
  const items = v.scenes.filter((s) => s.slug !== current?.slug);
  if (items.length === 0) return null;
  return (
    <Block id="mp-pg-scene-h" kicker="Scene" title={title}>
      <ul className="mp-chips">
        {items.map((s) => (
          <li key={s.slug}>
            <Link href={`${v.path}/scene/${s.slug}`} prefetch={false} data-cursor="SCENE">{s.name}</Link>
          </li>
        ))}
      </ul>
    </Block>
  );
}

/** 都道府県へのリンク（地方ブロック別・件数つき） */
export function PrefLinks({
  title,
  countOf,
  hrefOf,
  exclude,
}: {
  title: string;
  countOf: (pref: string) => number;
  hrefOf: (pref: string) => string;
  exclude?: string;
}) {
  return (
    <Block id="mp-pg-area-h" kicker="Area" title={title}>
      <AreaBlocks
        unit="件"
        items={PREFECTURES.filter((p) => p.slug !== exclude).map((p) => {
          const n = countOf(p.slug);
          return { slug: p.slug, short: p.short, block: p.block, count: n, href: hrefOf(p.slug), lit: n > 0 };
        })}
      />
    </Block>
  );
}
