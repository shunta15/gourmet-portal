import { scenePage } from "@/components/portal/pages/scene";
import { sceneRedirectPage } from "@/components/portal/vert/bodyshop/redirects";

// ボディケアが「さがす」にまとまる構成のとき(lib/portal/vert/bodycareStructure.ts)だけ、さがす/店のページへ恒久の転送。そうでなければ元のページ。
const page = sceneRedirectPage(scenePage("bodycare"));

export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
