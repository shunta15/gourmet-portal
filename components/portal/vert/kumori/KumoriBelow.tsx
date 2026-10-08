import Link from "next/link";
import "./below.css";
import KumoriFx from "./KumoriFx";
import { KUMORI_LIP_PATHS, KUMORI_PANES, KUMORI_PHOTO_BY } from "@/lib/portal/vert/kumori/data";

export type BelowCategory = { slug: string; name: string; href: string; count: number };
export type BelowArea = { slug: string; short: string; block: string; href: string; count: number };
export type BelowScene = { slug: string; name: string; href: string };
export type BelowOther = { key: string; name: string; en: string; glyph: string; href: string };
export type BelowProps = {
  verticalName: string;
  total: number;
  catCount: number;
  sceneCount: number;
  categories: BelowCategory[];
  areas: BelowArea[];
  blocks: { key: string; label: string; en: string }[];
  scenes: BelowScene[];
  others: BelowOther[];
  hasPolicy: boolean;
};

const img = (url: string, w: number) => `${url}?auto=format&fit=crop&w=${w}&q=75`;

/** 動きを減らす設定・スクリプトなし: 曇りを晴れた状態にして、文字を読める色に切り替える */
const CLEAR_CSS = `.k-below .kb-fog{opacity:0!important}.k-below .k-shade{opacity:1!important}.k-below .k-pane .k-txt{color:#fff6ea!important;text-shadow:0 1px 14px rgba(10,4,2,.9),0 0 3px rgba(10,4,2,.7)!important}.k-below .k-pane .kb-slug,.k-below .k-pane .k-st{color:#f1e2cc!important}.k-below .k-pane .kb-num{color:#ff93a6!important;-webkit-text-stroke:.8px #5a0a18!important;text-shadow:0 1px 10px rgba(10,4,2,.95),0 0 3px rgba(10,4,2,.8)!important}`;

function Fog() {
  return <i className="kb-fog" aria-hidden="true" />;
}

export default function KumoriBelow(p: BelowProps) {
  return (
    <div className="k-below">
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: CLEAR_CSS }} />
      </noscript>
      <KumoriFx />
      <div className="k-sill" aria-hidden="true" />

      {/* 1 種類から探す */}
      <section id="category" className="k-sec" aria-labelledby="k-cat-h">
        <header className="k-head2">
          <p className="k-kick"><span>01</span> Category</p>
          <h2 id="k-cat-h">種類から探す</h2>
        </header>
        <ul className="k-panes">
          {p.categories.map((c, i) => {
            const ph = KUMORI_PANES.find((x) => x.slug === c.slug);
            return (
              <li key={c.slug} className={`k-p${i + 1}`}>
                <Link href={c.href} prefetch={false} className={`k-pane k-${ph?.shape ?? "round"}`} data-wipe>
                  <span className="k-glass2">
                    {ph && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img(ph.photo, 900)}
                        srcSet={`${img(ph.photo, 600)} 600w, ${img(ph.photo, 1000)} 1000w`}
                        sizes="(max-width: 700px) 80vw, 380px"
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{ objectPosition: ph.pos, transform: `scale(${ph.scale})`, transformOrigin: ph.origin }}
                      />
                    )}
                    <i className="k-shade" aria-hidden="true" />
                    <Fog />
                    <span className="k-stack">
                      <span className="kb-num" aria-hidden="true">0{i + 1}</span>
                      <b className="k-txt kb-name">{c.name}</b>
                      <small className="k-txt kb-slug">{c.slug}</small>
                      <span className="k-txt k-st">{c.count > 0 ? `${c.count}件` : "掲載準備中"}</span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 2 エリアから探す */}
      <section id="area" className="k-sec" aria-labelledby="k-area-h">
        <header className="k-head2">
          <p className="k-kick"><span>02</span> Area</p>
          <h2 id="k-area-h">エリアから探す</h2>
          <p className="k-lead2">都道府県を地方ごとに並べています。掲載が追加されると、ここに件数が出ます。</p>
        </header>
        <div className="k-big k-areas">
          <i className="k-bulbrow" aria-hidden="true" />
          {p.blocks.map((b) => {
            const list = p.areas.filter((a) => a.block === b.key);
            if (list.length === 0) return null;
            const total = list.reduce((s, a) => s + a.count, 0);
            return (
              <section className="k-region-row" key={b.key} aria-label={b.label}>
                <h3 className="k-region" data-t={b.label}>
                  <span>{b.label}</span>
                  <small>{b.en}{total > 0 ? ` ${total}件` : ""}</small>
                </h3>
                <ul className="k-prefs">
                  {list.map((a) => (
                    <li key={a.slug}>
                      <Link href={a.href} prefetch={false} className="k-pref">
                        <span>{a.short}</span>
                        {a.count > 0 && <em>{a.count}件</em>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      {/* 3 利用シーンから探す */}
      <section id="scene" className="k-sec" aria-labelledby="k-scene-h">
        <header className="k-head2">
          <p className="k-kick"><span>03</span> Scene</p>
          <h2 id="k-scene-h">利用シーンから探す</h2>
        </header>
        <div className="k-big k-scenes">
          <i className="k-bulbrow" aria-hidden="true" />
          <ul>
            {p.scenes.map((s, i) => (
              <li key={s.slug}>
                <Link href={s.href} prefetch={false} className="k-scene">
                  <svg className={`k-lip${i === 1 || i === 5 ? " k-ring" : ""}`} viewBox="0 0 200 44" preserveAspectRatio="none" aria-hidden="true">
                    <path d={KUMORI_LIP_PATHS[i % KUMORI_LIP_PATHS.length]} pathLength="1" className="k-lip-b" />
                    <path d={KUMORI_LIP_PATHS[i % KUMORI_LIP_PATHS.length]} pathLength="1" className="k-lip-g" />
                  </svg>
                  <span className="k-scene-t">{s.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4 掲載準備中の説明(見出しとリードは奥の場面にある。ここでは重ねない) */}
      <section className="k-sec k-sec-card" aria-label="掲載状況">
        <div className="k-edge" aria-hidden="true" />
        <div className="k-card">
          <i className="k-clip k-clip-l" aria-hidden="true" />
          <i className="k-clip k-clip-r" aria-hidden="true" />
          <p className="k-kick k-kick-ink">Information</p>
          <p className="k-note">
            {p.total > 0
              ? `現在の掲載は ${p.total} 件です。`
              : `${p.verticalName}の掲載は、まだありません（現在 0 件）。掲載できる店が確認でき次第、ここに並びます。`}
          </p>
          {p.hasPolicy && (
            <p className="k-note k-note-sub">
              掲載方針：効果・効能をうたう表現は使わず、確認できた事実（メニュー・営業時間・設備など）だけを載せます。
            </p>
          )}
          <p className="k-links">
            <Link href="/editorial/guidelines">掲載基準</Link>
            <Link href="/contact">掲載のご相談</Link>
          </p>
          <dl className="k-facts">
            <div>
              <dt>現在の掲載</dt>
              <dd><b>{p.total}</b>件</dd>
            </div>
            <div>
              <dt>種類</dt>
              <dd><b>{p.catCount}</b></dd>
            </div>
            <div>
              <dt>利用シーン</dt>
              <dd><b>{p.sceneCount}</b></dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 5 ほかの入口 */}
      <section id="other" className="k-sec" aria-labelledby="k-oth-h">
        <header className="k-head2">
          <p className="k-kick"><span>05</span> Other</p>
          <h2 id="k-oth-h">ほかの入口</h2>
        </header>
        <ul className="k-others">
          {p.others.map((o) => (
            <li key={o.key}>
              <Link href={o.href} className="k-minilink" data-wipe>
                <span className="k-pane k-round k-mini">
                  <span className="k-glass2">
                    <i className="k-room2" aria-hidden="true" />
                    <Fog />
                    <span className="k-g" data-t={o.glyph} aria-hidden="true">{o.glyph}</span>
                  </span>
                </span>
                <b>{o.name}</b>
                <small>{o.en}</small>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="k-credit2">
        Photo: Unsplash — {KUMORI_PANES.map((x) => x.by).concat(KUMORI_PHOTO_BY).filter((v, i, a) => a.indexOf(v) === i).join("、")}
      </p>
    </div>
  );
}
