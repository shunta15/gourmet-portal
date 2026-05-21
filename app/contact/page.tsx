import Footer from "@/components/Footer";

export const metadata = {
  title: "お問い合わせ | マチノワ",
  description: "マチノワへのお問い合わせ・掲載依頼・修正依頼の窓口。",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="feat-hero" style={{ minHeight: 320 }}>
        <div
          className="img"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=1800&q=80)",
          }}
        />
        <div className="feat-hero-inner" style={{ justifyContent: "center" }}>
          <div>
            <div className="kicker">
              <span className="b"></span>
              <span>お問い合わせ</span>
            </div>
            <h1 style={{ marginTop: 24 }}>
              読者・店舗の、<em>窓口。</em>
            </h1>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 40px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ font: "400 15px/1.9 var(--body)", color: "var(--ink)" }}>
          <p style={{ marginBottom: 28 }}>
            読者・店舗オーナー様からのご連絡は、下記メールアドレスにてお受けしています。
          </p>

          <div
            style={{
              padding: "28px 32px",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              marginBottom: 40,
            }}
          >
            <div
              style={{
                font: "500 10px/1 var(--mono)",
                letterSpacing: ".3em",
                color: "var(--accent)",
                marginBottom: 12,
              }}
            >
              EMAIL
            </div>
            <a
              href="mailto:linkateinc315@link8.info"
              style={{
                font: "500 22px/1.4 var(--serif)",
                color: "var(--ink)",
                textDecoration: "none",
                letterSpacing: "-.01em",
              }}
            >
              linkateinc315@link8.info
            </a>
          </div>

          <h2 style={{ font: "500 22px/1.4 var(--serif)", marginBottom: 16, marginTop: 40 }}>
            よくあるお問い合わせ
          </h2>
          <ul style={{ listStyle: "none", padding: 0, font: "400 14px/1.9 var(--body)" }}>
            <li style={{ marginBottom: 16, paddingLeft: 18, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "var(--accent)" }}>—</span>
              新規掲載のご相談（店舗オーナー様）
            </li>
            <li style={{ marginBottom: 16, paddingLeft: 18, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "var(--accent)" }}>—</span>
              掲載内容の修正・更新依頼（営業時間・休業情報など）
            </li>
            <li style={{ marginBottom: 16, paddingLeft: 18, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "var(--accent)" }}>—</span>
              編集部へのフィードバック・記事提案
            </li>
            <li style={{ marginBottom: 16, paddingLeft: 18, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "var(--accent)" }}>—</span>
              取材依頼・タイアップに関するご相談
            </li>
          </ul>

          <p style={{ marginTop: 40, font: "400 13px/1.8 var(--body)", color: "var(--ink-soft)" }}>
            返信には通常 2〜5 営業日いただいています。お急ぎの場合はメール本文に「お急ぎ」と明記ください。
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
