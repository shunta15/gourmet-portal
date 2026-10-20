"use client";
import { useEffect } from "react";

/**
 * 余白パターン 2(/proto-home/sp-2)の「節の間の帯」(罫線・番号・切り絵)が、スクロールで画面に入ったときに出る動き。
 * DOM に印(クラス)を付けるだけ。見た目は sp2.css:
 *  - .h2-sp2 に sp2-armed(これが付いて初めて「最初は隠す」状態になる。JS が動かない・動きを減らす設定のときは最初から最終の姿)
 *  - 各節(.h2-cats / .h2-feat / .h2-cards / .h2-band)に sp2-in(間の帯が少し見えたら付く。罫線が中央から伸び、切り絵が角からぽんと貼られる)
 * 画面に入らないまま長く置かれても(全体スクショ・書き出し・タブ復帰)、6 秒後に全部出す。prefers-reduced-motion では何もしない。
 */
export default function SpaceReveal() {
  useEffect(() => {
    const wrap = document.querySelector<HTMLElement>(".h2-sp2");
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const secs = Array.from(wrap.querySelectorAll<HTMLElement>(".h2-cats, .h2-feat, .h2-cards, .h2-band"));
    if (!secs.length) return;
    wrap.classList.add("sp2-armed");
    // 帯は節の上端のすぐ上にある。節の上端が画面の下端より 60px 上に来たら(帯が半分ほど見えたら)出す
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("sp2-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -60px 0px" });
    secs.forEach((s) => io.observe(s));
    const fb = window.setTimeout(() => secs.forEach((s) => { s.classList.add("sp2-in"); io.unobserve(s); }), 6000);
    return () => { window.clearTimeout(fb); io.disconnect(); wrap.classList.remove("sp2-armed"); };
  }, []);
  return null;
}
