import PortalNotFound from "@/components/portal/pages/not-found";
import { notFoundMetadata } from "@/components/portal/pages/data";

// 検索エンジンには載せない(これまでの app/bodycare/(sub)/not-found.tsx と同じ)
export const metadata = notFoundMetadata();
export default PortalNotFound;
