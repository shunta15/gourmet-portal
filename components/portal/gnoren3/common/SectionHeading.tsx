import Link from "next/link";
import { ArrowRight } from "./icons";

/**
 * 見出し(明朝のタイトル + 小さな灰色のリード + 右端の「すべて見る →」)。
 * 大きさは --gn3-h-fs(既定 20u)で、色は --gn3-h-color で変えられる。href を渡さなければリンクは出ない。
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
    <div className={`gn3-sh ${className}`}>
      <Tag className="gn3-sh-title">{title}</Tag>
      {lead ? <p className="gn3-sh-lead">{lead}</p> : null}
      {href ? (
        <Link href={href} className="gn3-sh-more">
          {linkLabel}
          <ArrowRight />
        </Link>
      ) : null}
    </div>
  );
}
