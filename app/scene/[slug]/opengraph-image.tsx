import { ImageResponse } from "next/og";
import { getSceneBySlug } from "@/lib/scenes";

export const alt = "マチノワ シーン別ポータル";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getSceneBySlug(slug);
  if (!s) {
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

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 100,
          background:
            "linear-gradient(135deg, #faf8f3 0%, #f2ede2 50%, #e6ddc9 100%)",
          fontFamily: "serif",
          color: "#14110d",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 100,
            display: "flex",
            alignItems: "center",
            gap: 16,
            font: "500 22px sans-serif",
            letterSpacing: "0.3em",
            color: "#c7472a",
          }}
        >
          <div
            style={{ width: 48, height: 1, background: "#c7472a", display: "flex" }}
          />
          MACHINOWA / シーン
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          <div style={{ fontSize: 160, lineHeight: 1, display: "flex" }}>
            {s.emoji}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <div
              style={{
                font: "600 96px serif",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                marginBottom: 16,
                display: "flex",
              }}
            >
              {s.tagline}
            </div>
            <div
              style={{
                font: "italic 500 36px serif",
                color: "#c7472a",
                display: "flex",
              }}
            >
              {s.subtitle}
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 100,
            display: "flex",
            font: "500 28px serif",
            color: "#3a342b",
          }}
        >
          {s.title} ― マチノワ
        </div>
      </div>
    ),
    size
  );
}
