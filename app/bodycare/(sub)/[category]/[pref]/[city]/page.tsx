import { categoryCityRedirectPage } from "@/components/portal/vert/bodyshop/redirects";

// ボディケアが「さがす」にまとまる構成のとき(lib/portal/vert/bodycareStructure.ts)だけ、都道府県までで絞った状態へ転送。そうでなければ今までどおり 404。
export default categoryCityRedirectPage();
