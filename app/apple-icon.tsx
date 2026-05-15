import { ImageResponse } from "next/og";

// iOS のホーム画面追加用アイコン。180x180 が推奨。

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const runtime = "edge";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#14110d",
          color: "#c7472a",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          街
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#f4efe3",
            letterSpacing: 4,
            marginTop: 8,
            fontWeight: 500,
          }}
        >
          マチノワ
        </div>
      </div>
    ),
    { ...size }
  );
}
