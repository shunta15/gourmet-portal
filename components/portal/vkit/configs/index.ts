import type { VkConfig, VkKey } from "../config";
import { activityCfg } from "./activity";
import { sportsCfg } from "./sports";
import { lifeCfg } from "./life";

/** 3 業種の設定(key → 設定)。ページ・サイトマップ・確認用のスクリプトはここから取る */
export const VKITS: Record<VkKey, VkConfig> = { activity: activityCfg, sports: sportsCfg, life: lifeCfg };

export { activityCfg, sportsCfg, lifeCfg };
