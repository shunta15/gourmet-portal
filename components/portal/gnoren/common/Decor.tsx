/* 共通の飾り(見本から切り出した透過 webp。置き場は public/_portal/gnoren/common/)。
   どれも背景が透明なので、生成り・白どちらの地にも重ねられる。幅は呼び出し側の CSS で決める(width:calc(var(--u)*N))。 */
const D = "/_portal/gnoren/common";

type Props = { className?: string; style?: React.CSSProperties };

/** 街並みの線画(見本 1 の統計帯の左。茶の線。実寸 392×64 を 2 倍で保存 = 784×128) */
export function Townscape({ className = "", style }: Props) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`${D}/townscape.webp`} alt="" aria-hidden="true" width={784} height={128} className={`gn-decor ${className}`} style={style} />;
}
/** 水彩の葉の枝(見本 3 の店名の右。実寸 128×156 を 3 倍 = 384×468) */
export function LeafSpray({ className = "", style }: Props) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`${D}/leaf-spray.webp`} alt="" aria-hidden="true" width={384} height={468} className={`gn-decor ${className}`} style={style} />;
}
/** 赤茶の線画の小枝(見本 3 の下。実寸 96×76 を 3 倍 = 288×228) */
export function Twig({ className = "", style }: Props) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`${D}/twig.webp`} alt="" aria-hidden="true" width={288} height={228} className={`gn-decor ${className}`} style={style} />;
}
