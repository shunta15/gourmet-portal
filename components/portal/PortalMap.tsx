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
 * ── 背景が「plain」のとき（/map の県の段） ──
 *  地図タイルを使わない。紙色の地に、経緯線（点線）・駅名の注記・店の点だけを描く（実際の地図らしさを出さない）。
 *  点線の経緯線と駅名は draw() の中で、ピンと同じ範囲（表示範囲の周り）だけ描き直す。
 *  駅名は、ズームごとの画面上の位置（地図の投影座標）で重なりを避けて選ぶ（店の数が多い駅を優先）。パンしても組み合わせは変わらない。
 *  highlightId の店には、リストと対応づけるための輪（ハロー）を重ねる（クラスタ化されていても位置に出る）。
 *
 * ── 営業中の判定 ──
 *  ポップアップは開くたびに現在時刻（日本時間）で判定し直す（bindPopup に関数を渡す）。
 *  「今開いている店だけ」（?open=1）のときは、営業中・まもなく閉店の店のピンだけ出す。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { LatLngBounds, LatLngBoundsExpression, LatLngTuple, Map as LeafletMapType, LayerGroup, Marker } from "leaflet";
import { isOpenState } from "@/lib/portal/openNow";
import type { StationLabel } from "@/lib/portal/mapRegions";
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
  /**
   * 背景の地図。省略（"pale"）は国土地理院の淡色地図。"blank" は国土地理院の白地図（道路・地形なし。タイルはズーム5〜14。
   * それより拡大したときはタイルを引き伸ばす）。/map だけが "blank" を指定する
   */
  basemap?: "pale" | "blank" | "plain";
  /** true なら、親の大きさいっぱいに広げる（height は使わない）。親は position が static 以外で大きさを持つこと */
  fill?: boolean;
  /** plain: 駅名の注記 */
  stations?: StationLabel[];
  /** plain: この ID の店に輪を重ねる（リストとの対応） */
  highlightId?: string | null;
  /** plain: 点の範囲の周りだけ動けるようにする */
  limit?: boolean;
  /** plain: 最初に点を北から順に現す */
  intro?: boolean;
  /** plain: 駅の位置のまわりに、この距離（メートル）の輪を描く（徒歩の目安） */
  rings?: { m: number; label: string }[];
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
/** 白地図の提供ズームは 5〜14（地理院タイル一覧）。14 を超える拡大は引き伸ばし、16 まで */
const BLANK_TILE_URL = "https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png";
const BLANK_MIN_ZOOM = 5;
const BLANK_NATIVE_MAX_ZOOM = 14;
const BLANK_MAX_ZOOM = 16;
const TILE_ATTRIBUTION =
  '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>';
const INK = "#15110e";
/** plain の背景（タイルなし）で使える拡大の範囲 */
const PLAIN_MIN_ZOOM = 5;
const PLAIN_MAX_ZOOM = 17;
/** 経緯線の間隔の候補（度） */
const GRAT_STEPS = [0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2];
const GRAT_PX = 150;
const MAX_LABELS = 28;
/** plain では、これより低いズームで近い店をまとめる（点の分布を見せたいので、既定より低くまとめない） */
const PLAIN_CLUSTER_MAX_ZOOM = 10;
const PLAIN_CELL_PX = 44;
/** plain の初期表示: 店が多い県は、中心に近い店の 90% が収まる範囲に合わせる（離れた数店で全体が小さくならないように） */
const CORE_MIN_POINTS = 12;
const CORE_KEEP = 0.9;

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

export default function PortalMap({
  points,
  colors,
  weeks,
  station,
  view,
  fit,
  lazy,
  height,
  label,
  className,
  basemap,
  fill,
  stations,
  highlightId,
  limit,
  intro,
  rings,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMapType | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  /** plain: 経緯線・駅名・輪の層と、リストとの対応の輪 */
  const gratRef = useRef<LayerGroup | null>(null);
  const labelRef = useRef<LayerGroup | null>(null);
  const haloRef = useRef<Marker | null>(null);
  /** plain: 最初の描き直しだけ点を順に現す */
  const introRef = useRef(false);
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
  const live = useRef({ visible, colors, weeks, stations });
  useEffect(() => {
    live.current = { visible, colors, weeks, stations };
  });
  const initial = useRef({ view, fit, station, points, basemap, limit, intro, rings });
  useEffect(() => {
    initial.current = { view, fit, station, points, basemap, limit, intro, rings };
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
        const { view: v, fit: f, station: st, points: pts, basemap: bm, limit: lim, intro: itr, rings: rg } = initial.current;
        const blank = bm === "blank";
        const plain = bm === "plain";
        const map = L.map(elRef.current, {
          zoomControl: !plain,
          minZoom: plain ? PLAIN_MIN_ZOOM : blank ? BLANK_MIN_ZOOM : 4,
          maxZoom: plain ? PLAIN_MAX_ZOOM : blank ? BLANK_MAX_ZOOM : 18,
          scrollWheelZoom: !f, // 小さな地図は、ページのスクロールを妨げないようホイールでは拡大しない
          dragging: !(f && L.Browser.mobile), // 小さな地図は、スマホでは 1 本指のドラッグでページをスクロールさせる
          worldCopyJump: false,
        });
        if (plain) {
          // 地図タイルは使わない（紙色の地に、点・駅名・経緯線だけを描く）
          L.control.scale({ position: "bottomleft", imperial: false, maxWidth: 96 }).addTo(map);
          L.control.zoom({ position: "bottomright", zoomInTitle: "拡大", zoomOutTitle: "縮小" }).addTo(map);
        } else if (blank) {
          L.tileLayer(BLANK_TILE_URL, {
            attribution: TILE_ATTRIBUTION,
            minZoom: BLANK_MIN_ZOOM,
            maxZoom: BLANK_MAX_ZOOM,
            maxNativeZoom: BLANK_NATIVE_MAX_ZOOM,
          }).addTo(map);
        } else {
          L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 18, maxNativeZoom: 18 }).addTo(map);
        }

        if (f) {
          const all: LatLngTuple[] = pts.map((p) => [p.lat, p.lng]);
          if (st) all.push([st.lat, st.lng]);
          if (all.length === 1) map.setView(all[0], 16);
          else if (all.length > 1) map.fitBounds(all as LatLngBoundsExpression, { padding: [28, 28], maxZoom: 17 });
          else map.fitBounds(JAPAN_BOUNDS, { padding: [8, 8] });
        } else if (v?.bounds) {
          if (plain) {
            const full = v.bounds as Bounds2;
            const fo = { paddingTopLeft: [56, 96] as [number, number], paddingBottomRight: [56, 72] as [number, number], maxZoom: 13 };
            const core = coreBounds(pts);
            map.fitBounds((core ?? full) as LatLngBoundsExpression, fo);
            const coreZoom = map.getZoom();
            const fullZoom = map.getBoundsZoom(L.latLngBounds(full), false, L.point(112, 168));
            if (lim) {
              // 点の範囲の周りだけ動ける（何もない紙の上で迷わないように）
              map.setMaxBounds(L.latLngBounds(full).pad(1.2));
              map.setMinZoom(Math.max(PLAIN_MIN_ZOOM, Math.min(coreZoom, fullZoom) - 1));
            }
            // 「全体を見る」: 表示の外にある店の数も出す
            const ctl = new L.Control({ position: "bottomleft" });
            ctl.onAdd = () => {
              const btn = L.DomUtil.create("button", "mp-fit") as HTMLButtonElement;
              btn.type = "button";
              L.DomEvent.disableClickPropagation(btn);
              L.DomEvent.on(btn, "click", () => map.fitBounds(L.latLngBounds(full), fo));
              const update = () => {
                const b = map.getBounds();
                const out = live.current.visible.filter((p) => !b.contains([p.lat, p.lng])).length;
                btn.innerHTML = `全体を見る${out > 0 ? `<small>表示の外に ${out}店</small>` : ""}`;
              };
              map.on("moveend zoomend", update);
              queueMicrotask(update);
              return btn;
            };
            ctl.addTo(map);
          } else {
            map.fitBounds(v.bounds as LatLngBoundsExpression, { padding: [32, 32], maxZoom: 15 });
          }
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
            .bindPopup(
              `<div class="mp-pop"><b class="mp-pop-name">${esc(st.name)}</b><span class="mp-pop-sub">駅の位置（駅データによる）</span></div>`,
              {
                className: "mp-pop-wrap",
              },
            )
            .addTo(map);
        }

        if (plain) {
          gratRef.current = L.layerGroup().addTo(map);
          labelRef.current = L.layerGroup().addTo(map);
          introRef.current = !!itr;
          if (st && rg) {
            // 駅からの距離の輪（徒歩の目安。80m ＝ 徒歩 1 分の換算）。タップを受けない
            for (const ring of rg) {
              L.circle([st.lat, st.lng], { radius: ring.m, weight: 1, color: INK, opacity: 0.42, fill: false, dashArray: "2 5", interactive: false }).addTo(map);
              const north = L.latLng(st.lat, st.lng).toBounds(ring.m * 2).getNorth();
              L.marker([north, st.lng], {
                interactive: false,
                keyboard: false,
                icon: L.divIcon({ className: "mp-dring-wrap", html: `<span class="mp-dring-l">${esc(ring.label)}</span>`, iconSize: [0, 0] }),
              }).addTo(map);
            }
          }
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
      gratRef.current = null;
      labelRef.current = null;
      haloRef.current = null;
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
    const { visible: all, colors: cols, weeks: wk, stations: stl } = live.current;
    layer.clearLayers();
    const z = map.getZoom();
    // 表示範囲の周り（1画面分の余白）に入る店だけを描く
    const area = map.getBounds().pad(1);
    renderedRef.current = area;
    const plain = initial.current.basemap === "plain";
    if (plain) {
      drawGraticule(L, map, area, gratRef.current);
    }
    // 点・まとめの丸の画面上の場所（ズームごとの投影座標）。駅名を置くとき、これに重ならない場所を選ぶ
    const obstacles: Box[] = [];
    const addObstacle = (lat: number, lng: number, half: number) => {
      const q = map.project([lat, lng], z);
      obstacles.push({ x0: q.x - half, y0: q.y - half, x1: q.x + half, y1: q.y + half });
    };
    // 最初の 1 回だけ、点を北から順に現す（拡大・移動のたびには動かさない）
    const intro = introRef.current;
    introRef.current = false;
    const order = intro ? new Map([...all].sort((a, b) => b.lat - a.lat).map((p, i) => [p.id, i])) : null;
    const pts = all.filter((p) => area.contains([p.lat, p.lng]));
    const colorOf = (v: string) => cols[v] ?? INK;

    const pin = (p: PinPoint) => {
      const m = L.marker([p.lat, p.lng], {
        icon: L.divIcon({
          className: "mp-pin-wrap",
          html: `<span class="mp-pin${order ? " mp-pin-in" : ""}" style="--pc:${esc(colorOf(p.vertical))}${
            order ? `;--i:${Math.min(order.get(p.id) ?? 0, 70)}` : ""
          }"></span>`,
          // 県の段（plain）は、点の見た目は小さいまま、押せる範囲を 44px にする
          iconSize: plain ? [44, 44] : [24, 24],
          iconAnchor: plain ? [22, 22] : [12, 12],
          popupAnchor: plain ? [0, -16] : [0, -12],
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
          const sub = [p.category, p.stationName]
            .filter((x): x is string => !!x)
            .map(esc)
            .join("・");
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
      if (plain) addObstacle(p.lat, p.lng, 8);
    };

    const clusterMax = plain ? PLAIN_CLUSTER_MAX_ZOOM : CLUSTER_MAX_ZOOM;
    const cellPx = plain ? PLAIN_CELL_PX : CELL_PX;
    if (plain && elRef.current) elRef.current.dataset.z = z <= 11 ? "s" : z <= 13 ? "m" : "l";
    if (z > clusterMax) {
      pts.forEach(pin);
      if (plain) drawStationLabels(L, map, area, labelRef.current, stl ?? [], obstacles);
      return;
    }
    // 近い店をまとめる（ズームごとの画面上の格子。パンしても同じ組み合わせ）
    const cells = new Map<string, PinPoint[]>();
    for (const p of pts) {
      const xy = map.project([p.lat, p.lng], z);
      const key = `${Math.floor(xy.x / cellPx)}:${Math.floor(xy.y / cellPx)}`;
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
      if (plain) addObstacle(lat, lng, size / 2 + 2);
    });
    if (plain) drawStationLabels(L, map, area, labelRef.current, stl ?? [], obstacles);
  }

  useEffect(() => {
    if (ready) draw();
    // 描き直しは「準備ができた」と「店の集合が変わった」ときだけ（draw は ref 経由で最新値を読む）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, signature]);

  /* ── リストと対応づける輪（plain） ── */
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map || basemap !== "plain") return;
    haloRef.current?.remove();
    haloRef.current = null;
    if (!highlightId) return;
    const p = live.current.visible.find((x) => x.id === highlightId);
    if (!p) return;
    haloRef.current = L.marker([p.lat, p.lng], {
      interactive: false,
      keyboard: false,
      zIndexOffset: 3000,
      icon: L.divIcon({ className: "mp-hl-wrap", html: `<span class="mp-hl"></span>`, iconSize: [44, 44], iconAnchor: [22, 22] }),
    }).addTo(map);
    // 輪が画面の外なら、中心へ寄せる（拡大はしない）
    if (!map.getBounds().contains([p.lat, p.lng])) map.panTo([p.lat, p.lng]);
  }, [ready, highlightId, basemap]);

  return (
    <div
      ref={elRef}
      className={["mp-map", fill ? "mp-map-fill" : "", basemap === "plain" ? "mp-map-plain" : "", className ?? ""].filter(Boolean).join(" ")}
      style={fill ? undefined : { height: typeof height === "number" ? `${height}px` : height }}
      role="region"
      aria-label={label}
      data-ready={ready ? "1" : "0"}
      data-pins={ready ? visible.length : undefined}
    >
      {!ready && <div className="mp-map-wait">地図を読み込み中…</div>}
    </div>
  );
}

/* ───────────── plain 用: 初期表示の範囲・経緯線・駅名 ───────────── */

type Bounds2 = [[number, number], [number, number]];
interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** 点が多いとき、中心（緯度経度それぞれの中央値）に近い 90% の店が収まる範囲。少ないとき・外れが無いときは null */
function coreBounds(pts: PinPoint[]): Bounds2 | null {
  if (pts.length < CORE_MIN_POINTS) return null;
  const med = (a: number[]) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const mlat = med(pts.map((p) => p.lat));
  const mlng = med(pts.map((p) => p.lng));
  const kx = Math.cos((mlat * Math.PI) / 180);
  const dist = (p: PinPoint) => Math.hypot((p.lat - mlat) * 111, (p.lng - mlng) * 111 * kx);
  const kept = [...pts].sort((a, b) => dist(a) - dist(b)).slice(0, Math.ceil(pts.length * CORE_KEEP));
  const lats = kept.map((p) => p.lat);
  const lngs = kept.map((p) => p.lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}

/** 画面上で GRAT_PX ほど空く、きりのよい間隔（度） */
function gratStep(zoom: number): number {
  const pxPerDeg = (256 * 2 ** zoom) / 360;
  const want = GRAT_PX / pxPerDeg;
  return GRAT_STEPS.find((s) => s >= want) ?? GRAT_STEPS[GRAT_STEPS.length - 1];
}

function drawGraticule(L: typeof import("leaflet"), map: LeafletMapType, area: LatLngBounds, layer: LayerGroup | null) {
  if (!layer) return;
  layer.clearLayers();
  const step = gratStep(map.getZoom());
  const south = Math.floor(area.getSouth() / step) * step;
  const north = Math.ceil(area.getNorth() / step) * step;
  const west = Math.floor(area.getWest() / step) * step;
  const east = Math.ceil(area.getEast() / step) * step;
  const style = { weight: 1, color: INK, opacity: 0.22, dashArray: "1 7", lineCap: "round" as const, interactive: false };
  let n = 0;
  for (let lat = south; lat <= north + 1e-9 && n < 60; lat += step, n++) {
    L.polyline(
      [
        [lat, west],
        [lat, east],
      ],
      style,
    ).addTo(layer);
  }
  for (let lng = west; lng <= east + 1e-9 && n < 120; lng += step, n++) {
    L.polyline(
      [
        [south, lng],
        [north, lng],
      ],
      style,
    ).addTo(layer);
  }
}

/**
 * 駅名の注記。店の数が多い駅から、点・まとめの丸・ほかの駅名に重ならない側（右・左・上・下の順）に置く。
 * どちらにも置けない駅名は、そのズームでは出さない（拡大すると出る）。
 */
function drawStationLabels(
  L: typeof import("leaflet"),
  map: LeafletMapType,
  area: LatLngBounds,
  layer: LayerGroup | null,
  stations: StationLabel[],
  obstacles: Box[],
) {
  if (!layer) return;
  layer.clearLayers();
  const z = map.getZoom();
  const taken: Box[] = [...obstacles];
  const hit = (b: Box) => taken.some((t) => b.x0 < t.x1 && b.x1 > t.x0 && b.y0 < t.y1 && b.y1 > t.y0);
  const sorted = stations
    .filter((s) => area.contains([s.lat, s.lng]))
    .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, "ja"));
  let placed = 0;
  for (const s of sorted) {
    if (placed >= MAX_LABELS) break;
    const name = s.name.endsWith("駅") ? s.name.slice(0, -1) : s.name;
    const p = map.project([s.lat, s.lng], z);
    const nw = name.length * 13; // 文字の幅の見積もり（1 文字 13px）
    // 点（輪）は駅の位置。文字は右・左・上・下のうち、点・まとめの丸・ほかの駅名に重ならない最初の側に置く
    const cand: [string, Box][] = [
      ["r", { x0: p.x + 6, y0: p.y - 8, x1: p.x + 6 + nw, y1: p.y + 8 }],
      ["l", { x0: p.x - 6 - nw, y0: p.y - 8, x1: p.x - 6, y1: p.y + 8 }],
      ["t", { x0: p.x - nw / 2, y0: p.y - 22, x1: p.x + nw / 2, y1: p.y - 6 }],
      ["b", { x0: p.x - nw / 2, y0: p.y + 6, x1: p.x + nw / 2, y1: p.y + 22 }],
    ];
    const pick = cand.find(([, b]) => !hit(b));
    if (!pick) continue;
    const side = pick[0];
    taken.push({ x0: pick[1].x0 - 3, y0: pick[1].y0 - 2, x1: pick[1].x1 + 3, y1: pick[1].y1 + 2 });
    placed++;
    L.marker([s.lat, s.lng], {
      interactive: false,
      keyboard: false,
      zIndexOffset: -500,
      icon: L.divIcon({ className: "mp-stl-wrap", html: `<span class="mp-stl" data-s="${side}"><i></i>${esc(name)}</span>`, iconSize: [0, 0] }),
    }).addTo(layer);
  }
}
