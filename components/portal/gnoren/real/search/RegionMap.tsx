"use client";
/**
 * 「地図から探す」の板(さがす)。小さな日本の図(lib/portal/noren/areaFigure.generated.ts の輪郭。「さがす」の旧い入口 AreaPicker と同じ図)に、
 * 掲載店のある地域ごとの丸(件数)を立てる。丸 = /search?region=<地域のキー>(ふつうの <a href>。JavaScript が動かなくても押せる)。
 * 丸の置き方は lib/portal/noren/areaPick.ts の layoutPick(重なる所は近くの空きへずらし、本当の位置とは点線でつなぐ)。狭い板用(p)と広い板用(l)の 2 つを作り、板の幅で CSS が選ぶ。
 * 板を開いたときだけ読み込む(SearchFinder が lazy)。出典の表記は図の下の 1 行。
 */
import Link from "next/link";
import { useMemo, type CSSProperties } from "react";
import { AREA_FIGURE } from "@/lib/portal/noren/areaFigure.generated";
import { layoutPick, type PickLayout } from "@/lib/portal/noren/areaPick";
import { searchHref } from "../common/links";
import type { MapPin } from "./types";

const pct = (v: number, of: number) => `${Math.round((v / of) * 1e5) / 1e3}%`;

export default function RegionMap({ pins }: { pins: MapPin[] }) {
  const layouts = useMemo<PickLayout[]>(() => {
    const items = pins.map((p) => ({ key: p.key, count: p.count, lat: p.lat, lng: p.lng }));
    return [layoutPick(items, 330), layoutPick(items, 560)];
  }, [pins]);
  const byKey = new Map(pins.map((p) => [p.key, p]));
  const [lp, ll] = layouts;
  const mk = (L: PickLayout, key: string) => L.markers.find((m) => m.key === key)!;
  const order = [...pins].sort((a, b) => b.lat - a.lat || a.lng - b.lng);
  return (
    <figure className="gn-search-r-fig">
      <div className="gn-search-r-stage" style={{ "--ar": AREA_FIGURE.w / AREA_FIGURE.h } as CSSProperties} role="group" aria-label="日本の地図。地域の丸を押すと、その地域の店に絞り込みます">
        <svg className="gn-search-r-svg" viewBox={`0 0 ${AREA_FIGURE.w} ${AREA_FIGURE.h}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <rect className="gn-search-r-sea" width={AREA_FIGURE.w} height={AREA_FIGURE.h} />
          {Object.entries(AREA_FIGURE.areas).map(([k, d]) => (
            <path key={k} className="gn-search-r-land" d={d} />
          ))}
          <path className="gn-search-r-coast" d={AREA_FIGURE.coast} />
        </svg>
        {[
          { L: lp, id: "p" },
          { L: ll, id: "l" },
        ].map(({ L, id }) => (
          <svg key={id} className={`gn-search-r-ld gn-search-r-ld--${id}`} viewBox={`0 0 ${L.W} ${L.H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
            {L.markers
              .filter((m) => m.lead)
              .map((m) => (
                <g key={m.key}>
                  <line x1={m.ax} y1={m.ay} x2={m.cx} y2={m.cy} />
                  <circle cx={m.ax} cy={m.ay} r={2.4} />
                </g>
              ))}
          </svg>
        ))}
        <ul className="gn-search-r-pins" aria-label="地域">
          {order.map((p) => {
            const a = mk(lp, p.key);
            const b = mk(ll, p.key);
            const st = {
              "--s": `${a.d}px`,
              "--px": pct(a.cx, lp.W),
              "--py": pct(a.cy, lp.H),
              "--lx": pct(b.cx, ll.W),
              "--ly": pct(b.cy, ll.H),
            } as CSSProperties;
            const pin = byKey.get(p.key)!;
            return (
              <li key={p.key} style={st}>
                <Link href={searchHref({ region: p.key })} className="gn-search-r-pin" aria-label={`${pin.name} ${pin.count}店`} title={`${pin.name} ${pin.count}店`} prefetch={false}>
                  <span className="gn-search-r-disc" aria-hidden="true">
                    <b>{pin.count}</b>
                  </span>
                  {pin.count >= 10 && (
                    <span className="gn-search-r-nm" aria-hidden="true">
                      {pin.name}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <figcaption className="gn-search-r-credit">丸は地域ごとの店の数です。地図: 国土地理院ベクトルタイルをもとに作成</figcaption>
    </figure>
  );
}
