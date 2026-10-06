"use client";
/**
 * /map の「枠」: デフォルメ日本地図（タイルグリッド）を主役にして、日本 → 地方 → 県 の切り替えを
 * 「カメラが寄る」動きで見せる。選んだ地方が枠いっぱいに広がり（ほかの地方は薄く残る）、県を選ぶとそのタイルが枠いっぱいになり、
 * その中身（店の点）に切り替わる。動きは意味のあるものだけ: 寄る（階層の移動）・色の変化（業種や営業中で店数が変わる）・
 * 最初に北東から南西へタイルが置かれる（列島の並びを見せる）。prefers-reduced-motion では動かさない（CSS）。
 *
 * 描くもの: タイルの色は店数（その時表示している数。営業中だけのときはその数）の濃淡。0 店のタイルは斜線で、押せない。
 * 地方の輪郭は墨の太線、県の境は細い隙間。地方の名前と店数は地図の上に直接、県の名前と店数は地方を選んだあとに出る。
 * 押せるもの: 日本の段は地方ごとのリンク（8 つ）、地方の段は県ごとのリンクと「ほかの地方」のリンク、県の段はピンの地図（children）。
 * 押した瞬間に（サーバーの応答を待たずに）カメラを動かすため、親が持つ目標（eff）で描く。
 */
import Link from "next/link";
import { useMemo, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import {
  CAM_HOME,
  CELL_U,
  GAP_U,
  MAP_GRID,
  MAP_REGIONS,
  boxOfPrefs,
  cameraFor,
  cellRect,
  getRegionBySlug,
  regionAnchor,
  regionOutline,
  type Cam,
  type MapRegion,
} from "@/lib/portal/mapRegions";

export type Stage = "japan" | "region" | "pref" | "station";

/** 画面の目標（URL の ?r=・?p= に対応） */
export interface Target {
  stage: "japan" | "region" | "pref";
  region?: string;
  pref?: string;
}

const U = CELL_U;
const W = MAP_GRID.cols * U;
const H = MAP_GRID.rows * U;
/** 地図の周りの余白（viewBox の単位。枠の縦横比は map.css の --fa = (W+2P)/(H+2P) と合わせる） */
const PAD = 14;
const INK = "#15110e";
const IVORY = "#f4efe6";

/* ───────────── 色（店数の濃淡） ───────────── */

/**
 * 色の段階: 淡い砂色 → 朱（ここまで墨の文字）、そこから深い朱 → 暗い朱（ここからは生成りの文字）の 2 区間。
 * 区間のあいだ（輝度 0.15〜0.24）は、墨・生成りのどちらの文字も 4.5:1 に届かないので、段をつけて飛ばす
 * （濃いほど店が多い、という並びは変わらない）。tileTone() の戻り値の文字色は、必ず 4.5:1 以上（検査済み）。
 */
const LO: [number, number, number] = [243, 227, 208];
const MID: [number, number, number] = [208, 112, 79];
const DK1: [number, number, number] = [176, 64, 42];
const DK2: [number, number, number] = [140, 44, 27];
const T_STEP = 0.62;

function hex(c: [number, number, number]): string {
  return "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}
function lerp(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t) as [number, number, number];
}
function mixRgb(t: number): [number, number, number] {
  return t < T_STEP ? lerp(LO, MID, t / T_STEP) : lerp(DK1, DK2, (t - T_STEP) / (1 - T_STEP));
}
function lum(c: [number, number, number]): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}
const INK_L = lum([21, 17, 14]);
const IVORY_L = lum([244, 239, 230]);
/** 店数 n（最大 max）のタイルの色と、その上の文字色（コントラストの高いほう） */
export function tileTone(n: number, max: number): { fill: string; text: string } {
  const t = n <= 0 ? 0 : 0.1 + 0.9 * Math.sqrt(n / Math.max(1, max));
  const c = mixRgb(t);
  const l = lum(c);
  const ci = (l + 0.05) / (INK_L + 0.05);
  const cw = (IVORY_L + 0.05) / (l + 0.05);
  return { fill: hex(c), text: ci >= cw ? INK : IVORY };
}

/** 2 つの色（#rrggbb）を割合 t で混ぜる */
function blend(a: string, b: string, t: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const x = p(a);
  const y = p(b);
  return "#" + x.map((v, i) => Math.round(v * t + y[i] * (1 - t)).toString(16).padStart(2, "0")).join("");
}
const PAPER = "#faf7f1";
export const LEGEND_GRADIENT = `linear-gradient(90deg, ${hex(LO)}, ${hex(MID)} ${T_STEP * 100}%, ${hex(DK1)} ${T_STEP * 100}%, ${hex(DK2)})`;

/* ───────────── カメラ ───────────── */

const REGION_CAM: Record<string, Cam> = Object.fromEntries(
  MAP_REGIONS.map((r) => {
    const box = boxOfPrefs(r.prefs.map((p) => p.slug));
    return [r.slug, box ? cameraFor(box, 0.6, 3.4, 1) : CAM_HOME];
  }),
);

function camOf(t: Target): Cam {
  if (t.stage === "region" && t.region) return REGION_CAM[t.region] ?? CAM_HOME;
  if (t.stage === "pref" && t.pref) {
    const box = boxOfPrefs([t.pref]);
    return box ? cameraFor(box, 0.12, 8.4) : CAM_HOME;
  }
  return CAM_HOME;
}

/* ───────────── 部品 ───────────── */

export function mapHref(q: { r?: string; p?: string }, open: boolean): string {
  const s = new URLSearchParams();
  if (q.r) s.set("r", q.r);
  if (q.p) s.set("p", q.p);
  if (open) s.set("open", "1");
  const qs = s.toString();
  return qs ? `/map?${qs}` : "/map";
}

interface Props {
  /** いまの目標（押した瞬間に先に動かすため、URL より先に変わることがある） */
  eff: Target;
  open: boolean;
  /** 県 slug → 表示している店数（営業中だけのときはその数） */
  counts: Record<string, number>;
  /** 県 slug → その県の（業種で絞った）店の数。0 なら押せない */
  total: Record<string, number>;
  hl: string | null;
  setHl: (slug: string | null) => void;
  go: (t: Target, e: MouseEvent) => void;
  /** 県の段のピンの地図（親が組み立てる） */
  children?: ReactNode;
  /** 戻るリンク（日本の段では無し） */
  back?: { href: string; label: string; target: Target } | null;
  /** 枠の左上に出す見出しの板（段が変わるたびに文字が現れ直す） */
  plate: { k: string; t: string; s: string };
}

export default function MapStage({ eff, open, counts, total, hl, setHl, go, children, back, plate }: Props) {
  const max = useMemo(() => Math.max(1, ...Object.values(counts)), [counts]);
  const cam = camOf(eff);
  const activeRegion = eff.stage !== "japan" ? getRegionBySlug(eff.region) : undefined;
  const regionSum = (r: MapRegion) => r.prefs.reduce((a, p) => a + (counts[p.slug] ?? 0), 0);
  const regionTotal = (r: MapRegion) => r.prefs.reduce((a, p) => a + (total[p.slug] ?? 0), 0);
  const outlines = useMemo(() => Object.fromEntries(MAP_REGIONS.map((r) => [r.slug, regionOutline(r)])), []);
  const anchors = useMemo(() => Object.fromEntries(MAP_REGIONS.map((r) => [r.slug, regionAnchor(r)])), []);

  const hits: ReactNode[] = [];
  for (const r of MAP_REGIONS) {
    const isActive = activeRegion?.slug === r.slug;
    if (eff.stage === "pref") break;
    if (eff.stage === "region" && isActive) {
      // 県のリンク（0 店は無し）
      for (const p of r.prefs) {
        if ((total[p.slug] ?? 0) === 0) continue;
        const c = cellRect(p.slug);
        if (!c) continue;
        const t: Target = { stage: "pref", region: r.slug, pref: p.slug };
        hits.push(
          <Link
            key={p.slug}
            href={mapHref({ p: p.slug }, open)}
            prefetch={false}
            className="mp-hit mp-hit-pref"
            data-pref={p.slug}
            aria-label={`${p.name} ${counts[p.slug] ?? 0}店`}
            onClick={(e) => go(t, e)}
            onPointerEnter={() => setHl(r.slug)}
            onPointerLeave={() => setHl(null)}
          >
            <rect className="mp-hit-r" x={c.x * U} y={c.y * U} width={c.w * U} height={c.h * U} />
            <rect className="mp-fr-ring mp-fr-ring-bg" x={c.x * U + 1} y={c.y * U + 1} width={c.w * U - 2} height={c.h * U - 2} rx={3} />
            <rect className="mp-fr-ring" x={c.x * U + 1} y={c.y * U + 1} width={c.w * U - 2} height={c.h * U - 2} rx={3} />
          </Link>,
        );
      }
      continue;
    }
    if (regionTotal(r) === 0) continue;
    const t: Target = { stage: "region", region: r.slug };
    // 北海道は県が 1 つだけなので、地方を選ぶ段を飛ばして県へ行く
    const direct = r.prefs.length === 1;
    const dt: Target = direct ? { stage: "pref", region: r.slug, pref: r.prefs[0].slug } : t;
    hits.push(
      <Link
        key={r.slug}
        href={direct ? mapHref({ p: r.prefs[0].slug }, open) : mapHref({ r: r.slug }, open)}
        prefetch={false}
        className="mp-hit mp-hit-region"
        data-region={r.slug}
        aria-label={`${r.label} ${regionSum(r)}店${direct ? "" : "。県を選びます"}`}
        onClick={(e) => go(dt, e)}
        onPointerEnter={() => setHl(r.slug)}
        onPointerLeave={() => setHl(null)}
        onFocus={() => setHl(r.slug)}
        onBlur={() => setHl(null)}
      >
        {r.prefs.map((p) => {
          const c = cellRect(p.slug);
          return c ? <rect key={p.slug} className="mp-hit-r" x={c.x * U} y={c.y * U} width={c.w * U} height={c.h * U} /> : null;
        })}
        <path className="mp-fr-ring mp-fr-ring-bg" d={outlines[r.slug]} />
        <path className="mp-fr-ring" d={outlines[r.slug]} />
      </Link>,
    );
  }

  // 県の段では、そのタイルの色（店数の濃淡）を薄く敷く＝タイルが開いて図になったことが色で分かる
  const prefN = eff.stage === "pref" && eff.pref ? (counts[eff.pref] ?? 0) : 0;
  const tint = eff.stage === "pref" ? blend(tileTone(prefN, max).fill, PAPER, 0.2) : PAPER;
  const style = { ["--tint" as string]: tint } as CSSProperties;
  const wmLen = Array.from(plate.t).length;
  const stageName = eff.stage === "japan" ? "日本" : eff.stage === "region" ? (activeRegion?.label ?? "") : (eff.pref ?? "");

  return (
    <div className="mp-fr" data-stage={eff.stage} data-region={eff.region ?? ""} style={style}>
      <svg className="mp-fr-svg" viewBox={`${-PAD} ${-PAD} ${W + PAD * 2} ${H + PAD * 2}`} role="group" aria-label={`デフォルメした日本地図（${stageName}）`} focusable="false">
        <defs>
          <pattern id="mp-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={INK} strokeOpacity=".16" strokeWidth="1.2" />
          </pattern>
        </defs>
        <g className="mp-fr-grid" aria-hidden="true">
          {Array.from({ length: MAP_GRID.cols + 1 }, (_, i) => (
            <line key={`v${i}`} x1={i * U} y1={0} x2={i * U} y2={H} />
          ))}
          {Array.from({ length: MAP_GRID.rows + 1 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * U} x2={W} y2={i * U} />
          ))}
        </g>
        <g className="mp-cam" style={{ transform: `translate(${cam.x * U}px, ${cam.y * U}px) scale(${cam.z})` }}>
          <g className="mp-sea" data-show={eff.stage === "japan" ? "1" : undefined} aria-hidden="true">
            <text className="mp-sea-t" x={3.4 * U} y={3.1 * U}>
              日本海
            </text>
            <text className="mp-sea-t" x={4.3 * U} y={9.9 * U}>
              太平洋
            </text>
          </g>
          {MAP_REGIONS.map((r) => {
            const isActive = activeRegion?.slug === r.slug;
            const dim = eff.stage !== "japan" && !isActive;
            return (
              <g
                key={r.slug}
                className="mp-reg"
                data-region={r.slug}
                data-dim={dim ? "1" : undefined}
                data-hl={hl === r.slug && eff.stage !== "pref" ? "1" : undefined}
              >
                {r.prefs.map((p) => {
                  const c = cellRect(p.slug);
                  if (!c) return null;
                  const n = counts[p.slug] ?? 0;
                  const none = (total[p.slug] ?? 0) === 0;
                  const tone = tileTone(n, max);
                  return (
                    <rect
                      key={p.slug}
                      className="mp-tile"
                      data-pref={p.slug}
                      data-off={none ? "1" : undefined}
                      data-sel={eff.stage === "pref" && eff.pref === p.slug ? "1" : undefined}
                      x={c.x * U + GAP_U / 2}
                      y={c.y * U + GAP_U / 2}
                      width={c.w * U - GAP_U}
                      height={c.h * U - GAP_U}
                      rx={2.5}
                      fill={none ? undefined : tone.fill}
                      style={{ ["--d" as string]: MAP_GRID.cols - 1 - c.x + c.y } as CSSProperties}
                    />
                  );
                })}
                <path className="mp-reg-line" d={outlines[r.slug]} />
              </g>
            );
          })}

          {/* 地図の上に直接書く文字（読み上げには出さない。リンクの aria-label と一覧が同じ内容） */}
          <g className="mp-labs" aria-hidden="true">
            {MAP_REGIONS.map((r) => {
              const a = anchors[r.slug];
              const rc = REGION_CAM[r.slug] ?? CAM_HOME;
              const showJ = eff.stage === "japan";
              const showR = eff.stage === "region" && activeRegion?.slug === r.slug;
              const hover = eff.stage === "japan" && hl === r.slug && r.prefs.length > 1;
              return (
                <g key={r.slug} className="mp-lab" data-region={r.slug}>
                  <g className="mp-lab-j" data-show={showJ ? "1" : undefined} transform={`translate(${a.x * U} ${a.y * U})`}>
                    <text className="mp-lab-t" y={-3} textAnchor="middle">
                      {r.block}
                    </text>
                    <text className="mp-lab-c" y={14} textAnchor="middle">
                      {regionSum(r)}
                    </text>
                  </g>
                  <g className="mp-lab-r" data-show={showR ? "1" : undefined}>
                    {r.prefs.map((p) => {
                      const c = cellRect(p.slug);
                      if (!c) return null;
                      const n = counts[p.slug] ?? 0;
                      const none = (total[p.slug] ?? 0) === 0;
                      const tone = tileTone(n, max);
                      const k = 1 / rc.z;
                      return (
                        <g
                          key={p.slug}
                          transform={`translate(${(c.x + c.w / 2) * U} ${(c.y + c.h / 2) * U}) scale(${k})`}
                          style={{ ["--tc" as string]: none ? "var(--ink-3)" : tone.text } as CSSProperties}
                          data-off={none ? "1" : undefined}
                        >
                          <text className="mp-pt" y={-2} textAnchor="middle">
                            {p.short}
                          </text>
                          <text className="mp-pn" y={20} textAnchor="middle">
                            {n}店
                          </text>
                        </g>
                      );
                    })}
                  </g>
                  {hover &&
                    r.prefs.map((p) => {
                      const c = cellRect(p.slug);
                      if (!c) return null;
                      const tone = tileTone(counts[p.slug] ?? 0, max);
                      return (
                        <text
                          key={p.slug}
                          className="mp-ph"
                          x={(c.x + c.w / 2) * U}
                          y={(c.y + c.h / 2) * U + 15}
                          textAnchor="middle"
                          style={{ ["--tc" as string]: (total[p.slug] ?? 0) === 0 ? "var(--ink-3)" : tone.text } as CSSProperties}
                        >
                          {p.short}
                        </text>
                      );
                    })}
                </g>
              );
            })}
          </g>

          <g className="mp-hits">{hits}</g>
        </g>
      </svg>

      {eff.stage === "pref" && (
        <p className="mp-fr-wm" aria-hidden="true" key={eff.pref} style={{ fontSize: `${Math.min(46, 108 / Math.max(wmLen, 2.2))}cqw` }}>
          {plate.t}
        </p>
      )}

      {children}

      <div className="mp-fr-ui">
        <div className="mp-fr-plate" key={`${eff.stage}|${eff.region ?? ""}|${eff.pref ?? ""}`}>
          <p className="mp-fr-k">{plate.k}</p>
          <p className="mp-fr-t">{plate.t}</p>
          <p className="mp-fr-s">{plate.s}</p>
        </div>
        {back && (
          <Link href={back.href} prefetch={false} className="mp-fr-back" onClick={(e) => go(back.target, e)}>
            <span aria-hidden="true">←</span>
            {back.label}
          </Link>
        )}
        {eff.stage === "japan" && (
          <>
            <p className="mp-fr-legend">
              <span className="mp-fr-lg-t">店の数</span>
              <i className="mp-fr-lg-bar" style={{ background: LEGEND_GRADIENT }} />
              <span className="mp-fr-lg-e">少 ← → 多</span>
              <i className="mp-fr-lg-off" />
              <span className="mp-fr-lg-e">0店</span>
            </p>
            <p className="mp-fr-note">県をタイルにした概念図です。距離や面積は表しません。</p>
          </>
        )}
      </div>
    </div>
  );
}
