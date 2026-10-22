/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { CATS_PROTO as CATS, CATS_HEADING } from "../../catsData";
import "./cats-d.css";

/**
 * 総合トップ「業種の節」案D「写真なし・大きな色の丸アイコン」(/proto-home/cat-d 専用。Page の `cats` に渡す)。
 * オーナーの見本(2026-10-20)のとおり: 白い札・上に大きな一色の丸(中に白い絵)・太い業種名・サブ文 2 行・ピンクの丸い矢印。
 * 札の下側に淡い水彩の飾り(家・街・緑)、札と札の間に緑の葉のつる。どちらも見本から切り出した画像(AI 画像)。
 * 札の位置・大きさは今の本番の札(Lower.tsx の .h2-cat。airy の 0.94 倍・中央から 11u ずつ開く)の最終の姿と同じ。大きくしていない。
 * 見出しは本番と同じ markup/クラス(.h2-ttl)。名前・サブ文の文字・リンク先は本番(catsData.ts の CATS)のまま(サブ文は見本に合わせて 2 行に改行するだけ)。
 *
 * 素材(public/_portal/hproto/machi2/cats/d/。cats/d/build-assets.mjs が見本から作る):
 *   glyph-*.webp … 既存の ic2-*.webp(色付きの丸)から取り出した白い絵。丸は CSS で描く(色は見本の画素)
 *   band-*.webp  … 札の下の飾り(札ごとに違う)
 *   vine-0..6.webp … つる(左端・札の間 5 か所・右端)
 */
const D = "/_portal/hproto/machi2/cats/d";
/** 丸の色(見本の画素の中央値) */
const COL: Record<string, string> = { gourmet: "#fd7329", beauty: "#fd5e86", bodycare: "#71b341", pet: "#a7734d", leisure: "#248dfb", stay: "#8843bd" };
/** サブ文を 2 行にする業種(文字は本番のまま、4 文字目で改行するだけ)。ほかは CATS の sub のまま */
const BREAK4 = new Set(["beauty", "bodycare", "pet"]);
const TTL = [..."今日はどんな"].map((c) => ({ c, k: 0 })).concat([..."楽しみ"].map((c) => ({ c, k: 1 })), [..."を見つける？"].map((c) => ({ c, k: 0 })));
const P = (x: number, y: number, w: number, h: number) => ({ "--x": x, "--y": y, "--w": w, "--h": h }) as React.CSSProperties;

/** 札の最終の位置(1182 基準の u)。本番: 中心 = px + pw/2、幅 = (pw + 20) × 0.94、中心から (i − 2.5) × 11 ずつ外へ */
const GEO = CATS.map((c, i) => {
  const w = (c.pw + 20) * 0.94;
  return { l: c.px + c.pw / 2 + (i - 2.5) * 11 - w / 2, w };
});
/** つる 7 本。見本の画素 → u は 0.77 倍。[画像の幅, 札の端から画像の左端までの見本の画素] */
const K = 0.77;
const VINE_DIM: [number, number][] = [[58, 14], [84, 41], [82, 38.5], [84, 38], [66, 26.5], [60, 36.5], [54, 41]];
const VINES = VINE_DIM.map(([w, off], k) => {
  const anchor = k === 0 ? GEO[0].l : k === 6 ? GEO[5].l + GEO[5].w : (GEO[k - 1].l + GEO[k - 1].w + GEO[k].l) / 2;
  return { l: anchor - off * K, w: w * K };
});

export default function CatsD() {
  return (
    <>
      {/* 見出し: 本番(Lower.tsx)と同じ markup・クラス・位置 */}
      <h2 className="h2-a h2-ttl" data-io style={P(330, 399, 522, 44)} aria-label={CATS_HEADING}>
        <svg className="h2-tick h2-tick-l" viewBox="0 0 30 24" aria-hidden="true"><path d="M3 20 12 4M14 21l8-15" stroke="#f08a3c" strokeWidth="2.4" strokeLinecap="round" /></svg>
        <span className="h2-ttl-t" aria-hidden="true">{TTL.map((x, i) => <i key={i} className={x.k ? "h2-tk" : undefined} style={{ ["--c" as string]: i }}>{x.c}</i>)}</span>
        <svg className="h2-tick h2-tick-r" viewBox="0 0 30 24" aria-hidden="true"><path d="M27 20 18 4M16 21l-8-15" stroke="#f08a3c" strokeWidth="2.4" strokeLinecap="round" /></svg>
      </h2>
      <div className="cd" data-io>
        <div className="cd-row">
          {CATS.map((c, i) => {
            const t = c.sub.join("");
            const sub = BREAK4.has(c.k) ? [t.slice(0, 4), t.slice(4)] : c.sub;
            return (
              <Link
                key={c.k}
                href={c.href}
                className="cd-card"
                style={{ ["--i" as string]: i, ["--l" as string]: GEO[i].l.toFixed(2), ["--w" as string]: GEO[i].w.toFixed(2), ["--c" as string]: COL[c.k], ["--bd" as string]: `url(${D}/band-${c.k}.webp)` }}
              >
                <span className="cd-band" aria-hidden="true" />
                <span className="cd-ic" aria-hidden="true"><img src={`${D}/glyph-${c.k}.webp`} alt="" width={432} height={432} decoding="async" /></span>
                <span className="cd-name">{c.name}</span>
                <span className="cd-sub">{sub.map((s, j) => <span key={j}>{s}</span>)}</span>
                <i className="cd-arr" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h11M10.5 5l5 5-5 5" /></svg>
                </i>
              </Link>
            );
          })}
        </div>
        {VINES.map((v, k) => (
          <img key={k} className="cd-vine" src={`${D}/vine-${k}.webp`} alt="" width={Math.round(v.w / K) * 2} height={420} decoding="async" style={{ ["--i" as string]: k, ["--l" as string]: v.l.toFixed(2), ["--w" as string]: v.w.toFixed(2) }} />
        ))}
      </div>
    </>
  );
}
