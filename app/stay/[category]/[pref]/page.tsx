import { categoryAreaPage } from "@/components/portal/pages/category-area";

const page = categoryAreaPage("stay");

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
