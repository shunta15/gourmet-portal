import type { CSSProperties } from "react";
import { assertPortalLive } from "@/lib/portal/launch";
import { jp, min, en, lab } from "./fonts";
import { themeStyle, type VkConfig } from "../config";
import "./base.css";

/** 本番(/{業種} 以下)用の外枠。色(theme)と書体の変数を、この要素に入れる。公開スイッチ OFF のあいだは 404 */
export default function VkRoot({ cfg, children }: { cfg: VkConfig; children: React.ReactNode }) {
  assertPortalLive(); // 公開スイッチ OFF のあいだは 404(lib/portal/launch.ts。ほかの新業種の外枠と同じ)
  return (
    <div className={`vk-root vk-v-${cfg.key} ${jp.variable} ${min.variable} ${en.variable} ${lab.variable}`} style={themeStyle(cfg) as CSSProperties}>
      {children}
    </div>
  );
}
