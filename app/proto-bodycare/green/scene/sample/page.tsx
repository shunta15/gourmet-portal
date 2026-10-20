import Link from "next/link";
import ArticleShell, { COMMON_BACK } from "@/components/portal/bcproto/green/article/ArticleShell";
import { Sec, P, Note, Checks, RelCard, Arrow, Pin, Heart } from "@/components/portal/bcproto/green/article/parts";
import { CountUp } from "@/components/portal/bcproto/green/common/Motion";
import { BASE, SEARCH_HREF, SHOP_HREF, FEATURE_HREF, GUIDE_HREF, IMG } from "@/components/portal/bcproto/green/common/site";

const A = `${IMG}/article`;

// 最初のページ下の札「季節のおすすめ特集 春の不調を整える」の記事ページ。題・副題・店名・タグ・駅からの分数は見本のまま。
// 星・点数・件数・料金は出さない。効果・効能をうたわない。並びは順位ではない。
const POINTS = [
  { id: "scene", no: "01", title: "春にからだが重く感じやすい場面", tab: "春の場面" },
  { id: "shops", no: "02", title: "その場面で行きやすい店", tab: "行きやすい店" },
  { id: "check", no: "03", title: "選ぶときに見る所", tab: "選ぶとき" },
];

const SCENES = [
  { t: "新しい環境で気を張る場面", d: "進学や異動で、人や場所に慣れるまで肩に力が入りやすい時期です。", svg: <path d="M4 18c0-3 3-4.4 6-5.4 0-1.6-1-2-1-4.1a3 3 0 0 1 6 0c0 2.1-1 2.5-1 4.1 3 1 6 2.4 6 5.4" /> },
  { t: "朝晩の寒暖差が大きい日", d: "気温の上下が続くと、首や肩をすくめた姿勢のまま過ごしがちです。", svg: <path d="M12 4v10.2a3.4 3.4 0 1 1-3 0V4a1.5 1.5 0 0 1 3 0zM16 7h3M16 11h3" /> },
  { t: "通勤・通学の道のりが変わった場面", d: "歩く量や座る時間が変わると、からだの使い方も変わります。", svg: <path d="M5 19l4-9 3 3 3-7M5 19h14" /> },
];

const SHOPS = [
  { img: "shop-1", name: "マチノワ整体院 渋谷本院", walk: 3, tags: ["整体", "姿勢改善", "肩こり", "腰痛"] },
  { img: "shop-2", name: "はる鍼灸院 渋谷院", walk: 5, tags: ["鍼灸", "美容鍼", "自律神経", "冷え性"] },
  { img: "shop-3", name: "渋谷カラダバランス接骨院", walk: 5, tags: ["接骨院", "骨盤矯正", "スポーツ整体"] },
  { img: "shop-4", name: "リラクゼーションサロン 紬", walk: 4, tags: ["マッサージ", "ヘッドスパ", "アロマ"] },
  { img: "shop-5", name: "めぐりリラクゼーションサロン", walk: 4, tags: ["もみほぐし", "ストレッチ", "眼精疲労"] },
];

function Petals() {
  const ps = [
    { l: "8%", d: "0s", s: 0.9 },
    { l: "26%", d: "-2.4s", s: 1.1 },
    { l: "47%", d: "-4.6s", s: 0.8 },
    { l: "66%", d: "-1.2s", s: 1.2 },
    { l: "84%", d: "-5.5s", s: 0.9 },
  ];
  return (
    <>
      {ps.map((p, i) => (
        <i key={i} className="ar-petal" style={{ left: p.l, top: "-14px", animationDelay: p.d, scale: String(p.s) }} aria-hidden="true" />
      ))}
    </>
  );
}

export default function Page() {
  return (
    <ArticleShell
      kind="scene"
      crumbs={[{ label: "TOP", href: BASE }, { label: "特集", href: BASE }, { label: "季節のおすすめ特集 春の不調を整える" }]}
      chip={
        <>
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
            <path d="M12 20.5s-8-4.9-8-11A4.6 4.6 0 0 1 12 6.6 4.6 4.6 0 0 1 20 9.5c0 6.1-8 11-8 11z" fill="currentColor" />
          </svg>
          季節のおすすめ特集
        </>
      }
      title={["春の不調を整える"]}
      sub="新生活で乱れがちな心とからだを、やさしくリセット。"
      date="春の特集"
      read="読むのにかかる時間 約3分"
      lead="春は気温の変化が大きく、進学や異動などで生活のリズムも変わりやすい季節です。この特集では、春の場面でからだが重く感じやすい背景と、行き先を決めるときの見方を、渋谷エリアの店とあわせて紹介します。"
      vis={
        <>
          <Petals />
          <div className="ar-ph ph-a gr-zoom" data-rv="zoom">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="gr-kb" src={`${A}/topwide.webp`} alt="やわらかな光の中でくつろぐ女性" />
          </div>
          <div className="ar-ph ph-b gr-zoom" data-rv="zoom" style={{ ["--d" as string]: "250ms" } as React.CSSProperties}>
            <div data-par="0.03" style={{ width: "100%", height: "100%" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${A}/bloom.webp`} alt="桜と、のびをする女性" />
            </div>
          </div>
        </>
      }
      note={["春の風に、", "からだもひと息。"]}
      badge={["春の", "からだの", "お手入れ"]}
      pointsTitle="この特集のポイント"
      points={POINTS}
      aside={
        <>
          <div className="ar-card" data-rv="right">
            <h2 className="ar-card-h gr-vbar">条件を決めて探す</h2>
            <div className="ar-chips">
              {["肩こり", "腰痛", "ストレッチ", "マッサージ", "ヘッドスパ", "鍼灸", "眼精疲労", "冷え性"].map((k) => (
                <Link key={k} href={SEARCH_HREF} className="gr-chip gr-press">
                  {k}
                </Link>
              ))}
            </div>
            <div className="ar-cta">
              <Link href={SEARCH_HREF} className="gr-btn gr-press gr-shimmer">
                探すページへ
                <Arrow />
              </Link>
            </div>
            <p className="ar-small">この特集は、行く場所を決めるための手がかりです。症状の診断や治療の案内ではありません。</p>
          </div>
        </>
      }
      related={
        <>
          <RelCard href={FEATURE_HREF} img={`${A}/hero-r.webp`} tag="店の特集記事" title="デスクワークによる肩こり・腰痛を根本から整える方法" text="マチノワ整体院 渋谷本院の考え方。" />
          <RelCard href={GUIDE_HREF} img={`${A}/type-3.webp`} tag="お役立ちコラム" color="#9a6636" title="からだと暮らしを整えるヒント" text="施術の言葉の違いと、店を選ぶときに見る所。" />
          <RelCard href={SHOP_HREF} img={`${A}/shop-1.webp`} tag="店のページ" title="マチノワ整体院 渋谷本院" text="メニュー、スタッフ、アクセス。" />
        </>
      }
      back={COMMON_BACK.map((b, i) => ({ ...b, primary: i === 1 }))}
    >
      <Sec id="scene" no="01" title="春にからだが重く感じやすい場面">
        <P>
          春は、冬よりも活動の量が増える一方で、朝晩の気温差や環境の変化が重なる季節です。次のような場面で、肩や首、背中のあたりに力が入ったまま過ごしている人もいます。
        </P>
        <ul className="ar-scenes" data-rv-group>
          {SCENES.map((s) => (
            <li className="ar-scene gr-lift gr-hov" key={s.t} data-rv>
              <span className="c gr-bounce">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="gr-draw" aria-hidden="true">
                  {s.svg}
                </svg>
              </span>
              <b>{s.t}</b>
              <p>{s.d}</p>
            </li>
          ))}
        </ul>
        <Note>からだの感じ方は人それぞれです。強い痛みやしびれが続くときは、店ではなく医療機関に相談してください。</Note>
      </Sec>

      <Sec id="shops" no="02" title="その場面で行きやすい店">
        <P>渋谷駅から歩いて行ける店を、見本の店から紹介します。店の並びは順位ではありません。</P>
        <div className="ar-count" data-rv>
          <b>
            <CountUp to={SHOPS.length} />
          </b>
          <span>軒を掲載しています</span>
        </div>
        <ul className="ar-shops" data-rv-group>
          {SHOPS.map((s) => (
            <li key={s.name} data-rv>
              <div className="ar-shop gr-lift gr-hov">
                <Link href={SHOP_HREF} className="ar-shop-link" aria-label={`${s.name}のページへ`} />
                <div className="ph gr-zoom">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${A}/${s.img}.webp`} alt="" loading="lazy" />
                </div>
                <div>
                  <h3>{s.name}</h3>
                  <p className="ad">
                    <Pin />
                    東京都 渋谷駅 徒歩{s.walk}分
                  </p>
                  <div className="tg">
                    {s.tags.map((t) => (
                      <Link key={t} href={SEARCH_HREF} className="gr-chip gr-press">
                        {t}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="go">
                  <span className="more">
                    店のページへ
                    <span className="gr-arrow">
                      <Arrow />
                    </span>
                  </span>
                </div>
                <Heart className="gr-heart--ink" />
              </div>
            </li>
          ))}
        </ul>
      </Sec>

      <Sec id="check" no="03" title="選ぶときに見る所">
        <P>どの業種でも、次の点を見ておくと、行ってからの食い違いを減らせます。</P>
        <Checks
          items={[
            { t: "駅からの道のりと営業時間", d: "最終受付の時刻も確認します。仕事帰りに寄るときは、とくに大切です。" },
            { t: "施術の種類", d: "整体・接骨院・鍼灸院・マッサージ・リラクゼーションは、それぞれ位置づけが異なります。" },
            { t: "施術者の資格の表示", d: "国家資格のある業種では、資格名が店のページや店内に書かれているかを見ます。" },
            { t: "初回の流れと料金の表示", d: "問診があるか、料金の考え方が事前に書かれているかを確かめます。" },
            { t: "個室の有無や着替え", d: "くつろぎ方や服装の希望に合うか、事前に見ておきます。" },
            { t: "続けるかどうかを急がされないか", d: "回数券や通う回数は、納得してから決められる店かを見ます。" },
          ]}
        />
      </Sec>
    </ArticleShell>
  );
}
