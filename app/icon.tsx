import { ImageResponse } from "next/og";

// Next.js App Router の動的アイコン生成。
// /icon, /icon.png として配信され、metadata.icons に自動登録される。
// Vercel デフォルトの三角形に上書きされる。

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const runtime = "edge";

export default function Icon() {
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
          color: "#c7472a",
          fontSize: 44,
          fontWeight: 700,
          fontFamily: "serif",
          lineHeight: 1,
        }}
      >
        街
      </div>
    ),
    { ...size }
  );
}
