import Footer from "@/components/Footer";

export const metadata = {
  title: "掲載基準 | マチノワ",
  description: "マチノワが店を掲載するときの基準・事実情報の扱い・禁止表現について。",
  alternates: { canonical: "/editorial/guidelines" },
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "掲載できる店",
    body: [
      "営業中の実在する飲食店であること。",
      "店主・運営の確認が取れる、または公式情報源（公式サイト・公式 SNS・食べログ・Google Maps 等）から事実が確認できること。",
      "編集部が「読者に紹介したい」と判断できる、店舗としての固有性・物語性があること。",
    ],
  },
  {
    title: "事実情報の扱い",
    body: [
      "営業時間・定休日・料金など変動しやすい情報は、訪問前に必ず公式情報を確認するよう明記します。",
      "★★★ などの評価値は出典を明記、または非掲載とします。",
      "食べログ等の文章の直接コピペは ToS 違反のため、編集部独自の文章で書き直します。",
      "画像は出典と権利関係を必ず把握し、無断使用は行いません。",
    ],
  },
  {
    title: "禁止する表現",
    body: [
      "「日本一」「最強」「絶対」など、根拠なき断定表現は使用しません。",
      "俗称・ネットスラング（侮蔑表現を含むもの）は使用しません。",
      "客引き・呼び込みへの追従を促す表現は使用しません。",
      "断定的な料金・営業時間（変動が予想されるもの）は使用しません。",
    ],
  },
  {
    title: "閉店・移転への対応",
    body: [
      "閉店確認後は、URL を残しつつ「閉店」と明記、または記事を取り下げます。",
      "移転の場合は移転先情報を併記し、新店舗の情報を確認してから本文を書き直します。",
      "Google Maps の「permanently closed」を毎日自動スキャンし、検出時は編集部が手動確認します。",
    ],
  },
  {
    title: "掲載の依頼・修正の依頼",
    body: [
      "店舗オーナー様からの掲載依頼・修正依頼は、お問い合わせフォームより受け付けています。",
      "依頼内容は編集部で確認のうえ、品質基準を満たすと判断したものを掲載／更新します。",
      "商業的な広告掲載は現在受け付けていません。",
    ],
  },
];

export default function GuidelinesPage() {
  return (
    <>
      <section className="feat-hero" style={{ minHeight: 320 }}>
        <div
          className="img"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1800&q=80)",
          }}
        />
        <div className="feat-hero-inner" style={{ justifyContent: "center" }}>
          <div>
            <div className="kicker">
              <span className="b"></span>
              <span>掲載基準</span>
            </div>
            <h1 style={{ marginTop: 24 }}>
              編集の、<em>約束事。</em>
            </h1>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 40px", maxWidth: 800, margin: "0 auto" }}>
        {SECTIONS.map((s, i) => (
          <div key={i} style={{ marginBottom: 56 }}>
            <h2
              style={{
                font: "500 22px/1.4 var(--serif)",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid var(--line)",
              }}
            >
              {s.title}
            </h2>
            <ul style={{ listStyle: "none", padding: 0, font: "400 14px/1.9 var(--body)" }}>
              {s.body.map((b, j) => (
                <li key={j} style={{ marginBottom: 16, paddingLeft: 18, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--accent)" }}>—</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p style={{ marginTop: 40, font: "400 13px/1.8 var(--body)", color: "var(--ink-soft)" }}>
          編集方針は読者・店舗からのフィードバックを受けて随時更新します。 最終更新: 2026 年 5 月
        </p>
      </section>

      <Footer />
    </>
  );
}
