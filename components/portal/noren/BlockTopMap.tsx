import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import BlockTopReveal from "./BlockTopReveal";
import { SPECS, layoutJp, tipY, type JpLayout, type JpRegion } from "@/lib/portal/noren/jpBand";

/**
 * 入口の「地図で見つける」の帯の地図: 日本全体（あらかじめ画像にした全国図。e = 手描き風・g = 夜の灯り。public/_portal/illust-map/<e|g>-japan.webp）に、
 * 掲載店のある地域ごとの目印（ピン + 地域名 + 件数）を立てる。目印を押すと /search?region=<地域のキー>（「さがす」のページ。その地域のピンが立つ）、地図のほかの所は /search。
 * - サーバーの部品（リンクはふつうの <a href>。JavaScript が動かなくても押せる・見える）。Leaflet は使わない（地図は動かさない）。
 * - 目印の置き方は lib/portal/noren/jpBand.ts（縦長 p と横長 l の 2 つを作り、画面の形で CSS が選ぶ）。関西・関東は本当の位置では重なって押せないので、蜂の巣の升目にずらして置き、
 *   本当の位置とは点線でつなぐ。ピンが立つ動きは、箱が画面に入ったとき 1 回（BlockTopReveal が合図。CSS の vMpDrop = 「さがす」のピンの落ち方と同じ。落ちる遅れも同じ式）。
 * - 出典の表記（国土地理院ベクトルタイル）は、帯の右下に出す（上下のぼかしより上）。
 */

// 同じ地域の一覧なら同じ置き方（サーバーで毎回計算しない）
const cache = new Map<string, JpLayout[]>();
function layoutsFor(regions: readonly JpRegion[]): JpLayout[] {
  const sig = JSON.stringify(regions.map((r) => [r.key, r.name, r.count, r.lat, r.lng]));
  let l = cache.get(sig);
  if (!l) {
    l = [layoutJp(regions, SPECS.p), layoutJp(regions, SPECS.l)];
    cache.set(sig, l);
  }
  return l;
}

const pct = (v: number, of: number) => `${Math.round((v / of) * 1e5) / 1e3}%`;

export default function BlockTopMap({ regions, mode, children }: { regions: JpRegion[]; /** 地図の絵: e = 手描き風（明るい）、g = 夜の灯り（暗い地に合う） */ mode: "e" | "g"; children?: ReactNode }) {
  const layouts = layoutsFor(regions);
  const [lp, ll] = layouts;
  const byKey = new Map(regions.map((r) => [r.key, r]));
  // 目印（Tab で巡る順）は、北から南へ（同じ高さなら西から東へ）
  const order = [...regions].sort((a, b) => b.lat - a.lat || a.lng - b.lng).map((r) => r.key);
  // 立つ順は、全体の真ん中に近い地域から（「さがす」の地域のピンと同じ。遅れの式も同じ (i % 36) * 70 + 250ms）
  const cLat = regions.reduce((s, r) => s + r.lat, 0) / Math.max(1, regions.length);
  const cLng = regions.reduce((s, r) => s + r.lng, 0) / Math.max(1, regions.length);
  const rank = new Map(
    [...regions]
      .sort((a, b) => Math.hypot(a.lat - cLat, (a.lng - cLng) * 0.82) - Math.hypot(b.lat - cLat, (b.lng - cLng) * 0.82) || a.key.localeCompare(b.key))
      .map((r, i) => [r.key, i] as const),
  );
  const mk = (id: "p" | "l", key: string) => (id === "p" ? lp : ll).markers.find((m) => m.key === key)!;
  const imgVars = Object.fromEntries(
    layouts.flatMap((L) => [
      [`--il-${L.id}`, `${L.img.left}%`],
      [`--it-${L.id}`, `${L.img.top}%`],
      [`--iw-${L.id}`, `${L.img.width}%`],
    ]),
  ) as CSSProperties;
  return (
    <div className="vBkt-band">
      <div className="vBkt-map">
        <div className="vBkt-jpw">
          <BlockTopReveal className="vBkt-jp" label="日本地図。地域の目印を押すと、その地域の店のさがすページへ進みます">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="vBkt-jp-img" src={`/_portal/illust-map/${mode}-japan.webp`} width={2600} height={2022} alt="" loading="lazy" decoding="async" draggable={false} style={imgVars} />
            {/* 地図のほかの所を押すと「さがす」のページへ（キーボードは下の「エリアから探す」と同じ行き先なので、Tab の順には入れない） */}
            <Link href="/search" className="vBkt-jp-all" aria-hidden="true" tabIndex={-1} prefetch={false} />
            {layouts.map((L) => (
              <svg key={L.id} className={`vBkt-ld vBkt-ld--${L.id}`} viewBox={`0 0 ${L.W} ${L.H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
                {L.markers
                  .filter((m) => m.lead)
                  .map((m) => (
                    <g key={m.key} className="vBkt-ld-g" style={{ ["--d" as string]: `${((rank.get(m.key) ?? 0) % 36) * 70 + 250}ms` }}>
                      <line x1={m.ax} y1={m.ay} x2={m.cx} y2={tipY(m.cy)} />
                      <circle cx={m.ax} cy={m.ay} r={2.6} />
                    </g>
                  ))}
              </svg>
            ))}
            <ul className="vBkt-rgs" aria-label="地域から探す">
              {order.map((key) => {
                const r = byKey.get(key)!;
                const a = mk("p", key);
                const b = mk("l", key);
                const st = {
                  ["--w" as string]: `${a.w}px`,
                  ["--px" as string]: pct(a.cx, lp.W),
                  ["--py" as string]: pct(a.cy, lp.H),
                  ["--lx" as string]: pct(b.cx, ll.W),
                  ["--ly" as string]: pct(b.cy, ll.H),
                  ["--d" as string]: `${((rank.get(key) ?? 0) % 36) * 70 + 250}ms`,
                } as CSSProperties;
                return (
                  <li key={key} style={st}>
                    <Link href={`/search?region=${encodeURIComponent(key)}`} className="vBkt-rg" aria-label={`${r.name} ${r.count}軒`} prefetch={false}>
                      <span className="vBkt-rg-in">
                        <span className="vBkt-pin" aria-hidden="true">
                          <i />
                          <b>{r.count}</b>
                        </span>
                        <span className="vBkt-nm" aria-hidden="true">
                          {r.name}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </BlockTopReveal>
        </div>
      </div>
      {children}
      {/* 出典の表記。帯の右下（上下のぼかしより上に出すので、舞台の外に置く） */}
      <p className="vBkt-credit">地図: 国土地理院ベクトルタイルをもとに作成</p>
    </div>
  );
}
