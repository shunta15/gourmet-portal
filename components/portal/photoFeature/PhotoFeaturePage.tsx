import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { sized } from "@/lib/imageUrl";
import { rowOf, type PfBlock, type PfData, type PfPhoto, type PfText, type PfView, type Rv } from "@/lib/portal/photoFeature/build";
import Motion from "./Motion";
import Gate from "./Gate";
import DoorLink from "./DoorLink";
import { Brush, Seal, Tate } from "./parts";
import type { PfRelated } from "@/lib/portal/photoFeature/related";

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

/** 文（。！？の後ろ）に分ける。字は変えない（つなげると元の文）。画面に入ったとき、文ごとに下から順に現れる */
const sentences = (t: string) => t.split(/(?<=[。！？])(?![」」』）])/).filter((x) => x.length > 0);

/** 本文: 最初の数文 + 「続きを読む」（JavaScript が無くても details で全文が読める） */
function Text({ t, className = "" }: { t: PfText; className?: string }) {
  return (
    <div className={className}>
      <p>
        {sentences(t.head).map((x, i) => (
          <span key={i} className="pf-s" style={{ "--si": i } as Fx}>
            {x}
          </span>
        ))}
      </p>
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

/** 小さな暖簾の種類（0〜4）: 視点の番号で決める（01〜05 が、それぞれ違う揺れ方・上がり方になる） */
const nrKind = (no: string) => (parseInt(no, 10) - 1 + 5) % 5;

/** 視点の頭に掛ける小さな暖簾（竿 + 短い藍の布 3 枚。番号と見出しの字を染め抜く）。揺れ方・上がり方は k（0〜4）で変える。飾りなので読み上げない */
function Nr({ chars, k, side = "l" }: { chars: string[]; k: number; side?: "l" | "r" }) {
  const sway = [1.6, 2.4, 1.9, 3.0, 2.1][k % 5];
  const dur = [3.6, 4.6, 4.0, 5.2, 3.2][k % 5];
  return (
    <span className={`pf-nr pf-nr--k${k % 5} pf-nr--${side}`} aria-hidden="true" style={{ "--sa": `${sway}deg`, "--sd": `${dur}s`, "--np": chars.length } as Fx}>
      <i className="pf-nr__rod" />
      <span className="pf-nr__cl">
        {chars.map((c, i) => (
          <b key={i} className="pf-nr__p" style={{ "--i": i, "--n": chars.length } as Fx}>
            <em>{c}</em>
          </b>
        ))}
      </span>
    </span>
  );
}

/** 暗い面（灰墨の地。夜の店先のように、提灯の灯りが写真を照らす）。写真だけの面・留める場面・横に流れる帯に使う */
function Dark({ children }: { children: ReactNode }) {
  return (
    <div className="pf-dark">
      <span className="pf-lamp" aria-hidden="true"><i /></span>
      <span className="pf-lan pf-lan--l" aria-hidden="true"><i className="pf-lan__g" /><i className="pf-lan__c" /><i className="pf-lan__b" /></span>
      <span className="pf-lan pf-lan--r" aria-hidden="true"><i className="pf-lan__g" /><i className="pf-lan__c" /><i className="pf-lan__b" /></span>
      {children}
    </div>
  );
}

/** 横に流れる帯: 写真が 1 枚ずつの視点 3 つの写真が、縦にスクロールすると横へ流れる（PC は画面に留めて横送り、スマホは横にはらう帯）。文は帯の下 */
function FilmBlock({ views, photos }: { views: PfView[]; photos: PfPhoto[] }) {
  return (
    <section className="pf-filmw" data-nos={views.map((v) => v.no).join(",")} aria-label={views.map((v) => v.name).join("・")}>
      <div className="pf-film" data-film="">
        <div className="pf-film__stage">
          <div className="pf-film__track">
            {photos.map((p, i) => (
              <Fig key={p.src} p={p} cls="pf-fs" rv={false} k={i} par={0.3}>
                <h2 id={`v-${views[i].no}-h`} className="pf-ov pf-l">
                  <span className="pf-no" aria-hidden="true">{views[i].no}</span>
                  <Tate cols={views[i].cols} className="pf-vt" label={false} />
                  <span className="pf-vh">{views[i].name}</span>
                </h2>
              </Fig>
            ))}
          </div>
        </div>
      </div>
      <div className="pf-film__notes">
        {views.map((v) => (
          <div key={v.no} className="pf-v__tx pf-rv">
            <Nr chars={v.nr} k={nrKind(v.no)} side="l" />
            {v.heading && <p className="pf-hd">{v.heading}</p>}
            <Text t={{ head: v.head, rest: v.rest }} />
          </div>
        ))}
      </div>
    </section>
  );
}

/** 店の案内の値: 席・予算・最寄りの数字（データにある数字だけ）は、画面に入ったとき数え上がる。JS が無ければ、そのままの値 */
const COUNT_KEYS = new Set(["席", "予算", "最寄り"]);
function InfoVal({ k, v }: { k: string; v: string }) {
  if (!COUNT_KEYS.has(k)) return <>{v}</>;
  // 最寄りは「徒歩 N 分」の N だけ（住所の番地などは数えない）。席・予算は、値の中の数字
  const re = k === "最寄り" ? /(\d[\d,]*)(?=分)/ : /(\d[\d,]*)/;
  return (
    <>
      {v.split(new RegExp(re.source)).map((x, i) =>
        i % 2 === 1 ? (
          <span key={i} className="pf-num" data-to={x.replace(/,/g, "")} data-comma={x.includes(",") ? "1" : undefined}>
            {x}
          </span>
        ) : (
          x
        ),
      )}
    </>
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

function ViewBlock({ view, variant, rv, nrk }: { view: PfView; variant: string; rv: Rv; nrk: number }) {
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
      <Nr chars={view.nr} k={nrk} side={h.side === "r" ? "l" : "r"} />
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
    <section className="pf-stackw" data-nos={views.map((v) => v.no).join(",") || undefined} aria-label={views.length ? views.map((v) => v.name).join("・") : "写真"}>
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
              <Nr chars={v.nr} k={nrKind(v.no)} side="l" />
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
function PairBlock({ a, b, rv, nrk }: { a: PfView; b: PfView; rv: Rv; nrk: number }) {
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
    <section className="pf-v pf-pr" data-nos={`${a.no},${b.no}`} style={{ "--cap": `${rr.cap}px` } as Fx} aria-label={`${a.name}・${b.name}`}>
      <Nr chars={a.nr} k={nrk} side="r" />
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

/** 暗い面になる区画（留める場面・横に流れる帯・写真だけの面）が続くときは、ひとつの暗い面にまとめる（和紙 ⇔ 灰墨の切り替えを、続けて 2 回しない） */
function renderBlocks(blocks: PfBlock[]): ReactNode[] {
  const out: ReactNode[] = [];
  let dark: ReactNode[] = [];
  const flush = (key: number) => {
    if (dark.length) out.push(<Dark key={`d${key}`}>{dark}</Dark>);
    dark = [];
  };
  blocks.forEach((b, i) => {
    if (b.kind === "stack") dark.push(<StackBlock key={i} views={b.views} photos={b.photos} owner={b.owner} />);
    else if (b.kind === "film") dark.push(<FilmBlock key={i} views={b.views} photos={b.photos} />);
    else if (b.kind === "band") dark.push(<BandBlock key={i} photos={b.photos} no={b.no} rv={b.rv} />);
    else {
      flush(i);
      if (b.kind === "view") out.push(<ViewBlock key={i} view={b.view} variant={b.variant} rv={b.rv} nrk={nrKind(b.view.no)} />);
      else if (b.kind === "pair") out.push(<PairBlock key={i} a={b.a} b={b.b} rv={b.rv} nrk={nrKind(b.a.no)} />);
      else out.push(<NoteBlock key={i} view={b.view} />);
    }
  });
  flush(blocks.length);
  return out;
}

export type PhotoFeaturePageProps = {
  data: PfData;
  /** 対の店ページの行き先（無ければ null） */
  shopHref: string | null;
  /** 特集の一覧の行き先 */
  listHref: string;
  /** グルメの入口の行き先（ロゴ・小さなリンク） */
  topHref: string;
  /** さがすの行き先（無ければ出さない） */
  searchHref?: string;
  /** 見本のページ（/proto-gourmet/photo-feature）のとき true。「試作」の表記を出す */
  proto?: boolean;
  /** 「ほかの特集記事」（最大 3 本）。空なら出さない */
  related?: PfRelated[];
};

export default function PhotoFeaturePage({ data: D, shopHref, listHref, topHref, searchHref, proto = false, related = [] }: PhotoFeaturePageProps) {
  const T = D.title;
  const hero = D.hero;
  const shopLine = D.shop ? [D.shop.cuisine, D.shop.area].filter(Boolean).join("　") : "";
  const cover: Fx = { "--per": T.per, "--cols": T.cols.length, "--nh": hero && hero.nh ? Math.round(hero.nh * 1.3) : 9999 };
  return (
    <>
      {/* 暖簾の入口（WebGL の布。使える端末だけ）: 最初の画面に藍の暖簾が掛かり、スクロール（またはタップ）で上がって、奥から主役の写真と題が現れる。
          布が使えない・動きを減らす・JS なしでは、この枠は何もせず、最初から写真と題が見える */}
      {D.shop && <Gate name={D.shop.name} units={D.gate} />}
      <div className="pf-open">
        <div className="pf-open__in">
      <header className="pf-hd-bar">
        <Link href={topHref} className="pf-logo" aria-label={proto ? "マチノワ グルメ 特集（試作）の入口" : "マチノワ グルメのトップへ"}>
          マチノワ<small>グルメ</small>
        </Link>
        <nav aria-label="主なリンク">
          <Link href={listHref}>特集の一覧</Link>
          {searchHref && <Link href={searchHref}>さがす</Link>}
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

        </div>
      </div>

      {/* リード（記事の文そのまま。最初の数文だけ見せて、残りは開く） */}
      <section className="pf-lede" aria-label="導入">
        <Text t={D.lede} className="pf-lede__in pf-rv" />
      </section>

      <div id="main" className="pf-body">
        {renderBlocks(D.blocks)}
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
                  <dd><InfoVal k={k} v={v} /></dd>
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
            {searchHref && (
              <Link href={searchHref} className="pf-btn pf-btn--ghost">
                さがす →
              </Link>
            )}
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
              <Link href={listHref} className="pf-btn pf-btn--ghost">
                特集の一覧へ →
              </Link>
              {searchHref && (
                <Link href={searchHref} className="pf-btn pf-btn--ghost">
                  さがす →
                </Link>
              )}
            </p>
            {/* 最後は、暖簾をくぐって店に入る（押すと布が上がる） */}
            {shopHref && D.shop && <DoorLink href={shopHref} name={D.shop.name} />}
          </div>
        </section>
      )}

      {/* ほかの特集記事（写真が主役の形で出す 20 本の中から、最大 3 本。同じ地域 → 同じ業種 → 並びの順） */}
      {related.length > 0 && (
        <section className="pf-rel" aria-labelledby="pf-rel-h">
          <div className="pf-rel__in pf-rv">
            <h2 id="pf-rel-h" className="pf-rel__t">ほかの特集記事</h2>
            <ul className="pf-rel__ul">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={r.href} className="pf-rel__a">
                    <span className="pf-rel__ph" aria-hidden="true">
                      {r.img && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="pf-rel__img" src={sized(r.img, 640)} alt="" loading="lazy" decoding="async" />
                      )}
                    </span>
                    <span className="pf-rel__b">
                      <b>{r.title}</b>
                      <small>{[r.shop, r.area].filter(Boolean).join("　")}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <footer className="pf-ft">
        <p className="pf-ft__l">マチノワ</p>
        <p className="pf-ft__s">{proto ? "© 2026 マチノワ / 街の輪（試作 — 非公開のページです）" : "© 2026 マチノワ / 街の輪"}</p>
      </footer>

      {/* ページの上端の竿と、読み進みに合わせて横へ進む小さな布（JS が動いたときだけ） */}
      <div className="pf-rod">
        <nav className="pf-rod__nav" aria-label="サイト内の主なリンク">
          <Link href={topHref}>グルメ</Link>
          <Link href={listHref}>特集</Link>
          {searchHref && <Link href={searchHref}>さがす</Link>}
        </nav>
        <span className="pf-rod__tr" aria-hidden="true"><span className="pf-rod__cl"><b /></span></span>
        <i className="pf-rod__bar" aria-hidden="true" />
        <span className="pf-hud__no" aria-hidden="true"><b className="pf-hud__cur" /><b className="pf-hud__prev" /></span>
      </div>

      {/* 読み進みの印（画面の端の朱の線 + いまの視点の番号）と、店ページへの小さなボタン。どちらも JS が動いたときだけ出る */}
      <div className="pf-hud" aria-hidden="true">
        <span className="pf-hud__line"><i /></span>
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
