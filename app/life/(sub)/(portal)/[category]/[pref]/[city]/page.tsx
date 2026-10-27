import { lifeLegacy } from "@/components/portal/life/redirects";

// これまでは常に 404。探すに市区町村の絞り込みは(このデータの URL では)無いので、都道府県までで絞った状態へ転送(ステイ・ボディケアと同じ)。
export default lifeLegacy.categoryCityRedirectPage();
