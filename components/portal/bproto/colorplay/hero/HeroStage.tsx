"use client";
/**
 * 案 2「留める」: 最初の画面(.cp-stage の中で position: sticky で留まる .cp-hero)を、スクロールの進み具合 0〜1 で場面に分ける。
 *   --sp-s       : 留まっている間の進み具合(CSS が色の広がり・形の回転・タブのせり上がりに使う)
 *   data-scene   : 0 赤 / 1 ピンク / 2 水色 / 3 黒(見出しの色・形・右上の札・印を入れ替える)
 *   data-pills   : 3 つのタブが見え始めたら 1(隠れている間は Tab キーで入らないように)
 *   data-end     : 留まりが終わったら 1(ヘッダーが白い帯になる)
 * 書くのは値が変わった時だけ。rAF は scroll / resize のたびに 1 回だけ。「動きを減らす」設定のときは何もしない(CSS が留めずに今の見た目にする)。
 */
import { useEffect, useRef } from "react";

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
// 色が切り替わる位置(CSS の .st-b1/2/3 の --a と対応: 広がりの途中で場面を切り替える)
const CUT = [0.17, 0.43, 0.69];

export default function HeroStage() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = ref.current?.closest<HTMLElement>(".cp-stage");
    const hero = stage?.querySelector<HTMLElement>(".cp-hero");
    if (!stage || !hero) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let on = false;
    let raf = 0;
    let lastS = "";
    let lastScene = -1;
    let lastEnd = "";
    let lastPills = "";

    const frame = () => {
      raf = 0;
      const r = stage.getBoundingClientRect();
      const total = Math.max(1, stage.offsetHeight - hero.offsetHeight);
      const s = clamp(-r.top / total);
      const str = s.toFixed(3);
      if (str !== lastS) {
        lastS = str;
        stage.style.setProperty("--sp-s", str);
      }
      const scene = s >= CUT[2] ? 3 : s >= CUT[1] ? 2 : s >= CUT[0] ? 1 : 0;
      if (scene !== lastScene) {
        lastScene = scene;
        stage.dataset.scene = String(scene);
      }
      const end = s >= 0.995 ? "1" : "0";
      if (end !== lastEnd) {
        lastEnd = end;
        stage.dataset.end = end;
      }
      const pills = s >= 0.78 ? "1" : "0";
      if (pills !== lastPills) {
        lastPills = pills;
        stage.dataset.pills = pills;
      }
    };
    const tick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (on) return;
      on = true;
      frame();
      window.addEventListener("scroll", tick, { passive: true });
      window.addEventListener("resize", tick, { passive: true });
    };
    const stop = () => {
      if (!on) return;
      on = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
      stage.style.removeProperty("--sp-s");
      stage.dataset.scene = "0";
      stage.dataset.end = "0";
      stage.dataset.pills = "0";
      lastS = "";
      lastScene = -1;
      lastEnd = "";
      lastPills = "";
    };
    const onMq = () => (mq.matches ? stop() : start());

    if (!mq.matches) start();
    mq.addEventListener("change", onMq);
    return () => {
      mq.removeEventListener("change", onMq);
      stop();
    };
  }, []);

  return <span ref={ref} hidden />;
}
