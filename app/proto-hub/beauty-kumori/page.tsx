import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPreviewOrLocal } from "@/lib/portal/launch";
import KumoriHero from "@/components/portal/vert/kumori/KumoriHero";
import KumoriBelow from "@/components/portal/vert/kumori/KumoriBelow";
import { KUMORI_ENTRIES, KUMORI_LEAD } from "@/lib/portal/vert/kumori/data";
import { kuren, mincho } from "@/lib/portal/vert/kumori/fonts";
import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { countPlaces } from "@/lib/places";
import { BLOCK_FACE, HAS_CLAIM_POLICY, VERTICAL_FACE } from "@/lib/portal/meta";

// ビューティー入口の試作「曇り鏡(KUMORI)」。湯気で曇った鏡を、手で拭く。プレビュー・ローカル専用（門は layout.tsx と、ここの isPreviewOrLocal）。
// 下のブロックの中身と件数の取り方は、今の /beauty（components/portal/VerticalHub.tsx）と同じ。
export const metadata: Metadata = {
  title: "マチノワ ビューティー",
  robots: { index: false, follow: false },
};

const VERTICAL: VerticalKey = "beauty";
const ORDER: VerticalKey[] = ["gourmet", "beauty", "bodycare", "pet", "leisure", "stay"];
const BLOCK_ORDER = ["北海道", "東北", "関東", "中部", "近畿", "中国", "四国", "九州沖縄"];

export default async function Page() {
  if (!isPreviewOrLocal()) notFound();
  const v = VERTICALS[VERTICAL];
  const total = await countPlaces(VERTICAL);
  const [catCounts, prefCounts] = await Promise.all([
    Promise.all(v.categories.map((c) => countPlaces(VERTICAL, { category: c.slug }))),
    Promise.all(PREFECTURES.map((p) => countPlaces(VERTICAL, { pref: p.slug }))),
  ]);
  return (
    <div className={`${mincho.variable} ${kuren.variable}`}>
      <KumoriHero entries={KUMORI_ENTRIES} lead={KUMORI_LEAD} />
      <KumoriBelow
        verticalName={v.name}
        total={total}
        catCount={v.categories.length}
        sceneCount={v.scenes.length}
        categories={v.categories.map((c, i) => ({ slug: c.slug, name: c.name, href: `${v.path}/${c.slug}`, count: catCounts[i] }))}
        areas={PREFECTURES.map((p, i) => ({ slug: p.slug, short: p.short, block: p.block, href: `${v.path}/area/${p.slug}`, count: prefCounts[i] }))}
        blocks={BLOCK_ORDER.map((b) => ({ key: b, label: BLOCK_FACE[b].label, en: BLOCK_FACE[b].en }))}
        scenes={v.scenes.map((s) => ({ slug: s.slug, name: s.name, href: `${v.path}/scene/${s.slug}` }))}
        others={ORDER.filter((k) => k !== VERTICAL).map((k) => ({ key: k, name: VERTICALS[k].name, en: VERTICAL_FACE[k].en, glyph: VERTICAL_FACE[k].glyph, href: VERTICALS[k].path }))}
        hasPolicy={HAS_CLAIM_POLICY.has(VERTICAL)}
      />
    </div>
  );
}
