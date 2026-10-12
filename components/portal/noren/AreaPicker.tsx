import Link from "next/link";
import { useMemo, type CSSProperties } from "react";
import { AREA_FIGURE } from "@/lib/portal/noren/areaFigure.generated";
import { layoutPick, type PickLayout } from "@/lib/portal/noren/areaPick";
import { AREA_DEFS } from "@/lib/portal/noren/areaGroups";
import "./areasearch.css";

export type AreaCard = {
  key: string;
  label: string;
  /** その地方の店の数（いまの絞り込みを掛けたあと。0 の地方は渡さない） */
  count: number;
  /** その地方で店のある地域の名前（店の数の多い順） */
  regions: string[];
  /** 押した先（?area=<地方のキー>） */
  href: string;
  /** 丸の本当の位置（その地方の店の座標の中央値） */
  lat: number;
  lng: number;
};

/**
 * 「さがす」の入口（地方も地域も選んでいないとき。日本全体の大きな地図は出さない）: 地方を選ぶ入口。2 つの部品:
 *  - AreaFigure（箱の左。スマホは上）: 小さな日本の図。地方ごとに色分けした手描き風（輪郭は lib/portal/noren/areaFigure.generated.ts）。地方（色の面）を押すと、その地方（?area=）へ。地方ごとに件数の丸が立つ（丸が上から落ちて立つ動き。丸も押せる（押す範囲は 44px 以上））。
 *  - AreaCards（「エリア」のタブの一覧。箱の右。スマホは下）: 地方の札（地方名 + 件数 + その地方の地域の名前）。店のある地方だけ。押すと、その地方（?area=）へ。
 * 図は目で見る補助（aria-hidden・Tab の順に入れない）。キーボードや読み上げは、札のリンクを使う。リンクはふつうの <a href>（JavaScript が動かなくても押せる）。
 */
const pct = (v: number, of: number) => `${Math.round((v / of) * 1e5) / 1e3}%`;

export function AreaFigure({ cards }: { cards: AreaCard[] }) {
  const layout = useMemo<PickLayout>(() => layoutPick(cards.map((c) => ({ key: c.key, count: c.count, lat: c.lat, lng: c.lng }))), [cards]);
  const on = new Set(cards.map((c) => c.key));
  const byKey = new Map(cards.map((c) => [c.key, c]));
  // 立つ順は、北から南へ
  const rank = new Map(cards.map((c, i) => [c.key, i] as const));
  const d = (key: string) => `${(rank.get(key) ?? 0) * 110 + 250}ms`;
  const mk = (key: string) => layout.markers.find((m) => m.key === key)!;
  const figVars = { ["--ar" as string]: AREA_FIGURE.w / AREA_FIGURE.h } as CSSProperties;
  return (
    <figure className="vAp-fig">
        <div className="vAp-stage" style={figVars} aria-hidden="true">
          <svg className="vAp-svg" viewBox={`0 0 ${AREA_FIGURE.w} ${AREA_FIGURE.h}`} preserveAspectRatio="none" focusable="false">
            <rect className="vAp-sea" width={AREA_FIGURE.w} height={AREA_FIGURE.h} />
            {AREA_DEFS.map((a) =>
              on.has(a.key) ? (
                <Link key={a.key} href={byKey.get(a.key)!.href} className="vAp-a" data-k={a.key} tabIndex={-1} prefetch={false}>
                  <path className="vAp-land" d={AREA_FIGURE.areas[a.key]} />
                </Link>
              ) : (
                <path key={a.key} className="vAp-land vAp-land--off" data-k={a.key} d={AREA_FIGURE.areas[a.key]} />
              ),
            )}
            <path className="vAp-coast" d={AREA_FIGURE.coast} />
          </svg>
          <svg className="vAp-ld" viewBox={`0 0 ${layout.W} ${layout.H}`} preserveAspectRatio="none" focusable="false">
            {layout.markers
              .filter((m) => m.lead)
              .map((m) => (
                <g key={m.key} className="vAp-ld-g" style={{ ["--d" as string]: d(m.key) }}>
                  <line x1={m.ax} y1={m.ay} x2={m.cx} y2={m.cy} />
                  <circle cx={m.ax} cy={m.ay} r={2.4} />
                </g>
              ))}
          </svg>
          <ul className="vAp-pins">
            {cards.map((c) => {
              const m = mk(c.key);
              const st = { ["--s" as string]: `${m.d}px`, ["--px" as string]: pct(m.cx, layout.W), ["--py" as string]: pct(m.cy, layout.H), ["--d" as string]: d(c.key) } as CSSProperties;
              return (
                <li key={c.key} style={st} data-k={c.key}>
                  <Link href={c.href} className="vAp-pin" aria-label={`${c.label} ${c.count}軒`} tabIndex={-1} prefetch={false}>
                    <span className="vAp-disc" aria-hidden="true">
                      <b>{c.count}</b>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <figcaption className="vAp-credit">地図: 国土地理院ベクトルタイルをもとに作成</figcaption>
    </figure>
  );
}

export function AreaCards({ cards }: { cards: AreaCard[] }) {
  return (
    <ul className="vAp-cards" aria-label="地方から探す">
      {cards.map((c) => (
        <li key={c.key}>
          <Link href={c.href} className="vAp-card" data-k={c.key} prefetch={false}>
            <span className="vAp-dot" aria-hidden="true" />
            <span className="vAp-ct">
              <b>{c.label}</b>
              <small>{c.regions.join("・")}</small>
            </span>
            <em>
              {c.count}
              <i>軒</i>
            </em>
          </Link>
        </li>
      ))}
    </ul>
  );
}
