import type { CSSProperties } from "react";
import type { DishPhoto } from "@/lib/portal/hubs/nigiwai/photos";
import { P1, P2, P4, VOICE1, VOICE2 } from "./copy";
import StatementMotion from "./StatementMotion";

/**
 * 下のブロック。コンセプト 3 の本文の全文を、朱の地に生成りの白で組む（サーバー）。
 * 2 つの声（本文の第 3 段落）は画面の主役の大きさで、料理の写真（丸）のそばに置く。写真は飾り（alt なし）。
 * 画面に入ると、声が立ち上がり、写真が回りながら集まる（StatementMotion。動きを減らす設定では、はじめから出ている）。
 */

const Voice = ({ text, side, photo, n, at }: { text: string; side: "l" | "r"; photo?: DishPhoto; n: number; at: number }) => {
  const q = (t: string) => <span className="q">{t}</span>;
  const inner = text.slice(1, -1);
  return (
    <span className={`ng-voice v${n} ${side}`} data-rv="">
      {photo && (
        <span className="dish" aria-hidden="true">
          <i className="rg" />
          <i className="rg" />
          <span className="ph">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} srcSet={photo.srcSet} sizes="(max-width: 760px) 44vw, 24vw" alt="" loading="lazy" decoding="async" draggable={false} style={{ objectPosition: photo.pos }} />
          </span>
        </span>
      )}
      <span className="t">
        <span className="ln">
          {q(text[0])}
          {inner.slice(0, at)}
        </span>
        <span className="ln">
          {inner.slice(at)}
          {q(text[text.length - 1])}
        </span>
      </span>
    </span>
  );
};

export default function Statement({ side }: { side: DishPhoto[] }) {
  return (
    <section className="ng-st" aria-label="マチノワについて">
      <StatementMotion />
      <div className="ng-st-ring" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="ng-st-in">
        <div className="ng-st-lead">
          <p className="ng-st-p1" data-rv="">
            {P1}
          </p>
          <p className="ng-st-p2" data-rv="">
            {P2}
          </p>
        </div>
        <p className="ng-st-p3" style={{ ["--n" as string]: 2 } as CSSProperties}>
          <Voice text={VOICE1} side="l" photo={side[0]} n={1} at={6} />
          {"\n"}
          <Voice text={VOICE2} side="r" photo={side[1]} n={2} at={5} />
        </p>
        <p className="ng-st-p4" data-rv="">
          {P4}
        </p>
      </div>
    </section>
  );
}
