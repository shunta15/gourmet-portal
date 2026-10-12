"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { CELLS, CELL_U, GAP_U, MAP_GRID } from "@/lib/portal/mapRegions";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { ILLUST, ILLUST_JAPAN, type IllustLayer } from "@/lib/portal/noren/illustMaps.generated";
import { quantFit } from "@/lib/portal/noren/mapFit";

/**
 * 「さがす」の地図（暖簾版）。5 つの見た目を ?map=a|e|f|g|h で見比べられる（既定 e。?map= は本番では無視）:
 *  - a「絵図」: 全国は、都道府県を 1 マスにしたデフォルメ地図（lib/portal/mapRegions.ts）に店の数。地域を選ぶと、無地の面の上に店を緯度経度の相対位置で点にして置く。動きの基準。
 *  - e「手描き風」: 国土地理院ベクトルタイルから描き起こした地図（automation/illust-map）を、あらかじめ画像（WebP）にして、実際の範囲に敷く。ピンは本当の位置。全国は日本地図に地域ごとの丸。
 *  - f「古地図」: 和紙の地・墨の線・藍のぼかしの海。町の名前は縦書きの短冊。
 *  - g「夜の灯り」: 暗い地に灯りのような道。ピンが落ちた所に灯りのにじみが広がる。
 *  - h「見下ろす」: 平らな色面の地図を奥へ倒して見下ろす（CSS の 3D）。ピン・札は面に立つ。拡大・移動はしない。
 *  f・g・h は、画像のある地域（大阪・兵庫・東京・京都・名古屋・福岡）と全国だけ。ほかの地域は e の絵。
 * ピン（朱）・札（まっすぐ・上に朱の線）・落ちる順番と速さ・最初の寄せ方（外れ値を除いた中央の約 88%）は、すべて a と同じ。
 * 地域を選んだとき・選び直したときは、地図がその地域へ寄り、店のピンが 1 つずつ少しずつ遅れて上から落ちてきて（(i % 36) * 70 + 250ms）、写真のある店のうち少し（FLAG_MAX 軒）は、店の写真つきの札として立つ。
 * ピン・札を押すと、写真・店名・エリア・業種の吹き出しと店ページへのリンク。動かすのは transform と opacity だけ。「動きを減らす」設定では動かさず、すぐ出す。タイマーは使わず（CSS の遅れだけ）、選び直すと前のピンは消す。
 * 出典: 地図は国土地理院ベクトルタイルをもとに作成（画面に表記）。新しいパッケージ・有料の地図・ネットからのデータ取得は無い（leaflet は既存）。
 */

export type MapPt = { id: string; name: string; lat: number; lng: number; area: string; cuisine: string; photo: string; town: string; region: string };
export type MapMode = "a" | "e" | "f" | "g" | "h";

/** 店の写真つきの札で立てる数（手本の考え方: 写真のある店のうち、重ならない少数。目安 6〜10） */
export const FLAG_MAX = 8;
/** 札（幅 112px・高さ 104px。先は店の位置）が箱の辺で切れないための余白（px）: 上は札の高さ + 先の丸、左右は幅の半分 + すこし */
const FLAG_TOP = 126;
const FLAG_SIDE = 64;


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
  // e・f・g: あらかじめ画像（WebP）にした地図を、実際の範囲に敷く（ピン・札・寄せ方は a と同じ）。f 古地図・g 夜の灯りは、画像のある地域だけ（ほかは e の絵）
  const isOv = mode === "e" || mode === "f" || mode === "g";
  const ref = useRef<HTMLDivElement>(null);
  const st = useRef<{ L: typeof import("leaflet"); map: import("leaflet").Map; layer: import("leaflet").LayerGroup } | null>(null);
  const [ready, setReady] = useState(false);
  // e・f・g: いま敷いている地図の画像（粗い層・細かい層）と、その url
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
      const map = L.map(ref.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
        zoomSnap: 0.25,
        zoomDelta: 1,
        minZoom: mode === "a" ? 3 : 5,
        maxZoom: 17,
        ...(isOv ? { maxBoundsViscosity: 1 } : {}),
        zoomAnimation: !reduce,
        fadeAnimation: !reduce,
        markerZoomAnimation: !reduce,
      });
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

    // e・f・g: その地域の画像を、実際の範囲に敷く（だから店のピンは本当の位置に落ちる）。範囲の外へは動かせず、拡大は敷いた範囲が箱を埋める所まで
    let eSetup: null | { bounds: import("leaflet").LatLngBounds } = null;
    if (isOv) {
      const info = regionKey ? ILLUST[mode][regionKey] ?? ILLUST.e[regionKey] : undefined;
      const jp: IllustLayer = ILLUST_JAPAN[mode] ?? ILLUST_JAPAN.e;
      const main: IllustLayer = info ? info.main : jp;
      const bounds = L.latLngBounds(main.bounds);
      const url = main.src;
      if (overlayKey.current !== url) {
        overlayRef.current?.remove();
        coreRef.current?.remove();
        coreRef.current = null;
        overlayRef.current = L.imageOverlay(url, bounds, { interactive: false, className: "vMp-ill", zIndex: 1 }).addTo(map);
        // 細かい層（縁をぼかした透明つきの画像。粗い層の上にそのまま重ねる）
        if (info?.core) coreRef.current = L.imageOverlay(info.core.src, L.latLngBounds(info.core.bounds), { interactive: false, className: "vMp-ill", zIndex: 2 }).addTo(map);
        overlayKey.current = url;
      }
      (map as unknown as { setMaxBounds: (b: unknown) => void }).setMaxBounds(null); // 動かす間は外す。終わったら下で掛け直す
      // setMinZoom / setMaxZoom は、いまのズームが範囲の外だと、その場で拡大縮小の動きを始めてしまう（そのあとの寄せる動きと食い違う）。範囲の値だけを直接入れ替え、寄せるのは下の setView / flyToBounds に任せる
      const zo = map.options as { minZoom?: number; maxZoom?: number };
      zo.minZoom = 0;
      zo.maxZoom = 20;
      const cz = map.getBoundsZoom(bounds, true);
      zo.minZoom = cz;
      // 画像（ビットマップ）は、初期表示から 1.5 段ぶんまで拡大してもにじまない大きさ
      zo.maxZoom = Math.max(cz + 1, (info?.zi ?? cz + 1) + 1.5);
      eSetup = { bounds };
    }

    if (!regionKey && isOv) {
      // e・f・g: 全国。地域ごとの丸（件数つき）。丸が重なる所は少しずらし、線で元の位置につなぐ。押すとその地域で絞り込む
      map.fitBounds(JAPAN, { animate: false });
      if (eSetup) map.setMaxBounds(eSetup.bounds);
      const w = ref.current?.clientWidth ?? 800;
      const h = ref.current?.clientHeight ?? 460;
      const base = circles.map((c) => {
        const q = map.latLngToContainerPoint([c.lat, c.lng]);
        return { x: q.x, y: q.y, r: circSize(c.count) / 2, lab: c.count >= 8 };
      });
      const sp = spreadOut(base, w, h);
      circles.forEach((c, i) => {
        const size = circSize(c.count);
        const to = map.containerPointToLatLng([sp[i].x, sp[i].y]);
        if (Math.hypot(sp[i].x - base[i].x, sp[i].y - base[i].y) > 6) {
          L.polyline([[c.lat, c.lng], to], { className: "vMp-lead", weight: 1.4, interactive: false }).addTo(layer);
          L.circleMarker([c.lat, c.lng], { className: "vMp-leaddot", radius: 3, weight: 1, interactive: false }).addTo(layer);
        }
        const icon = L.divIcon({
          className: "vMp-mk",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          html: `<div class="vMp-circ" style="--s:${size}px;animation-delay:${delayOf(i)}ms"><b>${c.count}</b>${c.count < 8 ? "" : `<span>${esc(c.name)}</span>`}</div>`,
        });
        const m = L.marker(to, { icon, title: `${c.name} ${c.count}軒`, zIndexOffset: c.count }).addTo(layer);
        m.on("click", () => onPickRef.current(c.key));
      });
      return;
    }

    // 店のピン。写真のある店のうち、重ならない少数（FLAG_MAX 軒）は写真つきの札
    pts.forEach((p) => bb.extend([p.lat, p.lng]));
    // 寄せる範囲（a と同じ。lib/portal/noren/mapFit.ts。描き起こしのスクリプトとも同じ決め方）: 店が多いときは、はずれ値（遠く離れた数軒）を除いた中央の約 88%（上下 6% を除く）。除いた店は、地図を動かせば見える
    const qf = pts.length > 12 ? quantFit(pts) : null;
    const fit = qf ? L.latLngBounds([qf.minLat, qf.minLng], [qf.maxLat, qf.maxLng]) : bb;
    const span = pts.length > 1 ? Math.max(fit.getNorth() - fit.getSouth(), fit.getEast() - fit.getWest()) : 0.1;
    const minD = span / 3.6; // 札（幅 112px）どうしが重ならない程度に離す（8 軒まで）
    const flags = new Set<string>();
    const picked: MapPt[] = [];
    // 狭い箱（スマホ）では、札が地図をふさがないよう少なくする
    const maxFlags = (ref.current?.clientWidth ?? 800) < 520 ? 3 : FLAG_MAX;
    // e・f・g: 寄せたあとのズーム（箱を埋める下限・拡大の上限に挟まれる）と、そのときの箱への写し（寄せる範囲の中心が、札の余白を引いた箱の中心に来る）
    const BW = ref.current?.clientWidth ?? 800;
    const BH = ref.current?.clientHeight ?? 460;
    const tzf = isOv && pts.length > 1 ? Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), Math.min(14, map.getBoundsZoom(fit, false, L.point(2 * FLAG_SIDE, FLAG_TOP + 36))))) : 0;
    const ctrP = tzf ? map.project(fit.getCenter(), tzf) : null;
    const shiftX = ctrP ? BW / 2 - ctrP.x : 0;
    const shiftY = ctrP ? (FLAG_TOP + BH - 36) / 2 - ctrP.y : 0;
    if (isOv && pts.length > 1) {
      // e・f・g: 寄せたあとの画面で、札（幅 112px・高さ 104px）どうしが重ならず、箱の辺で切れないものを、中心に近い店から選ぶ
      const fc0 = fit.getCenter();
      const rects: [number, number, number, number][] = [];
      const order = [...pts].sort((a, b) => Math.hypot(a.lat - fc0.lat, (a.lng - fc0.lng) * 0.82) - Math.hypot(b.lat - fc0.lat, (b.lng - fc0.lng) * 0.82));
      for (const p of order) {
        if (flags.size >= maxFlags) break;
        if (!p.photo || !fit.contains([p.lat, p.lng])) continue;
        const q = map.project([p.lat, p.lng], tzf);
        const r: [number, number, number, number] = [q.x - 60, q.y - 112, q.x + 60, q.y + 8];
        const inBox = r[0] + shiftX >= 4 && r[2] + shiftX <= BW - 4 && r[1] + shiftY >= 4 && r[3] + shiftY <= BH - 4;
        if (inBox && rects.every((o) => r[2] < o[0] || r[0] > o[2] || r[3] < o[1] || r[1] > o[3])) {
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
            html: `${mode === "g" ? `<span class="vMp-glow" style="--gx:56px;--gy:104px;animation-delay:${delay + 480}ms"></span>` : ""}<div class="vMp-flag" style="animation-delay:${delay}ms"><img src="${esc(p.photo)}" alt="" loading="lazy" /><b>${esc(p.name)}</b></div>`,
          })
        : L.divIcon({
            className: "vMp-mk",
            iconSize: [30, 40],
            iconAnchor: [15, 38],
            popupAnchor: [0, -34],
            // c は橙と紺の 2 色（色に意味は無い。並びの偶数番を橙、奇数番を紺）
            html: `${mode === "g" ? `<span class="vMp-glow" style="--gx:15px;--gy:38px;animation-delay:${delay + 480}ms"></span>` : ""}<div class="vMp-pin" style="animation-delay:${delay}ms"><i></i></div>`,
          });
      const m = L.marker([p.lat, p.lng], { icon, title: p.name, zIndexOffset: isFlag ? 500 : 0 }).addTo(layer);
      m.bindPopup(
        `<div class="vMp-pop">${p.photo ? `<img src="${esc(p.photo)}" alt="" />` : ""}<b>${esc(p.name)}</b><span>${esc(p.area)}・${esc(p.cuisine)}</span><a href="/restaurant/${encodeURIComponent(p.id)}">店のページへ →</a></div>`,
        { closeButton: false, className: "vMp-popw", autoPan: true, autoPanPaddingTopLeft: [24, 24], autoPanPaddingBottomRight: [24, 24], keepInView: true },
      );
    });

    // 目印に、店の多い市区町村の名前を、その店たちの中心あたりに出す（a・c は薄く。e は筆の字で、ピン・札に重なりにくい位置へずらす）
    if (mode === "a" || isOv) {
      const g = new Map<string, MapPt[]>();
      for (const p of pts) if (p.town) g.set(p.town, [...(g.get(p.town) ?? []), p]);
      const towns = [...g.entries()].sort((x, y) => y[1].length - x[1].length).slice(0, mode === "f" ? 5 : isOv ? 8 : 6);
      // e: 寄せたあとのズームで、ピン・札の画面上の位置を求め、いちばん重ならない向きへ名前をずらす
      const tz = tzf;
      const boxes: [number, number, number, number][] = [];
      if (tz) {
        for (const p of pts) {
          const q = map.project([p.lat, p.lng], tz);
          boxes.push(flags.has(p.id) ? [q.x - 58, q.y - 112, q.x + 58, q.y + 6] : [q.x - 13, q.y - 42, q.x + 13, q.y + 2]);
        }
      }
      // 寄せたあとの箱（札の余白を引いた中）の、いまの座標への写し。箱の外へ出る位置は避ける
      const outside = (r: number[]) => {
        const x0 = r[0] + shiftX, x1 = r[2] + shiftX, y0 = r[1] + shiftY, y1 = r[3] + shiftY;
        const w2 = x1 - x0, h2 = y1 - y0;
        const inW = Math.max(0, Math.min(x1, BW - 6) - Math.max(x0, 6)), inH = Math.max(0, Math.min(y1, BH - 6) - Math.max(y0, 6));
        return w2 * h2 - inW * inH;
      };
      const overlap = (a: number[], b: number[]) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
      const OFFS: [number, number][] =
        mode === "f"
          ? [[0, 0], [-34, 0], [34, 0], [-68, 0], [68, 0], [-102, 0], [102, 0], [0, -64], [0, 64], [-34, -64], [34, -64], [-34, 64], [34, 64], [-136, 0], [136, 0], [-68, -64], [68, -64], [-68, 64], [68, 64]]
          : [[0, 0], [0, -34], [0, 34], [-70, 0], [70, 0], [-56, -30], [56, -30], [-56, 30], [56, 30], [0, -60], [0, 60], [-100, 0], [100, 0]];
      const placed: number[][] = [];
      towns.forEach(([town, list]) => {
        const lat = list.reduce((a, p) => a + p.lat, 0) / list.length;
        const lng = list.reduce((a, p) => a + p.lng, 0) / list.length;
        let at: [number, number] = [lat, lng];
        if (tz) {
          const c = map.project([lat, lng], tz);
          const nch = Array.from(town).length;
          // f は縦書きの短冊（幅 28・高さは字数ぶん）。ほかは横書き
          const w = mode === "f" ? 28 : nch * 19 + 10;
          const hh2 = mode === "f" ? nch * 17 + 16 : 26;
          let best = OFFS[0], bestScore = Infinity;
          for (const o of OFFS) {
            const r = [c.x + o[0] - w / 2, c.y + o[1] - hh2 / 2, c.x + o[0] + w / 2, c.y + o[1] + hh2 / 2];
            let sc = Math.hypot(o[0], o[1]) * 0.05 + outside(r) * 4;
            for (const bx of boxes) sc += overlap(r, bx);
            for (const pl of placed) sc += overlap(r, pl) * (mode === "f" ? 12 : 3);
            if (sc < bestScore) { bestScore = sc; best = o; }
          }
          placed.push([c.x + best[0] - w / 2, c.y + best[1] - hh2 / 2, c.x + best[0] + w / 2, c.y + best[1] + hh2 / 2]);
          const ll = map.unproject([c.x + best[0], c.y + best[1]], tz);
          at = [ll.lat, ll.lng];
        }
        L.marker(at, {
          icon: L.divIcon({
            className: "vMp-mk vMp-mk--town",
            iconSize: mode === "f" ? [30, Array.from(town).length * 17 + 18] : [140, 24],
            iconAnchor: mode === "f" ? [15, (Array.from(town).length * 17 + 18) / 2] : [70, 12],
            html: `<span class="vMp-town${isOv ? ` vMp-town--${mode}` : ""}">${esc(town)}</span>`,
          }),
          interactive: false,
          keyboard: false,
          zIndexOffset: -1000,
        }).addTo(layer);
      });
    }

    if (pts.length > 1) {
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
      {isOv && <p className="vMp-credit">地図: 国土地理院ベクトルタイルをもとに作成</p>}
    </div>
  );
}

/** 全国の丸（件数）が重なる所（関西・関東）を、重ならないよう少しずらす（画面の px。丸の半径 r + すきま。字（地域名）がある丸は少し広め）。ずらした丸は、線で元の位置につなぐ */
type Spr = { x: number; y: number; r: number; lab: boolean };
function spreadOut(p: Spr[], w: number, h: number, top = 4): Spr[] {
  const q = p.map((i) => ({ ...i }));
  for (let it = 0; it < 160; it++) {
    let moved = false;
    for (let a = 0; a < q.length; a++)
      for (let b = a + 1; b < q.length; b++) {
        const A = q[a], B = q[b];
        let dx = B.x - A.x, dy = B.y - A.y;
        let d = Math.hypot(dx, dy);
        const need = A.r + B.r + 5 + (A.lab || B.lab ? 9 : 0);
        if (d >= need) continue;
        if (d < 0.01) { dx = 1; dy = 0; d = 1; }
        const m = (need - d) / 2 + 0.2;
        A.x -= (dx / d) * m; A.y -= (dy / d) * m; B.x += (dx / d) * m; B.y += (dy / d) * m;
        moved = true;
      }
    for (const i of q) { i.x = Math.min(w - i.r - 4, Math.max(i.r + 4, i.x)); i.y = Math.min(h - i.r - (i.lab ? 22 : 6), Math.max(i.r + top, i.y)); }
    if (!moved) break;
  }
  return q;
}
const circSize = (n: number) => Math.round(18 + 2.8 * Math.sqrt(n));

/** h「見下ろす」: 地図の面（あらかじめ画像にした平らな色面）を奥へ倒して、斜め上から見下ろす（CSS の 3D 変形）。ピン・札は面に対して立つ（倒した分を打ち消す）。
 *  拡大・移動はしない（止めた）。外れ値を除いた中央の約 88%（a と同じ）が箱に収まる大きさで置き、押すと吹き出し → 店のページ。奥ほど小さく（遠近）・薄く（霞）。 */
const TILT = 50;
const mercX = (lng: number) => (lng + 180) / 360;
const mercY = (lat: number) => 0.5 - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / (2 * Math.PI);
function TiltMap({ regionKey, pts, circles, onPick, reduce }: { regionKey: string; pts: MapPt[]; circles: { key: string; name: string; count: number; lat: number; lng: number }[]; onPick: (region: string) => void; reduce: boolean }) {
  const nation = !regionKey;
  const info = nation ? ILLUST_JAPAN.h! : ILLUST.h[regionKey].main;
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [sel, setSel] = useState<{ id: string; x: number; y: number; below: boolean } | null>(null);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const f = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    f();
    const ro = new ResizeObserver(f);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => setSel(null), [regionKey, pts]);
  const g = useMemo(() => {
    if (!size.w || !size.h) return null;
    const [[s0, w0], [n0, e0]] = info.bounds;
    const x0 = mercX(w0), x1 = mercX(e0), y0 = mercY(n0), y1 = mercY(s0);
    const qf = nation ? { minLat: JAPAN[0][0], maxLat: JAPAN[1][0], minLng: JAPAN[0][1], maxLng: JAPAN[1][1] } : pts.length ? quantFit(pts) : { minLat: s0, maxLat: n0, minLng: w0, maxLng: e0 };
    const fx0 = mercX(qf.minLng), fx1 = mercX(qf.maxLng), fy0 = mercY(qf.maxLat), fy1 = mercY(qf.minLat);
    const cosT = Math.cos((TILT * Math.PI) / 180);
    const fw = Math.max(fx1 - fx0, 1e-4), fh = Math.max(fy1 - fy0, 1e-4);
    const padS = nation ? 40 : FLAG_SIDE, padT = nation ? 44 : FLAG_TOP;
    const k = Math.min((size.w - 2 * padS) / fw, (size.h - padT - 36) / (cosT * fh), 6e5);
    const PW = k * (x1 - x0), PH = k * (y1 - y0);
    const at = (lat: number, lng: number): [number, number] => [(mercX(lng) - x0) * k, (mercY(lat) - y0) * k];
    const [Fx, Fy] = [((fx0 + fx1) / 2 - x0) * k, ((fy0 + fy1) / 2 - y0) * k];
    const cy = size.h - 36 - (cosT * fh * k) / 2; // 寄せた範囲の下辺が、箱の下から 36px
    return { PW, PH, at, Fx, Fy, cx: size.w / 2, cy, k, fit: qf, fh: fh * k };
  }, [size, info, pts, nation]);
  const narrow = size.w < 520;
  const flags = useMemo(() => {
    const out = new Set<string>();
    if (!g || pts.length < 2 || nation) return out;
    const fc = { lat: (g.fit.minLat + g.fit.maxLat) / 2, lng: (g.fit.minLng + g.fit.maxLng) / 2 };
    const cosT = Math.cos((TILT * Math.PI) / 180);
    const rects: [number, number, number, number][] = [];
    const order = [...pts].sort((a, b) => Math.hypot(a.lat - fc.lat, (a.lng - fc.lng) * 0.82) - Math.hypot(b.lat - fc.lat, (b.lng - fc.lng) * 0.82));
    for (const p of order) {
      if (out.size >= (narrow ? 3 : FLAG_MAX)) break;
      if (!p.photo || p.lat < g.fit.minLat || p.lat > g.fit.maxLat || p.lng < g.fit.minLng || p.lng > g.fit.maxLng) continue;
      const [px, py] = g.at(p.lat, p.lng);
      const sx = px, sy = (py - g.Fy) * cosT;
      const r: [number, number, number, number] = [sx - 60, sy - 112, sx + 60, sy + 8];
      if (rects.every((o) => r[2] < o[0] || r[0] > o[2] || r[3] < o[1] || r[1] > o[3])) {
        rects.push(r);
        out.add(p.id);
      }
    }
    return out;
  }, [g, pts, narrow, nation]);
  const fc = g ? { lat: (g.fit.minLat + g.fit.maxLat) / 2, lng: (g.fit.minLng + g.fit.maxLng) / 2 } : { lat: 0, lng: 0 };
  const rank = useMemo(() => new Map([...pts].sort((a, b) => Math.hypot(a.lat - fc.lat, (a.lng - fc.lng) * 0.82) - Math.hypot(b.lat - fc.lat, (b.lng - fc.lng) * 0.82)).map((p, i) => [p.id, i] as const)), [pts, fc.lat, fc.lng]);
  const delayOf = (i: number) => (reduce ? 0 : (i % 36) * 70 + 250);
  const selPt = sel ? pts.find((p) => p.id === sel.id) : undefined;
  // 全国: 地域ごとの丸（立たせる）。重なる所は少しずらし、面の上の線で元の位置につなぐ
  const circPos = useMemo(() => {
    if (!g || !nation) return [];
    const cosT = Math.cos((TILT * Math.PI) / 180);
    const base = circles.map((c) => {
      const [x, y] = g.at(c.lat, c.lng);
      const r = circSize(c.count) / 2;
      return { x: x - g.Fx + g.cx, y: (y - g.Fy) * cosT + g.cy - r, r, lab: c.count >= 8 };
    });
    const sp = spreadOut(base, size.w, size.h, 30);
    return circles.map((c, i) => {
      const [x, y] = g.at(c.lat, c.lng);
      const nx = sp[i].x - g.cx + g.Fx;
      const ny = (sp[i].y + sp[i].r - g.cy) / cosT + g.Fy;
      return { c, x: nx, y: ny, tx: x, ty: y, moved: Math.hypot(sp[i].x - base[i].x, sp[i].y - base[i].y) > 6 };
    });
  }, [g, nation, circles, size]);
  return (
    <div className="vMp-leaf vMp-leaf--h vMp-t" ref={boxRef} role="region" aria-label="店の地図（見下ろす）" onClick={() => setSel(null)} onKeyDown={(e) => e.key === "Escape" && setSel(null)}>
      {g && (
        <div className="vMp-t-plane" style={{ width: g.PW, height: g.PH, transformOrigin: `${g.Fx}px ${g.Fy}px`, transform: `translate3d(${g.cx - g.Fx}px, ${g.cy - g.Fy}px, 0) rotateX(${TILT}deg)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="vMp-t-img" src={info.src} alt="" draggable={false} />
          {nation && (
            <svg className="vMp-t-lines" width={g.PW} height={g.PH} aria-hidden="true">
              {circPos.filter((q) => q.moved).map((q) => (
                <g key={q.c.key}>
                  <line className="vMp-lead" x1={q.tx} y1={q.ty} x2={q.x} y2={q.y} strokeWidth={1.4} />
                  <circle className="vMp-leaddot" cx={q.tx} cy={q.ty} r={3} />
                </g>
              ))}
            </svg>
          )}
          {nation &&
            circPos.map((q, i) => {
              const sz = circSize(q.c.count);
              const depth = Math.min(1, Math.max(0, (q.y - (g.Fy - g.fh * 0.75)) / (g.fh * 1.5)));
              return (
                <div key={q.c.key} className="vMp-t-anchor" style={{ left: q.x, top: q.y }}>
                  <button type="button" className="vMp-t-stand" aria-label={`${q.c.name} ${q.c.count}軒`} style={{ left: -sz / 2, top: -sz, width: sz, height: sz, transformOrigin: `${sz / 2}px ${sz}px`, transform: `rotateX(${-TILT}deg)`, opacity: 0.7 + 0.3 * depth }} onClick={(e) => { e.stopPropagation(); onPick(q.c.key); }}>
                    <div className="vMp-circ" style={{ ["--s" as string]: `${sz}px`, animationDelay: `${delayOf(i)}ms` }}>
                      <b>{q.c.count}</b>
                      {q.c.count >= 8 && <span>{q.c.name}</span>}
                    </div>
                  </button>
                </div>
              );
            })}
          {!nation && pts.map((p, i) => {
            const [x, y] = g.at(p.lat, p.lng);
            const isFlag = flags.has(p.id);
            const depth = Math.min(1, Math.max(0, (y - (g.Fy - g.fh * 0.75)) / (g.fh * 1.5)));
            const delay = delayOf(rank.get(p.id) ?? i);
            const [bw, bh, ox, oy] = isFlag ? [112, 104, 56, 104] : [30, 40, 15, 38];
            return (
              <div key={p.id} className="vMp-t-anchor" style={{ left: x, top: y }}>
                <button
                  type="button"
                  className="vMp-t-stand"
                  aria-label={`${p.name}（${p.area}・${p.cuisine}）`}
                  style={{ left: -ox, top: -oy, width: bw, height: bh, transformOrigin: `${ox}px ${oy}px`, transform: `rotateX(${-TILT}deg)`, opacity: 0.66 + 0.34 * depth, zIndex: isFlag ? 2 : 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const box = boxRef.current!.getBoundingClientRect();
                    const r = e.currentTarget.getBoundingClientRect();
                    const px2 = r.left + r.width / 2 - box.left;
                    // 吹き出し（高さ 約 216px）は、ピンの上に収まれば上、だめなら下、どちらもだめなら箱の中ほどに出す（箱の外へ出さない）
                    const POP_H = 216;
                    const above = r.top - box.top - 8 >= POP_H;
                    const underOk = box.bottom - r.bottom - 8 >= POP_H;
                    const below = !above && underOk;
                    const y = above ? r.top - box.top - 6 : below ? r.bottom - box.top + 6 : Math.min(box.height - 4, Math.max(POP_H + 4, box.height / 2 + POP_H / 2));
                    setSel({ id: p.id, x: Math.min(Math.max(px2, 104), box.width - 104), y, below });
                  }}
                >
                  {isFlag ? (
                    <div className="vMp-flag" style={{ animationDelay: `${delay}ms` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.photo} alt="" loading="lazy" />
                      <b>{p.name}</b>
                    </div>
                  ) : (
                    <div className="vMp-pin" style={{ animationDelay: `${delay}ms` }}>
                      <i />
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div className="vMp-t-haze" aria-hidden="true" />
      {sel && selPt && (
        <div className={`vMp-t-pop${sel.below ? " is-below" : ""}`} style={{ left: sel.x, top: sel.y }} onClick={(e) => e.stopPropagation()}>
          <div className="vMp-pop">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {selPt.photo ? <img src={selPt.photo} alt="" /> : null}
            <b>{selPt.name}</b>
            <span>{selPt.area}・{selPt.cuisine}</span>
            <a href={`/restaurant/${encodeURIComponent(selPt.id)}`}>店のページへ →</a>
          </div>
        </div>
      )}
      <p className="vMp-credit">地図: 国土地理院ベクトルタイルをもとに作成</p>
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
  // f・g・h は、画像のある地域だけ（ほかの地域は e の絵）。全国は、この段階では e の絵
  const eff: MapMode = (mode === "f" || mode === "g" || mode === "h") && regionKey && !ILLUST[mode][regionKey] ? "e" : mode;
  return (
    <div className={`vMp-surface vMp-surface--${mode}`}>
      {mode === "a" && !regionKey ? (
        <GridJapan counts={prefCounts} prefRegion={prefRegion} onPick={onPick} />
      ) : eff === "h" && (regionKey || ILLUST_JAPAN.h) ? (
        <TiltMap key={regionKey || "japan"} regionKey={regionKey} pts={pts} circles={circles} onPick={onPick} reduce={reduce} />
      ) : (
        <LeafMap mode={eff === "h" ? "e" : eff} regionKey={regionKey} pts={pts} circles={circles} onPick={onPick} reduce={reduce} />
      )}
    </div>
  );
}
