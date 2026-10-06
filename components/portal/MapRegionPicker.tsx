"use client";
/**
 * /map の「地方 → 県」を文字で選ぶ部品（地図を使わない人向け・キーボードと読み上げ用。日本地図と同じ内容）。
 *  RegionList … 地方ごとの見出し（店数と、地方どうしの比較の細い棒）と、県のリンク（0 店は押せない表示）
 *  PrefRows   … 地方を選んだあとの、県の行（店数と、その地方の中での比較の細い棒）
 *  StageNav   … 階層（日本 › 地方 › 県）
 * 店数は親（MapExplorer）が実データ（業種チップ・営業中で絞った後の店）から数えて渡す。ここでは数を作らない。
 * 0 店の地方・県はリンクにしない。リンクを辿っても「今開いている店だけ」（?open=1）が保たれるよう href に引き継ぐ。
 * リンクを押すと、サーバーの応答を待たずに地図のカメラが動く（go）。ホバー・フォーカスした地方は地図でも持ち上がる（setHl）。
 */
import Link from "next/link";
import type { CSSProperties, MouseEvent } from "react";
import { MAP_REGIONS, type MapRegion } from "@/lib/portal/mapRegions";
import { mapHref, type Target } from "./MapStage";

export { mapHref };

interface Common {
  open: boolean;
  /** 県 slug → 表示している店数（営業中だけのときはその数） */
  counts: Record<string, number>;
  /** 県 slug → その県の（業種で絞った）店の数。0 なら押せない */
  total: Record<string, number>;
  go: (t: Target, e: MouseEvent) => void;
  setHl: (slug: string | null) => void;
}

const sumOf = (r: MapRegion, m: Record<string, number>) => r.prefs.reduce((a, p) => a + (m[p.slug] ?? 0), 0);

/* ───────────── 県へのリンク（0 店は押せない） ───────────── */

function PrefLink({ slug, regionSlug, label, name, n, enabled, open, go, setHl }: { slug: string; regionSlug: string; label: string; name: string; n: number; enabled: boolean } & Pick<Common, "open" | "go" | "setHl">) {
  const body = (
    <>
      <span className="mp-pl-name">{label}</span>
      <span className="mp-pl-n">{n}店</span>
    </>
  );
  return enabled ? (
    <Link
      href={mapHref({ p: slug }, open)}
      prefetch={false}
      className="mp-pl"
      data-pref={slug}
      aria-label={`${name} ${n}店`}
      onClick={(e) => go({ stage: "pref", region: regionSlug, pref: slug }, e)}
      onPointerEnter={() => setHl(regionSlug)}
      onPointerLeave={() => setHl(null)}
    >
      {body}
    </Link>
  ) : (
    <span className="mp-pl" data-off="1" data-pref={slug} aria-disabled="true">
      {body}
    </span>
  );
}

/* ───────────── 地方 → 県のリスト（日本の段） ───────────── */

export function RegionList({ counts, total, hl, open, go, setHl }: Common & { hl: string | null }) {
  const maxRegion = Math.max(1, ...MAP_REGIONS.map((r) => sumOf(r, counts)));
  return (
    <ul className="mp-rl" aria-label="地方から選ぶ（日本地図と同じ内容）">
      {MAP_REGIONS.map((r) => {
        const n = sumOf(r, counts);
        const linkable = sumOf(r, total) > 0;
        const direct = r.prefs.length === 1;
        const head = (
          <>
            <span className="mp-rl-nm">{r.label}</span>
            <span className="mp-rl-n">
              <b>{n}</b>店
            </span>
          </>
        );
        return (
          <li
            key={r.slug}
            className="mp-rl-reg"
            data-region={r.slug}
            data-hl={hl === r.slug ? "1" : undefined}
            style={{ ["--w" as string]: `${Math.round((n / maxRegion) * 100)}%` } as CSSProperties}
            onPointerEnter={() => setHl(r.slug)}
            onPointerLeave={() => setHl(null)}
          >
            <h2 className="mp-rl-h">
              {linkable ? (
                <Link
                  href={direct ? mapHref({ p: r.prefs[0].slug }, open) : mapHref({ r: r.slug }, open)}
                  prefetch={false}
                  onClick={(e) => go(direct ? { stage: "pref", region: r.slug, pref: r.prefs[0].slug } : { stage: "region", region: r.slug }, e)}
                  onFocus={() => setHl(r.slug)}
                  onBlur={() => setHl(null)}
                >
                  {head}
                </Link>
              ) : (
                <span data-off="1" aria-disabled="true">
                  {head}
                </span>
              )}
            </h2>
            <i className="mp-rl-bar" aria-hidden="true" />
            {!direct && (
              <ul className="mp-rl-prefs">
                {r.prefs.map((p) => (
                  <li key={p.slug}>
                    <PrefLink
                      slug={p.slug}
                      regionSlug={r.slug}
                      label={p.short}
                      name={p.name}
                      n={counts[p.slug] ?? 0}
                      enabled={(total[p.slug] ?? 0) > 0}
                      open={open}
                      go={go}
                      setHl={setHl}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ───────────── 地方を選んだあと: 県の行 ───────────── */

export function PrefRows({ region, counts, total, open, go, setHl }: Common & { region: MapRegion }) {
  const max = Math.max(1, ...region.prefs.map((p) => counts[p.slug] ?? 0));
  return (
    <ol className="mp-pr" aria-label={`${region.label}の県`}>
      {region.prefs.map((p) => {
        const n = counts[p.slug] ?? 0;
        const enabled = (total[p.slug] ?? 0) > 0;
        const body = (
          <>
            <span className="mp-pr-nm">{p.name}</span>
            <i className="mp-pr-bar" aria-hidden="true" style={{ ["--w" as string]: `${Math.round((n / max) * 100)}%` } as CSSProperties} />
            <span className="mp-pr-n">
              <b>{n}</b>店
            </span>
          </>
        );
        return (
          <li key={p.slug}>
            {enabled ? (
              <Link
                href={mapHref({ p: p.slug }, open)}
                prefetch={false}
                className="mp-pr-a"
                data-pref={p.slug}
                onClick={(e) => go({ stage: "pref", region: region.slug, pref: p.slug }, e)}
                onPointerEnter={() => setHl(region.slug)}
                onPointerLeave={() => setHl(null)}
              >
                {body}
              </Link>
            ) : (
              <span className="mp-pr-a" data-off="1" data-pref={p.slug} aria-disabled="true">
                {body}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ───────────── 階層（日本 › 地方 › 県） ───────────── */

export function StageNav({ region, prefName, open, go }: { region?: MapRegion; prefName?: string; open: boolean; go: Common["go"] }) {
  return (
    <nav className="mp-sn" aria-label="地方と県の階層">
      <ol>
        <li>
          <Link href={mapHref({}, open)} prefetch={false} onClick={(e) => go({ stage: "japan" }, e)}>
            日本
          </Link>
        </li>
        {region && (
          <li>
            {prefName ? (
              <Link href={mapHref({ r: region.slug }, open)} prefetch={false} onClick={(e) => go({ stage: "region", region: region.slug }, e)}>
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
