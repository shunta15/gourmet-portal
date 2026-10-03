export {
  default,
  generateMetadata,
  generateStaticParams,
} from "@/components/portal/pages/video-watch";

export const revalidate = 3600;
// 動画データにある ID だけ静的に作る。それ以外は 404
export const dynamicParams = false;
