import Link from "next/link";
import Logo from "../common/Logo";
import { IconArrow, IconPin } from "../common/Icons";
import { Heart, CountUp, MaskLines, Write, FillHeading, PawTrail } from "../common/Motion";
import { IMG_SEARCH, SEARCH_HREF, SHOP_HREF, ARTICLES_HREF, BASE } from "../common/site";
import { FilterBar, SearchBox, SortSelect } from "./Controls";
import { MapPin } from "./SearchIcons";
import HeroScroll from "./HeroScroll";
import { AREAS, CARDS, FILTERS, POPULAR } from "./data";
import { IconInstagram, IconFacebook, IconX } from "../common/Icons";

/** 探すページ(見本の完全再現)の中身。デスクトップは 948 幅の見本の座標をそのまま置く(--u)。スマホは search.css が縦積みに組み替える。 */

// 地図のピン(見本の位置。地図の左上が原点。見本 948 幅の px)
const PINS = [
  { name: "東京", x: 164.1, y: 37.5, ly: 68.8 },
  { name: "鎌倉", x: 66.6, y: 72, ly: 102.8 },
  { name: "横浜", x: 155.1, y: 110, ly: 141.8 },
];

export function Hero() {
  return (
    <>
      <section className="sr-hero pt-live" aria-label="お店を探す">
        {/* 写真は 2 層: 外側 = スクロールで寄りながら遅れて動く(視差)/ 内側 = ゆっくり寄り続ける(pt-kb)。先頭では見本どおり */}
        <div className="sr-hero-par">
          <img className="sr-hero-img pt-kb" src={`${IMG_SEARCH}/hero.webp`} width={948} height={224} alt="" fetchPriority="high" />
        </div>
        <div className="sr-hero-sh pt-shine" aria-hidden="true" />
        <h1 className="sr-h1-w">
          <MaskLines as="span" className="sr-h1" lines={["ペットと行ける", "おでかけ先を探す"]} step={170} delay={120} />
        </h1>
        <div className="sr-sub-w">
          <Write as="p" className="sr-sub" lines={["カフェ・レストラン・宿泊・ドッグラン・ショップなど", "愛犬と一緒に楽しめるスポットを見つけよう。"]} delay={650} step={520} />
        </div>
      </section>
      <HeroScroll target=".sr-hero" />
      <div className="sr-boxw pt-live">
        <SearchBox />
      </div>
    </>
  );
}

export function Cards() {
  return (
    <div className="sr-cards pt-skew" data-skew="0.5">
      {CARDS.map((c, i) => {
        const d = (i % 3) * 120; // 列ごとに少しずつずらす(行は画面に入った順)
        return (
          <article key={c.id} className="sr-card io pt-lift pt-tilt" data-tilt="5" style={{ ["--d" as string]: `${d}ms`, ["--c" as string]: `${d}ms` }}>
            <Link href={SHOP_HREF} className="sr-card-a" aria-label={`${c.name}を見る`} />
            <div className="sr-photo pt-zoom">
              <div className="sr-photo-w pt-wipe" data-wipe={i % 2 ? "right" : "left"} style={{ ["--d" as string]: `${d + 160}ms` }}>
                <img src={`${IMG_SEARCH}/card${c.id}.webp`} alt="" width={190} height={133} loading={c.id <= 3 ? "eager" : "lazy"} />
              </div>
              <i className="pt-tilt-glare" aria-hidden="true" />
              <Heart className="sr-heart pt-popin" label={`${c.name}をお気に入りに追加`} size={17} />
            </div>
            <h3 className="sr-card-t">{c.name}</h3>
            <p className="sr-card-cat">
              <span className="sr-cat">{c.cat}</span>
            </p>
            <p className="sr-card-pl">
              <IconPin className="sr-card-pin" />
              <span>{c.place}</span>
            </p>
            <p className="sr-card-d">
              <span>{c.desc[0]}</span>
              <span>{c.desc[1]}</span>
            </p>
            <ul className="sr-card-tags">
              {c.tags.map((t) => (
                <li key={t} className="sr-tag">
                  {t}
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}

export function Side() {
  return (
    <aside className="sr-side io pt-bgshift pt-skew" data-io="right" data-skew="0.45" style={{ ["--bg-to" as string]: "#faf8f6", ["--bg-from" as string]: "#efe7db" }} aria-label="ほかの探し方">
      <section className="sr-sd sr-sd-map" aria-labelledby="sr-map-h">
        <h2 id="sr-map-h" className="sr-sd-h">
          <span className="pt-fill" data-from="1.05" data-to="0.9">
            地図から探す
          </span>
        </h2>
        <Link href={SEARCH_HREF} className="pt-more sr-sd-more">
          <span>地図を大きく見る</span>
          <IconArrow />
        </Link>
        <div className="sr-map" data-scrollp>
          <div className="sr-map-clip">
            <img className="sr-map-img" src={`${IMG_SEARCH}/map.webp`} width={240} height={199} alt="" loading="lazy" />
          </div>
          {PINS.map((p, i) => (
            <Link key={p.name} href={SEARCH_HREF} className="sr-pin pt-press pt-popin" style={{ ["--x" as string]: p.x, ["--y" as string]: p.y, ["--ly" as string]: p.ly, ["--d" as string]: `${500 + i * 170}ms` }} aria-label={`${p.name}のお店を探す`}>
              <MapPin className="sr-pin-i" />
              <span className="sr-pin-l">{p.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="sr-sd sr-sd-area" aria-labelledby="sr-area-h">
        <h2 id="sr-area-h" className="sr-sd-h">
          <span className="pt-fill">エリアから探す</span>
        </h2>
        <Link href={BASE + "#pt-area"} className="pt-more sr-sd-more">
          <span>すべてのエリアを見る</span>
          <IconArrow />
        </Link>
        <ul className="sr-areas">
          {AREAS.map((a, i) => (
            <li key={a.en} className={`sr-area sr-area${i + 1} pt-popin`} style={{ ["--d" as string]: `${(i % 3) * 90 + Math.floor(i / 3) * 140}ms` }}>
              <Link href={SEARCH_HREF} className="pt-hov">
                <span className="sr-area-p pt-zoom">
                  <img src={`${IMG_SEARCH}/${a.img}.webp`} width={68} height={68} alt="" loading="lazy" />
                </span>
                <span className="sr-area-jp">{a.jp}</span>
                <span className="sr-area-en">{a.en}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="sr-sd sr-sd-pop" aria-labelledby="sr-pop-h">
        <h2 id="sr-pop-h" className="sr-sd-h">
          <span className="pt-fill">よく使われる条件で探す</span>
        </h2>
        <ul className="sr-chips">
          {POPULAR.map((t, i) => (
            <li key={t} className={`sr-chipw sr-chipw${i + 1} pt-popin`} style={{ ["--d" as string]: `${i * 90}ms` }}>
              <Link href={SEARCH_HREF} className="pt-chip sr-chip pt-press">
                {t}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="sr-feat pt-hov io" data-io="zoom" style={{ ["--d" as string]: "120ms" }} aria-labelledby="sr-feat-h">
        <img className="sr-feat-img pt-scale-scroll" style={{ ["--ss" as string]: 0.14 }} src={`${IMG_SEARCH}/feature.webp`} width={237} height={204} alt="" loading="lazy" />
        <h2 id="sr-feat-h" className="sr-feat-t">
          特集から探す
        </h2>
        <p className="sr-feat-d">
          <span>季節のおでかけやエリア特集など</span>
          <span>おすすめのスポットをチェック。</span>
        </p>
        <Link href={ARTICLES_HREF} className="sr-feat-btn pt-press pt-magnet">
          <span>特集を見る</span>
          <IconArrow />
        </Link>
      </section>
    </aside>
  );
}

export function Crumb() {
  return (
    <nav className="sr-crumb io" data-io="left" aria-label="パンくず">
      <Link href={BASE}>ホーム</Link>
      <svg viewBox="0 0 8 12" aria-hidden="true" className="sr-crumb-s">
        <path d="m1.8 1.5 4.4 4.5-4.4 4.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span aria-current="page">検索結果</span>
    </nav>
  );
}

export function ResultHead() {
  return (
    <div className="sr-rh" id="sr-results">
      <h2 className="sr-rh-t">
        <FillHeading as="span" className="sr-rh-jp" start={1.05} end={0.9}>
          検索結果
        </FillHeading>
        <span className="sr-rh-n">
          <CountUp to={1248} className="sr-rh-num" />
          <span className="sr-rh-u">件</span>
        </span>
      </h2>
      <PawTrail count={7} direction="right" size={12} gap="calc(8 * var(--u))" className="sr-trail-h" />
      <SortSelect />
    </div>
  );
}

export function SearchFooter() {
  const area = ["東京", "神奈川", "千葉", "埼玉", "山梨", "静岡"];
  return (
    <footer className="sr-foot">
      <div className="sr-fband pt-live">
        <img className="sr-fband-img pt-kb" src={`${IMG_SEARCH}/foot-band.webp`} width={948} height={76} alt="" loading="lazy" />
        <p className="sr-ftag pt-blurin">ペットと、この街で、もっと豊かに。</p>
        <Link href={BASE} className="sr-flogo" aria-label="マチノワPet トップ">
          <Logo className="sr-flogo-l" />
        </Link>
        <a href="#" className="sr-fabout pt-press pt-hov pt-magnet">
          <span>マチノワPetについて</span>
          <IconArrow />
        </a>
      </div>
      <div className="sr-fbody pt-bgshift" data-from="1.02" data-to="0.9" style={{ ["--bg-to" as string]: "#fafaf8", ["--bg-from" as string]: "#f1ebe1" }}>
        <div className="sr-fcols" data-io-group>
          <nav className="sr-fc sr-fc1 io" aria-label="エリアから探す">
            <h3>エリアから探す</h3>
            <ul>
              {area.map((a) => (
                <li key={a}>
                  <Link href={SEARCH_HREF}>{a}</Link>
                </li>
              ))}
              <li className="sr-fc-more">
                <Link href={BASE + "#pt-area"}>その他のエリア</Link>
              </li>
            </ul>
          </nav>
          <nav className="sr-fc sr-fc2 io" aria-label="カテゴリから探す">
            <h3>カテゴリから探す</h3>
            <ul>
              <li>
                <Link href={SEARCH_HREF}>カフェ・飲食店</Link>
              </li>
              <li>
                <Link href={SEARCH_HREF}>ペットホテル・宿泊</Link>
              </li>
              <li>
                <Link href={SEARCH_HREF}>ドッグラン</Link>
              </li>
              <li>
                <Link href={SEARCH_HREF}>動物病院・クリニック</Link>
              </li>
              <li>
                <Link href={SEARCH_HREF}>ペット用品・ショップ</Link>
              </li>
              <li>
                <Link href={BASE + "#pt-category"}>その他のカテゴリ</Link>
              </li>
            </ul>
          </nav>
          <nav className="sr-fc sr-fc3 io" aria-label="マチノワPetについて">
            <h3>マチノワPetについて</h3>
            <ul>
              <li>
                <a href="#">マチノワPetとは</a>
              </li>
              <li>
                <a href="#">運営会社</a>
              </li>
              <li>
                <a href="#">お問い合わせ</a>
              </li>
            </ul>
          </nav>
          <div className="sr-fc sr-fc4 io">
            <h3>公式SNS</h3>
            <div className="sr-sns">
              <a href="#" aria-label="Instagram" className="sr-sns-a pt-press pt-magnet">
                <IconInstagram />
              </a>
              <a href="#" aria-label="X" className="sr-sns-a sr-sns-x pt-press pt-magnet">
                <IconX />
              </a>
              <a href="#" aria-label="Facebook" className="sr-sns-a pt-press pt-magnet">
                <IconFacebook />
              </a>
            </div>
          </div>
          <i className="sr-fdiv sr-fdiv1" aria-hidden="true" />
          <i className="sr-fdiv sr-fdiv2" aria-hidden="true" />
          <i className="sr-fdiv sr-fdiv3" aria-hidden="true" />
        </div>
        <p className="sr-copy">© 2024 マチノワPet. All rights reserved.</p>
        <p className="sr-legal">
          <a href="#">利用規約</a>
          <a href="#">プライバシーポリシー</a>
          <a href="#">サイトマップ</a>
        </p>
      </div>
    </footer>
  );
}

export function FilterRow() {
  return (
    <div className="sr-filters-w">
      <FilterBar filters={FILTERS} />
    </div>
  );
}

/** ページ送りの右の余白を、画面に入ると足あとが順に歩く(見本には無い飾り。位置・大きさは変えない。スマホは検索結果の右の列との間) */
export function Trail() {
  return (
    <div className="sr-trail-w" aria-hidden="true">
      <PawTrail count={9} direction="right" size={17} gap="calc(14 * var(--u))" mode="auto" delay={250} className="sr-trail" />
    </div>
  );
}
