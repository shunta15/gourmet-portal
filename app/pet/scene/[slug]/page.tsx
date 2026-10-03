import { scenePage } from "@/components/portal/pages/scene";

const page = scenePage("pet");

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
