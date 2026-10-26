import { scenePage } from "@/components/portal/pages/scene";
import { sceneRedirectPage } from "@/components/portal/colorplay/pages/redirects";

// /beauty/search?tag=…（こだわり）へ恒久の転送（COLOR PLAY）。
const page = sceneRedirectPage("beauty", scenePage("beauty"));

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
