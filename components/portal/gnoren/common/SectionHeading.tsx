import Link from "next/link";
import { ArrowRight } from "./icons";

/**
 * 見出し(大きな明朝のタイトル + 小さな灰色のリード + 右端の「すべて見る →」)。
 * 見本 1 の「料理から探す」「エリアから探す」「シーンから探す」「特集から読む」の並び。
 * 大きさは --gn-h-fs(既定 24u)で変えられる。href を渡さなければリンクは出ない。
 */
export default function SectionHeading({
  title,
  lead,
  href,
  linkLabel = "すべて見る",
  as: Tag = "h2",
  className = "",
}: {
  title: string;
  lead?: string;
  href?: string;
  linkLabel?: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={`gn-sh ${className}`}>
      <Tag className="gn-sh-title">{title}</Tag>
      {lead ? <p className="gn-sh-lead">{lead}</p> : null}
      {href ? (
        <Link href={href} className="gn-sh-more">
          {linkLabel}
          <ArrowRight />
        </Link>
      ) : null}
    </div>
  );
}
