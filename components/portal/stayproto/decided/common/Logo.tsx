import { Mark } from "./Icons";

/**
 * ロゴ「(山の印) マチノワステイ / MACHINOWA STAY」。印は SVG、文字は本物の文字(明朝+字間の広い英字)で、拡大しても滲まない。
 * 大きさは親の --hs(ヘッダーの拡大率。ページごとに base.css が決める)か、className の指定(.sy-foot-logo)で変わる。
 * 色は currentColor(ヘッダーの地が暗いページでは明るくなる)。
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`sy-logo ${className}`.trim()}>
      <Mark className="sy-logo-mark" />
      <span className="sy-logo-t">
        <span className="sy-logo-jp">マチノワステイ</span>
        <span className="sy-logo-en">MACHINOWA STAY</span>
      </span>
    </span>
  );
}
