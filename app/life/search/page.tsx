import { vkSearchPage } from "@/components/portal/vkit/search/SearchPage";
import { lifeCfg } from "@/components/portal/vkit/configs";
import { LifeSearchPage } from "@/components/portal/life/pages";
import { LFL } from "@/components/portal/life/links";
import { assertPortalLive } from "@/lib/portal/launch";
import { getPlaces } from "@/lib/places";
import { buildMetadata } from "@/lib/seo/meta";
import { VERTICALS } from "@/lib/verticals";
import { lifeGroupBySlug, resolveLifeKind } from "@/lib/verticals/lifeKinds";

// 探すページ(/life/search)。オーナーが決めたデザイン(2026-10-26 の見本。components/portal/life/)。状態は URL の引数(kind・region・pref・q・page)。
// kind は種類の組(visit / learn / shop / service。lib/verticals/lifeKinds.ts)。旧い値(lesson など)は対応する組として扱う。
// metadata(title・description・canonical・robots)は、種類を指定しないときはこれまでの探す(vkit/search/SearchPage.tsx の vkSearchPage)と同じ。
// 種類を指定したときは、組の名前で作る: kind が 1 つだけ(ほかの引数なし)なら、その URL が正本で件数の gate どおり。キーワード・複数の種類・地方・県・2 ページ目以降は noindex(正本は kind が 1 つだけの URL)。
const live = vkSearchPage(lifeCfg);

type Props = Parameters<typeof live.generateMetadata>[0];

const list = (v: string | string[] | undefined): string[] => (Array.isArray(v) ? v : v ? [v] : []).flatMap((x) => x.split(",")).map((x) => x.trim()).filter(Boolean);

export async function generateMetadata(props: Props) {
  assertPortalLive();
  const sp = await props.searchParams;
  const kinds = [...new Set(list(sp.kind).map((k) => resolveLifeKind(k)).filter((k): k is NonNullable<ReturnType<typeof resolveLifeKind>> => !!k))];
  if (kinds.length === 0) return live.generateMetadata({ ...props, searchParams: Promise.resolve({ ...sp, kind: undefined }) });
  const g = lifeGroupBySlug(kinds[0])!;
  const b = VERTICALS.life;
  const places = (await getPlaces("life")).filter((p) => g.categories.some((c) => c === p.category));
  const onlyKind = kinds.length === 1 && Object.keys(sp).filter((k) => sp[k] !== undefined && sp[k] !== "").every((k) => k === "kind");
  return buildMetadata({
    vertical: "life",
    title: `${g.name}(${g.note})の${lifeCfg.noun}を探す｜${b.brand}`,
    description: `${g.name}(${g.note})の${lifeCfg.noun}を、エリアやキーワードから探せます。${places.length > 0 ? `掲載${places.length}件。` : ""}`,
    path: LFL.searchWith({ kind: g.slug }),
    count: onlyKind ? places.length : 0,
  });
}

export default async function Page(props: Props) {
  return <LifeSearchPage searchParams={props.searchParams} />;
}
