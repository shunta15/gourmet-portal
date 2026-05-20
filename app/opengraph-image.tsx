import { ImageResponse } from "next/og";

export const alt = "マチノワ – 日本の街と店を語るオンライン誌";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#14110d",
          color: "#f4efe3",
          fontFamily: "serif",
          padding: 80,
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
            marginBottom: 30,
          }}
        >
          <div style={{ width: 48, height: 1, background: "#c7472a", display: "flex" }} />
          <div style={{ display: "flex" }}>MACHINOWA</div>
          <div style={{ width: 48, height: 1, background: "#c7472a", display: "flex" }} />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 124,
            fontWeight: 600,
            letterSpacing: -2,
            lineHeight: 1,
            marginBottom: 20,
          }}
        >
          マチノワ
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            fontWeight: 500,
            fontStyle: "italic",
            color: "#f0a085",
            textAlign: "center",
          }}
        >
          日本の街と店を語る、オンライン誌
        </div>
      </div>
    ),
    size
  );
}
