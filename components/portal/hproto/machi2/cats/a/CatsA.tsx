/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Shippori_Mincho, Zen_Kaku_Gothic_New, Cormorant_Garamond } from "next/font/google";
import { CATS, CATS_HEADING } from "../../catsData";
import { sized } from "@/lib/imageUrl";
import "./cats-a.css";

/**
 * 総合トップ「業種の節」案A「誌面(エディトリアル)」。カードをやめて、雑誌の目次のような組みにする。
 *   番号(細い数字)/ 実写の正方形(角丸なし・ごく薄い縁・少し粒子感)/ 明朝の業種名 / 細いゴシックのサブ文 / 細い下線と小さな矢印。
 *   項目の間は 1px の罫線。丸いアイコン・光の粒・影・グラデーション・「//」の飾りは無し。動きは「入るときのスタガー」とホバーだけ。
 * 名前・サブ文・リンク先は本番(catsData.ts の CATS)のまま。サブ文は 1 行に続けて出す(本番の改行位置は外す)。
 *
 * 写真は全部実写(AI 画像なし)。
 *   グルメ    … 本番の店の写真(店 ID r227 のざるそば。public/_portal/photo-f677424e-1200.webp の中央右を正方形に切り出し)
 *   ビューティー … 本番の美容室の写真(public/_portal/vshops/beauty-44/g1.jpg の鏡と椅子のあたりを正方形に切り出し)
 *   ボディケア・ペット・おでかけ … オーナー提供の写真(総合トップ_素材/ の bodycare-cat・pet-cat・leisure-cat を正方形に切り出し)
 *   ステイ    … 特集記事(lib/newGuideFeatures7.ts「有馬温泉」)の Wikimedia Commons の写真(Arima_Onsen_Yumotozaka02s3872.jpg)。ファイルは置かず、本番と同じ sized() の縮小版 URL をそのまま読む
 * 店の写真は飾り(alt なし・店名は出さない)。
 */
const mincho = Shippori_Mincho({ weight: ["500", "600"], subsets: ["latin"], display: "swap", variable: "--ca-mincho" });
const gothic = Zen_Kaku_Gothic_New({ weight: ["400", "500"], subsets: ["latin"], display: "swap", variable: "--ca-gothic" });
const num = Cormorant_Garamond({ weight: ["300", "400"], subsets: ["latin"], display: "swap", variable: "--ca-num" });

const A = "/_portal/hproto/machi2/cats/a";
const STAY_WM = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Arima_Onsen_Yumotozaka02s3872.jpg/1280px-Arima_Onsen_Yumotozaka02s3872.jpg";
/** 業種 key → 写真(正方形 480px。ステイだけ横長の元写真を object-fit で正方形に見せる) */
const PH: Record<string, { src: string; pos?: string }> = {
  gourmet: { src: `${A}/gourmet.webp` },
  beauty: { src: `${A}/beauty.webp` },
  bodycare: { src: `${A}/bodycare.webp` },
  pet: { src: `${A}/pet.webp` },
  leisure: { src: `${A}/leisure.webp` },
  stay: { src: sized(STAY_WM, 960), pos: "74% 50%" },
};

export default function CatsA() {
  return (
    <div className={`ca ${mincho.variable} ${gothic.variable} ${num.variable}`} data-io>
      <header className="ca-head" style={{ ["--i" as string]: 0 }}>
        <p className="ca-eye">業種から探す</p>
        <h2 className="ca-h2">{CATS_HEADING}</h2>
      </header>
      <ul className="ca-row">
        {CATS.map((c, i) => {
          const p = PH[c.k];
          return (
            <li key={c.k} className="ca-item" style={{ ["--i" as string]: i + 1 }}>
              <Link href={c.href} className="ca-a">
                <span className="ca-no" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="ca-ph">
                  <img src={p.src} alt="" width={480} height={480} decoding="async" style={p.pos ? { objectPosition: p.pos } : undefined} />
                </span>
                <span className="ca-name">{c.name}</span>
                <span className="ca-sub">{c.sub.join("")}</span>
                <span className="ca-ln" aria-hidden="true">
                  <i />
                  <svg viewBox="0 0 7 10" width="7" height="10" fill="none" stroke="currentColor" strokeWidth="1"><path d="M1 1l5 4-5 4" /></svg>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
