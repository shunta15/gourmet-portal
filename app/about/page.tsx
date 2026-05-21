import Footer from "@/components/Footer";

export const metadata = {
  title: "編集部について | マチノワ",
  description: "マチノワは、日本の街と店を語るオンライン誌。編集部について。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="feat-hero" style={{ minHeight: 360 }}>
        <div
          className="img"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1800&q=80)",
          }}
        />
        <div className="feat-hero-inner" style={{ justifyContent: "center" }}>
          <div>
            <div className="kicker">
              <span className="b"></span>
              <span>編集部</span>
            </div>
            <h1 style={{ marginTop: 24 }}>
              街と店を、<em>語る。</em>
            </h1>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 40px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ font: "400 16px/2 var(--body)", color: "var(--ink)" }}>
          <p style={{ marginBottom: 28 }}>
            「マチノワ／街の輪」は、日本の街と店を語るオンライン誌です。
            一軒の店を、街の文脈と一緒に紹介する。
            「ガイド」ではなく「読みもの」として、編集部の体温が伝わる紙面を目指しています。
          </p>
          <p style={{ marginBottom: 28 }}>
            扱うのは、地元の人がふだん使いする一軒から、観光で立ち寄りたい老舗、新しいカルチャーを背負う場まで。
            16 地域の街ごとのミニポータルと、利用シーン別のセレクトを軸に編成しています。
          </p>
          <p style={{ marginBottom: 28 }}>
            記事には事実情報のみを載せ、誇張・推測・虚偽は使いません。
            営業時間や料金など変動する情報は「訪問前に公式確認」と明記し、読者にも実態を一緒に追ってもらえる紙面に。
          </p>
          <p style={{ marginBottom: 28 }}>
            掲載基準・編集方針については
            <a
              href="/editorial/guidelines"
              style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 4, margin: "0 6px" }}
            >
              掲載基準
            </a>
            のページをご覧ください。お店からの掲載依頼・修正依頼は
            <a
              href="/contact"
              style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 4, margin: "0 6px" }}
            >
              お問い合わせ
            </a>
            から。
          </p>

          <div
            style={{
              marginTop: 60,
              padding: "32px 0",
              borderTop: "1px solid var(--line)",
              borderBottom: "1px solid var(--line)",
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: 24,
              font: "400 13px/1.8 var(--body)",
            }}
          >
            <div style={{ font: "500 11px/1 var(--mono)", letterSpacing: ".3em", color: "var(--ink-soft)" }}>
              発行
            </div>
            <div>マチノワ編集部</div>
            <div style={{ font: "500 11px/1 var(--mono)", letterSpacing: ".3em", color: "var(--ink-soft)" }}>
              拠点
            </div>
            <div>日本 全国</div>
            <div style={{ font: "500 11px/1 var(--mono)", letterSpacing: ".3em", color: "var(--ink-soft)" }}>
              連絡先
            </div>
            <div>linkateinc315@link8.info</div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
