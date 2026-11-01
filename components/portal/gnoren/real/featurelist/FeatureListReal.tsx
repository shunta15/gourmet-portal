import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "../../common/icons";
import { THEMES, NOREN_CONTENT } from "../../featurelist/data";
import { NOREN_GEOM } from "../../featurelist/norenGeom";
import { FEATURE_KIND_ROUNDUP, FEATURE_ROUNDUP_WALK } from "@/lib/portal/noren/featureKinds";
import type { GnFlItem, GnFlTheme, GnFlVM } from "@/lib/portal/gnoren/featurelist";
import { FL_ICONS } from "./icons";
import "../../featurelist/featurelist.css";
import "./real.css";

/**
 * 特集一覧(見本 5)の実データ版。見た目は試作 featurelist/FeatureList.tsx と同じ(CSS は試作のものを import)。
 * データは lib/portal/gnoren/featurelist.ts(サーバー)で整形済み。ここは表示だけ(クライアントのコードは無い)。
 * 試作との違い: 見本の写真・文はすべて実データ(記事の title・sub・heroImage・date)に置き換え。節(各テーマの記事の札)・キーワード欄・結果の節を足した。
 */
const IMG = "/_portal/gnoren/featurelist";
type V = CSSProperties & Record<`--${string}`, string | number>;

// 暖簾を吊る小さな木の留め具(見本 5 の位置)
const PEGS: [number, number][] = [[333.7, 55], [421, 63], [520, 66], [616.8, 68.8], [719.5, 70], [825, 67], [925.8, 63.8], [1030.5, 58]];

const secId = (t: GnFlTheme) => `gn-fl-sec-${t.slot}`;

function Noren({ t, i, base }: { t: GnFlTheme; i: number; base: string }) {
  const g = NOREN_GEOM[t.slot];
  const c = NOREN_CONTENT[t.slot];
  const Ic = FL_ICONS[t.icon];
  const clip = `polygon(${g.poly.map(([x, y]) => `${((x / g.w) * 100).toFixed(2)}% ${((y / g.h) * 100).toFixed(2)}%`).join(",")})`;
  const pc = (v: number, o: number, s: number) => `${(((v - o) / s) * 100).toFixed(2)}%`;
  return (
    <Link
      href={`${base}#${secId(t)}`}
      className={`gn-fl-nr gn-fl-nr-${c.tone}`}
      style={{ "--x": g.x, "--y": g.y, "--w": g.w, "--h": g.h, "--i": i } as V}
      aria-label={`${t.head}の特集へ`}
    >
      <span className="gn-fl-nr-cloth" style={{ backgroundImage: `url(${IMG}/noren-${t.slot}.webp)`, clipPath: clip }} aria-hidden="true" />
      <span className="gn-fl-nr-ic" style={{ left: pc(c.icon[0], g.x, g.w), top: pc(c.icon[1], g.y, g.h), height: `calc(var(--s) * ${c.ih})`, transform: `translate(-50%,-50%) rotate(${c.rot}deg)` }}>
        <Ic />
      </span>
      <span className="gn-fl-nr-lb" style={{ left: pc(c.label[0], g.x, g.w), top: pc(c.label[1], g.y, g.h), fontSize: `calc(var(--s) * ${c.lh})`, transform: `translate(-50%,-50%) rotate(${c.rot}deg)` }}>
        {t.head}
      </span>
    </Link>
  );
}

/** 記事の札(新着・節・結果で共通) */
function Item({ it, i, eager }: { it: GnFlItem; i: number; eager?: boolean }) {
  return (
    <li className="gn-fl-r-it" style={{ "--i": i } as V}>
      <Link href={it.href} className="gn-fl-r-a">
        <span className="gn-fl-r-phw">
          <span className="gn-fl-r-ph">{it.img ? <img {...it.img} alt="" width={400} height={250} loading={eager ? undefined : "lazy"} decoding="async" /> : null}</span>
          <span className="gn-fl-go gn-fl-go-s" aria-hidden="true"><ArrowRight /></span>
        </span>
        <span className="gn-fl-r-t gn-mincho">{it.title}</span>
        <span className="gn-fl-chips">
          <span className="gn-fl-chip is-warm">#{it.tag}</span>
          {it.regionName ? <span className="gn-fl-chip">#{it.regionName}</span> : null}
        </span>
        {it.date ? <time className="gn-fl-date">{it.date}</time> : null}
      </Link>
    </li>
  );
}

function Strip({ t, label, count }: { t: GnFlTheme | null; label: string; count: number }) {
  const slot = t ? THEMES.find((x) => x.key === t.slot) : null;
  const Ic = t ? FL_ICONS[t.icon] : null;
  return (
    <div className={`gn-fl-r-hd gn-fl-tone-${slot?.tone ?? "linen"}`}>
      {Ic ? <Ic className="gn-fl-r-hd-ic" /> : null}
      <h2 className="gn-fl-r-hd-t gn-mincho">{label}</h2>
      <span className="gn-fl-r-hd-ct">{count} 本</span>
    </div>
  );
}

export default function FeatureListReal({ vm }: { vm: GnFlVM }) {
  const { themes, news, pick, polaroid, counts, result } = vm;
  const base = result ? "/feature" : "";
  const allHref = "/feature?all=1";

  return (
    <main className="gn-fl">
      {/* ───── ヒーロー + 注目 ───── */}
      <section className="gn-fl-hero" aria-labelledby="gn-fl-h1">
        <div className="gn-fl-top">
          <div className="gn-fl-hero-bg gn-fl-r-hero-bg" aria-hidden="true" />
          <div className="gn-fl-hero-txt">
            <h1 id="gn-fl-h1" className="gn-fl-h1">特集を、読む。</h1>
            <p className="gn-fl-lead gn-fl-r-lead">
              {FEATURE_KIND_ROUNDUP}は利用シーンに合わせて複数の店を、{FEATURE_ROUNDUP_WALK}は街の歩き方を紹介します。
            </p>
          </div>

          {PEGS.map(([x, y], i) => (
            <span key={i} className="gn-fl-peg" style={{ left: `calc(var(--u) * ${x})`, top: `calc(var(--u) * ${y})` }} aria-hidden="true" />
          ))}
          <nav className="gn-fl-norens" aria-label="特集のテーマ">
            {themes.map((t, i) => (
              <Noren key={t.slot} t={t} i={i} base={base} />
            ))}
          </nav>

          <p className="gn-fl-gscript gn-script" aria-hidden="true">
            Machinowa Gourmet<br />Feature
          </p>
        </div>

        {pick ? (
          <article className="gn-fl-pick gn-fl-r-pick">
            <Link href={pick.href} className="gn-fl-pick-link" aria-label={`${pick.title}を読む`}>
              {pick.img ? <img {...pick.img} sizes="(max-width: 768px) 100vw, 780px" alt="" width={1538} height={480} className="gn-fl-pick-img" decoding="async" /> : null}
              <span className="gn-fl-pick-shade" aria-hidden="true" />
              <span className="gn-fl-tag"><span>新着の特集</span></span>
              <span className="gn-fl-pick-t gn-mincho">{pick.title}</span>
              {pick.sub ? <span className="gn-fl-pick-d">{pick.sub}</span> : null}
              <span className="gn-fl-pick-btn">
                特集を読む
                <ArrowRight />
              </span>
            </Link>
          </article>
        ) : null}

        {pick ? (
          <div className="gn-fl-side" aria-hidden="true">
            <p className="gn-fl-pul gn-mincho">PICK UP<br />FEATURE</p>
            {polaroid ? (
              <span className="gn-fl-pola gn-fl-r-pola">
                <img {...polaroid} sizes="136px" alt="" loading="lazy" decoding="async" />
              </span>
            ) : null}
            <p className="gn-fl-note">
              いちばん新しい<br />
              特集記事を<br />
              ご紹介。<br />
              {pick.date}
            </p>
            <img src={`${IMG}/leaf.webp`} alt="" width={256} height={352} className="gn-fl-leaf" />
          </div>
        ) : null}
      </section>

      {/* ───── テーマから探す(布札 7) ───── */}
      <section className="gn-fl-themes" aria-labelledby="gn-fl-h2a">
        <div className="gn-fl-sh">
          <h2 id="gn-fl-h2a" className="gn-fl-sh-t">テーマから探す</h2>
          <img src={`${IMG}/townscape.webp`} alt="" width={1146} height={150} className="gn-fl-town" />
          <p className="gn-fl-find gn-script" aria-hidden="true">Find your favorite feature</p>
          <Link href={allHref} className="gn-fl-more">
            すべての特集を見る
            <ArrowRight />
          </Link>
        </div>

        <div className="gn-fl-cards">
          {themes.map((t, i) => {
            const slot = THEMES.find((x) => x.key === t.slot)!;
            const Ic = FL_ICONS[t.icon];
            return (
              <Link
                key={t.slot}
                href={`${base}#${secId(t)}`}
                className={`gn-fl-card gn-fl-card-r${slot.row} gn-fl-tone-${slot.tone}`}
                style={{ "--x": slot.x, "--w": slot.w, "--i": i } as V}
              >
                <span className="gn-fl-card-hd gn-linen">
                  <Ic className="gn-fl-card-ic" />
                  <span className="gn-fl-card-hl gn-mincho"><b>{t.head}</b>の特集</span>
                </span>
                <span className="gn-fl-card-ph">
                  {t.img ? <img {...t.img} alt="" loading="lazy" decoding="async" /> : null}
                </span>
                <span className="gn-fl-go" aria-hidden="true"><ArrowRight /></span>
                <span className="gn-fl-card-t gn-fl-r-ct2 gn-mincho">{t.title}</span>
                <span className="gn-fl-card-d gn-fl-r-ct2">{t.desc}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───── キーワード(旧 /feature/search の入口。見本に無い唯一の追加の 1 つ) ───── */}
      <section className="gn-fl-r-find" aria-label="キーワードで探す">
        <form action="/feature" method="get" role="search" className="gn-fl-r-form">
          <label htmlFor="gn-fl-q" className="gn-fl-r-form-l gn-mincho">キーワードで探す</label>
          <input id="gn-fl-q" name="q" type="search" defaultValue={result?.q ?? ""} maxLength={60} placeholder="題・副題・テーマ" className="gn-fl-r-form-i" />
          <button type="submit" className="gn-fl-r-form-b">探す</button>
        </form>
      </section>

      {result ? (
        /* ───── 絞り込みの結果(上の部分はそのまま) ───── */
        <section className="gn-fl-r-sec gn-fl-r-result" id="gn-fl-result" aria-label="絞り込みの結果">
          <Strip t={null} label={result.label} count={result.items.length} />
          <p className="gn-fl-r-back"><Link href="/feature">← 絞り込みを外す</Link></p>
          {result.items.length === 0 ? (
            <p className="gn-fl-r-empty">該当する記事がありません。<Link href="/feature">他のテーマを選ぶ →</Link></p>
          ) : (
            <ul className="gn-fl-r-grid">
              {result.items.map((it, i) => (
                <Item key={it.id} it={it} i={i} />
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          {/* ───── 新着の特集記事 ───── */}
          <section className="gn-fl-news gn-fl-r-news" aria-labelledby="gn-fl-h2b">
            <div className="gn-fl-nh">
              <h2 id="gn-fl-h2b" className="gn-fl-nh-t gn-mincho">新着の特集記事</h2>
              <span className="gn-fl-nh-rule" aria-hidden="true" />
              <Link href={allHref} className="gn-fl-nh-more">
                すべて見る
                <ArrowRight />
              </Link>
            </div>
            <ul className="gn-fl-r-grid gn-fl-r-grid-5">
              {news.map((it, i) => (
                <Item key={it.id} it={it} i={i} />
              ))}
            </ul>
          </section>

          {/* ───── テーマごとの節(布札から飛ぶ先) ───── */}
          {themes.map((t) => (
            <section key={t.slot} id={secId(t)} className="gn-fl-r-sec" aria-label={`${t.head}の特集`}>
              <Strip t={t} label={`${t.head}の特集`} count={t.total} />
              <ul className="gn-fl-r-grid">
                {t.items.map((it, i) => (
                  <Item key={it.id} it={it} i={i} />
                ))}
              </ul>
              {t.regionLinks ? (
                <ul className="gn-fl-r-regs" aria-label="地域で絞る">
                  {t.regionLinks.map((r) => (
                    <li key={r.key}>
                      <Link href={r.href} className="gn-fl-r-reg">
                        {r.name}
                        <span>{r.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              {t.total > t.items.length || t.regionLinks ? (
                <p className="gn-fl-r-more">
                  <Link href={t.moreHref}>
                    {t.regionLinks ? "すべての特集を見る" : `${t.head}の特集をすべて見る`}（{t.total} 本）
                    <ArrowRight />
                  </Link>
                </p>
              ) : null}
            </section>
          ))}
        </>
      )}

      {/* ───── 下の帯 ───── */}
      <section className="gn-fl-band" aria-label="すべての特集へ">
        <img src={`${IMG}/band.webp`} alt="" className="gn-fl-band-bg" loading="lazy" />
        <h2 className="gn-fl-band-t gn-mincho">特集 {counts.total} 本を、<br />一覧で読む。</h2>
        <p className="gn-fl-band-s">{FEATURE_KIND_ROUNDUP} {counts.scene} 本・{FEATURE_ROUNDUP_WALK} {counts.walk} 本。</p>
        <Link href={allHref} className="gn-fl-band-btn">
          すべての特集を見る
          <ArrowRight />
        </Link>
      </section>
    </main>
  );
}
