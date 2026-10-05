/**
 * グルメのトップ（/gourmet。公開スイッチ ON のときだけ）に出す「写真から探す」の入口（サーバー）。
 * 実店舗の料理写真（特に良い写真から、ジャンルが重ならないよう 6 枚。lib/portal/photoWall.ts の entrancePhotos）を並べ、
 * 見出し・導入文は既存のセクション（globals.css の .section-head）と同じ形。クライアントの JS は持たない。
 * CSS は app/globals.css に足さず、このセクションが描画されるときだけ head に入れる（React 19 の <style href precedence>）。
 * 写真は飾り（alt なし・フォーカスなし）で、行き先は「写真から探す」のボタン1つ。
 */
import Link from "next/link";
import { wallImg, type WallItem } from "@/lib/portal/photoWallShared";

const CSS = String.raw`
.ph-ent{padding:0 40px 120px}
/* 「こだわり条件」の入口（帯）の直後に並ぶとき（/gourmet の portalEntrances）は、帯との間をあける */
.fc-entrance + .ph-ent{padding-top:clamp(56px,7vw,96px)}
.ph-ent .section-head{padding:0 0 48px}
.ph-ent-wall{display:grid; grid-template-columns:1.35fr 1fr 1fr 1fr 1.15fr; grid-template-rows:1fr 1fr; gap:8px; height:clamp(300px,34vw,500px); margin:0; padding:0; list-style:none}
.ph-ent-wall li{position:relative; overflow:hidden; background:linear-gradient(135deg,#e6dece,#ddd3c0)}
.ph-ent-wall li:nth-child(1){grid-column:1; grid-row:1 / 3}
.ph-ent-wall li:nth-child(2){grid-column:2; grid-row:1}
.ph-ent-wall li:nth-child(3){grid-column:3; grid-row:1}
.ph-ent-wall li:nth-child(4){grid-column:2 / 4; grid-row:2}
.ph-ent-wall li:nth-child(5){grid-column:4; grid-row:1 / 3}
.ph-ent-wall li:nth-child(6){grid-column:5; grid-row:1 / 3}
.ph-ent-wall img{display:block; width:100%; height:100%; object-fit:cover; transition:transform 1.2s cubic-bezier(.19,1,.22,1)}
.ph-ent-wall:hover img{transform:scale(1.03)}
.ph-ent-go{display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px 32px; margin-top:28px}
.ph-ent-go p{font:400 13px/1.9 var(--body); color:var(--ink-soft); max-width:34em}
.ph-ent-btn{display:inline-flex; align-items:center; justify-content:space-between; gap:24px; min-height:56px; padding:0 28px; border-radius:999px; background:var(--ink); color:#f4efe3; font:600 15px/1 var(--body); letter-spacing:.06em; transition:background .35s}
.ph-ent-btn:hover{background:var(--accent)}
.ph-ent-btn i{font-style:normal; transition:transform .35s}
.ph-ent-btn:hover i{transform:translateX(4px)}
.ph-ent-btn:focus-visible{outline:3px solid var(--ink); outline-offset:3px}
@media (max-width:900px){
  .ph-ent{padding:0 20px 80px}
  .fc-entrance + .ph-ent{padding-top:48px}
  .ph-ent .section-head{padding-bottom:32px}
  .ph-ent-wall{grid-template-columns:1fr 1fr; grid-template-rows:repeat(3,minmax(0,1fr)); height:clamp(380px,100vw,560px); gap:6px}
  .ph-ent-wall li:nth-child(1){grid-column:1 / 3; grid-row:1}
  .ph-ent-wall li:nth-child(2){grid-column:1; grid-row:2}
  .ph-ent-wall li:nth-child(3){grid-column:2; grid-row:2}
  .ph-ent-wall li:nth-child(4){grid-column:1 / 3; grid-row:3}
  .ph-ent-wall li:nth-child(5), .ph-ent-wall li:nth-child(6){display:none}
  .ph-ent-btn{width:100%}
}
@media (prefers-reduced-motion:reduce){.ph-ent-wall img, .ph-ent-btn i{transition:none}}
`;

export default function PhotosEntrance({ photos, total }: { photos: WallItem[]; total: number }) {
  if (photos.length < 6) return null; // 並べる写真が足りないときは出さない（空の枠を作らない）
  return (
    <section className="ph-ent" aria-labelledby="ph-ent-h">
      <style href="mp-ph-ent" precedence="default">{CSS}</style>
      <div className="section-head">
        <div className="no">
          <b>＋</b> PHOTOS
        </div>
        <h2 id="ph-ent-h">
          写真から、<em>探す。</em>
        </h2>
        <p className="lede">料理の写真が壁のように並びます。気になる一枚から、そのお店へ。</p>
      </div>
      <ul className="ph-ent-wall" aria-hidden="true">
        {photos.slice(0, 6).map((it, i) => {
          const img = wallImg(it, i === 0 || i === 3);
          return (
            <li key={it.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} srcSet={img.srcSet} sizes={i === 0 || i === 3 ? "(max-width: 900px) 96vw, 36vw" : "(max-width: 900px) 48vw, 22vw"} alt="" loading="lazy" decoding="async" width={it.ws[it.ws.length - 1]} height={Math.round(it.ws[it.ws.length - 1] / it.r)} />
            </li>
          );
        })}
      </ul>
      <div className="ph-ent-go">
        <p>掲載店の料理写真 {total} 枚を、ジャンルや都道府県で絞り込めます。</p>
        <Link href="/photos" prefetch={false} className="ph-ent-btn" data-cursor="PHOTOS">
          写真から探す
          <i aria-hidden="true">→</i>
        </Link>
      </div>
    </section>
  );
}
