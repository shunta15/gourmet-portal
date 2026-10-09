import Link from "next/link";

// 暖簾の店ページ（/restaurant/<id>）で ID が無いとき。404 のまま、暖簾の枠（app/gourmet/layout.tsx）の中に出す。
// （これが無いと、ルートの not-found が枠なしで出る：/restaurant/** は総合サイト扱いのシェルなのでグルメの共通ヘッダーが付かない）
export const metadata = { title: "ページが見つかりません — マチノワ" };

export default function NotFound() {
  const link = { color: "var(--kinari)", borderBottom: "1px solid var(--line-2)", paddingBottom: 2 } as const;
  return (
    <section aria-labelledby="vS-nf-h" style={{ padding: "calc(var(--hd) + 96px) var(--gx) 120px", minHeight: "60vh" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <p style={{ font: "500 12px/1 var(--f-lat)", letterSpacing: ".3em", color: "var(--shu-hi)", marginBottom: 20 }}>404</p>
        <h1 id="vS-nf-h" style={{ font: "700 clamp(28px,5vw,52px)/1.3 var(--f-min)", marginBottom: 24 }}>
          この店のページは、見つかりませんでした。
        </h1>
        <p style={{ font: "400 16px/1.9 var(--f-min)", color: "var(--kinari-2)", marginBottom: 36 }}>
          お探しのページは削除されたか、URL が間違っている可能性があります。
        </p>
        <p style={{ display: "flex", gap: 24, flexWrap: "wrap", font: "500 15px/1.6 var(--f-sans)" }}>
          <Link href="/gourmet" style={link}>グルメのトップへ</Link>
          <Link href="/search" style={link}>店をさがす</Link>
          <Link href="/region" style={link}>エリアから探す</Link>
        </p>
      </div>
    </section>
  );
}
