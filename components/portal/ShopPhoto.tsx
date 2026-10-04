/**
 * 店写真（サーバーコンポーネント）。事前生成した幅違いの WebP があれば srcset で出し、無ければ元の画像をそのまま出す
 * （lib/portal/photos.ts）。使えない写真（食べログ系・検閲済み・プレースホルダ）は何も出さない（null）。呼び出し側で代わりの飾りを出す。
 * 枠の大きさは CSS 側で決める（aspect-ratio + object-fit）。width/height は元の縦横比を伝えるため。
 */
import { shopPhoto } from "@/lib/portal/photos";

export default function ShopPhoto({
  image,
  alt,
  sizes,
  eager = false,
}: {
  image: string | undefined | null;
  alt: string;
  /** srcset から選ぶための、画面に出る幅の目安（例 "(max-width: 700px) 46vw, 280px"） */
  sizes: string;
  /** ページの最初の画面に出る写真だけ true（それ以外は遅延読み込み） */
  eager?: boolean;
}) {
  const p = shopPhoto(image);
  if (!p) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={p.src}
      srcSet={p.srcSet}
      sizes={p.srcSet ? sizes : undefined}
      alt={alt}
      width={p.width ?? 480}
      height={p.height ?? 360}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
