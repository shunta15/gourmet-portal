/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { CATS, CATS_HEADING } from "../../catsData";
import { sized } from "@/lib/imageUrl";
import "./cats-c.css";

/**
 * 総合トップ 業種の節の試作 案 C「実写タイル」(/proto-home/cat-c 専用。Page の `cats` に渡す)。
 * AI 感を消す組み: 6 枚の実写を大小のタイルで敷く(ベントー)。写真は端まで・角丸 3px・影なし・間は 8px。
 * 業種名は写真の左下に白文字+一様な半透明の黒い帯。丸いアイコン・矢印・光の粒・「//」の飾りは無し。
 * 名前・サブ文・リンク先は本番(catsData.ts)のまま。
 *
 * 写真(全部実写。AI 画像は使わない):
 *   グルメ     … 本番の飲食店の料理の写真 public/restaurants/r154/r154-03.jpg(店名は出さない)
 *   ビューティー … 本番の美容室の写真 public/_portal/vshops/beauty-127/g1.jpg(店名は出さない)
 *   ボディケア  … オーナー提供(施術) / ペット … オーナー提供(トイプードル) / おでかけ … オーナー提供(海と船)
 *   ステイ     … Wikimedia Commons の城崎温泉の外湯(lib/newGuideFeatures8.ts の特集記事と同じ URL。本番と同じくホットリンク)
 */
const P = "/_portal/hproto/machi2/cats/c";
const STAY = sized("https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Kinosaki_konoyu1920.jpg/1280px-Kinosaki_konoyu1920.jpg", 960);
const SRC: Record<string, string> = {
  gourmet: `${P}/gourmet.webp`,
  beauty: `${P}/beauty.webp`,
  bodycare: `${P}/bodycare.webp`,
  pet: `${P}/pet.webp`,
  leisure: `${P}/leisure.webp`,
  stay: STAY,
};

export default function CatsC() {
  return (
    <div className="cc" data-io>
      <div className="cc-head">
        <h2 className="cc-ttl">{CATS_HEADING}</h2>
        <span className="cc-rule" aria-hidden="true" />
      </div>
      <div className="cc-grid">
        {CATS.map((c, i) => (
          <Link key={c.k} href={c.href} className={`cc-tile cc-t-${c.k}`} style={{ ["--i" as string]: i }}>
            <img src={SRC[c.k]} alt="" decoding="async" />
            <span className="cc-band">
              <b className="cc-n">{c.name}</b>
              <span className="cc-s">{c.sub.join("")}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
