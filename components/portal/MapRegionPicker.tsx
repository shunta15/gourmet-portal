"use client";
/**
 * /map の「地方 → 県」の選択部品: デフォルメ日本地図（SVG）・地方ごとのリスト・県のカード・階層のパンくず。
 * 店数は親（MapExplorer）が実データ（業種チップで絞った後の店）から数えて渡す。ここでは数を作らない。
 * 0 店の地方・県はリンクにしない（押せない表示）。選んだ状態は URL（?r=地方 / ?p=県）に残る＝戻るで前の段へ戻る。
 * 「今開いている店だけ」（?open=1）は、リンクを辿っても保たれるよう href に引き継ぐ。
 */
import Link from "next/link";
import type { CSSProperties } from "react";
import { CELLS, MAP_GRID, MAP_REGIONS, type MapRegion } from "@/lib/portal/mapRegions";
import { OpenCount, useOpenOnly } from "./OpenNow";

/** 県 slug → その県の（絞り込み後の）店 ID */
export type PrefIds = Record<string, string[]>;

export function mapHref(q: { r?: string; p?: string }, open: boolean): string {
  const s = new URLSearchParams();
  if (q.r) s.set("r", q.r);
  if (q.p) s.set("p", q.p);
  if (open) s.set("open", "1");
  const qs = s.toString();
  return qs ? `/map?${qs}` : "/map";
}

export function regionIds(r: MapRegion, prefIds: PrefIds): string[] {
  return r.prefs.flatMap((p) => prefIds[p.slug] ?? []);
}

const CELL = 44;
const GAP = 2; // マスの間の線の太さ（SVG の単位）

/* ───────────── デフォルメ日本地図 ───────────── */

export function JapanMap({ prefIds }: { prefIds: PrefIds }) {
  const open = useOpenOnly();
  const W = MAP_GRID.cols * CELL;
  const H = MAP_GRID.rows * CELL;
  return (
    <svg className="mp-jm-svg" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="デフォルメした日本地図。地方を選びます" focusable="false">
      {MAP_REGIONS.map((r) => {
        const cells = r.prefs.flatMap((p) => {
          const c = CELLS[p.slug];
          return c ? [{ slug: p.slug, c }] : [];
        });
        const ids = regionIds(r, prefIds);
        // 文字を置く位置: マスの中心の平均
        let sx = 0;
        let sy = 0;
        for (const { c } of cells) {
          sx += c[0] + (c[2] ?? 1) / 2;
          sy += c[1] + (c[3] ?? 1) / 2;
        }
        const cx = (sx / cells.length) * CELL;
        const cy = (sy / cells.length) * CELL;
        const body = (
          <>
            {cells.map(({ slug, c }) => (
              <rect
                key={slug}
                className="mp-jm-cell"
                data-pref={slug}
                x={c[0] * CELL + GAP / 2}
                y={c[1] * CELL + GAP / 2}
                width={(c[2] ?? 1) * CELL - GAP}
                height={(c[3] ?? 1) * CELL - GAP}
                rx={4}
              />
            ))}
            <text className="mp-jm-t" x={cx} y={cy - 3} textAnchor="middle" aria-hidden="true">
              {r.block}
            </text>
            <text className="mp-jm-n" x={cx} y={cy + 19} textAnchor="middle" aria-hidden="true">
              <OpenCount ids={ids} />
            </text>
          </>
        );
        const style = { ["--rc" as string]: r.fill } as CSSProperties;
        return ids.length > 0 ? (
          <Link
            key={r.slug}
            href={mapHref({ r: r.slug }, open)}
            prefetch={false}
            className="mp-jm-reg"
            data-region={r.slug}
            aria-label={`${r.label} ${ids.length}店`}
            style={style}
          >
            {body}
          </Link>
        ) : (
          <g
            key={r.slug}
            className="mp-jm-reg"
            data-off="1"
            data-region={r.slug}
            role="img"
            aria-label={`${r.label} 0店（掲載なし）`}
            style={style}
          >
            {body}
          </g>
        );
      })}
    </svg>
  );
}

/* ───────────── 県へのリンク（0 店は押せない） ───────────── */

function PrefLink({ slug, label, ids, open, big }: { slug: string; label: string; ids: string[]; open: boolean; big?: boolean }) {
  const body = (
    <>
      <span className="mp-pl-name">{label}</span>
      <span className="mp-pl-n">
        {" "}
        <OpenCount ids={ids} />
      </span>
    </>
  );
  const cls = big ? "mp-pl mp-pl-big" : "mp-pl";
  return ids.length > 0 ? (
    <Link href={mapHref({ p: slug }, open)} prefetch={false} className={cls} data-pref={slug}>
      {body}
    </Link>
  ) : (
    <span className={cls} data-off="1" data-pref={slug} aria-disabled="true">
      {body}
    </span>
  );
}

/* ───────────── 地方 → 県のリスト（地図を使わない人向け・同じ内容） ───────────── */

export function RegionList({ prefIds }: { prefIds: PrefIds }) {
  const open = useOpenOnly();
  return (
    <ul className="mp-rl" aria-label="地方から選ぶ（日本地図と同じ内容）">
      {MAP_REGIONS.map((r) => {
        const ids = regionIds(r, prefIds);
        const head = (
          <>
            {r.label}
            <span className="mp-rl-n">
              {" "}
              <OpenCount ids={ids} />
            </span>
          </>
        );
        return (
          <li key={r.slug} className="mp-rl-reg" data-region={r.slug} style={{ ["--rc" as string]: r.fill } as CSSProperties}>
            <h2 className="mp-rl-h">
              {ids.length > 0 ? (
                <Link href={mapHref({ r: r.slug }, open)} prefetch={false}>
                  {head}
                </Link>
              ) : (
                <span data-off="1" aria-disabled="true">
                  {head}
                </span>
              )}
            </h2>
            <ul className="mp-rl-prefs">
              {r.prefs.map((p) => (
                <li key={p.slug}>
                  <PrefLink slug={p.slug} label={p.short} ids={prefIds[p.slug] ?? []} open={open} />
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

/* ───────────── 地方を選んだあと: 県のカード ───────────── */

export function PrefCards({ region, prefIds }: { region: MapRegion; prefIds: PrefIds }) {
  const open = useOpenOnly();
  return (
    <ul className="mp-pc" aria-label={`${region.label}の県`} style={{ ["--rc" as string]: region.fill } as CSSProperties}>
      {region.prefs.map((p) => (
        <li key={p.slug}>
          <PrefLink slug={p.slug} label={p.name} ids={prefIds[p.slug] ?? []} open={open} big />
        </li>
      ))}
    </ul>
  );
}

/* ───────────── 階層（日本 › 地方 › 県） ───────────── */

export function StageNav({ region, prefName }: { region?: MapRegion; prefName?: string }) {
  const open = useOpenOnly();
  return (
    <nav className="mp-sn" aria-label="地方と県の階層">
      <ol>
        <li>
          <Link href={mapHref({}, open)} prefetch={false}>
            日本
          </Link>
        </li>
        {region && (
          <li>
            {prefName ? (
              <Link href={mapHref({ r: region.slug }, open)} prefetch={false}>
                {region.label}
              </Link>
            ) : (
              <span aria-current="page">{region.label}</span>
            )}
          </li>
        )}
        {prefName && (
          <li>
            <span aria-current="page">{prefName}</span>
          </li>
        )}
      </ol>
    </nav>
  );
}
