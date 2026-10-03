export {
  default,
  generateMetadata,
  generateStaticParams,
} from "@/components/portal/pages/station-pref";

export const revalidate = 3600;
// 店のある県だけ静的に作る。それ以外は 404
export const dynamicParams = false;
