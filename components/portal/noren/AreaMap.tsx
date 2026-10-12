import Link from "next/link";
import { useMemo, type CSSProperties } from "react";
import { ILLUST_AREA } from "@/lib/portal/noren/illustMaps.generated";
import { layoutArea, type AreaLayout, type AreaMarker, type AreaRegion } from "@/lib/portal/noren/areaMap";
import "./areasearch.css";

export type AreaMapRegion = AreaRegion & { href: string };

/**
 * 「さがす」の地方の地図（?area=<地方のキー>）: その地方の手描き風の地図（あらかじめ画像にした e の絵。public/_portal/illust-map/e-<地方のキー>.webp）に、
 * 掲載店のある地域ごとの丸（件数）と地域名を立てる。丸を押すと、その地域（?region=<地域のキー>）の地図と店のピンへ。
 * - 絵と丸は、画像の縦横比のままの舞台に置く。丸の置き方は lib/portal/noren/areaMap.ts（スマホ用 p・広い画面用 l の 2 つを作り、舞台の幅で CSS が選ぶ）。重なる所は近くの空きへずらし、本当の位置とは点線でつなぐ。
 * - リンクは <a href>（JavaScript が動かなくても押せる・見える）。動きは、丸が上から落ちて立つだけ（CSS。「動きを減らす」設定では最初から立っている）。
 * - 出典の表記は、舞台の下の 1 行。
 */
const pct = (v: number, of: number) => `${Math.round((v / of) * 1e5) / 1e3}%`;

export default function AreaMap({ areaKey, label, regions }: { areaKey: string; label: string; regions: AreaMapRegion[] }) {
  const entry = ILLUST_AREA[areaKey];
  const layouts = useMemo<AreaLayout[] | null>(() => (entry ? [layoutArea(regions, entry.bounds, entry.w, entry.h, "p"), layoutArea(regions, entry.bounds, entry.w, entry.h, "l")] : null), [entry, regions]);
  if (!entry || !layouts) return null;
  const [lp, ll] = layouts;
  const byKey = new Map(regions.map((r) => [r.key, r]));
  // Tab で巡る順は、北から南へ（同じ高さなら西から東へ）
  const order = [...regions].sort((a, b) => b.lat - a.lat || a.lng - b.lng).map((r) => r.key);
  // 立つ順: 目印の中心に近い地域から。遅れの式は「さがす」の地域のピンと同じ ((i % 36) * 70 + 250ms)
  const cLat = regions.reduce((s, r) => s + r.lat, 0) / Math.max(1, regions.length);
  const cLng = regions.reduce((s, r) => s + r.lng, 0) / Math.max(1, regions.length);
  const rank = new Map([...regions].sort((a, b) => Math.hypot(a.lat - cLat, (a.lng - cLng) * 0.82) - Math.hypot(b.lat - cLat, (b.lng - cLng) * 0.82) || a.key.localeCompare(b.key)).map((r, i) => [r.key, i] as const));
  const mk = (L: AreaLayout, key: string): AreaMarker => L.markers.find((m) => m.key === key)!;
  const stageVars = { ["--ar" as string]: entry.w / entry.h } as CSSProperties;
  return (
    <figure className="vAm">
      <div className="vAm-stage" style={stageVars} role="group" aria-label={`${label}の地図。地域の丸を押すと、その地域の店に絞り込みます`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="vAm-img" src={entry.src} width={entry.w} height={entry.h} alt="" decoding="async" draggable={false} />
        {layouts.map((L) => (
          <svg key={L.id} className={`vAm-ld vAm-ld--${L.id}`} viewBox={`0 0 ${L.W} ${L.H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
            {L.markers
              .filter((m) => m.lead)
              .map((m) => (
                <g key={m.key} className="vAm-ld-g" style={{ ["--d" as string]: `${((rank.get(m.key) ?? 0) % 36) * 70 + 250}ms` }}>
                  <line x1={m.ax} y1={m.ay} x2={m.cx} y2={m.cy} />
                  <circle cx={m.ax} cy={m.ay} r={2.6} />
                </g>
              ))}
          </svg>
        ))}
        <ul className="vAm-rg" aria-label={`${label}の地域`}>
          {order.map((key) => {
            const r = byKey.get(key)!;
            const a = mk(lp, key);
            const b = mk(ll, key);
            const off = a.off ?? b.off;
            const st = {
              ["--w" as string]: `${a.w}px`,
              ["--h" as string]: `${a.h}px`,
              ["--s" as string]: `${a.d}px`,
              ["--px" as string]: pct(a.cx, lp.W),
              ["--py" as string]: pct(a.cy, lp.H),
              ["--lx" as string]: pct(b.cx, ll.W),
              ["--ly" as string]: pct(b.cy, ll.H),
              ["--d" as string]: `${((rank.get(key) ?? 0) % 36) * 70 + 250}ms`,
            } as CSSProperties;
            return (
              <li key={key} style={st}>
                <Link href={r.href} className="vAm-c" aria-label={`${r.name} ${r.count}軒`} prefetch={false}>
                  <span className="vAm-disc" aria-hidden="true">
                    <b>{r.count}</b>
                  </span>
                  <span className="vAm-nm" aria-hidden="true">
                    {off ? `${off.arw}${r.name}` : r.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <figcaption className="vAm-credit">地図: 国土地理院ベクトルタイルをもとに作成</figcaption>
    </figure>
  );
}
