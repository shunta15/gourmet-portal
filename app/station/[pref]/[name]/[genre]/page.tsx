export {
  default,
  generateMetadata,
  generateStaticParams,
} from "@/components/portal/pages/station-genre";

export const revalidate = 3600;
// 条件を満たす駅エリア × ジャンルだけ静的に作る。それ以外は 404
export const dynamicParams = false;
