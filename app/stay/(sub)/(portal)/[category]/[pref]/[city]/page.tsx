import { stayLegacy } from "@/components/portal/stayproto/decided/redirects";

// これまでは常に 404。探すに市区町村の絞り込みは無いので、都道府県までで絞った状態へ転送(ボディケアと同じ)。
export default stayLegacy.categoryCityRedirectPage();
