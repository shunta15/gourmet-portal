import PortalNotFound from "@/components/portal/pages/not-found";
import { notFoundMetadata } from "@/components/portal/pages/data";

// 総合サイトのセグメント内の 404（レイアウトの CSS・フッターの内側で出す）。検索エンジンには載せない
export const metadata = notFoundMetadata();
export default PortalNotFound;
