import Link from "next/link";
import { Noto_Serif_JP } from "next/font/google";
import { Reveal, MaskLines, Write } from "@/components/portal/bcproto/green/common/Motion";
import ShopCard from "@/components/portal/bcproto/green/common/ShopCard";
import KindMarquee from "@/components/portal/bcproto/green/common/KindMarquee";
import { IMG, SEARCH_HREF, SPECIAL_HREF, searchHref } from "@/components/portal/bcproto/green/common/site";
import type { GreenFacets, GreenShop } from "@/lib/portal/vert/bodygreen/types";
import { TagIcon } from "./icons";
import { SPECIAL_BANDS, bandTitle } from "./bands";
import MorePrefs, { type MorePref } from "./MorePrefs";
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
const BandIcon = ({ kind, c }: { kind: "shield" | "calendar" | "book"; c: string }) => {
  if (kind === "calendar")
    return (
      <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.500" y="5" width="17" height="15" rx="2.500" />
        <path d="M3.500 10h17M8 3v4M16 3v4" />
      </svg>
    );
  if (kind === "book")
    return (
      <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6C9.500 4.500 6 4.200 3 5v13c3-.8 6.500-.5 9 1 2.500-1.500 6-1.800 9-1V5c-3-.8-6.500-.5-9 1ZM12 6v13" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path d="M12 2 4 5v6c0 5 3.400 8.700 8 10 4.600-1.300 8-5 8-10V5l-8-3Z" fill={c} />
      <path d="m8.500 11.800 2.600 2.600 4.600-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/** 施術の種類の札の写真(見本から切り出した業種の飾り)。種類の slug → type1〜5 */
const KIND_IMG: Record<string, string> = { seitai: "type1", sekkotsu: "type2", shinkyu: "type3", massage: "type4", relaxation: "type5" };

export type TopArea = { slug: string; label: string; en: string; count: number; img: string };
export type TopPref = { slug: string; name: string; count: number };

export type TopData = {
  total: number;
  prefTotal: number;
  /** ヒーローのリード(2 行。1 行目は種類名を実データから並べる) */
  leadA: string;
  leadB: string;
  kinds: GreenFacets["kinds"];
  tags: GreenFacets["tags"];
  /** 検索窓の都道府県の選択肢(0 件の県は無い・都道府県コード順) */
  prefOptions: TopPref[];
  /** 写真の札のエリア(店がある所だけ) */
  areas: TopArea[];
  /** 写真の札に無い都道府県(0 件は無い・都道府県コード順) */
  morePrefs: MorePref[];
  /** 掲載中の店(5 店。並びは順位ではない) */
  picks: GreenShop[];
};

export default function TopPage({ d }: { d: TopData }) {
  return (
    <div data-gr-page="top" className={`gt ${ser.variable}`}>
      {/* ================= ヒーロー ================= */}
      <section className="gt-hero" aria-label="マチノワ ボディケア">
        <div className="gt-hero-bg" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="gr-kb" src={`${T}/hero.webp`} width={1448} height={355} alt="" fetchPriority="high" />
        </div>
        <div className="gt-hero-in">
          <MaskLines as="h1" className="gt-h1 gr-min" lines={[<span key="1" style={{ letterSpacing: "var(--gt-ls1)" }}>からだが整うと、</span>, <span key="2" style={{ letterSpacing: "var(--gt-ls2)" }}>毎日がもっと好きになる。</span>]} step={190} delay={150} />
          <p className="gt-lead" data-rv style={{ ["--d" as string]: "450ms" }}>
            <span>{d.leadA}</span>
            <span>{d.leadB}</span>
          </p>
          <form className="gt-search" action={SEARCH_HREF} method="get" role="search" data-rv style={{ ["--d" as string]: "500ms" }}>
            <label className="gt-area gr-press">
              <Pin w={14} h={18} c="#1d2b45" />
              <select name="pref" defaultValue="" aria-label="都道府県を選ぶ">
                <option value="">エリアを選択</option>
                {d.prefOptions.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}({p.count})
                  </option>
                ))}
              </select>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#2a3548" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="gt-caret">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </label>
            <div className="gt-input">
              <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="#2a3548" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="10.500" cy="10.500" r="6.500" />
                <path d="m15.500 15.500 5 5" />
              </svg>
              <input type="text" name="q" placeholder="エリア・店名で検索" aria-label="エリア・店名で検索" autoComplete="off" />
              <button type="submit" className="gt-go gr-shimmer gr-press">
                <span>検索する</span>
                <Arrow s={17} />
              </button>
            </div>
          </form>
          <div className="gt-kw" data-rv style={{ ["--d" as string]: "600ms" }}>
            <b>条件から探す</b>
            <ul>
              {d.tags.map((t) => (
                <li key={t.name}>
                  <Link href={searchHref({ tag: t.name })} className="gr-chip gr-press">
                    {t.name}
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
              全国
              <br />
              {d.prefTotal}都道府県の
              <br />
              {d.total}店を
              <br />
              掲載中
            </p>
          </div>
        </div>
      </section>

      {/* 端の若葉(ヒーローの下端が基準。ゆっくりそよぐ+スクロールでずれる) */}
      <div className="gt-sprigs" aria-hidden="true">
        <div className="gt-sprig gt-sprig--l" data-par="-0.04">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${T}/sprig-l.png`} width={134} height={80} alt="" />
        </div>
        <div className="gt-sprig gt-sprig--r" data-par="-0.03">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${T}/sprig-r.png`} width={72} height={272} alt="" />
        </div>
      </div>

      {/* ================= 施術の種類から探す ================= */}
      <section className="gt-w gt-types" id="gr-kind" aria-labelledby="gt-h-kind">
        <Reveal className="gt-types-h">
          <h2 id="gt-h-kind" className="gr-vbar gr-min">
            施術の種類から探す
          </h2>
          <p>
            施術の種類ごとに、
            <br />
            掲載している店を見られます。
          </p>
          <Link href={SEARCH_HREF} className="gr-arrow gt-types-go gr-press" aria-label="店を探す">
            <Arrow s={14} />
          </Link>
        </Reveal>
        <ul className="gt-types-grid" data-rv-group style={{ ["--n" as string]: d.kinds.length }}>
          {d.kinds.map((k) => (
            <li key={k.slug} data-rv>
              <Link href={searchHref({ kind: k.slug })} className="gt-type gr-lift gr-hov">
                <span className="gt-type-ph gr-zoom" style={{ background: k.color }}>
                  {KIND_IMG[k.slug] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${T}/${KIND_IMG[k.slug]}.webp`} width={207} height={75} alt="" loading="lazy" />
                  )}
                </span>
                <span className="gt-type-b">
                  <span className="gt-type-t">
                    <b>{k.name}</b>
                    <small>{k.count} 店を掲載</small>
                  </span>
                  <span className="gr-arrow">
                    <Arrow s={13} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ================= こだわりから探す ================= */}
      <section className="gt-worry" id="gr-tag" aria-labelledby="gt-h-tag">
        <div className="gt-w gt-worry-in">
          <Reveal className="gt-worry-h">
            <h2 id="gt-h-tag" className="gr-vbar gr-min">
              こだわりから探す
            </h2>
            <p>
              営業日や予約のしかたなど、
              <br />
              条件から探せます。
            </p>
          </Reveal>
          <ul className="gt-worry-row" data-rv-group>
            {d.tags.map((t) => (
              <li key={t.name} data-rv="zoom">
                <Link href={searchHref({ tag: t.name })} className="gt-wc gr-hov gr-press">
                  <span className="gt-wc-ic gr-bounce">
                    <TagIcon name={t.name} />
                  </span>
                  <span className="gt-wc-l">{t.name}</span>
                  <span className="gt-wc-n">{t.count} 店</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={SEARCH_HREF} className="gt-worry-all gr-hov gr-press">
            <span>条件の一覧を見る</span>
            <span className="gr-arrow gt-worry-arrow">
              <Arrow s={20} />
            </span>
          </Link>
        </div>
      </section>

      {/* 施術の種類の名前が流れる帯(装飾。名前は上の種類と同じ) */}
      <KindMarquee names={d.kinds.map((k) => k.name)} />

      {/* ================= 掲載中の店 ================= */}
      <section className="gt-w gt-rec" aria-labelledby="gt-h-rec">
        <div className="gt-rec-top">
          <Reveal className="gt-rec-h">
            <h2 id="gt-h-rec" className="gr-min">
              掲載中の店
            </h2>
            <span>掲載店の一部を紹介します。並びは順位ではありません。</span>
          </Reveal>
          <Link href={SEARCH_HREF} className="gt-rec-all gr-arrow-link">
            <span>すべて見る</span>
            <Arrow s={17} />
          </Link>
        </div>
        <div className="gt-rec-grid" data-rv-group>
          {d.picks.map((s) => (
            <div key={s.id} data-rv>
              <ShopCard shop={s} eager={false} hours={false} as="h3" />
            </div>
          ))}
          <div data-rv className="gt-guide-w">
            <aside className="gt-guide gr-lift gr-hov">
              <Link href={SPECIAL_HREF} aria-label="特集記事の一覧を見る" className="gt-guide-a">
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
                    <small>マチノワ Body Care の</small>
                    <b>特集記事</b>
                  </span>
                  <span className="gt-guide-btn">
                    読んでみる
                    <Arrow s={16} />
                  </span>
                </span>
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* ================= エリアから探す ================= */}
      <section className="gt-w gt-area-sec" id="gr-area" aria-labelledby="gt-h-area">
        <Reveal className="gt-area-h">
          <Pin w={13} h={19} c="#2c5439" />
          <h2 id="gt-h-area" className="gr-min">
            エリアから探す
          </h2>
          <span>お住まいの都道府県から店を探せます。</span>
        </Reveal>
        <div className="gt-area-grid" data-rv-group>
          {d.areas.map((a) => (
            <div key={a.slug} data-rv>
              <Link href={searchHref({ pref: a.slug })} className="gt-ac gr-lift gr-hov">
                <span className="gr-zoom gt-ac-ph">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.img} width={234} height={84} alt="" loading="lazy" />
                </span>
                <span className="gt-ac-t">
                  <b>{a.label}エリア</b>
                  <small>
                    {a.en} ・ {a.count}店
                  </small>
                </span>
                <span className="gt-ac-ar gr-arrow">
                  <Arrow s={20} />
                </span>
              </Link>
            </div>
          ))}
          {d.morePrefs.length > 0 && <MorePrefs prefs={d.morePrefs} mapSrc={`${T}/map.png`} />}
        </div>
      </section>

      {/* ================= 特集記事の帯 ================= */}
      <section className="gt-w gt-bn-sec" aria-label="特集記事">
        <div className="gt-bn-grid" data-rv-group>
          <div data-rv>
            <Link href={SPECIAL_BANDS.difference.href} className="gt-bn gt-bn--1 gr-lift gr-hov">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="gt-bn-img gr-zoom" src={`${T}/banner1.webp`} width={443} height={97} alt="" loading="lazy" />
              <span className="gt-bn-t">
                <span className="gt-bn-tag" style={{ color: "#2f5a3d" }}>
                  <BandIcon kind="shield" c="#2f7d4d" />
                  はじめての方へ
                </span>
                <b>{bandTitle("difference")}</b>
                <small>名前のちがいと、施術する人の免許のちがい。</small>
              </span>
              <span className="gt-bn-ar gr-arrow">
                <Arrow s={13} />
              </span>
            </Link>
          </div>
          <div data-rv>
            <Link href={SPECIAL_BANDS.weekend.href} className="gt-bn gt-bn--2 gr-lift gr-hov">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="gt-bn-img gr-zoom" src={`${T}/banner2.webp`} width={465} height={97} alt="" loading="lazy" />
              <span className="gt-bn-t">
                <span className="gt-bn-tag" style={{ color: "#c0446a" }}>
                  <BandIcon kind="calendar" c="#d4476f" />
                  特集記事
                </span>
                <b>{bandTitle("weekend")}</b>
                <small>営業時間は店のデータのとおり。店のページへのリンクつき。</small>
              </span>
              <span className="gt-bn-ar gr-arrow">
                <Arrow s={13} />
              </span>
            </Link>
          </div>
          <div data-rv>
            <Link href={SPECIAL_BANDS.choose.href} className="gt-bn gt-bn--3 gr-lift gr-hov">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="gt-bn-img gr-zoom" src={`${T}/banner3.webp`} width={438} height={97} alt="" loading="lazy" />
              <span className="gt-bn-t">
                <span className="gt-bn-tag" style={{ color: "#8a4b2c" }}>
                  <BandIcon kind="book" c="#a65b36" />
                  特集記事
                </span>
                <b>{bandTitle("choose")}</b>
                <small>営業時間・予約・場所・免許の表示など、確かめられる点。</small>
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
