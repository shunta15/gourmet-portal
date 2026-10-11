import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { REGIONS, type RegionKey } from "@/lib/data";
import { metadata as legacyMetadata } from "@/app/region/page";
import { assertPortalLive } from "@/lib/portal/launch";
import { NOREN_REGION_REWRITE } from "@/lib/portal/noren/rewrites";
import { AreaTile } from "@/components/portal/noren/AreaParts";
import { ListHero, TOP_CRUMB } from "@/components/portal/noren/FeatureList";
import { regionShopCounts } from "@/lib/portal/noren/areaData";
import { groupAreaKeys } from "@/lib/portal/noren/area";

// エリア一覧（/region）の暖簾版の実体（内部のパス）。公開スイッチ ON のとき、/region が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical は /region のまま。この内部のパス /gourmet/region は外に出さない）。枠は app/gourmet/layout.tsx。
// 中身（全地域の札・店数・ひとこと）・metadata は、今の app/region/page.tsx と同じ。地域を地方ごとの区画に分けて、紙と墨を交互に置く。
// 公開スイッチ OFF のあいだは 404。NOREN_REGION_REWRITE=false のあいだも 404。
export async function generateMetadata(): Promise<Metadata> {
  assertPortalLive();
  if (!NOREN_REGION_REWRITE) notFound();
  return legacyMetadata;
}

const PHOTO = "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1800&q=80"; // 今のページと同じ見出しの写真

export default function Page() {
  assertPortalLive();
  if (!NOREN_REGION_REWRITE) notFound();
  const keys = Object.keys(REGIONS) as RegionKey[];
  const counts = regionShopCounts();
  const blocks = groupAreaKeys(keys);

  return (
    <>
      <ListHero
        crumbs={[TOP_CRUMB, { label: "エリア" }]}
        eyebrow="地域から探す"
        eyebrowEn="AREAS"
        cloth="エリア"
        photo={PHOTO}
        compact
      >
        <h1 id="vI-h1" className="vI-h1">
          街ごとの、<em>味。</em>
        </h1>
        <p className="vI-lead">{keys.length} 地域それぞれのミニポータル。気になる街から、編集部が選んだ一軒を辿ってください。</p>
        {/* 地方へ飛ぶ（41 地域を地方ごとの区画に分けたので、その頭へ） */}
        <nav className="vR-jump" aria-label="地方から選ぶ">
          {blocks.map((b, i) => (
            <a key={b.label} href={`#vR-blk${i}`} className="vI-chip" data-cursor="JUMP">
              {b.label}
            </a>
          ))}
        </nav>
      </ListHero>

      {blocks.map((b, i) => {
        const paper = i % 2 === 0;
        const id = `vR-h-blk${i}`;
        const inner = (
          <div className="vI-sec-in">
            <div className="vR-blk-h vN-rv">
              <h2 id={id} className="vF-h2d">{b.label}</h2>
              <span className="en">{b.en}</span>
              <span className="n">
                <em>{b.keys.length}</em>地域
              </span>
            </div>
            <div className="vI-tiles vN-rv">
              {b.keys.map((k) => (
                <AreaTile
                  key={k}
                  href={`/region/${k}`}
                  en={REGIONS[k as RegionKey].nameEn}
                  name={REGIONS[k as RegionKey].name}
                  count={counts[k] ?? 0}
                  tagline={REGIONS[k as RegionKey].tagline}
                  tone={paper ? "paper" : "cloth"}
                />
              ))}
            </div>
          </div>
        );
        return paper ? (
          <section key={b.label} id={`vR-blk${i}`} className="vI-paper vN-paper vR-blk" aria-labelledby={id}>
            {inner}
          </section>
        ) : (
          <section key={b.label} id={`vR-blk${i}`} className="vR-sec vR-sec--sumi vR-blk" aria-labelledby={id}>
            {inner}
          </section>
        );
      })}
    </>
  );
}
