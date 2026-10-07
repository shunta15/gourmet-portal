import type { CSSProperties } from "react";
import type { DishPhoto } from "@/lib/portal/hubs/nigiwai/photos";
import { P1_LINES, P2, P3 } from "./copy";
import StatementMotion from "./StatementMotion";

/**
 * 下のブロック。コンセプトの本文の全文（COPY-FINAL.md）を、最初の画面と同じ世界で組む（サーバー）。
 *
 * 主役は第 1 段落の 3 行。「店と出会う → 人とつながる → 輪が広がる」を、3 つの場面にして、絵でも順に分かるようにする。
 *   1 店と出会う。 … 1 枚の写真（店の窓が写る 1 皿）を、細い輪が囲む。
 *   2 人とつながる。… 写真が 3 枚になり、細い線でつながって、小さな輪になる。
 *   3 輪が広がる。 … 写真が輪になって回り、輪が外へ広がっていく（最初の画面の輪と同じ姿）。
 * 第 2 段落は、場面のあとに静かに置く。第 3 段落（結び）は、輪に囲まれて、はっきり読める大きさで置く。
 * 写真は飾り（alt なし・読み上げの外）。言葉は COPY-FINAL.md のとおり。1 文字も足さない（番号・飾りの語を付けない）。
 * 第 1 段落の textContent は「3 行 + 改行（\n）」で、COPY-FINAL.md の段落と同じになる（場面の絵は文字を持たない）。
 * 画面に入ると、場面が順に立ち上がる（StatementMotion。動きを減らす設定・スクリプトなしでは、はじめから出ている）。
 */

const SIZES = "(max-width: 760px) 44vw, 24vw";

const Pic = ({ p, x, y, s, k, sizes = SIZES }: { p?: DishPhoto; x: number; y: number; s: number; k: number; sizes?: string }) =>
  p ? (
    <span className="pic" style={{ ["--x" as string]: `${x}%`, ["--y" as string]: `${y}%`, ["--s" as string]: `${s}%`, ["--k" as string]: k } as CSSProperties}>
      <span className="ph">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.src} srcSet={p.srcSet} sizes={sizes} alt="" loading="lazy" decoding="async" draggable={false} style={{ objectPosition: p.pos }} />
      </span>
    </span>
  ) : null;

/** 場面 3 の皿。位置は「輪の上の角度（ang）」と「輪の半径（CSS の --rr。スクロールで大きくなる）」で決まる。o は現れる順（0 から。小さい番号から先に出る） */
const OrbitPic = ({ p, ang, s, k, o }: { p?: DishPhoto; ang: number; s: number; k: number; o: number }) =>
  p ? (
    <span className="pic op" style={{ ["--ang" as string]: `${ang}deg`, ["--s" as string]: `${s}%`, ["--k" as string]: k, ["--o" as string]: o } as CSSProperties}>
      <span className="ph">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.src} srcSet={p.srcSet} sizes={SIZES} alt="" loading="lazy" decoding="async" draggable={false} style={{ objectPosition: p.pos }} />
      </span>
    </span>
  ) : null;

/** 句点は、最初の画面の見出しと同じ差し色にする（textContent は変わらない） */
const Line = ({ text }: { text: string }) => (
  <span className="ln">
    <span className="tx">
      {text.slice(0, -1)}
      <i className="mk">{text.slice(-1)}</i>
    </span>
  </span>
);

/** 場面 3 の輪（10 枚）の大きさ（直径の %）。隣どうしで少しずつ違える */
const RING_S = [24, 19, 22.5, 20, 25, 19.5, 23, 20, 24, 19.5];
/** 場面 3 の皿が現れる順（輪の位置ごと）。場面 2 の 3 枚（0・3・6 番目の位置。120° ずつ離れている）が先に出て、小さな輪から、皿が増えて輪が外へ広がる */
const RING_O = [0, 3, 4, 1, 5, 6, 2, 7, 8, 9];

export default function Statement({ ring, side }: { ring: DishPhoto[]; side: DishPhoto[] }) {
  const all = [...ring, ...side];
  // 場面に使う写真（コンタクトシートで 1 枚ずつ見て選んだ）。0〜15 は輪の 16 枚、16・17 は店の窓が写る洋食と卓上のだし巻き玉子
  const ph = (i: number) => all[i];
  const crab = ph(16); // 場面 1 の 1 枚（店の窓が写る）。場面 2・3 にも出る（同じ 1 皿が、つながり、輪の一枚になる）
  const trio = [crab, ph(3), ph(5)]; // 場面 2: 1 枚目は場面 1 と同じ
  const ringOrder = [16, 6, 0, 3, 10, 13, 5, 2, 11, 9]; // 場面 3 の輪（時計まわり）。場面 2 の 3 枚（16・3・5）が、120° ずつ離れた位置（0・3・6 番目）にいて、最初の小さな輪をつくる

  return (
    <section className="ng-st" aria-label="マチノワについて">
      <StatementMotion />
      <div className="ng-st-in">
        <p className="ng-st-p1">
          {/* 場面 1: 店と出会う */}
          <span className="act a1" data-rv="">
            <Line text={P1_LINES[0]} />
            <span className="scene" aria-hidden="true">
              <i className="orb o1" />
              <i className="orb o2" />
              <i className="orb o0" />
              <Pic p={crab} x={50} y={50} s={60} k={0} sizes="(max-width: 760px) 58vw, 340px" />
            </span>
          </span>
          {"\n"}
          {/* 場面 2: 人とつながる */}
          <span className="act a2" data-rv="">
            <Line text={P1_LINES[1]} />
            <span className="scene" aria-hidden="true">
              <svg className="net" viewBox="0 0 100 100" focusable="false">
                <path pathLength="1" style={{ ["--j" as string]: 0 } as CSSProperties} d="M18.8 73 A36 36 0 0 1 50 19" />
                <path pathLength="1" style={{ ["--j" as string]: 1 } as CSSProperties} d="M50 19 A36 36 0 0 1 81.2 73" />
                <path pathLength="1" style={{ ["--j" as string]: 2 } as CSSProperties} d="M81.2 73 A36 36 0 0 1 18.8 73" />
              </svg>
              <Pic p={trio[0]} x={18.8} y={73} s={29} k={0} />
              <Pic p={trio[1]} x={50} y={19} s={33} k={1} />
              <Pic p={trio[2]} x={81.2} y={73} s={26} k={2} />
            </span>
          </span>
          {"\n"}
          {/* 場面 3: 輪が広がる */}
          <span className="act a3" data-rv="" data-live="">
            <Line text={P1_LINES[2]} />
            <span className="scene" aria-hidden="true">
              <i className="rp" />
              <i className="rp" />
              <i className="rp" />
              <i className="orb o3" />
              <i className="orb o4" />
              <span className="spin">
                {ringOrder.map((n, i) => (
                  <OrbitPic key={n} p={ph(n)} ang={(360 / ringOrder.length) * i} s={RING_S[i]} k={i} o={RING_O[i]} />
                ))}
              </span>
            </span>
          </span>
        </p>

        <p className="ng-st-p2" data-rv="">
          {P2}
        </p>

        <div className="ng-st-end">
          <span className="halo" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <p className="ng-st-p3" data-rv="">
            {P3}
          </p>
        </div>
      </div>
      <i className="ng-st-seam" aria-hidden="true" />
    </section>
  );
}
