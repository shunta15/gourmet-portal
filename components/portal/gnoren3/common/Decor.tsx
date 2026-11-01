/* 共通の飾り(見本から切り出した透過 webp。置き場は public/_portal/gnoren3/common/)。
   新見本(2026-11-01)の 5 枚には、暖簾 2 の townscape / leaf-spray / twig に当たる共通の飾りは無いので、今は何も置いていない。
   必要になったら webp を public/_portal/gnoren3/common/ に置いて、ここに <img className="gn3-decor"> の部品を足す。
   幅は呼び出し側の CSS で決める(width: calc(var(--u) * N))。 */
type Props = { className?: string; style?: React.CSSProperties };

/** 空の飾り(import 先を壊さないための置き場) */
export function DecorSlot({ className = "", style }: Props) {
  return <span aria-hidden="true" className={`gn3-decor ${className}`} style={style} />;
}
