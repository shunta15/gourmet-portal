import { featurePage } from "@/components/portal/pages/feature";
import { featureRedirectPage } from "@/components/portal/vert/bodyshop/redirects";

// ボディケアが「さがす」にまとまる構成のとき(lib/portal/vert/bodycareStructure.ts)だけ、さがす/店のページへ恒久の転送。そうでなければ元のページ。
const page = featureRedirectPage(featurePage("bodycare"));

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
