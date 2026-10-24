import Search from "@/components/portal/sproto2/a/Search";
import { filterShops, loadShops, type SearchQ } from "@/components/portal/sproto2/a/data";

// スポーツ試作 2-A の探すページ(見本 2_探す)。エリア(都道府県・市区町村)とカテゴリは実データで動く。
export default async function Page({ searchParams }: { searchParams: Promise<SearchQ> }) {
  const sp = await searchParams;
  const all = await loadShops();
  const { shops, checked } = filterShops(all, sp);
  return <Search shops={shops} all={all} checked={checked} sp={{ pref: sp.pref, city: sp.city, q: sp.q }} />;
}
