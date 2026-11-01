/**
 * マチノワ.Body Care のロゴ(コードで描いたもの。2026-11-02 に 214×46 の画像から作り直し)。
 * 緑の矢印は SVG のパス、文字は <text>(ページに読み込み済みの Noto Sans JP / Shippori Mincho)。
 * textLength で幅を固定しているので、フォントの読み込み前後で文字が動かない。大きさは CSS の width だけで決まる(縦横比は viewBox)。
 */
/** gradId: 緑のグラデーションの id。ヘッダーとフッターで同じ id が 2 つ並ばないよう、呼ぶ側が別々の名前を渡す */
export default function Logo({ title, gradId }: { title: string; gradId: string }) {
  return (
    <svg viewBox="0 0 214 46" width={214} height={46} role="img" aria-label={title} className="gr-logo-svg">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#93c443" />
          <stop offset="1" stopColor="#74a437" />
        </linearGradient>
      </defs>
      <g fill={`url(#${gradId})`} aria-hidden="true">
        <path d="M18 5 L22.2 8.2 C18.5 10 12.5 13.4 9.8 17 C7.6 20 6.9 24 6.5 28.5 C4.2 25 3 22.5 3 20 C3 16 6.5 13 10 10.8 Z" />
        <path d="M13.2 18 C14.3 18 15 19.5 15.6 21.6 C19 18 23 15 27.7 13.1 L33.2 21 C28 22.6 20.5 25 16.2 29.6 C16 30.4 16.2 31 16.5 31.5 L27.4 31.4 C24 35 20.5 37.5 17.5 39.5 C13.8 37.5 10.5 34 9.4 29.5 C8.7 26 9 22 11 19 C11.7 18.3 12.4 18 13.2 18 Z" />
      </g>
      <g aria-hidden="true">
        <text x="41" y="25" fontSize="18.5" fontWeight="700" fill="#1c1c1c" stroke="#1c1c1c" strokeWidth="0.7" strokeLinejoin="round" textLength="69" lengthAdjust="spacingAndGlyphs" style={{ fontFamily: "var(--gr-ff-jp)" }}>
          マチノワ
        </text>
        <text x="110.5" y="24.5" fontSize="18" fontWeight="700" fill="#1c1c1c" style={{ fontFamily: "var(--gr-ff-jp)" }}>
          .
        </text>
        <text x="117" y="24" fontSize="17.5" fontWeight="500" fill="#262626" textLength="90" lengthAdjust="spacingAndGlyphs" style={{ fontFamily: "var(--gr-ff-min)" }}>
          Body Care
        </text>
        <text x="41" y="39.5" fontSize="8.4" fontWeight="400" fill="#666" textLength="150" lengthAdjust="spacing" style={{ fontFamily: "var(--gr-ff-jp)" }}>
          からだが整うと、毎日が変わる。
        </text>
      </g>
    </svg>
  );
}
