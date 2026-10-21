import { Paw } from "./Icons";

/**
 * ロゴ「(肉球) マチノワPet」。肉球は SVG、文字は本物の文字(明朝+英字のセリフ体)で、拡大しても滲まない。
 * 大きさは親の --hs(ヘッダーの拡大率。ページごとに base.css が決める)か、className の指定(.pt-foot-logo)で変わる。
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`pt-logo ${className}`.trim()}>
      <Paw className="pt-logo-paw" />
      <span className="pt-logo-t">
        <span className="pt-logo-jp">マチノワ</span>
        <span className="pt-logo-en">Pet</span>
      </span>
    </span>
  );
}
