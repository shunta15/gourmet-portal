"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Bubble from "./Bubble";

const B = "/_portal/hproto/machi/lower/";
type Slide = { kick: string; t1: string; t2?: string; sub: string[]; btn: string; href: string; img: string; pw: number; ph: number; s: number; bub: { img: string; w: number; h: number; x: number; y: number; lines: string[]; f: number } };
const SLIDES: Slide[] = [
  { kick: "＼ いま注目 ／", t1: "いま行きたい！", t2: "おすすめのお店", sub: ["地元で愛される話題のお店を", "ピックアップ！"], btn: "お店を見る", href: "/gourmet", img: "card-pasta.webp", pw: 213, ph: 148, s: 1.35, bub: { img: "b-pasta.webp", w: 106, h: 72, x: 106, y: 2, lines: ["地元で人気の", "あのお店も！"], f: 11 } },
  { kick: "＼ 週末のおでかけに ／", t1: "家族でおでかけ", t2: "スポット", sub: ["公園・体験・レジャー施設など", "週末のおでかけ先に"], btn: "スポットを見る", href: "/leisure", img: "card-family.webp", pw: 207, ph: 148, s: 1.35, bub: { img: "b-family.webp", w: 120, h: 62, x: 62, y: 4, lines: ["家族で楽しめる", "スポットがいっぱい！"], f: 11 } },
  { kick: "＼ ペットといっしょ ／", t1: "ペットと楽しめる", t2: "お店", sub: ["一緒に入れるカフェ・お散歩スポット・", "ペットサービスをご紹介"], btn: "お店を見る", href: "/pet", img: "card-pet.webp", pw: 270, ph: 153, s: 1.31, bub: { img: "b-pet.webp", w: 120, h: 66, x: 144, y: 9, lines: ["ペットと一緒に", "おでかけしよう！"], f: 11.5 } },
  { kick: "＼ 新しいまちへ ／", t1: "エリアから探す", sub: ["エリアごとのお店・観光スポット・", "特集記事をまとめてチェック"], btn: "エリアを見る", href: "/search", img: "card-area.webp", pw: 267, ph: 153, s: 1.31, bub: { img: "b-area.webp", w: 130, h: 58, x: 132, y: 16, lines: ["ちょっと足をのばして", "新しいまちに出会う"], f: 11.5 } },
];
const N = SLIDES.length + 1;
const INTERVAL = 4500;

export default function Slider() {
  const [i, setI] = useState(0);
  const hover = useRef(false);
  const last = useRef(0);
  const go = useCallback((n: number) => { last.current = performance.now(); setI(((n % N) + N) % N); }, []);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.hidden || hover.current) return;
      if (performance.now() - last.current < INTERVAL - 200) return;
      last.current = performance.now();
      setI((n) => (n + 1) % N);
    }, 500);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="hm-l-slider" onPointerEnter={() => { hover.current = true; }} onPointerLeave={() => { hover.current = false; last.current = performance.now(); }} data-slide={i}>
      <div className="hm-l-stage">
        <div className={`hm-l-sl hm-l-sl1${i === 0 ? " is-on" : ""}`} aria-hidden={i !== 0}>
          <img className="hm-l-slimg" src={`${B}slide1.webp`} alt="" width={609} height={254} />
          <p className="hm-l-kick hm-hand">＼ 今の季節に行きたい！ ／</p>
          <h2 className="hm-l-spring hm-press">
            <span className="hm-l-haru">春</span><span className="hm-l-no">の</span><span className="hm-l-odekake">おでかけ</span>
            <span className="hm-l-tokushu">特集</span>
          </h2>
          <p className="hm-l-ssub hm-hand">花とグルメと、<br />やさしい時間に出会える<br />まちのおすすめスポット</p>
          <a className="hm-l-btn hm-press" href="/feature" tabIndex={i === 0 ? 0 : -1}>特集を見る <span aria-hidden>→</span></a>
          <Bubble img="" w={180} h={80} x={424} y={26} lines={["この季節、", "まちがもっと好きになる。", "#マチノワで見つけた"]} f={12.5} rot={-5} />
        </div>
        {SLIDES.map((s, k) => (
          <div key={k} className={`hm-l-sl hm-l-slx${i === k + 1 ? " is-on" : ""}`} aria-hidden={i !== k + 1}>
            <img className="hm-l-slimg hm-l-blur" src={`${B}${s.img}`} alt="" />
            <div className="hm-l-wash" />
            <p className="hm-l-kick hm-hand">{s.kick}</p>
            <h2 className="hm-l-xt hm-pop-font hm-press">{s.t1}{s.t2 && <><br />{s.t2}</>}</h2>
            <p className="hm-l-ssub hm-hand">{s.sub[0]}<br />{s.sub[1]}</p>
            <a className="hm-l-btn hm-press" href={s.href} tabIndex={i === k + 1 ? 0 : -1}>{s.btn} <span aria-hidden>→</span></a>
            <div className="hm-l-frame" style={{ "--pw": s.pw * s.s, "--ph": s.ph * s.s } as React.CSSProperties}>
              <img src={`${B}${s.img}`} alt="" />
              <Bubble img={s.bub.img} w={s.bub.w} h={s.bub.h} x={s.bub.x} y={s.bub.y} lines={s.bub.lines} f={s.bub.f} s={s.s} />
            </div>
          </div>
        ))}
      </div>
      <button type="button" aria-label="前の特集" className="hm-l-arrow hm-l-prev hm-press" onClick={() => go(i - 1)}>‹</button>
      <button type="button" aria-label="次の特集" className="hm-l-arrow hm-l-next hm-press" onClick={() => go(i + 1)}>›</button>
      <div className="hm-l-dots">
        {Array.from({ length: N }, (_, k) => (
          <button key={k} type="button" aria-label={`特集 ${k + 1}`} aria-current={i === k} className={`hm-l-dot${i === k ? " is-on" : ""}`} onClick={() => go(k)} />
        ))}
      </div>
    </div>
  );
}
