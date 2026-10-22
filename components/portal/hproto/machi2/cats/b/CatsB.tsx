import Link from "next/link";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import { CATS_PROTO as CATS, CATS_HEADING } from "../../catsData";
import "./cats-b.css";

/**
 * 総合トップの業種の節 案 B「線画(タイポ主体)」。
 * 写真・色のついた丸・影・角丸の札は使わない。細い線画のアイコン(紺 1 色・線 1.5px)+太めのゴシックの業種名+サブ文+「見る →」を、
 * 生成りの紙の地に hairline の格子で並べる(1440 は 3×2、スマホは 2×3)。
 * 業種名・サブ文・リンク先は本番のまま(catsData)。Lower の `cats` の口に入れて使う(節の箱は Lower が持つ)。
 */
const kaku = Zen_Kaku_Gothic_New({ weight: ["500", "700", "900"], subsets: ["latin"], display: "swap", variable: "--cb-kaku" });

/** 線画のアイコン(48×48・塗りなし・線は currentColor)。線の太さは css(.cb-ic)で 1.5px / ホバーで 2.2px */
const ICON: Record<string, React.ReactNode> = {
  // 湯気の立つ椀
  gourmet: (
    <>
      <path d="M5 23h38" />
      <path d="M8 23c0 9 7 16 16 16s16-7 16-16" />
      <path d="M17 43h14" />
      <path d="M16 17c-2.5-2.5 2.5-4.5 0-7" />
      <path d="M24 17c-2.5-2.5 2.5-4.5 0-7" />
      <path d="M32 17c-2.5-2.5 2.5-4.5 0-7" />
    </>
  ),
  // 口紅
  beauty: (
    <>
      <path d="M15 43V29h18v14z" />
      <path d="M18 29v-9h12v9" />
      <path d="M18 20v-9l12-5v14" />
    </>
  ),
  // 積んだ石
  bodycare: (
    <>
      <ellipse cx="24" cy="11" rx="6" ry="4" />
      <ellipse cx="24" cy="20" rx="11" ry="5" />
      <ellipse cx="24" cy="33" rx="17" ry="8" />
    </>
  ),
  // 肉球
  pet: (
    <>
      <path d="M24 25c-6 0-12 7-12 12 0 4 3.5 5.5 7 4.2 3-1.1 7-1.1 10 0 3.5 1.3 7-.2 7-4.2 0-5-6-12-12-12z" />
      <ellipse cx="9" cy="22" rx="3.2" ry="4.6" transform="rotate(-20 9 22)" />
      <ellipse cx="17.5" cy="12.5" rx="3.6" ry="5" />
      <ellipse cx="30.5" cy="12.5" rx="3.6" ry="5" />
      <ellipse cx="39" cy="22" rx="3.2" ry="4.6" transform="rotate(20 39 22)" />
    </>
  ),
  // 観覧車
  leisure: (
    <>
      <circle cx="24" cy="19" r="14" />
      <path d="M24 5v28M11.9 12l24.2 14M11.9 26l24.2-14" />
      <path d="M24 19 14 43M24 19l10 24" />
      <path d="M8 43h32" />
    </>
  ),
  // ベッド
  stay: (
    <>
      <path d="M6 10v32" />
      <path d="M42 42V30" />
      <rect x="6" y="30" width="36" height="7" rx="1.5" />
      <path d="M10 30v-4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4" />
      <path d="M26 30c0-3 2-5 5-5h8c2 0 3 2 3 5" />
    </>
  ),
};

export default function CatsB() {
  return (
    <div className={`cb ${kaku.variable}`} data-io>
      <header className="cb-head">
        <h2 className="cb-ttl">{CATS_HEADING}</h2>
        <p className="cb-note">{CATS.length}つの業種</p>
      </header>
      <ul className="cb-grid">
        {CATS.map((c, i) => (
          <li key={c.k}>
            <Link href={c.href} className="cb-cell" style={{ ["--i" as string]: i }}>
              <svg className="cb-ic" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                {ICON[c.k]}
              </svg>
              <span className="cb-name">{c.name}</span>
              <span className="cb-sub">{c.sub.join("")}</span>
              <span className="cb-go">
                <span className="cb-go-t">見る</span> <span className="cb-arr" aria-hidden="true">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
