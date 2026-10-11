import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { sized } from "@/lib/imageUrl";
import type { PfBlock, PfData, PfPhoto, PfView } from "@/lib/portal/photoFeature/build";
import { Brush, Seal, Tate } from "./parts";

// 写真が主役の特集記事（試作）の中身（サーバーコンポーネント）。見た目は photofeature.css。
// 組み: 巻頭（主役の写真＋縦書きの題＋朱の丸）→ リード → 視点 ×N（縦書きの小見出し・短い本文・写真 1〜3 枚。左右・大きさ・重なり方を視点ごとに変える）
//   → 写真だけの面（店ページの写真のコラージュ。足りなければ視点の写真を 2 枚の面にまとめる）→ 店の案内 → 締め。
// 写真は元の縦横比のまま（枠の比 = 写真の比）。表示の幅は、元の幅の 1.3 倍まで（--cap）。

type Fx = CSSProperties & Record<`--${string}`, string | number>;

function Fig({ p, cls = "", par = 0.6, ar, big = false }: { p: PfPhoto; cls?: string; par?: number; ar?: number; big?: boolean }) {
  const st: Fx = { "--ar": ar ?? p.ar, "--cap": `${p.cap}px` };
  return (
    <figure className={`pf-ph pf-rv ${cls}`} style={st}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="pf-img" data-par={par} src={sized(p.src, big ? 1600 : 1000)} alt={p.alt} loading="lazy" decoding="async" />
    </figure>
  );
}

/** 写真 1〜3 枚のまとまり。1 枚目は元の比のまま、2・3 枚目は 1 枚目の隅に重なって出る（位置は視点ごとの組み = CSS の .pf-v--X） */
function Cluster({ photos, big = false }: { photos: PfPhoto[]; big?: boolean }) {
  if (photos.length === 0) return null;
  const [a, b, c] = photos;
  return (
    <div className={`pf-cl pf-cl--${photos.length}`}>
      <div className="pf-cl__in" style={{ "--cap": `${a.cap}px` } as Fx}>
        <Fig p={a} cls="pf-p1" par={0.5} big={big} />
        {b && (
          <div className="pf-abs pf-p2" data-drift="1.2" style={{ "--k": b.port ? 0.72 : 1 } as Fx}>
            <Fig p={b} cls="pf-sm" par={0.9} />
          </div>
        )}
        {c && (
          <div className="pf-abs pf-p3" data-drift="-0.9" style={{ "--k": c.port ? 0.72 : 1 } as Fx}>
            <Fig p={c} cls="pf-sm" par={0.3} />
          </div>
        )}
      </div>
    </div>
  );
}

function Paras({ list }: { list: string[] }) {
  return (
    <>
      {list.map((t, i) => (
        <p key={i}>{t}</p>
      ))}
    </>
  );
}

function ViewBlock({ view, variant, idPrefix = "v" }: { view: PfView; variant: string; idPrefix?: string }) {
  const id = `${idPrefix}-${view.no}`;
  return (
    <section
      className={`pf-v pf-v--${variant}${view.photos.length === 0 ? " pf-v--bare" : view.photos[0].port ? " pf-v--port" : ""}`}
      style={{ "--hw": `${view.cols.length * 25 + 6}px` } as Fx}
      aria-labelledby={`${id}-h`}
    >
      <h2 id={`${id}-h`} className="pf-v__h pf-rv">
        <span className="pf-no" aria-hidden="true">{view.no}</span>
        <Tate cols={view.cols} className="pf-vt" label={false} />
        <span className="pf-vh">{view.name}</span>
      </h2>
      <div className="pf-v__tx pf-rv">
        {view.heading && <p className="pf-hd">{view.heading}</p>}
        <Paras list={view.paras} />
      </div>
      {view.photos.length > 0 && (
        <div className="pf-v__ph">
          <Cluster photos={view.photos} />
        </div>
      )}
    </section>
  );
}

/** 写真だけの面の置き方（幅 100 の枠の中。l=左, t=上, w=幅（いずれも %）, ar=枠の縦横比）。写真は枠に合う比のものを割り当てる */
type Slot = { l: number; t: number; w: number; ar: number; z?: number };
const BAND: Record<number, { h: number; slots: Slot[] }> = {
  2: { h: 54, slots: [{ l: 6, t: 2, w: 54, ar: 1.5 }, { l: 52, t: 14, w: 38, ar: 1, z: 2 }] },
  3: { h: 52, slots: [{ l: 0, t: 4, w: 48, ar: 1.33 }, { l: 42, t: 0, w: 26, ar: 0.75, z: 2 }, { l: 60, t: 24, w: 38, ar: 1.5, z: 3 }] },
  4: { h: 60, slots: [{ l: 0, t: 0, w: 40, ar: 1.33 }, { l: 36, t: 12, w: 22, ar: 0.75, z: 2 }, { l: 56, t: 0, w: 42, ar: 1.5 }, { l: 10, t: 34, w: 36, ar: 1.4, z: 3 }] },
  5: {
    h: 62,
    slots: [{ l: 0, t: 0, w: 36, ar: 1.33 }, { l: 33, t: 10, w: 20, ar: 0.75, z: 2 }, { l: 52, t: 0, w: 30, ar: 1.33 }, { l: 78, t: 14, w: 22, ar: 0.8, z: 2 }, { l: 14, t: 33, w: 42, ar: 1.6, z: 3 }],
  },
  6: {
    h: 64,
    slots: [
      { l: 0, t: 0, w: 34, ar: 1.33 },
      { l: 31, t: 10, w: 19, ar: 0.75, z: 2 },
      { l: 48, t: 0, w: 30, ar: 1.33 },
      { l: 76, t: 12, w: 24, ar: 0.8, z: 2 },
      { l: 8, t: 33, w: 38, ar: 1.6, z: 3 },
      { l: 56, t: 38, w: 30, ar: 1.4, z: 3 },
    ],
  },
};

/** 枠の比に近い写真から順に当てる（全部の組み合わせを見て、比のずれの合計がいちばん小さいもの） */
function assign(slots: Slot[], photos: PfPhoto[]): PfPhoto[] {
  const n = slots.length;
  let best: number[] = [...Array(n).keys()];
  let bestCost = Infinity;
  const used = new Array(n).fill(false);
  const cur: number[] = [];
  const rec = (k: number, cost: number) => {
    if (cost >= bestCost) return;
    if (k === n) {
      bestCost = cost;
      best = [...cur];
      return;
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = true;
      cur.push(i);
      rec(k + 1, cost + Math.abs(Math.log(photos[i].ar / slots[k].ar)));
      cur.pop();
      used[i] = false;
    }
  };
  rec(0, 0);
  return best.map((i) => photos[i]);
}

function BandBlock({ photos, no }: { photos: PfPhoto[]; no: number }) {
  const list = photos.slice(0, 6);
  const tpl = BAND[list.length];
  const placed = assign(tpl.slots, list);
  return (
    <section className={`pf-band pf-band--${list.length}`} aria-label={`写真 ${no}`}>
      <div className="pf-band__in" style={{ "--bh": `${tpl.h}cqw` } as Fx}>
        {tpl.slots.map((s, i) => (
          <div
            key={i}
            className="pf-b"
            data-drift={i % 2 === 0 ? "0.8" : "-1.1"}
            style={{ "--l": `${s.l}%`, "--t": `${s.t}cqw`, "--w": `${s.w}cqw`, "--cap": `${placed[i].cap}px`, "--ar0": placed[i].ar, zIndex: s.z ?? 1 } as Fx}
          >
            <Fig p={placed[i]} ar={s.ar} par={0.4 + (i % 3) * 0.3} cls={i > 0 && s.z ? "pf-sm" : ""} />
          </div>
        ))}
        <Brush kind="dash" className="pf-band__br" delay={0.2} reveal />
      </div>
    </section>
  );
}

function SpreadBlock({ a, b }: { a: PfView; b: PfView }) {
  const photos = [a.photos[0], b.photos[0], a.photos[1] ?? b.photos[1]].filter(Boolean) as PfPhoto[];
  return (
    <section className="pf-sp" aria-label={`${a.name}・${b.name}`}>
      <div className="pf-sp__top" style={{ "--hw": `${a.cols.length * 25 + 6}px` } as Fx}>
        <div className="pf-sp__h pf-sp__h--a pf-rv" aria-hidden="true">
          <span className="pf-no">{a.no}</span>
          <Tate cols={a.cols} className="pf-vt" label={false} />
        </div>
        <div className="pf-sp__ph">
          <Cluster photos={photos} big />
        </div>
        <div className="pf-sp__h pf-sp__h--b pf-rv" aria-hidden="true">
          <span className="pf-no">{b.no}</span>
          <Tate cols={b.cols} className="pf-vt" label={false} />
        </div>
      </div>
      <div className="pf-sp__tx">
        {[a, b].map((v) => (
          <div key={v.no} className="pf-sp__col pf-rv">
            <h2 className="pf-sp__t">
              <span className="pf-no">{v.no}</span>
              {v.name}
            </h2>
            {v.heading && <p className="pf-hd">{v.heading}</p>}
            <Paras list={v.paras} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Block({ b }: { b: PfBlock }): ReactNode {
  if (b.kind === "view") return <ViewBlock view={b.view} variant={b.variant} />;
  if (b.kind === "band") return <BandBlock photos={b.photos} no={b.no} />;
  return <SpreadBlock a={b.a} b={b.b} />;
}

export type PhotoFeaturePageProps = {
  data: PfData;
  /** 対の店ページの行き先（無ければ null） */
  shopHref: string | null;
  /** 特集の一覧の行き先 */
  listHref: string;
  /** この試作の入口 */
  topHref: string;
};

export default function PhotoFeaturePage({ data: D, shopHref, listHref, topHref }: PhotoFeaturePageProps) {
  const T = D.title;
  const hero = D.hero;
  const shopLine = D.shop ? [D.shop.cuisine, D.shop.area].filter(Boolean).join("　") : "";
  const cover: Fx = { "--per": T.per, "--cols": T.cols.length };
  return (
    <>
      <header className="pf-hd-bar">
        <Link href={topHref} className="pf-logo" aria-label="マチノワ グルメ 特集（試作）の入口">
          マチノワ<small>グルメ</small>
        </Link>
        <nav aria-label="主なリンク">
          <Link href={listHref}>特集の一覧</Link>
          {shopHref && <Link href={shopHref}>店ページ</Link>}
        </nav>
      </header>

      {/* 巻頭: 主役の写真 + 縦書きの題 + 朱の丸 */}
      <section className={`pf-cover${hero ? "" : " pf-cover--nophoto"}`} style={cover} aria-label="巻頭">
        {hero && (
          <div className="pf-cover__ph" style={{ "--cap": `${hero.cap}px` } as Fx}>
            <Fig p={hero} cls="pf-hero" par={0.6} big />
            <Brush kind="wave" className="pf-cover__br" delay={0.5} />
          </div>
        )}
        <div className="pf-cover__t">
          <span className="pf-tag" aria-hidden="true">特集</span>
          <Seal className="pf-cover__seal" delay={0.9} />
          <Brush kind="dash" className="pf-cover__br2" delay={1.1} />
          {D.subCols.length > 0 && <Tate cols={D.subCols} className="pf-sub" />}
          <Tate cols={T.cols} as="h1" className="pf-ttl" animate delay={0.15} emFrom={T.em} />
        </div>
        {D.shop && (
          <p className="pf-cover__cap">
            <b>{D.shop.name}</b>
            {shopLine && <span>{shopLine}</span>}
          </p>
        )}
      </section>

      {/* リード（記事の文そのまま） */}
      <section className="pf-lede" aria-label="導入">
        <div className="pf-lede__in pf-rv">
          <Paras list={D.lede} />
        </div>
      </section>

      <div id="main" className="pf-body">
        {D.blocks.map((b, i) => (
          <Block key={i} b={b} />
        ))}
      </div>

      {/* 店の案内 */}
      <section className="pf-info" aria-labelledby="pf-info-h">
        <div className="pf-info__in pf-rv">
          <h2 id="pf-info-h" className="pf-info__t">店の案内</h2>
          {D.info.length > 0 && (
            <dl className="pf-dl">
              {D.info.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="pf-acts">
            {shopHref && (
              <Link href={shopHref} className="pf-btn">
                店ページを見る →
              </Link>
            )}
            {D.mapsUrl && (
              <a href={D.mapsUrl} target="_blank" rel="noopener noreferrer" className="pf-btn pf-btn--ghost">
                Google マップで開く ↗<span className="pf-vh">（外部サイトが新しいタブで開きます）</span>
              </a>
            )}
            <Link href={listHref} className="pf-btn pf-btn--ghost">
              特集の一覧へ →
            </Link>
          </p>
        </div>
      </section>

      {/* 締め */}
      {(D.quote.length > 0 || D.closing.length > 0) && (
        <section className="pf-end" aria-label="締めの文">
          <div className="pf-end__in pf-rv">
            <Seal className="pf-end__seal" delay={0.2} reveal />
            {D.quote.length > 0 && (
              <blockquote className="pf-quote">
                <Paras list={D.quote} />
              </blockquote>
            )}
            {D.closing.length > 0 && (
              <div className="pf-closing">
                <Paras list={D.closing} />
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="pf-ft">
        <p className="pf-ft__l">マチノワ</p>
        <p className="pf-ft__s">© 2026 マチノワ / 街の輪（試作 — 非公開のページです）</p>
      </footer>
    </>
  );
}
