import Link from "next/link";
import { Noto_Serif_JP } from "next/font/google";
import { Reveal, MaskLines, Write, Heart, Stars } from "@/components/portal/bcproto/green/common/Motion";
import { IMG, SEARCH_HREF, SHOP_HREF, GUIDE_HREF, SCENE_HREF } from "@/components/portal/bcproto/green/common/site";
import "./top.css";

// 見本の見出しは標準的な明朝(Noto Serif JP の中太)に近い。この最初のページの大見出しと節の見出しだけに使う。
const ser = Noto_Serif_JP({ weight: ["500", "600", "700"], variable: "--gt-ser", display: "swap", preload: false });

const T = `${IMG}/top`;

const Arrow = ({ s = 16 }: { s?: number }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />
  </svg>
);
const Pin = ({ w = 14, h = 18, c = "currentColor" }: { w?: number; h?: number; c?: string }) => (
  <svg viewBox="0 0 24 30" width={w} height={h} aria-hidden="true">
    <path d="M12 1C6.2 1 2 5.3 2 10.8c0 7.2 10 18 10 18s10-10.8 10-18C22 5.3 17.8 1 12 1Z" fill={c} />
    <circle cx="12" cy="10.6" r="3.7" fill="#fff" />
  </svg>
);
const Shield = ({ c }: { c: string }) => (
  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
    <path d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.300 8-5 8-10V5l-8-3Z" fill={c} />
    <path d="m8.500 11.800 2.600 2.600 4.600-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const KEYWORDS: Array<[string, number]> = [["肩こり", 63], ["腰痛", 57], ["マッサージ", 79], ["骨盤矯正", 75], ["猫背矯正", 74], ["産後ケア", 75], ["鍼灸", 56], ["ヘッドスパ", 87], ["もみほぐし", 87], ["ストレッチ", 80], ["姿勢改善", 79]];

const TYPES = [
  { n: "整体院", s: "からだのバランスを整える" },
  { n: "接骨院・整骨院", s: "痛みの改善・ケガの施術" },
  { n: "鍼灸院", s: "自然治癒力を高める" },
  { n: "マッサージ", s: "疲れを癒すリラクゼーション" },
  { n: "リラクゼーション", s: "心とからだをリフレッシュ" },
];

const WORRIES: Array<[string, number]> = [["肩こり", 80], ["腰痛", 79], ["頭痛", 79], ["姿勢のゆがみ", 79], ["骨盤の悩み", 79], ["眼の疲れ", 79], ["冷え・むくみ", 79], ["ストレス", 78], ["産後ケア", 79], ["スポーツの不調", 98]];

const SHOPS = [
  { n: "マチノワ整体院 渋谷本院", st: "徒歩3分", v: 4.8, sv: 4.5, c: 128, tags: ["整体", "姿勢改善", "肩こり", "腰痛"] },
  { n: "はる鍼灸院 渋谷院", st: "徒歩5分", v: 4.7, sv: 4.5, c: 86, tags: ["鍼灸", "美容鍼", "自律神経", "冷え性"] },
  { n: "渋谷カラダバランス接骨院", st: "徒歩5分", v: 4.6, sv: 4.5, c: 92, tags: ["接骨院", "骨盤矯正", "スポーツ整体"] },
  { n: "リラクゼーションサロン 紬", st: "徒歩4分", v: 4.5, sv: 4.5, c: 104, tags: ["マッサージ", "ヘッドスパ", "アロマ"] },
  { n: "めぐりリラクゼーションサロン", st: "徒歩4分", v: 4.6, sv: 4, c: 78, tags: ["もみほぐし", "ストレッチ", "眼精疲労"] },
];

const AREAS = [
  { n: "東京エリア", e: "Tokyo" },
  { n: "神奈川エリア", e: "Kanagawa" },
  { n: "大阪エリア", e: "Osaka" },
  { n: "京都エリア", e: "Kyoto" },
  { n: "福岡エリア", e: "Fukuoka" },
];

export default function TopPage() {
  return (
    <div data-gr-page="top" className={`gt ${ser.variable}`}>
      {/* ================= ヒーロー ================= */}
      <section className="gt-hero">
        <div className="gt-hero-bg" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="gr-kb" src={`${T}/hero.webp`} width={1448} height={355} alt="" fetchPriority="high" />
        </div>
        <div className="gt-hero-in">
          <MaskLines as="h1" className="gt-h1 gr-min" lines={[<span key="1" style={{ letterSpacing: "var(--gt-ls1)" }}>からだが整うと、</span>, <span key="2" style={{ letterSpacing: "var(--gt-ls2)" }}>毎日がもっと好きになる。</span>]} step={190} delay={150} />
          <p className="gt-lead" data-rv style={{ ["--d" as string]: "450ms" }}>
            渋谷エリアの整体院・接骨院・鍼灸院・マッサージ・
            <br />
            リラクゼーションサロンを探せるポータルサイトです。
          </p>
          <form className="gt-search" action={SEARCH_HREF} method="get" data-rv style={{ ["--d" as string]: "500ms" }}>
            <Link href={SEARCH_HREF} className="gt-area gr-press">
              <Pin w={14} h={18} c="#1d2b45" />
              <span>エリアを選択</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#2a3548" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="gt-caret">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Link>
            <div className="gt-input">
              <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="#2a3548" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="10.500" cy="10.500" r="6.500" />
                <path d="m15.500 15.500 5 5" />
              </svg>
              <input type="text" name="q" placeholder="駅名・サロン名・お悩みなどで検索" aria-label="キーワード" />
              <button type="submit" className="gt-go gr-shimmer gr-press">
                <span>検索する</span>
                <Arrow s={17} />
              </button>
            </div>
          </form>
          <div className="gt-kw" data-rv style={{ ["--d" as string]: "600ms" }}>
            <b>注目のキーワード</b>
            <ul>
              {KEYWORDS.map(([k, w]) => (
                <li key={k}>
                  <Link href={SEARCH_HREF} className="gr-chip gr-press" style={{ width: w }}>
                    {k}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="gt-hand" aria-hidden="false">
            <Write lines={["こころも、", "からだも、", "軽やかに。"]} className="gr-hand" delay={1100} step={620} />
          </div>
          <div className="gt-badge gr-pop gr-float">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${T}/badge.png`} width={194} height={142} alt="" />
            <p className="gr-hand">
              あなたに
              <br />
              ぴったりの
              <br />
              施術がきっと
              <br />
              見つかる
            </p>
          </div>
        </div>
      </section>

      {/* ================= 施術の種類から探す ================= */}
      <section className="gt-w gt-types">
        <Reveal className="gt-types-h">
          <h2 className="gr-vbar gr-min">施術の種類から探す</h2>
          <p>
            ライフスタイルやお悩みに合わせて
            <br />
            最適な施術を見つけましょう。
          </p>
          <Link href={SEARCH_HREF} className="gr-arrow gt-types-go gr-press" aria-label="施術の種類から探す">
            <Arrow s={14} />
          </Link>
        </Reveal>
        <div className="gt-types-grid" data-rv-group>
          {TYPES.map((t, i) => (
            <div key={t.n} data-rv>
              <Link href={SEARCH_HREF} className="gt-type gr-lift gr-hov">
                <span className="gt-type-ph gr-zoom">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${T}/type${i + 1}.webp`} width={207} height={75} alt="" loading="lazy" />
                </span>
                <span className="gt-type-b">
                  <span className="gt-type-t">
                    <b>{t.n}</b>
                    <small>{t.s}</small>
                  </span>
                  <span className="gr-arrow">
                    <Arrow s={13} />
                  </span>
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ================= お悩みから探す ================= */}
      <section className="gt-worry">
        <div className="gt-w gt-worry-in">
          <Reveal className="gt-worry-h">
            <h2 className="gr-vbar gr-min">お悩みから探す</h2>
            <p>
              気になる症状から、
              <br />
              ぴったりの施術を見つけましょう。
            </p>
          </Reveal>
          <ul className="gt-worry-row" data-rv-group>
            {WORRIES.map(([n, w], i) => (
              <li key={n} data-rv="zoom">
                <Link href={SEARCH_HREF} className={`gt-wc gr-hov gr-press${i === 9 ? " gt-wc--wide" : ""}`} style={{ width: w }}>
                  <span className="gt-wc-ic gr-bounce">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${T}/ic${i + 1}.png`} width={68} height={48} alt="" loading="lazy" />
                  </span>
                  <span className="gt-wc-l">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={SEARCH_HREF} className="gt-worry-all gr-hov gr-press">
            <span>お悩み一覧を見る</span>
            <span className="gr-arrow gt-worry-arrow">
              <Arrow s={20} />
            </span>
          </Link>
        </div>
      </section>

      {/* ================= おすすめの整体院・サロン ================= */}
      <section className="gt-w gt-rec">
        <Reveal className="gt-rec-h">
          <svg viewBox="0 0 28 22" width="26" height="21" aria-hidden="true" className="gt-crown">
            <path d="M2 6.500 8 11l6-9 6 9 6-4.500L24 19H4L2 6.500Z" fill="#f2b21b" />
            <rect x="4" y="19.500" width="20" height="2" rx="1" fill="#e49a0e" />
          </svg>
          <h2 className="gr-min">おすすめの整体院・サロン</h2>
          <span>口コミ評価の高い、人気の整体院・サロンをご紹介します。</span>
        </Reveal>
        <Link href={SHOP_HREF} className="gt-rec-all gr-arrow-link">
          <span>すべて見る</span>
          <Arrow s={17} />
        </Link>
        <div className="gt-rec-grid" data-rv-group>
          {SHOPS.map((s, i) => (
            <div key={s.n} data-rv>
              <article className="gt-shop gr-lift gr-hov">
                <Link href={SHOP_HREF} className="gt-shop-a" aria-label={s.n}>
                  <span className="gt-shop-ph gr-zoom">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${T}/shop${i + 1}.webp`} width={232} height={95} alt="" loading="lazy" />
                  </span>
                  <span className="gt-shop-b">
                    <b className="gt-shop-n">{s.n}</b>
                    <span className="gt-shop-st">
                      <Pin w={8} h={10} c="#7a7e7a" />
                      東京都 渋谷駅 {s.st}
                    </span>
                    <span className="gt-shop-rt">
                      <Stars value={s.sv} size={11.5} />
                      <em>{s.v.toFixed(1)}</em>
                      <small>({s.c}件)</small>
                    </span>
                    <span className="gt-shop-tags">
                      {s.tags.map((t) => (
                        <i key={t}>{t}</i>
                      ))}
                    </span>
                  </span>
                </Link>
                <Heart className="gt-shop-heart" />
              </article>
            </div>
          ))}
          <div data-rv>
            <aside className="gt-guide gr-lift gr-hov">
              <Link href={GUIDE_HREF} aria-label="初めての方へ 使い方ガイド" className="gt-guide-a">
                <span className="gt-guide-h">
                  <svg viewBox="0 0 32 28" width="30" height="26" fill="none" stroke="#fff" strokeWidth="1.700" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
                    <path d="M16 6.500C12.500 4 7.500 3.500 3 4.500v18c4.500-1 9.500-.5 13 2 3.500-2.500 8.500-3 13-2v-18c-4.500-1-9.500-.5-13 2Z" />
                    <path d="M16 6.500v18" />
                  </svg>
                  <b>初めての方へ</b>
                </span>
                <span className="gt-guide-b gr-zoom">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${T}/guide.webp`} width={179} height={173} alt="" loading="lazy" />
                  <span className="gt-guide-t">
                    <small>マチノワ.Body Careの</small>
                    <b>使い方ガイド</b>
                  </span>
                  <span className="gt-guide-btn">
                    詳しく見る
                    <Arrow s={16} />
                  </span>
                </span>
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* ================= エリアから探す ================= */}
      <section className="gt-w gt-area-sec">
        <Reveal className="gt-area-h">
          <Pin w={13} h={19} c="#2c5439" />
          <h2 className="gr-min">エリアから探す</h2>
          <span>お住まいのエリアから整体院・サロンを探せます。</span>
        </Reveal>
        <div className="gt-area-grid" data-rv-group>
          {AREAS.map((a, i) => (
            <div key={a.n} data-rv>
              <Link href={SEARCH_HREF} className="gt-ac gr-lift gr-hov">
                <span className="gr-zoom gt-ac-ph">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${T}/area${i + 1}.webp`} width={234} height={84} alt="" loading="lazy" />
                </span>
                <span className="gt-ac-t">
                  <b>{a.n}</b>
                  <small>{a.e}</small>
                </span>
                <span className="gt-ac-ar gr-arrow">
                  <Arrow s={20} />
                </span>
              </Link>
            </div>
          ))}
          <div data-rv>
            <Link href={SEARCH_HREF} className="gt-map gr-lift gr-hov" data-scrollp>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="gt-map-img" src={`${T}/map.png`} width={114} height={122} alt="" loading="lazy" />
              <Pin w={16} h={24} c="#2c5439" />
              <span className="gt-map-t">
                <b>その他のエリア</b>
                <span>から探す</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <div className="gt-sprig gt-sprig--l" data-par="-0.04" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${T}/sprig-l.png`} width={134} height={80} alt="" />
      </div>
      <div className="gt-sprig gt-sprig--r" data-par="-0.03" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${T}/sprig-r.png`} width={72} height={272} alt="" />
      </div>

      {/* ================= 3 つの帯 ================= */}
      <section className="gt-w gt-bn-sec">
        <div className="gt-bn-grid" data-rv-group>
          <div data-rv>
            <Link href={GUIDE_HREF} className="gt-bn gt-bn--1 gr-lift gr-hov">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="gt-bn-img gr-zoom" src={`${T}/banner1.webp`} width={443} height={97} alt="" loading="lazy" />
              <span className="gt-bn-t">
                <span className="gt-bn-tag" style={{ color: "#2f5a3d" }}>
                  <Shield c="#2f7d4d" />
                  はじめての方へ
                </span>
                <b>失敗しないサロン選びのポイント</b>
                <small>
                  自分に合った施術を見つけるための
                  <br />
                  ヒントをご紹介します。
                </small>
              </span>
              <span className="gt-bn-ar gr-arrow">
                <Arrow s={13} />
              </span>
            </Link>
          </div>
          <div data-rv>
            <Link href={SCENE_HREF} className="gt-bn gt-bn--2 gr-lift gr-hov">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="gt-bn-img gr-zoom" src={`${T}/banner2.webp`} width={465} height={97} alt="" loading="lazy" />
              <span className="gt-bn-t">
                <span className="gt-bn-tag" style={{ color: "#d4476f" }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                    <g fill="#e8688a">
                      <circle cx="12" cy="6" r="4.500" />
                      <circle cx="18" cy="11" r="4.500" />
                      <circle cx="15.800" cy="18" r="4.500" />
                      <circle cx="8.200" cy="18" r="4.500" />
                      <circle cx="6" cy="11" r="4.500" />
                    </g>
                    <circle cx="12" cy="12" r="2.600" fill="#fff" />
                  </svg>
                  季節のおすすめ特集
                </span>
                <b>春の不調を整える</b>
                <small>
                  新生活で乱れがちな心とからだを
                  <br />
                  やさしくリセット。
                </small>
              </span>
            </Link>
          </div>
          <div data-rv>
            <Link href={GUIDE_HREF} className="gt-bn gt-bn--3 gr-lift gr-hov">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="gt-bn-img gr-zoom" src={`${T}/banner3.webp`} width={438} height={97} alt="" loading="lazy" />
              <span className="gt-bn-t">
                <span className="gt-bn-tag" style={{ color: "#8a4b2c" }}>
                  <Shield c="#a65b36" />
                  お役立ちコラム
                </span>
                <b>からだと暮らしを整えるヒント</b>
                <small>
                  専門家監修のコラムで、
                  <br />
                  日々のセルフケアに役立つ情報をお届け。
                </small>
              </span>
              <span className="gt-bn-ar gr-arrow">
                <Arrow s={13} />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
