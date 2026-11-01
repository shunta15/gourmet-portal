import Link from "next/link";
import "./feature.css";

/**
 * 暖簾 3「店の特集記事」(見本 4_店の特集記事.png の 1:1 再現)。
 * 仮の店名・文章は見本のまま。寸法の根拠と測った数字は feature.css の冒頭コメントと README 参照。
 * 座標は見本の画素(--u)。ヘッダー(55u)は Shell が持つので、この中の y = 見本の y − 55。
 */

const IMG = "/_portal/gnoren3/feature";

function SearchPin({ d }: { d: "pin" | "target" | "clock" | "cal" | "tel" }) {
  switch (d) {
    case "pin":
      return (
        <svg viewBox="0 0 12 14" aria-hidden="true"><path d="M6 0C3.2 0 1 2.2 1 4.9 1 8.4 6 14 6 14s5-5.6 5-9.1C11 2.2 8.8 0 6 0Zm0 6.9a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2Z" fill="currentColor" /></svg>
      );
    case "target":
      return (
        <svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.9" fill="none" stroke="currentColor" strokeWidth="2.2" /><circle cx="6" cy="6" r="1.9" fill="currentColor" /></svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.9" fill="none" stroke="currentColor" strokeWidth="1.9" /><path d="M6 3V6.2l2.2 1.3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
      );
    case "cal":
      return (
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1.6 2.2h8.8a.8.8 0 0 1 .8.8v7.4a.8.8 0 0 1-.8.8H1.6a.8.8 0 0 1-.8-.8V3a.8.8 0 0 1 .8-.8Z" fill="currentColor" /><path d="M3.4 0.4v2.4M8.6 0.4v2.4" stroke="currentColor" strokeWidth="1.3" /><path d="M2.6 5.2h1.4v1.3H2.6zM5.3 5.2h1.4v1.3H5.3zM8 5.2h1.4v1.3H8zM2.6 7.6h1.4v1.3H2.6zM5.3 7.6h1.4v1.3H5.3zM8 7.6h1.4v1.3H8z" fill="#efebe1" /></svg>
      );
    case "tel":
      return (
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.6.5 4.3.3l1.2 2.9-1.2 1c.5 1.3 1.6 2.5 3 3.1l1.1-1.2 2.8 1.2-.2 1.7c-.1.8-.8 1.3-1.5 1.3C4.9 10.4 1.7 7.2.9 3.4.8 2.5 1.4 1.6 2.6.5Z" fill="currentColor" /></svg>
      );
  }
}

export default function FeatureArticle() {
  return (
    <main className="gn3-feature">
      {/* ───────── ヒーロー(見本 y55〜339) ───────── */}
      <section className="gn3-feature-hero" aria-labelledby="gn3-feature-h1">
        <div className="gn3-feature-hero-in">
          <div className="gn3-feature-hero-photo">
            <img src={`${IMG}/hero.webp`} alt="炭火の前で串を返す職人" width={2172} height={568} />
          </div>
          <div className="gn3-feature-card">
            <p className="gn3-feature-kicker">
              <span className="gn3-feature-kicker-a">特集</span>
              <span className="gn3-feature-kicker-b">この街の、うまいをつくる人たち　#01</span>
            </p>
            <h1 id="gn3-feature-h1" className="gn3-feature-h1">焼き鳥で、<br />人と街をつなぐ。</h1>
            <p className="gn3-feature-lead">炭火の向こうに見えるのは、<br />いつもの日常を少し特別にする、<br />あたたかな居場所。</p>
          </div>
        </div>
      </section>

      {/* ───────── 一串一串に(見本 y337〜583) ───────── */}
      <section className="gn3-feature-a">
        <div className="gn3-feature-in">
          <h2 className="gn3-feature-a-h2">一串一串に、<br />この街への想いを込めて</h2>
          <p className="gn3-feature-a-body">駅から少し歩いた路地裏に、やわらかな提灯の灯りがともる<br />「鳥や まる井」。<br />扉をくぐると、香ばしい炭の香りと、笑い声がつつみこむ。<br />店主・丸井さんが焼くのは、ただの焼き鳥ではない。<br />この街で暮らす人々の、日常に寄り添う一串だ。</p>
          <figure className="gn3-feature-a-photo">
            <img src={`${IMG}/a-photo.webp`} alt="提灯の灯る店の入り口と暖簾" width={820} height={382} />
          </figure>
          <figure className="gn3-feature-quote">
            <span className="gn3-feature-qmark gn3-feature-qmark-o" aria-hidden="true">“</span>
            <blockquote className="gn3-feature-quote-text">焼き鳥は、<br />人と人をつなぐ<br />きっかけになれる。</blockquote>
            <span className="gn3-feature-qmark gn3-feature-qmark-c" aria-hidden="true">”</span>
            <figcaption className="gn3-feature-quote-who">店主　丸井 健太さん</figcaption>
          </figure>
        </div>
      </section>

      {/* ───────── 店主の想い(見本 y583〜862) ───────── */}
      <section className="gn3-feature-b">
        <div className="gn3-feature-in">
          <figure className="gn3-feature-b-portrait">
            <img src={`${IMG}/b-portrait.webp`} alt="笑顔の店主・丸井さん" width={660} height={560} />
          </figure>
          <figure className="gn3-feature-b-grill">
            <img src={`${IMG}/b-grill.webp`} alt="炭火で焼かれる串" width={792} height={560} />
            <p className="gn3-feature-sumi" aria-hidden="false">
              <span className="gn3-feature-sumi-1">炭の音が、</span>
              <span className="gn3-feature-sumi-2">人の心をほどく。</span>
            </p>
          </figure>
          <div className="gn3-feature-b-panel">
            <p className="gn3-feature-label">店主の想い</p>
            <h2 className="gn3-feature-b-h2">この街で、<br />ずっと焼き続けたい</h2>
            <p className="gn3-feature-b-body">もともとは都内の有名店で修業していた丸井さん。<br />地元に戻り、この街の人たちが気軽に集える場所をつくりたい<br />という想いから、8年前に「鳥や まる井」を開いた。<br />「仕事帰りにふらっと寄って、うまい焼き鳥とお酒で<br />明日もがんばろうと思ってもらえる。そんな店でありたいですね」<br />そう語る丸井さんの目は、今日もやさしく、まっすぐだ。</p>
          </div>
        </div>
      </section>

      {/* ───────── こだわり(見本 y862〜1138) ───────── */}
      <section className="gn3-feature-c">
        <div className="gn3-feature-in">
          <div className="gn3-feature-c-text">
            <p className="gn3-feature-label">こだわり</p>
            <h2 className="gn3-feature-c-h2">素材の力を、<br />まっすぐに引き出す</h2>
            <p className="gn3-feature-c-body">全国から取り寄せる朝びきの地鶏を、<br />部位ごとに最適な焼き加減で。<br />シンプルだからこそ、ごまかしのきかない焼き鳥は、<br />素材・串打ち・火入れ、すべてに丁寧な仕事が宿る。<br />ひと口食べれば、違いがわかる。<br />それが「まる井」の焼き鳥だ。</p>
          </div>
          <figure className="gn3-feature-c-main">
            <img src={`${IMG}/c-main.webp`} alt="大山どりのねぎま" width={782} height={500} />
            <figcaption className="gn3-feature-tag gn3-feature-tag-1"><b>大山どり ねぎま</b><span>旨みあふれる、看板の一串</span></figcaption>
          </figure>
          <figure className="gn3-feature-c-sub1">
            <img src={`${IMG}/c-sub1.webp`} alt="ちょうちん" width={590} height={244} />
            <figcaption className="gn3-feature-tag gn3-feature-tag-2"><b>ちょうちん</b><span>濃厚な、贅沢な味わい</span></figcaption>
          </figure>
          <figure className="gn3-feature-c-sub2">
            <img src={`${IMG}/c-sub2.webp`} alt="白レバー" width={590} height={244} />
            <figcaption className="gn3-feature-tag gn3-feature-tag-3"><b>白レバー</b><span>とろける、至福の食感</span></figcaption>
          </figure>
        </div>
      </section>

      {/* ───────── 店の空気(見本 y1138〜1325) ───────── */}
      <section className="gn3-feature-d">
        <div className="gn3-feature-in">
          <figure className="gn3-feature-d-counter">
            <img src={`${IMG}/d-counter.webp`} alt="カウンター越しの店内" width={1416} height={374} />
          </figure>
          <div className="gn3-feature-d-text">
            <p className="gn3-feature-label">店の空気</p>
            <h2 className="gn3-feature-d-h2">うまい酒と、<br />いい時間が流れる場所</h2>
            <p className="gn3-feature-d-body">カウンター越しに交わす何気ない会話、<br />仲間とのにぎやかな時間、一人で味わう静かな夜。<br />「鳥や まる井」には、さまざまな人の時間が流れている。<br />木の温もりを感じる落ち着いた空間で、<br />焼き鳥とともに、心地よいひとときを。</p>
          </div>
          <figure className="gn3-feature-d-vase">
            <img src={`${IMG}/d-vase.webp`} alt="カウンターに置かれた徳利と盃" width={254} height={374} />
          </figure>
          <figure className="gn3-feature-d-sign">
            <img src={`${IMG}/d-sign.webp`} alt="木の看板と行灯" width={486} height={374} />
          </figure>
        </div>
      </section>

      {/* ───────── 店舗情報(見本 y1325〜1448) ───────── */}
      <section className="gn3-feature-i" aria-label="店舗情報">
        <div className="gn3-feature-in">
          <figure className="gn3-feature-i-photo">
            <img src={`${IMG}/info-photo.webp`} alt="提灯と暖簾の店構え" width={542} height={218} />
          </figure>
          <div className="gn3-feature-i-main">
            <p className="gn3-feature-i-label">店舗情報</p>
            <p className="gn3-feature-i-name">鳥や まる井</p>
            <p className="gn3-feature-i-tag">この街の、いつもの一串を。</p>
            <p className="gn3-feature-i-desc">焼き鳥を通して、人と人、街と人がつながる場所でありたい。<br />今日もみなさまの「おかえり」をお待ちしています。</p>
          </div>
          <dl className="gn3-feature-i-table">
            <div><dt><SearchPin d="pin" /><span>住所</span></dt><dd>東京都世田谷区松原3-12-8</dd></div>
            <div><dt><SearchPin d="target" /><span>アクセス</span></dt><dd>京王線 下高井戸駅 徒歩3分</dd></div>
            <div><dt><SearchPin d="clock" /><span>営業時間</span></dt><dd>17:00 - 23:30 (L.O. 23:00)</dd></div>
            <div><dt><SearchPin d="cal" /><span>定休日</span></dt><dd>月曜日</dd></div>
            <div><dt><SearchPin d="tel" /><span>電話</span></dt><dd>03-1234-5678</dd></div>
          </dl>
          <figure className="gn3-feature-i-map">
            <img src={`${IMG}/info-map.webp`} alt="店の周辺の地図" width={284} height={142} />
          </figure>
          <Link className="gn3-feature-i-btn" href="/proto-gourmet/n3/shop/sample">
            <span>店舗詳細を見る</span>
            <svg viewBox="0 0 18 10" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
