import SpecialPage from "@/components/portal/sproto2/b/special/SpecialPage";
import { loadSpecialView } from "@/components/portal/sproto2/b/special/data";

// 試作の特集の一覧(/proto-sports/special)。スポーツの特集 3 本(lib/specials/sports.json)と実在 3 店を差し込む。
export default async function Page() {
  return <SpecialPage v={await loadSpecialView()} />;
}
