/* eslint-disable @next/next/no-img-element */
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { IMG } from "./const";
import { seasonNowJst, type Season } from "./season";
import { getSeason, subscribeSeason } from "./seasonStore";

const B = `${IMG}/lower/`;

/**
 * 特集スライド 9 枚: ①季節の特集(最初の画面の季節と連動)+②〜⑨ 業種の特集(8 業種)。
 *  - side = 文字を置く側。写真の人や見せ所の反対側に置く(l=左 / r=右)
 *  - op = 写真の縦の切り取り位置(object-position の y)
 *  - リンク先は本番 https://machinowa.tokyo で 200 になる実在のページだけ(2026-10-20 確認)。文はリンク先の中身に合わせる
 */
type Slide = {
  img: string; side: "l" | "r"; op: number; col: string; ink?: string;
  t1: string; t1b: string; t2: string; sub: [string, string]; btn?: string; href?: string; // btn・href が無いスライドはボタンを出さない(2026-10-26 総合トップから業種以外への行き先 /feature を外した)
};

// 季節の色は最初の画面の季節の札(hero.css .h2-st-*)と同じ
const SEASON_SLIDE: Record<Season, Slide> = {
  spring: { img: "sl-s-spring.webp", side: "r", op: 70, col: "#e8648e", t1: "春", t1b: "のまちで、", t2: "新しい好きに出会う。", sub: ["東京・中目黒、目黒川の桜並木へ。", "見頃は3月末から4月初旬が目安。"], btn: "春の特集を見る", href: "/feature/new-nakameguro-walk" },
  summer: { img: "sl-s-summer.webp", side: "r", op: 40, col: "#1f86dc", t1: "夏", t1b: "のまちで、", t2: "浴衣で夜のまちへ。", sub: ["兵庫・城崎温泉、柳並木の川ぞいを", "浴衣で歩く、七つの外湯めぐり。"], btn: "夏の特集を見る", href: "/feature/hyogo-kinosaki-onsen-soto" },
  autumn: { img: "sl-s-autumn.webp", side: "r", op: 45, col: "#e0502a", t1: "秋", t1b: "のまちで、", t2: "紅葉の道をたどろう。", sub: ["大阪・箕面、渓谷ぞいの滝みち。", "紅葉の盛りは11月後半から12月初旬が目安。"], btn: "秋の特集を見る", href: "/feature/osaka-minoo-falls" },
  winter: { img: "sl-s-winter.webp", side: "r", op: 12, col: "#3aa6d4", t1: "冬", t1b: "のまちで、", t2: "ぬくもりに出会う。", sub: ["湯けむりの町を歩く特集など、", "まち歩きの記事を一覧から探せます。"] },
};
const VSL: Slide[] = [
  { img: "sl-v-gourmet.webp", side: "r", op: 60, col: "#f27b2f", t1: "グルメ", t1b: "で、", t2: "今日の一軒を探そう。", sub: ["ランチ・個室・宴会など、シーン別の", "まとめ記事と街歩きを読めます。"] },
  { img: "sl-v-beauty.webp", side: "r", op: 15, col: "#ee5d8e", t1: "ビューティー", t1b: "で、", t2: "ヘッドスパを知る。", sub: ["鹿児島・上之園町の美容室を紹介。", "カットやカラーのほか、ヘッドスパも。"], btn: "美容室の特集を見る", href: "/beauty/shop/be0001" },
  { img: "sl-v-bodycare.webp", side: "l", op: 10, col: "#4aa84a", t1: "ボディケア", t1b: "で、", t2: "個室の整体を知る。", sub: ["新潟・長岡市の整体サロンを紹介。", "施術はオール個室と案内する店です。"], btn: "整体の特集を見る", href: "/bodycare/shop/bo0018" },
  { img: "sl-v-pet.webp", side: "r", op: 50, col: "#8b6cf0", t1: "ペット", t1b: "と、", t2: "過ごす場所を探す。", sub: ["トリミングやペットホテルなどを、", "種類とエリアから探せます。"], btn: "ペットを見る", href: "/pet" },
  { img: "sl-v-stay.webp", side: "l", op: 40, col: "#f6b620", ink: "#4a3200", t1: "ステイ", t1b: "で、", t2: "窓の景色を楽しむ。", sub: ["ホテルや旅館、グランピングなどを、", "種類とエリアから探せます。"], btn: "ステイを見る", href: "/stay" },
  // ペット・ステイ・体験・スポーツ・くらしの文は「〇〇などを、種類とエリアから探せます。」にそろえる。掲載の件数は文に入れない(件数が変わっても嘘にならない言い方)。
  // 並べる種類は、いま載っている店の種類だけ(2026-10-22 確認: ペット=トリミング・ペットホテル・動物病院・カフェ・ペットショップ / ステイ=ホテル・旅館・グランピング・民宿・一棟貸し / 体験=海川・山空・ものづくり / スポーツ=ジム・格闘技・ゴルフ / くらし=教室・神社・写真館・工芸の店)。
  // 店の種類を増やしたら、ここも合わせる。体験・スポーツ・くらしの追加は 2026-10-22(並びは lib/verticals の VERTICAL_ORDER)。写真は credits.json(CC0・パブリックドメイン)
  { img: "sl-v-activity.webp", side: "r", op: 50, col: "#2f8de0", t1: "アクティビティ", t1b: "で、", t2: "体験の場所を探す。", sub: ["海・山・ものづくりなどの体験を、", "種類とエリアから探せます。"], btn: "アクティビティを見る", href: "/activity" },
  { img: "sl-v-sports.webp", side: "r", op: 50, col: "#17a398", t1: "スポーツ", t1b: "で、", t2: "体を動かしにいこう。", sub: ["ジム・格闘技・ゴルフなどを、", "種類とエリアから探せます。"], btn: "スポーツを見る", href: "/sports" },
  { img: "sl-v-life.webp", side: "l", op: 50, col: "#7fa82f", t1: "くらし", t1b: "で、", t2: "身近な店や教室を探す。", sub: ["習い事・神社・写真館などを、", "種類とエリアから探せます。"], btn: "くらしを見る", href: "/life" },
];
const N = 1 + VSL.length;
const INTERVAL = 4500;

type Layer = { id: number; season: Season };

/** 特集の大きなスライド。①は最初の画面の季節(seasonStore)に合わせて入れ替わる。4.5 秒ごとに自動で切り替え(乗せている間は止まる)。矢印・丸で切り替え。丸は進み具合が伸びる。 */
export default function Slider() {
  const [i, setI] = useState(0);
  // サーバーの最初の季節と同じ決め方(日本時間の今日の月)。最初の画面の季節が分かったら合わせる
  const [layers, setLayers] = useState<Layer[]>(() => [{ id: 0, season: seasonNowJst() }]);
  const nid = useRef(0);
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
  useEffect(() => {
    const cur = getSeason();
    if (cur) setLayers((l) => (l[l.length - 1].season === cur ? l : [{ id: 0, season: cur }]));
    let t = 0;
    const un = subscribeSeason((s) => {
      setLayers((l) => (l[l.length - 1].season === s ? l : [l[l.length - 1], { id: ++nid.current, season: s }]));
      window.clearTimeout(t);
      t = window.setTimeout(() => setLayers((l) => l.slice(-1)), 1300);
    });
    return () => { un(); window.clearTimeout(t); };
  }, []);

  const top = layers[layers.length - 1];
  const slides: Slide[] = [SEASON_SLIDE[top.season], ...VSL];
  return (
    <div className="h2-slider" onPointerEnter={() => { hover.current = true; }} onPointerLeave={() => { hover.current = false; last.current = performance.now(); }} data-slide={i} data-season={top.season}>
      {slides.map((s, k) => {
        const lay = k === 0 ? layers : null;
        return (
          <div key={k} className={`h2-sl h2-sl-${s.side}${i === k ? " is-on" : ""}${s.t1.length >= 5 ? " is-long" : ""}${s.t1.length >= 7 ? " is-xlong" : ""}`} aria-hidden={i !== k} style={{ ["--c" as string]: s.col, ["--op" as string]: `${s.op}%`, ...(s.ink ? { ["--btc" as string]: s.ink } : {}) }}>
            <span className="h2-slm">
              {lay
                ? lay.map((l, j) => <img key={l.id} className={`h2-slimg${lay.length > 1 && j === lay.length - 1 ? " is-new" : ""}`} src={`${B}${SEASON_SLIDE[l.season].img}`} alt="" style={{ objectPosition: `50% ${SEASON_SLIDE[l.season].op}%` }} />)
                : <img className="h2-slimg" src={`${B}${s.img}`} alt="" />}
            </span>
            <img className="h2-slhaze" src={`${B}slide-haze.webp`} alt="" />
            <h2 key={k === 0 ? `h${top.season}` : undefined} className="h2-sh h2-press"><span className="h2-sh1"><b>{s.t1}</b>{s.t1b}</span><span className="h2-sh2">{s.t2}</span></h2>
            <p key={k === 0 ? `p${top.season}` : undefined} className="h2-ssub">{s.sub[0]}<br />{s.sub[1]}</p>
            {s.href && <a key={k === 0 ? `a${top.season}` : undefined} className="h2-sbtn h2-press" href={s.href} tabIndex={i === k ? 0 : -1}>{s.btn} <span aria-hidden>→</span></a>}
          </div>
        );
      })}
      <p className="h2-sbub h2-kure h2-jump2" aria-hidden={i !== 0}><span>いつものまちが</span><span>もっと特別に見える。</span></p>
      <button type="button" aria-label="前の特集" className="h2-arrow h2-prev h2-press" onClick={() => go(i - 1)}>‹</button>
      <button type="button" aria-label="次の特集" className="h2-arrow h2-next h2-press" onClick={() => go(i + 1)}>›</button>
      <div className="h2-dots">
        {Array.from({ length: N }, (_, k) => (
          <button key={k} type="button" aria-label={`特集 ${k + 1}`} aria-current={i === k} className={`h2-dot${i === k ? " is-on" : ""}`} onClick={() => go(k)} />
        ))}
      </div>
    </div>
  );
}
