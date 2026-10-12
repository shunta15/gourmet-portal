import PortalNotFound from "@/components/portal/pages/not-found";
import dynamic from "next/dynamic";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { RELEASE_PERIPHERY } from "@/lib/portal/noren/release";
// 新しい見た目の部品は、描画するとき（RELEASE_PERIPHERY が true）だけ読み込む（false のとき JS は読まない。CSS はこのページの入口にだけ載り、ほかのページには載らない）
const PortalNotFoundPeriphery = dynamic(() => import("@/components/portal/periphery/PortalNotFoundView"));

// 総合サイトのセグメント内の 404（レイアウトの CSS・フッターの内側で出す）。検索エンジンには載せない
// RELEASE_PERIPHERY が true のあいだは、/feature と同じ世界の見た目（字・リンク先は同じ）
export const metadata = notFoundMetadata();
export default RELEASE_PERIPHERY ? PortalNotFoundPeriphery : PortalNotFound;
