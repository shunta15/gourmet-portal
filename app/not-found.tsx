import Link from "next/link";

export const metadata = {
  title: "ページが見つかりません — マチノワ",
};

export default function NotFound() {
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
          ページが見つかりません。
        </h1>
        <p
          style={{
            font: "400 16px/1.8 var(--serif)",
            color: "var(--ink-soft)",
            marginBottom: 40,
          }}
        >
          申し訳ございません。お探しのページは削除されたか、
          URLが間違っている可能性があります。
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
          <Link
            href="/"
            style={{
              padding: "12px 24px",
              background: "var(--accent)",
              color: "var(--bg-1)",
              textDecoration: "none",
              display: "inline-block",
              font: "500 14px/1 var(--sans)",
            }}
          >
            ホームへ
          </Link>
          <Link
            href="/region"
            style={{
              padding: "12px 24px",
              border: "1px solid var(--line)",
              color: "var(--accent)",
              textDecoration: "none",
              display: "inline-block",
              font: "500 14px/1 var(--sans)",
            }}
          >
            地域から探す
          </Link>
          <Link
            href="/scene"
            style={{
              padding: "12px 24px",
              border: "1px solid var(--line)",
              color: "var(--accent)",
              textDecoration: "none",
              display: "inline-block",
              font: "500 14px/1 var(--sans)",
            }}
          >
            シーンから探す
          </Link>
          <Link
            href="/feature"
            style={{
              padding: "12px 24px",
              border: "1px solid var(--line)",
              color: "var(--accent)",
              textDecoration: "none",
              display: "inline-block",
              font: "500 14px/1 var(--sans)",
            }}
          >
            特集から探す
          </Link>
          <Link
            href="/search"
            style={{
              padding: "12px 24px",
              border: "1px solid var(--line)",
              color: "var(--accent)",
              textDecoration: "none",
              display: "inline-block",
              font: "500 14px/1 var(--sans)",
            }}
          >
            検索する
          </Link>
        </div>
      </div>
    </div>
  );
}
