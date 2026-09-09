"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  href?: string;
  sub?: string;
}

interface LeafletMapProps {
  points: MapPoint[];
  zoom?: number;
  height?: number;
  interactive?: boolean;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeHref(href: string | undefined): string | null {
  if (!href) return null;
  if (href.startsWith("/") || href.startsWith("https://")) return href;
  return null;
}

export default function LeafletMap({
  points,
  zoom = 16,
  height = 320,
  interactive = true,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const startedRef = useRef(false);
  const pointsRef = useRef(points);
  pointsRef.current = points;
  const [ready, setReady] = useState(false);

  const pointsKey = useMemo(
    () =>
      JSON.stringify(
        points.map((p) => [p.id, p.lat, p.lng, p.href ?? "", p.sub ?? "", p.name])
      ),
    [points]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !startedRef.current &&
          !mapRef.current
        ) {
          observer.disconnect();
          startedRef.current = true;

          (async () => {
            try {
              const L = await import("leaflet");

              if (cancelled || !containerRef.current) return;

              // leaflet.css is loaded globally via app/globals.css
              // (@import "leaflet/dist/leaflet.css") — no dynamic CSS import needed here.

              const map = L.map(containerRef.current, {
                zoomControl: true,
                scrollWheelZoom: interactive,
                dragging: interactive,
                touchZoom: interactive,
              });

              L.tileLayer(
                "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
                {
                  attribution:
                    '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>',
                  maxZoom: 18,
                }
              ).addTo(map);

              const markerHtml = `<div class="mw-pin"></div>`;
              const icon = L.divIcon({
                html: markerHtml,
                iconSize: [32, 32],
                className: "mw-marker",
                popupAnchor: [0, -16],
              });

              const currentPoints = pointsRef.current;
              const bounds = L.latLngBounds([]);
              currentPoints.forEach((point) => {
                const marker = L.marker([point.lat, point.lng], {
                  icon,
                }).addTo(map);
                bounds.extend([point.lat, point.lng]);

                if (point.href || point.sub) {
                  const safeName = escapeHtml(point.name);
                  const safeSub = point.sub ? escapeHtml(point.sub) : "";
                  const href = safeHref(point.href);
                  const popupContent = `
                    <div class="mw-popup">
                      <div class="mw-popup-name">${safeName}</div>
                      ${safeSub ? `<div class="mw-popup-sub">${safeSub}</div>` : ""}
                      ${
                        href
                          ? `<a href="${href}" class="mw-popup-link">詳細を見る →</a>`
                          : ""
                      }
                    </div>
                  `;
                  marker.bindPopup(popupContent);
                }
              });

              if (currentPoints.length === 1) {
                map.setView([currentPoints[0].lat, currentPoints[0].lng], zoom);
              } else if (currentPoints.length > 1) {
                map.fitBounds(bounds, { padding: [50, 50] });
              }

              map.invalidateSize();
              requestAnimationFrame(() => {
                if (!cancelled) map.invalidateSize();
              });

              if (typeof ResizeObserver !== "undefined" && containerRef.current) {
                resizeObserver = new ResizeObserver(() => {
                  map.invalidateSize();
                });
                resizeObserver.observe(containerRef.current);
              }

              mapRef.current = map;
              if (!cancelled) setReady(true);
            } catch (e) {
              console.error("[LeafletMap]", e);
            }
          })();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      startedRef.current = false;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey, zoom, interactive]);

  return (
    <div
      className="mw-map"
      ref={containerRef}
      style={{
        height: `${height}px`,
        position: "relative",
        borderRadius: "4px",
        overflow: "hidden",
        border: "1px solid var(--line)",
      }}
    >
      {!ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--bg-2)",
            display: "grid",
            placeItems: "center",
            fontSize: "14px",
            color: "var(--ink-soft)",
            zIndex: 1,
          }}
        >
          地図を読み込み中…
        </div>
      )}
    </div>
  );
}
