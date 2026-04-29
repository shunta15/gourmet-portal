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
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          fontFamily: "serif",
          color: "#fff",
          position: "relative",
        }}
      >
        {/* dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(20,17,13,0.15) 0%, rgba(20,17,13,0.55) 55%, rgba(20,17,13,0.92) 100%)",
            display: "flex",
          }}
        />
        {/* Brand */}
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
          MACHINOWA / 街の輪
        </div>
        {/* Restaurant name */}
        <div
          style={{
            position: "relative",
            font: "600 96px serif",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            marginBottom: 16,
            display: "flex",
            maxWidth: 1040,
          }}
        >
          {r.name}
        </div>
        {/* Cuisine + area */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 16,
            font: "500 36px serif",
            color: "#c7472a",
            fontStyle: "italic",
          }}
        >
          {r.area} / {cuisine}
        </div>
      </div>
    ),
    size
  );
}
