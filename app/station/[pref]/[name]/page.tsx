export {
  default,
  generateMetadata,
  generateStaticParams,
} from "@/components/portal/pages/station";

export const revalidate = 3600;
// 店のある駅エリアだけ静的に作る。それ以外は 404
export const dynamicParams = false;
