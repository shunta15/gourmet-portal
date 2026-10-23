import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { sized } from "@/lib/imageUrl";
import { rowOf, type PfPhoto, type PfText, type Rv } from "@/lib/portal/photoFeature/build";
import type { RpUnit } from "@/lib/portal/photoFeature/roundupMark";
import FootSmall from "../../FootSmall";

/**
 * シーン別まとめ記事・特集の一覧（写真が主役の形）の小さな部品（サーバーコンポーネント）。
 * 店舗特集記事の components/portal/photoFeature/PhotoFeaturePage.tsx の中の同名の部品（Fig・Text・Row・Nr・Dark）と、同じ class・同じ組み。
 * 動き（Motion）・入口の暖簾（Gate）・CSS（photofeature.css）は店舗特集記事のものをそのまま使うので、class 名を変えない。
 * （PhotoFeaturePage.tsx の中の部品は export されていない。別の担当が編集中のファイルなので、ここに同じ形で持つ。）
 */
export type Fx = CSSProperties & Record<`--${string}`, string | number>;

/** 写真 1 枚（枠の比 = 写真の比。画面に入ると傾きが落ち着く・中身が流れる、などは親の data-rv で決まる） */
export function Fig({ p, cls = "", par, ar, big = false, rv = true, k = 0, children }: { p: PfPhoto; cls?: string; par?: number | "flow"; ar?: number; big?: boolean; rv?: boolean; k?: number; children?: ReactNode }) {
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
export const sentences = (t: string) => t.split(/(?<=[。！？])(?![」」』）])/).filter((x) => x.length > 0);

/** 本文: 最初の数文。続きは「続きを読む」（JavaScript が無くても details で全文が読める）。fold には、続きの段落のあとに出すもの（店の情報など）を渡せる */
export function Text({ t, className = "", fold }: { t: PfText; className?: string; fold?: ReactNode }) {
  const hasFold = t.rest.length > 0 || !!fold;
  return (
    <div className={className}>
      <p>
        {sentences(t.head).map((x, i) => (
          <span key={i} className="pf-s" style={{ "--si": i } as Fx}>
            {x}
          </span>
        ))}
      </p>
      {hasFold && (
        <details className="pf-more">
          <summary>
            <span className="pf-more__o">続きを読む</span>
            <span className="pf-more__c">閉じる</span>
          </summary>
          <div className="pf-more__b">
            {t.rest.map((x, i) => (
              <p key={i}>{x}</p>
            ))}
            {fold}
          </div>
        </details>
      )}
    </div>
  );
}

/** 写真の列（1〜3 枚。横に接して並べる。高さはそろえる）。現れ方は親の [data-rvw] の data-rv で決まる */
export function Row({ photos, big = false, overlay, rv }: { photos: PfPhoto[]; big?: boolean; overlay?: Record<number, ReactNode>; rv?: Rv }) {
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

/** 小さな暖簾の種類（0〜4）: 番号で決める（揺れ方・上がり方が変わる） */
export const nrKind = (i: number) => ((i % 5) + 5) % 5;

/** 視点（店）の頭に掛ける小さな暖簾（竿 + 短い藍の布。字を 1 字ずつ染め抜く）。欧文の語は幅の重みの分だけ広い枠。飾りなので読み上げない */
export function Nr({ units, k, side = "l" }: { units: RpUnit[]; k: number; side?: "l" | "r" }) {
  const sway = [1.6, 2.4, 1.9, 3.0, 2.1][k % 5];
  const dur = [3.6, 4.6, 4.0, 5.2, 3.2][k % 5];
  const total = units.reduce((n, u) => n + u.w, 0);
  return (
    <span className={`pf-nr pf-nr--k${k % 5} pf-nr--${side}`} aria-hidden="true" style={{ "--sa": `${sway}deg`, "--sd": `${dur}s`, "--np": total } as Fx}>
      <i className="pf-nr__rod" />
      <span className="pf-nr__cl">
        {units.map((u, i) => (
          <b key={i} className="pf-nr__p" style={{ "--i": i, "--n": units.length, flexGrow: u.w } as Fx}>
            <em className={u.w > 1 ? "rp-lat" : undefined}>{u.t}</em>
          </b>
        ))}
      </span>
    </span>
  );
}

/** 暗い面（灰墨の地。夜の店先のように、提灯の灯りが写真を照らす） */
export function Dark({ children }: { children: ReactNode }) {
  return (
    <div className="pf-dark rp-dark">
      <span className="pf-lamp" aria-hidden="true"><i /></span>
      <span className="pf-lan pf-lan--l" aria-hidden="true"><i className="pf-lan__g" /><i className="pf-lan__c" /><i className="pf-lan__b" /></span>
      <span className="pf-lan pf-lan--r" aria-hidden="true"><i className="pf-lan__g" /><i className="pf-lan__c" /><i className="pf-lan__b" /></span>
      {children}
    </div>
  );
}

/** 上端の帯（ロゴ + 主なリンク） */
export function HeaderBar({ topHref, listHref, searchHref, current }: { topHref: string; listHref: string; searchHref: string; current?: "list" }) {
  return (
    <header className="pf-hd-bar">
      <Link href={topHref} className="pf-logo" aria-label="マチノワ グルメのトップへ">
        マチノワ<small>グルメ</small>
      </Link>
      <nav aria-label="主なリンク">
        <Link href={listHref} aria-current={current === "list" ? "page" : undefined}>特集</Link>
        <Link href={searchHref}>さがす</Link>
      </nav>
    </header>
  );
}

/** ページの下端（ロゴ・小さな文字の 1 行（FootSmall）・© の行） */
export function FooterBar() {
  return (
    <footer className="pf-ft">
      <p className="pf-ft__l">マチノワ</p>
      <FootSmall className="pf-ft__nav" />
      <p className="pf-ft__s">© 2026 マチノワ / 街の輪</p>
    </footer>
  );
}

/** ページの上端の竿と、読み進みの布・読み進みの印（どれも JS が動いたときだけ動く） */
export function RodAndHud({ topHref, listHref, searchHref }: { topHref: string; listHref: string; searchHref: string }) {
  return (
    <>
      <div className="pf-rod">
        <nav className="pf-rod__nav" aria-label="サイト内の主なリンク">
          <Link href={topHref}>グルメ</Link>
          <Link href={listHref}>特集</Link>
          <Link href={searchHref}>さがす</Link>
        </nav>
        <span className="pf-rod__tr" aria-hidden="true"><span className="pf-rod__cl"><b /></span></span>
        <i className="pf-rod__bar" aria-hidden="true" />
        <span className="pf-hud__no" aria-hidden="true"><b className="pf-hud__cur" /><b className="pf-hud__prev" /></span>
      </div>
      <div className="pf-hud" aria-hidden="true">
        <span className="pf-hud__line"><i /></span>
      </div>
    </>
  );
}
