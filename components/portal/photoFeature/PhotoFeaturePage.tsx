import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { sized } from "@/lib/imageUrl";
import { rowOf, type PfBlock, type PfData, type PfPhoto, type PfText, type PfView, type Rv } from "@/lib/portal/photoFeature/build";
import Motion from "./Motion";
import { Brush, Seal, Tate } from "./parts";

// 写真が主役の特集記事（試作）の中身（サーバーコンポーネント）。見た目は photofeature.css。
// 画面の 6〜7 割が写真になる組み: 写真を大きく、互い違い（左右）に、すき間を詰めて接する・少し重ねて並べる。文は短い（最初の数文だけ。残りは「続きを読む」）。
//   巻頭（主役の写真を大きく + 題の札が重なる）→ リード（短く）→ 視点 ×N（写真の列 + 縦書きの小見出しを写真の上に + 短い文）→ 写真だけの面 → 店の案内 → 締め
// 写真は元の縦横比のまま（枠の比 = 写真の比）。表示の幅は元の幅の 1.3 倍まで（--cap）。2 枚以上の視点は、写真を横に接して並べる（高さをそろえる）。

type Fx = CSSProperties & Record<`--${string}`, string | number>;

function Fig({ p, cls = "", par, ar, big = false, rv = true, k = 0, children }: { p: PfPhoto; cls?: string; par?: number | "flow"; ar?: number; big?: boolean; rv?: boolean; k?: number; children?: ReactNode }) {
  const st: Fx = { "--ar": ar ?? p.ar, "--cap": `${p.cap}px`, "--nh": p.nh || 9999, "--z": p.z, "--k": k };
  return (
    <figure className={`pf-ph${rv ? " pf-rv" : ""} ${cls}`} style={st}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="pf-img" data-par={par} src={sized(p.src, big ? 1600 : 1200)} alt={p.alt} loading="lazy" decoding="async" />
      {children}
    </figure>
  );
}

/** 本文: 最初の数文 + 「続きを読む」（JavaScript が無くても details で全文が読める） */
function Text({ t, className = "" }: { t: PfText; className?: string }) {
  return (
    <div className={className}>
      <p>{t.head}</p>
      {t.rest.length > 0 && (
        <details className="pf-more">
          <summary>
            <span className="pf-more__o">続きを読む</span>
            <span className="pf-more__c">閉じる</span>
          </summary>
          <div className="pf-more__b">
            {t.rest.map((x, i) => (
              <p key={i}>{x}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

/** 写真の列（1〜3 枚。横に接して並べる。高さはそろえる）。現れ方は親の [data-rvw] の data-rv で決まる */
function Row({ photos, big = false, overlay, rv }: { photos: PfPhoto[]; big?: boolean; overlay?: Record<number, ReactNode>; rv?: Rv }) {
  const r = rowOf(photos);
  const a0 = photos[0].ar;
  const arm = Math.min(1, Math.max(0.75, a0));
  return (
    <div className="pf-row" style={{ "--cols": r.fr, "--cap": `${r.cap}px`, "--arm": arm, "--n": photos.length } as Fx}>
      {photos.map((p, i) => (
        <Fig key={p.src} p={p} cls={i === 0 ? "pf-ph--m" : "pf-ph--s"} par={rv === "flow" ? "flow" : 0.3 + i * 0.35} big={big} rv={false} k={i}>
          {overlay?.[i]}
        </Fig>
      ))}
    </div>
  );
}

/** 視点の変わり方: 小見出しを写真の上に白抜きで乗せる（ov）/ 写真にかかる白い短冊（tz）。どちら側か */
const HEAD: Record<string, { kind: "ov" | "tz"; side: "l" | "r" }> = {
  A: { kind: "ov", side: "r" },
  B: { kind: "tz", side: "l" },
  C: { kind: "ov", side: "l" },
  D: { kind: "tz", side: "r" },
  E: { kind: "ov", side: "r" },
};

function ViewBlock({ view, variant, rv }: { view: PfView; variant: string; rv: Rv }) {
  const id = `v-${view.no}`;
  const n = view.photos.length;
  const h = HEAD[variant] ?? HEAD.A;
  const cls = `pf-v pf-v--${variant}${n === 0 ? " pf-v--bare" : n > 1 ? " pf-v--multi" : view.photos[0].port ? " pf-v--port" : ""}`;
  const heading = (
    <h2 id={`${id}-h`} className={`pf-${h.kind} pf-${h.side}${n === 0 ? " pf-hbare" : ""}`}>
      <span className="pf-no" aria-hidden="true">{view.no}</span>
      <Tate cols={view.cols} className="pf-vt" label={false} trigger={n > 0} />
      <span className="pf-vh">{view.name}</span>
    </h2>
  );
  return (
    <section className={cls} data-no={view.no} aria-labelledby={`${id}-h`}>
      {n > 0 ? (
        <div className="pf-v__ph">
          <div className="pf-cl__in" data-rvw="" data-rv={rv}>
            <Row photos={view.photos} rv={rv} />
            {heading}
          </div>
        </div>
      ) : (
        heading
      )}
      <div className="pf-v__tx pf-rv">
        {view.heading && <p className="pf-hd">{view.heading}</p>}
        <Text t={{ head: view.head, rest: view.rest }} />
      </div>
    </section>
  );
}

/** 写真の多い視点（または写真だけの面）: 画面に留めて、重なった写真をスクロールで 1 枚ずつ入れ替える（紙芝居）。JS が無い・動きを減らす設定のときは、写真が縦に並ぶ */
function StackBlock({ views, photos, owner }: { views: PfView[]; photos: PfPhoto[]; owner: number[] }) {
  const n = photos.length;
  const first = new Map<number, number>();
  owner.forEach((o, i) => {
    if (o >= 0 && !first.has(o)) first.set(o, i);
  });
  return (
    <section className="pf-stackw" data-no={views[0]?.no} data-no2={views[1]?.no} aria-label={views.length ? views.map((v) => v.name).join("・") : "写真"}>
      <div className="pf-stack" data-stack="" style={{ "--n": n, "--ex-pc": Math.min(2, 0.75 * n), "--ex-sp": Math.min(1.5, 0.5 * n) } as Fx}>
        <div className="pf-stack__stage">
          {photos.map((p, i) => {
            const o = owner[i];
            const v = o >= 0 ? views[o] : null;
            const isFirst = o >= 0 && first.get(o) === i;
            return (
              <Fig key={p.src} p={p} cls="pf-st" par={0.3} rv={false} k={i}>
                {v && (
                  <h2 id={isFirst ? `v-${v.no}-h` : undefined} className="pf-ov pf-l" aria-hidden={isFirst ? undefined : true}>
                    <span className="pf-no" aria-hidden="true">{v.no}</span>
                    <Tate cols={v.cols} className="pf-vt" label={false} />
                    {isFirst && <span className="pf-vh">{v.name}</span>}
                  </h2>
                )}
              </Fig>
            );
          })}
        </div>
      </div>
      {views.length > 0 && (
        <div className={`pf-stack__notes pf-stack__notes--${views.length}`}>
          {views.map((v) => (
            <div key={v.no} className="pf-v__tx pf-rv">
              {v.heading && <p className="pf-hd">{v.heading}</p>}
              <Text t={{ head: v.head, rest: v.rest }} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** 巻頭に写真を出した視点の文（小見出しは巻頭の写真の上にある） */
function NoteBlock({ view }: { view: PfView }) {
  return (
    <section className="pf-v pf-v--note" data-no={view.no} aria-label={view.name}>
      <div className="pf-v__tx pf-rv">
        {view.heading && <p className="pf-hd">{view.heading}</p>}
        <Text t={{ head: view.head, rest: view.rest }} />
      </div>
    </section>
  );
}

/** 縦長の写真の視点 a と、次の視点 b の写真を、高さをそろえて横に接して並べる。文は、それぞれの写真の下に */
function PairBlock({ a, b, rv }: { a: PfView; b: PfView; rv: Rv }) {
  const photos = [...a.photos, ...b.photos];
  const bw = b.photos.reduce((x, p) => x + p.ar, 0);
  const rr = rowOf(photos);
  const idA = `v-${a.no}`;
  const idB = `v-${b.no}`;
  const head = (v: PfView, id: string, kind: "ov" | "tz", side: "l" | "r") => (
    <h2 id={`${id}-h`} className={`pf-${kind} pf-${side}`}>
      <span className="pf-no" aria-hidden="true">{v.no}</span>
      <Tate cols={v.cols} className="pf-vt" label={false} trigger />
      <span className="pf-vh">{v.name}</span>
    </h2>
  );
  return (
    <section className="pf-v pf-pr" data-no={a.no} data-no2={b.no} style={{ "--cap": `${rr.cap}px` } as Fx} aria-label={`${a.name}・${b.name}`}>
      <div className="pf-pr__ph">
        <div className="pf-cl__in" data-rvw="" data-rv={rv}>
          <Row photos={photos} rv={rv} overlay={{ 0: head(a, idA, "ov", "l"), [photos.length - 1]: head(b, idB, "ov", "r") }} />
        </div>
      </div>
      <div className="pf-pr__tx" style={{ "--cols2": `${a.photos[0].ar}fr ${bw}fr` } as Fx}>
        {[a, b].map((v) => (
          <div key={v.no} className="pf-v__tx pf-rv">
            {v.heading && <p className="pf-hd">{v.heading}</p>}
            <Text t={{ head: v.head, rest: v.rest }} />
          </div>
        ))}
      </div>
    </section>
  );
}

/** 写真だけの面の置き方（幅 100 の枠の中。l=左, t=上, w=幅（いずれも %）, ar=枠の縦横比）。写真は枠に合う比のものを割り当てる */
type Slot = { l: number; t: number; w: number; ar: number; z?: number };
const BAND: Record<number, { h: number; slots: Slot[] }> = {
  2: { h: 50, slots: [{ l: 0, t: 0, w: 60, ar: 1.5 }, { l: 59, t: 8, w: 41, ar: 1.15, z: 2 }] },
  3: { h: 48, slots: [{ l: 0, t: 0, w: 46, ar: 1.33 }, { l: 45, t: 0, w: 24, ar: 0.75, z: 2 }, { l: 68, t: 8, w: 32, ar: 1.2, z: 3 }] },
  4: { h: 54, slots: [{ l: 0, t: 0, w: 40, ar: 1.33 }, { l: 39, t: 6, w: 22, ar: 0.75, z: 2 }, { l: 60, t: 0, w: 40, ar: 1.5 }, { l: 24, t: 31, w: 38, ar: 1.5, z: 3 }] },
  5: {
    h: 56,
    slots: [{ l: 0, t: 0, w: 36, ar: 1.33 }, { l: 35, t: 5, w: 21, ar: 0.75, z: 2 }, { l: 55, t: 0, w: 30, ar: 1.33 }, { l: 84, t: 10, w: 16, ar: 0.75, z: 2 }, { l: 16, t: 27, w: 44, ar: 1.6, z: 3 }],
  },
  6: {
    h: 58,
    slots: [
      { l: 0, t: 0, w: 34, ar: 1.33 },
      { l: 33, t: 6, w: 19, ar: 0.75, z: 2 },
      { l: 51, t: 0, w: 30, ar: 1.33 },
      { l: 80, t: 8, w: 20, ar: 0.8, z: 2 },
      { l: 8, t: 27, w: 40, ar: 1.6, z: 3 },
      { l: 52, t: 29, w: 34, ar: 1.4, z: 3 },
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

function BandBlock({ photos, no, rv }: { photos: PfPhoto[]; no: number; rv: Rv }) {
  const list = photos.slice(0, 6);
  const tpl = BAND[list.length];
  const placed = assign(tpl.slots, list);
  return (
    <section className={`pf-band pf-band--${list.length}`} aria-label={`写真 ${no}`}>
      <div className="pf-band__in" data-rvw="" data-rv={rv} style={{ "--bh": `${tpl.h}cqw` } as Fx}>
        {tpl.slots.map((s, i) => (
          <div
            key={i}
            className="pf-b"
            data-drift={i % 2 === 0 ? "0.8" : "-1.1"}
            style={{ "--l": `${s.l}%`, "--t": `${s.t}cqw`, "--w": `${s.w}cqw`, "--cap": `${placed[i].cap}px`, "--ar0": placed[i].ar, zIndex: s.z ?? 1 } as Fx}
          >
            <Fig p={placed[i]} ar={s.ar} par={0.4 + (i % 3) * 0.3} cls={i > 0 && s.z ? "pf-sm" : ""} rv={false} k={i} />
          </div>
        ))}
        <Brush kind="dash" className="pf-band__br" delay={0.2} reveal />
      </div>
    </section>
  );
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
  const cover: Fx = { "--per": T.per, "--cols": T.cols.length, "--nh": hero && hero.nh ? Math.round(hero.nh * 1.3) : 9999 };
  return (
    <>
      <header className="pf-hd-bar">
        <Link href={topHref} className="pf-logo" aria-label="マチノワ グルメ 特集（試作）の入口">
          マチノワ<small>グルメ</small>
        </Link>
        <nav aria-label="主なリンク">
          <Link href={listHref}>特集の一覧</Link>
          {shopHref && <Link href={shopHref}>店ページを見る</Link>}
        </nav>
      </header>

      {/* 巻頭: 主役の写真（大きく）+ 縦書きの題の札が重なる + 朱の丸 */}
      <section className={`pf-cover${hero ? "" : " pf-cover--nophoto"}${D.coverPair ? " pf-cover--pair" : ""}`} style={cover} aria-label="巻頭">
        {hero && (
          <div className="pf-cover__ph" style={{ "--cap": `${D.coverPair ? rowOf([hero, ...D.coverPair.photos]).cap : hero.cap}px` } as Fx}>
            {D.coverPair ? (
              <div className="pf-cl__in">
                <Row
                  photos={[hero, ...D.coverPair.photos]}
                  big
                  overlay={{
                    1: (
                      <h2 id="v-cover-h" className="pf-ov pf-l">
                        <span className="pf-no" aria-hidden="true">{D.coverPair.no}</span>
                        <Tate cols={D.coverPair.cols} className="pf-vt" label={false} />
                        <span className="pf-vh">{D.coverPair.name}</span>
                      </h2>
                    ),
                  }}
                />
              </div>
            ) : (
              <Fig p={hero} cls="pf-hero" rv={false} big />
            )}
            <Brush kind="wave" className="pf-cover__br" delay={0.5} />
          </div>
        )}
        <div className="pf-cover__t">
          <span className="pf-tag" aria-hidden="true">特集</span>
          <Seal className="pf-cover__seal" delay={0.9} />
          {D.subCols.length > 0 && <Tate cols={D.subCols} className="pf-sub" />}
          <Tate cols={T.cols} as="h1" className="pf-ttl" animate delay={0.15} emFrom={T.em} />
        </div>
        {D.shop && (
          <p className="pf-cover__cap">
            <span className="pf-cover__name">
              <b>{D.shop.name}</b>
              {shopLine && <span>{shopLine}</span>}
            </span>
            {shopHref && (
              <Link href={shopHref} className="pf-btn pf-btn--sm pf-mag">
                店ページを見る →
              </Link>
            )}
          </p>
        )}
      </section>

      {/* リード（記事の文そのまま。最初の数文だけ見せて、残りは開く） */}
      <section className="pf-lede" aria-label="導入">
        <Text t={D.lede} className="pf-lede__in pf-rv" />
      </section>

      <div id="main" className="pf-body">
        {D.blocks.map((b: PfBlock, i) =>
          b.kind === "view" ? (
            <ViewBlock key={i} view={b.view} variant={b.variant} rv={b.rv} />
          ) : b.kind === "pair" ? (
            <PairBlock key={i} a={b.a} b={b.b} rv={b.rv} />
          ) : b.kind === "note" ? (
            <NoteBlock key={i} view={b.view} />
          ) : b.kind === "stack" ? (
            <StackBlock key={i} views={b.views} photos={b.photos} owner={b.owner} />
          ) : (
            <BandBlock key={i} photos={b.photos} no={b.no} rv={b.rv} />
          ),
        )}
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
              <Link href={shopHref} className="pf-btn pf-mag">
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
      {(D.quote.length > 0 || D.closing.head) && (
        <section className="pf-end" aria-label="締めの文">
          <div className="pf-end__in pf-rv">
            {D.quote.length > 0 && (
              <blockquote className="pf-quote">
                {D.quote.map((x, i) => (
                  <p key={i}>{x}</p>
                ))}
              </blockquote>
            )}
            {D.closing.head && <Text t={D.closing} className="pf-closing" />}
            {/* 締めの文の下に、筆の跡が引かれ、朱の印が押される */}
            <div className="pf-end__sig" aria-hidden="true">
              <Brush kind="dash" className="pf-end__brush" delay={0.1} reveal />
              <Seal className="pf-end__seal" delay={0.95} reveal />
            </div>
            <p className="pf-acts pf-acts--end">
              {shopHref && (
                <Link href={shopHref} className="pf-btn pf-mag">
                  店ページを見る →
                </Link>
              )}
              <Link href={listHref} className="pf-btn pf-btn--ghost">
                特集の一覧へ →
              </Link>
            </p>
          </div>
        </section>
      )}

      <footer className="pf-ft">
        <p className="pf-ft__l">マチノワ</p>
        <p className="pf-ft__s">© 2026 マチノワ / 街の輪（試作 — 非公開のページです）</p>
      </footer>

      {/* 読み進みの印（画面の端の朱の線 + いまの視点の番号）と、店ページへの小さなボタン。どちらも JS が動いたときだけ出る */}
      <div className="pf-hud" aria-hidden="true">
        <span className="pf-hud__line"><i /></span>
        <span className="pf-hud__no"><b className="pf-hud__cur" /><b className="pf-hud__prev" /></span>
      </div>
      {shopHref && (
        <Link href={shopHref} className="pf-fab pf-btn pf-btn--sm pf-mag" tabIndex={-1} aria-hidden="true">
          店ページを見る →
        </Link>
      )}

      {/* 動き・大きく見る幕（記事のページごとに付く。入口のページには付かない） */}
      <Motion />
    </>
  );
}
