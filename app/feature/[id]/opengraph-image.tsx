import { ImageResponse } from "next/og";
import { getFeatureArticleById } from "@/lib/db/features";

export const alt = "マチノワ 特集記事";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = await getFeatureArticleById(id);
  const a2 = a as any;
  const heroImage = a2?.ogImage || a?.heroImage || "";
  const absoluteHero = heroImage.startsWith("http")
    ? heroImage
    : `https://machinowa.tokyo${heroImage}`;

  if (!a) {
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
          position: "relative",
          background: "#14110d",
        }}
      >
        {heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={absoluteHero}
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
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(20,17,13,0.3) 0%, rgba(20,17,13,0.65) 50%, rgba(20,17,13,0.94) 100%)",
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
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: 4,
              opacity: 0.92,
              marginBottom: 18,
            }}
          >
            <div style={{ width: 40, height: 1, background: "#c7472a", display: "flex" }} />
            <div style={{ display: "flex" }}>
              MACHINOWA / 特集 {a.no || ""}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: -1,
              maxWidth: 1040,
            }}
          >
            {a.title.length > 50 ? a.title.slice(0, 48) + "…" : a.title}
          </div>
        </div>
      </div>
    ),
    size
  );
}
