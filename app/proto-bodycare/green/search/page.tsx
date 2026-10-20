import type { CSSProperties } from "react";
import Link from "next/link";
import { MaskLines, Write, CountUp, Stars, Heart } from "@/components/portal/bcproto/green/common/Motion";
import { BASE, SEARCH_HREF, SHOP_HREF, IMG } from "@/components/portal/bcproto/green/common/site";
import Filters, { SortSelect } from "@/components/portal/bcproto/green/search/Filters";
import "@/components/portal/bcproto/green/search/search.css";

// 探すページ(見本 mock-search の完全再現)。店・評価・料金・文章は見本の仮の内容のまま。
const S = `${IMG}/search`;

const KEYWORDS: Array<[string, number]> = [
  ["肩こり", 68], ["腰痛", 60], ["マッサージ", 92], ["骨盤矯正", 76], ["猫背矯正", 78], ["産後ケア", 78],
  ["鍼灸", 57], ["美容鍼", 73], ["ヘッドスパ", 89], ["もみほぐし", 86], ["ストレッチ", 90], ["姿勢改善", 77],
];

type Card = {
  name: string; walk: string; subs: string[]; rate: number; n: number; tags: string[]; desc: [string, string];
  tw: number[]; stars: number; badge: string; tone: "amber" | "rose"; plan: string; price: string;
  // 見本の縦の位置(写真の上端から。mock px)
  g: { ph: number; ty: number; ay: number; sy: number; gy: number; d1: number; tt: number; th: number; bt: number; bh: number; bc: number; pc: number; prc: number; btn: number; ch: number; mb: number; tf: number };
};

const CARDS: Card[] = [
  {
    name: "マチノワ整体院 渋谷本院", walk: "渋谷駅徒歩3分", subs: ["東急プラザ渋谷の裏手", "平日21時まで"], rate: 4.8, n: 128,
    tags: ["整体", "骨盤矯正", "姿勢改善", "肩こり", "腰痛", "猫背矯正"],
    desc: ["ひとりひとりの姿勢や生活習慣に合わせたオーダーメイドの施術で、", "根本からの改善を目指します。"],
    tw: [44.4, 64.4, 66.7, 55.6, 45.6, 66.2], stars: 4.5, badge: "初回限定", tone: "amber", plan: "全身整体コース 60分", price: "3,980",
    g: { ph: 162, ty: 15.6, ay: 42.5, sy: 64, gy: 91, d1: 122.5, tt: 3, th: 61, bt: 71, bh: 87.5, bc: 12.5, pc: 36.9, prc: 63.75, btn: 44, ch: 174, mb: 2, tf: 18.1 },
  },
  {
    name: "はる鍼灸院 渋谷院", walk: "渋谷駅徒歩5分", subs: ["道玄坂1丁目", "国家資格者が対応"], rate: 4.7, n: 86,
    tags: ["鍼灸", "美容鍼", "自律神経", "肩こり", "腰痛", "冷え・むくみ"],
    desc: ["東洋医学に基づいたやさしい鍼灸で、からだの内側から整えます。", "女性の不調や美容のお悩みにもご相談ください。"],
    tw: [45.6, 56.3, 66.3, 55, 46, 83.7], stars: 4.5, badge: "人気No.1", tone: "rose", plan: "美容鍼+全身調整 60分", price: "6,500",
    g: { ph: 161, ty: 17.7, ay: 43, sy: 67, gy: 94, d1: 126, tt: 3, th: 63, bt: 73, bh: 84.7, bc: 15, pc: 37, prc: 63.5, btn: 42, ch: 173, mb: 5, tf: 18.5 },
  },
  {
    name: "渋谷カラダバランス接骨院", walk: "渋谷駅徒歩4分", subs: ["土日営業", "スポーツの不調にも対応"], rate: 4.6, n: 92,
    tags: ["接骨院・整骨院", "整体", "スポーツ整体", "腰痛", "肩こり", "姿勢改善"],
    desc: ["痛みの早期改善と再発予防を目指し、日常生活やスポーツでの", "パフォーマンス向上をサポートします。"],
    tw: [82.5, 45, 80, 40.6, 45.6, 62], stars: 4.5, badge: "平日限定", tone: "amber", plan: "姿勢改善整体 60分", price: "4,200",
    g: { ph: 156, ty: 17, ay: 44.7, sy: 66, gy: 93.5, d1: 122, tt: 2, th: 61, bt: 70.4, bh: 85.6, bc: 13.6, pc: 37.5, prc: 62.6, btn: 42, ch: 168, mb: 2, tf: 17 },
  },
  {
    name: "リラクゼーションサロン 紬 -TSUMUGI-", walk: "渋谷駅徒歩6分", subs: ["完全個室", "女性専用サロン"], rate: 4.5, n: 104,
    tags: ["マッサージ", "リンパ", "ヘッドスパ", "アロマ", "むくみ", "疲労回復"],
    desc: ["アロマの香りに包まれた落ち着いた空間で、心とからだをゆるめる", "リラクゼーションタイムをお届けします。"],
    tw: [69.4, 45, 70.6, 53.8, 50.6, 64.4], stars: 5, badge: "女性に人気", tone: "rose", plan: "アロマリンパ 90分", price: "7,800",
    g: { ph: 134, ty: 14.7, ay: 39.7, sy: 60, gy: 86, d1: 111.6, tt: 3, th: 52, bt: 61, bh: 75, bc: 11, pc: 32, prc: 55, btn: 33, ch: 146, mb: 0, tf: 16 },
  },
];

const Pin = () => (
  <svg className="gs-pin" viewBox="4 1 16 22" width="11" height="15" aria-hidden="true">
    <path d="M12 22.5s-7.2-6.3-7.2-12A7.2 7.2 0 0 1 19.2 10.5c0 5.7-7.2 12-7.2 12z" fill="#2f7a4d" />
    <circle cx="12" cy="10.2" r="2.7" fill="#fff" />
  </svg>
);
const Arrow = ({ w = 16 }: { w?: number }) => (
  <svg viewBox="0 0 22 10" width={w} height={(w * 10) / 22} aria-hidden="true">
    <path d="M1 5h19M16 1l4.4 4L16 9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Page() {
  return (
    <div data-gr-page="search" className="gs-page">
      <div className="gs-w">
        {/* 端の若葉(見本から切り出し。スクロールと一緒に動く) */}
        <div className="gs-eg gs-eg-l gr-sway" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${S}/edge-l2.webp`} alt="" width={44} height={330} />
        </div>
        <div className="gs-eg gs-eg-r gr-sway" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${S}/edge-r2.webp`} alt="" width={52} height={300} />
        </div>

        {/* ---------- ヒーロー ---------- */}
        <section className="gs-hero" aria-labelledby="gs-h1">
          <div className="gs-hero-bg" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${S}/hero.webp`} alt="" width={1448} height={356} className="gs-kb" fetchPriority="high" />
          </div>
          <div className="gs-sprig gs-sprig-a gr-sway" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${S}/sprig-a.webp`} alt="" width={104} height={90} />
          </div>
          <div className="gs-sprig gs-sprig-b gr-sway" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${S}/sprig-b.webp`} alt="" width={80} height={92} />
          </div>

          <nav className="gs-crumb" aria-label="パンくず">
            <Link href={BASE}>トップ</Link>
            <Link href={SEARCH_HREF}>東京都</Link>
            <Link href={SEARCH_HREF}>渋谷エリア</Link>
            <span aria-current="page">整体院・接骨院・鍼灸院</span>
          </nav>
          <h1 id="gs-h1" className="gs-h1">
            <MaskLines lines={["渋谷エリアの", "整体院・接骨院・鍼灸院"]} as="span" step={140} delay={120} />
          </h1>
          <p className="gs-lead">
            <span data-rv="fade" style={{ ["--d" as string]: "700ms" } as CSSProperties}>
              渋谷エリアで、からだの不調をケアできる整体院・接骨院・鍼灸院を探せます。
              <br />
              あなたにぴったりの院・サロンを見つけて、心もからだも軽やかな毎日を。
            </span>
          </p>
          <Write className="gr-hand gs-hand" lines={["こころも、", "からだも、", "軽やかに。"]} delay={900} step={520} as="p" />
          <div className="gs-badge gr-pop gr-float" aria-hidden="true">
            <span>
              渋谷で
              <br />
              見つける
              <br />
              わたしに合う
              <br />
              整える時間
            </span>
          </div>

          <form className="gs-panel" action={SEARCH_HREF} method="get" role="search">
            <label className="gs-area">
              <svg viewBox="0 0 24 24" width="19" height="22" aria-hidden="true" className="gs-area-pin">
                <path d="M12 22.5s-7.2-6.3-7.2-12A7.2 7.2 0 0 1 19.2 10.5c0 5.7-7.2 12-7.2 12z" fill="#26324b" />
                <circle cx="12" cy="10.2" r="2.7" fill="#fff" />
              </svg>
              <select name="area" defaultValue="shibuya" aria-label="エリア">
                <option value="shibuya">渋谷エリア</option>
                <option value="shinjuku">新宿エリア</option>
                <option value="ikebukuro">池袋エリア</option>
              </select>
              <svg viewBox="0 0 10 6" width="11" height="7" aria-hidden="true" className="gs-area-ch">
                <path d="m1 1 4 4 4-4" fill="none" stroke="#26324b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </label>
            <div className="gs-find">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="gs-find-ic">
                <circle cx="10.4" cy="10.4" r="7" fill="none" stroke="#26324b" strokeWidth="2" />
                <path d="m15.6 15.6 5.2 5.2" stroke="#26324b" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input type="text" name="q" placeholder="駅名・サロン名・お悩みなどで検索" aria-label="キーワード" />
              <button type="submit" className="gs-go gr-press gr-shimmer">
                <span>検索する</span>
                <Arrow w={22} />
              </button>
            </div>
          </form>

          <div className="gs-kw">
            <span className="gs-kw-l">注目のキーワード</span>
            <ul>
              {KEYWORDS.map(([k, w]) => (
                <li key={k} style={{ ["--w" as string]: w } as CSSProperties}>
                  <Link href={SEARCH_HREF} className="gr-chip">
                    {k}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- 本体 ---------- */}
        <div className="gs-body">
          <Filters />

          <section className="gs-res" aria-label="検索結果">
            <div className="gs-rh" data-rv="fade">
              <h2 className="gs-count">
                <span className="gs-count-t">検索結果</span>
                <CountUp to={128} className="gs-count-n" />
                <span className="gs-count-u">件</span>
              </h2>
              <div className="gs-rh-r">
                <Link href={SEARCH_HREF} className="gs-map gr-press">
                  <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" className="gr-draw">
                    <path d="M3.6 6.2 9 4l6 2.2 5.4-2.2v13.8L15 20l-6-2.2-5.4 2.2z M9 4v13.8 M15 6.2V20" fill="none" stroke="#2f5a3d" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                  <span>地図で見る</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${S}/map.webp`} alt="" width={70} height={31} className="gs-map-i" />
                </Link>
                <span className="gs-sort-l">並び替え</span>
                <SortSelect />
              </div>
            </div>

            <ul className="gs-cards" data-rv-group>
              {CARDS.map((c, i) => {
                const g = c.g;
                const st = {
                  ["--ph" as string]: g.ph, ["--ty" as string]: g.ty, ["--ay" as string]: g.ay, ["--sy" as string]: g.sy, ["--gy" as string]: g.gy,
                  ["--d1" as string]: g.d1, ["--tt" as string]: g.tt, ["--th" as string]: g.th, ["--bt" as string]: g.bt, ["--bh" as string]: g.bh,
                  ["--bc" as string]: g.bc, ["--pc" as string]: g.pc, ["--prc" as string]: g.prc, ["--btn" as string]: g.btn, ["--ch" as string]: g.ch, ["--mb" as string]: g.mb, ["--tf" as string]: g.tf,
                } as CSSProperties;
                return (
                  <li key={c.name} data-rv>
                    <article className="gs-card gr-lift gr-hov" style={st}>
                      <Link href={SHOP_HREF} className="gs-card-link" aria-label={`${c.name}の詳細`} />
                      <div className="gs-ph gr-zoom">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`${S}/shop${i + 1}.webp`} alt="" width={295} height={g.ph} loading={i === 0 ? "eager" : "lazy"} />
                      </div>
                      <Heart className="gs-heartb" label={`${c.name}をお気に入りに追加`} size={22} />
                      <div className="gs-bd">
                        <h3 className="gs-nm">{c.name}</h3>
                        <p className="gs-ac">
                          <Pin />
                          <span>{c.walk}</span>
                          {c.subs.map((s) => (
                            <span key={s} className="gs-sep">
                              {s}
                            </span>
                          ))}
                        </p>
                        <p className="gs-rt">
                          <Stars value={c.stars} size={15} />
                          <b>{c.rate.toFixed(1)}</b>
                          <small>({c.n}件)</small>
                        </p>
                        <ul className="gs-tg">
                          {c.tags.map((t, k) => (
                            <li key={t} style={{ ["--tw" as string]: c.tw[k] } as CSSProperties}>
                              {t}
                            </li>
                          ))}
                        </ul>
                        <p className="gs-ds">
                          {c.desc[0]}
                          <br />
                          {c.desc[1]}
                        </p>
                      </div>
                      <div className="gs-rp">
                        <div className="gs-th">
                          {[1, 2, 3].map((j) => (
                            <span key={j} className="gr-zoom">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={`${S}/th${i + 1}-${j}.webp`} alt="" width={93} height={g.th} loading="lazy" />
                            </span>
                          ))}
                        </div>
                        <div className="gs-bx">
                          <span className={`gs-bg gs-bg--${c.tone}`}>{c.badge}</span>
                          <p className="gs-pl">{c.plan}</p>
                          <p className="gs-pr">
                            <b>{c.price}</b>
                            <i>円</i>
                            <small>(税込)</small>
                          </p>
                          <span className="gs-bk gr-press gr-shimmer">
                            空き状況を見る
                            <span className="gs-bk-a">
                              <Arrow w={15} />
                            </span>
                          </span>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>

            <nav className="gs-pager" aria-label="ページ送り" data-rv="fade">
              {["1", "2", "3", "4", "5"].map((p, i) => (
                <Link key={p} href={SEARCH_HREF} className={`gs-pg gr-press ${i === 0 ? "is-on" : ""}`} aria-current={i === 0 ? "page" : undefined}>
                  {p}
                </Link>
              ))}
              <span className="gs-pg-d">…</span>
              <Link href={SEARCH_HREF} className="gs-pg gs-pg--next gr-press">
                次へ
                <Arrow w={14} />
              </Link>
            </nav>
          </section>
        </div>
      </div>
    </div>
  );
}
