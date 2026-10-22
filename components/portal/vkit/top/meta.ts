import "server-only";
import type { Metadata } from "next";
import { verticalHubMetadata } from "@/components/portal/VerticalHub";
import { VERTICALS } from "@/lib/verticals";
import { kindsWithShops, loadShops } from "../common/live";
import type { VkConfig } from "../config";

/**
 * 最初のページ(/{業種})の metadata。題名・canonical・OGP・robots は共通の業種の入口(components/portal/VerticalHub.tsx の verticalHubMetadata。掲載が 3 件未満なら noindex)と同じ。
 * 説明文だけ作り直す: 共通のものは業種に決めた種類を全部並べるので、まだ店が無い種類(スポーツのヨガ・ダンス、くらしの花屋・修理 など)まで書いてしまう。
 * ここでは、いま店のある種類だけを、データ(kindsWithShops)から並べる。店が 1 軒も無いときは種類を並べない。
 */
export async function vkTopMetadata(cfg: VkConfig): Promise<Metadata> {
  const base = await verticalHubMetadata(cfg.key);
  const v = VERTICALS[cfg.key];
  const names = kindsWithShops(cfg, await loadShops(cfg)).map((k) => k.name);
  const description = `${v.brand}。エリア・種類から${cfg.noun}を探せる入口です。${names.length > 0 ? `掲載している種類は、${names.join("、")}。` : ""}`;
  return {
    ...base,
    description,
    openGraph: { ...base.openGraph, description },
    twitter: { ...base.twitter, description },
  };
}
