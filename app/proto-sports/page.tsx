import Top from "@/components/portal/sproto2/a/Top";
import { loadShops, loadSpecials } from "@/components/portal/sproto2/a/data";

// スポーツ試作 2-A の最初のページ(見本 4_トップ)。「注目の施設」は実在の 3 店、特集の枠は特集記事 3 本へのリンク。
export default async function Page() {
  return <Top shops={await loadShops()} specials={loadSpecials()} />;
}
