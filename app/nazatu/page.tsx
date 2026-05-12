import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ナーザトゥ | 動画",
  robots: { index: false, follow: false },
};

const videos = [
  { src: "/videos/nazatu/1-1.mp4", label: "ナーザトゥ #1" },
  { src: "/videos/nazatu/1-2.mp4", label: "ナーザトゥ #2" },
  { src: "/videos/nazatu/3-2.mp4", label: "ナーザトゥ #3" },
  { src: "/videos/nazatu/review.mp4", label: "さーらー感想" },
  { src: "/videos/nazatu/photo.mp4", label: "写真撮る" },
];

export default function NazatuPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem 1rem",
        gap: "2rem",
      }}
    >
      <h1
        style={{
          color: "#fff",
          fontSize: "1.25rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
        }}
      >
        ナーザトゥ
      </h1>

      {videos.map((v) => (
        <div
          key={v.src}
          style={{
            width: "100%",
            maxWidth: "360px",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <video
            src={v.src}
            controls
            playsInline
            style={{
              width: "100%",
              borderRadius: "12px",
              background: "#111",
            }}
          />
          <p
            style={{
              color: "#aaa",
              fontSize: "0.8rem",
              textAlign: "center",
            }}
          >
            {v.label}
          </p>
        </div>
      ))}
    </main>
  );
}
