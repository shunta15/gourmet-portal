import { ImageResponse } from "next/og";
import { REGIONS, type RegionKey } from "@/lib/data";

export const alt = "マチノワ 地域別ポータル";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const r = REGIONS[key as RegionKey];
  if (!r) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#14110d",
            color: "#f4efe3",
            fontSize: 48,
          }}
        >
          マチノワ
        </div>
      ),
      size
    );
  }
  const heroImage = r.heroImages[0] || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          fontFamily: "serif",
          color: "#fff",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(20,17,13,0.2) 0%, rgba(20,17,13,0.55) 50%, rgba(20,17,13,0.92) 100%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 16,
            font: "500 22px sans-serif",
            letterSpacing: "0.3em",
            opacity: 0.9,
            marginBottom: 18,
          }}
        >
          <div
            style={{ width: 48, height: 1, background: "#c7472a", display: "flex" }}
          />
          MACHINOWA / 地域別ポータル
        </div>
        <div
          style={{
            position: "relative",
            font: "600 110px serif",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            marginBottom: 16,
            display: "flex",
          }}
        >
          {r.name}
        </div>
        <div
          style={{
            position: "relative",
            font: "italic 500 36px serif",
            color: "#c7472a",
            display: "flex",
          }}
        >
          {r.tagline}
        </div>
      </div>
    ),
    size
  );
}
