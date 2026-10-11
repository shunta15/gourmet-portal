"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { CELLS, CELL_U, GAP_U, MAP_GRID } from "@/lib/portal/mapRegions";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { ILLUST_JAPAN, ILLUST_MAPS } from "@/lib/portal/noren/illustMaps.generated";
import { densestFit } from "@/lib/portal/noren/mapFit";

/**
 * 「さがす」の地図（暖簾版）。実物の地図（道路・地名の細かいタイル）は使わない。2 つの見た目を ?map=a|b で見比べられる（既定 a）:
 *  - a「絵図」: 全国は、都道府県を 1 マスにした自作のデフォルメ地図（lib/portal/mapRegions.ts）に店の数。地域を選ぶと、無地の面の上に店を緯度経度の相対位置で点にして置く
 *    （目印に、店の多い市区町村の名前を薄く出す）。タイルは使わない。
 *  - b「線だけの地図」: 地理院の白地図タイル（海岸線・境界の線だけ。ズーム 5〜14）を暖簾の色に寄せる。全国は地域ごとの丸（件数つき）、地域を選ぶと店のピン。
 * 地域を選んだとき・選び直したときは、地図がその地域へなめらかに寄り、店のピンが 1 つずつ少しずつ遅れて上から落ちてきて（(i % 36) * 70 + 250ms。手本の G6 街歩きと同じ考え方）、
 * 写真のある店のうち少し（FLAG_MAX 軒）は、店の写真つきの札として立つ。ピン・札を押すと、写真・店名・エリア・業種の吹き出しと店ページへのリンク。
 * 動かすのは transform と opacity だけ。「動きを減らす」設定では動かさず、すぐ出す。タイマーは使わず（CSS の遅れだけ）、選び直すと前のピンは消す。
 *  - c「手描き風」: 地理院の淡色地図を土台に、タイルの層だけに色を淡くする・線を揺らす・細かい字をぼかすフィルターを掛け、小さな木の飾りを散らす。ピンは橙と紺、札は白い枠で少し傾ける。全国は b と同じ地域ごとの丸。
 *  - d「イラスト」: 手描きの地図の絵（神戸。public/_portal/proto/map-illust.webp）を、タイル無しで地図の面いっぱいに敷き、店を緯度経度の相対位置のまま絵の上に置く。ピン・札は c と同じ。全国は一文だけ。
 * 出典: b・c は「地理院タイル」の表記を地図に出す（d は絵なので出さない）。新しいパッケージ・有料の地図・ネットからのデータ取得は無い（leaflet は既存。タイルは b の白地図だけ）。
 */

export type MapPt = { id: string; name: string; lat: number; lng: number; area: string; cuisine: string; photo: string; town: string; region: string };
/** "a"（絵図）は候補から外した（?map=a は e に読み替える。コードは残してある）。既定は e */
export type MapMode = "a" | "b" | "c" | "d" | "e";

/** 店の写真つきの札で立てる数（手本の考え方: 写真のある店のうち、重ならない少数。目安 6〜10） */
export const FLAG_MAX = 8;
const BLANK_TILE = "https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png";
/** d「イラスト」: 手描きの地図の絵（1179×624。神戸）。タイルは使わず、絵を地図の面いっぱいに敷く。leaflet の CRS.Simple（絵の 1px = 1 単位）で、絵とピンが一緒に動く */
const ILLUST = "/_portal/proto/map-illust.webp";
const IMG_W = 1179;
const IMG_H = 624;
const IMG_BOUNDS: [[number, number], [number, number]] = [[0, 0], [IMG_H, IMG_W]];
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
  const coverRef = useRef(0);
  // e: いま敷いている手描き風の地図（SVG）と、その url
  const overlayRef = useRef<import("leaflet").ImageOverlay | null>(null);
  const coreRef = useRef<import("leaflet").ImageOverlay | null>(null);
  const overlayKey = useRef("");
  // e: 寄せる動き（飛ぶ）が終わってから、範囲の外へ出られない制限をかける（動きの途中に掛けると、飛ぶ先がずれる）
  const moveEndRef = useRef<(() => void) | null>(null);
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
      // d: 絵が箱を埋める（縦横比は保ち、はみ出す分は切る）ズームを下限にして、余白を出さない。絵の外へは動かせない
      const cover = mode === "d" ? Math.log2(Math.max(ref.current.clientWidth / IMG_W, ref.current.clientHeight / IMG_H)) : 0;
      coverRef.current = cover;
      const map = L.map(ref.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: mode === "b" || mode === "c",
        zoomSnap: mode === "d" ? 0 : 0.25,
        zoomDelta: mode === "d" ? 0.75 : 1,
        minZoom: mode === "d" ? cover : mode === "a" ? 3 : 5,
        maxZoom: mode === "d" ? cover + 2.5 : mode === "b" ? 14 : mode === "c" ? 18 : 17,
        ...(mode === "d" ? { crs: L.CRS.Simple, maxBounds: IMG_BOUNDS, maxBoundsViscosity: 1 } : {}),
        ...(mode === "e" ? { maxBoundsViscosity: 1 } : {}),
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
      if (mode === "d") {
        L.imageOverlay(ILLUST, IMG_BOUNDS).addTo(map);
        map.setView([IMG_H / 2, IMG_W / 2], cover, { animate: false });
      } else map.fitBounds(JAPAN, { animate: false });
      const layer = L.layerGroup().addTo(map);
      st.current = { L, map, layer };
      ro = new ResizeObserver(() => {
        map.invalidateSize();
        if (mode === "d" && ref.current) {
          // 箱の大きさが替わったら、絵が箱を埋める下限のズームも取り直す
          const c = Math.log2(Math.max(ref.current.clientWidth / IMG_W, ref.current.clientHeight / IMG_H));
          coverRef.current = c;
          map.setMinZoom(c);
          map.setMaxZoom(c + 2.5);
          if (map.getZoom() < c) map.setZoom(c, { animate: false });
        }
      });
      ro.observe(ref.current);
      setReady(true);
    })();
    return () => {
      cancelled = true;
      ro?.disconnect();
      st.current?.map.stop();
      st.current?.map.remove();
      st.current = null;
      overlayRef.current = null;
      coreRef.current = null;
      overlayKey.current = "";
      setReady(false);
    };
  }, [mode, reduce]);

  // ピン・札・丸を置き直し、地図をそこへ寄せる。選び直したら、前のものは消す（CSS の遅れだけで動かしているので、残るタイマーは無い）
  useEffect(() => {
    const s = st.current;
    if (!ready || !s) return;
    const { L, map, layer } = s;
    map.stop();
    if (moveEndRef.current) {
      map.off("moveend", moveEndRef.current);
      moveEndRef.current = null;
    }
    map.closePopup();
    layer.clearLayers();
    const bb = L.latLngBounds([]);
    const delayOf = (i: number) => (reduce ? 0 : (i % 36) * 70 + 250);

    // e: その地域の手描き風の地図（SVG）を、実際の範囲に敷く（だから店のピンは本当の位置に落ちる）。範囲の外へは動かせず、拡大は敷いた範囲が箱を埋める所まで
    let eSetup: null | { bounds: import("leaflet").LatLngBounds; dataZ: number } = null;
    if (mode === "e") {
      const info = regionKey ? ILLUST_MAPS[regionKey] : undefined;
      const bounds = L.latLngBounds(info ? info.bounds : ILLUST_JAPAN.bounds);
      const url = info ? `/_portal/illust-map/${regionKey}.svg` : "/_portal/illust-map/japan.svg";
      if (overlayKey.current !== url) {
        overlayRef.current?.remove();
        coreRef.current?.remove();
        coreRef.current = null;
        overlayRef.current = L.imageOverlay(url, bounds, { interactive: false, className: "vMp-ill", zIndex: 1 }).addTo(map);
        // 細かい層（初期表示のまわり。縁をぼかしてあるので、粗い層の上にそのまま重ねる）
        if (info?.core) coreRef.current = L.imageOverlay(`/_portal/illust-map/${regionKey}-core.svg`, L.latLngBounds(info.core.bounds), { interactive: false, className: "vMp-ill vMp-ill--core", zIndex: 2 }).addTo(map);
        overlayKey.current = url;
      }
      (map as unknown as { setMaxBounds: (b: unknown) => void }).setMaxBounds(null); // 動かす間は外す。終わったら下で掛け直す
      // 前の地域の拡大の範囲に挟まれて計算がずれないよう、いったん広げてから、箱を埋める下限を求める
      // setMinZoom / setMaxZoom は、いまのズームが範囲の外だと、その場で拡大縮小の動きを始めてしまう（そのあとの寄せる動きと食い違い、ピンと絵が別々の位置に残る）。範囲の値だけを直接入れ替え、寄せるのは下の setView / flyToBounds に任せる
      const zo = map.options as { minZoom?: number; maxZoom?: number };
      zo.minZoom = 0;
      zo.maxZoom = 20;
      const cz = map.getBoundsZoom(bounds, true);
      zo.minZoom = cz;
      zo.maxZoom = Math.max(cz + 1, info ? info.zi + 3 : 8);
      eSetup = { bounds, dataZ: info ? info.z : 6 };
    }

    if (mode === "d" && !regionKey) {
      // 全国（d）: 絵を敷いただけ。一文（JSX 側）だけ出す
      map.setView([IMG_H / 2, IMG_W / 2], coverRef.current, { animate: false });
      return;
    }

    if (!regionKey && (mode === "b" || mode === "c" || mode === "e")) {
      // 全国（b）: 地域ごとの丸（件数つき）。押すとその地域で絞り込む
      circles.forEach((c, i) => {
        const size = mode === "e" ? Math.round(20 + 3.4 * Math.sqrt(c.count)) : Math.round(28 + 4.5 * Math.sqrt(c.count));
        const icon = L.divIcon({
          className: "vMp-mk",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          html: `<div class="vMp-circ" style="--s:${size}px;animation-delay:${delayOf(i)}ms"><b>${c.count}</b>${mode === "e" && c.count < 8 ? "" : `<span>${esc(c.name)}</span>`}</div>`,
        });
        const m = L.marker([c.lat, c.lng], { icon, title: `${c.name} ${c.count}軒`, zIndexOffset: -c.count }).addTo(layer);
        m.on("click", () => onPickRef.current(c.key));
        bb.extend([c.lat, c.lng]);
      });
      if (mode === "e") {
        // e: 全国の地図は、すぐ全体を見せる（地域の地図から戻るとき、範囲がちがうので飛ばない）
        map.fitBounds(JAPAN, { animate: false });
        if (eSetup) map.setMaxBounds(eSetup.bounds);
      } else if (reduce) map.fitBounds(JAPAN, { animate: false });
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
    // e: 店がいちばん集まっている所に寄せる（lib/portal/noren/mapFit.ts。描き起こしのスクリプトと同じ決め方）。ほかは、外れ値を除いた中央の約 88%
    const dense = mode === "e" && pts.length > 12 ? densestFit(pts) : null;
    const fit = dense
      ? L.latLngBounds([dense.minLat, dense.minLng], [dense.maxLat, dense.maxLng])
      : pts.length > 12 && mode !== "e"
        ? L.latLngBounds([quant(pts.map((p) => p.lat), 0.06), quant(pts.map((p) => p.lng), 0.06)], [quant(pts.map((p) => p.lat), 0.94), quant(pts.map((p) => p.lng), 0.94)])
        : bb;
    const span = pts.length > 1 ? Math.max(fit.getNorth() - fit.getSouth(), fit.getEast() - fit.getWest()) : 0.1;
    // d: 店を、緯度経度の相対位置のまま、絵の上（いま箱に見えている範囲の内側）に置く。内側の余白は 8%、上は札の高さ・左右は札の幅の半分以上
    let at = (p: MapPt): [number, number] => [p.lat, p.lng];
    if (mode === "d" && ref.current) {
      const bw = ref.current.clientWidth;
      const bh = ref.current.clientHeight;
      const scale = Math.pow(2, coverRef.current);
      const mL = Math.max(0.08 * bw, FLAG_SIDE);
      const mT = Math.max(0.08 * bh, FLAG_TOP);
      const mB = Math.max(0.08 * bh, 36);
      const availW = Math.max(40, bw - 2 * mL);
      const availH = Math.max(40, bh - mT - mB);
      const cosLat = Math.cos((((fit.getNorth() + fit.getSouth()) / 2) * Math.PI) / 180);
      const spanX = Math.max((fit.getEast() - fit.getWest()) * cosLat, 1e-4);
      const spanY = Math.max(fit.getNorth() - fit.getSouth(), 1e-4);
      const k = Math.min(availW / spanX, availH / spanY, 2e5);
      const cLng = (fit.getEast() + fit.getWest()) / 2;
      const cLat = (fit.getNorth() + fit.getSouth()) / 2;
      const offY = (mT - mB) / 2;
      at = (p) => {
        const dx = (p.lng - cLng) * cosLat * k;
        const dy = -(p.lat - cLat) * k;
        const x = IMG_W / 2 + dx / scale;
        const y = IMG_H / 2 - (dy + offY) / scale;
        // 外れ値の店は、いま箱に見えている範囲の端（ピンが半分切れない位置）に寄せて置く
        const hw = bw / (2 * scale);
        const hh = bh / (2 * scale);
        return [Math.min(IMG_H / 2 + hh - 6 / scale, Math.max(IMG_H / 2 - hh + 44 / scale, y)), Math.min(IMG_W / 2 + hw - 16 / scale, Math.max(IMG_W / 2 - hw + 16 / scale, x))];
      };
    }
    const minD = span / 3.6; // 札（幅 112px）どうしが重ならない程度に離す（8 軒まで）
    const flags = new Set<string>();
    const picked: MapPt[] = [];
    // 狭い箱（スマホ）では、札が地図をふさがないよう少なくする
    const maxFlags = (ref.current?.clientWidth ?? 800) < 520 ? 3 : FLAG_MAX;
    if (mode === "e" && pts.length > 1) {
      // e: 寄せたあとの画面で、札（幅 112px・高さ 104px）どうしが重ならないものを、中心に近い店から選ぶ
      const tzf = Math.min(14, map.getBoundsZoom(fit, false, L.point(2 * FLAG_SIDE, FLAG_TOP + 36)));
      const fc0 = fit.getCenter();
      const rects: [number, number, number, number][] = [];
      const order = [...pts].sort((a, b) => Math.hypot(a.lat - fc0.lat, (a.lng - fc0.lng) * 0.82) - Math.hypot(b.lat - fc0.lat, (b.lng - fc0.lng) * 0.82));
      for (const p of order) {
        if (flags.size >= maxFlags) break;
        if (!p.photo || !fit.contains([p.lat, p.lng])) continue;
        const q = map.project([p.lat, p.lng], tzf);
        const r: [number, number, number, number] = [q.x - 60, q.y - 112, q.x + 60, q.y + 8];
        if (rects.every((o) => r[2] < o[0] || r[0] > o[2] || r[3] < o[1] || r[1] > o[3])) {
          rects.push(r);
          flags.add(p.id);
        }
      }
    } else {
      for (const p of pts) {
        if (flags.size >= maxFlags) break;
        if (!p.photo) continue;
        if (!fit.contains([p.lat, p.lng])) continue; // 寄せる範囲の外の店は札にしない（札が箱の辺で切れないように）
        if (picked.every((q) => Math.hypot(q.lat - p.lat, q.lng - p.lng) > minD)) {
          flags.add(p.id);
          picked.push(p);
        }
      }
    }
    // 落ちる順は、寄せた範囲の中心に近い店から（見えている店が先に現れる）
    const fc = fit.isValid() ? fit.getCenter() : L.latLng(0, 0); // 位置のある店が 1 軒も無い地域では、範囲が空
    const rank = new Map(
      [...pts]
        .sort((a, b) => Math.hypot(a.lat - fc.lat, (a.lng - fc.lng) * 0.82) - Math.hypot(b.lat - fc.lat, (b.lng - fc.lng) * 0.82))
        .map((p, i) => [p.id, i] as const),
    );
    pts.forEach((p, i) => {
      const delay = delayOf(rank.get(p.id) ?? i);
      const isFlag = flags.has(p.id);
      const icon = isFlag
        ? L.divIcon({
            className: "vMp-mk",
            iconSize: [112, 104],
            iconAnchor: [56, 104],
            popupAnchor: [0, -100],
            html: `<div class="vMp-flag${mode === "c" || mode === "d" || mode === "e" ? " vMp-flag--c" : ""}" style="animation-delay:${delay}ms${mode === "c" || mode === "d" || mode === "e" ? `;--tilt:${i % 2 === 0 ? -2.5 : 2.5}deg` : ""}"><img src="${esc(p.photo)}" alt="" loading="lazy" /><b>${esc(p.name)}</b></div>`,
          })
        : L.divIcon({
            className: "vMp-mk",
            iconSize: [30, 40],
            iconAnchor: [15, 38],
            popupAnchor: [0, -34],
            // c は橙と紺の 2 色（色に意味は無い。並びの偶数番を橙、奇数番を紺）
            html: `<div class="vMp-pin${mode === "c" || mode === "d" || mode === "e" ? (i % 2 === 0 ? " vMp-pin--o" : " vMp-pin--n") : ""}" style="animation-delay:${delay}ms"><i></i></div>`,
          });
      const m = L.marker(at(p), { icon, title: p.name, zIndexOffset: isFlag ? 500 : 0 }).addTo(layer);
      m.bindPopup(
        `<div class="vMp-pop">${p.photo ? `<img src="${esc(p.photo)}" alt="" />` : ""}<b>${esc(p.name)}</b><span>${esc(p.area)}・${esc(p.cuisine)}</span><a href="/restaurant/${encodeURIComponent(p.id)}">店のページへ →</a></div>`,
        { closeButton: false, className: mode === "c" || mode === "d" || mode === "e" ? "vMp-popw vMp-popw--c" : "vMp-popw", autoPan: true, autoPanPaddingTopLeft: [24, 24], autoPanPaddingBottomRight: [24, 24], keepInView: true },
      );
    });

    // 目印に、店の多い市区町村の名前を、その店たちの中心あたりに出す（a・c は薄く。e は筆の字で、ピン・札に重なりにくい位置へずらす）
    if (mode === "a" || mode === "c" || mode === "e") {
      const g = new Map<string, MapPt[]>();
      for (const p of pts) if (p.town) g.set(p.town, [...(g.get(p.town) ?? []), p]);
      const towns = [...g.entries()].sort((x, y) => y[1].length - x[1].length).slice(0, mode === "e" ? 8 : 6);
      // e: 寄せたあとのズームで、ピン・札の画面上の位置を求め、いちばん重ならない向きへ名前をずらす
      const tz = mode === "e" && pts.length > 1 ? Math.min(14, map.getBoundsZoom(fit, false, L.point(2 * FLAG_SIDE, FLAG_TOP + 36))) : 0;
      const boxes: [number, number, number, number][] = [];
      if (tz) {
        for (const p of pts) {
          const q = map.project([p.lat, p.lng], tz);
          boxes.push(flags.has(p.id) ? [q.x - 58, q.y - 112, q.x + 58, q.y + 6] : [q.x - 13, q.y - 42, q.x + 13, q.y + 2]);
        }
      }
      const overlap = (a: number[], b: number[]) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
      const OFFS: [number, number][] = [[0, 0], [0, -34], [0, 34], [-70, 0], [70, 0], [-56, -30], [56, -30], [-56, 30], [56, 30], [0, -60], [0, 60], [-100, 0], [100, 0]];
      const placed: number[][] = [];
      towns.forEach(([town, list]) => {
        const lat = list.reduce((a, p) => a + p.lat, 0) / list.length;
        const lng = list.reduce((a, p) => a + p.lng, 0) / list.length;
        let at: [number, number] = [lat, lng];
        if (tz) {
          const c = map.project([lat, lng], tz);
          const w = Array.from(town).length * 19 + 10;
          let best = OFFS[0], bestScore = Infinity;
          for (const o of OFFS) {
            const r = [c.x + o[0] - w / 2, c.y + o[1] - 13, c.x + o[0] + w / 2, c.y + o[1] + 13];
            let sc = Math.hypot(o[0], o[1]) * 0.05;
            for (const bx of boxes) sc += overlap(r, bx);
            for (const pl of placed) sc += overlap(r, pl) * 3;
            if (sc < bestScore) { bestScore = sc; best = o; }
          }
          placed.push([c.x + best[0] - w / 2, c.y + best[1] - 13, c.x + best[0] + w / 2, c.y + best[1] + 13]);
          const ll = map.unproject([c.x + best[0], c.y + best[1]], tz);
          at = [ll.lat, ll.lng];
        }
        L.marker(at, {
          icon: L.divIcon({ className: "vMp-mk vMp-mk--town", iconSize: [140, 24], iconAnchor: [70, 12], html: `<span class="vMp-town${mode === "e" ? " vMp-town--e" : ""}">${esc(town)}</span>` }),
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

    if (mode === "d") {
      // d: 絵が箱を埋めた状態（下限のズーム）で、店は箱に見えている範囲の内側に置いてある。寄せ直す動きは無く、そのまま見せる（拡大・縮小・移動は、絵とピンが一緒に動く）
      map.setView([IMG_H / 2, IMG_W / 2], coverRef.current, { animate: false });
    } else if (pts.length > 1) {
      // 余白: 上は札の高さ（104px + 先の丸）ぶん、左右は札の幅の半分（56px）ぶん取り、最初に寄った状態で札が箱の辺で切れないようにする
      const opt = { paddingTopLeft: [FLAG_SIDE, FLAG_TOP] as [number, number], paddingBottomRight: [FLAG_SIDE, 36] as [number, number], maxZoom: 14 };
      if (reduce) {
        map.fitBounds(fit, { ...opt, animate: false });
        if (eSetup) map.setMaxBounds(eSetup.bounds);
      } else if (eSetup) {
        // e: 新しい地域の地図の上で、一段ひいた所から、なめらかに寄せる
        const z1 = Math.min(14, map.getBoundsZoom(fit, false, L.point(2 * FLAG_SIDE, FLAG_TOP + 36)));
        map.setView(fit.getCenter(), Math.max(map.getMinZoom(), z1 - 1.25), { animate: false });
        const done = () => {
          moveEndRef.current = null;
          map.setMaxBounds(eSetup!.bounds);
        };
        moveEndRef.current = done;
        map.once("moveend", done);
        map.flyToBounds(fit, { ...opt, duration: 0.9 });
      } else map.flyToBounds(fit, { ...opt, duration: 0.9 });
    } else if (pts.length === 1) {
      if (reduce) map.setView([pts[0].lat, pts[0].lng], 13, { animate: false });
      else map.flyTo([pts[0].lat, pts[0].lng], 13, { duration: 0.9 });
      if (eSetup) {
        if (reduce) map.setMaxBounds(eSetup.bounds);
        else {
          const done = () => {
            moveEndRef.current = null;
            map.setMaxBounds(eSetup!.bounds);
          };
          moveEndRef.current = done;
          map.once("moveend", done);
        }
      }
    } else if (eSetup) {
      // 店に位置の情報が無い地域: 敷いた地図の中心を、少し寄せて見せる
      map.setView(eSetup.bounds.getCenter(), Math.min(map.getMaxZoom(), map.getMinZoom() + 1), { animate: false });
      map.setMaxBounds(eSetup.bounds);
    } else {
      map.fitBounds(JAPAN, { animate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, key, reduce]);

  return (
    <div className={`vMp-leaf vMp-leaf--${mode}`} ref={ref} role="region" aria-label="店の地図">
      {!ready && <div className="vMp-maploading">地図を読み込み中…</div>}
      {mode === "e" && <p className="vMp-credit">地図: 国土地理院ベクトルタイルをもとに作成</p>}
      {mode === "d" && ready && !regionKey && <p className="vMp-illust-hint">右の一覧から地域を選ぶと、店が地図に出ます。</p>}
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
