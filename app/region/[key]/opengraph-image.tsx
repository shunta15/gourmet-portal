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
          position: "relative",
          background: "#14110d",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(20,17,13,0.2) 0%, rgba(20,17,13,0.55) 50%, rgba(20,17,13,0.92) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: 1200,
            height: 630,
            padding: 80,
            color: "#fff",
            fontFamily: "serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontFamily: "sans-serif",
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: 4,
              opacity: 0.92,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 48,
                height: 1,
                background: "#c7472a",
                display: "flex",
              }}
            />
            <div style={{ display: "flex" }}>MACHINOWA / 地域別ポータル</div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 120,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -2,
              marginBottom: 16,
            }}
          >
            {r.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              fontWeight: 500,
              fontStyle: "italic",
              color: "#f0a085",
            }}
          >
            {r.tagline}
          </div>
        </div>
      </div>
    ),
    size
  );
}
