import { IMG_ARTICLE } from "../common/site";

/** 記事ページの写真(public/_portal/petproto/decided/article/)。寸法は元の画像の大きさ。見た目の大きさは CSS で決める。 */
export default function Img({ src, w, h, alt = "", className, eager = false }: { src: string; w: number; h: number; alt?: string; className?: string; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={`${IMG_ARTICLE}/${src}`} width={w} height={h} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" />
  );
}
