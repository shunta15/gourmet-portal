import { areaCityRedirectPage } from "@/components/portal/colorplay/pages/redirects";

// 市区町村のデータは無い（これまでは常に 404）。COLOR PLAY のあいだは都道府県までで絞った /beauty/search?pref=… へ転送。"legacy" なら 404。
export default areaCityRedirectPage("beauty");
