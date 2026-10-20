import Link from "next/link";
import ArticleShell, { COMMON_BACK } from "@/components/portal/bcproto/green/article/ArticleShell";
import { Sec, P, Note, Checks, RelCard, Arrow } from "@/components/portal/bcproto/green/article/parts";
import { CountUp } from "@/components/portal/bcproto/green/common/Motion";
import { BASE, SEARCH_HREF, SHOP_HREF, SCENE_HREF, FEATURE_HREF, IMG } from "@/components/portal/bcproto/green/common/site";

const A = `${IMG}/article`;

// 最初のページ下の札「お役立ちコラム からだと暮らしを整えるヒント」の記事ページ(業種についての記事)。
// 国家資格など法律上の事実だけを書く。効果・効能・星・料金は出さない。
const POINTS = [
  { id: "words", no: "01", title: "五つの言葉の違い", tab: "言葉の違い" },
  { id: "license", no: "02", title: "資格のある業種・ない業種", tab: "資格" },
  { id: "choose", no: "03", title: "店を選ぶときに見る所", tab: "選ぶとき" },
  { id: "doctor", no: "04", title: "医療機関に相談する目安", tab: "相談の目安" },
];

const TYPES = [
  {
    img: "type-1",
    name: "整体",
    lic: { ok: false, text: "国家資格なし" },
    rows: [
      ["資格", "法律上の資格は定められていません。民間の団体や学校の認定はあります。"],
      ["位置づけ", "手技によるからだの施術として案内されます。医療行為ではなく、診断や治療はできません。"],
    ],
  },
  {
    img: "type-2",
    name: "接骨院・整骨院",
    lic: { ok: true, text: "国家資格あり" },
    rows: [
      ["資格", "柔道整復師(国家資格)が施術します。"],
      ["位置づけ", "打撲・捻挫・挫傷などのけがの施術を行います。健康保険が使えるのは対象とされる範囲に限られ、日常的なこりや疲れは対象外です。"],
    ],
  },
  {
    img: "type-3",
    name: "鍼灸院",
    lic: { ok: true, text: "国家資格あり" },
    rows: [
      ["資格", "はり師・きゅう師(いずれも国家資格)が施術します。"],
      ["位置づけ", "はり(鍼)やきゅう(灸)を使った施術を行います。"],
    ],
  },
  {
    img: "type-4",
    name: "マッサージ",
    lic: { ok: true, text: "国家資格あり(あん摩マッサージ指圧)" },
    rows: [
      ["資格", "あん摩マッサージ指圧師は国家資格です。"],
      ["位置づけ", "「マッサージ」と書かれた店でも、施術者の資格は店によって異なります。資格名の表示を見て確かめます。"],
    ],
  },
  {
    img: "type-5",
    name: "リラクゼーション",
    lic: { ok: false, text: "国家資格なし" },
    rows: [
      ["資格", "法律上の資格は定められていません。もみほぐし、ヘッドスパ、アロマなどの民間の資格はあります。"],
      ["位置づけ", "疲れをほぐして、くつろぐことを目的としたサービスです。医療行為ではなく、診断や治療はできません。"],
    ],
  },
];

export default function Page() {
  return (
    <ArticleShell
      kind="guide"
      crumbs={[{ label: "TOP", href: BASE }, { label: "お役立ちコラム" }, { label: "からだと暮らしを整えるヒント" }]}
      chip={
        <>
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
            <path d="M12 3l7 2.6v5.7c0 4.6-3 8.2-7 9.7-4-1.5-7-5.1-7-9.7V5.6z" fill="currentColor" />
            <path d="M8.8 11.8l2.2 2.2 4.2-4.4" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          お役立ちコラム
        </>
      }
      title={["からだと暮らしを", "整えるヒント"]}
      sub="整体・接骨院・鍼灸院・マッサージ・リラクゼーションの言葉の違い"
      date="専門家監修のコラム"
      read="読むのにかかる時間 約6分"
      lead="似た名前でも、資格や法律上の位置づけは業種ごとに異なります。ここでは国家資格などの事実だけを整理し、店を選ぶときに見る所をまとめます。"
      vis={
        <>
          <div className="ar-ph ph-a gr-zoom" data-rv="zoom">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="gr-kb" src={`${A}/recept.webp`} alt="木とグリーンのやわらかな受付" />
          </div>
          <div className="ar-ph ph-b gr-zoom" data-rv="zoom" style={{ ["--d" as string]: "200ms" } as React.CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${A}/type-1.webp`} alt="" />
          </div>
          <div className="ar-ph ph-c gr-zoom" data-rv="zoom" style={{ ["--d" as string]: "320ms" } as React.CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${A}/type-3.webp`} alt="" />
          </div>
          <div className="ar-ph ph-d gr-zoom" data-rv="zoom" style={{ ["--d" as string]: "440ms" } as React.CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${A}/type-5.webp`} alt="" />
          </div>
        </>
      }
      note={["言葉の違いを、", "ひとつずつ。"]}
      badge={["知っておく", "と選びやすい", "ポイント"]}
      pointsTitle="このコラムのポイント"
      points={POINTS}
      aside={
        <>
          <div className="ar-card" data-rv="right">
            <h2 className="ar-card-h gr-vbar">このページの内容</h2>
            <nav className="ar-mini" aria-label="内容">
              {POINTS.map((x) => (
                <a key={x.id} href={`#${x.id}`} className="gr-hov">
                  <span className="no">{x.no}</span>
                  <span style={{ flex: 1 }}>{x.title}</span>
                  <span className="gr-arrow" style={{ width: 22, height: 22 }}>
                    <Arrow />
                  </span>
                </a>
              ))}
            </nav>
            <div className="ar-cta">
              <Link href={SEARCH_HREF} className="gr-btn gr-press gr-shimmer">
                店を探す
                <Arrow />
              </Link>
            </div>
            <p className="ar-small">このコラムは一般的な情報です。診断や治療の案内ではありません。</p>
          </div>
        </>
      }
      related={
        <>
          <RelCard href={SCENE_HREF} img={`${A}/bloom.webp`} tag="季節のおすすめ特集" color="#c9456f" title="春の不調を整える" text="新生活で乱れがちな心とからだを、やさしくリセット。" />
          <RelCard href={FEATURE_HREF} img={`${A}/hero-r.webp`} tag="店の特集記事" title="デスクワークによる肩こり・腰痛を根本から整える方法" text="マチノワ整体院 渋谷本院の考え方。" />
          <RelCard href={SHOP_HREF} img={`${A}/shop-1.webp`} tag="店のページ" title="マチノワ整体院 渋谷本院" text="メニュー、スタッフ、アクセス。" />
        </>
      }
      back={COMMON_BACK.map((b, i) => ({ ...b, primary: i === 1 }))}
    >
      <Sec id="words" no="01" title="五つの言葉の違い">
        <P>
          お店の看板や紹介ページには、似た言葉がいくつも並びます。名前の違いは、施術する人の資格や、法律上の位置づけの違いにつながっています。
        </P>
        <div className="ar-count" data-rv>
          <b>
            <CountUp to={TYPES.length} />
          </b>
          <span>つの言葉を並べて見ます</span>
        </div>
        <ul className="ar-types" data-rv-group>
          {TYPES.map((t) => (
            <li className="ar-type gr-lift gr-hov" key={t.name} data-rv>
              <div className="ph gr-zoom">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${A}/${t.img}.webp`} alt="" loading="lazy" />
              </div>
              <div className="tx">
                <h3>
                  {t.name}
                  <span className={`ar-lic ${t.lic.ok ? "y" : "n"}`}>{t.lic.text}</span>
                </h3>
                <dl>
                  {t.rows.map(([k, v]) => (
                    <div key={k} style={{ display: "contents" }}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          ))}
        </ul>
      </Sec>

      <Sec id="license" no="02" title="資格のある業種・ない業種">
        <P>施術の名前から、資格の有無は決まりません。店のページや店内に、施術者の資格名が書かれているかを見ます。</P>
        <div className="ar-two" data-rv-group>
          <div data-rv>
            <h3>国家資格がある</h3>
            <ul>
              <li>柔道整復師(接骨院・整骨院)</li>
              <li>はり師・きゅう師(鍼灸院)</li>
              <li>あん摩マッサージ指圧師(マッサージ)</li>
            </ul>
          </div>
          <div data-rv>
            <h3>法律上の資格は定められていない</h3>
            <ul>
              <li>整体(民間の団体や学校の認定はある)</li>
              <li>リラクゼーション(もみほぐし・ヘッドスパ・アロマなど)</li>
            </ul>
          </div>
        </div>
        <Note>資格がないことは、良い悪いの話ではありません。どの業種でも、医師でなければ診断や治療はできない、という点は共通です。</Note>
      </Sec>

      <Sec id="choose" no="03" title="店を選ぶときに見る所">
        <Checks
          items={[
            { t: "施術者の資格名の表示", d: "国家資格のある業種では、資格名が店のページや店内に書かれているかを確かめます。" },
            { t: "施術の内容と料金の考え方", d: "初回の流れ、時間、料金の考え方が、事前に書かれているかを見ます。" },
            { t: "問診や説明があるか", d: "気になる点を聞き、これからの流れを説明してくれる店かを見ます。" },
            { t: "場所・営業時間・最終受付", d: "通いやすい場所か、仕事帰りの時間に間に合うかを確かめます。" },
            { t: "続けることを急がされないか", d: "回数券や通う回数は、納得してから決められるかを見ます。" },
          ]}
        />
      </Sec>

      <Sec id="doctor" no="04" title="医療機関に相談する目安">
        <P>
          強い痛み、しびれ、発熱をともなう不調、けがの直後、症状が急に変わったときなどは、まず整形外科などの医療機関に相談してください。整体院・接骨院・鍼灸院・マッサージ・リラクゼーションは、医師の診断に代わるものではありません。
        </P>
        <Note>通院している人や、妊娠中の人は、施術を受ける前に主治医へ相談しておくと安心です。</Note>
      </Sec>
    </ArticleShell>
  );
}
