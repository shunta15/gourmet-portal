"use client";
/**
 * 地図のピンを押したときに出る「店の情報の札」（ShopMap の a・e・f・g・h と、入口の帯の地図で共通）。写真つきの札は地図に立てない（ピンだけ）。
 *  - 1 軒: 店の写真 1 枚・店名・エリアと最寄り駅・業種・「店のページへ →」。店のデータにある事実だけ（星・評価の数字・「おすすめ」などは出さない）。
 *  - 画面上で近いピンが 2 つ以上（CLUSTER_PX 以内）: その場所の店の一覧（店名を並べる。最大 LIST_MAX 軒 + 「ほか n 軒」）。選ぶとその店の情報に替わる（「← この辺りの店」で一覧へ戻れる）。
 *  - 置き場所: PC は、押したピンの上（入らなければ下、それも入らなければ横）に、地図の箱の中へ収めて出す。スマホ（幅 520 未満）は、吹き出しではなく、箱の下の端に出る横長の札。
 *  - 閉じる: ×・もう一度同じピン・札の外（地図の面）・Esc（呼び出し側）。動かすのは opacity と transform だけ。
 */
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { MapPt } from "./ShopMap";

/** 札の幅（PC。px） */
export const CARD_W = 256;
/** 一覧に並べる店の最大数 */
export const LIST_MAX = 8;
/** 画面上でこの距離（px）以内のピンは「重なっている」とみなし、押したら一覧にする */
export const CLUSTER_PX = 22;
/** 幅がこれ未満の箱は、吹き出しでなく下の端の横長の札 */
export const NARROW_PX = 520;

/** 押されたピン（origin）と、その場所の店（ids。2 軒以上なら一覧）。id が入っていれば、その 1 軒の情報。ax・ay は、札を置く面（箱または host）での、ピンの先の位置 */
export type PinSel = { origin: string; ids: string[]; id: string | null; ax: number; ay: number; bw: number; bh: number; narrow: boolean; byKey: boolean };

/** 最寄り駅の表示: 「路線… 駅名駅 出口 徒歩N分」から、駅名と徒歩だけ。取り出せなければ、データのまま（長ければ切る） */
export function stationOf(nearest?: string): string {
  const s = (nearest ?? "").trim();
  if (!s) return "";
  const m = s.match(/([^\s・、,/「」『』（）()]+駅)[」』)）]?(?:\s*[A-Za-zＡ-Ｚ]?\d*\s*番?出口)?\s*(徒歩\s*(?:約\s*)?\d+\s*分|徒歩圏)?/);
  if (m) return m[1] + (m[2] ? ` ${m[2].replace(/\s/g, "")}` : "");
  return s.length > 28 ? `${s.slice(0, 28)}…` : s;
}

/** 札を置く位置（PC）。ピンの上 → 下 → 横の順に、箱の中へ収まる所を選ぶ */
function place(ax: number, ay: number, bw: number, bh: number, h: number): CSSProperties {
  const H = h || 250;
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));
  let left = clamp(ax - CARD_W / 2, 8, bw - CARD_W - 8);
  let top: number;
  if (ay - 46 - H >= 8) top = ay - 46 - H;
  else if (ay + 12 + H <= bh - 8) top = ay + 12;
  else {
    top = clamp(ay - H / 2, 8, bh - H - 8);
    left = ax + 26 + CARD_W <= bw - 8 ? ax + 26 : Math.max(8, ax - 26 - CARD_W);
  }
  return { left, top, width: CARD_W, maxHeight: Math.max(120, bh - 16) };
}

export default function PinCard({
  byId,
  sel,
  host,
  onPick,
  onBack,
  onClose,
}: {
  byId: Map<string, MapPt>;
  sel: PinSel;
  /** 札を出す先（入口の帯のように、地図の箱の外へ出したいとき）。無ければ、呼び出し側が置いた場所にそのまま */
  host?: HTMLElement | null;
  onPick: (id: string) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  const one = sel.id ? byId.get(sel.id) : undefined;
  const list = sel.ids.map((i) => byId.get(i)).filter((p): p is MapPt => !!p);
  // 高さを測ってから位置を決める（描く前に済むので、ちらつかない）
  useLayoutEffect(() => {
    if (ref.current) setH(ref.current.offsetHeight);
  }, [sel.id, sel.ids.length, sel.narrow, sel.origin]);
  // キーボード（Enter）で開いたときは、札へフォーカスを移す（位置が決まって見えてから。Tab で札の中のボタン・リンクへ進める。Esc で閉じるとピンへ戻る）
  useEffect(() => {
    if (sel.byKey && h) ref.current?.focus({ preventScroll: true });
  }, [sel.byKey, sel.origin, sel.id, h]);
  const style = sel.narrow ? undefined : { ...place(sel.ax, sel.ay, sel.bw, sel.bh, h), visibility: (h ? "visible" : "hidden") as CSSProperties["visibility"] };
  const station = one ? stationOf(one.nearest) : "";
  const node = (
    <div
      ref={ref}
      className={`vMp-card${sel.narrow ? " vMp-card--sheet" : ""}${one ? " is-one" : " is-list"}${one?.photo ? " has-ph" : ""}`}
      style={style}
      role="dialog"
      aria-label={one ? `${one.name}の情報` : "この辺りの店"}
      tabIndex={-1}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button type="button" className="vMp-card-x" aria-label="閉じる" onClick={onClose}>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
      </button>
      {one ? (
        <>
          {one.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="vMp-card-ph" src={one.photo} alt="" loading="lazy" />
          ) : null}
          <div className="vMp-card-b">
            <b className="vMp-card-nm">{one.name}</b>
            <span className="vMp-card-m">
              {one.area}
              {station ? `・${station}` : ""}
            </span>
            <span className="vMp-card-c">{one.cuisine}</span>
            <Link className="vMp-card-a" href={`/restaurant/${encodeURIComponent(one.id)}`}>
              店のページへ →
            </Link>
            {list.length > 1 && (
              <button type="button" className="vMp-card-back" onClick={onBack}>
                ← この辺りの店（{list.length} 軒）
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="vMp-card-b">
          <b className="vMp-card-h">この辺りの店（{list.length} 軒）</b>
          <ul className="vMp-card-l">
            {list.slice(0, LIST_MAX).map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => onPick(p.id)}>
                  <span className="vMp-card-ln">{p.name}</span>
                  <span className="vMp-card-lm">{p.cuisine}</span>
                </button>
              </li>
            ))}
          </ul>
          {list.length > LIST_MAX && <p className="vMp-card-more">ほか {list.length - LIST_MAX} 軒（地図を拡大すると、ピンが分かれます）</p>}
        </div>
      )}
    </div>
  );
  return host ? createPortal(node, host) : node;
}
