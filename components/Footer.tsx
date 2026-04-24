export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <h5>NEWSLETTER</h5>
          <div className="big">
            毎週金曜、<em>日本の味</em>。
          </div>
          <p style={{ marginTop: 20, opacity: 0.6, fontSize: 13 }}>
            編集部厳選の一軒を、週に一度お届け。
          </p>
        </div>
        <div>
          <h5>NAVIGATION</h5>
          <ul>
            <li>トップ</li>
            <li>特集</li>
            <li>エリア</li>
            <li>予約</li>
          </ul>
        </div>
        <div>
          <h5>REGIONS</h5>
          <ul>
            <li>東京・下町</li>
            <li>京都</li>
            <li>大阪・ミナミ</li>
            <li>博多</li>
            <li>札幌</li>
          </ul>
        </div>
        <div>
          <h5>ABOUT</h5>
          <ul>
            <li>編集部</li>
            <li>掲載基準</li>
            <li>お問い合わせ</li>
            <li>店舗登録</li>
          </ul>
        </div>
      </div>
      <div className="footer-bot">
        <span>© 2026 AJIDOKORO NIPPON · ALL RIGHTS RESERVED</span>
        <span>日本 全国 — 2026.04</span>
      </div>
    </footer>
  );
}
