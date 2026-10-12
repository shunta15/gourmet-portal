/**
 * 店のページの動きの案(?fx=1/2/3)の入口。見本(VERCEL_ENV が production 以外)でだけ shop.tsx から動的に読み込まれる。
 * 案の CSS(fx.css)はここで読むので、本番の店のページ・最初のページ・さがすには載らない。
 */
import "../fx.css";

export { Fx1Shop } from "./fx1";
export { Fx2Shop } from "./fx2";
export { Fx3Shop } from "./fx3";
