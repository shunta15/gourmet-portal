"use client";

import { useEffect, useRef, useState } from "react";

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

export default function LeafletMap({
  points,
  zoom = 16,
  height = 320,
  interactive = true,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !isLoaded && !mapRef.current) {
          setIsLoaded(true);

          // Lazy load Leaflet
          const L = await import("leaflet");
          await import("leaflet/dist/leaflet.css");

          if (!containerRef.current) return;

          // Create map
          const map = L.map(containerRef.current, {
            zoomControl: true,
            scrollWheelZoom: interactive,
            dragging: interactive,
            touchZoom: interactive,
          });

          // Add GSI tiles (Government of Japan)
          L.tileLayer(
            "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
            {
              attribution:
                '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>',
              maxZoom: 18,
            }
          ).addTo(map);

          // Create custom marker icon with CSS
          const markerHtml = `<div class="mw-pin"></div>`;
          const icon = L.divIcon({
            html: markerHtml,
            iconSize: [32, 32],
            className: "mw-marker",
            popupAnchor: [0, -16],
          });

          // Add markers
          const bounds = L.latLngBounds([]);
          points.forEach((point) => {
            const marker = L.marker([point.lat, point.lng], { icon }).addTo(
              map
            );
            bounds.extend([point.lat, point.lng]);

            if (point.href || point.sub) {
              const popupContent = `
                <div class="mw-popup">
                  <div class="mw-popup-name">${point.name}</div>
                  ${point.sub ? `<div class="mw-popup-sub">${point.sub}</div>` : ""}
                  ${
                    point.href
                      ? `<a href="${point.href}" class="mw-popup-link">詳細を見る →</a>`
                      : ""
                  }
                </div>
              `;
              marker.bindPopup(popupContent);
            }
          });

          // Set view
          if (points.length === 1) {
            map.setView([points[0].lat, points[0].lng], zoom);
          } else if (points.length > 1) {
            map.fitBounds(bounds, { padding: [50, 50] });
          }

          mapRef.current = map;
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [points, zoom, interactive, isLoaded]);

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
      {!isLoaded && (
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
