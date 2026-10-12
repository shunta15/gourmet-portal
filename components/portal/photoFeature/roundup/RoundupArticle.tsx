import { FEATURES } from "@/lib/data";
import { SCENE_FEATURE_META } from "@/lib/sceneFeatures";
import { REGIONS, type FeatureArticle } from "@/lib/regions";
import { LIVE_LINKS } from "@/lib/portal/noren/nav";
import { buildRoundup } from "@/lib/portal/photoFeature/roundupBuild";
import { getRelatedRoundups } from "@/lib/portal/photoFeature/roundupRelated";
import PhotoFeatureShell from "../PhotoFeatureShell";
import RoundupPage from "./RoundupPage";

/**
 * シーン別まとめ記事（利用シーン+店舗紹介。isSceneShopFeature）の記事ページ。写真が主役の形（店舗特集記事と同じ世界）で出す。
 * app/gourmet/feature/[id]/page.tsx から呼ぶ（NOREN_FEATURE_ROUNDUP_PHOTO が true で、利用シーン+店舗紹介の記事のとき）。
 * 利用シーンの語は記事の Feature.tag（lib/data の FEATURES）、利用シーンの slug・地域は SCENE_FEATURE_META（lib/sceneFeatures.ts）。どちらも記事のデータにある値。
 * さがすへの行き先は /search?scene=<slug>・/search?region=<キー>（地域の鍵は "<地域>/<街>" の地域の部分）。
 */
export default async function RoundupArticle({ article }: { article: FeatureArticle }) {
  const feat = FEATURES.find((f) => f.id === article.id);
  const meta = SCENE_FEATURE_META[article.id];
  const tag = feat?.tag ?? "";
  const data = buildRoundup(article, { tag });
  const related = await getRelatedRoundups(article.id);
  const regionKey = meta ? meta.area.split("/")[0] : "";
  const regionName = regionKey && regionKey in REGIONS ? REGIONS[regionKey as keyof typeof REGIONS].name : "";
  return (
    <PhotoFeatureShell>
      <RoundupPage
        data={data}
        areaLabel={meta?.areaLabel ?? ""}
        listHref="/feature"
        topHref={LIVE_LINKS.top}
        searchHref="/search"
        sceneSearch={meta ? { href: `/search?scene=${encodeURIComponent(meta.scene)}`, label: `${tag}の店をさがす` } : null}
        regionSearch={regionName ? { href: `/search?region=${encodeURIComponent(regionKey)}`, label: `${regionName}の店をさがす` } : null}
        related={related}
      />
    </PhotoFeatureShell>
  );
}
