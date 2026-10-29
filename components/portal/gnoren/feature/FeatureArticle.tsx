/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import FeatureReveal from "./FeatureReveal";
import { PinIcon, PhoneIcon, ClockIcon, ShopIcon, ArrowIcon, BowlIcon, LeafLine } from "./icons";
import Jp from "./Jp";
import "./feature.css";

// 店の特集記事(見本 4)。いまは見本の仮の中身をそのまま入れた 1:1 再現。本物のデータへの置き換えは後。
// PC は見本の座標どおりの絶対配置(--u = 見本の 1 画素)、≤768px は縦 1 列(読む順)。座標は feature.css。
const IMG = "/_portal/gnoren/feature";
const SHOP_HREF = "/proto-gourmet/n/shop/sample";

/** メモ紙の手書き風の行。行ごとに少しずつ右へずらす(--i = ずらし量の倍率)。 */
function Lines({ t, className }: { t: string[]; className?: string }) {
  return (
    <p className={className}>
      {t.map((x, i) => (
        <span key={i} className="gn-feat-ln" style={{ ["--i" as string]: i }}>
          {x}
        </span>
      ))}
    </p>
  );
}

export default function FeatureArticle() {
  return (
    <main className="gn-feat" id="gn-feat-root">
      <FeatureReveal rootId="gn-feat-root" />

      {/* ───────── ヒーロー ───────── */}
      <header className="gn-feat-hero">
        <img className="gn-feat-hero-img" src={`${IMG}/hero.webp`} alt="あかり食堂の店先。木の格子の入口に生成りの暖簾、黒板の看板、緑の葉。" width={1876} height={890} />
        <img className="gn-feat-hero-img-m" src={`${IMG}/hero-m.webp`} alt="" aria-hidden="true" width={996} height={776} />

        <nav className="gn-feat-crumb" aria-label="パンくず">
          <Link href="/proto-gourmet/n">トップ</Link>
          <i aria-hidden="true">&gt;</i>
          <Link href="/proto-gourmet/n/feature">特集</Link>
          <i aria-hidden="true">&gt;</i>
          <span aria-current="page">あかり食堂</span>
        </nav>

        <div className="gn-feat-card">
          <div className="gn-feat-card-bg gn-feat-grain" aria-hidden="true" />
          <span className="gn-feat-tag" data-rv="note" style={{ ["--rot" as string]: "-9.5deg" }}>
            <span className="gn-feat-tag-in">特集</span>
          </span>
          <p className="gn-feat-lead">街の、あたたかな食卓を訪ねて</p>
          <h1 className="gn-feat-title">あかり食堂</h1>
          <p className="gn-feat-sub">
            やさしい味が、
            <br />
            この街の日常を照らす。
          </p>
          <p className="gn-feat-intro">
            <Jp t={"駅から続く商店街の一角に、いつもあたたかな灯りがともる\n「あかり食堂」。旬の食材を使った丁寧な料理と、\n人のぬくもりがつまったこの店は、訪れる人の心とお腹を満たし、\n街の日常にやさしく寄り添っています。"} />
          </p>
          <time className="gn-feat-date" dateTime="2024-06-15">
            2024.06.15
          </time>
        </div>

        <div className="gn-feat-panel">
          <div className="gn-feat-panel-bg gn-feat-grain" aria-hidden="true" />
          <p className="gn-feat-script gn-script" aria-label="Good Food, Good People, Good Town">
            <span>Good Food</span>
            <span>Good People</span>
            <span>Good Town</span>
          </p>
          <div className="gn-feat-strips">
            <p className="gn-feat-strip gn-feat-strip-a" data-rv>食でつながる</p>
            <p className="gn-feat-strip gn-feat-strip-b" data-rv>あたたかな場所が</p>
            <p className="gn-feat-strip gn-feat-strip-c" data-rv>ここにある。</p>
          </div>
          <img className="gn-feat-town" src={`${IMG}/townscape.webp`} alt="" aria-hidden="true" width={444} height={306} />
        </div>
      </header>

      {/* ───────── 01 こだわり ───────── */}
      <section className="gn-feat-sec gn-feat-s1" aria-labelledby="gn-feat-h1">
        <div className="gn-feat-copy gn-feat-copy-1" data-rv>
          <p className="gn-feat-head">
            <span className="gn-feat-num">01</span>
            <span className="gn-feat-rule" aria-hidden="true" />
            <span className="gn-feat-label">こだわり</span>
          </p>
          <h2 className="gn-feat-h" id="gn-feat-h1">
            旬を味わう、
            <br />
            季節のやさしいごはん。
          </h2>
          <p className="gn-feat-body">
            <Jp t={"あかり食堂の料理は、地元の旬の食材をふんだんに使い、\nひとつひとつ丁寧に手づくりされています。派手さはないけれど、\n素材の持ち味を生かしたやさしい味わいが、訪れる人の心をつかみます。\n季節ごとに変わるメニューは、何度訪れても新しいおいしさに出会える\n楽しみがあります。"} />
          </p>
        </div>
        <figure className="gn-feat-ph gn-feat-cook" data-rv>
          <img src={`${IMG}/cook.webp`} alt="お皿に旬の野菜と焼き魚を盛りつける手元" width={716} height={488} loading="lazy" />
        </figure>
        <figure className="gn-feat-ph gn-feat-bowl" data-rv>
          <img src={`${IMG}/bowl.webp`} alt="季節の野菜を盛った小鉢" width={328} height={366} loading="lazy" />
        </figure>
        <figure className="gn-feat-ph gn-feat-stew" data-rv>
          <img src={`${IMG}/stew.webp`} alt="湯気の立つ根菜の煮物" width={334} height={366} loading="lazy" />
        </figure>
        <aside className="gn-feat-note gn-feat-n1 gn-feat-t1" data-rv="note" style={{ ["--rot" as string]: "-4deg" }}>
          <div className="gn-feat-paper gn-feat-grain">
            <Lines t={["その季節に、", "いちばんおいしいものを。"]} />
          </div>
        </aside>
      </section>

      {/* ───────── 02 つくり手の想い ───────── */}
      <section className="gn-feat-sec gn-feat-s2" aria-labelledby="gn-feat-h2">
        <div className="gn-feat-copy gn-feat-copy-2" data-rv>
          <p className="gn-feat-head">
            <span className="gn-feat-num">02</span>
            <span className="gn-feat-rule" aria-hidden="true" />
            <span className="gn-feat-label">つくり手の想い</span>
          </p>
          <h2 className="gn-feat-h" id="gn-feat-h2">
            食を通して、
            <br />
            この街の人を元気にしたい。
          </h2>
          <p className="gn-feat-body">
            <Jp t={"店主の佐藤さんは、地元で生まれ育ち、長年都内の料理店で腕を磨いた後、\nこの街に戻り、あかり食堂を開きました。「食は人を元気にする」という\n想いを胸に、今日も厨房に立ち、訪れる人の笑顔のために\n料理をつくり続けています。"} />
          </p>
        </div>
        <figure className="gn-feat-ph gn-feat-chef" data-rv>
          <img src={`${IMG}/chef.webp`} alt="ねじり鉢巻きで厨房に立ち、丁寧に料理をする店主" width={868} height={482} loading="lazy" />
        </figure>
        <div className="gn-feat-owner gn-feat-t2" data-rv>
          <div className="gn-feat-owner-bg gn-feat-grain" aria-hidden="true" />
          <p className="gn-feat-owner-name">
            <span className="gn-feat-owner-tag">店主</span>
            <span className="gn-feat-owner-n">佐藤 健一</span>
            <span className="gn-feat-owner-s">さん</span>
          </p>
          <p className="gn-feat-owner-text">
            <Jp t={"地元・マチノワで生まれ育ち、\n料理の道へ。素材の力を大切にした\nやさしい味わいで、地域の人々に\n愛される食堂を営む。\n「この街の食卓のような存在で\nありたい」と語る。"} />
          </p>
        </div>
        <aside className="gn-feat-note gn-feat-n2 gn-feat-t2" data-rv="note" style={{ ["--rot" as string]: "-6deg" }}>
          <div className="gn-feat-paper gn-feat-grain">
            <Lines className="gn-feat-quote" t={["「おいしいね」のひと言が、", "私の原動力です。"]} />
            <p className="gn-feat-sign">― 佐藤 健一さん</p>
          </div>
        </aside>
      </section>

      {/* ───────── 03 お店の空間 ───────── */}
      <section className="gn-feat-sec gn-feat-s3" aria-labelledby="gn-feat-h3">
        <div className="gn-feat-copy gn-feat-copy-3" data-rv>
          <p className="gn-feat-head">
            <span className="gn-feat-num">03</span>
            <span className="gn-feat-rule" aria-hidden="true" />
            <span className="gn-feat-label">お店の空間</span>
          </p>
          <h2 className="gn-feat-h" id="gn-feat-h3">
            ほっとする、
            <br />
            あたたかな時間が流れる場所。
          </h2>
          <p className="gn-feat-body">
            <Jp t={"木のぬくもりが感じられる店内は、カウンター席とテーブル席があり、\nひとりでも、家族でも、友人同士でも、誰もがくつろげる空間です。\n大きな窓から差し込むやわらかな光と、やさしい音楽、そしておいしい\n料理が、日常の忙しさを忘れさせてくれます。"} />
          </p>
        </div>
        <figure className="gn-feat-ph gn-feat-hall" data-rv>
          <img src={`${IMG}/hall.webp`} alt="大きな窓と吊り下げ灯のある、木のぬくもりの店内" width={560} height={362} loading="lazy" />
        </figure>
        <figure className="gn-feat-ph gn-feat-vase" data-rv>
          <img src={`${IMG}/vase.webp`} alt="窓辺の花器と草花" width={210} height={362} loading="lazy" />
        </figure>
        <figure className="gn-feat-ph gn-feat-flower" data-rv>
          <img src={`${IMG}/flower.webp`} alt="テーブルに飾られた花と湯のみ" width={210} height={362} loading="lazy" />
        </figure>
        <figure className="gn-feat-ph gn-feat-board" data-rv>
          <img src={`${IMG}/board.webp`} alt="「たべる つながる また、きたくなる あかり食堂」と書かれた黒板" width={284} height={362} loading="lazy" />
        </figure>
        <aside className="gn-feat-note gn-feat-n3 gn-feat-t3" data-rv="note" style={{ ["--rot" as string]: "-6deg" }}>
          <div className="gn-feat-paper gn-feat-grain">
            <Lines t={["あたたかな", "灯りがつくる、", "やさしい時間。"]} />
          </div>
        </aside>
      </section>

      {/* ───────── 下の帯 ───────── */}
      <section className="gn-feat-sec gn-feat-band" aria-label="お店の情報">
        <div className="gn-feat-band-bg gn-feat-grain" aria-hidden="true" />
        <figure className="gn-feat-ph gn-feat-teishoku" data-rv>
          <img src={`${IMG}/teishoku.webp`} alt="焼き魚と小鉢の並ぶ、季節の定食" width={1094} height={364} loading="lazy" />
        </figure>
        <aside className="gn-feat-note gn-feat-n4 gn-feat-t4" data-rv="note" style={{ ["--rot" as string]: "-6.5deg" }}>
          <div className="gn-feat-paper gn-feat-grain">
            <Lines t={["あかり食堂の", "おすすめ", "季節の定食"]} />
            <LeafLine className="gn-feat-leafline" />
          </div>
        </aside>
        <p className="gn-feat-teishoku-copy" data-rv>
            <Jp t={"季節の食材を少しずつ、\n丁寧に仕立てた定食です。\nその時期ならではの味わいを、\nぜひお楽しみください。"} />
          </p>

        <div className="gn-feat-shop" data-rv>
          <p className="gn-feat-shop-label">店舗情報</p>
          <p className="gn-feat-shop-name">
            <BowlIcon className="gn-feat-shop-bowl" />
            <span>あかり食堂</span>
          </p>
          <ul className="gn-feat-shop-list">
            <li className="gn-feat-r-addr">
              <PinIcon className="gn-feat-ic" />
              <span>東京都マチノワ市中央町1-2-3</span>
            </li>
            <li className="gn-feat-r-tel">
              <PhoneIcon className="gn-feat-ic" />
              <a href="tel:0312345678">03-1234-5678</a>
            </li>
            <li className="gn-feat-r-hours">
              <ClockIcon className="gn-feat-ic" />
              <span>
                11:30 - 14:30 (L.O. 14:00)
                <br />
                17:00 - 21:00 (L.O. 20:30)
              </span>
            </li>
            <li className="gn-feat-r-off">
              <ShopIcon className="gn-feat-ic" />
              <span>水曜日定休</span>
            </li>
          </ul>
          <Link href={SHOP_HREF} className="gn-feat-btn">
            <span>店舗の詳細を見る</span>
            <ArrowIcon className="gn-feat-btn-arrow" />
          </Link>
        </div>
        <figure className="gn-feat-frame" data-rv>
          <img src={`${IMG}/shopfront.webp`} alt="あかり食堂の外観。生成りの暖簾と木の入口。" width={326} height={314} loading="lazy" />
        </figure>

        <aside className="gn-feat-note gn-feat-n5 gn-feat-t5" data-rv="note" style={{ ["--rot" as string]: "-11deg" }}>
          <div className="gn-feat-paper gn-feat-grain">
            <Lines t={["また、", "食べに行きたくなる", "あの味がある。"]} />
          </div>
        </aside>
        <img className="gn-feat-leaf gn-feat-leaf-tr" src={`${IMG}/leaf-tr.webp`} alt="" aria-hidden="true" width={202} height={280} />
        <img className="gn-feat-leaf gn-feat-leaf-bl" src={`${IMG}/leaf-bl.webp`} alt="" aria-hidden="true" width={140} height={256} />
      </section>
    </main>
  );
}
