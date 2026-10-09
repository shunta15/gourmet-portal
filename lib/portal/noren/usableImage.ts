/**
 * 暖簾の特集ページで「使える写真」か、の判定（純関数。サーバー・クライアントのどちらからも読める）。
 *  - 使えない = 食べログの画像・仮の画像・空（shop.ts の isUnusableImage）、または表示禁止の画像（lib/imageBlocklist.ts の isBlockedImage）
 * 特集ページ（components/portal/noren/FeaturePage.tsx）と、写真の無いポイントに写真を当てる側（lib/featureSpotPhotos.ts・
 * automation/feature-spot-photos/*.mjs）、店ページで使える写真が 0 枚の店に写真を当てる側（lib/shopPhotos.ts・automation/shop-photos/*.mjs。
 * 店ページの usable も同じ式）が、この 1 つの関数を共有する（判定を 2 か所に書き分けない）。
 */
import { isBlockedImage } from "@/lib/imageBlocklist";
import { isUnusableImage } from "./shop";

export const isUsableFeatureImage = (u: string | undefined | null): boolean => !isUnusableImage(u) && !isBlockedImage(u);
