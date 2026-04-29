import { ImageResponse } from "next/og";
import { RESTAURANTS } from "@/lib/data";

export const alt = "マチノワ 店舗紹介";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BASE = "https://gourmet-portal.vercel.app";

export default async function OG({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = RESTAURANTS.find((x) => x.id === id);
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
  const cuisine = r.cuisine.split(" / ").pop() || r.cuisine;
  const imageUrl = r.image.startsWith("http") ? r.image : `${BASE}${r.image}`;

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
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
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
        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(20,17,13,0.15) 0%, rgba(20,17,13,0.55) 50%, rgba(20,17,13,0.92) 100%)",
          }}
        />
        {/* Content */}
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
            <div style={{ display: "flex" }}>MACHINOWA / 街の輪</div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              marginBottom: 16,
              maxWidth: 1040,
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
            {r.area} / {cuisine}
          </div>
        </div>
      </div>
    ),
    size
  );
}
