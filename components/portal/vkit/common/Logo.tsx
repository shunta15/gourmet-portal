import { Mark } from "./Icons";
import type { VkConfig } from "../config";

/**
 * ロゴ「(業種の印) マチノワ〇〇 / MACHINOWA 〇〇」。印は SVG、文字は本物の文字(明朝+字間の広い英字)で、拡大しても滲まない。
 * 大きさは親の --hs(ヘッダーの拡大率。ページごとに base.css が決める)か、className の指定(.vk-foot-logo)で変わる。
 * 色は currentColor(ヘッダーの地が暗いページでは明るくなる)。
 */
export default function Logo({ cfg, className = "" }: { cfg: Pick<VkConfig, "brand" | "brandEn" | "mark">; className?: string }) {
  return (
    <span className={`vk-logo ${className}`.trim()}>
      <Mark kind={cfg.mark} className="vk-logo-mark" />
      <span className="vk-logo-t">
        <span className="vk-logo-jp">{cfg.brand}</span>
        <span className="vk-logo-en">{cfg.brandEn}</span>
      </span>
    </span>
  );
}
