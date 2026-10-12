import { areaPage } from "@/components/portal/pages/area";

const page = areaPage("bodycare");

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
