"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: "120px 40px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div
          style={{
            font: "500 11px/1 var(--mono)",
            letterSpacing: ".3em",
            color: "var(--accent)",
            marginBottom: 16,
          }}
        >
          ◎ エラー
        </div>
        <h1
          style={{
            font: "600 clamp(40px,6vw,80px)/0.95 var(--serif)",
            letterSpacing: "-.02em",
            marginBottom: 30,
          }}
        >
          読み込みに失敗しました。
        </h1>
        <p
          style={{
            font: "400 16px/1.8 var(--serif)",
            color: "var(--ink-soft)",
            marginBottom: 40,
          }}
        >
          申し訳ございません。ページの読み込み中に予期しないエラーが発生しました。
          もう一度お試しいただくか、別のページからアクセスしてください。
        </p>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            borderTop: "1px solid var(--line)",
            paddingTop: 40,
          }}
        >
          <button
            onClick={() => reset()}
            style={{
              padding: "12px 24px",
              background: "var(--accent)",
              color: "var(--bg-1)",
              border: "none",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-block",
              font: "500 14px/1 var(--sans)",
            }}
          >
            もう一度試す
          </button>
          <a
            href="/"
            style={{
              padding: "12px 24px",
              border: "1px solid var(--line)",
              color: "var(--accent)",
              textDecoration: "none",
              display: "inline-block",
              font: "500 14px/1 var(--sans)",
            }}
          >
            ホームへ
          </a>
        </div>
      </div>
    </div>
  );
}
