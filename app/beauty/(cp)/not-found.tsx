import PortalNotFound from "@/components/portal/pages/not-found";
import { notFoundMetadata } from "@/components/portal/pages/data";
import CpNotFound from "@/components/portal/colorplay/pages/notFound";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { isColorplay } from "@/lib/portal/verticalDesign";

// 検索エンジンには載せない。COLOR PLAY のときは COLOR PLAY の 404
export const metadata = notFoundMetadata();
export default function NotFound() {
  return isColorplay("beauty") ? <CpNotFound site={BEAUTY_SITE} /> : <PortalNotFound />;
}
