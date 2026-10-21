import { notFoundMetadata } from "@/components/portal/pages/data";
import CpNotFound from "@/components/portal/colorplay/pages/notFound";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";

// 検索エンジンには載せない。COLOR PLAY の 404
export const metadata = notFoundMetadata();
export default function NotFound() {
  return <CpNotFound site={BEAUTY_SITE} />;
}
