import Counter from "./Counter";
import Slider from "./Slider";
import Bubble from "./Bubble";
import "./lower.css";

const B = "/_portal/hproto/machi/lower/";
/** 見本の座標(1122 基準・節の上端 y=470 が原点)を位置に変える */
const P = (x: number, y: number, w?: number, h?: number) =>
  ({ "--x": x, "--y": y, ...(w !== undefined ? { "--w": w } : {}), ...(h !== undefined ? { "--h": h } : {}) }) as React.CSSProperties;

const CATS = [
  { k: "gourmet", name: "グルメ", sub: "美味しいお店", href: "/gourmet", x: 31 },
  { k: "beauty", name: "ビューティー", sub: "キレイをつくる", href: "/beauty", x: 151.5 },
  { k: "bodycare", name: "ボディケア", sub: "からだを整える", href: "/bodycare", x: 272.5 },
  { k: "pet", name: "ペット", sub: "ペットと楽しむ", href: "/pet", x: 392.5 },
  { k: "leisure", name: "おでかけ", sub: "遊ぶ・体験する", href: "/leisure", x: 512.5 },
  { k: "stay", name: "ステイ", sub: "泊まる・くつろぐ", href: "/stay", x: 632.5 },
];
const NEWS = [
  { img: "news1.webp", date: "2025.04.10", title: ["春のマルシェイベント開催！", "@駅前広場"] },
  { img: "news2.webp", date: "2025.04.08", title: ["新しいカフェがオープンしました"] },
  { img: "news3.webp", date: "2025.04.05", title: ["週末限定！まち歩きツアーの", "参加者募集中"] },
];
const ROWS = [
  { k: "pet", x: 31, w: 270, t: "ペットと楽しめるお店", d: ["一緒に入れるカフェ・お散歩スポット・", "ペットサービスをご紹介"], href: "/pet", b: { img: "b-pet.webp", w: 120, h: 66, x: 144, y: 9, lines: ["ペットと一緒に", "おでかけしよう！"], f: 11.5 } },
  { k: "story", x: 315, w: 259, t: "まちのストーリー", d: ["お店の人、地域でがんばる人、", "まちの魅力を届ける読みもの"], href: "/feature", b: { img: "b-story.webp", w: 162, h: 58, x: 99, y: 5, lines: ["まちの", "ステキな人に出会える"], f: 11.5 } },
  { k: "area", x: 587, w: 267, t: "エリアから探す", d: ["エリアごとのお店・観光スポット・", "特集記事をまとめてチェック"], href: "/search", b: { img: "b-area.webp", w: 130, h: 58, x: 132, y: 16, lines: ["ちょっと足をのばして", "新しいまちに出会う"], f: 11.5 } },
];

export default function Lower() {
  return (
    <section className="hm-lower" style={{ height: "calc(932 * var(--u))" }}>
      {/* 1. 業種アイコン列+統計 */}
      <div className="hm-l-cats">
        {CATS.map((c, i) => (
          <a key={c.k} href={c.href} className="hm-l-a hm-l-cat hm-press" style={{ ...P(c.x, 0, 112.5, 119), animationDelay: `${i * 70}ms` }}>
            <span className="hm-l-ic"><img src={`${B}ic-${c.k}.webp`} alt="" width={64} height={64} /></span>
            <span className="hm-l-cn">{c.name}</span>
            <span className="hm-l-cs">{c.sub}</span>
          </a>
        ))}
        <div className="hm-l-a hm-l-stat" data-rv style={P(775, 15, 314, 103)}>
          <span className="hm-l-pen hm-mplus">マチノワで見つかる、<br />まちのいろいろ</span>
          <img className="hm-l-a hm-l-sprig" style={P(29, -25, 26, 48)} src={`${B}st-sprig.webp`} alt="" />
          <img className="hm-l-a hm-l-tree" style={P(247, -11, 22, 36)} src={`${B}st-tree.webp`} alt="" />
          <img className="hm-l-a hm-l-spark" style={P(277, 31, 26, 32)} src={`${B}st-spark.webp`} alt="" />
          <img className="hm-l-a hm-l-sicon" style={P(19, 41, 46, 44)} src={`${B}st-shop.webp`} alt="" />
          <img className="hm-l-a hm-l-sicon" style={P(167, 42, 36, 42)} src={`${B}st-doc.webp`} alt="" />
          <span className="hm-l-a hm-l-num hm-mplus" style={P(74, 38)}><Counter to={509} /><small>店舗掲載</small></span>
          <i className="hm-l-a hm-l-vr" style={P(151, 36, 1, 52)} />
          <span className="hm-l-a hm-l-num hm-mplus" style={P(211, 38)}><Counter to={263} /><small>本の特集記事</small></span>
        </div>
      </div>

      {/* 2. 特集スライド+右の 2 枚 */}
      <div className="hm-l-a hm-l-slidewrap" data-rv style={P(19, 142, 636, 270)}><Slider /></div>
      <div className="hm-l-strip">
      <a href="/gourmet" data-rv className="hm-l-a hm-l-card hm-l-top hm-press" style={P(657, 142, 213, 258)}>
        <span className="hm-l-ph" style={{ "--ph": 154 } as React.CSSProperties}><img src={`${B}card-pasta.webp`} alt="" /><Bubble img="b-pasta.webp" w={106} h={72} x={106} y={2} lines={["地元で人気の", "あのお店も！"]} f={11} /></span>
        <span className="hm-l-pn">
          <b className="hm-l-ct">いま行きたい！<br />おすすめのお店</b>
          <span className="hm-l-cd">地元で愛される話題のお店を<br />ピックアップ！</span>
          <i className="hm-l-arr" style={{ color: "#ec6d8d" }}>→</i>
          <img className="hm-l-a hm-l-dec" style={P(163, 11, 26, 25)} src={`${B}dec-note.webp`} alt="" />
        </span>
      </a>
      <a href="/leisure" data-rv className="hm-l-a hm-l-card hm-l-top hm-press" style={P(882, 142, 207, 258)}>
        <span className="hm-l-ph" style={{ "--ph": 154 } as React.CSSProperties}><img src={`${B}card-family.webp`} alt="" /><Bubble img="b-family.webp" w={120} h={62} x={62} y={4} lines={["家族で楽しめる", "スポットがいっぱい！"]} f={11} /></span>
        <span className="hm-l-pn">
          <b className="hm-l-ct">家族でおでかけ<br />スポット</b>
          <span className="hm-l-cd">公園・体験・レジャー施設など<br />週末のおでかけ先に</span>
          <i className="hm-l-arr" style={{ color: "#c0925a" }}>→</i>
          <img className="hm-l-a hm-l-dec" style={P(162, 9, 28, 36)} src={`${B}dec-hand.webp`} alt="" />
        </span>
      </a>

      </div>

      {/* 3. 4 枚の列 */}
      <div className="hm-l-strip hm-l-strip2">
      {ROWS.map((c) => (
        <a key={c.k} href={c.href} data-rv className="hm-l-a hm-l-card hm-l-row hm-press" style={P(c.x, 417, c.w, 241)}>
          <span className="hm-l-ph" style={{ "--ph": 159 } as React.CSSProperties}><img src={`${B}card-${c.k}.webp`} alt="" /><Bubble img={c.b.img} w={c.b.w} h={c.b.h} x={c.b.x} y={c.b.y} lines={c.b.lines} f={c.b.f} /></span>
          <span className="hm-l-pn hm-l-pn2">
            <b className="hm-l-ct">{c.t}</b>
            <span className="hm-l-cd">{c.d[0]}<br />{c.d[1]}</span>
            <i className="hm-l-arr" style={{ color: "#ec6d8d" }}>→</i>
          </span>
        </a>
      ))}
      </div>
      <div className="hm-l-a hm-l-news" data-rv style={P(868, 417, 224, 241)}>
        <div className="hm-l-nh">
          <img className="hm-l-a" style={P(12, 7, 22, 26)} src={`${B}news-house.webp`} alt="" />
          <b className="hm-l-a hm-l-nt hm-mplus" style={P(39, 10)}>まちの最新情報</b>
          <img className="hm-l-a hm-l-bird" style={P(186, -1, 30, 28)} src={`${B}news-bird.webp`} alt="" />
        </div>
        <ul>
          {NEWS.map((n, i) => (
            <li key={i} className="hm-l-a hm-l-nrow hm-press" style={P(0, [45, 105, 163][i])}>
              <img src={`${B}${n.img}`} alt="" />
              <span className="hm-l-nd">{n.date}</span>
              <span className="hm-l-nti">{n.title.map((t, j) => <span key={j}>{t}</span>)}</span>
            </li>
          ))}
        </ul>
        <a className="hm-l-more hm-press" href="/feature">もっと見る <span aria-hidden>→</span></a>
      </div>

      {/* 4. 街の絵の帯 */}
      <div className="hm-l-a hm-l-band" style={P(0, 657, 1122, 167)}>
        <div className="hm-l-bandclip">
          <img className="hm-l-far" src={`${B}art.webp`} alt="" />
          <img className="hm-l-a hm-l-fx hm-l-fx-sun" style={P(258, 9, 30, 30)} src={`${B}fx-sun.webp`} alt="" />
          <img className="hm-l-a hm-l-fx hm-l-fx-cloud" style={P(836, 23, 34, 28)} src={`${B}fx-cloud.webp`} alt="" />
          <img className="hm-l-a hm-l-fx hm-l-fx-b1" style={P(764, 9, 36, 48)} src={`${B}fx-balloon.webp`} alt="" />
          <img className="hm-l-a hm-l-fx hm-l-fx-b2" style={P(160, 11, 25, 22)} src={`${B}fx-balloon2.webp`} alt="" />
          <img className="hm-l-a hm-l-fx hm-l-fx-sp" style={P(204, 13, 24, 28)} src={`${B}fx-spark.webp`} alt="" />
          <img className="hm-l-near" src={`${B}art-near.webp`} alt="" />
        </div>
        <img className="hm-l-a hm-l-tip" style={P(0, -21, 50, 24)} src={`${B}tree-tip.webp`} alt="" />
        <p className="hm-l-tag hm-hand">このまちで、もっとつながる。<br />もっと好きになる。</p>
        <p className="hm-l-sign hm-hand">日常が、<br />ちょっと特別になる<br />まちのポータルサイト<br /><b>マチノワ</b></p>
      </div>

      {/* 5. フッター */}
      <footer className="hm-l-a hm-l-foot" style={P(0, 820, 1122, 112)}>
        <div className="hm-l-a hm-l-brand" style={P(34, 0)}>
          <img src={`${B}logo.webp`} alt="マチノワ Machinowa" width={152} height={52} />
          <p>まちの人・お店・くらしがつながる<br />ローカルポータルサイト</p>
        </div>
        <i className="hm-l-a hm-l-fvr" style={P(319, 10, 1, 75)} />
        <ul className="hm-l-a hm-l-fl" style={P(349, 13)}><li><a href="/about">マチノワについて</a></li><li><a href="/contact">掲載をご検討の方へ</a></li><li><a href="/feature">お知らせ</a></li><li><a href="/contact">よくあるご質問</a></li></ul>
        <i className="hm-l-a hm-l-fvr" style={P(477, 10, 1, 75)} />
        <ul className="hm-l-a hm-l-fl" style={P(507, 13)}><li><a href="/terms">利用規約</a></li><li><a href="/privacy">プライバシーポリシー</a></li><li><a href="/contact">お問い合わせ</a></li></ul>
        <i className="hm-l-a hm-l-fvr" style={P(647, 10, 1, 75)} />
        <span className="hm-l-a hm-l-sns" style={P(684, 26)}>
          <a href="#" aria-label="Instagram" className="hm-press"><img src={`${B}sns-ig.webp`} alt="" /></a>
          <a href="#" aria-label="YouTube" className="hm-press"><img src={`${B}sns-yt.webp`} alt="" /></a>
          <a href="#" aria-label="LINE" className="hm-press"><img src={`${B}sns-line.webp`} alt="" /></a>
        </span>
        <i className="hm-l-a hm-l-fvr" style={P(830, 10, 1, 75)} />
        <form className="hm-l-a hm-l-mail" style={P(891, 14)} action="#">
          <b>まちの楽しい情報をお届け！</b>
          <label className="hm-l-inp hm-press"><img src={`${B}mail.webp`} alt="" /><input type="email" name="email" placeholder="メールマガジン登録" aria-label="メールマガジン登録" /></label>
        </form>
        <p className="hm-l-a hm-l-copy" style={P(561, 90)}>© 2025 マチノワ Machinowa. All rights reserved.</p>
      </footer>
    </section>
  );
}
