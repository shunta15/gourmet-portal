import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "../common/icons";
import { FL_ARTICLE, FL_BASE, FL_GROUPS, FL_NEW, FL_SCENE, FL_SIDE, FL_TAGS } from "./data";
import "./featurelist.css";

const IMG = "/_portal/gnoren3/featurelist";

/** 見本の画素(x / y / w / h / f=字の大きさ / l=行の高さ)を CSS 変数で渡す。y はページ上端から(CSS が 55 を引く)。 */
type V = Record<string, number | string>;
const v = (o: V) => o as CSSProperties;

function Lines({ rows }: { rows: string[] }) {
  return (
    <>
      {rows.map((r, i) => (
        <span key={i} className="gn3-fl-ln">
          {r}
        </span>
      ))}
    </>
  );
}

function More({ x, y, label, href = FL_BASE }: { x: number; y: number; label: string; href?: string }) {
  return (
    <Link href={href} className="gn3-fl-more gn3-fl-p" style={v({ "--x": x, "--y": y })}>
      <span>{label}</span>
      <ArrowRight />
    </Link>
  );
}

export default function FeatureListPage() {
  return (
    <main className="gn3-fl gn3-linen">
      {/* ───────── ヒーロー(見本 y55〜270)。暖簾 3 枚+提灯は写真。文字は HTML ───────── */}
      <section className="gn3-fl-hero" aria-label="特集">
        <div className="gn3-fl-hero-bg" aria-hidden="true">
          <img src={`${IMG}/hero.webp`} alt="" className="gn3-fl-hero-img" />
        </div>
        <div className="gn3-fl-hero-in">
          <p className="gn3-fl-ht gn3-fl-hero-l" style={v({ "--x": 251, "--y": 122.6 })}>
            <Lines rows={["この街の", "食の物語を、", "もっと深く。"]} />
          </p>
          <h1 className="gn3-fl-hero-main">
            <span className="gn3-fl-ht gn3-fl-hero-k" style={v({ "--x": 474, "--y": 117 })}>
              特
            </span>
            <span className="gn3-fl-ht gn3-fl-hero-k" style={v({ "--x": 573, "--y": 117 })}>
              集
            </span>
          </h1>
          <p className="gn3-fl-ht gn3-fl-hero-r" style={v({ "--x": 768, "--y": 112 })}>
            <Lines rows={["うまいには、", "理由がある。", "人がいる。", "街がある。"]} />
          </p>
          <span className="gn3-fl-ht gn3-fl-hero-lantern" style={v({ "--x": 1011, "--y": 184 })} aria-hidden="true">
            マチノワ
          </span>
        </div>
        <p className="gn3-fl-hero-sp">
          <span>この街の食の物語を、もっと深く。</span>
          <span>うまいには、理由がある。人がいる。街がある。</span>
        </p>
      </section>

      <div className="gn3-fl-stage">
        {/* ───────── 特集をさがす(布札 6 枚) ───────── */}
        <h2 className="gn3-fl-h gn3-fl-h-find gn3-fl-p" style={v({ "--x": 48, "--y": 284.5, "--f": 22 })}>
          <b>特集</b>
          <span>をさがす</span>
        </h2>
        <p className="gn3-fl-lead gn3-fl-p" style={v({ "--x": 827, "--y": 293 })}>
          気になる切り口から、特集を見つける
        </p>
        <ArrowRight className="gn3-fl-lead-arrow gn3-fl-p" style={v({ "--x": 1021, "--y": 296.5 })} aria-hidden="true" />

        <ul className="gn3-fl-tags">
          {FL_TAGS.map((t) => (
            <li key={t.id} className={`gn3-fl-tag gn3-fl-tag-${t.kind} gn3-fl-p`} style={v({ "--x": t.x, "--y": 321, "--w": t.w, "--h": 91 })}>
              <a href={t.href} className="gn3-fl-tag-a">
                <img src={`${IMG}/${t.id}.webp`} alt="" className="gn3-fl-tag-img" />
                <span className="gn3-fl-tag-label">{t.label}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* ───────── 大きな特集 1 本 + 小さな特集 3 本 ───────── */}
        <section className="gn3-fl-feat" aria-label="注目の特集">
          <Link href={FL_ARTICLE} className="gn3-fl-big gn3-fl-p" style={v({ "--x": 49, "--y": 426, "--w": 647, "--h": 310 })}>
            <img src={`${IMG}/feat-main.webp`} alt="" className="gn3-fl-big-img" />
            <span className="gn3-fl-big-badge gn3-fl-r" style={v({ "--x": 30, "--y": 68, "--w": 48, "--h": 25 })}>
              特集
            </span>
            <span className="gn3-fl-big-title gn3-fl-r" style={v({ "--x": 27.5, "--y": 97.5 })}>
              <Lines rows={["やっぱり、", "この街の居酒屋が好き。"]} />
            </span>
            <span className="gn3-fl-big-desc gn3-fl-r" style={v({ "--x": 31, "--y": 212 })}>
              <Lines rows={["暖簾の向こうに広がる、うまい酒と人のぬくもり。", "何度でも通いたくなる、街の居酒屋をめぐる特集です。"]} />
            </span>
            <span className="gn3-fl-big-date gn3-fl-r" style={v({ "--x": 32.5, "--y": 269.3 })}>
              2024.11.28
            </span>
          </Link>

          <ul className="gn3-fl-side">
            {FL_SIDE.map((s) => (
              <li key={s.id} className="gn3-fl-side-i">
                <Link href={FL_ARTICLE} className="gn3-fl-side-a" style={v({ "--sy": s.y, "--sh": s.h, "--ty": s.ty, "--dt": s.dt, "--dy": s.dy })}>
                  <img src={`${IMG}/${s.img}.webp`} alt="" className="gn3-fl-side-img" />
                  <span className="gn3-fl-side-badge">特集</span>
                  <span className="gn3-fl-side-title">
                    <Lines rows={s.title} />
                  </span>
                  <span className="gn3-fl-side-desc">
                    <Lines rows={s.desc} />
                  </span>
                  <span className="gn3-fl-side-date">{s.date}</span>
                </Link>
              </li>
            ))}
          </ul>
          <span className="gn3-fl-hair gn3-fl-p" style={v({ "--x": 704, "--y": 530.5, "--w": 333, "--h": 2 })} aria-hidden="true" />
          <span className="gn3-fl-hair gn3-fl-p" style={v({ "--x": 704, "--y": 635.5, "--w": 333, "--h": 2 })} aria-hidden="true" />
        </section>

        {/* ───────── 新着の特集記事 ───────── */}
        <span id="fl-new" className="gn3-fl-anc gn3-fl-p" style={v({ "--y": 745 })} aria-hidden="true" />
        <section className="gn3-fl-sec" aria-labelledby="fl-new-h">
          <h2 id="fl-new-h" className="gn3-fl-h gn3-fl-p" style={v({ "--x": 50, "--y": 753, "--f": 19 })}>
            <span>新着の特集記事</span>
          </h2>
          <More x={897} y={757} label="すべての特集記事を見る" />
          <ul className="gn3-fl-new">
            {FL_NEW.map((n) => (
              <li key={n.img} className="gn3-fl-card gn3-fl-p" style={v({ "--x": n.x, "--y": 785, "--w": n.w, "--h": 237 })}>
                <Link href={FL_ARTICLE} className="gn3-fl-card-a">
                  <img src={`${IMG}/${n.img}.webp`} alt="" className="gn3-fl-card-img" />
                  <span className={`gn3-fl-chip gn3-fl-chip-${n.kind}`}>{n.cat}</span>
                  <span className="gn3-fl-card-title">
                    <Lines rows={n.title} />
                  </span>
                  <span className="gn3-fl-card-desc">
                    <Lines rows={n.desc} />
                  </span>
                  <span className="gn3-fl-card-date">{n.date}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ───────── シーンで選ぶ 特集 ───────── */}
        <span id="fl-scene" className="gn3-fl-anc gn3-fl-p" style={v({ "--y": 1033 })} aria-hidden="true" />
        <section className="gn3-fl-sec" aria-labelledby="fl-scene-h">
          <h2 id="fl-scene-h" className="gn3-fl-h gn3-fl-p" style={v({ "--x": 51, "--y": 1041, "--f": 20 })}>
            <span>シーンで選ぶ</span> <b>特集</b>
          </h2>
          <More x={959} y={1047} label="すべて見る" />
          <ul className="gn3-fl-scene">
            {FL_SCENE.map((s) => (
              <li key={s.img} className="gn3-fl-scene-i gn3-fl-p" style={v({ "--x": s.x, "--y": 1074, "--w": s.w, "--h": 162 })}>
                <Link href={FL_BASE} className="gn3-fl-scene-a">
                  <img src={`${IMG}/${s.img}.webp`} alt="" className="gn3-fl-scene-img" />
                  <span className="gn3-fl-scene-title">{s.title}</span>
                  <span className="gn3-fl-scene-desc">
                    <Lines rows={s.desc} />
                  </span>
                  <span className="gn3-fl-scene-count">{s.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ───────── 下段 3 列(エリア・料理・カフェ時間) ───────── */}
        <span className="gn3-fl-vline gn3-fl-p" style={v({ "--x": 373.5, "--y": 1255, "--w": 2, "--h": 170 })} aria-hidden="true" />
        <span className="gn3-fl-vline gn3-fl-p" style={v({ "--x": 713.5, "--y": 1255, "--w": 2, "--h": 170 })} aria-hidden="true" />
        {FL_GROUPS.map((g) => (
          <span key={`${g.id}-anc`} id={g.id} className="gn3-fl-anc gn3-fl-p" style={v({ "--y": 1247 })} aria-hidden="true" />
        ))}
        {FL_GROUPS.map((g) => (
          <section key={g.id} className="gn3-fl-sec gn3-fl-grp" aria-labelledby={`${g.id}-h`}>
            <h2 id={`${g.id}-h`} className="gn3-fl-h gn3-fl-p" style={v({ "--x": g.x, "--y": 1255, "--f": 16 })}>
              <span>{g.title}</span> <b>特集</b>
            </h2>
            <More x={g.linkX - 2} y={1260} label="すべて見る" />
            <ul className="gn3-fl-bot">
              {g.items.map((it) => (
                <li key={it.img} className="gn3-fl-bot-i gn3-fl-p" style={v({ "--x": it.x, "--y": 1282, "--w": it.w, "--h": 135 })}>
                  <Link href={FL_BASE} className="gn3-fl-bot-a">
                    <img src={`${IMG}/${it.img}.webp`} alt="" className="gn3-fl-bot-img" />
                    <span className="gn3-fl-bot-title">{it.title}</span>
                    <span className="gn3-fl-bot-count">{it.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
