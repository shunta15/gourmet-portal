"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { CELLS, CELL_U, GAP_U, MAP_GRID } from "@/lib/portal/mapRegions";
import { PREFECTURES } from "@/lib/areas/prefectures";

/**
 * 「さがす」の地図（暖簾版）。実物の地図（道路・地名の細かいタイル）は使わない。2 つの見た目を ?map=a|b で見比べられる（既定 a）:
 *  - a「絵図」: 全国は、都道府県を 1 マスにした自作のデフォルメ地図（lib/portal/mapRegions.ts）に店の数。地域を選ぶと、無地の面の上に店を緯度経度の相対位置で点にして置く
 *    （目印に、店の多い市区町村の名前を薄く出す）。タイルは使わない。
 *  - b「線だけの地図」: 地理院の白地図タイル（海岸線・境界の線だけ。ズーム 5〜14）を暖簾の色に寄せる。全国は地域ごとの丸（件数つき）、地域を選ぶと店のピン。
 * 地域を選んだとき・選び直したときは、地図がその地域へなめらかに寄り、店のピンが 1 つずつ少しずつ遅れて上から落ちてきて（(i % 36) * 70 + 250ms。手本の G6 街歩きと同じ考え方）、
 * 写真のある店のうち少し（FLAG_MAX 軒）は、店の写真つきの札として立つ。ピン・札を押すと、写真・店名・エリア・業種の吹き出しと店ページへのリンク。
 * 動かすのは transform と opacity だけ。「動きを減らす」設定では動かさず、すぐ出す。タイマーは使わず（CSS の遅れだけ）、選び直すと前のピンは消す。
 *  - c「手描き風」: 地理院の淡色地図を土台に、タイルの層だけに色を淡くする・線を揺らす・細かい字をぼかすフィルターを掛け、小さな木の飾りを散らす。ピンは橙と紺、札は白い枠で少し傾ける。全国は b と同じ地域ごとの丸。
 * 出典: b・c は「地理院タイル」の表記を地図に出す。新しいパッケージ・有料の地図・ネットからのデータ取得は無い（leaflet は既存。タイルは b の白地図だけ）。
 */

export type MapPt = { id: string; name: string; lat: number; lng: number; area: string; cuisine: string; photo: string; town: string; region: string };
export type MapMode = "a" | "b" | "c";

/** 店の写真つきの札で立てる数（手本の考え方: 写真のある店のうち、重ならない少数。目安 6〜10） */
export const FLAG_MAX = 8;
const BLANK_TILE = "https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png";
const PALE_TILE = "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png";
/** c「手描き風」の飾りの木の数（位置は地域キーから決めるので、毎回同じ場所。店のピン・札の近くには置かない） */
const TREE_MAX = 16;
/** 札（幅 112px・高さ 104px。先は店の位置）が箱の辺で切れないための余白（px）: 上は札の高さ + 先の丸、左右は幅の半分 + すこし */
const FLAG_TOP = 126;
const FLAG_SIDE = 64;

/** 文字列から決まる乱数（毎回同じ並びになる） */
function seeded(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const TREE_SVG =
  '<svg viewBox="0 0 24 30" width="22" height="28" aria-hidden="true"><path d="M12 20v8" stroke="#7a5a3a" stroke-width="2.4" stroke-linecap="round" fill="none"/><circle cx="12" cy="11" r="8" fill="#9bbf8a" fill-opacity=".85"/><circle cx="7.5" cy="14" r="5.5" fill="#86b077" fill-opacity=".85"/><circle cx="16.5" cy="14" r="5.5" fill="#a8c995" fill-opacity=".85"/></svg>';
const JAPAN: [[number, number], [number, number]] = [[30.0, 128.5], [45.8, 146.0]];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const median = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

/** 全国（a）: 都道府県を 1 マスにしたデフォルメ地図。マスの数は、絞り込んだ店のうち住所がその県の店の数（位置の無い店も数える）。押すと、その県の地域で絞り込む */
function GridJapan({ counts, prefRegion, onPick }: { counts: Record<string, number>; prefRegion: Record<string, string>; onPick: (region: string) => void }) {
  const W = MAP_GRID.cols * CELL_U;
  const H = MAP_GRID.rows * CELL_U;
  const max = Math.max(1, ...Object.values(counts));
  const shortOf = useMemo(() => Object.fromEntries(PREFECTURES.map((p) => [p.slug, p.short])), []);
  return (
    <svg className="vMp-grid" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="日本地図（都道府県を 1 マスにした図）。店のある県を押すと、その地域の店に絞り込みます">
      {Object.entries(CELLS).map(([slug, c], i) => {
        const [col, row, w = 1, h = 1] = c;
        const n = counts[slug] ?? 0;
        const region = prefRegion[slug];
        const on = n > 0 && !!region;
        const x = col * CELL_U + GAP_U / 2;
        const y = row * CELL_U + GAP_U / 2;
        const cw = w * CELL_U - GAP_U;
        const ch = h * CELL_U - GAP_U;
        const t = on ? 0.28 + 0.62 * Math.sqrt(n / max) : 0;
        return (
          <g
            key={slug}
            className={`vMp-cell${on ? " on" : ""}`}
            style={{ ["--i" as string]: Math.min(i, 40) }}
            role={on ? "link" : undefined}
            tabIndex={on ? 0 : undefined}
            aria-label={on ? `${shortOf[slug] ?? slug} ${n} 軒` : undefined}
            onClick={on ? () => onPick(region) : undefined}
            onKeyDown={on ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPick(region)) : undefined}
          >
            <rect x={x} y={y} width={cw} height={ch} rx={3} className="vMp-cell-bg" style={on ? { fillOpacity: t } : undefined} />
            <text x={x + cw / 2} y={y + ch / 2 - 3} className="vMp-cell-n" textAnchor="middle" textLength={(shortOf[slug] ?? slug).length >= 3 && cw < CELL_U ? cw - 6 : undefined} lengthAdjust="spacingAndGlyphs">{shortOf[slug] ?? slug}</text>
            {on && <text x={x + cw / 2} y={y + ch / 2 + 12} className="vMp-cell-c" textAnchor="middle">{n}</text>}
          </g>
        );
      })}
    </svg>
  );
}

/** 地域を選んだとき（a・b）と、全国の b: leaflet。a はタイル無し（無地の面）、b は地理院の白地図 */
function LeafMap({
  mode,
  regionKey,
  pts,
  circles,
  onPick,
  reduce,
}: {
  mode: MapMode;
  regionKey: string;
  pts: MapPt[];
  circles: { key: string; name: string; count: number; lat: number; lng: number }[];
  onPick: (region: string) => void;
  reduce: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const st = useRef<{ L: typeof import("leaflet"); map: import("leaflet").Map; layer: import("leaflet").LayerGroup } | null>(null);
  const [ready, setReady] = useState(false);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const key = useMemo(() => JSON.stringify([mode, regionKey, pts.map((p) => p.id), circles.map((c) => [c.key, c.count])]), [mode, regionKey, pts, circles]);

  // 地図を作る（mode・動きの設定が替わったときだけ作り直す）。後始末: 地図を破棄
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let ro: ResizeObserver | null = null;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !ref.current) return;
      const map = L.map(ref.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: mode !== "a",
        zoomSnap: 0.25,
        minZoom: mode === "a" ? 3 : 5,
        maxZoom: mode === "b" ? 14 : mode === "c" ? 18 : 17,
        zoomAnimation: !reduce,
        fadeAnimation: !reduce,
        markerZoomAnimation: !reduce,
      });
      if (mode === "b") {
        L.tileLayer(BLANK_TILE, {
          minZoom: 5,
          maxZoom: 14,
          attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>',
        }).addTo(map);
      }
      if (mode === "c") {
        // c「手描き風」: 地理院の淡色地図を土台に、タイルの層だけに CSS・SVG のフィルターを掛ける（scenesearch.css）
        L.tileLayer(PALE_TILE, {
          minZoom: 5,
          maxZoom: 18,
          attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>',
        }).addTo(map);
      }
      map.fitBounds(JAPAN, { animate: false });
      const layer = L.layerGroup().addTo(map);
      st.current = { L, map, layer };
      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(ref.current);
      setReady(true);
    })();
    return () => {
      cancelled = true;
      ro?.disconnect();
      st.current?.map.stop();
      st.current?.map.remove();
      st.current = null;
      setReady(false);
    };
  }, [mode, reduce]);

  // ピン・札・丸を置き直し、地図をそこへ寄せる。選び直したら、前のものは消す（CSS の遅れだけで動かしているので、残るタイマーは無い）
  useEffect(() => {
    const s = st.current;
    if (!ready || !s) return;
    const { L, map, layer } = s;
    map.stop();
    map.closePopup();
    layer.clearLayers();
    const bb = L.latLngBounds([]);
    const delayOf = (i: number) => (reduce ? 0 : (i % 36) * 70 + 250);

    if (!regionKey && mode !== "a") {
      // 全国（b）: 地域ごとの丸（件数つき）。押すとその地域で絞り込む
      circles.forEach((c, i) => {
        const size = Math.round(28 + 4.5 * Math.sqrt(c.count));
        const icon = L.divIcon({
          className: "vMp-mk",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          html: `<div class="vMp-circ" style="--s:${size}px;animation-delay:${delayOf(i)}ms"><b>${c.count}</b><span>${esc(c.name)}</span></div>`,
        });
        const m = L.marker([c.lat, c.lng], { icon, title: `${c.name} ${c.count}軒`, zIndexOffset: -c.count }).addTo(layer);
        m.on("click", () => onPickRef.current(c.key));
        bb.extend([c.lat, c.lng]);
      });
      if (reduce) map.fitBounds(JAPAN, { animate: false });
      else map.flyToBounds(JAPAN, { duration: 0.9 });
      return;
    }

    // 店のピン。写真のある店のうち、重ならない少数（FLAG_MAX 軒）は写真つきの札
    pts.forEach((p) => bb.extend([p.lat, p.lng]));
    // 寄せる範囲: 店が多いときは、はずれ値（遠く離れた数軒）を除いた中央の約 88%（上下 6% を除く）に合わせる。除いた店は、地図を動かせば見える
    const quant = (a: number[], t: number) => {
      const v = [...a].sort((x, y) => x - y);
      const i = (v.length - 1) * t;
      return v[Math.floor(i)] + (v[Math.ceil(i)] - v[Math.floor(i)]) * (i - Math.floor(i));
    };
    const fit = pts.length > 12 ? L.latLngBounds([quant(pts.map((p) => p.lat), 0.06), quant(pts.map((p) => p.lng), 0.06)], [quant(pts.map((p) => p.lat), 0.94), quant(pts.map((p) => p.lng), 0.94)]) : bb;
    const span = pts.length > 1 ? Math.max(fit.getNorth() - fit.getSouth(), fit.getEast() - fit.getWest()) : 0.1;
    const minD = span / 3.6; // 札（幅 112px）どうしが重ならない程度に離す（8 軒まで）
    const flags = new Set<string>();
    const picked: MapPt[] = [];
    for (const p of pts) {
      if (flags.size >= FLAG_MAX) break;
      if (!p.photo) continue;
      if (!fit.contains([p.lat, p.lng])) continue; // 寄せる範囲の外の店は札にしない（札が箱の辺で切れないように）
      if (picked.every((q) => Math.hypot(q.lat - p.lat, q.lng - p.lng) > minD)) {
        flags.add(p.id);
        picked.push(p);
      }
    }
    pts.forEach((p, i) => {
      const delay = delayOf(i);
      const isFlag = flags.has(p.id);
      const icon = isFlag
        ? L.divIcon({
            className: "vMp-mk",
            iconSize: [112, 104],
            iconAnchor: [56, 104],
            popupAnchor: [0, -100],
            html: `<div class="vMp-flag${mode === "c" ? " vMp-flag--c" : ""}" style="animation-delay:${delay}ms${mode === "c" ? `;--tilt:${i % 2 === 0 ? -2.5 : 2.5}deg` : ""}"><img src="${esc(p.photo)}" alt="" loading="lazy" /><b>${esc(p.name)}</b></div>`,
          })
        : L.divIcon({
            className: "vMp-mk",
            iconSize: [30, 40],
            iconAnchor: [15, 38],
            popupAnchor: [0, -34],
            // c は橙と紺の 2 色（色に意味は無い。並びの偶数番を橙、奇数番を紺）
            html: `<div class="vMp-pin${mode === "c" ? (i % 2 === 0 ? " vMp-pin--o" : " vMp-pin--n") : ""}" style="animation-delay:${delay}ms"><i></i></div>`,
          });
      const m = L.marker([p.lat, p.lng], { icon, title: p.name, zIndexOffset: isFlag ? 500 : 0 }).addTo(layer);
      m.bindPopup(
        `<div class="vMp-pop">${p.photo ? `<img src="${esc(p.photo)}" alt="" />` : ""}<b>${esc(p.name)}</b><span>${esc(p.area)}・${esc(p.cuisine)}</span><a href="/restaurant/${encodeURIComponent(p.id)}">店のページへ →</a></div>`,
        { closeButton: false, className: mode === "c" ? "vMp-popw vMp-popw--c" : "vMp-popw", autoPan: true, autoPanPaddingTopLeft: [24, 24], autoPanPaddingBottomRight: [24, 24], keepInView: true },
      );
    });

    // a・c: 目印に、店の多い市区町村の名前を、その店たちの中心あたりに薄く出す（c は手書き風の字）
    if (mode !== "b") {
      const g = new Map<string, MapPt[]>();
      for (const p of pts) if (p.town) g.set(p.town, [...(g.get(p.town) ?? []), p]);
      [...g.entries()]
        .sort((x, y) => y[1].length - x[1].length)
        .slice(0, 6)
        .forEach(([town, list]) => {
          const lat = list.reduce((a, p) => a + p.lat, 0) / list.length;
          const lng = list.reduce((a, p) => a + p.lng, 0) / list.length;
          L.marker([lat, lng], {
            icon: L.divIcon({ className: "vMp-mk vMp-mk--town", iconSize: [140, 24], iconAnchor: [70, 12], html: `<span class="vMp-town">${esc(town)}</span>` }),
            interactive: false,
            keyboard: false,
            zIndexOffset: -1000,
          }).addTo(layer);
        });
    }

    // c: 飾りの小さな木。地域キーから決めた位置に、店のピン・札から離して散らす（毎回同じ場所）
    if (mode === "c" && pts.length > 0) {
      const rnd = seeded(regionKey || "japan");
      const padLat = Math.max(bb.getNorth() - bb.getSouth(), 0.02) * 0.25;
      const padLng = Math.max(bb.getEast() - bb.getWest(), 0.02) * 0.25;
      const south = bb.getSouth() - padLat, north = bb.getNorth() + padLat, west = bb.getWest() - padLng, east = bb.getEast() + padLng;
      const keep = Math.max(north - south, east - west) / 22;
      let placed = 0;
      for (let t = 0; t < TREE_MAX * 8 && placed < TREE_MAX; t++) {
        const lat = south + rnd() * (north - south);
        const lng = west + rnd() * (east - west);
        if (pts.some((p) => Math.hypot(p.lat - lat, p.lng - lng) < keep)) continue;
        L.marker([lat, lng], { icon: L.divIcon({ className: "vMp-mk vMp-mk--tree", iconSize: [22, 28], iconAnchor: [11, 26], html: TREE_SVG }), interactive: false, keyboard: false, zIndexOffset: -1500 }).addTo(layer);
        placed++;
      }
    }

    if (pts.length > 1) {
      // 余白: 上は札の高さ（104px + 先の丸）ぶん、左右は札の幅の半分（56px）ぶん取り、最初に寄った状態で札が箱の辺で切れないようにする
      const opt = { paddingTopLeft: [FLAG_SIDE, FLAG_TOP] as [number, number], paddingBottomRight: [FLAG_SIDE, 36] as [number, number], maxZoom: 14 };
      if (reduce) map.fitBounds(fit, { ...opt, animate: false });
      else map.flyToBounds(fit, { ...opt, duration: 0.9 });
    } else if (pts.length === 1) {
      if (reduce) map.setView([pts[0].lat, pts[0].lng], 13, { animate: false });
      else map.flyTo([pts[0].lat, pts[0].lng], 13, { duration: 0.9 });
    } else {
      map.fitBounds(JAPAN, { animate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, key, reduce]);

  return (
    <div className={`vMp-leaf vMp-leaf--${mode}`} ref={ref} role="region" aria-label="店の地図">
      {!ready && <div className="vMp-maploading">地図を読み込み中…</div>}
      {mode === "c" && (
        // c の水彩風の線の揺らし（タイルの層だけに掛かる。ピンや札には掛けない）
        <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }} focusable="false">
          <filter id="vMp-hand" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
    </div>
  );
}

/** 「さがす」の地図の本体。mode a・b と、全国・地域の見た目を切り替える */
export default function ShopMap({
  mode,
  regionKey,
  pts,
  prefCounts,
  prefRegion,
  regionCounts,
  onPick,
}: {
  mode: MapMode;
  regionKey: string;
  /** 位置のある店（絞り込んだ全部。上限は設けない） */
  pts: MapPt[];
  /** 県ごとの店の数（絞り込んだ店。位置の無い店も住所の県で数えている） */
  prefCounts: Record<string, number>;
  /** 県 → その県の店の地域（店のデータの住所の県と region から作った対応） */
  prefRegion: Record<string, string>;
  /** 地域ごとの店の数（絞り込んだ店。b の全国の丸に使う） */
  regionCounts: { key: string; name: string; count: number }[];
  onPick: (region: string) => void;
}) {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const f = () => setReduce(mq.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  // b の全国: 地域ごとの丸。件数は、絞り込んだ店のその地域の数（位置の無い店も数える。呼び出し側が数えた regionCounts）。位置は、その地域の位置のある店の座標の中央値
  const circles = useMemo(() => {
    const g = new Map<string, MapPt[]>();
    for (const p of pts) g.set(p.region, [...(g.get(p.region) ?? []), p]);
    return regionCounts.flatMap((r) => {
      const l = g.get(r.key);
      return l && l.length > 0 && r.count > 0 ? [{ key: r.key, name: r.name, count: r.count, lat: median(l.map((p) => p.lat)), lng: median(l.map((p) => p.lng)) }] : [];
    });
  }, [pts, regionCounts]);
  return (
    <div className={`vMp-surface vMp-surface--${mode}`}>
      {mode === "a" && !regionKey ? <GridJapan counts={prefCounts} prefRegion={prefRegion} onPick={onPick} /> : <LeafMap mode={mode} regionKey={regionKey} pts={pts} circles={circles} onPick={onPick} reduce={reduce} />}
    </div>
  );
}
