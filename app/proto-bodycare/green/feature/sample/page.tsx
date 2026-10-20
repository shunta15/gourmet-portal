import Link from "next/link";
import ArticleShell, { COMMON_BACK } from "@/components/portal/bcproto/green/article/ArticleShell";
import { Sec, P, Note, Steps, Checks, RelCard, Arrow } from "@/components/portal/bcproto/green/article/parts";
import { BASE, SEARCH_HREF, SHOP_HREF, SCENE_HREF, GUIDE_HREF, IMG } from "@/components/portal/bcproto/green/common/site";

const A = `${IMG}/article`;

// 見本(店舗詳細)の特集記事の札「デスクワークによる肩こり・腰痛を根本から整える方法」の記事ページ。題と「この記事のポイント」4 項目は見本のまま。
// 本文は本番の決まりで書く(効果・効能をうたわない・来店したような書き方をしない・星や料金を出さない)。
const POINTS = [
  { id: "cause", no: "01", title: "渋谷のデスクワーカーに多い肩こり・腰痛の原因", tab: "原因" },
  { id: "idea", no: "02", title: "マチノワ整体院の根本改善の考え方", tab: "考え方" },
  { id: "flow", no: "03", title: "実際の施術の流れとビフォーアフター", tab: "施術の流れ" },
  { id: "self", no: "04", title: "自宅でできるセルフケアのポイント", tab: "セルフケア" },
];

const ICONS = [
  {
    t: "首・肩",
    d: "画面をのぞきこむ姿勢が続く",
    svg: <path d="M4 18c0-3 3-4.4 6-5.4 0-1.6-1-2-1-4.1a3 3 0 0 1 6 0c0 2.1-1 2.5-1 4.1 3 1 6 2.4 6 5.4" />,
  },
  {
    t: "背中・腰",
    d: "座りっぱなしの時間が長い",
    svg: <path d="M9 4c3 3 3 6 1 9s-1 5 2 7M14 5c2 2.6 2 5 .5 7.5" />,
  },
  {
    t: "目・頭",
    d: "画面を見続ける時間が長い",
    svg: (
      <>
        <path d="M3 12c3-4.6 6-6.4 9-6.4s6 1.8 9 6.4c-3 4.6-6 6.4-9 6.4S6 16.6 3 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  {
    t: "腕・手首",
    d: "マウスやキーボードの操作が多い",
    svg: <path d="M5 17l7-7 3 3-7 7zM13 9l2-2 3 3-2 2M4 21h6" />,
  },
];

export default function Page() {
  return (
    <ArticleShell
      kind="feature"
      crumbs={[
        { label: "TOP", href: BASE },
        { label: "東京都", href: SEARCH_HREF },
        { label: "渋谷エリア", href: SEARCH_HREF },
        { label: "マチノワ整体院 渋谷本院", href: SHOP_HREF },
        { label: "特集記事" },
      ]}
      chip={<>マチノワ整体院 渋谷本院の特集</>}
      title={["デスクワークによる肩こり・腰痛を", "根本から整える方法"]}
      sub="マチノワ整体院 渋谷本院の考え方"
      date="2024.04.12"
      read="読むのにかかる時間 約5分"
      lead="渋谷で働く多くの方が抱える、デスクワークによる肩こりや腰痛。この記事では、考えられている原因、店の施術の考え方、施術の流れの一例、自宅でできるセルフケアの方法を順番に紹介します。"
      vis={
        <>
          <div className="ar-ph ph-a gr-zoom" data-rv="zoom">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="gr-kb" src={`${A}/hero-r.webp`} alt="施術を受ける女性と施術者" />
          </div>
          <div className="ar-ph ph-b gr-zoom" data-rv="zoom" style={{ ["--d" as string]: "250ms" } as React.CSSProperties}>
            <div data-par="0.03" style={{ width: "100%", height: "100%" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${A}/concept-r.webp`} alt="カウンセリングのようす" />
            </div>
          </div>
        </>
      }
      note={["デスクワークでも", "軽やかに生きる、", "その先の毎日へ。"]}
      badge={["読むと", "わかる", "4つのこと"]}
      pointsTitle="この記事のポイント"
      points={POINTS}
      aside={
        <>
          <div className="ar-card" data-rv="right">
            <h2 className="ar-card-h gr-vbar">基本情報</h2>
            <dl className="ar-info">
              <div><dt>院名</dt><dd>マチノワ整体院 渋谷本院</dd></div>
              <div><dt>住所</dt><dd>〒150-0002<br />東京都渋谷区渋谷1-12-8 渋谷東ビル4F</dd></div>
              <div><dt>アクセス</dt><dd>JR渋谷駅 東口から徒歩3分<br />東京メトロ B1出口から徒歩2分</dd></div>
              <div><dt>営業時間</dt><dd>9:00〜21:00(最終受付 20:00)</dd></div>
              <div><dt>定休日</dt><dd>不定休</dd></div>
              <div><dt>支払い方法</dt><dd>現金 / クレジットカード / 電子マネー / QR決済</dd></div>
            </dl>
            <div className="ar-map gr-zoom" data-scrollp>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${A}/map.webp`} alt="マチノワ整体院 渋谷本院の地図(渋谷駅から徒歩3分)" />
            </div>
            <div className="ar-cta">
              <Link href={SHOP_HREF} className="gr-btn gr-press gr-shimmer">
                店のページを見る
                <Arrow />
              </Link>
              <Link href={SEARCH_HREF} className="gr-btn gr-btn--line gr-press">
                渋谷エリアの店を探す
                <Arrow />
              </Link>
            </div>
          </div>
        </>
      }
      after={
        <div className="ar-shopband" data-rv>
          <div className="ph gr-zoom">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${A}/recept.webp`} alt="マチノワ整体院 渋谷本院の受付" loading="lazy" />
          </div>
          <div className="tx">
            <small>この記事の店</small>
            <h3>マチノワ整体院 渋谷本院</h3>
            <p>渋谷駅から徒歩3分。メニューやスタッフ、アクセスは店のページにまとまっています。</p>
            <div className="row">
              <Link href={SHOP_HREF} className="gr-btn gr-press gr-shimmer">
                店のページを見る
                <Arrow />
              </Link>
              <Link href={SEARCH_HREF} className="gr-btn gr-btn--line gr-press">
                ほかの店を探す
                <Arrow />
              </Link>
            </div>
          </div>
        </div>
      }
      related={
        <>
          <RelCard href={SCENE_HREF} img={`${A}/bloom.webp`} tag="季節のおすすめ特集" color="#c9456f" title="春の不調を整える" text="新生活で乱れがちな心とからだを、やさしくリセット。" />
          <RelCard href={GUIDE_HREF} img={`${A}/type-1.webp`} tag="お役立ちコラム" color="#9a6636" title="からだと暮らしを整えるヒント" text="整体・接骨院・鍼灸院・マッサージ・リラクゼーションの言葉の違い。" />
          <RelCard href={SEARCH_HREF} img={`${A}/topwide.webp`} tag="探す" title="渋谷エリアの整体院・接骨院・鍼灸院" text="エリアや施術の種類、お悩みから探せます。" />
        </>
      }
      back={COMMON_BACK.map((b, i) => ({ ...b, primary: i === 2 }))}
    >
      <Sec id="cause" no="01" title="渋谷のデスクワーカーに多い肩こり・腰痛の原因">
        <P>
          長い時間パソコンに向かっていると、頭や腕の重みを支える首・肩・背中の筋肉が、同じ姿勢のまま緊張し続けやすくなります。座りっぱなしの時間が長いと、腰のまわりにも負担がかかるといわれています。
        </P>
        <P>
          原因は一つとは限りません。机や椅子の高さ、画面の位置、運動の量、睡眠、気持ちの張りつめ方など、いくつかの要素が重なっていることも多いと考えられています。
        </P>
        <ul className="ar-icons" data-rv-group>
          {ICONS.map((x) => (
            <li className="ar-icon gr-lift gr-hov" key={x.t} data-rv>
              <span className="c gr-bounce">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="gr-draw" aria-hidden="true">
                  {x.svg}
                </svg>
              </span>
              <b>{x.t}</b>
              <span>{x.d}</span>
            </li>
          ))}
        </ul>
        <Note>こりや痛みの感じ方には個人差があります。強い痛み、しびれ、発熱をともなうときなどは、整体院ではなく、まず医療機関に相談してください。</Note>
      </Sec>

      <Sec id="idea" no="02" title="マチノワ整体院の根本改善の考え方">
        <div className="ar-split" data-rv>
          <div>
            <p className="ar-p">
              マチノワ整体院 渋谷本院の紹介では、一人ひとりの生活習慣や悩みを聞き取り、オーダーメイドで施術を組み立てる方針が示されています。
            </p>
            <p className="ar-p" style={{ marginTop: 12 }}>
              デスクワークの方の場合は、仕事中の姿勢、座っている時間、休憩の取り方など、日々の過ごし方も話題になります。からだの状態を見るだけでなく、暮らし方を一緒に振り返る点が、店の特徴として挙げられています。
            </p>
          </div>
          <figure className="ar-fig gr-zoom">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${A}/concept-r.webp`} alt="問診票に書き込む施術者と、話をする女性" loading="lazy" />
            <figcaption>話を聞くところから始まる(イメージ)</figcaption>
          </figure>
        </div>
        <Checks
          items={[
            { t: "話を聞く", d: "気になる場所、仕事の内容、一日の過ごし方を聞き取ります。" },
            { t: "からだの状態を見る", d: "立った姿勢や動かしたときの状態を、施術の前に確認します。" },
            { t: "暮らし方を一緒に振り返る", d: "座り方や休憩の取り方など、日常で気をつけたい点を共有します。" },
          ]}
        />
      </Sec>

      <Sec id="flow" no="03" title="実際の施術の流れとビフォーアフター">
        <P>施術の流れは店によって異なります。ここでは、整体院でよく案内されている流れの一例を紹介します。</P>
        <Steps
          items={[
            { t: "受付・問診票", d: "気になる場所、お仕事の内容、これまでの経過などを問診票に書きます。" },
            { t: "カウンセリング", d: "問診票をもとに話を聞き、立った姿勢や動きの確認を行います。" },
            { t: "施術", d: "説明を受けながら進みます。力の強さなどの希望は、その場で伝えられます。" },
            { t: "振り返りと次の予定", d: "日常で気をつけたいことや、通う間隔の目安について相談します。" },
          ]}
        />
        <P>
          施術の前後で立ち姿の写真を見比べる、という案内をしている店もあります。見え方や感じ方には個人差があり、同じ変化を約束するものではありません。
        </P>
      </Sec>

      <Sec id="self" no="04" title="自宅でできるセルフケアのポイント">
        <P>日常の中で取り入れやすい工夫を紹介します。どれも、痛みが出ない範囲で無理なく行うことが前提です。</P>
        <Checks
          items={[
            { t: "1時間に1回は立ち上がる", d: "座りっぱなしを区切るために、水をくみに行く、背のびをするなど短い動きを入れます。" },
            { t: "画面の高さを目線に近づける", d: "画面をのぞきこむ姿勢を減らすため、画面の高さや椅子の位置を見直します。" },
            { t: "肩や首をゆっくり動かす", d: "息を止めず、痛みが出る手前で止めます。勢いをつけて回さないようにします。" },
            { t: "温まる・眠る時間をとる", d: "入浴でからだを温める、睡眠の時間を確保するなど、休む時間もケアの一部です。" },
          ]}
        />
        <Note>セルフケアは無理のない範囲で行ってください。痛みが強くなるときは中止し、専門家や医療機関に相談してください。</Note>
      </Sec>
    </ArticleShell>
  );
}
