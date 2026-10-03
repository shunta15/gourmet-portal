"use client";
/**
 * 総合サイトの地図（クライアント）。素の Leaflet（追加ライブラリなし）＋国土地理院の淡色タイル。
 * /map（大きな地図）と、駅ページ・県ページの小さな地図で共有する。
 *
 * ── 実装上の注意（既存 components/LeafletMap.tsx で過去に「地図が初期化されない」不具合があった）──
 *  - map は「作る effect」で 1 回だけ作る（deps は空）。店のデータ・絞り込みが変わるたびに map を作り直さない
 *    （作り直すと .leaflet-container が消える／effect が再実行のたびに破棄される、が過去の原因）。
 *  - ピンの描き直しは「別の effect」。deps は ready と、描く店の署名（id の並び）。配列の参照や state を deps に直接入れない。
 *  - 動的 import や IntersectionObserver を使うので、cleanup で cancelled を立て、作りかけの map は作らない（StrictMode の二重実行対策）。
 *  - 描き直しに使う最新の値（色・営業予定）は ref に入れて参照する（effect の deps を増やさない）。
 *  - 描き直しは「ズームが変わったとき」「店の集合が変わったとき」「前回描いた範囲（表示範囲の2倍）から表示が外に出たとき」だけ。
 *    普通のパンでは描き直さない（描き直すとピンが作り直されて、開いているポップアップが閉じる）。
 *    描くのは表示範囲の周り（縦横それぞれ1画面分の余白）に入る店だけなので、店が増えても DOM の数は一定の範囲に収まる。
 *
 * ── 件数が多いとき ──
 *  ズームが低い（既定 13 以下）あいだは、画面上で近い店を 1 つの丸（件数つき）にまとめる（素の Leaflet でできる範囲の格子まとめ）。
 *  丸を押すとその店が収まるまでズームする。ズームが十分高いと 1 店ずつのピン。ピンは DOM ではなく divIcon（数百〜千程度まで）。
 *
 * ── 営業中の判定 ──
 *  ポップアップは開くたびに現在時刻（日本時間）で判定し直す（bindPopup に関数を渡す）。
 *  「今開いている店だけ」（?open=1）のときは、営業中・まもなく閉店の店のピンだけ出す。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { LatLngBounds, LatLngBoundsExpression, LatLngTuple, Map as LeafletMapType, LayerGroup } from "leaflet";
import { isOpenState } from "@/lib/portal/openNow";
import { statusOf, useNowMs, useOpenOnly, type WeekTableProp } from "./OpenNow";

export interface PinPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  vertical: string;
  category: string;
  stationName?: string;
  href: string;
}

export interface MapView {
  /** 初期表示。bounds があればそこに収める。center と zoom があればそこへ。どちらも無ければ日本全体 */
  bounds?: [[number, number], [number, number]];
  center?: [number, number];
  zoom?: number;
}

interface Props {
  /** 描く店（親が業種などで絞り込み済み。座標のあるものだけ） */
  points: PinPoint[];
  /** 業種 key → 色（#hex） */
  colors: Record<string, string>;
  weeks: WeekTableProp;
  /** 駅の位置（駅ページ用）。ピンとは別の目印で出す */
  station?: { name: string; lat: number; lng: number };
  view?: MapView;
  /** true なら、ピンと駅が収まるように初期表示を合わせる（小さな地図用） */
  fit?: boolean;
  /** 画面に入るまで Leaflet を読み込まない（小さな地図用） */
  lazy?: boolean;
  height: number | string;
  label: string;
  className?: string;
}

/** 日本全体（南西端は八重山、北東端は北海道東部）。画面の大きさに合わせて収める */
const JAPAN_BOUNDS: [[number, number], [number, number]] = [
  [24.0, 122.8],
  [45.6, 146.0],
];
/** このズーム以下では近い店をまとめる */
const CLUSTER_MAX_ZOOM = 13;
const CELL_PX = 56;
const TILE_URL = "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>';
const INK = "#15110e";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** 店ページへのリンク。サイト内のパスか https だけ通す */
function safeHref(href: string): string {
  return href.startsWith("/") || href.startsWith("https://") ? href : "#";
}

const BADGE_LABEL: Record<string, string> = {
  open: "営業中",
  soon: "まもなく閉店",
  closed: "営業時間外",
  unknown: "営業時間不明",
};

export default function PortalMap({ points, colors, weeks, station, view, fit, lazy, height, label, className }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMapType | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  /** 前回ピンを描いた範囲（表示範囲＋1画面分の余白）。この外へ出たら描き直す */
  const renderedRef = useRef<LatLngBounds | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [ready, setReady] = useState(false);

  // 「今開いている店だけ」のときは、営業中・まもなく閉店の店だけ描く
  const only = useOpenOnly();
  const now = useNowMs();
  const visible = useMemo(() => {
    if (!only || now === null) return points;
    return points.filter((p) => {
      const r = statusOf(weeks, p.id, now);
      return r !== null && isOpenState(r.state);
    });
  }, [points, only, now, weeks]);
  // 描き直しの deps には配列そのものではなく署名を入れる（分ごとに now が変わっても、同じ店の集合なら描き直さない）
  const signature = useMemo(() => visible.map((p) => p.id).join(","), [visible]);

  // 描き直しが読む最新の値。effect の deps を増やさないために ref 経由で渡す（この effect は毎回の描画後・描き直しより前に走る）
  const live = useRef({ visible, colors, weeks });
  useEffect(() => {
    live.current = { visible, colors, weeks };
  });
  const initial = useRef({ view, fit, station, points });
  useEffect(() => {
    initial.current = { view, fit, station, points };
  });

  /* ── map を作る（1 回だけ。deps は空） ── */
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    let cancelled = false;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;

    const start = async () => {
      try {
        const L = (await import("leaflet")) as typeof import("leaflet");
        // leaflet.css は app/globals.css で読み込み済み
        if (cancelled || !elRef.current) return;
        const { view: v, fit: f, station: st, points: pts } = initial.current;
        const map = L.map(elRef.current, {
          zoomControl: true,
          minZoom: 4,
          maxZoom: 18,
          scrollWheelZoom: !f, // 小さな地図は、ページのスクロールを妨げないようホイールでは拡大しない
          dragging: !(f && L.Browser.mobile), // 小さな地図は、スマホでは 1 本指のドラッグでページをスクロールさせる
          worldCopyJump: false,
        });
        L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 18, maxNativeZoom: 18 }).addTo(map);

        if (f) {
          const all: LatLngTuple[] = pts.map((p) => [p.lat, p.lng]);
          if (st) all.push([st.lat, st.lng]);
          if (all.length === 1) map.setView(all[0], 16);
          else if (all.length > 1) map.fitBounds(all as LatLngBoundsExpression, { padding: [28, 28], maxZoom: 17 });
          else map.fitBounds(JAPAN_BOUNDS, { padding: [8, 8] });
        } else if (v?.bounds) {
          map.fitBounds(v.bounds as LatLngBoundsExpression, { padding: [32, 32], maxZoom: 15 });
        } else if (v?.center) {
          map.setView(v.center, v.zoom ?? 15);
        } else {
          map.fitBounds(JAPAN_BOUNDS, { padding: [8, 8] });
        }

        if (st) {
          L.marker([st.lat, st.lng], {
            icon: L.divIcon({
              className: "mp-stpin-wrap",
              html: `<span class="mp-stpin" aria-hidden="true">駅</span>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            }),
            title: `${st.name}`,
            zIndexOffset: 1000,
          })
            .bindPopup(`<div class="mp-pop"><b class="mp-pop-name">${esc(st.name)}</b><span class="mp-pop-sub">駅の位置（駅データによる）</span></div>`, {
              className: "mp-pop-wrap",
            })
            .addTo(map);
        }

        layerRef.current = L.layerGroup().addTo(map);
        leafletRef.current = L;
        mapRef.current = map;

        if (typeof ResizeObserver !== "undefined") {
          ro = new ResizeObserver(() => map.invalidateSize());
          ro.observe(elRef.current);
        }
        map.on("zoomend", () => draw());
        map.on("moveend", () => {
          const b = renderedRef.current;
          if (b && !b.contains(map.getBounds())) draw();
        });
        map.invalidateSize();
        setReady(true);
      } catch (e) {
        console.error("[PortalMap]", e);
      }
    };

    if (lazy && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io?.disconnect();
            io = null;
            void start();
          }
        },
        { rootMargin: "240px" },
      );
      io.observe(el);
    } else {
      void start();
    }

    return () => {
      cancelled = true;
      io?.disconnect();
      ro?.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      layerRef.current = null;
      leafletRef.current = null;
      renderedRef.current = null;
      setReady(false);
    };
    // 作るのは 1 回だけ。最新の値は ref 経由で読む
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── ピンの描き直し（ズームが変わったとき・店の集合が変わったとき） ── */
  function draw() {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;
    const { visible: all, colors: cols, weeks: wk } = live.current;
    layer.clearLayers();
    const z = map.getZoom();
    // 表示範囲の周り（1画面分の余白）に入る店だけを描く
    const area = map.getBounds().pad(1);
    renderedRef.current = area;
    const pts = all.filter((p) => area.contains([p.lat, p.lng]));
    const colorOf = (v: string) => cols[v] ?? INK;

    const pin = (p: PinPoint) => {
      const m = L.marker([p.lat, p.lng], {
        icon: L.divIcon({
          className: "mp-pin-wrap",
          html: `<span class="mp-pin" style="--pc:${esc(colorOf(p.vertical))}"></span>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        }),
        title: p.name,
        riseOnHover: true,
      });
      // 開くたびに、その時点の現在時刻（日本時間）で営業中かを判定し直す
      m.bindPopup(
        () => {
          const r = statusOf(wk, p.id, Date.now());
          const badge = r
            ? `<span class="mp-ob" data-s="${r.state}"><b>${BADGE_LABEL[r.state]}</b>${
                r.state !== "unknown" ? "<small>（店の案内の営業時間による）</small>" : ""
              }</span>`
            : "";
          const sub = [p.category, p.stationName].filter((x): x is string => !!x).map(esc).join("・");
          return (
            `<div class="mp-pop">` +
            `<b class="mp-pop-name">${esc(p.name)}</b>` +
            (sub ? `<span class="mp-pop-sub">${sub}</span>` : "") +
            badge +
            `<a class="mp-pop-link" href="${esc(safeHref(p.href))}">店のページを見る →</a>` +
            `</div>`
          );
        },
        { className: "mp-pop-wrap", maxWidth: 260 },
      );
      layer.addLayer(m);
    };

    if (z > CLUSTER_MAX_ZOOM) {
      pts.forEach(pin);
      return;
    }
    // 近い店をまとめる（ズームごとの画面上の格子。パンしても同じ組み合わせ）
    const cells = new Map<string, PinPoint[]>();
    for (const p of pts) {
      const xy = map.project([p.lat, p.lng], z);
      const key = `${Math.floor(xy.x / CELL_PX)}:${Math.floor(xy.y / CELL_PX)}`;
      const list = cells.get(key);
      if (list) list.push(p);
      else cells.set(key, [p]);
    }
    cells.forEach((members) => {
      if (members.length === 1) {
        pin(members[0]);
        return;
      }
      const lat = members.reduce((a, p) => a + p.lat, 0) / members.length;
      const lng = members.reduce((a, p) => a + p.lng, 0) / members.length;
      const kinds = new Set(members.map((p) => p.vertical));
      const color = kinds.size === 1 ? colorOf(members[0].vertical) : INK;
      const size = members.length >= 100 ? 48 : members.length >= 10 ? 40 : 32;
      const m = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "mp-cl-wrap",
          html: `<span class="mp-cl" style="--pc:${esc(color)};width:${size}px;height:${size}px">${members.length}</span>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        }),
        title: `${members.length}店（押すと拡大）`,
        riseOnHover: true,
      });
      m.on("click", () => {
        map.fitBounds(L.latLngBounds(members.map((p) => [p.lat, p.lng] as LatLngTuple)), { padding: [48, 48], maxZoom: 17 });
      });
      layer.addLayer(m);
    });
  }

  useEffect(() => {
    if (ready) draw();
    // 描き直しは「準備ができた」と「店の集合が変わった」ときだけ（draw は ref 経由で最新値を読む）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, signature]);

  return (
    <div
      ref={elRef}
      className={className ? `mp-map ${className}` : "mp-map"}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
      role="region"
      aria-label={label}
      data-ready={ready ? "1" : "0"}
      data-pins={ready ? visible.length : undefined}
    >
      {!ready && <div className="mp-map-wait">地図を読み込み中…</div>}
    </div>
  );
}
