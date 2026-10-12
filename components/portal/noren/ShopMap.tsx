"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ILLUST, ILLUST_JAPAN, type IllustLayer } from "@/lib/portal/noren/illustMaps.generated";
import { quantFit } from "@/lib/portal/noren/mapFit";
import { median } from "@/lib/portal/noren/regionCenters";
import PinCard, { CLUSTER_PX, NARROW_PX, type PinSel } from "./PinCard";

/**
 * 「さがす」の地図（暖簾版）。手描き風 e だけ（2026-10-12 オーナー決定「a の手書き風に決定」。以前の a 絵図・f 古地図・g 夜の灯り・h 見下ろす と、?map= の切り替えは外した）:
 * 国土地理院ベクトルタイルから描き起こした地図（automation/illust-map）を、あらかじめ画像（WebP）にして、実際の範囲に敷く。ピンは本当の位置。
 * 地域を選んだときの地図と店のピンはここ。block の見た目で地域も地方も選んでいないときは、日本全体の大きな地図は出さず、地方を選ぶ入口（AreaPicker.tsx）。地方の地図（丸）は AreaMap.tsx。
 * 全国の地図（地域ごとの丸）は、暖簾の見た目（RELEASE_REST が false のとき）の「さがす」だけが使う。
 * 地図に立てるのはピンだけ（写真つきの札は立てない）。ピン（朱）・落ちる順番と速さ・最初の寄せ方（外れ値を除いた中央の約 88%）は、地域ごとに同じ。
 * ピンを押す（スマホはタップ）と、店の情報の札（PinCard.tsx。写真・店名・エリアと最寄り駅・業種・店ページへ）。画面上で近いピンは、押すと一覧（選ぶとその店の情報）。
 * 地域を選んだとき・選び直したときは、地図がその地域へ寄り、店のピンが 1 つずつ少しずつ遅れて上から落ちてきて（(i % 36) * 70 + 250ms）立つ。
 * 動かすのは transform と opacity だけ。「動きを減らす」設定では動かさず、すぐ出す。タイマーは使わず（CSS の遅れだけ）、選び直すと前のピンは消す。
 * 出典: 地図は国土地理院ベクトルタイルをもとに作成（画面に表記）。新しいパッケージ・有料の地図・ネットからのデータ取得は無い（leaflet は既存）。
 */

export type MapPt = { id: string; name: string; lat: number; lng: number; area: string; cuisine: string; photo: string; town: string; region: string; /** 最寄り駅（店のデータの nearest。札に駅名と徒歩だけ出す） */ nearest?: string };

/** 初期表示の余白（px）。写真つきの札は立てない（ピンだけ）ので、ピン（高さ約 40）が箱の辺で切れない程度 */
const PAD_SIDE = 40;
const PAD_TOP = 56;
const PAD_BOTTOM = 28;

const JAPAN: [[number, number], [number, number]] = [[30.0, 128.5], [45.8, 146.0]];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** 地域を選んだときの地図とピン、と全国の地域ごとの丸（暖簾の見た目だけ）: leaflet に、あらかじめ画像にした手描き風の地図を敷く */
function LeafMap({
  regionKey,
  pts,
  circles,
  onPick,
  reduce,
}: {
  regionKey: string;
  pts: MapPt[];
  circles: { key: string; name: string; count: number; lat: number; lng: number }[];
  onPick: (region: string) => void;
  reduce: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const st = useRef<{ L: typeof import("leaflet"); map: import("leaflet").Map; layer: import("leaflet").LayerGroup } | null>(null);
  const [ready, setReady] = useState(false);
  // ピンを押したときの店の情報の札（PinCard）。ピンの要素は、押されている印（is-sel）を付けるために持つ
  const [sel, setSel] = useState<PinSel | null>(null);
  const selRef = useRef<PinSel | null>(null);
  selRef.current = sel;
  const ptsRef = useRef(pts);
  ptsRef.current = pts;
  const byId = useMemo(() => new Map(pts.map((p) => [p.id, p])), [pts]);
  const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());
  // いま敷いている地図の画像（粗い層・細かい層）と、その url
  const overlayRef = useRef<import("leaflet").ImageOverlay | null>(null);
  const coreRef = useRef<import("leaflet").ImageOverlay | null>(null);
  const overlayKey = useRef("");
  // 寄せる動き（飛ぶ）が終わってから、範囲の外へ出られない制限をかける（動きの途中に掛けると、飛ぶ先がずれる）
  const moveEndRef = useRef<(() => void) | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const key = useMemo(() => JSON.stringify([regionKey, pts.map((p) => p.id), circles.map((c) => [c.key, c.count])]), [regionKey, pts, circles]);

  // 地図を作る（動きの設定が替わったときだけ作り直す）。後始末: 地図を破棄
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
        minZoom: 5,
        maxZoom: 17,
        maxBoundsViscosity: 1,
        zoomAnimation: !reduce,
        fadeAnimation: !reduce,
        markerZoomAnimation: !reduce,
      });
      map.fitBounds(JAPAN, { animate: false });
      const layer = L.layerGroup().addTo(map);
      st.current = { L, map, layer };
      // 札の外（地図の面）を押す・地図を動かす（拡大縮小・ドラッグ・寄せる動き）と、札は閉じる
      map.on("click", (e) => {
        if ((e.originalEvent?.target as Element | undefined)?.closest?.(".vMp-card")) return;
        setSel(null);
      });
      map.on("movestart", () => setSel(null));
      ro = new ResizeObserver(() => {
        map.invalidateSize();
        setSel(null);
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
  }, [reduce]);

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
    markersRef.current.clear();
    setSel(null);
    const bb = L.latLngBounds([]);
    const delayOf = (i: number) => (reduce ? 0 : (i % 36) * 70 + 250);

    // その地域の画像を、実際の範囲に敷く（だから店のピンは本当の位置に落ちる）。範囲の外へは動かせず、拡大は敷いた範囲が箱を埋める所まで
    let eSetup: null | { bounds: import("leaflet").LatLngBounds } = null;
    {
      const info = regionKey ? ILLUST[regionKey] : undefined;
      const jp: IllustLayer = ILLUST_JAPAN.e;
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

    if (!regionKey) {
      // 全国（暖簾の見た目だけ）。地域ごとの丸（件数つき）。丸が重なる所は少しずらし、線で元の位置につなぐ。押すとその地域で絞り込む
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

    // 店のピン（写真つきの札は立てない）
    pts.forEach((p) => bb.extend([p.lat, p.lng]));
    // 寄せる範囲（a と同じ。lib/portal/noren/mapFit.ts。描き起こしのスクリプトとも同じ決め方）: 店が多いときは、はずれ値（遠く離れた数軒）を除いた中央の約 88%（上下 6% を除く）。除いた店は、地図を動かせば見える
    const qf = pts.length > 12 ? quantFit(pts) : null;
    const fit = qf ? L.latLngBounds([qf.minLat, qf.minLng], [qf.maxLat, qf.maxLng]) : bb;
    // 寄せたあとのズーム（箱を埋める下限・拡大の上限に挟まれる）と、そのときの箱への写し（寄せる範囲の中心が、余白を引いた箱の中心に来る）
    const BW = ref.current?.clientWidth ?? 800;
    const BH = ref.current?.clientHeight ?? 460;
    const tzf = pts.length > 1 ? Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), Math.min(14, map.getBoundsZoom(fit, false, L.point(2 * PAD_SIDE, PAD_TOP + PAD_BOTTOM))))) : 0;
    const ctrP = tzf ? map.project(fit.getCenter(), tzf) : null;
    const shiftX = ctrP ? BW / 2 - ctrP.x : 0;
    const shiftY = ctrP ? (PAD_TOP + BH - PAD_BOTTOM) / 2 - ctrP.y : 0;
    // 落ちる順は、寄せた範囲の中心に近い店から（見えている店が先に現れる）
    const fc = fit.isValid() ? fit.getCenter() : L.latLng(0, 0); // 位置のある店が 1 軒も無い地域では、範囲が空
    const rank = new Map(
      [...pts]
        .sort((a, b) => Math.hypot(a.lat - fc.lat, (a.lng - fc.lng) * 0.82) - Math.hypot(b.lat - fc.lat, (b.lng - fc.lng) * 0.82))
        .map((p, i) => [p.id, i] as const),
    );
    // ピンを押す: 近いピン（画面上 CLUSTER_PX 以内）が 2 つ以上なら一覧、1 つならその店の情報。同じピンをもう一度押すと閉じる
    const openAt = (id: string, byKey: boolean) => {
      if (selRef.current?.origin === id) {
        setSel(null);
        return;
      }
      const p0 = ptsRef.current.find((q) => q.id === id);
      const el = ref.current;
      if (!p0 || !el) return;
      const tip = map.latLngToContainerPoint([p0.lat, p0.lng]);
      const near = ptsRef.current
        .map((q) => {
          const c = map.latLngToContainerPoint([q.lat, q.lng]);
          return { id: q.id, d: Math.hypot(c.x - tip.x, c.y - tip.y) };
        })
        .filter((o) => o.d <= CLUSTER_PX)
        .sort((a, b) => a.d - b.d || a.id.localeCompare(b.id));
      const bw = el.clientWidth;
      const bh = el.clientHeight;
      setSel({ origin: id, ids: near.map((o) => o.id), id: near.length >= 2 ? null : id, ax: tip.x, ay: tip.y, bw, bh, narrow: bw < NARROW_PX, byKey });
    };
    pts.forEach((p, i) => {
      const delay = delayOf(rank.get(p.id) ?? i);
      const icon = L.divIcon({
        className: "vMp-mk",
        iconSize: [30, 40],
        iconAnchor: [15, 38],
        // ピンに乗る（hover）と店名だけ小さく出る（.vMp-pn）
        html: `<div class="vMp-pin" style="animation-delay:${delay}ms"><i></i><span class="vMp-pn">${esc(p.name)}</span></div>`,
      });
      const m = L.marker([p.lat, p.lng], { icon, keyboard: true, alt: p.name }).addTo(layer);
      m.getElement()?.setAttribute("aria-label", `${p.name}（${p.area}・${p.cuisine}）。Enter で店の情報`);
      m.on("click", () => openAt(p.id, false));
      // キーボード: Tab でピンを順に選び、Enter（または Space）で店の情報（Leaflet の標準は、吹き出しを付けたときだけ Enter に反応するので、自分で受ける）
      m.getElement()?.addEventListener("keydown", (ev) => {
        if (ev.key !== "Enter" && ev.key !== " ") return;
        ev.preventDefault();
        ev.stopPropagation();
        openAt(p.id, true);
      });
      markersRef.current.set(p.id, m);
    });

    // 目印に、店の多い市区町村の名前を、その店たちの中心あたりに出す（筆の字で、ピン・札に重なりにくい位置へずらす）
    {
      const g = new Map<string, MapPt[]>();
      for (const p of pts) if (p.town) g.set(p.town, [...(g.get(p.town) ?? []), p]);
      const towns = [...g.entries()].sort((x, y) => y[1].length - x[1].length).slice(0, 8);
      // 寄せたあとのズームで、ピンの画面上の位置を求め、いちばん重ならない向きへ名前をずらす
      const tz = tzf;
      const boxes: [number, number, number, number][] = [];
      if (tz) {
        for (const p of pts) {
          const q = map.project([p.lat, p.lng], tz);
          boxes.push([q.x - 13, q.y - 42, q.x + 13, q.y + 2]);
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
      const OFFS: [number, number][] = [[0, 0], [0, -34], [0, 34], [-70, 0], [70, 0], [-56, -30], [56, -30], [-56, 30], [56, 30], [0, -60], [0, 60], [-100, 0], [100, 0]];
      const placed: number[][] = [];
      towns.forEach(([town, list]) => {
        const lat = list.reduce((a, p) => a + p.lat, 0) / list.length;
        const lng = list.reduce((a, p) => a + p.lng, 0) / list.length;
        let at: [number, number] = [lat, lng];
        if (tz) {
          const c = map.project([lat, lng], tz);
          const nch = Array.from(town).length;
          const w = nch * 19 + 10;
          const hh2 = 26;
          let best = OFFS[0], bestScore = Infinity;
          for (const o of OFFS) {
            const r = [c.x + o[0] - w / 2, c.y + o[1] - hh2 / 2, c.x + o[0] + w / 2, c.y + o[1] + hh2 / 2];
            let sc = Math.hypot(o[0], o[1]) * 0.05 + outside(r) * 4;
            for (const bx of boxes) sc += overlap(r, bx);
            for (const pl of placed) sc += overlap(r, pl) * 3;
            if (sc < bestScore) { bestScore = sc; best = o; }
          }
          placed.push([c.x + best[0] - w / 2, c.y + best[1] - hh2 / 2, c.x + best[0] + w / 2, c.y + best[1] + hh2 / 2]);
          const ll = map.unproject([c.x + best[0], c.y + best[1]], tz);
          at = [ll.lat, ll.lng];
        }
        L.marker(at, {
          icon: L.divIcon({
            className: "vMp-mk vMp-mk--town",
            iconSize: [140, 24],
            iconAnchor: [70, 12],
            html: `<span class="vMp-town vMp-town--e">${esc(town)}</span>`,
          }),
          interactive: false,
          keyboard: false,
          zIndexOffset: -1000,
        }).addTo(layer);
      });
    }

    if (pts.length > 1) {
      // 余白（PAD_*）: 最初に寄った状態で、ピンが箱の辺で切れないようにする
      const opt = { paddingTopLeft: [PAD_SIDE, PAD_TOP] as [number, number], paddingBottomRight: [PAD_SIDE, PAD_BOTTOM] as [number, number], maxZoom: 14 };
      if (reduce) {
        map.fitBounds(fit, { ...opt, animate: false });
        if (eSetup) map.setMaxBounds(eSetup.bounds);
      } else if (eSetup) {
        // e: 新しい地域の地図の上で、一段ひいた所から、なめらかに寄せる
        const z1 = Math.min(14, map.getBoundsZoom(fit, false, L.point(2 * PAD_SIDE, PAD_TOP + PAD_BOTTOM)));
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

  // 押されているピンの印（色と大きさ）。一覧から選んだときは、その店のピン
  useEffect(() => {
    const hl = sel ? (sel.id ?? sel.origin) : null;
    markersRef.current.forEach((m, id) => m.getElement()?.classList.toggle("is-sel", id === hl));
  }, [sel]);
  // Esc で閉じる（押していたピンへフォーカスを戻す）
  useEffect(() => {
    if (!sel) return;
    const f = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const o = sel.origin;
      setSel(null);
      markersRef.current.get(o)?.getElement()?.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", f);
    return () => document.removeEventListener("keydown", f);
  }, [sel]);

  return (
    <div className="vMp-leaf vMp-leaf--e" ref={ref} role="region" aria-label="店の地図">
      {!ready && <div className="vMp-maploading">地図を読み込み中…</div>}
      <p className="vMp-credit">地図: 国土地理院ベクトルタイルをもとに作成</p>
      {sel && <PinCard byId={byId} sel={sel} onPick={(id) => setSel({ ...sel, id })} onBack={() => setSel({ ...sel, id: null })} onClose={() => setSel(null)} />}
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

/** 「さがす」の地図の本体（手描き風 e）。地域を選んだとき（regionKey あり）は地域の地図と店のピン、全国（regionKey が空。暖簾の見た目だけ）は地域ごとの丸 */
export default function ShopMap({
  regionKey,
  pts,
  regionCounts,
  onPick,
}: {
  regionKey: string;
  /** 位置のある店（絞り込んだ全部。上限は設けない） */
  pts: MapPt[];
  /** 地域ごとの店の数（絞り込んだ店。全国の丸に使う） */
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
  // 全国: 地域ごとの丸。件数は、絞り込んだ店のその地域の数（位置の無い店も数える。呼び出し側が数えた regionCounts）。位置は、その地域の位置のある店の座標の中央値
  const circles = useMemo(() => {
    const g = new Map<string, MapPt[]>();
    for (const p of pts) g.set(p.region, [...(g.get(p.region) ?? []), p]);
    return regionCounts.flatMap((r) => {
      const l = g.get(r.key);
      return l && l.length > 0 && r.count > 0 ? [{ key: r.key, name: r.name, count: r.count, lat: median(l.map((p) => p.lat)), lng: median(l.map((p) => p.lng)) }] : [];
    });
  }, [pts, regionCounts]);
  return (
    <div className="vMp-surface vMp-surface--e">
      <LeafMap regionKey={regionKey} pts={pts} circles={circles} onPick={onPick} reduce={reduce} />
    </div>
  );
}
