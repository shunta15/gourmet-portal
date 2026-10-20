import Link from "next/link";
import { IMG, SEARCH_HREF, FEATURE_HREF, SHOP_HREF } from "../common/site";
import { MaskLines, Write, CountUp, Stars } from "../common/Motion";
import ShopTabs from "./ShopTabs";
import "./shop.css";

// 店舗詳細(見本 mock-shop の完全再現)。店名・評価・料金・文章は見本どおりの仮の内容。画像は見本から切り出し(public/_portal/bcproto/green/shop/)。
const P = `${IMG}/shop`;

const ArrowSvg = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PinSvg = ({ w = 12, h = 16 }: { w?: number; h?: number }) => (
  <svg viewBox="0 0 24 32" width={w} height={h} aria-hidden="true">
    <path d="M12 1.5C6.2 1.5 2 5.8 2 11.3c0 7.2 10 18.7 10 18.7s10-11.5 10-18.7C22 5.8 17.8 1.5 12 1.5z" fill="#2f5a3d" />
    <circle cx="12" cy="11.2" r="4" fill="#fff" />
  </svg>
);
const PhoneSvg = ({ s = 20, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden="true">
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.57 3.6a1 1 0 0 1-.25 1z" fill={c} />
  </svg>
);
const CalSvg = () => (
  <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M8 13.5h1.5M11.3 13.5h1.5M14.6 13.5h1.5M8 16.8h1.5M11.3 16.8h1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const CamSvg = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.2-1.8h6.6L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <circle cx="12" cy="12.7" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);
const LeafSvg = () => (
  <svg viewBox="0 0 28 28" width="24" height="24" aria-hidden="true" className="gr-sway">
    <path d="M4 24C5 13 12 5 24 4c0 11-6 19-17 20" fill="#7fae86" opacity=".85" />
    <path d="M4 24C9 17 14 12 21 8" stroke="#2f5a3d" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    <path d="M8 18c-2.2-.2-3.6.6-4.4 1.8M12 14c-.2-2.2.3-3.6 1.4-4.6" stroke="#2f5a3d" strokeWidth="1" fill="none" strokeLinecap="round" />
  </svg>
);

const TABS = [
  { id: "sh-top", label: "トップ" },
  { id: "sh-menu", label: "メニュー・料金" },
  { id: "sh-staff", label: "スタッフ" },
  { id: "sh-feature", label: "院の特徴" },
  { id: "sh-review", label: "口コミ", spy: false, flash: "sh-rating" },
  { id: "sh-article", label: "特集記事" },
  { id: "sh-access", label: "アクセス" },
];
const CONCERNS = ["肩こり", "腰痛", "頭痛", "姿勢のゆがみ", "骨盤の歪み", "眼の疲れ", "冷え・むくみ", "ストレス", "産後ケア", "スポーツの不調"];
const MENUS = [
  { img: "m1", t: "全身整体コース", d: ["全身のバランスを整え、", "不調を根本から改善します。"], p: "6,600" },
  { img: "m2", t: "肩こり集中コース", d: ["つらい肩こり・首こりを", "丁寧にほぐします。"], p: "5,500" },
  { img: "m3", t: "骨盤矯正コース", d: ["骨盤の歪みを整え、", "姿勢やスタイルの改善をサポート。"], p: "6,600" },
];
const POINTS = [
  ["渋谷のデスクワーカーに多い", "肩こり・腰痛の原因"],
  ["マチノワ整体院の根本改善の考え方"],
  ["実際の施術の流れとビフォーアフター"],
  ["自宅でできるセルフケアのポイント"],
];
const MINI = [["当日予約OK"], ["渋谷駅", "徒歩3分"], ["個室あり"], ["クレジットカード", "対応"]];

export default function ShopPage() {
  return (
    <div data-gr-page="shop" className="sh">
      {/* ========== ヒーロー ========== */}
      <section className="sh-hero" id="sh-top">
        <div className="sh-hero-bg" aria-hidden="true" />
        <div className="sh-w">
          <div className="sh-abs sh-hero-ph">
            <div className="sh-heroimg">
              <img className="gr-kb" src={`${P}/hero.webp`} alt="" width={526} height={295} />
            </div>
            <div className="sh-hand-wrap">
              <Write lines={["整うって、", "こんなに気持ちいい。"]} className="gr-hand sh-hand" delay={900} step={700} />
            </div>
          </div>

          <div className="sh-hero-txt">
            <nav className="sh-abs sh-crumb" aria-label="パンくず" data-rv="fade">
              <Link href={SEARCH_HREF}>TOP</Link>
              <i />
              <Link href={SEARCH_HREF}>東京都</Link>
              <i />
              <Link href={SEARCH_HREF}>渋谷エリア</Link>
              <i />
              <span>マチノワ整体院 渋谷本院</span>
            </nav>
            <ul className="sh-abs sh-tags" data-rv-group>
              {["整体", "骨盤矯正", "肩こり", "腰痛", "マッサージ"].map((t) => (
                <li key={t} data-rv="fade">
                  <Link href={SEARCH_HREF} className="gr-chip sh-tag">
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
            <MaskLines as="h1" className="sh-abs sh-h1" lines={["マチノワ整体院 渋谷本院"]} delay={80} />
            <MaskLines as="p" className="sh-abs sh-sub" lines={["からだが整うと、", "毎日がもっと軽やかになる。"]} delay={260} step={140} />
            <p className="sh-abs sh-lead" data-rv="fade" style={{ ["--d" as string]: "700ms" }}>
              渋谷駅から徒歩3分。 その場のリラクゼーションだけでなく、
              <br />
              根本からの改善を目指すオーダーメイドの整体院です。
            </p>
            <div className="sh-abs sh-rating" id="sh-rating">
              <Stars value={4} size={17} />
              <b className="sh-score">
                <CountUp to={4.8} decimals={1} duration={1300} />
              </b>
              <span className="sh-cnt">
                (<CountUp to={128} duration={1500} />件)
              </span>
            </div>
            <div className="sh-abs sh-badge gr-pop gr-float">
              <img className="lau-l" src={`${P}/lau-l.webp`} alt="" width={70} height={38} />
              <span className="bt">
                渋谷エリア
                <br />
                人気の整体院
              </span>
              <img className="lau-r" src={`${P}/lau-r.webp`} alt="" width={24} height={38} />
            </div>
            <p className="sh-abs sh-addr" data-rv="fade" style={{ ["--d" as string]: "900ms" }}>
              <PinSvg />
              <span>東京都渋谷区渋谷1-12-8 渋谷東ビル4F</span>
              <span className="st">渋谷駅から徒歩3分</span>
            </p>
          </div>

          <div className="sh-abs sh-gal" data-rv-group>
            {[
              ["g1", 323, 121],
              ["g2", 155, 81],
              ["g3", 163, 81],
              ["g4", 95, 83],
              ["g5", 112, 83],
              ["g6", 106, 83],
            ].map(([k, w, h]) => (
              <figure key={k as string} className={`sh-g sh-${k}`} data-rv="zoom">
                <div className="gr-zoom sh-gin">
                  <img src={`${P}/${k}.webp`} alt="" width={w as number} height={h as number} />
                </div>
                {k === "g6" && (
                  <Link href={SHOP_HREF} className="sh-allpic gr-press">
                    <CamSvg />
                    全12枚を見る
                  </Link>
                )}
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 本体 ========== */}
      <div className="sh-w sh-bodyw">
        <ShopTabs items={TABS} />
        <div className="sh-grid">
          {/* ----- 左の大きな白い箱 ----- */}
          <div className="sh-left">
            <section className="sh-concept" id="sh-staff">
              <div className="sh-cphoto" data-rv="fade">
                <img src={`${P}/concept.webp`} alt="" width={528} height={199} />
              </div>
              <h2 className="sh-hd" data-rv>
                院のコンセプト
              </h2>
              <p className="sh-h2" data-rv style={{ ["--d" as string]: "80ms" }}>
                からだとこころが整う、
                <br />
                暮らしのパートナーに。
              </p>
              <p className="sh-cp" data-rv style={{ ["--d" as string]: "160ms" }}>
                マチノワ整体院 渋谷本院は、ただのリラクゼーションではなく、
                <br />
                不調の根本に向き合い、再発しにくいからだづくりを目指す整体院です。
                <br />
                一人ひとりの生活習慣やお悩みに寄り添い、オーダーメイドの施術で
                <br />
                健康で快適な毎日をサポートします。
              </p>
              <div className="sh-hand-wrap sh-hand2">
                <Write lines={["一人ひとりに", "寄り添った施術を", "ご提案します。"]} className="gr-hand sh-hand" delay={300} step={600} />
              </div>
            </section>

            <section className="sh-concern" id="sh-feature">
              <h2 className="sh-hd" data-rv>
                こんなお悩みに対応しています
              </h2>
              <ul className="sh-circles" data-rv-group>
                {CONCERNS.map((c, i) => (
                  <li key={c} data-rv="zoom">
                    <Link href={SEARCH_HREF} className="sh-circ gr-hov">
                      <span className="sh-ic gr-bounce">
                        <img src={`${P}/ic${i + 1}.webp`} alt="" width={38} height={36} />
                      </span>
                      <span className="sh-cl">{c}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="sh-menus" id="sh-menu">
              <div className="sh-mhead" data-rv>
                <h2 className="sh-hd">人気のメニュー・料金</h2>
                <img className="sh-leaf gr-sway" src={`${P}/leaf-menu.webp`} alt="" width={50} height={40} />
                <Link href={SHOP_HREF} className="sh-more gr-hov">
                  すべてのメニューを見る
                  <ArrowSvg />
                </Link>
              </div>
              <ul className="sh-mlist" data-rv-group>
                {MENUS.map((m) => (
                  <li key={m.t} data-rv>
                    <Link href={SHOP_HREF} className="sh-mcard gr-lift">
                      <span className="gr-zoom sh-mph">
                        <img src={`${P}/${m.img}.webp`} alt="" width={285} height={60} />
                      </span>
                      <span className="sh-mt">{m.t}</span>
                      <span className="sh-md">
                        {m.d[0]}
                        <br />
                        {m.d[1]}
                      </span>
                      <span className="sh-mp">
                        <i>60分</i>
                        <b>{m.p}</b>
                        <u>円</u>
                      </span>
                      <span className="gr-arrow sh-marr">
                        <ArrowSvg />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="sh-articles" id="sh-article">
              <div className="sh-mhead" data-rv>
                <h2 className="sh-hd">
                  特集記事<s>|</s>マチノワ整体院 渋谷本院の考え方
                </h2>
                <Link href={FEATURE_HREF} className="sh-more gr-hov">
                  すべての特集記事を見る
                  <ArrowSvg />
                </Link>
              </div>
              <div className="sh-feat gr-lift" data-rv>
                <Link href={FEATURE_HREF} className="sh-fphoto gr-zoom" aria-label="デスクワークによる肩こり・腰痛を根本から整える方法">
                  <img src={`${P}/feat.webp`} alt="" width={275} height={146} />
                  <div className="sh-fhand-wrap">
                    <Write lines={["デスクワークでも", "軽やかに生きる、", "その先の毎日へ。"]} className="gr-hand sh-hand" delay={200} step={600} />
                  </div>
                </Link>
                <div className="sh-fbody">
                  <span className="sh-ftag">マチノワ整体院 渋谷本院の特集</span>
                  <Link href={FEATURE_HREF} className="sh-ft">
                    デスクワークによる肩こり・腰痛を
                    <br />
                    根本から整える方法
                  </Link>
                  <time className="sh-fdate">2024.04.12</time>
                  <p className="sh-fex">
                    渋谷で働く多くの方が抱える、デスクワークによる肩こりや腰痛。
                    <br />
                    マチノワ整体院 渋谷本院では、単にほぐすだけでなく、姿勢・
                    <br />
                    生活習慣・からだの使い方まで含めた根本改善を大切にしています。
                    <br />
                    実際の施術の流れや、改善事例、セルフケアのポイントもご紹介します。
                  </p>
                  <Link href={FEATURE_HREF} className="sh-fbtn gr-press">
                    記事を読む
                    <ArrowSvg />
                  </Link>
                </div>
                <aside className="sh-fpts">
                  <p className="sh-fpt-h">
                    <LeafSvg />
                    この記事のポイント
                  </p>
                  <ol>
                    {POINTS.map((p, i) => (
                      <li key={i} className="sh-pt">
                        <em>{`0${i + 1}`}</em>
                        <span>
                          {p[0]}
                          {p[1] && (
                            <>
                              <br />
                              {p[1]}
                            </>
                          )}
                        </span>
                      </li>
                    ))}
                  </ol>
                </aside>
              </div>
            </section>
          </div>

          {/* ----- 右の列 ----- */}
          <div className="sh-right">
            <section className="sh-card sh-rsv" data-rv>
              <a href="tel:0364550123" className="sh-call gr-shimmer gr-press">
                <PhoneSvg s={19} />
                電話で予約する
              </a>
              <p className="sh-tel">
                <PhoneSvg s={21} c="#1d211e" />
                03-6455-0123
              </p>
              <p className="sh-hours">受付時間 9:00〜21:00</p>
              <Link href={SHOP_HREF} className="sh-web gr-press">
                <CalSvg />
                WEBで予約する
                <svg viewBox="0 0 24 24" width="12" height="12" className="chev" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <ul className="sh-mini" data-rv-group>
                {MINI.map((m, i) => (
                  <li key={i} className="gr-hov" data-rv="zoom">
                    <img className="gr-bounce" src={`${P}/mi${i + 1}.webp`} alt="" width={28} height={28} />
                    <span>
                      {m[0]}
                      {m[1] && (
                        <>
                          <br />
                          {m[1]}
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="sh-card sh-info" id="sh-access" data-rv>
              <h2 className="sh-hd">基本情報</h2>
              <dl className="sh-tbl">
                <div>
                  <dt>院名</dt>
                  <dd>マチノワ整体院 渋谷本院</dd>
                </div>
                <div>
                  <dt>住所</dt>
                  <dd>
                    〒150-0002
                    <br />
                    東京都渋谷区渋谷1-12-8 渋谷東ビル4F
                  </dd>
                  <span className="pin">
                    <PinSvg w={12} h={16} />
                  </span>
                </div>
                <div>
                  <dt>アクセス</dt>
                  <dd>
                    JR渋谷駅 東口から徒歩3分
                    <br />
                    東京メトロ B1出口から徒歩2分
                  </dd>
                </div>
                <div>
                  <dt>営業時間</dt>
                  <dd>9:00〜21:00 (最終受付 20:00)</dd>
                </div>
                <div>
                  <dt>定休日</dt>
                  <dd>不定休</dd>
                </div>
                <div>
                  <dt>支払い方法</dt>
                  <dd>現金 / クレジットカード / 電子マネー / QR決済</dd>
                </div>
              </dl>
              <div className="sh-map">
                <div className="sh-mapimg" data-scrollp>
                  <img src={`${P}/map.webp`} alt="" width={290} height={136} />
                </div>
                <div className="sh-mapcard gr-float">
                  <PinSvg w={20} h={27} />
                  <span>
                    <b>マチノワ整体院 渋谷本院</b>
                    <i>渋谷駅から徒歩3分</i>
                  </span>
                </div>
              </div>
            </section>

            <section className="sh-card sh-eq" data-rv>
              <div className="sh-mhead">
                <h2 className="sh-hd">院の設備・雰囲気</h2>
                <Link href={SHOP_HREF} className="sh-more gr-hov">
                  もっと見る
                  <ArrowSvg />
                </Link>
              </div>
              <div className="sh-eqs" data-rv-group>
                {["eq1", "eq2"].map((k, i) => (
                  <figure key={k} className="gr-zoom sh-eqp" data-rv="zoom">
                    <img src={`${P}/${k}.webp`} alt="" width={i ? 144 : 134} height={80} />
                  </figure>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* スマホ: 下に固定の細い帯(電話・WEB 予約) */}
      <div className="sh-fixbar" aria-label="予約">
        <a href="tel:0364550123" className="sh-fix-call gr-press">
          <PhoneSvg s={17} />
          電話で予約
        </a>
        <Link href={SHOP_HREF} className="sh-fix-web gr-press">
          <CalSvg />
          WEB予約
        </Link>
      </div>
    </div>
  );
}
